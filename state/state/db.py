"""SQLite database connection and schema management."""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "kalshi.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (datetime('now')),
    strategy TEXT NOT NULL,
    ticker TEXT NOT NULL,
    side TEXT NOT NULL,
    entry_price INTEGER,
    target_price INTEGER,
    confidence TEXT,
    edge_points REAL,
    my_probability REAL,
    market_probability REAL,
    thesis TEXT,
    catalyst TEXT,
    catalyst_date TEXT,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (datetime('now')),
    recommendation_id INTEGER REFERENCES recommendations(id),
    strategy TEXT NOT NULL,
    ticker TEXT NOT NULL,
    side TEXT NOT NULL,
    action TEXT NOT NULL,
    order_type TEXT DEFAULT 'limit',
    price INTEGER NOT NULL,
    count INTEGER NOT NULL,
    total_cost REAL NOT NULL,
    order_id TEXT,
    status TEXT DEFAULT 'executed',
    fees REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opened_at TEXT DEFAULT (datetime('now')),
    closed_at TEXT,
    trade_id INTEGER REFERENCES trades(id),
    strategy TEXT NOT NULL,
    ticker TEXT NOT NULL,
    side TEXT NOT NULL,
    entry_price INTEGER NOT NULL,
    exit_price INTEGER,
    count INTEGER NOT NULL,
    thesis TEXT,
    exit_plan TEXT,
    catalyst_date TEXT,
    status TEXT DEFAULT 'open',
    pnl_cents INTEGER,
    pnl_dollars REAL
);

CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (datetime('now')),
    strategy TEXT NOT NULL,
    balance_cents INTEGER,
    open_positions INTEGER,
    markets_scanned INTEGER,
    candidates_found INTEGER,
    recommendations_made INTEGER,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    balance_cents INTEGER,
    open_positions INTEGER,
    unrealized_pnl_cents INTEGER,
    realized_pnl_cents INTEGER,
    total_trades INTEGER,
    win_count INTEGER,
    loss_count INTEGER
);
"""


def get_connection() -> sqlite3.Connection:
    """Get a database connection, creating the DB and tables if needed."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn
