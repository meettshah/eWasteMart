// =====================================================================
// Visual Condition Estimator — Computer Vision (Subject 3C)
//
// Academic Concepts Demonstrated:
//   - RGB to HSV color space conversion
//   - Color histogram analysis (hue histogram for burn, rust, and clean glass detection)
//   - Sobel edge detection operator (3x3 horizontal and vertical gradient kernels)
//   - Edge density distinguishing display glass seams from fracture damage
//   - Multi-factor decision fusion for e-waste grading
//
// References:
//   - Sobel, I. & Feldman, G. (1968). A 3x3 Isotropic Gradient Operator
//     for Image Processing. Stanford AI Project.
//   - Smith, A.R. (1978). Color gamut transform pairs. SIGGRAPH '78.
// =====================================================================

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

function sobelEdgeDensity(data, width, height) {
  const Kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const Ky = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  let edgeCount = 0;
  const threshold = 55;

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

function analyzeHsvHistogram(data) {
  const pixels = data.length / 4;
  let darkCount = 0, screenGlassCount = 0, burnCount = 0, rustCount = 0, corrosionCount = 0;

  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const { h, s, v } = rgbToHsv(r, g, b);

    // Dark pixels (displays, shadows, or charring)
    if (v < 0.25) {
      darkCount++;
      // Clean unpowered display glass or dark bezels
      if (s < 0.35) {
        screenGlassCount++;
      } else if (h >= 10 && h <= 55 && s > 0.45 && v < 0.18) {
        // High saturation brownish or singed dark pixels = thermal char
        burnCount++;
      }
    }

    // Rust: orange-brown hue with strong saturation
    if (h >= 10 && h <= 40 && s > 0.45 && v > 0.25) rustCount++;

    // Corrosion: green/teal patina on circuit metals
    if (h >= 85 && h <= 165 && s > 0.40 && v > 0.20) corrosionCount++;
  }

  return {
    darkFraction: darkCount / pixels,
    screenGlassFraction: screenGlassCount / pixels,
    burnFraction: burnCount / pixels,
    rustFraction: rustCount / pixels,
    corrosionFraction: corrosionCount / pixels,
  };
}

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
        const MAX_DIM = 220;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width || 220, img.height || 220));
        const w = Math.max(16, Math.round((img.width || 220) * scale));
        const h = Math.max(16, Math.round((img.height || 220) * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);
        if (isObjectUrl) URL.revokeObjectURL(url);

        const edgeDensity = sobelEdgeDensity(data, w, h);
        const { darkFraction, screenGlassFraction, burnFraction, rustFraction, corrosionFraction } = analyzeHsvHistogram(data);

        const reasons = [];
        let damageScore = 0;

        // Display glass detection
        if (screenGlassFraction > 0.08) {
          reasons.push(`Unpowered display glass / dark casing detected (${(screenGlassFraction * 100).toFixed(1)}% area)`);
        }

        if (burnFraction > 0.05) {
          damageScore += 3;
          reasons.push(`Thermal scorch / char marks detected (${(burnFraction * 100).toFixed(1)}% pixels)`);
        }

        if (rustFraction > 0.05) {
          damageScore += 2;
          reasons.push(`Ferrous oxidation / rust detected (${(rustFraction * 100).toFixed(1)}% pixels)`);
        }

        if (corrosionFraction > 0.04) {
          damageScore += 2;
          reasons.push(`Chemical or patina corrosion detected (${(corrosionFraction * 100).toFixed(1)}% pixels)`);
        }

        // Distinguish multiple-device grid edges from shattered fractures
        if (edgeDensity > 0.38) {
          damageScore += 2;
          reasons.push("High edge density: surface fractures, cracked screen glass, or exposed hardware borders");
        } else if (edgeDensity > 0.18) {
          if (screenGlassFraction > 0.08) {
            reasons.push("Multiple device bezel borders detected (device batch collection)");
          } else {
            damageScore += 1;
            reasons.push("Moderate surface wear & edge transitions");
          }
        } else {
          reasons.push("Smooth, uniform casing surface intact");
        }

        let condition = "working";
        let confidence = 0.85;

        if (damageScore >= 3) {
          condition = "scrap";
          confidence = Math.min(0.95, 0.70 + damageScore * 0.05);
        } else if (damageScore >= 1) {
          condition = "repairable";
          confidence = Math.min(0.88, 0.65 + damageScore * 0.08);
        } else {
          condition = "working";
          confidence = 0.88;
        }

        const stats = {
          edgeDensity: Number((edgeDensity * 100).toFixed(1)),
          darkFraction: Number((darkFraction * 100).toFixed(1)),
          screenGlassFraction: Number((screenGlassFraction * 100).toFixed(1)),
          burnFraction: Number((burnFraction * 100).toFixed(1)),
          rustFraction: Number((rustFraction * 100).toFixed(1)),
          corrosionFraction: Number((corrosionFraction * 100).toFixed(1)),
        };

        resolve({
          condition,
          confidence: Number(confidence.toFixed(2)),
          reasons,
          metrics: stats,
          details: stats,
          pipeline: {
            sobelKernel: "3x3 isotropic gradient",
            colorSpace: "RGB -> HSV cylindrical conversion",
            damageScore,
          },
        });
      } catch (err) {
        if (isObjectUrl) URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      if (isObjectUrl) URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for visual condition estimation."));
    };

    img.src = url;
  });
}
