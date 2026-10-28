"use client";

import { useState } from "react";
import axios from "axios";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@nextui-org/react";

/**
 * AIListingHelper — Feature 1A (Generative AI)
 * Few-shot prompt engineering to auto-generate listing title & description.
 */
export default function AIListingHelper({ listingForm, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywords, setKeywords] = useState("");

  const PROMPT_PRESETS = [
    "20 Dell Latitude laptops, i5 8th gen, broken screens, batteries intact",
    "50 mixed smartphones (iPhone, Samsung) for precious metal recovery",
    "10 enterprise server motherboards with gold-plated PCI connectors",
    "15 CRT monitors, bulky plastic casing, copper deflector yokes",
  ];

  const generateWithText = async (text) => {
    setLoading(true);
    setError("");
    const kw = text !== undefined ? text : keywords;
    try {
      const res = await axios.post("/api/ai/generate-listing", {
        category:  listingForm.category,
        quantity:  listingForm.quantity,
        unit:      listingForm.unit,
        condition: listingForm.condition,
        keywords:  kw,
      });
      onGenerate(res.data.title, res.data.description);
    } catch (err) {
      setError(err.response?.data?.message || "AI generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/50 dark:bg-violet-950/30">
      <div className="flex items-center gap-2 mb-3">
        <Wand2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
          AI Listing Generator
        </span>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-600 dark:bg-violet-900 dark:text-violet-300">
          Gen AI · Feature 1A
        </span>
      </div>
      <p className="mb-2 text-xs text-violet-600 dark:text-violet-400">
        Few-shot LLM prompt engineering generates commercial e-waste listing copy optimized for recycler bidding.
      </p>

      {/* Quick Prompt Presets */}
      <div className="mb-3 space-y-1">
        <span className="text-[10px] font-semibold text-violet-800 dark:text-violet-300">
          1-Click Faculty Demo Presets:
        </span>
        <div className="flex flex-wrap gap-1">
          {PROMPT_PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setKeywords(p);
                generateWithText(p);
              }}
              className="rounded-full border border-violet-300/80 bg-white/80 px-2 py-0.5 text-[10px] text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:bg-gray-900 dark:text-violet-300"
            >
              {p.slice(0, 24)}...
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="e.g., Dell laptops, broken screens, 2018 model"
        className="mb-3 w-full rounded-md border border-violet-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:border-violet-800 dark:bg-gray-900 dark:text-white"
      />
      {error && (
        <p className="mb-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button
        onPress={() => generateWithText()}
        isLoading={loading}
        color="secondary"
        variant="flat"
        size="sm"
        className="w-full font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300"
        startContent={!loading && <Sparkles className="h-3.5 w-3.5" />}
      >
        {loading ? "Synthesizing with Gemini..." : "✨ Generate Title & Description"}
      </Button>
    </div>
  );
}
