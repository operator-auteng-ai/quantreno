import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  streamText,
} from "ai";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";
import { auth, type UserType } from "@/app/(auth)/auth";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { type ToolAuditEntry, wrapTool } from "@/lib/ai/tool-wrapper";
import { cancelOrder } from "@/lib/ai/tools/cancel-order";
import { createDocument } from "@/lib/ai/tools/create-document";
import { createOrder } from "@/lib/ai/tools/create-order";
import { createStrategy } from "@/lib/ai/tools/create-strategy";
import { getMarkets } from "@/lib/ai/tools/get-markets";
import { getPortfolio } from "@/lib/ai/tools/get-portfolio";
import { getPositions } from "@/lib/ai/tools/get-positions";
import { getTradeHistory } from "@/lib/ai/tools/get-trade-history";
import { listStrategies } from "@/lib/ai/tools/list-strategies";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { updateStrategy } from "@/lib/ai/tools/update-strategy";
import { webSearch } from "@/lib/ai/tools/web-search";
import { xSearch } from "@/lib/ai/tools/x-search";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getActiveStrategiesByUserId,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveAiCall,
  saveChat,
  saveMessages,
  saveToolCall,
  updateChatTitleById,
  updateMessage,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatbotError } from "@/lib/errors";
import { getKalshiClientForUser } from "@/lib/kalshi";
import { log } from "@/lib/logger";
import type { ChatMessage } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch (_) {
    return null;
  }
}

