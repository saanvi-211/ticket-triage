# TriageAI — AI-Powered Support Ticket Triage

A full-stack application that classifies and prioritizes support tickets using local NLP/heuristic logic — no external AI APIs.

---

## Quick Start

```bash
git clone <repo>
cd ticket-triage
docker-compose up --build
```

- **Frontend**: http://localhost  
- **Backend API**: http://localhost:3001  
- **Health check**: http://localhost:3001/health

---

## Architecture

```
ticket-triage/
├── backend/
│   ├── src/
│   │   ├── config/rules.js          # Config-driven keyword rules
│   │   ├── controllers/
│   │   │   └── ticketsController.js # HTTP layer, input validation
│   │   ├── models/
│   │   │   └── database.js          # SQLite setup + schema
│   │   ├── services/
│   │   │   ├── analyzer.js          # Core NLP/classification engine
│   │   │   └── ticketService.js     # DB persistence logic
│   │   ├── app.js                   # Express app setup
│   │   └── index.js                 # Server entry point
│   └── tests/
│       └── analyzer.test.js         # Unit tests
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TicketForm.js        # Submission form with examples
│   │   │   ├── ResultPanel.js       # Analysis results display
│   │   │   ├── TicketTable.js       # Historical ticket log
│   │   │   └── StatsBar.js         # Aggregate statistics
│   │   ├── utils/api.js             # API client
│   │   ├── App.js                   # Root component
│   │   └── index.css               # Design system & global styles
│   └── nginx.conf                   # Reverse proxy config
│
└── docker-compose.yml
```

---

## API Reference

### `POST /tickets/analyze`

Analyze a new support ticket.

**Request body:**
```json
{ "message": "My account is locked and I can't reset my password" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "My account is locked and I can't reset my password",
    "category": "Account",
    "priority": "P1",
    "isUrgent": false,
    "confidence": 0.72,
    "keywords": ["account", "locked", "reset", "password"],
    "signals": ["blocked"],
    "isSecurity": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### `GET /tickets?limit=50&offset=0`

List recent tickets (latest first).

### `GET /tickets/stats`

Aggregate statistics: totals, by category, by priority, urgent count.

---

## Classification Logic

### Categories
Tickets are classified using keyword matching across 5 categories:
- **Billing** — invoice, charge, refund, subscription, payment, etc.
- **Technical** — bug, crash, error, outage, timeout, broken, etc.
- **Account** — password, locked, suspended, 2FA, profile, etc.
- **Feature Request** — suggestion, roadmap, would be nice, please add, etc.
- **Other** — no significant matches
- **Security** — *(custom rule, see below)*

The category with the highest keyword match score wins. All rules are config-driven in `src/config/rules.js`.

### Priority Assignment
```
P0 — Critical   production down, data loss, all users affected
P1 — High       urgent, asap, customers affected, major bug
P2 — Medium     slow, intermittent, some users affected
P3 — Low        minor, feature request, no rush
```

Urgency detection runs separately. If a ticket is flagged **urgent**, its priority is bumped up one level (e.g., P2 → P1), unless already P0.

### Confidence Score
Confidence (0.0–1.0) is computed from keyword match density relative to ticket length. More matched keywords = higher confidence. Security tickets receive a +0.2 bonus due to the high specificity of security vocabulary.

---

## Custom Rule: Security Escalation ⚠

**Rule:** Any ticket containing security-related terms (hack, breach, phishing, fraud, unauthorized, compromised, data exposed, etc.) is **immediately classified as Security with P0 priority**, bypassing normal category scoring.

**Rationale:** Security and fraud incidents pose existential risk — to user data, regulatory compliance, and company reputation. A false negative (missing a breach report) is far more costly than a false positive. This rule ensures security tickets are **never** routed to a general queue or deprioritized by low keyword match scores. It also demonstrates the customization twist: the Security category doesn't exist in the normal weighted classification; it's a first-pass override.

**Demo:** Submit a ticket like:
> *"I think my account has been hacked and someone accessed my data without authorization"*

You'll see: `SECURITY ESCALATION — CUSTOM RULE TRIGGERED`, category `Security`, priority `P0`.

---

## Running Tests

```bash
cd backend
npm install
npm test
```

Tests cover:
- Category classification (all 5 categories + Security)
- Urgency detection
- Priority assignment (including security rule & urgency bump)
- Confidence score bounds
- Full integration analysis
- Edge cases (null, empty, unknown input)

---

## Design Decisions & Reflection

### Data Model
SQLite was chosen for simplicity and zero-infrastructure overhead. The `tickets` table stores the raw message plus all computed fields (category, priority, confidence, etc.) as flat columns. Keywords and signals are JSON-serialized arrays — a pragmatic trade-off over a normalized keyword table, which would add joins and complexity with no real query-time benefit for this scale.

### API Structure
Three focused endpoints: analyze (write), list (read), stats (aggregate). Input validation is handled at the controller layer using `express-validator` before any business logic runs. The controller, service, and analyzer are deliberately separated: the controller knows HTTP, the service knows the database, the analyzer knows NLP.

### Classification Approach
Pure keyword matching was chosen over ML/statistical models to satisfy the no-external-API constraint while remaining fully transparent and maintainable. The rules are entirely config-driven (`config/rules.js`) — adding a new category or adjusting keywords requires no code changes. Confidence scoring reflects match density rather than model probability, which is honest about the approach's limitations.

### Trade-offs & Limitations
- **No stemming/lemmatization**: "payment" and "payments" are treated as different tokens. A simple stemmer would improve recall.
- **No semantic understanding**: "the site is totally fine" scores similarly to "the site is not fine".
- **Keyword overlap**: A billing outage ticket with "down" may score as both Technical and Billing; the winner is the higher count, which may not always be correct.
- **Confidence is heuristic**: It reflects keyword density, not true probabilistic confidence.

### What I'd Improve With More Time
1. Add tokenization + stemming (e.g., Porter stemmer) for better recall
2. Implement negation detection ("not working" ≠ "working")
3. Add a lightweight TF-IDF model trained on labeled examples for smarter confidence
4. Pagination UI controls and search/filter on the ticket table
5. WebSocket/SSE for real-time ticket updates
6. Add PUT /tickets/:id for manual re-classification (human-in-the-loop)
7. Rate limiting per IP on the analyze endpoint
8. Export to CSV feature

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Frontend | React 18 |
| Serving | Nginx (reverse proxy) |
| Containers | Docker, Docker Compose |
| Tests | Jest, Supertest |
| Validation | express-validator |
