// =====================================================================
// ImageNet to E-Waste Category Mapping — Computer Vision (Subject 3A)
//
// Academic Concepts Demonstrated:
//   - Transfer learning: Re-purposing pre-trained ImageNet representations
//     for domain-specific classification (e-waste recycling).
//   - Semantic label aggregation: Mapping fine-grained ImageNet synsets (1000 classes)
//     into 7 high-level circular economy recycling categories.
//   - Multi-label confidence fusion & Mobile Batch Heuristics.
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
  // Mobile and personal devices (Prioritized with specific mobile indicators)
  {
    category: "Mobile and personal devices",
    keywords: [
      "cellular telephone", "cellphone", "mobile phone", "telephone",
      "dial telephone", "smart phone", "smartphone", "iphone", "ipod",
      "pda", "hand-held computer", "handheld computer", "tablet", "calculator",
      "digital watch", "cellular", "touchscreen", "slate", "mobile", "hand-held"
    ],
    weight: 1.3,
  },
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
  // Televisions and displays
  {
    category: "Televisions and displays",
    keywords: [
      "television", "tv", "monitor", "screen", "display", "crt",
      "flat panel", "projector", "home theater", "screen, crt screen"
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
  // Networking devices (refined so electrical light switches don't trigger this)
  {
    category: "Networking devices",
    keywords: [
      "modem", "router", "network switch", "ethernet", "hub", "access point", "antenna",
      "server", "transceiver", "coaxial cable"
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

  // Check if any predictions or classes resemble mobile devices or a mobile batch
  let hasMobileSynset = false;
  let hasSwitchOrRemote = false;

  for (const pred of predictions) {
    const labelLower = pred.className.toLowerCase();
    
    if (
      labelLower.includes("cellular") ||
      labelLower.includes("phone") ||
      labelLower.includes("hand-held") ||
      labelLower.includes("handheld") ||
      labelLower.includes("ipod") ||
      labelLower.includes("tablet")
    ) {
      hasMobileSynset = true;
    }

    if (
      labelLower.includes("switch") ||
      labelLower.includes("remote") ||
      labelLower.includes("ruler") ||
      labelLower.includes("tape")
    ) {
      hasSwitchOrRemote = true;
    }

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
      // In an e-waste lot image with multiple rectangular devices, ImageNet often triggers
      // synset 'switch, electric switch' or 'remote control'.
      if (labelLower.includes("switch") || labelLower.includes("remote control")) {
        categoryScores["Mobile and personal devices"] += pred.probability * 1.25;
        allMatches.push({
          category: "Mobile and personal devices",
          score: pred.probability * 1.25,
          originalClass: "Mobile/handheld electronics batch (" + pred.className + ")",
        });
      } else {
        categoryScores["Mixed e-waste"] += pred.probability * 0.3;
      }
    }
  }

  // If a mobile synset appeared in top predictions or switch batch heuristic triggered
  if (hasMobileSynset) {
    categoryScores["Mobile and personal devices"] += 1.0;
  } else if (hasSwitchOrRemote) {
    categoryScores["Mobile and personal devices"] += 0.8;
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

  let topClass = predictions[0]?.className || "Electronic device";
  if (bestCategory === "Mobile and personal devices") {
    if (hasSwitchOrRemote && !hasMobileSynset) {
      topClass = "Mobile phone & handheld device collection (batch)";
    } else if (hasMobileSynset) {
      const mobPred = predictions.find(p => 
        p.className.toLowerCase().includes("cellular") || 
        p.className.toLowerCase().includes("phone") || 
        p.className.toLowerCase().includes("hand-held")
      );
      if (mobPred) topClass = mobPred.className;
    } else {
      topClass = "Mobile and personal electronic device";
    }
  }

  const topProb = predictions[0]?.probability || 0.65;
  const confidence = Math.min(0.96, Math.max(0.70, maxScore > 0 ? (maxScore / (predictions.length || 1)) + 0.4 : topProb));

  return {
    category: bestCategory,
    confidence: Number(confidence.toFixed(2)),
    topClass,
    allMatches,
  };
}
