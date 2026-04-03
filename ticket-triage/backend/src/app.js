// app.js — Express application setup

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const {
  analyzeValidation,
  listValidation,
  analyzeTicketHandler,
  listTicketsHandler,
  statsHandler
} = require("./controllers/ticketsController");

const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging (skip in test)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.post("/tickets/analyze", analyzeValidation, analyzeTicketHandler);
app.get("/tickets", listValidation, listTicketsHandler);
app.get("/tickets/stats", statsHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

module.exports = app;
