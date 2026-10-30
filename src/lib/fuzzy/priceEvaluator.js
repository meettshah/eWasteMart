// =====================================================================
// Fuzzy Logic Bid Fairness Evaluator
// Subject: Soft Computing (Subject 2A)
// 
// Academic Concepts Demonstrated:
//   - Fuzzy sets and membership functions (trapezoidal, triangular)
//   - Mamdani Fuzzy Inference System (FIS) with min-clipping
//   - Max-aggregation across rule antecedents
//   - Defuzzification via Centroid method (Center of Gravity / COG)
//   - Real database transaction grounding
//
// References:
//   - Zadeh, L.A. (1965). Fuzzy sets. Information and Control, 8(3), 338-353.
//   - Mamdani, E.H. (1977). Application of fuzzy logic to approximate reasoning.
//     IEEE Transactions on Computers, C-26(12), 1182-1191.
// =====================================================================

// -------------------------------------------------------------------
// STEP 1: Define Fuzzy Membership Functions
// Each function returns a degree of membership in [0, 1]
// -------------------------------------------------------------------

/**
 * Trapezoidal membership function.
 * Returns 1 for values between b and c, ramps linearly on edges.
 */
function trapezoid(x, a, b, c, d) {
  if (x >= b && x <= c) return 1;
  if (a === b && x <= b) return 1;
  if (c === d && x >= c) return 1;
  if (x <= a || x >= d) return 0;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
}

/**
 * Triangular membership function.
 * Returns 1 at peak m, ramps down on both sides.
 */
function triangle(x, a, m, b) {
  if (x === m) return 1;
  if (x <= a || x >= b) return 0;
  if (x > a && x < m) return (x - a) / (m - a);
  if (x > m && x < b) return (b - x) / (b - m);
  return 0;
}

// -------------------------------------------------------------------
// STEP 2: Linguistic Variables & Fuzzy Membership Sets
// -------------------------------------------------------------------

/**
 * Input Variable 1: Price Ratio (bid_amount / asking_price)
 * Range: [0, 2.5]
 * Sets: low, fair, high
 */
export function priceRatioMemberships(ratio) {
  const r = Math.max(0, ratio);
  return {
    low:  trapezoid(r, 0.0, 0.0, 0.55, 0.80),
    fair: triangle(r,  0.60, 0.95, 1.40),
    high: trapezoid(r, 1.20, 1.50, 2.50, 2.50),
  };
}

/**
 * Input Variable 2: Condition Score
 * scrap=0.1, mixed=0.4, repairable=0.7, working=1.0
 * Sets: poor, moderate, good
 */
export function conditionMemberships(condScore) {
  const c = Math.max(0, Math.min(1, condScore));
  return {
    poor:     trapezoid(c, 0.0, 0.0, 0.15, 0.50),
    moderate: triangle(c,  0.25, 0.50, 0.75),
    good:     trapezoid(c, 0.60, 0.85, 1.0, 1.0),
  };
}

/**
 * Input Variable 3: Quantity Score (log-normalized to [0,1])
 * small=1-5 items, medium=6-50, bulk=50+
 * Sets: small, medium, bulk
 */
export function quantityMemberships(qty) {
  const logQty = Math.log10(Math.max(Number(qty) || 1, 1));
  const norm = Math.min(logQty / 3, 1);
  return {
    small:  trapezoid(norm, 0.0, 0.0, 0.15, 0.35),
    medium: triangle(norm,  0.25, 0.50, 0.75),
    bulk:   trapezoid(norm, 0.60, 0.80, 1.0, 1.0),
  };
}

// -------------------------------------------------------------------
// STEP 3: Defuzzification via Centroid Method (Center of Gravity)
// -------------------------------------------------------------------

function defuzzifyCentroid(rules) {
  const resolution = 101; // Discrete points across universe [0, 100]
  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x < resolution; x++) {
    // Output membership functions for fairness:
    const muUnfair     = trapezoid(x, 0,  0,  25, 45);
    const muBorderline = triangle(x,  30, 55, 75);
    const muFair       = trapezoid(x, 60, 78, 100, 100);

    // Mamdani min-clipping and max-aggregation
    let maxClipped = 0;
    for (const rule of rules) {
      if (rule.strength <= 0) continue;
      let mu = 0;
      if (rule.outputSet === "unfair") mu = muUnfair;
      else if (rule.outputSet === "borderline") mu = muBorderline;
      else mu = muFair;

      const clipped = Math.min(rule.strength, mu);
      if (clipped > maxClipped) {
        maxClipped = clipped;
      }
    }

    numerator += x * maxClipped;
    denominator += maxClipped;
  }

  return denominator === 0 ? 50 : numerator / denominator;
}

