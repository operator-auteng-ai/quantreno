"use client";

import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDollars,
  formatRelativeTime,
  formatTradeAction,
  formatCentsDisplay,
  formatPlaybook,
} from "@/lib/format";
import type { DashboardProps } from "./types";
import { KalshiEmptyState, KalshiErrorBanner } from "./kalshi-empty-state";

export function OverviewTab({
  dashboardData,
  kalshiData,
}: DashboardProps) {
  const { strategies, recentTrades } = dashboardData;
  const { balance, positions: kalshiPositions, connected, error } = kalshiData;

  // Use Kalshi API positions as truth when connected
  const positionsCount = connected ? kalshiPositions.length : 0;

  // Total exposure from Kalshi positions
  const totalExposureCents = kalshiPositions.reduce(
    (sum, p) => sum + Math.abs(p.market_exposure_cents),
    0
  );

  return (
    <div className="space-y-6">
      {/* Kalshi error banner */}
      {error && <KalshiErrorBanner error={error} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Cash"
          value={connected && balance ? formatDollars(balance.balance) : "--"}
          icon={DollarSign}
          trend={null}
        />
        <StatCard
          label="Portfolio"
          value={connected && balance ? formatDollars(balance.payout) : "--"}
          icon={TrendingUp}
          trend={balance && balance.payout > 0 ? "up" : null}
        />
        <StatCard
          label="Positions"
          value={connected ? String(positionsCount) : "--"}
          icon={BarChart3}
          trend={null}
        />
        <StatCard
          label="Exposure"
          value={
            connected && totalExposureCents > 0
              ? formatDollars(totalExposureCents)
              : "--"
          }
          icon={Target}
          trend={null}
        />
      </div>

      {/* Kalshi not connected CTA */}
      {!connected && <KalshiEmptyState />}

      {/* Two-column: strategies + activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strategies Summary */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">
            Strategies ({strategies.length})
          </h3>
          {strategies.length === 0 ? (
            <EmptySection message="No strategies yet. Start a conversation to create one." />
          ) : (
            <div className="space-y-2">
              {strategies.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{s.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatPlaybook(s.playbook)} ·{" "}
                      {formatDollars(s.budgetCents)}
                    </p>
                  </div>
                  <StatusDot status={s.status} />
                </div>
              ))}
              {strategies.length > 5 && (
                <p className="text-center text-muted-foreground text-xs">
                  +{strategies.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">
            Recent Activity
          </h3>
          {recentTrades.length === 0 ? (
            <EmptySection message="No trades yet." />
          ) : (
            <div className="space-y-1">
              {recentTrades.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TradeIcon action={t.action} />
                    <div className="min-w-0">
                      <span className="truncate text-xs font-medium">
                        {formatTradeAction(t.side, t.action)} {t.count}x{" "}
                        {t.ticker}
                      </span>
                      <span className="ml-1 text-muted-foreground text-xs">
                        @ {formatCentsDisplay(t.priceCents)}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-muted-foreground text-xs">
                    {formatRelativeTime(t.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  trend: "up" | "down" | null;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-semibold text-xl tabular-nums",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive"
          )}
        >
          {value}
        </span>
        {trend === "up" && <ArrowUpRight className="size-4 text-success" />}
        {trend === "down" && (
          <ArrowDownRight className="size-4 text-destructive" />
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-2 shrink-0 rounded-full",
        status === "active" && "bg-success",
        status === "paused" && "bg-warning",
        status === "archived" && "bg-muted-foreground"
      )}
    />
  );
}

function TradeIcon({ action }: { action: string }) {
  return action === "buy" ? (
    <ArrowUpRight className="size-3.5 shrink-0 text-success" />
  ) : (
    <ArrowDownRight className="size-3.5 shrink-0 text-destructive" />
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
      <p className="text-muted-foreground text-xs">{message}</p>
    </div>
  );
}
