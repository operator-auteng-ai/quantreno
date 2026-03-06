"""Performance tracking operations."""

from datetime import date
from .db import get_connection


def snapshot_performance(
    balance_cents: int,
    open_positions: int = 0,
    unrealized_pnl_cents: int = 0,
) -> int:
    """Take a daily performance snapshot."""
    conn = get_connection()
    today = date.today().isoformat()

    # Calculate realized P&L and win/loss from closed positions
    stats = conn.execute(
        """SELECT
           COUNT(*) as total,
           SUM(CASE WHEN pnl_cents > 0 THEN 1 ELSE 0 END) as wins,
           SUM(CASE WHEN pnl_cents <= 0 THEN 1 ELSE 0 END) as losses,
           SUM(COALESCE(pnl_cents, 0)) as realized_pnl
           FROM positions WHERE status = 'closed'"""
    ).fetchone()

    cur = conn.execute(
        """INSERT INTO performance (date, balance_cents, open_positions,
           unrealized_pnl_cents, realized_pnl_cents, total_trades,
           win_count, loss_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (today, balance_cents, open_positions, unrealized_pnl_cents,
         stats["realized_pnl"] or 0, stats["total"] or 0,
         stats["wins"] or 0, stats["losses"] or 0),
    )
    perf_id = cur.lastrowid
    conn.commit()
    conn.close()
    return perf_id


def get_performance_history(limit: int = 30) -> list[dict]:
    """Get performance history."""
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM performance ORDER BY date DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_strategy_stats(strategy: str = "") -> dict:
    """Get aggregate stats, optionally by strategy."""
    conn = get_connection()
    where = "WHERE strategy = ?" if strategy else ""
    params = (strategy,) if strategy else ()

    stats = conn.execute(
        f"""SELECT
           COUNT(*) as total_trades,
           SUM(CASE WHEN pnl_cents > 0 THEN 1 ELSE 0 END) as wins,
           SUM(CASE WHEN pnl_cents <= 0 THEN 1 ELSE 0 END) as losses,
           SUM(COALESCE(pnl_cents, 0)) as total_pnl_cents,
           AVG(COALESCE(pnl_cents, 0)) as avg_pnl_cents
           FROM positions WHERE status = 'closed' {('AND strategy = ?' if strategy else '')}""",
        params,
    ).fetchone()

    conn.close()
    return dict(stats) if stats else {}
