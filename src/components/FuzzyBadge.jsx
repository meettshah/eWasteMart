"use client";

import React, { useState } from "react";
import { getFuzzyDetails } from "@/lib/fuzzy/priceEvaluator";
import { Info, X, Sliders, CheckCircle2 } from "lucide-react";

/**
 * FuzzyBadge — Feature 2A (Soft Computing — Fuzzy Logic)
 * Displays the Mamdani fuzzy inference score for a bid visually.
 * Includes interactive modal allowing faculty to inspect exact fuzzy sets and defuzzification math.
 */
export default function FuzzyBadge({ fuzzyFairness, bid, listing }) {
  const [modalOpen, setModalOpen] = useState(false);

  // Compute on-the-fly if not stored in DB
  const details = React.useMemo(() => {
    if (fuzzyFairness && fuzzyFairness.score !== null && fuzzyFairness.score !== undefined) {
      // Re-evaluate to get membership breakdowns if needed
      if (bid && listing) {
        return getFuzzyDetails(bid.amount, listing.askingPrice, listing.condition, listing.quantity);
      }
      return fuzzyFairness;
    }
    if (bid && listing) {
      return getFuzzyDetails(bid.amount, listing.askingPrice, listing.condition, listing.quantity);
    }
    return null;
  }, [fuzzyFairness, bid, listing]);

  if (!details || details.score === null) return null;

  const { score, label, color, ratio, memberships } = details;

  const styles = {
    green:  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-200",
    yellow: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-200",
    red:    "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 hover:bg-rose-200",
  };

  const emoji = { green: "🟢", yellow: "🟡", red: "🔴" };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        title="Click to inspect Mamdani Fuzzy Logic inference math"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
          styles[color] || styles.yellow
        }`}
      >
        <span>{emoji[color]}</span>
        <span>{label} · {score}/100</span>
        <span className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.2 font-mono text-[9px] uppercase tracking-wider">
          Mamdani FIS
        </span>
      </button>

      {/* Interactive Academic Inspection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                    Mamdani Fuzzy Inference System (FIS)
                  </h3>
                  <p className="text-[10px] text-slate-500">Soft Computing Module · Feature 2A</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4 text-xs">
              {/* Score Banner */}
              <div className={`flex items-center justify-between rounded-2xl p-4 border ${
                color === "green" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                  : color === "yellow"
                  ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300"
                  : "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300"
              }`}>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider opacity-75">Defuzzified Output</div>
                  <div className="text-xl font-extrabold font-heading mt-0.5">{label} — {score} / 100</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-medium">Price Ratio: <strong>{ratio || (bid && listing ? (bid.amount / listing.askingPrice).toFixed(2) : "1.00")}x</strong></div>
                  <div className="text-[10px] opacity-75">Method: Centroid (COG)</div>
                </div>
              </div>

              {/* Fuzzification Breakdown */}
              {memberships && (
                <div className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800 space-y-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                    1. Input Membership Degrees (Fuzzification)
                  </span>

                  {/* Price Ratio Memberships */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Price Ratio ({ratio}x):</span>
                      <span className="font-mono text-[10px]">Low: {memberships.priceRatio.low} · Fair: {memberships.priceRatio.fair} · High: {memberships.priceRatio.high}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 py-1 font-medium">Low: {Math.round(memberships.priceRatio.low * 100)}%</div>
                      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 py-1 font-bold">Fair: {Math.round(memberships.priceRatio.fair * 100)}%</div>
                      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 py-1 font-medium">High: {Math.round(memberships.priceRatio.high * 100)}%</div>
                    </div>
                  </div>

                  {/* Condition Memberships */}
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Condition ({listing?.condition || "mixed"}):</span>
                      <span className="font-mono text-[10px]">Poor: {memberships.condition.poor} · Mod: {memberships.condition.moderate} · Good: {memberships.condition.good}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 py-1 font-medium">Poor: {Math.round(memberships.condition.poor * 100)}%</div>
                      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 py-1 font-medium">Moderate: {Math.round(memberships.condition.moderate * 100)}%</div>
                      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 py-1 font-medium">Good: {Math.round(memberships.condition.good * 100)}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Centroid Defuzzification Math */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  2. Defuzzification (Center of Gravity Formula)
                </div>
                <p className="font-mono text-[10px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center text-slate-800 dark:text-slate-200">
                  COG = ∑ [ x · μ_agg(x) ] / ∑ [ μ_agg(x) ]  = {score} / 100
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Evaluated across a 20-rule Mamdani rule base with min-max composition.
                </p>
              </div>

              {/* Faculty Live Simulation Sandbox */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-950 dark:text-indigo-200">
                  <span>🔬 Live Faculty Simulation Sandbox</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Real-Time Mamdani FIS</span>
                </div>
                <p className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80">
                  Slide the price ratio below to test how the fuzzy inference engine re-evaluates bid fairness dynamically:
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.05"
                    defaultValue={ratio || 1.0}
                    onChange={(e) => {
                      const newRatio = parseFloat(e.target.value);
                      const ask = listing?.askingPrice || 25000;
                      const cond = listing?.condition || "mixed";
                      const qty = listing?.quantity || 10;
                      const simulated = getFuzzyDetails(ask * newRatio, ask, cond, qty);
                      const el = document.getElementById("fuzzy-sandbox-output");
                      if (el) {
                        el.innerHTML = `<strong>${simulated.label} (${simulated.score}/100)</strong> at ${newRatio.toFixed(2)}x price ratio [Low: ${simulated.memberships.priceRatio.low}, Fair: ${simulated.memberships.priceRatio.fair}, High: ${simulated.memberships.priceRatio.high}]`;
                      }
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div id="fuzzy-sandbox-output" className="rounded-lg bg-white p-2 font-mono text-[10px] text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300">
                  <strong>{label} ({score}/100)</strong> at {ratio || 1.0}x price ratio [Low: {memberships?.priceRatio?.low ?? 0}, Fair: {memberships?.priceRatio?.fair ?? 1}, High: {memberships?.priceRatio?.high ?? 0}]
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
