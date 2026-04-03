// tests/analyzer.test.js — Unit tests for classification and priority logic

const {
  analyzeTicket,
  classifyCategory,
  detectUrgency,
  assignPriority,
  computeConfidence
} = require("../src/services/analyzer");

describe("classifyCategory", () => {
  test("classifies billing ticket correctly", () => {
    const { category } = classifyCategory("I was overcharged on my invoice last month");
    expect(category).toBe("Billing");
  });

  test("classifies technical ticket correctly", () => {
    const { category } = classifyCategory("The app keeps crashing when I try to login");
    expect(category).toBe("Technical");
  });

  test("classifies account ticket correctly", () => {
    const { category } = classifyCategory("I cannot reset my password and my account is locked");
    expect(category).toBe("Account");
  });

  test("classifies feature request correctly", () => {
    const { category } = classifyCategory("Would be nice if you could add dark mode as a feature");
    expect(category).toBe("Feature Request");
  });

  test("classifies unknown ticket as Other", () => {
    const { category } = classifyCategory("Hello there how are you today");
    expect(category).toBe("Other");
  });

  test("custom security rule: classifies hack/breach as Security", () => {
    const { category, isSecurity } = classifyCategory("I think my account has been hacked and compromised");
    expect(category).toBe("Security");
    expect(isSecurity).toBe(true);
  });

  test("custom security rule: classifies phishing as Security", () => {
    const { category } = classifyCategory("I received a phishing email and my data may be leaked");
    expect(category).toBe("Security");
  });
});

describe("detectUrgency", () => {
  test("detects urgency keywords", () => {
    const { isUrgent } = detectUrgency("This is urgent, our production server is down!");
    expect(isUrgent).toBe(true);
  });

  test("no urgency for low-priority ticket", () => {
    const { isUrgent } = detectUrgency("Would be nice to have a dark mode someday");
    expect(isUrgent).toBe(false);
  });

  test("detects asap as urgent", () => {
    const { isUrgent } = detectUrgency("Please fix this asap, it's affecting our team");
    expect(isUrgent).toBe(true);
  });
});

describe("assignPriority", () => {
  test("assigns P0 for production down", () => {
    const { priority } = assignPriority("our production site is completely down", true, false);
    expect(priority).toBe("P0");
  });

  test("assigns P0 for security (custom rule)", () => {
    const { priority } = assignPriority("we have a security breach", false, true);
    expect(priority).toBe("P0");
  });

  test("urgency bumps priority up", () => {
    const { priority: base } = assignPriority("the login page is slow", false, false);
    const { priority: bumped } = assignPriority("the login page is slow", true, false);
    const levels = ["P3", "P2", "P1", "P0"];
    expect(levels.indexOf(bumped)).toBeGreaterThanOrEqual(levels.indexOf(base));
  });

  test("assigns P3 for feature request type signals", () => {
    const { priority } = assignPriority("no rush, just a minor suggestion for improvement", false, false);
    expect(priority).toBe("P3");
  });
});

describe("computeConfidence", () => {
  test("returns low confidence for empty signal matches", () => {
    const score = computeConfidence("hello world today", [], false);
    expect(score).toBeLessThan(0.5);
  });

  test("returns high confidence for security ticket", () => {
    const score = computeConfidence("breach occurred", ["breach"], true);
    expect(score).toBeGreaterThan(0.85);
  });

  test("confidence is between 0 and 1", () => {
    const score = computeConfidence("urgent production outage crash error failure", ["urgent", "outage", "crash", "error"], false);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe("analyzeTicket (integration)", () => {
  test("full analysis of a billing ticket", () => {
    const result = analyzeTicket("I was charged twice for my subscription this month, please issue a refund");
    expect(result.category).toBe("Billing");
    expect(result.priority).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(Array.isArray(result.keywords)).toBe(true);
  });

  test("full analysis of security breach", () => {
    const result = analyzeTicket("My account was hacked and someone stole my data, security breach!");
    expect(result.category).toBe("Security");
    expect(result.priority).toBe("P0");
    expect(result.isSecurity).toBe(true);
  });

  test("throws on invalid input", () => {
    expect(() => analyzeTicket(null)).toThrow();
    expect(() => analyzeTicket("")).toThrow();
  });
});
