// =====================================================================
// Fuzzy Logic Bid Fairness Evaluator
// Subject: Soft Computing
// 
// Academic Concepts Demonstrated:
//   - Fuzzy sets and membership functions (trapezoidal, triangular)
//   - Mamdani Fuzzy Inference System (FIS)
//   - Defuzzification via Centroid method (Center of Gravity)
//   - Multi-variable fuzzy rule base
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
 * @param {number} x - crisp input value
 * @param {number} a - left foot
 * @param {number} b - left shoulder
 * @param {number} c - right shoulder
 * @param {number} d - right foot
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
 * @param {number} x - crisp input value
 * @param {number} a - left foot
 * @param {number} m - peak (apex)
 * @param {number} b - right foot
 */
function triangle(x, a, m, b) {
  if (x === m) return 1;
  if (x <= a || x >= b) return 0;
  if (x > a && x < m) return (x - a) / (m - a);
  if (x > m && x < b) return (b - x) / (b - m);
  return 0;
}

// -------------------------------------------------------------------
// STEP 2: Define Linguistic Variables and their Fuzzy Sets
// -------------------------------------------------------------------

/**
 * Input Variable 1: Price Ratio (bid_amount / asking_price)
 * Range: [0, 2.5]
 * Fuzzy sets: low, fair, high
 */
function priceRatioMemberships(ratio) {
  return {
    low:  trapezoid(ratio, 0.0, 0.0, 0.55, 0.80),
    fair: triangle(ratio,    0.60, 0.95, 1.40),
    high: trapezoid(ratio, 1.20, 1.50, 2.50, 2.50),
  };
}

/**
 * Input Variable 2: Condition Score (numeric encoding)
 * scrap=0.1, mixed=0.4, repairable=0.7, working=1.0
 * Fuzzy sets: poor, moderate, good
 */
function conditionMemberships(condScore) {
  return {
    poor:     trapezoid(condScore, 0.0, 0.0, 0.15, 0.50),
    moderate: triangle(condScore,  0.25, 0.50, 0.75),
    good:     trapezoid(condScore, 0.60, 0.85, 1.0, 1.0),
  };
}

/**
 * Input Variable 3: Quantity Score (log-normalized to [0,1])
 * small=1-5 items, medium=6-50, bulk=50+
 * Fuzzy sets: small, medium, bulk
 */
function quantityMemberships(qty) {
  const logQty = Math.log10(Math.max(qty, 1));   // 0 to ~3 for 1–1000
  const norm = Math.min(logQty / 3, 1);           // normalize to [0,1]
  return {
    small:  trapezoid(norm, 0.0, 0.0, 0.15, 0.35),
    medium: triangle(norm,   0.25, 0.50, 0.75),
    bulk:   trapezoid(norm, 0.60, 0.80, 1.0, 1.0),
  };
}

// -------------------------------------------------------------------
// STEP 3: Fuzzy Rule Base (Mamdani-style IF-THEN rules)
// Output linguistic variable: Fairness Score [0, 100]
// Fuzzy output sets: unfair (0-40), borderline (30-70), fair (60-100)
// -------------------------------------------------------------------

/**
 * Defuzzification: Centroid method (Center of Gravity)
 * Discretizes output universe [0,100] and computes weighted centroid.
 * @param {Array} rules - [{outputSet, firingStrength}]
 */
function defuzzify(rules) {
  // Output universe: 0 to 100
  const resolution = 101;
  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x < resolution; x++) {
    // Output membership functions
    const muUnfair      = trapezoid(x, 0,  0,  25, 45);
    const muBorderline  = triangle(x,  30, 55, 75);
    const muFair        = trapezoid(x, 60, 78, 100, 100);

    // Aggregate all rules using max-min composition
    const aggregated = Math.max(
      ...rules.map(({ outputSet, strength }) => {
        let mu;
        if (outputSet === "unfair")     mu = muUnfair;
        else if (outputSet === "borderline") mu = muBorderline;
        else                             mu = muFair;
        return Math.min(strength, mu);  // min = clipping (Mamdani)
      })
    );

    numerator   += x * aggregated;
    denominator += aggregated;
  }

  return denominator === 0 ? 50 : numerator / denominator;
}

// -------------------------------------------------------------------
// STEP 4: Main Evaluator — Fuzzify → Infer → Defuzzify
// -------------------------------------------------------------------

const CONDITION_SCORES = {
  working:    1.0,
  repairable: 0.7,
  mixed:      0.4,
  scrap:      0.1,
};

