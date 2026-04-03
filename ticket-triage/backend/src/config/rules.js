// config/rules.js — Config-driven keyword rules for classification

module.exports = {
  categories: {
    Billing: {
      keywords: [
        "invoice", "charge", "payment", "bill", "refund", "subscription",
        "price", "cost", "fee", "credit", "debit", "transaction", "overcharged",
        "receipt", "plan", "upgrade", "downgrade", "cancel subscription",
        "money", "paid", "purchase", "checkout", "discount", "coupon", "promo"
      ],
      weight: 1.0
    },
    Technical: {
      keywords: [
        "bug", "error", "crash", "broken", "not working", "down", "outage",
        "slow", "loading", "timeout", "failed", "failure", "issue", "problem",
        "500", "404", "exception", "lag", "freeze", "unresponsive", "glitch",
        "server", "api", "integration", "install", "update", "login", "cannot",
        "won't", "doesn't work", "keeps crashing", "page not loading", "blank screen"
      ],
      weight: 1.0
    },
    Account: {
      keywords: [
        "account", "password", "username", "email", "profile", "settings",
        "access", "locked", "blocked", "suspended", "banned", "sign in",
        "sign up", "register", "delete account", "close account", "two factor",
        "2fa", "verification", "reset", "change email", "permissions", "role"
      ],
      weight: 1.0
    },
    "Feature Request": {
      keywords: [
        "feature", "request", "suggestion", "would be nice", "please add",
        "can you add", "wish", "improve", "enhancement", "idea", "could you",
        "ability to", "support for", "missing", "lacks", "should have",
        "recommend", "propose", "consider", "roadmap", "future", "planned"
      ],
      weight: 1.0
    }
  },

  urgencyKeywords: [
    "urgent", "asap", "immediately", "emergency", "critical", "right now",
    "down", "outage", "broken", "cannot access", "blocked", "losing money",
    "production", "live site", "customers affected", "deadline", "today",
    "not working", "stopped working", "crash", "data loss", "breach", "hack"
  ],

  prioritySignals: {
    P0: {
      keywords: [
        "production down", "production site", "outage", "data loss", "breach", "hacked", "security breach",
        "all users affected", "site down", "service down", "critical failure",
        "losing data", "database down", "cannot login at all", "completely down"
      ],
      score: 4
    },
    P1: {
      keywords: [
        "urgent", "asap", "emergency", "customers affected", "revenue impact",
        "blocking", "major bug", "cannot use", "completely broken", "deadline"
      ],
      score: 3
    },
    P2: {
      keywords: [
        "slow", "intermittent", "sometimes", "occasionally", "degraded",
        "workaround", "partial", "some users"
      ],
      score: 2
    },
    P3: {
      keywords: [
        "minor", "small", "low priority", "when you get a chance", "no rush",
        "eventually", "nice to have", "suggestion", "feature request"
      ],
      score: 1
    }
  },

  // CUSTOM RULE: Security/Fraud escalation
  // Rationale: Security and fraud incidents pose existential risk to user data and
  // company reputation. Any mention of security, fraud, or unauthorized access
  // should immediately escalate to P0 with the 'Security' tag, bypassing normal
  // classification to ensure these are never missed.
  securityRule: {
    enabled: true,
    keywords: [
      "hack", "hacked", "breach", "security", "fraud", "stolen", "unauthorized",
      "phishing", "scam", "identity theft", "compromised", "suspicious activity",
      "data exposed", "leak", "leaked", "ransomware", "malware", "intrusion"
    ],
    forcePriority: "P0",
    forceCategory: "Security",
    confidenceBonus: 0.2
  }
};