// -------------------------------------------------------------------
// STEP 4: Rule Base Construction & Normalization
// -------------------------------------------------------------------

export const CONDITION_SCORES = {
  working:    1.0,
  repairable: 0.7,
  mixed:      0.4,
  scrap:      0.1,
};

function parseInputs(bidArg, listingArg, conditionArg, quantityArg) {
  let bidAmount = 0;
  let askingPrice = 0;
  let condition = "mixed";
  let quantity = 1;

  if (typeof bidArg === "object" && bidArg !== null) {
    bidAmount = Number(bidArg.amount) || 0;
  } else {
    bidAmount = Number(bidArg) || 0;
  }

  if (typeof listingArg === "object" && listingArg !== null) {
    askingPrice = Number(listingArg.askingPrice) || 0;
    if (listingArg.condition) condition = listingArg.condition;
    if (listingArg.quantity !== undefined) quantity = Number(listingArg.quantity) || 1;
  } else {
    askingPrice = Number(listingArg) || 0;
  }

  if (conditionArg !== undefined && conditionArg !== null) {
    condition = conditionArg;
  }
  if (quantityArg !== undefined && quantityArg !== null) {
    quantity = Number(quantityArg) || quantity;
  }

  let condScore = 0.4;
  if (typeof condition === "number") {
    condScore = Math.max(0, Math.min(1, condition));
  } else if (typeof condition === "string") {
    const key = condition.toLowerCase().trim();
    condScore = CONDITION_SCORES[key] ?? 0.4;
  }

  const ratio = askingPrice > 0 ? bidAmount / askingPrice : 1.0;

  return {
    bidAmount,
    askingPrice,
    condition: typeof condition === "string" ? condition : (condScore <= 0.25 ? "scrap" : condScore <= 0.55 ? "mixed" : condScore <= 0.85 ? "repairable" : "working"),
    condScore,
    quantity: Math.max(1, quantity),
    ratio,
  };
}