/**
 * Evaluate bid fairness using Fuzzy Logic.
 * 
 * @param {number} bidAmount      - The bid amount in INR
 * @param {number} askingPrice    - The listing's asking price in INR
 * @param {string} condition      - "working" | "repairable" | "mixed" | "scrap"
 * @param {number} quantity       - Number of items / kg / tons
 * @returns {{ score: number, label: string, color: string, explanation: string }}
 */
export function evaluateBidFairness(bidAmount, askingPrice, condition, quantity) {
  // If no asking price, ratio defaults to 1.0 (neutral)
  const ratio = askingPrice > 0 ? bidAmount / askingPrice : 1.0;
  const condScore = CONDITION_SCORES[condition] ?? 0.4;
  const qty = Number(quantity) || 1;

  // Fuzzify inputs
  const pR  = priceRatioMemberships(ratio);
  const cR  = conditionMemberships(condScore);
  const qR  = quantityMemberships(qty);

  // Fuzzy Rule Base (20 rules)
  // Rules follow pattern: IF price IS X AND condition IS Y AND quantity IS Z THEN fairness IS F
  const rules = [
    // --- Clearly unfair: low price regardless of condition ---
    { outputSet: "unfair",     strength: Math.min(pR.low,  cR.good,     qR.small)  },
    { outputSet: "unfair",     strength: Math.min(pR.low,  cR.good,     qR.medium) },
    { outputSet: "unfair",     strength: Math.min(pR.low,  cR.good,     qR.bulk)   },
    { outputSet: "unfair",     strength: Math.min(pR.low,  cR.moderate, qR.small)  },
    { outputSet: "borderline", strength: Math.min(pR.low,  cR.moderate, qR.medium) },
    { outputSet: "borderline", strength: Math.min(pR.low,  cR.moderate, qR.bulk)   },
    { outputSet: "borderline", strength: Math.min(pR.low,  cR.poor,     qR.small)  },
    { outputSet: "fair",       strength: Math.min(pR.low,  cR.poor,     qR.medium) },
    { outputSet: "fair",       strength: Math.min(pR.low,  cR.poor,     qR.bulk)   },

    // --- Fair price band ---
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.good,     qR.small)  },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.good,     qR.medium) },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.good,     qR.bulk)   },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.moderate, qR.small)  },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.moderate, qR.medium) },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.moderate, qR.bulk)   },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.poor,     qR.small)  },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.poor,     qR.medium) },
    { outputSet: "fair",       strength: Math.min(pR.fair, cR.poor,     qR.bulk)   },

    // --- High price (overbidding is also fine/very fair) ---
    { outputSet: "fair",       strength: Math.min(pR.high, cR.good,     qR.small)  },
    { outputSet: "fair",       strength: Math.min(pR.high, cR.poor,     qR.bulk)   },
  ];

  // Defuzzify to get crisp fairness score [0, 100]
  const score = defuzzify(rules);
  const rounded = Math.round(score);

  // Linguistic label and UI color
  let label, color;
  if (rounded >= 62)      { label = "Fair Bid";    color = "green";  }
  else if (rounded >= 42) { label = "Borderline";  color = "yellow"; }
  else                    { label = "Low-ball";     color = "red";    }

  const explanation = `Fuzzy Score: ${rounded}/100 | Price ratio: ${ratio.toFixed(2)}x | Condition: ${condition} | Qty: ${qty}`;

  return { score: rounded, label, color, explanation };
}

export function getFuzzyDetails(bidAmount, askingPrice, condition, quantity) {
  const base = evaluateBidFairness(bidAmount, askingPrice, condition, quantity);
  const ratio = askingPrice > 0 ? bidAmount / askingPrice : 1.0;
  const condScore = CONDITION_SCORES[condition] ?? 0.4;
  const qty = Number(quantity) || 1;
  const pR = priceRatioMemberships(ratio);
  const cR = conditionMemberships(condScore);
  const qR = quantityMemberships(qty);

  return {
    ...base,
    ratio: Number(ratio.toFixed(2)),
    memberships: {
      priceRatio: { low: Number(pR.low.toFixed(3)), fair: Number(pR.fair.toFixed(3)), high: Number(pR.high.toFixed(3)) },
      condition: { poor: Number(cR.poor.toFixed(3)), moderate: Number(cR.moderate.toFixed(3)), good: Number(cR.good.toFixed(3)) },
      quantity: { small: Number(qR.small.toFixed(3)), medium: Number(qR.medium.toFixed(3)), bulk: Number(qR.bulk.toFixed(3)) },
    }
  };
}
