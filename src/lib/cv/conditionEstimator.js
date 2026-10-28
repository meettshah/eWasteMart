// =====================================================================
// Visual Condition Estimator — Computer Vision (Subject 3C)
//
// Academic Concepts Demonstrated:
//   - RGB to HSV color space conversion
//   - Color histogram analysis (hue histogram for burn/rust detection)
//   - Sobel edge detection operator (horizontal + vertical kernels)
//   - Edge density as a surface damage proxy
//   - Multi-factor decision fusion
//
// References:
//   - Sobel, I. & Feldman, G. (1968). A 3x3 Isotropic Gradient Operator
//     for Image Processing. Stanford AI Project.
//   - Smith, A.R. (1978). Color gamut transform pairs.
//     SIGGRAPH '78, 12-19.
// =====================================================================

// -------------------------------------------------------------------
// COLOR SPACE CONVERSION: RGB → HSV
// -------------------------------------------------------------------

/**
 * Convert a single pixel from RGB to HSV.
 * @param {number} r  [0-255]
 * @param {number} g  [0-255]
 * @param {number} b  [0-255]
 * @returns {{ h: number, s: number, v: number }}
 *   h: [0-360], s: [0-1], v: [0-1]
 */
function rgbToHsv(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta > 0) {
    if (max === rn)      h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else                 h = 60 * ((rn - gn) / delta + 4);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

// -------------------------------------------------------------------
// SOBEL EDGE DETECTION
// -------------------------------------------------------------------

/**
 * Compute edge density using Sobel operators.
 * High edge density + localized to damaged regions → surface damage.
 *
 * Sobel X:  [-1, 0, 1]    Sobel Y:  [-1, -2, -1]
 *           [-2, 0, 2]              [ 0,  0,  0]
 *           [-1, 0, 1]              [ 1,  2,  1]
 *
 * @param {Uint8ClampedArray} data  - RGBA pixel data
 * @param {number} width
 * @param {number} height
 * @returns {number} edgeDensity: fraction of pixels above edge threshold [0-1]
 */
function sobelEdgeDensity(data, width, height) {
  const Kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const Ky = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  // Convert to grayscale first
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  let edgeCount = 0;
  const threshold = 50;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = gray[(y + ky) * width + (x + kx)];
          gx += Kx[ky + 1][kx + 1] * pixel;
          gy += Ky[ky + 1][kx + 1] * pixel;
        }
      }
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      if (magnitude > threshold) edgeCount++;
    }
  }

  const totalInnerPixels = (width - 2) * (height - 2);
  return totalInnerPixels > 0 ? edgeCount / totalInnerPixels : 0;
}

// -------------------------------------------------------------------
// HSV HISTOGRAM ANALYSIS
// -------------------------------------------------------------------

/**
 * Analyze HSV histograms to detect:
 *   - Burn marks: very dark regions (V < 0.2)
 *   - Rust: orange-brown hues (H = 10-40, S > 0.4)
 *   - Greenish corrosion: (H = 80-160, S > 0.3)
 *
 * @param {Uint8ClampedArray} data
 * @returns {{ burnFraction, rustFraction, corrosionFraction, darkFraction }}
 */
function analyzeHsvHistogram(data) {
  const pixels = data.length / 4;
  let burnCount = 0, rustCount = 0, corrosionCount = 0;

  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const { h, s, v } = rgbToHsv(r, g, b);

    // Burn mark: very dark pixels
    if (v < 0.20) burnCount++;

    // Rust: orange-brown hue with reasonable saturation
    if (h >= 5 && h <= 40 && s > 0.35 && v > 0.25) rustCount++;

    // Corrosion (green/blue-green patina on metals)
    if (h >= 80 && h <= 165 && s > 0.30 && v > 0.20) corrosionCount++;
  }

  return {
    burnFraction:      burnCount      / pixels,
    rustFraction:      rustCount      / pixels,
    corrosionFraction: corrosionCount / pixels,
  };
}

// -------------------------------------------------------------------
// MAIN CONDITION ESTIMATOR
// -------------------------------------------------------------------

/**
 * Estimate the physical condition of an e-waste item from a photo.
 * Must be called in a browser environment (Canvas API).
 *
 * @param {File|Blob} imageFile
 * @returns {Promise<{
 *   condition: "working"|"repairable"|"scrap",
 *   confidence: number,
 *   reasons: string[],
 *   details: {
 *     edgeDensity: number,
 *     burnFraction: number,
 *     rustFraction: number,
 *     corrosionFraction: number,
 *   }
 * }>}
 */
export async function estimateCondition(imageInput) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let isObjectUrl = false;
    let url = "";

    try {
      if (typeof imageInput === "string") {
        url = imageInput;
      } else {
        url = URL.createObjectURL(imageInput);
        isObjectUrl = true;
      }
    } catch (e) {
      return reject(new Error("Invalid image input format."));
    }

    img.onload = () => {
      try {
        const MAX_DIM = 200;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width || 200, img.height || 200));
        const w = Math.max(16, Math.round((img.width || 200) * scale));
        const h = Math.max(16, Math.round((img.height || 200) * scale));

        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);
        if (isObjectUrl) URL.revokeObjectURL(url);

        // --- Computer Vision Analysis ---
        const edgeDensity = sobelEdgeDensity(data, w, h);
        const { burnFraction, rustFraction, corrosionFraction } = analyzeHsvHistogram(data);

        // --- Decision Logic ---
        const reasons = [];
        let damageScore = 0; // 0=clean, accumulates per damage type

        if (burnFraction > 0.15) {
          damageScore += 3;
          reasons.push(`Burn/char marks detected (${(burnFraction * 100).toFixed(1)}% dark pixels)`);
        } else if (burnFraction > 0.07) {
          damageScore += 1;
          reasons.push(`Minor dark/burn regions detected`);
        }

        if (rustFraction > 0.12) {
          damageScore += 2;
          reasons.push(`Rust/corrosion detected (${(rustFraction * 100).toFixed(1)}% orange-brown areas)`);
        } else if (rustFraction > 0.05) {
          damageScore += 1;
          reasons.push(`Light rust traces detected`);
        }

        if (corrosionFraction > 0.08) {
          damageScore += 1;
          reasons.push(`Metal corrosion/patina detected`);
        }

        if (edgeDensity > 0.35) {
          damageScore += 1;
          reasons.push(`High surface edge density — possible cracks or component exposure`);
        }

        // --- Determine Condition ---
        let condition, confidence;
        if (damageScore === 0) {
          condition  = "working";
          confidence = 0.72;
          reasons.push("No significant damage markers detected — device appears intact");
        } else if (damageScore <= 2) {
          condition  = "repairable";
          confidence = 0.65;
        } else {
          condition  = "scrap";
          confidence = 0.70;
        }

        // Confidence is reduced if damage score is in the middle (ambiguous)
        if (damageScore === 1 || damageScore === 2) confidence = 0.58;

        resolve({
          condition,
          confidence: Number(confidence.toFixed(2)),
          reasons,
          details: {
            edgeDensity:      Number(edgeDensity.toFixed(4)),
            burnFraction:     Number(burnFraction.toFixed(4)),
            rustFraction:     Number(rustFraction.toFixed(4)),
            corrosionFraction:Number(corrosionFraction.toFixed(4)),
          },
        });
      } catch (err) {
        if (isObjectUrl) URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      if (isObjectUrl) URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for condition analysis."));
    };

    img.src = url;
  });
}
