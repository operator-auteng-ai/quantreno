"""Trade and position CRUD operations."""

from .db import get_connection


def log_trade(
    strategy: str,
    ticker: str,
    side: str,
    action: str,
    price: int,
    count: int,
    total_cost: float,
    order_id: str = "",
    fees: float = 0,
    recommendation_id: int | None = None,
    thesis: str = "",
    exit_plan: str = "",
    catalyst_date: str = "",
) -> int:
    """Log an executed trade and open a position."""
    conn = get_connection()
    cur = conn.execute(
        """INSERT INTO trades (strategy, ticker, side, action, price, count,
           total_cost, order_id, fees, recommendation_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (strategy, ticker, side, action, price, count, total_cost, order_id, fees, recommendation_id),
    )
    trade_id = cur.lastrowid

    # Auto-open a position for buy trades
    if action == "buy":
        conn.execute(
            """INSERT INTO positions (trade_id, strategy, ticker, side,
               entry_price, count, thesis, exit_plan, catalyst_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (trade_id, strategy, ticker, side, price, count, thesis, exit_plan, catalyst_date),
        )

    conn.commit()
    conn.close()
    return trade_id


def get_trades(strategy: str = "", limit: int = 50) -> list[dict]:
    """Get trade history, optionally filtered by strategy."""
    conn = get_connection()
    if strategy:
        rows = conn.execute(
            "SELECT * FROM trades WHERE strategy = ? ORDER BY created_at DESC LIMIT ?",
            (strategy, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM trades ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_open_positions() -> list[dict]:
    """Get all open positions."""
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM positions WHERE status = 'open' ORDER BY opened_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def close_position(ticker: str, exit_price: int, pnl_dollars: float) -> bool:
    """Close a position by ticker."""
    conn = get_connection()
    pnl_cents = int(pnl_dollars * 100)
    cur = conn.execute(
        """UPDATE positions SET status = 'closed', closed_at = datetime('now'),
           exit_price = ?, pnl_cents = ?, pnl_dollars = ?
           WHERE ticker = ? AND status = 'open'""",
        (exit_price, pnl_cents, pnl_dollars, ticker),
    )
    conn.commit()
    updated = cur.rowcount > 0
    conn.close()
    return updated
