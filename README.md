
# TriageAI — AI-Powered Support Ticket Triage

A full-stack application that classifies and prioritizes support tickets using local NLP/heuristic logic — no external AI APIs.

---

## Folder Structure

```
ticket-triage/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── index.js
│       ├── app.js
│       ├── config/
│       │   └── rules.js
│       ├── controllers/
│       │   └── ticketsController.js
│       ├── models/
│       │   └── database.js
│       └── services/
│           ├── analyzer.js
│           └── ticketService.js
│   └── tests/
│       └── analyzer.test.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── App.css
        ├── index.js
        ├── index.css
        ├── utils/
        │   └── api.js
        └── components/
            ├── TicketForm.js
            ├── ResultPanel.js
            ├── TicketTable.js
            └── StatsBar.js
```

---

## How to Run (Docker)

### Prerequisites
- Docker Desktop installed and running

### Steps

```bash
cd ticket-triage
docker-compose up --build
```

- Frontend UI: http://localhost
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

First build takes 3–5 minutes. After that use `docker-compose up` to start instantly.
To stop: press Ctrl + C in the terminal.

---

## How to Run Tests

```bash
cd backend
npm install
npm test
```

---

## API Reference

### POST /tickets/analyze

Request:
```json
{ "message": "My payment failed and I was charged twice" }
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": "Billing",
    "priority": "P1",
    "isUrgent": false,
    "confidence": 0.72,
    "keywords": ["payment", "charged", "failed"],
    "signals": ["charge"],
    "isSecurity": false
  }
}
```

### GET /tickets?limit=50&offset=0
List recent tickets, latest first.

### GET /tickets/stats
Aggregate stats by category, priority, and urgent count.

---

## Classification Logic

### Categories
- Billing — invoice, charge, refund, subscription, payment
- Technical — bug, crash, error, outage, timeout, broken
- Account — password, locked, suspended, 2FA, profile
- Feature Request — suggestion, roadmap, please add
- Other — no significant matches
- Security — custom rule (see below)

### Priority Levels
- P0 Critical — production down, data loss, all users affected
- P1 High — urgent, asap, customers affected, major bug
- P2 Medium — slow, intermittent, some users affected
- P3 Low — minor, feature request, no rush

If a ticket is flagged urgent, priority is bumped one level up (e.g. P2 to P1), unless already P0.

---

## Custom Rule: Security Escalation

Any ticket containing security-related terms (hack, breach, phishing, fraud, unauthorized, compromised, data exposed) is immediately classified as Security with P0 priority, bypassing all normal scoring.

Rationale: A missed security breach is far more costly than a false positive. This rule ensures security tickets are never deprioritized or routed to a general queue.

Demo: Submit this ticket:
"I think my account has been hacked and someone accessed my data without authorization"

Result: SECURITY ESCALATION — CUSTOM RULE TRIGGERED, category Security, priority P0.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Frontend | React 18 |
| Serving | Nginx |
| Containers | Docker, Docker Compose |
| Tests | Jest, Supertest |
| Validation | express-validator |

---

## Design Decisions & Reflection

### Data Model
SQLite was chosen for simplicity and zero-infrastructure overhead. The tickets table stores the raw message plus all computed fields as flat columns. Keywords and signals are stored as JSON arrays — practical for this scale without needing extra joins.

### API Structure
Three focused endpoints: analyze (write), list (read), stats (aggregate). Validation runs at the controller layer before any business logic. Controller, service, and analyzer are deliberately separated — controller knows HTTP, service knows the database, analyzer knows NLP.

### Classification Approach
Pure keyword matching satisfies the no-external-API constraint while staying transparent and maintainable. All rules are config-driven in config/rules.js — adding a new category needs no code changes.

### Trade-offs & Limitations
- No stemming: "payment" and "payments" are different tokens
- No negation detection: "not working" is not handled
- Keyword overlap: a billing outage may score both Billing and Technical
- Confidence is heuristic, not truly probabilistic

### What I Would Improve With More Time
1. Add stemming (Porter stemmer) for better recall
2. Implement negation detection
3. Add TF-IDF model for smarter confidence scoring
4. Pagination and search on the ticket history table
5. WebSocket support for real-time updates
6. Rate limiting per IP on the analyze endpoint
7. Export to CSV feature
