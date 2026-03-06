import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getDashboardData } from "@/lib/db/dashboard-queries";
import { getKalshiDashboardData } from "@/lib/kalshi/dashboard-data";
import { generateUUID } from "@/lib/utils";

export default function Page() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardPage />
    </Suspense>
  );
}

async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const chatId = generateUUID();

  // Parallel data fetch
  const [dashboardResult, kalshiResult, cookieStore] = await Promise.all([
    getDashboardData(userId),
    getKalshiDashboardData(userId),
    cookies(),
  ]);

  const modelIdFromCookie = cookieStore.get("chat-model");

  return (
    <DashboardShell
      dashboardData={dashboardResult}
      kalshiData={kalshiResult}
      chatId={chatId}
      initialMessages={[]}
      initialChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}
      initialVisibilityType="private"
      isReadonly={false}
      autoResume={false}
      key={chatId}
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
