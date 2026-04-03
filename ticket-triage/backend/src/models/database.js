// models/database.js — SQLite database setup and initialization

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_DIR = process.env.DB_DIR || path.join(__dirname, "../../data");
const DB_PATH = path.join(DB_DIR, "tickets.db");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      is_urgent INTEGER NOT NULL DEFAULT 0,
      confidence REAL NOT NULL,
      keywords TEXT NOT NULL DEFAULT '[]',
      signals TEXT NOT NULL DEFAULT '[]',
      is_security INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
    CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
  `);
}

// For testing — allow using an in-memory DB
function getTestDb() {
  const testDb = new Database(":memory:");
  testDb.pragma("journal_mode = WAL");
  initSchema(testDb);
  return testDb;
}

module.exports = { getDb, getTestDb };
