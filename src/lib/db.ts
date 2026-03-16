import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "modern-brokerage.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      organization TEXT,
      role TEXT,
      city TEXT,
      state TEXT,
      country TEXT DEFAULT 'US',
      phone TEXT,
      how_heard TEXT,
      payment_method TEXT NOT NULL DEFAULT 'offer_code',
      offer_code TEXT,
      amount_paid REAL NOT NULL DEFAULT 0,
      stripe_session_id TEXT,
      download_token TEXT NOT NULL UNIQUE,
      download_count INTEGER NOT NULL DEFAULT 0,
      max_downloads INTEGER NOT NULL DEFAULT 5,
      token_expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS offer_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      discount_percent INTEGER NOT NULL DEFAULT 100,
      max_uses INTEGER,
      current_uses INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS download_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      downloaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);

  // Seed default offer codes if none exist
  const count = db
    .prepare("SELECT COUNT(*) as count FROM offer_codes")
    .get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare(
      "INSERT INTO offer_codes (code, description, discount_percent, max_uses) VALUES (?, ?, ?, ?)"
    );
    insert.run("STUDENT2026", "Student complimentary access", 100, null);
    insert.run("ARES2026", "ARES member discount", 100, null);
    insert.run("REVIEW2026", "Reviewer copy", 100, 50);
  }
}

export default getDb;
