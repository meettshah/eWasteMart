"use client";

import { useState, useRef } from "react";
import { Brain, Camera, Upload, CheckCircle2, AlertTriangle, Cpu, Layers } from "lucide-react";
import { Button } from "@nextui-org/react";
import { classifyEWaste, CATEGORIES } from "@/lib/nn/categoryClassifier";
import { assessImageQuality } from "@/lib/cv/imageQuality";
import { estimateCondition } from "@/lib/cv/conditionEstimator";
import { detectDeviceCategory } from "@/lib/cv/deviceDetector";

/**
 * DeviceScanner — Features 2C, 3A, 3B, 3C
 * Combined UI for:
 *   - Neural Network category classification (Soft Computing — 2C)
 *   - MobileNet CNN transfer learning device detection (Computer Vision — 3A)
 *   - Image quality validation via Laplacian variance (Computer Vision — 3B)
 *   - Visual condition estimation via Sobel + HSV (Computer Vision — 3C)
 */
function generatePresetDeviceDataUrl(type) {
  if (typeof window === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (type === "laptop") {
    canvas.width = 320;
    canvas.height = 200;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 320, 200);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(40, 20, 240, 130);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(48, 28, 224, 114);
    ctx.fillStyle = "#0369a1";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ThinkPad E-Waste Core", 95, 90);
    ctx.fillStyle = "#334155";
    ctx.fillRect(20, 155, 280, 40);
    ctx.fillStyle = "#64748b";
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 10; c++) {
        ctx.fillRect(35 + c * 25, 160 + r * 15, 20, 10);
      }
    }
  } else if (type === "broken_phone") {
    canvas.width = 180;
    canvas.height = 320;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, 180, 320);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(15, 25, 150, 270);
    // Cracks (high edge lines)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(30, 40); ctx.lineTo(90, 120); ctx.lineTo(150, 100);
    ctx.moveTo(90, 120); ctx.lineTo(110, 220); ctx.lineTo(40, 260);
    ctx.moveTo(90, 120); ctx.lineTo(60, 180); ctx.lineTo(140, 200);
    ctx.stroke();
    // Rust / burn patch
    ctx.fillStyle = "rgba(180, 83, 9, 0.75)";
    ctx.beginPath(); ctx.arc(120, 230, 28, 0, Math.PI * 2); ctx.fill();
  } else if (type === "server_pcb") {
    canvas.width = 300;
    canvas.height = 240;
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(0, 0, 300, 240);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 1.5;
    for (let i = 15; i < 280; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, 20); ctx.lineTo(i + 20, 80); ctx.lineTo(i + 10, 220);
      ctx.stroke();
    }
    ctx.fillStyle = "#111827";
    ctx.fillRect(50, 60, 60, 60);
    ctx.fillRect(160, 100, 80, 50);
    ctx.fillStyle = "rgba(13, 148, 136, 0.65)";
    ctx.fillRect(20, 160, 60, 50);
    ctx.fillStyle = "rgba(180, 83, 9, 0.7)";
    ctx.fillRect(180, 30, 50, 40);
  } else {
    canvas.width = 280;
    canvas.height = 240;
    ctx.fillStyle = "#374151";
    ctx.fillRect(20, 20, 240, 200);
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(40, 40, 160, 150, 16) : ctx.rect(40, 40, 160, 150);
    ctx.fill();
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(215, 50, 30, 80);
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.beginPath(); ctx.arc(120, 115, 32, 0, Math.PI * 2); ctx.fill();
  }

  return canvas.toDataURL("image/png");
}

const PRESET_DEVICES = [
  {
    id: "laptop",
    label: "💻 Laptop",
    subtitle: "Computers & Peripherals",
    inputs: { weight_kg: 2.3, age_years: 4, has_battery: 1, has_screen: 1, original_price_k: 45 },
  },
  {
    id: "broken_phone",
    label: "📱 Cracked Phone",
    subtitle: "Mobile Devices (Scrap)",
    inputs: { weight_kg: 0.2, age_years: 5, has_battery: 1, has_screen: 1, original_price_k: 28 },
  },
  {
    id: "server_pcb",
    label: "🔌 Server PCB",
    subtitle: "Mixed / Metal Scrap",
    inputs: { weight_kg: 1.8, age_years: 6, has_battery: 0, has_screen: 0, original_price_k: 35 },
  },
  {
    id: "crt_tv",
    label: "🖥️ CRT Monitor",
    subtitle: "Televisions & Displays",
    inputs: { weight_kg: 16.0, age_years: 14, has_battery: 0, has_screen: 1, original_price_k: 20 },
  },
];

