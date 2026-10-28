// =====================================================================
// ImageNet to E-Waste Category Mapping — Computer Vision (Subject 3A)
//
// Academic Concepts Demonstrated:
//   - Transfer learning: Re-purposing pre-trained ImageNet representations
//     for domain-specific classification (e-waste recycling).
//   - Semantic label aggregation: Mapping fine-grained ImageNet synsets (1000 classes)
//     into 7 high-level circular economy recycling categories.
//   - Confidence calibration & thresholding.
//
// References:
//   - Howard, A.G. et al. (2017). MobileNets: Efficient Convolutional Neural
//     Networks for Mobile Vision Applications. arXiv:1704.04861.
//   - Russakovsky, O. et al. (2015). ImageNet Large Scale Visual Recognition
//     Challenge. IJCV, 115(3), 211-252.
// =====================================================================

export const EWASTE_CATEGORIES = [
  "Computers and peripherals",
  "Mobile and personal devices",
  "Televisions and displays",
  "Audio and video equipment",
  "Networking devices",
  "Batteries and chargers",
  "Mixed e-waste",
];

// Mapping of ImageNet keyword substrings to e-waste categories
const KEYWORD_MAP = [
  // Computers and peripherals
  {
    category: "Computers and peripherals",
    keywords: [
      "laptop", "notebook", "desktop", "computer", "keyboard", "mouse",
      "hard disc", "hard drive", "disk", "printer", "scanner", "cpu",
      "motherboard", "trackball", "joystick", "webcam"
    ],
    weight: 1.0,
  },
  // Mobile and personal devices
  {
    category: "Mobile and personal devices",
    keywords: [
      "cellular telephone", "cellphone", "mobile phone", "telephone",
      "dial telephone", "smart phone", "smartphone", "iphone", "ipod",
      "pda", "hand-held computer", "tablet", "calculator", "digital watch"
    ],
    weight: 1.0,
  },
  // Televisions and displays
  {
    category: "Televisions and displays",
    keywords: [
      "television", "tv", "monitor", "screen", "display", "crt",
      "flat panel", "projector", "home theater"
    ],
    weight: 1.0,
  },
  // Audio and video equipment
  {
    category: "Audio and video equipment",
    keywords: [
      "loudspeaker", "speaker", "subwoofer", "headphone", "earphone",
      "cassette", "cd player", "dvd player", "tape player", "microphone",
      "amplifier", "radio", "stereo", "boombox", "camcorder", "camera",
      "turntable", "record player", "walkman"
    ],
    weight: 1.0,
  },
  // Networking devices
  {
    category: "Networking devices",
    keywords: [
      "modem", "router", "switch", "hub", "access point", "antenna",
      "server", "transceiver", "cable", "coaxial"
    ],
    weight: 0.9,
  },
  // Batteries and chargers
  {
    category: "Batteries and chargers",
    keywords: [
      "battery", "accumulator", "power supply", "charger", "adapter",
      "power cord", "electric cord", "plug"
    ],
    weight: 0.95,
  },
];

/**
 * Maps raw MobileNet / ImageNet predictions to e-waste categories.
 *
 * @param {Array<{ className: string, probability: number }>} predictions
 * @returns {{
 *   category: string,
 *   confidence: number,
 *   topClass: string,
 *   allMatches: Array<{ category: string, score: number, originalClass: string }>
 * }}
 */
export function mapImageNetToEWaste(predictions) {
  if (!predictions || predictions.length === 0) {
    return {
      category: "Mixed e-waste",
      confidence: 0.35,
      topClass: "Unidentified electronic component",
      allMatches: [],
    };
  }

  const categoryScores = {};
  EWASTE_CATEGORIES.forEach((c) => (categoryScores[c] = 0));

  const allMatches = [];

  for (const pred of predictions) {
    const labelLower = pred.className.toLowerCase();
    let matched = false;

    for (const rule of KEYWORD_MAP) {
      for (const kw of rule.keywords) {
        if (labelLower.includes(kw)) {
          const score = pred.probability * rule.weight;
          categoryScores[rule.category] += score;
          allMatches.push({
            category: rule.category,
            score,
            originalClass: pred.className,
          });
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      // Small prior for mixed e-waste if it's general clutter or hardware
      categoryScores["Mixed e-waste"] += pred.probability * 0.3;
    }
  }

  // Find category with highest cumulative probability
  let bestCategory = "Mixed e-waste";
  let maxScore = 0;

  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }

  // Calculate normalized confidence
  const topProb = predictions[0]?.probability || 0.5;
  const confidence = Math.min(0.98, Math.max(0.4, (maxScore > 0 ? maxScore : topProb)));

  return {
    category: bestCategory,
    confidence: Number(confidence.toFixed(2)),
    topClass: predictions[0]?.className || "Electronic device",
    allMatches,
  };
}
