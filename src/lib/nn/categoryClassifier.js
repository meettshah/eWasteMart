// =====================================================================
// Feedforward Neural Network — E-Waste Category Classifier
// Subject: Soft Computing
//
// Academic Concepts Demonstrated:
//   - Multi-layer feedforward neural network (2 hidden layers)
//   - ReLU activation function for hidden layers
//   - Softmax activation for output (multi-class classification)
//   - Forward propagation
//   - Pre-trained weights (trained offline, embedded as JSON)
//   - Feature normalization (min-max scaling)
//
// Architecture:
//   Input:  5 features → [weight_kg, age_years, has_battery, has_screen, original_price_k]
//   Hidden1: 8 neurons (ReLU)
//   Hidden2: 6 neurons (ReLU)
//   Output: 7 neurons (Softmax) → one per e-waste category
//
// References:
//   - Rumelhart, D.E. et al. (1986). Learning representations by back-propagating errors.
//     Nature, 323, 533-536.
//   - LeCun, Y. et al. (1998). Efficient BackProp. Neural Networks: Tricks of the Trade.
// =====================================================================

// -------------------------------------------------------------------
// CATEGORIES (match the app's category list exactly)
// -------------------------------------------------------------------
export const CATEGORIES = [
  "Computers and peripherals",
  "Mobile and personal devices",
  "Televisions and displays",
  "Audio and video equipment",
  "Networking devices",
  "Batteries and chargers",
  "Mixed e-waste",
];

// -------------------------------------------------------------------
// PRE-TRAINED WEIGHTS
// These weights were derived analytically to encode domain knowledge:
// - Screens → TVs/displays/mobiles
// - Batteries → Battery category
// - High weight + no screen → computers/networking
// - Very low weight + battery → mobile devices
//
// In a real system, these would be trained via backpropagation on a
// labelled dataset. Here they encode expert heuristics as a
// demonstrable neural network forward pass.
// -------------------------------------------------------------------

// Input → Hidden Layer 1 (5 → 8)
const W1 = [
  // w_kg  age   bat   scr   price_k
  [ 0.8,  0.1, -0.3,  0.2,  0.5],   // neuron 0: heavy, expensive → computer
  [-0.4,  0.3,  0.9, -0.2, -0.3],   // neuron 1: battery focused
  [ 0.2, -0.1, -0.1,  0.9,  0.3],   // neuron 2: screen focused → TV/mobile
  [-0.6,  0.4,  0.3,  0.6, -0.4],   // neuron 3: light + screen → mobile
  [ 0.7, -0.2, -0.5, -0.3,  0.7],   // neuron 4: heavy + expensive → computer
  [-0.2,  0.5,  0.2, -0.4, -0.2],   // neuron 5: older devices
  [ 0.3,  0.1,  0.4,  0.5, -0.1],   // neuron 6: screen + battery → mobile/tablet
  [-0.1, -0.3, -0.4, -0.5,  0.8],   // neuron 7: expensive, no extras → enterprise
];

const B1 = [0.1, 0.2, -0.1, 0.15, 0.05, -0.2, 0.1, -0.05];

// Hidden Layer 1 → Hidden Layer 2 (8 → 6)
const W2 = [
  [ 0.7, -0.3,  0.2, -0.4,  0.6, -0.2,  0.3,  0.5],  // → computers signal
  [-0.4,  0.8, -0.2,  0.3, -0.1,  0.5, -0.3,  0.2],  // → battery/mobile signal
  [ 0.2,  0.1,  0.7, -0.5,  0.3, -0.1,  0.6, -0.2],  // → screen devices signal
  [-0.3, -0.2, -0.4,  0.7,  0.2,  0.4, -0.5,  0.3],  // → networking signal
  [ 0.5,  0.3, -0.1, -0.2,  0.7, -0.3,  0.2, -0.4],  // → audio/AV signal
  [-0.1,  0.4,  0.3,  0.5, -0.2,  0.6, -0.1,  0.7],  // → mixed signal
];

const B2 = [0.05, 0.1, -0.05, 0.1, -0.1, 0.15];

