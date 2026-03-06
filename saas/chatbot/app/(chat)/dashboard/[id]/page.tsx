import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { getDashboardData } from "@/lib/db/dashboard-queries";
import { getKalshiDashboardData } from "@/lib/kalshi/dashboard-data";
import { convertToUIMessages } from "@/lib/utils";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardWithChatPage params={props.params} />
    </Suspense>
  );
}

async function DashboardWithChatPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    redirect("/dashboard");
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (chat.visibility === "private") {
    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const userId = session.user.id;

  // Parallel fetch: dashboard data + chat messages
  const [dashboardResult, kalshiResult, messagesFromDb, cookieStore] =
    await Promise.all([
      getDashboardData(userId),
      getKalshiDashboardData(userId),
      getMessagesByChatId({ id }),
      cookies(),
    ]);

  const uiMessages = convertToUIMessages(messagesFromDb);
  const chatModelFromCookie = cookieStore.get("chat-model");

  return (
    <DashboardShell
      dashboardData={dashboardResult}
      kalshiData={kalshiResult}
      chatId={chat.id}
      initialMessages={uiMessages}
      initialChatModel={chatModelFromCookie?.value ?? DEFAULT_CHAT_MODEL}
      initialVisibilityType={chat.visibility}
      isReadonly={session.user.id !== chat.userId}
      autoResume={true}
      key={chat.id}
    />
  );
}

function DashboardFallback() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}