function buildMamdaniRules(pR, cR, qR) {
  return [
    // Low Price Ratio Rules
    { id: 1, text: "IF Price is LOW AND Condition is GOOD AND Qty is SMALL THEN UNFAIR", outputSet: "unfair", strength: Math.min(pR.low, cR.good, qR.small) },
    { id: 2, text: "IF Price is LOW AND Condition is GOOD AND Qty is MEDIUM THEN UNFAIR", outputSet: "unfair", strength: Math.min(pR.low, cR.good, qR.medium) },
    { id: 3, text: "IF Price is LOW AND Condition is GOOD AND Qty is BULK THEN UNFAIR", outputSet: "unfair", strength: Math.min(pR.low, cR.good, qR.bulk) },
    { id: 4, text: "IF Price is LOW AND Condition is MODERATE AND Qty is SMALL THEN UNFAIR", outputSet: "unfair", strength: Math.min(pR.low, cR.moderate, qR.small) },
    { id: 5, text: "IF Price is LOW AND Condition is MODERATE AND Qty is MEDIUM THEN BORDERLINE", outputSet: "borderline", strength: Math.min(pR.low, cR.moderate, qR.medium) },
    { id: 6, text: "IF Price is LOW AND Condition is MODERATE AND Qty is BULK THEN BORDERLINE", outputSet: "borderline", strength: Math.min(pR.low, cR.moderate, qR.bulk) },
    { id: 7, text: "IF Price is LOW AND Condition is POOR (Scrap) AND Qty is SMALL THEN BORDERLINE", outputSet: "borderline", strength: Math.min(pR.low, cR.poor, qR.small) },
    { id: 8, text: "IF Price is LOW AND Condition is POOR (Scrap) AND Qty is MEDIUM THEN FAIR", outputSet: "fair", strength: Math.min(pR.low, cR.poor, qR.medium) },
    { id: 9, text: "IF Price is LOW AND Condition is POOR (Scrap) AND Qty is BULK THEN FAIR", outputSet: "fair", strength: Math.min(pR.low, cR.poor, qR.bulk) },

    // Fair Price Ratio Rules
    { id: 10, text: "IF Price is FAIR AND Condition is GOOD AND Qty is SMALL THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.good, qR.small) },
    { id: 11, text: "IF Price is FAIR AND Condition is GOOD AND Qty is MEDIUM THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.good, qR.medium) },
    { id: 12, text: "IF Price is FAIR AND Condition is GOOD AND Qty is BULK THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.good, qR.bulk) },
    { id: 13, text: "IF Price is FAIR AND Condition is MODERATE AND Qty is SMALL THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.moderate, qR.small) },
    { id: 14, text: "IF Price is FAIR AND Condition is MODERATE AND Qty is MEDIUM THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.moderate, qR.medium) },
    { id: 15, text: "IF Price is FAIR AND Condition is MODERATE AND Qty is BULK THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.moderate, qR.bulk) },
    { id: 16, text: "IF Price is FAIR AND Condition is POOR AND Qty is SMALL THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.poor, qR.small) },
    { id: 17, text: "IF Price is FAIR AND Condition is POOR AND Qty is MEDIUM THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.poor, qR.medium) },
    { id: 18, text: "IF Price is FAIR AND Condition is POOR AND Qty is BULK THEN FAIR", outputSet: "fair", strength: Math.min(pR.fair, cR.poor, qR.bulk) },

    // High Price Ratio Rules (Overbidding / Premium)
    { id: 19, text: "IF Price is HIGH AND Condition is GOOD THEN FAIR", outputSet: "fair", strength: Math.min(pR.high, cR.good) },
    { id: 20, text: "IF Price is HIGH AND Condition is POOR THEN FAIR", outputSet: "fair", strength: Math.min(pR.high, cR.poor) },
  ];
}

/**
 * Evaluate bid fairness using Mamdani Fuzzy Inference System (FIS).
 * Resilient to either individual arguments or object parameters.
 */
export function evaluateBidFairness(bidArg, listingArg, conditionArg, quantityArg) {
  const inputs = parseInputs(bidArg, listingArg, conditionArg, quantityArg);
  const pR = priceRatioMemberships(inputs.ratio);
  const cR = conditionMemberships(inputs.condScore);
  const qR = quantityMemberships(inputs.quantity);

  const rules = buildMamdaniRules(pR, cR, qR);
  const score = defuzzifyCentroid(rules);
  const rounded = Math.round(score);

  let label, color;
  if (rounded >= 62) {
    label = "Fair Bid";
    color = "green";
  } else if (rounded >= 42) {
    label = "Borderline";
    color = "yellow";
  } else {
    label = "Low-ball";
    color = "red";
  }

  const explanation = `Mamdani Score: ${rounded}/100 | Price Ratio: ${inputs.ratio.toFixed(2)}x | Condition: ${inputs.condition} (${inputs.condScore}) | Qty: ${inputs.quantity}`;

  return {
    score: rounded,
    label,
    color,
    explanation,
  };
}

/**
 * Returns comprehensive evaluation data including fuzzy sets and active fired rules.
 */
export function getFuzzyDetails(bidArg, listingArg, conditionArg, quantityArg) {
  const inputs = parseInputs(bidArg, listingArg, conditionArg, quantityArg);
  const pR = priceRatioMemberships(inputs.ratio);
  const cR = conditionMemberships(inputs.condScore);
  const qR = quantityMemberships(inputs.quantity);

  const rules = buildMamdaniRules(pR, cR, qR);
  const score = defuzzifyCentroid(rules);
  const rounded = Math.round(score);

  let label, color;
  if (rounded >= 62) {
    label = "Fair Bid";
    color = "green";
  } else if (rounded >= 42) {
    label = "Borderline";
    color = "yellow";
  } else {
    label = "Low-ball";
    color = "red";
  }

  const activeRules = rules
    .filter((r) => r.strength > 0.01)
    .map((r) => ({
      id: r.id,
      text: r.text,
      strength: Number(r.strength.toFixed(3)),
      outputSet: r.outputSet,
    }));

  return {
    score: rounded,
    label,
    color,
    ratio: Number(inputs.ratio.toFixed(2)),
    crispInputs: {
      bidAmount: inputs.bidAmount,
      askingPrice: inputs.askingPrice,
      condition: inputs.condition,
      condScore: inputs.condScore,
      quantity: inputs.quantity,
      ratio: Number(inputs.ratio.toFixed(2)),
    },
    memberships: {
      priceRatio: {
        low: Number(pR.low.toFixed(3)),
        fair: Number(pR.fair.toFixed(3)),
        high: Number(pR.high.toFixed(3)),
      },
      condition: {
        poor: Number(cR.poor.toFixed(3)),
        moderate: Number(cR.moderate.toFixed(3)),
        good: Number(cR.good.toFixed(3)),
      },
      quantity: {
        small: Number(qR.small.toFixed(3)),
        medium: Number(qR.medium.toFixed(3)),
        bulk: Number(qR.bulk.toFixed(3)),
      },
    },
    activeRules,
    defuzzification: {
      method: "Centroid / Center of Gravity (COG)",
      crispValue: Number(score.toFixed(2)),
      ruleCount: 20,
      activeFiredCount: activeRules.length,
    },
    explanation: `Mamdani FIS: ${rounded}/100 (${label}) for ${inputs.ratio.toFixed(2)}x offer on ${inputs.condition} lot (${inputs.quantity} units)`,
  };
}
