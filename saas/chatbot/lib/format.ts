/**
 * Display formatting utilities for the trading terminal.
 * Pure functions — no `server-only`, usable in both RSC and client components.
 */

// ── Currency ────────────────────────────────────────────────────────────────────

/** Format cents as dollars: 1250 → "$12.50", -320 → "-$3.20" */
export function formatDollars(cents: number): string {
  const abs = Math.abs(cents);
  const dollars = (abs / 100).toFixed(2);
  return cents < 0 ? `-$${dollars}` : `$${dollars}`;
}

/** Format cents for display with ¢ symbol: 58 → "58¢", 100 → "$1.00" */
export function formatCentsDisplay(cents: number): string {
  if (cents >= 100) return formatDollars(cents);
  return `${cents}¢`;
}

/** Format P&L cents with explicit sign: 1250 → "+$12.50", -320 → "-$3.20", 0 → "$0.00" */
export function formatPnl(cents: number): string {
  if (cents === 0) return "$0.00";
  const abs = Math.abs(cents);
  const dollars = (abs / 100).toFixed(2);
  return cents > 0 ? `+$${dollars}` : `-$${dollars}`;
}

// ── Percentages ─────────────────────────────────────────────────────────────────

/** Format a decimal or integer as a percentage: 0.38 → "38%", 38 → "38%" */
export function formatPercent(value: number): string {
  // If value is between 0 and 1 (exclusive), treat as decimal
  const pct = value > 0 && value < 1 ? Math.round(value * 100) : Math.round(value);
  return `${pct}%`;
}

// ── Trading Enums ───────────────────────────────────────────────────────────────

const PLAYBOOK_LABELS: Record<string, string> = {
  event_driven: "Event-Driven",
  relative_value: "Relative Value",
  tail_risk: "Tail Risk",
  momentum: "Momentum",
  mean_reversion: "Mean Reversion",
  macro_thematic: "Macro Thematic",
};

/** Format playbook enum to display label: "event_driven" → "Event-Driven" */
export function formatPlaybook(playbook: string): string {
  return PLAYBOOK_LABELS[playbook] ?? playbook;
}

const INSTRUMENT_LABELS: Record<string, string> = {
  prediction_market: "Prediction Market",
  options: "Options",
  crypto: "Crypto",
};

/** Format instrument type enum: "prediction_market" → "Prediction Market" */
export function formatInstrumentType(instrumentType: string): string {
  return INSTRUMENT_LABELS[instrumentType] ?? instrumentType;
}

// ── Dates ───────────────────────────────────────────────────────────────────────

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Format a date as relative time: "2m ago", "1h ago", "3d ago", or "Mar 4".
 * Uses simple math — no date-fns dependency.
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;

  // Beyond 7 days: show short date
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Strategy Status ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

export function formatStrategyStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

// ── Trade Side / Action ─────────────────────────────────────────────────────────

/** Format trade side + action: ("yes", "buy") → "Buy Yes" */
export function formatTradeAction(side: string, action: string): string {
  const sideLabel = side === "yes" ? "Yes" : "No";
  const actionLabel = action === "buy" ? "Buy" : "Sell";
  return `${actionLabel} ${sideLabel}`;
}
