"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Camera, Upload, CheckCircle2, AlertTriangle, Cpu, Layers, Sparkles } from "lucide-react";
import { Button } from "@nextui-org/react";
import { assessImageQuality } from "@/lib/cv/imageQuality";
import { estimateCondition } from "@/lib/cv/conditionEstimator";
import { detectDeviceCategory } from "@/lib/cv/deviceDetector";

/**
 * DeviceScanner — Features 3A, 3B, 3C
 * Combined UI for:
 *   - Multimodal Vision / MobileNet CNN device detection (Computer Vision — 3A)
 *   - Image quality validation via Laplacian variance (Computer Vision — 3B)
 *   - Visual condition estimation via Sobel + HSV (Computer Vision — 3C)
 *
 * All dummy presets removed: Live user image upload & camera scanning only.
 */

export default function DeviceScanner({ onCategoryChange, onConditionChange, listingForm }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [qualityResult, setQualityResult] = useState(null);
  const [conditionResult, setConditionResult] = useState(null);

  const fileRef = useRef(null);

  // --- Features 3A, 3B, 3C: Image Computer Vision Analysis ---
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setDetectionResult(null);
    setQualityResult(null);
    setConditionResult(null);

    // Auto-run CV analysis on image selection
    runCVAnalysis(file, preview);
  };

  const runCVAnalysis = async (fileToScan = null, previewUrl = null) => {
    const target = fileToScan || imageFile;
    if (!target) return;
    setCvLoading(true);

    try {
      // 1. Client-side quality & morphological edge analysis
      const [quality, condition] = await Promise.all([
        assessImageQuality(target),
        estimateCondition(target),
      ]);

      setQualityResult(quality);
      setConditionResult(condition);

      // 2. High-Precision Vision API (Gemini 1.5 Flash Vision)
      let detectedCategory = null;
      let detectedCondition = condition?.condition;
      let topClass = null;
      let confidence = 0.92;
      let method = "gemini_1.5_flash_vision";

      try {
        // Convert target to base64
        let base64 = "";
        if (typeof target === "string" && target.startsWith("data:")) {
          base64 = target;
        } else {
          base64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.target.result);
            r.onerror = rej;
            r.readAsDataURL(target);
          });
        }

        const res = await axios.post("/api/cv/analyze", {
          imageBase64: base64,
          mimeType: target.type || "image/jpeg",
        });

        if (res.data) {
          detectedCategory = res.data.category;
          detectedCondition = res.data.condition || detectedCondition;
          topClass = res.data.topClass || res.data.detectedObjects?.[0];
          confidence = res.data.confidence || 0.92;
          method = res.data.provider || "gemini_1.5_flash_vision";

          setDetectionResult({
            category: detectedCategory,
            confidence,
            topClass: topClass || "Electronic Hardware Lot",
            method,
            deviceCount: res.data.deviceCount || 1,
            detectedObjects: res.data.detectedObjects,
          });
        }
      } catch (apiErr) {
        console.warn("Vision API error, using local CNN fallback:", apiErr);
        const localDetected = await detectDeviceCategory(target);
        setDetectionResult(localDetected);
        detectedCategory = localDetected?.category;
        topClass = localDetected?.topClass;
      }

      if (detectedCategory) {
        onCategoryChange?.(detectedCategory);
      }
      if (detectedCondition) {
        onConditionChange?.(detectedCondition);
      }
    } catch (err) {
      console.error("CV analysis pipeline error:", err);
    } finally {
      setCvLoading(false);
    }
  };

  const qualityIcon = qualityResult?.isAcceptable
    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
    : <AlertTriangle className="h-4 w-4 text-amber-500" />;

  const conditionColor = {
    working:    "text-green-700 dark:text-green-400",
    repairable: "text-amber-700 dark:text-amber-400",
    scrap:      "text-red-700 dark:text-red-400",
  };

  return (
    <div className="space-y-4">
      {/* ── Features 3A, 3B, 3C: Computer Vision Pipeline ── */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/30">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
            CV Visual Recognition Pipeline
          </span>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600 dark:bg-orange-900 dark:text-orange-300">
            Computer Vision
          </span>
        </div>
        <p className="mb-3 text-xs text-orange-600 dark:text-orange-400">
          Upload an actual device photo. Multimodal Vision AI detects device category & count (3A), Laplacian variance validates sharpness (3B), and Sobel edge density estimates condition (3C).
        </p>

        {/* Real User Photo Upload Box (No dummy presets) */}
        <div
          onClick={() => fileRef.current?.click()}
          className="mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-300 bg-white p-5 hover:bg-orange-50 dark:border-orange-700 dark:bg-gray-900 dark:hover:bg-orange-950/20 transition-colors"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-32 w-full object-contain rounded-lg" />
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-500">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                Click to upload live device photo
              </span>
              <span className="text-[10px] text-gray-400">JPG, PNG, WebP up to 15MB</span>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

        <a
          href="/gen-ai"
          target="_blank"
          rel="noreferrer"
          className="mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/80 py-2 px-3 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 transition-colors shadow-xs"
        >
          ✨ No Photo? Generate One with AI (Gen AI 1D)
        </a>

        {imageFile && (
          <Button onPress={() => runCVAnalysis()} isLoading={cvLoading} size="sm" variant="flat"
            className="w-full font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300"
            startContent={!cvLoading && <Camera className="h-3.5 w-3.5" />}>
            {cvLoading ? "Running Multimodal CV Inspection..." : "📷 Scan Device Photo with CV"}
          </Button>
        )}

        {(detectionResult || qualityResult || conditionResult) && (
          <div className="mt-3 rounded-lg bg-white p-3.5 dark:bg-gray-900 border border-orange-100 dark:border-orange-900 space-y-3">
            {/* Feature 3A: Device Detection */}
            {detectionResult && (
              <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-800 dark:text-orange-300">
                  <Cpu className="h-3.5 w-3.5 text-orange-500" />
                  <span>Feature 3A — Visual Classification:</span>
                  <span className="text-gray-900 dark:text-white font-bold">{detectionResult.category}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400">
                  <span>Detected: <strong className="text-orange-600 dark:text-orange-400">{detectionResult.topClass}</strong></span>
                  <span className="font-semibold text-gray-500">{(detectionResult.confidence * 100).toFixed(0)}% confidence</span>
                </div>
                <div className="mt-1 text-[9px] text-gray-400 flex items-center gap-2">
                  <span>Engine: {detectionResult.method || "Gemini 1.5 Flash Vision"}</span>
                  {detectionResult.deviceCount > 1 && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-orange-600">{detectionResult.deviceCount} units in lot</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Feature 3B: Image Quality Validation */}
            {qualityResult && (
              <div className="flex items-start gap-2">
                {qualityIcon}
                <div>
                  <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Feature 3B — Quality Check: {qualityResult.blurLevel} · {qualityResult.lightnessLevel}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Laplacian variance: {qualityResult.sharpnessScore} | Luminance: {qualityResult.luminanceScore}/255
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{qualityResult.suggestion}</p>
                </div>
              </div>
            )}

            {/* Feature 3C: Visual Condition Estimate */}
            {conditionResult && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                <div className={`text-xs font-semibold mb-1 ${conditionColor[conditionResult.condition]}`}>
                  Feature 3C — Estimated Condition: <span className="capitalize">{conditionResult.condition}</span>
                  <span className="ml-2 text-gray-500 font-normal">({(conditionResult.confidence * 100).toFixed(0)}% confidence)</span>
                </div>
                <ul className="space-y-0.5">
                  {conditionResult.reasons?.map((r, i) => (
                    <li key={i} className="text-[10px] text-gray-500 flex items-start gap-1">
                      <span className="mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
                {conditionResult.metrics && (
                  <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded">
                    <span>Edge density: {conditionResult.metrics.edgeDensity}%</span>
                    <span>Display glass: {conditionResult.metrics.screenGlassFraction || conditionResult.metrics.darkFraction}%</span>
                    <span>Burn pixels: {conditionResult.metrics.burnFraction}%</span>
                    <span>Rust pixels: {conditionResult.metrics.rustFraction}%</span>
                  </div>
                )}
                <p className="mt-1 text-[9px] text-gray-400">
                  Sobel operator 3×3 convolution + RGB→HSV color histogram analysis
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
