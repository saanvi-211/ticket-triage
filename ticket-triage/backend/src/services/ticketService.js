// services/ticketService.js — Business logic for ticket persistence

const { getDb } = require("../models/database");

function saveTicket(message, analysis) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO tickets (message, category, priority, is_urgent, confidence, keywords, signals, is_security)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    message,
    analysis.category,
    analysis.priority,
    analysis.isUrgent ? 1 : 0,
    analysis.confidence,
    JSON.stringify(analysis.keywords),
    JSON.stringify(analysis.signals),
    analysis.isSecurity ? 1 : 0
  );

  return getTicketById(result.lastInsertRowid);
}

function getTicketById(id) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);
  return row ? deserialize(row) : null;
}

function getRecentTickets(limit = 50, offset = 0) {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM tickets ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .all(limit, offset);
  return rows.map(deserialize);
}

function getTicketStats() {
  const db = getDb();
  const total = db.prepare("SELECT COUNT(*) as count FROM tickets").get().count;
  const byCategory = db
    .prepare("SELECT category, COUNT(*) as count FROM tickets GROUP BY category")
    .all();
  const byPriority = db
    .prepare("SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority")
    .all();
  const urgentCount = db
    .prepare("SELECT COUNT(*) as count FROM tickets WHERE is_urgent = 1")
    .get().count;
  return { total, byCategory, byPriority, urgentCount };
}

function deserialize(row) {
  return {
    ...row,
    keywords: JSON.parse(row.keywords || "[]"),
    signals: JSON.parse(row.signals || "[]"),
    isUrgent: row.is_urgent === 1,
    isSecurity: row.is_security === 1
  };
}

module.exports = { saveTicket, getTicketById, getRecentTickets, getTicketStats };
