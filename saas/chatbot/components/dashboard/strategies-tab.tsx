"use client";

import {
  Layers,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  ArrowLeftRight,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  formatDollars,
  formatPlaybook,
  formatInstrumentType,
  formatStrategyStatus,
} from "@/lib/format";
import type { DashboardProps } from "./types";

const PLAYBOOK_ICONS: Record<string, typeof TrendingUp> = {
  event_driven: Zap,
  relative_value: ArrowLeftRight,
  tail_risk: Target,
  momentum: TrendingUp,
  mean_reversion: Repeat,
  macro_thematic: BarChart3,
};

const INSTRUMENT_ICONS: Record<string, string> = {
  prediction_market: "🎯",
  options: "📊",
  crypto: "₿",
};

export function StrategiesTab({
  dashboardData,
}: Pick<DashboardProps, "dashboardData">) {
  const { strategies, tradeCountsByStrategy } = dashboardData;

  // Build a lookup for open trade counts per strategy
  const tradeCountMap = new Map(
    tradeCountsByStrategy.map((r) => [r.strategyId, r.openCount])
  );

  if (strategies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center">
        <Layers className="size-8 text-muted-foreground" />
        <div>
          <h3 className="font-medium text-sm">No Strategies Yet</h3>
          <p className="mt-1 text-muted-foreground text-xs max-w-xs">
            Start a conversation with the AI to create your first trading
            strategy. It will help you define playbook, budget, and rules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">
          {strategies.length} {strategies.length === 1 ? "Strategy" : "Strategies"}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {strategies.map((s) => {
          const PlaybookIcon = PLAYBOOK_ICONS[s.playbook] ?? Layers;
          const openCount = tradeCountMap.get(s.id) ?? 0;
          const instrumentEmoji =
            INSTRUMENT_ICONS[s.instrumentType] ?? "📈";

          return (
            <div
              key={s.id}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" title={formatInstrumentType(s.instrumentType)}>
                      {instrumentEmoji}
                    </span>
                    <h4 className="truncate font-medium text-sm">
                      {s.name}
                    </h4>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <PlaybookIcon className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      {formatPlaybook(s.playbook)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={s.status === "active" ? "default" : "secondary"}
                  className="shrink-0 text-[10px]"
                >
                  {formatStrategyStatus(s.status)}
                </Badge>
              </div>

              {/* Budget bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium tabular-nums">
                    {formatDollars(s.budgetCents)}
                  </span>
                </div>
                {/* Placeholder progress — we don't yet track per-strategy spend precisely */}
                <Progress value={0} className="h-1.5" />
              </div>

              {/* Footer stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{openCount} open trade{openCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
