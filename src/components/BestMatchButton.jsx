"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@nextui-org/react";
import { Dna, CheckCircle2 } from "lucide-react";

/**
 * BestMatchButton — Feature 2B (Soft Computing — Genetic Algorithm)
 * Runs the GA on the server to find the optimal bid.
 */
export default function BestMatchButton({ listingId, pendingBids, onHighlight }) {
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
      const targetId = res.data.bestBid?.id || res.data.bestBid?._id || res.data.bestBidId;
      if (targetId) onHighlight?.(targetId);
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
        {loading ? "Evolving Population (100 Gens)..." : bidCount >= 2 ? "🧬 Find Best Match via GA" : "🧬 Run GA Recycler Matcher"}
      </Button>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      {result && result.bestBid && (
        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-sm text-indigo-800 dark:text-indigo-200">
              GA Optimal Recommendation
            </span>
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p><strong>Recommended Match:</strong> {result.bestBid.bidderName}</p>
            <p><strong>Amount:</strong> ₹{Number(result.bestBid.amount).toLocaleString("en-IN")}</p>
            <p><strong>Combined Fitness:</strong> {(result.bestFitness || result.score || 0) * 100}%</p>
            {result.breakdown && (
              <p className="text-[11px] text-slate-500">
                Price Weight: {result.breakdown.priceScore} | Credential: {result.breakdown.roleScore} | Message: {result.breakdown.messageScore}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
