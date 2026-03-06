"""Scan logging operations."""

from .db import get_connection


def log_scan(
    strategy: str,
    balance_cents: int = 0,
    open_positions: int = 0,
    markets_scanned: int = 0,
    candidates_found: int = 0,
    recommendations_made: int = 0,
    notes: str = "",
) -> int:
    """Log a scan snapshot."""
    conn = get_connection()
    cur = conn.execute(
        """INSERT INTO scans (strategy, balance_cents, open_positions,
           markets_scanned, candidates_found, recommendations_made, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (strategy, balance_cents, open_positions, markets_scanned,
         candidates_found, recommendations_made, notes),
    )
    scan_id = cur.lastrowid
    conn.commit()
    conn.close()
    return scan_id


def get_recent_scans(strategy: str = "", limit: int = 20) -> list[dict]:
    """Get recent scans."""
    conn = get_connection()
    if strategy:
        rows = conn.execute(
            "SELECT * FROM scans WHERE strategy = ? ORDER BY created_at DESC LIMIT ?",
            (strategy, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM scans ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
