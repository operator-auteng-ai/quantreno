"""CLI for Kalshi state management."""

import argparse
import csv
import sys

from .trades import log_trade, get_trades, get_open_positions, close_position
from .recommendations import log_recommendation, get_recommendations
from .scans import log_scan, get_recent_scans
from .performance import snapshot_performance, get_performance_history, get_strategy_stats


def fmt_dollars(cents: int | None) -> str:
    if cents is None:
        return "$0.00"
    return f"${cents / 100:.2f}"


def print_table(rows: list[dict], columns: list[str]) -> None:
    """Simple table printer."""
    if not rows:
        print("(no data)")
        return
    widths = {c: max(len(c), max(len(str(r.get(c, ""))) for r in rows)) for c in columns}
    header = " | ".join(c.ljust(widths[c]) for c in columns)
    print(header)
    print("-" * len(header))
    for r in rows:
        print(" | ".join(str(r.get(c, "")).ljust(widths[c]) for c in columns))


def cmd_trades(args):
    trades = get_trades(strategy=args.strategy or "", limit=args.limit)
    print_table(trades, ["id", "created_at", "strategy", "ticker", "side", "action", "price", "count", "total_cost", "status"])


def cmd_positions(args):
    positions = get_open_positions()
    print_table(positions, ["id", "opened_at", "strategy", "ticker", "side", "entry_price", "count", "thesis", "status"])


def cmd_close_position(args):
    ok = close_position(args.ticker, args.exit_price, args.pnl)
    if ok:
        print(f"Closed position on {args.ticker} at {args.exit_price}c, P&L: ${args.pnl:.2f}")
    else:
        print(f"No open position found for {args.ticker}")


def cmd_log_trade(args):
    trade_id = log_trade(
        strategy=args.strategy, ticker=args.ticker, side=args.side,
        action=args.action, price=args.price, count=args.count,
        total_cost=args.cost, order_id=args.order_id or "",
        fees=args.fees, thesis=args.thesis or "", exit_plan=args.exit_plan or "",
        catalyst_date=args.catalyst_date or "",
    )
    print(f"Logged trade #{trade_id}: {args.action} {args.count}x {args.ticker} {args.side} @ {args.price}c = ${args.cost:.2f}")


def cmd_log_rec(args):
    rec_id = log_recommendation(
        strategy=args.strategy, ticker=args.ticker, side=args.side,
        entry_price=args.entry, target_price=args.target or 0,
        confidence=args.confidence, edge_points=args.edge or 0,
        thesis=args.thesis or "", catalyst=args.catalyst or "",
        catalyst_date=args.catalyst_date or "",
    )
    print(f"Logged recommendation #{rec_id}: {args.ticker} {args.side} @ {args.entry}c [{args.confidence}]")


def cmd_recs(args):
    recs = get_recommendations(strategy=args.strategy or "", status=args.status or "")
    print_table(recs, ["id", "created_at", "strategy", "ticker", "side", "entry_price", "confidence", "edge_points", "status"])


def cmd_log_scan(args):
    scan_id = log_scan(
        strategy=args.strategy, balance_cents=args.balance,
        candidates_found=args.candidates or 0,
        recommendations_made=args.recs or 0, notes=args.notes or "",
    )
    print(f"Logged scan #{scan_id}: {args.strategy} | balance: {fmt_dollars(args.balance)} | candidates: {args.candidates or 0}")


def cmd_scans(args):
    scans = get_recent_scans(strategy=args.strategy or "")
    print_table(scans, ["id", "created_at", "strategy", "balance_cents", "candidates_found", "recommendations_made", "notes"])


def cmd_performance(args):
    if args.strategy:
        stats = get_strategy_stats(args.strategy)
        print(f"\n--- {args.strategy} Strategy Stats ---")
        print(f"Total closed trades: {stats.get('total_trades', 0)}")
        print(f"Wins: {stats.get('wins', 0)} | Losses: {stats.get('losses', 0)}")
        total_pnl = stats.get('total_pnl_cents', 0) or 0
        print(f"Total P&L: {fmt_dollars(total_pnl)}")
        wins = stats.get('wins', 0) or 0
        total = stats.get('total_trades', 0) or 0
        print(f"Win rate: {wins/total*100:.0f}%" if total > 0 else "Win rate: N/A")
    else:
        history = get_performance_history()
        print_table(history, ["date", "balance_cents", "open_positions", "realized_pnl_cents", "total_trades", "win_count", "loss_count"])


