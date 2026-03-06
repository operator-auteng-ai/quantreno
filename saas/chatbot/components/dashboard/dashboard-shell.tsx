"use client";

import { useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import type { DashboardData } from "@/lib/db/dashboard-queries";
import type { KalshiDashboardData } from "@/lib/kalshi/dashboard-data";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "@/components/visibility-selector";
import type { DashboardTab } from "./types";
import { OverviewTab } from "./overview-tab";
import { StrategiesTab } from "./strategies-tab";
import { PositionsTab } from "./positions-tab";
import { BottomNav } from "./bottom-nav";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Layers,
  BarChart3,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────────

type DashboardShellProps = {
  // Dashboard data
  dashboardData: DashboardData;
  kalshiData: KalshiDashboardData;
  // Chat data
  chatId: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
};

// ── Tab Config ───────────────────────────────────────────────────────────────────

const CENTER_TABS: { id: Exclude<DashboardTab, "chat">; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "strategies", label: "Strategies", icon: Layers },
  { id: "positions", label: "Positions", icon: BarChart3 },
];

// ── Component ────────────────────────────────────────────────────────────────────

export function DashboardShell({
  dashboardData,
  kalshiData,
  chatId,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
}: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const { width: windowWidth } = useWindowSize();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isMobile = windowWidth < 1024; // lg breakpoint

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    // Reset animation after a bit
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const centerContent = (
    <>
      {activeTab === "overview" && (
        <OverviewTab
          dashboardData={dashboardData}
          kalshiData={kalshiData}
        />
      )}
      {activeTab === "strategies" && (
        <StrategiesTab dashboardData={dashboardData} />
      )}
      {activeTab === "positions" && (
        <PositionsTab
          dashboardData={dashboardData}
          kalshiData={kalshiData}
        />
      )}
    </>
  );

  // ── Mobile Layout ──────────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <>
        <div className="flex h-dvh flex-col">
          {activeTab === "chat" ? (
            // Full-screen chat on mobile
            <Chat
              id={chatId}
              initialMessages={initialMessages}
              initialChatModel={initialChatModel}
              initialVisibilityType={initialVisibilityType}
              isReadonly={isReadonly}
              autoResume={autoResume}
              key={chatId}
            />
          ) : (
            // Dashboard content
            <div className="flex-1 overflow-y-auto pb-16">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
                <div>
                  <h1 className="font-semibold text-lg">Dashboard</h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw
                    className={cn(
                      "size-4",
                      isRefreshing && "animate-spin"
                    )}
                  />
                </Button>
              </div>

              {/* Tab bar */}
              <div className="flex border-b px-4">
                {CENTER_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                      activeTab === id
                        ? "border-brand text-brand"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-4 py-4">{centerContent}</div>
            </div>
          )}
        </div>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <DataStreamHandler />
      </>
    );
  }

  // ── Desktop Layout ─────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-dvh">
        {/* Center Panel */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-3">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-lg">Dashboard</h1>
              {/* Tab bar inline */}
              <div className="flex">
                {CENTER_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                      activeTab === id
                        ? "border-brand text-brand"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={cn("size-4", isRefreshing && "animate-spin")}
              />
            </Button>
          </div>

          {/* Center content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {centerContent}
          </div>
        </div>

        {/* Chat Panel — right side */}
        <div className="hidden w-[420px] shrink-0 border-l lg:flex lg:flex-col">
          <Chat
            id={chatId}
            initialMessages={initialMessages}
            initialChatModel={initialChatModel}
            initialVisibilityType={initialVisibilityType}
            isReadonly={isReadonly}
            autoResume={autoResume}
            key={chatId}
          />
        </div>
      </div>

      <DataStreamHandler />
    </>
  );
}
