"use client";

import {
  LayoutDashboard,
  Layers,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardTab } from "./types";

const TABS: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "strategies", label: "Strategies", icon: Layers },
  { id: "positions", label: "Positions", icon: BarChart3 },
  { id: "chat", label: "Chat", icon: MessageSquare },
];

export function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
      <div className="flex h-14">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
              activeTab === id
                ? "text-brand"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
