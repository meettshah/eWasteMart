"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@nextui-org/react";
import { Dna, CheckCircle2, TrendingUp } from "lucide-react";

/**
 * BestMatchButton — Feature 2B (Soft Computing — Genetic Algorithm)
 * Runs the GA on the server to find the optimal bid.
 * Shows convergence history (fitness over generations).
 */
export default function BestMatchButton({ listingId, pendingBids, onHighlight, saving }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runGA = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post(`/api/listings/${listingId}/best-match`);
      setResult(res.data);
      onHighlight?.(res.data.bestBid._id);
    } catch (err) {
      setError(err.response?.data?.message || "GA matching failed.");
    } finally {
      setLoading(false);
    }
  };

  const bidCount = Number(pendingBids) || 0;

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
      <div className="flex items-center gap-2 mb-2">
        <Dna className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          Genetic Algorithm Recycler Matcher
        </span>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
          Soft Computing · Feature 2B
        </span>
      </div>
      <p className="mb-3 text-xs text-indigo-600 dark:text-indigo-400">
        {bidCount >= 2
          ? `${bidCount} bids detected. Evolves a population of 50 chromosomes across 100 generations using Tournament Selection (k=3) & Order Crossover (OX1).`
          : `Run a multi-objective Genetic Algorithm (100 generations, 50 chromosomes, OX1 crossover) to optimize Price (50%), Role (30%), and Engagement (20%).`}
      </p>

      <Button
        onPress={runGA}
        isLoading={loading}
        size="sm"
        variant="flat"
        className="w-full font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300"
        startContent={!loading && <Dna className="h-3.5 w-3.5" />}
      >
        {loading ? "Evolving Population (100 Gens)..." : bidCount >= 2 ? "🧬 Find Best Match via GA" : "🧬 Run GA Recycler Matcher (Demo)"}
      </Button>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-sm text-indigo-800 dark:text-indigo-200">
              GA Recommendation
            </span>
          </div>
          
          <div className="mb-3 rounded-md bg-indigo-50 p-3 dark:bg-indigo-950/50">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {result.bestBid.bidderName} — Rs. {Number(result.bestBid.amount).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Role: {result.bestBid.bidderRole} | Fitness Score: {(result.ga.score * 100).toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
            <div className="rounded bg-gray-50 dark:bg-gray-800 p-2">
              <div className="font-bold text-gray-900 dark:text-white">{(result.ga.breakdown.priceScore * 100).toFixed(0)}%</div>
              <div className="text-gray-500">Price (50%)</div>
            </div>
            <div className="rounded bg-gray-50 dark:bg-gray-800 p-2">
              <div className="font-bold text-gray-900 dark:text-white">{(result.ga.breakdown.roleScore * 100).toFixed(0)}%</div>
              <div className="text-gray-500">Role (30%)</div>
            </div>
            <div className="rounded bg-gray-50 dark:bg-gray-800 p-2">
              <div className="font-bold text-gray-900 dark:text-white">{(result.ga.breakdown.messageScore * 100).toFixed(0)}%</div>
              <div className="text-gray-500">Message (20%)</div>
            </div>
          </div>

          {/* Convergence visualization */}
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] text-gray-400">Convergence over {result.ga.generations} generations</span>
            </div>
            <div className="flex items-end gap-px h-10 w-full">
              {result.ga.convergenceHistory
                .filter((_, i) => i % Math.max(1, Math.floor(result.ga.convergenceHistory.length / 40)) === 0)
                .map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-indigo-400 dark:bg-indigo-600 rounded-t-sm min-w-[2px]"
                    style={{ height: `${Math.round(v * 100)}%`, minHeight: "2px" }}
                    title={`Gen ${i}: ${(v * 100).toFixed(1)}%`}
                  />
                ))}
            </div>
          </div>

          <p className="text-[10px] text-gray-400">
            Evaluated {result.ga.totalBidsEvaluated} bids | Population: 50 | Elitism: 2
          </p>
        </div>
      )}
    </div>
  );
}