def cmd_snapshot(args):
    perf_id = snapshot_performance(
        balance_cents=args.balance,
        open_positions=args.positions or 0,
        unrealized_pnl_cents=args.unrealized or 0,
    )
    print(f"Performance snapshot #{perf_id}: balance {fmt_dollars(args.balance)}")


def cmd_export(args):
    trades = get_trades(limit=10000)
    if not trades:
        print("No trades to export.")
        return
    with open(args.file, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=trades[0].keys())
        writer.writeheader()
        writer.writerows(trades)
    print(f"Exported {len(trades)} trades to {args.file}")


def main():
    parser = argparse.ArgumentParser(description="Kalshi state management")
    sub = parser.add_subparsers(dest="command")

    # trades
    p = sub.add_parser("trades", help="View trade history")
    p.add_argument("--strategy", help="Filter by strategy")
    p.add_argument("--limit", type=int, default=50)
    p.set_defaults(func=cmd_trades)

    # positions
    p = sub.add_parser("positions", help="View open positions")
    p.set_defaults(func=cmd_positions)

    # close-position
    p = sub.add_parser("close-position", help="Close a position")
    p.add_argument("--ticker", required=True)
    p.add_argument("--exit-price", type=int, required=True)
    p.add_argument("--pnl", type=float, required=True, help="P&L in dollars")
    p.set_defaults(func=cmd_close_position)

    # log-trade
    p = sub.add_parser("log-trade", help="Log an executed trade")
    p.add_argument("--strategy", required=True)
    p.add_argument("--ticker", required=True)
    p.add_argument("--side", required=True, choices=["yes", "no"])
    p.add_argument("--action", default="buy", choices=["buy", "sell"])
    p.add_argument("--price", type=int, required=True, help="Price in cents")
    p.add_argument("--count", type=int, required=True)
    p.add_argument("--cost", type=float, required=True, help="Total cost in dollars")
    p.add_argument("--order-id", default="")
    p.add_argument("--fees", type=float, default=0)
    p.add_argument("--thesis", default="")
    p.add_argument("--exit-plan", default="")
    p.add_argument("--catalyst-date", default="")
    p.set_defaults(func=cmd_log_trade)

    # log-rec
    p = sub.add_parser("log-rec", help="Log a recommendation")
    p.add_argument("--strategy", required=True)
    p.add_argument("--ticker", required=True)
    p.add_argument("--side", required=True, choices=["yes", "no"])
    p.add_argument("--entry", type=int, required=True, help="Entry price in cents")
    p.add_argument("--target", type=int, default=0, help="Target price in cents")
    p.add_argument("--confidence", default="medium", choices=["high", "medium", "low"])
    p.add_argument("--edge", type=float, default=0)
    p.add_argument("--thesis", default="")
    p.add_argument("--catalyst", default="")
    p.add_argument("--catalyst-date", default="")
    p.set_defaults(func=cmd_log_rec)

    # recs
    p = sub.add_parser("recs", help="View recommendations")
    p.add_argument("--strategy", default="")
    p.add_argument("--status", default="")
    p.set_defaults(func=cmd_recs)

    # log-scan
    p = sub.add_parser("log-scan", help="Log a scan")
    p.add_argument("--strategy", required=True)
    p.add_argument("--balance", type=int, required=True, help="Balance in cents")
    p.add_argument("--candidates", type=int, default=0)
    p.add_argument("--recs", type=int, default=0)
    p.add_argument("--notes", default="")
    p.set_defaults(func=cmd_log_scan)

    # scans
    p = sub.add_parser("scans", help="View scan history")
    p.add_argument("--strategy", default="")
    p.set_defaults(func=cmd_scans)

    # performance
    p = sub.add_parser("performance", help="View performance")
    p.add_argument("--strategy", default="")
    p.set_defaults(func=cmd_performance)

    # snapshot
    p = sub.add_parser("snapshot", help="Take a performance snapshot")
    p.add_argument("--balance", type=int, required=True, help="Balance in cents")
    p.add_argument("--positions", type=int, default=0)
    p.add_argument("--unrealized", type=int, default=0, help="Unrealized P&L in cents")
    p.set_defaults(func=cmd_snapshot)

    # export
    p = sub.add_parser("export", help="Export trades to CSV")
    p.add_argument("file", help="Output CSV file path")
    p.set_defaults(func=cmd_export)

    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
