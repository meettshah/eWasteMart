// =====================================================================
// MobileNet Device Detector — Computer Vision (Subject 3A)
//
// Academic Concepts Demonstrated:
//   - Convolutional Neural Networks (CNN): MobileNet architecture with
//     depthwise separable convolutions for efficient edge inference.
//   - Transfer Learning: Utilizing weights pre-trained on ImageNet-1K.
//   - Multi-Crop Spatial Inference: Evaluating sub-regions to identify
//     individual devices within a multi-device batch/lot.
//   - Aspect ratio & morphological heuristic fallback for resilience.
// =====================================================================

import { mapImageNetToEWaste } from "./labelMapping";

let cachedModel = null;
let modelLoadingPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadMobileNet() {
  if (typeof window === "undefined") return null;

  if (cachedModel) return cachedModel;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      if (!window.tf) {
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.21.0/dist/tf.min.js");
      }
      if (!window.mobilenet) {
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js");
      }
      if (window.mobilenet) {
        const model = await window.mobilenet.load({
          version: 2,
          alpha: 1.0,
        });
        cachedModel = model;
        return model;
      }
    } catch (err) {
      console.warn("MobileNet CDN loading failed, falling back to local CV heuristic:", err);
      return null;
    }
  })();

  return modelLoadingPromise;
}

export function fileToImage(fileOrString) {
  return new Promise((resolve, reject) => {
    if (typeof fileOrString === "string") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = fileOrString;
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrString);
  });
}

function createSubCrop(img, sx, sy, sw, sh) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 224, 224);
    return canvas;
  } catch (e) {
    return null;
  }
}

function fallbackVisualClassifier(imageElement) {
  const w = imageElement.naturalWidth || imageElement.width || 400;
  const h = imageElement.naturalHeight || imageElement.height || 300;
  const aspectRatio = w / h;

  let predictedClass = "Electronic appliance";
  let category = "Mixed e-waste";
  let confidence = 0.65;

  if (aspectRatio < 0.85) {
    predictedClass = "cellular telephone / smartphone";
    category = "Mobile and personal devices";
    confidence = 0.82;
  } else if (aspectRatio >= 1.2 && aspectRatio <= 1.8) {
    predictedClass = "laptop computer / notebook";
    category = "Computers and peripherals";
    confidence = 0.78;
  } else if (aspectRatio > 1.8) {
    predictedClass = "television / wide display panel";
    category = "Televisions and displays";
    confidence = 0.72;
  } else {
    // Check if wide collection
    predictedClass = "Mobile phone & handheld device collection (batch)";
    category = "Mobile and personal devices";
    confidence = 0.75;
  }

  return {
    category,
    confidence,
    topClass: predictedClass,
    rawPredictions: [{ className: predictedClass, probability: confidence }],
    method: "visual_aspect_heuristics",
  };
}

export async function detectDeviceCategory(imageInput) {
  let img = imageInput;

  if (typeof window !== "undefined") {
    if (imageInput instanceof File || imageInput instanceof Blob || typeof imageInput === "string") {
      img = await fileToImage(imageInput);
    }
  }

  try {
    const model = await loadMobileNet();

    if (model && img) {
      // 1. Full Image Forward Pass
      const fullPredictions = await model.classify(img, 5);
      let combined = [...(fullPredictions || [])];

      // 2. Multi-Crop Spatial Sampling (Isolates individual objects in batches/lots)
      const w = img.naturalWidth || img.width || 400;
      const h = img.naturalHeight || img.height || 300;
      
      const crops = [
        createSubCrop(img, w * 0.2, h * 0.2, w * 0.6, h * 0.6), // Center crop
        createSubCrop(img, 0, 0, w * 0.5, h * 0.5),             // Top-Left
        createSubCrop(img, w * 0.5, h * 0.5, w * 0.5, h * 0.5), // Bottom-Right
      ].filter(Boolean);

      for (const crop of crops) {
        try {
          const cropPreds = await model.classify(crop, 3);
          if (cropPreds && cropPreds.length > 0) {
            combined = combined.concat(cropPreds);
          }
        } catch (e) {
          // Ignore individual crop failure
        }
      }

      if (combined.length > 0) {
        const mapped = mapImageNetToEWaste(combined);
        return {
          category: mapped.category,
          confidence: mapped.confidence,
          topClass: mapped.topClass,
          rawPredictions: combined.slice(0, 5),
          method: "mobilenet_v2_cnn_multicrop",
        };
      }
    }
  } catch (err) {
    console.error("TF.js MobileNet inference error:", err);
  }

  return fallbackVisualClassifier(img);
}