export { getStreamContext };

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  try {
    const { id, message, messages, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    log.info("chat", "request", {
      userId: session.user.id,
      model: selectedChatModel,
    });

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatbotError("rate_limit:chat").toResponse();
    }

    const isToolApprovalFlow = Boolean(messages);

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];
    let titlePromise: Promise<string> | null = null;

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
      if (!isToolApprovalFlow) {
        messagesFromDb = await getMessagesByChatId({ id });
      }
    } else if (message?.role === "user") {
      await saveChat({
        id,
        userId: session.user.id,
        title: "New chat",
        visibility: selectedVisibilityType,
      });
      titlePromise = generateTitleFromUserMessage({ message });
    }

    const uiMessages = isToolApprovalFlow
      ? (messages as ChatMessage[])
      : [...convertToUIMessages(messagesFromDb), message as ChatMessage];

    if (message?.role === "user") {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: "user",
            parts: message.parts,
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });
    }

    const isReasoningModel =
      selectedChatModel.includes("reasoning") ||
      selectedChatModel.includes("thinking");

    const modelMessages = await convertToModelMessages(uiMessages);

    // Build session context: strategies + live Kalshi positions
    // Kalshi credentials missing is expected (not an error) — everything else throws.
    let sessionContext: string | undefined;

    const kalshiPromise = getKalshiClientForUser(session.user.id)
      .then(async (client) => {
        const [balance, positionsData] = await Promise.all([
          client.getBalance(),
          client.getPositions({ count_filter: "position" }),
        ]);
        const rawPositions = positionsData.positions ?? [];
        log.info("session-context", "Kalshi data fetched", {
          userId: session.user.id,
          balance: balance.balance,
          rawPositionCount: rawPositions.length,
          tickers: rawPositions.map((p) => `${p.ticker}:${p.position}`),
        });
        return { balance, positions: rawPositions };
      })
      .catch((err: Error) => {
        // No credentials saved → expected state, not an error
        if (err.message.includes("not connected")) {
          return null;
        }
        // Real API failure → log and re-throw
        log.error("session-context", "Kalshi API failed", {
          userId: session.user.id,
          error: err.message,
        });
        throw err;
      });

    const [kalshiResult, activeStrategies] = await Promise.allSettled([
      kalshiPromise,
      getActiveStrategiesByUserId({ userId: session.user.id }),
    ]);

    const parts: string[] = [];

    // Live Kalshi portfolio
    if (kalshiResult.status === "fulfilled" && kalshiResult.value) {
      const kalshiData = kalshiResult.value;
      parts.push(
        `Cash balance: $${(kalshiData.balance.balance / 100).toFixed(2)}`
      );

      const livePositions = kalshiData.positions.filter(
        (p) => p.position !== 0
      );
      if (livePositions.length > 0) {
        const posLines = livePositions.map((p) => {
          const side = p.position > 0 ? "YES" : "NO";
          const contracts = Math.abs(p.position);
          const avgEntry =
            contracts > 0
              ? Math.round(p.market_exposure_cents / contracts)
              : null;
          const entryStr = avgEntry !== null ? ` @ ${avgEntry}¢` : "";
          return `- ${p.ticker}: ${contracts}x ${side}${entryStr} (exposure $${(p.market_exposure_cents / 100).toFixed(2)}, realized P&L $${(p.realized_pnl_cents / 100).toFixed(2)})`;
        });
        parts.push(
          `Open positions (${livePositions.length}):\n${posLines.join("\n")}`
        );
      }
    } else if (kalshiResult.status === "rejected") {
      log.error("session-context", "Kalshi context failed", {
        userId: session.user.id,
        error: kalshiResult.reason?.message ?? String(kalshiResult.reason),
      });
    }

    if (
      activeStrategies.status === "fulfilled" &&
      activeStrategies.value.length > 0
    ) {
      const strats = activeStrategies.value;
      const stratLines = strats.map(
        (s) =>
          `- "${s.name}" (${s.playbook}, $${(s.budgetCents / 100).toFixed(2)} budget, ${s.status})`
      );
      parts.push(
        `Active strategies (${strats.length}):\n${stratLines.join("\n")}`
      );
    } else if (activeStrategies.status === "rejected") {
      log.error("session-context", "strategies query failed", {
        userId: session.user.id,
        error:
          activeStrategies.reason?.message ?? String(activeStrategies.reason),
      });
    }

    if (parts.length > 0) {
      sessionContext = parts.join("\n\n");
    }

    // Request-scoped audit queue — tools push entries, onStepFinish flushes
    const toolAuditQueue: ToolAuditEntry[] = [];
    let stepCounter = 0;

    const stream = createUIMessageStream({
      originalMessages: isToolApprovalFlow ? uiMessages : undefined,
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          model: getLanguageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, sessionContext }),
          messages: modelMessages,
          stopWhen: stepCountIs(5),
          experimental_activeTools: isReasoningModel
            ? []
            : [
                "getMarkets",
                "getPositions",
                "getPortfolio",
                "getTradeHistory",
                "createOrder",
                "cancelOrder",
                "listStrategies",
                "createStrategy",
                "updateStrategy",
                "webSearch",
                "xSearch",
                "createDocument",
                "updateDocument",
                "requestSuggestions",
              ],
          providerOptions: isReasoningModel
            ? {
                anthropic: {
                  thinking: { type: "enabled", budgetTokens: 10_000 },
                },
              }
            : undefined,
          tools: {
            getMarkets: wrapTool(
              "getMarkets",
              getMarkets({ session }),
              toolAuditQueue
            ),
            getPositions: wrapTool(
              "getPositions",
              getPositions({ session }),
              toolAuditQueue
            ),
            getPortfolio: wrapTool(
              "getPortfolio",
              getPortfolio({ session }),
              toolAuditQueue
            ),
            getTradeHistory: wrapTool(
              "getTradeHistory",
              getTradeHistory({ session }),
              toolAuditQueue
            ),
            createOrder: wrapTool(
              "createOrder",
              createOrder({ session }),
              toolAuditQueue
            ),
            cancelOrder: wrapTool(
              "cancelOrder",
              cancelOrder({ session }),
              toolAuditQueue
            ),
            listStrategies: wrapTool(
              "listStrategies",
              listStrategies({ session }),
              toolAuditQueue
            ),
            createStrategy: wrapTool(
              "createStrategy",
              createStrategy({ session }),
              toolAuditQueue
            ),
            updateStrategy: wrapTool(
              "updateStrategy",
              updateStrategy({ session }),
              toolAuditQueue
            ),
            webSearch: wrapTool("webSearch", webSearch, toolAuditQueue),
            xSearch: wrapTool("xSearch", xSearch, toolAuditQueue),
            createDocument: wrapTool(
              "createDocument",
              createDocument({ session, dataStream }),
              toolAuditQueue
            ),
            updateDocument: wrapTool(
              "updateDocument",
              updateDocument({ session, dataStream }),
              toolAuditQueue
            ),
            requestSuggestions: wrapTool(
              "requestSuggestions",
              requestSuggestions({ session, dataStream }),
              toolAuditQueue
            ),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
          onStepFinish: async (stepResult) => {
            const currentStep = stepCounter++;

            // Flush tool audit records for this step
            const toolsInStep = toolAuditQueue.splice(0);
            for (const entry of toolsInStep) {
              saveToolCall({
                userId: session.user.id,
                chatId: id,
                stepIndex: currentStep,
                toolName: entry.toolName,
                input: entry.input,
                result: entry.fullResult,
                resultChars: entry.resultChars,
                summarized: entry.summarized,
                summaryChars: entry.summaryChars,
                durationMs: entry.durationMs,
              }).catch(() => {});
            }

            // Record AI call audit
            const usage = stepResult.usage;
            saveAiCall({
              userId: session.user.id,
              chatId: id,
              stepIndex: currentStep,
              model: selectedChatModel,
              inputTokens: usage.inputTokens ?? null,
              outputTokens: usage.outputTokens ?? null,
              totalTokens: usage.totalTokens ?? null,
              cacheReadTokens:
                (usage as any).inputTokenDetails?.cacheReadTokens ?? null,
              cacheWriteTokens:
                (usage as any).inputTokenDetails?.cacheWriteTokens ?? null,
              reasoningTokens:
                (usage as any).outputTokenDetails?.reasoningTokens ?? null,
              toolCallCount: stepResult.toolCalls?.length ?? 0,
              finishReason: stepResult.finishReason ?? null,
            }).catch(() => {});

            log.info("chat", "step finished", {
              chatId: id,
              step: currentStep,
              model: selectedChatModel,
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              totalTokens: usage.totalTokens,
              toolCalls: stepResult.toolCalls?.length ?? 0,
              finishReason: stepResult.finishReason,
            });
          },
        });

        dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));

        if (titlePromise) {
          const title = await titlePromise;
          dataStream.write({ type: "data-chat-title", data: title });
          updateChatTitleById({ chatId: id, title });
        }
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        if (isToolApprovalFlow) {
          for (const finishedMsg of finishedMessages) {
            const existingMsg = uiMessages.find((m) => m.id === finishedMsg.id);
            if (existingMsg) {
              await updateMessage({
                id: finishedMsg.id,
                parts: finishedMsg.parts,
              });
            } else {
              await saveMessages({
                messages: [
                  {
                    id: finishedMsg.id,
                    role: finishedMsg.role,
                    parts: finishedMsg.parts,
                    createdAt: new Date(),
                    attachments: [],
                    chatId: id,
                  },
                ],
              });
            }
          }
        } else if (finishedMessages.length > 0) {
          await saveMessages({
            messages: finishedMessages.map((currentMessage) => ({
              id: currentMessage.id,
              role: currentMessage.role,
              parts: currentMessage.parts,
              createdAt: new Date(),
              attachments: [],
              chatId: id,
            })),
          });
        }
      },
      onError: () => "Oops, an error occurred!",
    });

    return createUIMessageStreamResponse({
      stream,
      async consumeSseStream({ stream: sseStream }) {
        if (!process.env.REDIS_URL) {
          return;
        }
        try {
          const streamContext = getStreamContext();
          if (streamContext) {
            const streamId = generateId();
            await createStreamId({ streamId, chatId: id });
            await streamContext.createNewResumableStream(
              streamId,
              () => sseStream
            );
          }
        } catch (_) {
          // ignore redis errors
        }
      },
    });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatbotError) {
      return error.toResponse();
    }

    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatbotError("bad_request:activate_gateway").toResponse();
    }

    log.error("chat", "unhandled error", {
      error: error instanceof Error ? error.message : String(error),
      vercelId,
    });
    return new ChatbotError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatbotError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
