"use client";

import { BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDollars, formatPnl } from "@/lib/format";
import type { DashboardProps } from "./types";
import type { KalshiPosition } from "@/lib/kalshi/types";
import { KalshiEmptyState } from "./kalshi-empty-state";

export function PositionsTab({
  dashboardData,
  kalshiData,
}: DashboardProps) {
  const { positions: kalshiPositions, connected } = kalshiData;

  // Not connected — show CTA
  if (!connected) {
    return <KalshiEmptyState />;
  }

  // Connected but no positions
  if (kalshiPositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center">
        <BarChart3 className="size-8 text-muted-foreground" />
        <div>
          <h3 className="font-medium text-sm">No Open Positions</h3>
          <p className="mt-1 text-muted-foreground text-xs max-w-xs">
            Your open positions on Kalshi will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">
          {kalshiPositions.length} Open Position
          {kalshiPositions.length !== 1 ? "s" : ""}
        </h3>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Ticker</th>
              <th className="pb-2 pr-4 font-medium text-right">Position</th>
              <th className="pb-2 pr-4 font-medium text-right">Exposure</th>
              <th className="pb-2 pr-4 font-medium text-right">
                Realized P&L
              </th>
              <th className="pb-2 pr-4 font-medium text-right">
                Total Traded
              </th>
              <th className="pb-2 font-medium text-right">Resting Orders</th>
            </tr>
          </thead>
          <tbody>
            {kalshiPositions.map((p) => (
              <tr
                key={p.ticker}
                className="border-b border-muted/50 last:border-0"
              >
                <td className="py-2.5 pr-4">
                  <span className="font-mono text-xs">{p.ticker}</span>
                </td>
                <td className="py-2.5 pr-4 text-right">
                  <PositionBadge position={p.position} />
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {formatDollars(Math.abs(p.market_exposure_cents))}
                </td>
                <td className="py-2.5 pr-4 text-right">
                  <span
                    className={cn(
                      "tabular-nums text-xs",
                      p.realized_pnl_cents > 0 && "text-success",
                      p.realized_pnl_cents < 0 && "text-destructive"
                    )}
                  >
                    {formatPnl(p.realized_pnl_cents)}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                  {formatDollars(p.total_traded_cents)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                  {p.resting_orders_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {kalshiPositions.map((p) => (
          <div key={p.ticker} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium">{p.ticker}</span>
              <PositionBadge position={p.position} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Exposure: {formatDollars(Math.abs(p.market_exposure_cents))}
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  p.realized_pnl_cents > 0 && "text-success",
                  p.realized_pnl_cents < 0 && "text-destructive"
                )}
              >
                {formatPnl(p.realized_pnl_cents)}
              </span>
            </div>
            {p.resting_orders_count > 0 && (
              <p className="text-muted-foreground text-[10px]">
                {p.resting_orders_count} resting order
                {p.resting_orders_count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  const side = position > 0 ? "Yes" : position < 0 ? "No" : "Flat";
  const count = Math.abs(position);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-[10px]",
        position > 0
          ? "bg-success/10 text-success"
          : position < 0
            ? "bg-destructive/10 text-destructive"
            : ""
      )}
    >
      {count} {side}
    </Badge>
  );
}
