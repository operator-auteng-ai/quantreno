import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { cancelOrder } from "./ai/tools/cancel-order";
import type { createDocument } from "./ai/tools/create-document";
import type { createOrder } from "./ai/tools/create-order";
import type { getMarkets } from "./ai/tools/get-markets";
import type { getPortfolio } from "./ai/tools/get-portfolio";
import type { getPositions } from "./ai/tools/get-positions";
import type { getTradeHistory } from "./ai/tools/get-trade-history";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { webSearch } from "./ai/tools/web-search";
import type { xSearch } from "./ai/tools/x-search";
import type { Suggestion } from "./db/schema";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type getMarketsTool = InferUITool<ReturnType<typeof getMarkets>>;
type getPositionsTool = InferUITool<ReturnType<typeof getPositions>>;
type getPortfolioTool = InferUITool<ReturnType<typeof getPortfolio>>;
type getTradeHistoryTool = InferUITool<ReturnType<typeof getTradeHistory>>;
type createOrderTool = InferUITool<ReturnType<typeof createOrder>>;
type cancelOrderTool = InferUITool<ReturnType<typeof cancelOrder>>;
type webSearchTool = InferUITool<typeof webSearch>;
type xSearchTool = InferUITool<typeof xSearch>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  getMarkets: getMarketsTool;
  getPositions: getPositionsTool;
  getPortfolio: getPortfolioTool;
  getTradeHistory: getTradeHistoryTool;
  createOrder: createOrderTool;
  cancelOrder: cancelOrderTool;
  webSearch: webSearchTool;
  xSearch: xSearchTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "chat-title": string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
