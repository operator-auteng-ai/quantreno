"""Recommendation CRUD operations."""

from .db import get_connection


def log_recommendation(
    strategy: str,
    ticker: str,
    side: str,
    entry_price: int,
    target_price: int = 0,
    confidence: str = "medium",
    edge_points: float = 0,
    my_probability: float = 0,
    market_probability: float = 0,
    thesis: str = "",
    catalyst: str = "",
    catalyst_date: str = "",
) -> int:
    """Log a trade recommendation."""
    conn = get_connection()
    cur = conn.execute(
        """INSERT INTO recommendations (strategy, ticker, side, entry_price,
           target_price, confidence, edge_points, my_probability,
           market_probability, thesis, catalyst, catalyst_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (strategy, ticker, side, entry_price, target_price, confidence,
         edge_points, my_probability, market_probability, thesis, catalyst, catalyst_date),
    )
    rec_id = cur.lastrowid
    conn.commit()
    conn.close()
    return rec_id


def get_recommendations(strategy: str = "", status: str = "", limit: int = 50) -> list[dict]:
    """Get recommendations, optionally filtered."""
    conn = get_connection()
    query = "SELECT * FROM recommendations WHERE 1=1"
    params: list = []
    if strategy:
        query += " AND strategy = ?"
        params.append(strategy)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_recommendation_status(rec_id: int, status: str) -> bool:
    """Update a recommendation's status (pending → traded/skipped/expired)."""
    conn = get_connection()
    cur = conn.execute(
        "UPDATE recommendations SET status = ? WHERE id = ?", (status, rec_id)
    )
    conn.commit()
    updated = cur.rowcount > 0
    conn.close()
    return updated