export default function DeviceScanner({ onCategoryChange, onConditionChange, listingForm }) {
  const [nnResult, setNnResult] = useState(null);
  const [nnLoading, setNnLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [qualityResult, setQualityResult] = useState(null);
  const [conditionResult, setConditionResult] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [nnInputs, setNnInputs] = useState({
    weight_kg: 2,
    age_years: 3,
    has_battery: 0,
    has_screen: 0,
    original_price_k: 30,
  });

  const fileRef = useRef(null);

  // --- Feature 2C: Neural Network Classification (Soft Computing) ---
  const runNNClassifier = (overrideInputs = null) => {
    setNnLoading(true);
    const inputsToUse = overrideInputs || nnInputs;
    setTimeout(() => {
      try {
        const result = classifyEWaste(inputsToUse);
        setNnResult(result);
        if (CATEGORIES.includes(result.category)) {
          onCategoryChange?.(result.category);
        }
      } catch (e) {
        console.error("NN classifier error:", e);
      } finally {
        setNnLoading(false);
      }
    }, 50);
  };

  // --- Features 3A, 3B, 3C: Image Computer Vision Analysis ---
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActivePreset(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setDetectionResult(null);
    setQualityResult(null);
    setConditionResult(null);
  };

  const runCVAnalysis = async (fileToScan = null) => {
    const target = fileToScan || imageFile;
    if (!target) return;
    setCvLoading(true);
    try {
      const [detected, quality, condition] = await Promise.all([
        detectDeviceCategory(target),
        assessImageQuality(target),
        estimateCondition(target),
      ]);

      setDetectionResult(detected);
      setQualityResult(quality);
      setConditionResult(condition);

      if (detected?.category && detected.confidence >= 0.45) {
        onCategoryChange?.(detected.category);
      }
      if (condition?.confidence >= 0.55) {
        onConditionChange?.(condition.condition);
      }
    } catch (err) {
      console.error("CV analysis pipeline error:", err);
    } finally {
      setCvLoading(false);
    }
  };

  const selectPreset = (preset) => {
    setActivePreset(preset.id);
    setNnInputs(preset.inputs);
    const dataUrl = generatePresetDeviceDataUrl(preset.id);
    setImageFile(dataUrl);
    setImagePreview(dataUrl);
    setDetectionResult(null);
    setQualityResult(null);
    setConditionResult(null);

    // Auto-trigger both CV analysis and NN classifier for instantaneous faculty demo
    runCVAnalysis(dataUrl);
    runNNClassifier(preset.inputs);
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
      {/* ── Feature 2C: Neural Network Classifier (Soft Computing) ── */}
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/30">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            Neural Network Auto-Classifier
          </span>
          <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300">
            Soft Computing
          </span>
        </div>
        <p className="mb-3 text-xs text-cyan-600 dark:text-cyan-400">
          5-input feedforward NN (ReLU + Softmax) classifies e-waste category from device specs. Runs entirely in-browser.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Weight (kg)</label>
            <input type="number" min="0.1" step="0.5" value={nnInputs.weight_kg}
              onChange={(e) => setNnInputs((p) => ({ ...p, weight_kg: +e.target.value }))}
              className="w-full rounded border border-cyan-200 bg-white px-2 py-1 text-sm dark:border-cyan-800 dark:bg-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Age (years)</label>
            <input type="number" min="0" max="20" value={nnInputs.age_years}
              onChange={(e) => setNnInputs((p) => ({ ...p, age_years: +e.target.value }))}
              className="w-full rounded border border-cyan-200 bg-white px-2 py-1 text-sm dark:border-cyan-800 dark:bg-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Orig. Price (₹ thousands)</label>
            <input type="number" min="0" step="5" value={nnInputs.original_price_k}
              onChange={(e) => setNnInputs((p) => ({ ...p, original_price_k: +e.target.value }))}
              className="w-full rounded border border-cyan-200 bg-white px-2 py-1 text-sm dark:border-cyan-800 dark:bg-gray-900 dark:text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Features</label>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={!!nnInputs.has_battery}
                onChange={(e) => setNnInputs((p) => ({ ...p, has_battery: e.target.checked ? 1 : 0 }))}
                className="rounded" />
              Has Battery
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={!!nnInputs.has_screen}
                onChange={(e) => setNnInputs((p) => ({ ...p, has_screen: e.target.checked ? 1 : 0 }))}
                className="rounded" />
              Has Screen
            </label>
          </div>
        </div>

        <Button onPress={runNNClassifier} isLoading={nnLoading} size="sm" variant="flat"
          className="w-full font-semibold bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300"
          startContent={!nnLoading && <Brain className="h-3.5 w-3.5" />}>
          {nnLoading ? "Running NN forward pass..." : "🧠 Auto-classify Category"}
        </Button>

        {nnResult && (
          <div className="mt-3 rounded-lg bg-white p-3 dark:bg-gray-900 border border-cyan-100 dark:border-cyan-900">
            <div className="text-xs font-bold text-cyan-800 dark:text-cyan-200 mb-1">
              NN Prediction: <span className="text-gray-900 dark:text-white">{nnResult.category}</span>
              <span className="ml-2 text-gray-500">({(nnResult.confidence * 100).toFixed(1)}% confidence)</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(nnResult.probabilities)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([cat, prob]) => (
                  <span key={cat}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cat === nnResult.category ? "bg-cyan-200 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                    {cat.split(" ")[0]}: {(prob * 100).toFixed(1)}%
                  </span>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Architecture: 5→8→6→7 | Activations: ReLU (hidden), Softmax (output)
            </p>
          </div>
        )}
      </div>

      {/* ── Features 3A + 3B + 3C: Computer Vision Image Analysis ── */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/30">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
            Computer Vision Scanner (MobileNet + Sobel + Laplacian)
          </span>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600 dark:bg-orange-900 dark:text-orange-300">
            CV
          </span>
        </div>
        <p className="mb-3 text-xs text-orange-600 dark:text-orange-400">
          Upload a device photo or choose an instant test preset below. MobileNet CNN detects device type (3A), Laplacian variance validates sharpness (3B), Sobel edges &amp; HSV histograms estimate condition (3C).
        </p>

        {/* Preset Devices for 1-Click Faculty Demo */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-orange-900 dark:text-orange-200">
            <span>Faculty Demo Presets (1-Click Test):</span>
            <span className="text-[10px] text-orange-600 dark:text-orange-400 font-mono">Instant Canvas Data</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {PRESET_DEVICES.map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPreset(p)}
                  className={`flex flex-col items-start rounded-lg border p-2 text-left transition-all ${
                    isSelected
                      ? "border-orange-500 bg-orange-100/90 text-orange-950 ring-1 ring-orange-500 dark:border-orange-500 dark:bg-orange-900/50 dark:text-orange-100"
                      : "border-orange-200/80 bg-white/80 text-slate-700 hover:border-orange-300 dark:border-orange-900/40 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold">{p.label}</span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate w-full">
                    {p.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-300 bg-white p-4 hover:bg-orange-50 dark:border-orange-700 dark:bg-gray-900 dark:hover:bg-orange-950/20 transition-colors"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-28 w-full object-contain rounded" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-orange-400" />
              <span className="text-xs text-orange-500 dark:text-orange-400">Click to upload device photo</span>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

        {imageFile && (
          <Button onPress={runCVAnalysis} isLoading={cvLoading} size="sm" variant="flat"
            className="w-full font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300"
            startContent={!cvLoading && <Camera className="h-3.5 w-3.5" />}>
            {cvLoading ? "Running CV pipeline (MobileNet + Filters)..." : "📷 Scan Device Photo with CV"}
          </Button>
        )}

        {(detectionResult || qualityResult || conditionResult) && (
          <div className="mt-3 rounded-lg bg-white p-3 dark:bg-gray-900 border border-orange-100 dark:border-orange-900 space-y-3">
            {/* Feature 3A: MobileNet Device Detection */}
            {detectionResult && (
              <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-800 dark:text-orange-300">
                  <Cpu className="h-3.5 w-3.5 text-orange-500" />
                  <span>Feature 3A — CNN Classification:</span>
                  <span className="text-gray-900 dark:text-white font-bold">{detectionResult.category}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400">
                  <span>Detected Object: <strong className="text-orange-600 dark:text-orange-400">{detectionResult.topClass}</strong></span>
                  <span className="font-semibold text-gray-500">{(detectionResult.confidence * 100).toFixed(0)}% confidence</span>
                </div>
                <div className="mt-1 text-[9px] text-gray-400 flex items-center gap-2">
                  <span>Inference: {detectionResult.method}</span>
                  <span>•</span>
                  <span>Transfer Learning from ImageNet-1K</span>
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
                  {conditionResult.reasons.map((r, i) => (
                    <li key={i} className="text-[10px] text-gray-500 flex items-start gap-1">
                      <span className="mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-1.5 grid grid-cols-2 gap-1 text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded">
                  <span>Edge density: {(conditionResult.details.edgeDensity * 100).toFixed(1)}%</span>
                  <span>Burn pixels: {(conditionResult.details.burnFraction * 100).toFixed(1)}%</span>
                  <span>Rust pixels: {(conditionResult.details.rustFraction * 100).toFixed(1)}%</span>
                  <span>Corrosion: {(conditionResult.details.corrosionFraction * 100).toFixed(1)}%</span>
                </div>
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
