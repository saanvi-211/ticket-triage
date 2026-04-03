// controllers/ticketsController.js — HTTP layer, separated from business logic

const { body, validationResult, query } = require("express-validator");
const { analyzeTicket } = require("../services/analyzer");
const { saveTicket, getRecentTickets, getTicketStats } = require("../services/ticketService");

// Validation rules for POST /tickets/analyze
const analyzeValidation = [
  body("message")
    .trim()
    .notEmpty().withMessage("Message is required")
    .isLength({ min: 5 }).withMessage("Message must be at least 5 characters")
    .isLength({ max: 5000 }).withMessage("Message must not exceed 5000 characters")
];

const listValidation = [
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1–100"),
  query("offset").optional().isInt({ min: 0 }).withMessage("Offset must be >= 0")
];

async function analyzeTicketHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { message } = req.body;
    const analysis = analyzeTicket(message);
    const ticket = saveTicket(message, analysis);

    return res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    console.error("Error analyzing ticket:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function listTicketsHandler(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const tickets = getRecentTickets(limit, offset);

    return res.status(200).json({
      success: true,
      data: tickets,
      meta: { limit, offset, count: tickets.length }
    });
  } catch (err) {
    console.error("Error listing tickets:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function statsHandler(req, res) {
  try {
    const stats = getTicketStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  analyzeValidation,
  listValidation,
  analyzeTicketHandler,
  listTicketsHandler,
  statsHandler
};
