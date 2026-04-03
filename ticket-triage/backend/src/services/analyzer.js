// services/analyzer.js — Local NLP / heuristic-based classification engine

const rules = require("../config/rules");

/**
 * Normalize text for matching: lowercase, collapse whitespace
 */
function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Count how many keywords from a list appear in the text.
 * Returns { count, matched: [] }
 */
function matchKeywords(text, keywords) {
  const norm = normalize(text);
  const matched = keywords.filter((kw) => norm.includes(kw.toLowerCase()));
  return { count: matched.length, matched };
}

/**
 * Classify the ticket into a category.
 * Returns { category, matchedKeywords, allMatches }
 */
function classifyCategory(text) {
  // Check security rule first (custom rule)
  if (rules.securityRule.enabled) {
    const secMatch = matchKeywords(text, rules.securityRule.keywords);
    if (secMatch.count > 0) {
      return {
        category: rules.securityRule.forceCategory,
        matchedKeywords: secMatch.matched,
        allMatches: { Security: secMatch.count },
        isSecurity: true
      };
    }
  }

  const scores = {};
  const allMatchedKeywords = {};

  for (const [category, config] of Object.entries(rules.categories)) {
    const { count, matched } = matchKeywords(text, config.keywords);
    scores[category] = count * config.weight;
    allMatchedKeywords[category] = matched;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topCategory = sorted[0][1] > 0 ? sorted[0][0] : "Other";
  const topKeywords = topCategory !== "Other" ? allMatchedKeywords[topCategory] : [];

  return {
    category: topCategory,
    matchedKeywords: topKeywords,
    allMatches: scores,
    isSecurity: false
  };
}

/**
 * Detect urgency from the ticket text.
 */
function detectUrgency(text) {
  const { count, matched } = matchKeywords(text, rules.urgencyKeywords);
  return { isUrgent: count > 0, urgencySignals: matched };
}

/**
 * Assign priority based on signal keywords and urgency.
 */
function assignPriority(text, isUrgent, isSecurity) {
  if (isSecurity) return { priority: "P0", prioritySignals: ["security-rule"] };

  let highestScore = 0;
  let assignedPriority = "P3";
  const signals = [];

  for (const [priority, config] of Object.entries(rules.prioritySignals)) {
    const { count, matched } = matchKeywords(text, config.keywords);
    if (count > 0 && config.score > highestScore) {
      highestScore = config.score;
      assignedPriority = priority;
      signals.push(...matched);
    }
  }

  // Urgency bumps priority up by one level if not already P0
  if (isUrgent && assignedPriority !== "P0") {
    const levels = ["P3", "P2", "P1", "P0"];
    const currentIdx = levels.indexOf(assignedPriority);
    if (currentIdx < levels.length - 1) {
      assignedPriority = levels[currentIdx + 1];
    }
  }

  return { priority: assignedPriority, prioritySignals: [...new Set(signals)] };
}

/**
 * Compute a confidence score 0.0 – 1.0 based on keyword density.
 */
function computeConfidence(text, matchedKeywords, isSecurity) {
  if (isSecurity) {
    return Math.min(0.95, 0.75 + rules.securityRule.confidenceBonus);
  }

  const wordCount = normalize(text).split(" ").length;
  const matchCount = matchedKeywords.length;

  if (matchCount === 0) return 0.1;

  // Base: match ratio, capped; bonus for more matches
  const ratio = Math.min(matchCount / Math.max(wordCount * 0.1, 1), 1);
  const bonus = Math.min(matchCount * 0.05, 0.3);
  const raw = 0.4 + ratio * 0.3 + bonus;
  return Math.min(Math.round(raw * 100) / 100, 0.99);
}

/**
 * Extract the most informative keywords from the ticket for display.
 * Returns up to 8 unique tokens that are meaningful (length > 3, not stop words).
 */
function extractKeywords(text, matchedKeywords) {
  const stopWords = new Set([
    "the", "and", "for", "are", "but", "not", "you", "all", "can",
    "have", "her", "was", "one", "our", "out", "day", "get", "has",
    "him", "his", "how", "its", "may", "new", "now", "old", "see",
    "two", "way", "who", "boy", "did", "she", "too", "use", "been",
    "from", "into", "just", "like", "more", "over", "some", "than",
    "that", "them", "then", "they", "this", "time", "when", "will",
    "with", "your", "also", "each", "even", "find", "give", "here",
    "most", "need", "only", "very", "well", "were"
  ]);

  // Start with matched rule keywords (already relevant)
  const seen = new Set();
  const result = [];

  for (const kw of matchedKeywords) {
    const clean = kw.toLowerCase().trim();
    if (!seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
  }

  // Add high-value words from the raw text
  const words = normalize(text)
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 3 && !stopWords.has(w));

  for (const word of words) {
    if (!seen.has(word) && result.length < 8) {
      seen.add(word);
      result.push(word);
    }
  }

  return result.slice(0, 8);
}

/**
 * Main analyze function — entry point for the service layer.
 */
function analyzeTicket(message) {
  if (!message || typeof message !== "string") {
    throw new Error("Invalid message input");
  }

  const text = message.trim();

  const { category, matchedKeywords, isSecurity } = classifyCategory(text);
  const { isUrgent, urgencySignals } = detectUrgency(text);
  const { priority, prioritySignals } = assignPriority(text, isUrgent, isSecurity);
  const confidence = computeConfidence(text, matchedKeywords, isSecurity);
  const keywords = extractKeywords(text, matchedKeywords);

  const signals = [
    ...new Set([
      ...urgencySignals,
      ...prioritySignals,
      ...(isSecurity ? ["⚠ security-escalation"] : [])
    ])
  ].slice(0, 10);

  return {
    category,
    priority,
    isUrgent,
    confidence,
    keywords,
    signals,
    isSecurity
  };
}

module.exports = { analyzeTicket, classifyCategory, detectUrgency, assignPriority, computeConfidence };