// Hidden Layer 2 → Output (6 → 7)
// 7 rows (one per output class), 6 columns (weights for h2[0..5])
const W3 = [
  // h2[0]=comp, h2[1]=mobile/batt, h2[2]=screens, h2[3]=network, h2[4]=audio, h2[5]=mixed
  [ 0.9, -0.2,  0.1,  0.3, -0.1, -0.1],  // Class 0: Computers and peripherals
  [-0.2,  0.8,  0.4, -0.2, -0.2,  0.1],  // Class 1: Mobile and personal devices
  [-0.1, -0.2,  0.9, -0.3,  0.1,  0.1],  // Class 2: Televisions and displays
  [-0.2, -0.1, -0.2, -0.1,  0.9,  0.2],  // Class 3: Audio and video equipment
  [ 0.3, -0.2, -0.3,  0.8, -0.1,  0.1],  // Class 4: Networking devices
  [-0.3,  0.8, -0.2, -0.2, -0.1,  0.1],  // Class 5: Batteries and chargers
  [-0.1, -0.1,  0.1,  0.1,  0.1,  0.8],  // Class 6: Mixed e-waste
];

const B3 = [0.1, 0.1, 0.05, 0.05, 0.1, 0.1, 0.1];

// -------------------------------------------------------------------
// ACTIVATION FUNCTIONS
// -------------------------------------------------------------------

/** ReLU: f(x) = max(0, x) */
function relu(vec) { return vec.map((x) => Math.max(0, x)); }

/** Softmax: converts logits to probabilities summing to 1 */
function softmax(vec) {
  const max = Math.max(...vec.map((v) => (isNaN(v) ? 0 : v)));
  const exps = vec.map((x) => Math.exp((isNaN(x) ? 0 : x) - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

// -------------------------------------------------------------------
// MATRIX-VECTOR MULTIPLICATION HELPER
// -------------------------------------------------------------------
function matVecMul(matrix, vec, bias) {
  return matrix.map((row, i) =>
    bias[i] + row.reduce((sum, w, j) => sum + w * (vec[j] ?? 0), 0)
  );
}

// -------------------------------------------------------------------
// FEATURE NORMALIZATION (Min-Max Scaling)
// Scales each feature to approximately [0, 1]
// -------------------------------------------------------------------
const FEATURE_RANGES = {
  weight_kg:       { min: 0,   max: 100  },
  age_years:       { min: 0,   max: 15   },
  has_battery:     { min: 0,   max: 1    },
  has_screen:      { min: 0,   max: 1    },
  original_price_k:{ min: 0,   max: 200  }, // in thousands INR
};

function normalizeFeatures({ weight_kg, age_years, has_battery, has_screen, original_price_k }) {
  const norm = (v, min, max) => Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  return [
    norm(Number(weight_kg) || 0,        FEATURE_RANGES.weight_kg.min,        FEATURE_RANGES.weight_kg.max),
    norm(Number(age_years) || 0,        FEATURE_RANGES.age_years.min,        FEATURE_RANGES.age_years.max),
    norm(Number(has_battery) || 0,      FEATURE_RANGES.has_battery.min,      FEATURE_RANGES.has_battery.max),
    norm(Number(has_screen) || 0,       FEATURE_RANGES.has_screen.min,       FEATURE_RANGES.has_screen.max),
    norm(Number(original_price_k) || 0, FEATURE_RANGES.original_price_k.min, FEATURE_RANGES.original_price_k.max),
  ];
}

// -------------------------------------------------------------------
// FORWARD PROPAGATION
// -------------------------------------------------------------------

/**
 * Classify e-waste category using the trained neural network.
 *
 * @param {{
 *   weight_kg: number,
 *   age_years: number,
 *   has_battery: 0|1,
 *   has_screen: 0|1,
 *   original_price_k: number
 * }} features
 *
 * @returns {{
 *   category: string,
 *   confidence: number,
 *   probabilities: Object,
 *   activations: Object
 * }}
 */
export function classifyEWaste(features = {}) {
  const input = normalizeFeatures(features);

  // Forward pass
  const z1 = matVecMul(W1, input, B1);
  const h1 = relu(z1);

  const z2 = matVecMul(W2, h1, B2);
  const h2 = relu(z2);

  const z3 = matVecMul(W3, h2, B3);
  const output = softmax(z3);

  // Find predicted class index safely
  let maxIdx = 0;
  let maxVal = -Infinity;
  for (let i = 0; i < output.length; i++) {
    const v = output[i] ?? 0;
    if (v > maxVal) {
      maxVal = v;
      maxIdx = i;
    }
  }

  const probabilities = {};
  CATEGORIES.forEach((cat, i) => {
    probabilities[cat] = Number((output[i] ?? (1 / CATEGORIES.length)).toFixed(4));
  });

  return {
    category:      CATEGORIES[maxIdx] || CATEGORIES[0],
    confidence:    Number((output[maxIdx] ?? 0.5).toFixed(4)),
    probabilities,
    activations:   {
      h1: h1.map((v) => Number((v || 0).toFixed(3))),
      h2: h2.map((v) => Number((v || 0).toFixed(3))),
    },
  };
}
