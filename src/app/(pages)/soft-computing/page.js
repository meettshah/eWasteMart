"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dna, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  Play, 
  TrendingUp, 
  Award, 
  Cpu, 
  Zap,
  Info,
  ArrowRightLeft,
  Store,
  Factory,
  HelpCircle,
  Sparkles,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { Button } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import { evaluateBidFairness, getFuzzyDetails } from "@/lib/fuzzy/priceEvaluator";

export default function SoftComputingPage() {
  const [activeTab, setActiveTab] = useState("fuzzy");

  // ─────────────────────────────────────────────────────────────────
  // REAL DATABASE GROUNDING (SHARED BY FIS & GA)
  // ─────────────────────────────────────────────────────────────────
  const [dbListings, setDbListings] = useState([]);
  const [dbRecyclers, setDbRecyclers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ─────────────────────────────────────────────────────────────────
  // 2A: MAMDANI FUZZY LOGIC STATE & REAL DATABASE GROUNDING
  // ─────────────────────────────────────────────────────────────────
  const [fuzzyDataSource, setFuzzyDataSource] = useState("database"); // "database" | "sandbox"
  const [fuzzyListingId, setFuzzyListingId] = useState("");
  const [activeBidId, setActiveBidId] = useState(null);
  const [askingPrice, setAskingPrice] = useState(30000);
  const [bidAmount, setBidAmount] = useState(16000);
  const [condition, setCondition] = useState("scrap"); // "scrap" | "mixed" | "repairable" | "working"
  const [quantity, setQuantity] = useState(50);
  const [fuzzyOutput, setFuzzyOutput] = useState(null);
  const [showExplainer, setShowExplainer] = useState(true);

  // ─────────────────────────────────────────────────────────────────
  // 2B: REAL DATABASE GENETIC ALGORITHM STATE
  // ─────────────────────────────────────────────────────────────────
  const [gaMode, setGaMode] = useState("seller"); // "seller" (Product -> Buyer) | "buyer" (Buyer -> Product)
  const [selectedListingId, setSelectedListingId] = useState("");
  const [selectedRecyclerId, setSelectedRecyclerId] = useState("");
  const [gaRunning, setGaRunning] = useState(false);
  const [gaResult, setGaResult] = useState(null);

  // Recalculate Mamdani FIS whenever bid, asking price, condition, or quantity changes
  useEffect(() => {
    const details = getFuzzyDetails(bidAmount, askingPrice, condition, quantity);
    setFuzzyOutput(details);
  }, [bidAmount, askingPrice, condition, quantity]);

  // When dbListings loads, initialize the fuzzy listing selector
  useEffect(() => {
    if (dbListings.length > 0 && !fuzzyListingId) {
      handleSelectFuzzyListing(dbListings[0].id);
    }
  }, [dbListings]);

  const handleSelectFuzzyListing = (listingId) => {
    setFuzzyListingId(listingId);
    const found = dbListings.find((l) => l.id === listingId);
    if (found) {
      const ask = Number(found.askingPrice) || 30000;
      setAskingPrice(ask);
      setCondition(found.condition || "mixed");
      setQuantity(Number(found.quantity) || 1);

      // If real bids exist for this listing, pick the first bid
      if (found.bids && found.bids.length > 0) {
        setBidAmount(Number(found.bids[0].amount));
        setActiveBidId(found.bids[0].id);
      } else {
        setBidAmount(Math.round(ask * 0.75));
        setActiveBidId(null);
      }
    }
  };

  const handleSelectRealBid = (bid) => {
    setActiveBidId(bid.id);
    setBidAmount(Number(bid.amount));
    toast.success(`Evaluating real bid from ${bid.bidderName}: ₹${Number(bid.amount).toLocaleString()}`);
  };

  // Intuitive Scenario Presets to demonstrate why fuzzy logic works
  const applyFuzzyScenario = (scenario) => {
    setFuzzyDataSource("sandbox");
    setActiveBidId(null);
    if (scenario === "scrap_fair") {
      setAskingPrice(30000);
      setBidAmount(16000); // ~53% of ask
      setCondition("scrap");
      setQuantity(50);
      toast("Scenario applied: 53% price on Scrap is Fair!");
    } else if (scenario === "working_lowball") {
      setAskingPrice(30000);
      setBidAmount(16000); // ~53% of ask
      setCondition("working");
      setQuantity(10);
      toast("Scenario applied: The same 53% price on Working devices is an Unfair Lowball!");
    } else if (scenario === "bulk_wholesale") {
      setAskingPrice(80000);
      setBidAmount(68000); // 85% of ask
      setCondition("repairable");
      setQuantity(200);
      toast("Scenario applied: Bulk volume discount gives Fair Wholesale score!");
    }
  };

  useEffect(() => {
    loadDatabaseRecords();
  }, []);

  const loadDatabaseRecords = async () => {
    setLoadingData(true);
    try {
      const res = await axios.get("/api/genetic/matcher");
      if (res.data?.listings?.length) {
        setDbListings(res.data.listings);
        setSelectedListingId(res.data.listings[0].id);
      }
      if (res.data?.recyclers?.length) {
        setDbRecyclers(res.data.recyclers);
        setSelectedRecyclerId(res.data.recyclers[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load real records from PostgreSQL.");
    } finally {
      setLoadingData(false);
    }
  };

  const runRealGA = async () => {
    setGaRunning(true);
    setGaResult(null);
    try {
      const payload = {
        mode: gaMode,
        listingId: gaMode === "seller" ? selectedListingId : undefined,
        recyclerId: gaMode === "buyer" ? selectedRecyclerId : undefined,
        populationSize: 50,
        generations: 100,
        mutationRate: 0.15,
        tournamentK: 3,
      };

      const res = await axios.post("/api/genetic/matcher", payload);
      setGaResult(res.data);
      toast.success(
        gaMode === "seller"
          ? `GA Converged! Best buyer matched for "${res.data.product?.title.slice(0, 30)}..."`
          : `GA Converged! Best product lot matched for "${res.data.buyer?.name.slice(0, 30)}..."`
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "GA execution failed.");
    } finally {
      setGaRunning(false);
    }
  };

  const selectedListingObj = dbListings.find((l) => l.id === selectedListingId);
  const selectedRecyclerObj = dbRecyclers.find((r) => r.id === selectedRecyclerId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 pb-16">
      <Toaster position="top-right" />

      {/* Header Banner */}
      <section className="border-b border-slate-200/80 bg-white/70 py-10 px-4 sm:px-6 lg:px-8 dark:border-slate-800/80 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                <Dna className="h-3.5 w-3.5" />
                ACADEMIC SUBJECT 2 · SOFT COMPUTING & EVOLUTIONARY OPTIMIZATION
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Soft Computing <span className="text-indigo-600 dark:text-indigo-400">Evaluation Workbench</span>
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
                Demonstrating multi-variable Mamdani Fuzzy Inference System with Centroid Defuzzification (2A) and Genetic Algorithm on real PostgreSQL marketplace datasets with bidirectional Seller-Buyer Matching (2B).
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("fuzzy")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "fuzzy" 
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-400" 
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:white"
                }`}
              >
                <Sliders className="h-4 w-4" /> 2A: Mamdani Fuzzy FIS
              </button>
              <button
                onClick={() => setActiveTab("ga")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "ga" 
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-400" 
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:white"
                }`}
              >
                <Dna className="h-4 w-4" /> 2B: Real-Data Genetic Matcher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">

        {/* ─────────────────────────────────────────────────────────────
            FEATURE 2A: MAMDANI FUZZY INFERENCE SYSTEM
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "fuzzy" && (
          <div className="space-y-6">
            
            {/* ── INTUITIVE EXPLAINER: What is Mamdani Score? ── */}
            <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 p-6 dark:border-indigo-900/50 dark:bg-indigo-950/30 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                      What is the Mamdani Score and Why Does it Exist?
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                      In e-waste trading, <strong>price alone cannot decide if a bid is "fair"</strong>. 
                      If a buyer offers ₹16,000 on a ₹30,000 asking price (53%), is that a lowball or a good offer? 
                      <strong className="text-indigo-700 dark:text-indigo-300"> It depends on the Condition and the Quantity!</strong>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/40">
                        <span className="font-bold text-red-600 block">❌ Traditional Boolean Code (Hard Cliffs):</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          <code>if (bid &lt; 0.8 * ask) reject()</code> ignores condition completely. 79% is rejected, 80% is accepted. It fails in real marketplace commerce.
                        </span>
                      </div>
                      <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/40">
                        <span className="font-bold text-emerald-600 block">✓ Mamdani Fuzzy Soft Computing:</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          Uses human-like linguistic terms (<em>"slightly low"</em>, <em>"fair for scrap"</em>, <em>"wholesale bulk"</em>) and computes the exact physical <strong>Center of Gravity (Centroid)</strong> to output a fair score (0–100%).
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  size="xs" 
                  variant="light" 
                  onPress={() => setShowExplainer(!showExplainer)} 
                  className="text-slate-400 hover:text-slate-600 shrink-0"
                >
                  {showExplainer ? "Collapse" : "Expand"}
                </Button>
              </div>

              {/* 3 Clickable Demonstrations */}
              {showExplainer && (
                <div className="mt-5 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 block mb-2">
                    Click to test these 3 real-world comparison scenarios:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => applyFuzzyScenario("scrap_fair")}
                      className="p-3 text-left rounded-xl bg-white/90 dark:bg-slate-900/90 hover:border-indigo-500 border border-indigo-200/70 transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <span>⚡ Scenario 1: Scrap E-Waste</span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">Fair Market</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ₹16,000 offer on ₹30,000 ask, but condition is <strong>Scrap</strong>. The Mamdani FIS marks it as Fair!
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyFuzzyScenario("working_lowball")}
                      className="p-3 text-left rounded-xl bg-white/90 dark:bg-slate-900/90 hover:border-indigo-500 border border-indigo-200/70 transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
                        <span>⚡ Scenario 2: Working PCs</span>
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">Unfair Lowball</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        The exact same ₹16,000 offer, but condition is <strong>Working</strong>. Mamdani catches the lowball!
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyFuzzyScenario("bulk_wholesale")}
                      className="p-3 text-left rounded-xl bg-white/90 dark:bg-slate-900/90 hover:border-indigo-500 border border-indigo-200/70 transition shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                        <span>⚡ Scenario 3: Bulk Corporate</span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">Wholesale Fair</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ₹68,000 on ₹80,000 for 200 items. Mamdani accounts for commercial bulk wholesale margin.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Mode Switcher & Real Database Grounding Header ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Select Data Grounding Source:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFuzzyDataSource("database");
                      if (dbListings.length > 0) handleSelectFuzzyListing(dbListings[0].id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      fuzzyDataSource === "database"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    Live PostgreSQL Listings & Real Bids
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuzzyDataSource("sandbox")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      fuzzyDataSource === "sandbox"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Sliders className="h-4 w-4" />
                    Interactive Sandbox Simulator
                  </button>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-500">
                <span>Database Status: </span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{dbListings.length} Live PostgreSQL Listings</strong>
              </div>
            </div>

            {/* ── Real Database Listing & Real Bids Panel ── */}
            {fuzzyDataSource === "database" && (
              <div className="rounded-2xl border border-indigo-200/80 bg-white p-5 dark:border-indigo-900/50 dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Store className="h-4 w-4 text-indigo-600" />
                      Select Real PostgreSQL Listing to Evaluate:
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pulls live asking price, device condition, lot quantity, and real buyer bids directly from the database.
                    </p>
                  </div>
                  <button 
                    onClick={loadDatabaseRecords} 
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 self-start sm:self-auto font-medium"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Refresh Listings
                  </button>
                </div>

                {dbListings.length > 0 ? (
                  <div className="space-y-4">
                    <select
                      value={fuzzyListingId}
                      onChange={(e) => handleSelectFuzzyListing(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      {dbListings.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title.slice(0, 50)} — ₹{Number(l.askingPrice).toLocaleString()} ({l.condition}, {l.quantity} {l.unit}) • {l.bids?.length || 0} real bids
                        </option>
                      ))}
                    </select>

                    {/* Listing Summary Badges */}
                    {(() => {
                      const cur = dbListings.find(l => l.id === fuzzyListingId) || dbListings[0];
                      if (!cur) return null;
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Asking Price</span>
                            <span className="font-mono font-bold text-indigo-600 text-sm">₹{Number(cur.askingPrice).toLocaleString()}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Condition</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{cur.condition}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Quantity</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{cur.quantity} {cur.unit}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Buyer Bids</span>
                            <span className="font-mono font-bold text-emerald-600">{cur.bids?.length || 0} in Database</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Real Bids Table from PostgreSQL */}
                    {(() => {
                      const cur = dbListings.find(l => l.id === fuzzyListingId) || dbListings[0];
                      const bids = cur?.bids || [];
                      if (bids.length === 0) {
                        return (
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                            <span>No buyer bids currently submitted on this listing in PostgreSQL.</span>
                            <span className="text-indigo-600 font-semibold">Test custom offers using the simulator below ↓</span>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                            Real Buyer Bids on This Listing (Click any bid to inspect in FIS):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {bids.map((b) => {
                              const bEval = evaluateBidFairness(b.amount, cur.askingPrice, cur.condition, cur.quantity);
                              const isSelected = activeBidId === b.id;
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => handleSelectRealBid(b)}
                                  className={`p-3 text-left rounded-xl border transition-all ${
                                    isSelected
                                      ? "border-indigo-600 bg-indigo-50/80 dark:border-indigo-500 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500"
                                      : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                                      {b.bidderName}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      bEval.color === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300" :
                                      bEval.color === "yellow" ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300" :
                                      "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
                                    }`}>
                                      {bEval.label} · {bEval.score}/100
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between text-xs font-mono">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                      ₹{Number(b.amount).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {((b.amount / cur.askingPrice) * 100).toFixed(0)}% of ask
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-6">
                    {loadingData ? "Loading live database listings..." : "No open listings found in PostgreSQL database."}
                  </div>
                )}
              </div>
            )}

            {/* ── FIS Controls & Calculation Meter ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sliders Input Panel */}
              <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-indigo-600" />
                    Antecedent Crisp Inputs
                  </h3>
                  {activeBidId && (
                    <span className="text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      Real DB Bid Active
                    </span>
                  )}
                </div>

                {/* Slider 1: Asking Price */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Seller Asking Price</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">₹{askingPrice.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min={5000} max={150000} step={1000} 
                    value={askingPrice} 
                    onChange={(e) => {
                      setAskingPrice(Number(e.target.value));
                      setActiveBidId(null);
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Slider 2: Bid Amount */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Buyer Bid Amount</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">₹{bidAmount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min={2000} max={200000} step={1000} 
                    value={bidAmount} 
                    onChange={(e) => {
                      setBidAmount(Number(e.target.value));
                      setActiveBidId(null);
                    }}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Price Ratio (Bid ÷ Ask): {askingPrice > 0 ? (bidAmount / askingPrice).toFixed(2) : "1.00"}x
                  </span>
                </div>

                {/* Condition Selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Device Condition</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold capitalize">
                      {condition}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {["scrap", "mixed", "repairable", "working"].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => {
                          setCondition(cond);
                          setActiveBidId(null);
                        }}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-center capitalize transition ${
                          condition === cond
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 4: Quantity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Lot Quantity</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{quantity} units</span>
                  </div>
                  <input 
                    type="range" min={1} max={300} step={1} 
                    value={quantity} 
                    onChange={(e) => {
                      setQuantity(Number(e.target.value));
                      setActiveBidId(null);
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Defuzzification Centroid Formula:
                  </div>
                  <code className="text-[10px] block mt-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg font-mono text-indigo-700 dark:text-indigo-300">
                    x* = ∫ x · μ_agg(x) dx / ∫ μ_agg(x) dx  [Center of Gravity]
                  </code>
                </div>
              </div>

              {/* FIS Visualizer & Output Panel */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Defuzzified Meter Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Centroid Defuzzification Output</span>
                      <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                        Fairness Score: <span className="text-indigo-600 dark:text-indigo-400">{fuzzyOutput?.score ?? 50}/100</span>
                      </h2>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                      fuzzyOutput?.color === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300" :
                      fuzzyOutput?.color === "yellow" ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300" :
                      "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
                    }`}>
                      {fuzzyOutput?.label || "Evaluating"}
                    </div>
                  </div>

                  {/* Progress Bar Needle */}
                  <div className="mt-5 space-y-2">
                    <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex relative">
                      <div className="h-full bg-rose-400 w-[42%]" />
                      <div className="h-full bg-amber-400 w-[20%]" />
                      <div className="h-full bg-emerald-500 w-[38%]" />
                      {/* Needle indicator */}
                      <div 
                        className="absolute top-0 bottom-0 w-1.5 bg-slate-950 dark:bg-white shadow-md transition-all duration-300"
                        style={{ left: `${Math.max(0, Math.min(100, fuzzyOutput?.score ?? 50))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0% (Lowball)</span>
                      <span>42% (Borderline)</span>
                      <span>62% (Fair Bid)</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                    {fuzzyOutput?.explanation || "Mamdani FIS defuzzified with Center of Gravity."}
                  </p>
                </div>

                {/* Fuzzy Membership Firing Matrix */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    Antecedent Membership Firing Degrees (Fuzzification)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Price Ratio μ(R)</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600">{fuzzyOutput?.ratio ?? 1}x</span>
                      </div>
                      <div className="mt-2 text-xs font-mono space-y-1">
                        <div className="flex justify-between"><span>Low:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.priceRatio?.low ?? 0}</span></div>
                        <div className="flex justify-between"><span>Fair:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.priceRatio?.fair ?? 0}</span></div>
                        <div className="flex justify-between"><span>High:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.priceRatio?.high ?? 0}</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Condition μ(C)</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 capitalize">{condition}</span>
                      </div>
                      <div className="mt-2 text-xs font-mono space-y-1">
                        <div className="flex justify-between"><span>Poor:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.condition?.poor ?? 0}</span></div>
                        <div className="flex justify-between"><span>Moderate:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.condition?.moderate ?? 0}</span></div>
                        <div className="flex justify-between"><span>Good:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.condition?.good ?? 0}</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Quantity μ(Q)</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600">{quantity} units</span>
                      </div>
                      <div className="mt-2 text-xs font-mono space-y-1">
                        <div className="flex justify-between"><span>Small:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.quantity?.small ?? 0}</span></div>
                        <div className="flex justify-between"><span>Medium:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.quantity?.medium ?? 0}</span></div>
                        <div className="flex justify-between"><span>Bulk:</span> <span className="font-bold text-indigo-600">{fuzzyOutput?.memberships?.quantity?.bulk ?? 0}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Mamdani Rules Fired */}
                {fuzzyOutput?.activeRules && fuzzyOutput.activeRules.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Active Mamdani Rules Fired ({fuzzyOutput.activeRules.length} of 20 Rules)
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Min-conjunction clipping</span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {fuzzyOutput.activeRules.map((rule) => (
                        <div 
                          key={rule.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-xs font-mono"
                        >
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[80%]">
                            [Rule {rule.id}] {rule.text}
                          </span>
                          <span className="font-bold text-indigo-600 shrink-0">
                            α = {rule.strength}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            FEATURE 2B: REAL DATABASE GENETIC ALGORITHM (BIDIRECTIONAL)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "ga" && (
          <div className="space-y-6">
            
            {/* Mode Switcher: Seller Mode vs Buyer Mode */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Select Real Database Matching Perspective:</span>
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => { setGaMode("seller"); setGaResult(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      gaMode === "seller"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    Mode 1: Seller ("Select My Product → Algo Finds Best Buyer")
                  </button>

                  <button
                    onClick={() => { setGaMode("buyer"); setGaResult(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      gaMode === "buyer"
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <Factory className="h-4 w-4" />
                    Mode 2: Buyer ("Select My Profile → Algo Finds Best Product")
                  </button>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-500">
                <span>PostgreSQL Records: </span>
                <strong className="text-slate-900 dark:text-white">{dbListings.length} Listings</strong> · <strong className="text-slate-900 dark:text-white">{dbRecyclers.length} Recyclers</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Real Selection & Candidate Pool */}
              <div className="lg:col-span-1 space-y-4">
                
                {/* ── MODE 1: SELLER SELECTS PRODUCT ── */}
                {gaMode === "seller" ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Store className="h-4 w-4 text-indigo-600" />
                        Select Selling Product from Database:
                      </h3>
                      <button onClick={loadDatabaseRecords} className="text-slate-400 hover:text-slate-600">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <select
                      value={selectedListingId}
                      onChange={(e) => { setSelectedListingId(e.target.value); setGaResult(null); }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 font-semibold"
                    >
                      {dbListings.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title.slice(0, 42)}... (₹{Number(l.askingPrice).toLocaleString()})
                        </option>
                      ))}
                    </select>

                    {/* Selected Product Card */}
                    {selectedListingObj && (
                      <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900/40 dark:bg-indigo-950/30 text-xs space-y-1.5">
                        <div className="font-extrabold text-indigo-950 dark:text-white">{selectedListingObj.title}</div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Category: <strong>{selectedListingObj.category}</strong></span>
                          <span>Quantity: <strong>{selectedListingObj.quantity} {selectedListingObj.unit}</strong></span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Asking Price: <strong className="text-indigo-600 dark:text-indigo-400">₹{Number(selectedListingObj.askingPrice).toLocaleString()}</strong></span>
                          <span className="capitalize">Condition: <strong>{selectedListingObj.condition}</strong></span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Existing Bids in DB: {selectedListingObj.bids?.length || 0}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <strong>GA Multi-Objective Optimization:</strong> Evaluates buyer offer price (50%), verified enterprise/recycler credentials (30%), and engagement (20%).
                    </div>

                    <Button
                      onPress={runRealGA}
                      isLoading={gaRunning}
                      className="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-indigo-600/20"
                      startContent={!gaRunning && <Play className="h-4 w-4" />}
                    >
                      {gaRunning ? "Evolving 100 Generations..." : "🧬 Evolve GA to Find Best Buyer"}
                    </Button>
                  </div>
                ) : (
                  /* ── MODE 2: BUYER SELECTS RECYCLER PROFILE ── */
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Factory className="h-4 w-4 text-teal-600" />
                        Select Buyer / Recycler Profile:
                      </h3>
                      <button onClick={loadDatabaseRecords} className="text-slate-400 hover:text-slate-600">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <select
                      value={selectedRecyclerId}
                      onChange={(e) => { setSelectedRecyclerId(e.target.value); setGaResult(null); }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 font-semibold"
                    >
                      {dbRecyclers.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name.slice(0, 38)} ({r.typeWaste.slice(0, 25)}...)
                        </option>
                      ))}
                    </select>

                    {/* Selected Recycler Card */}
                    {selectedRecyclerObj && (
                      <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/60 dark:border-teal-900/40 dark:bg-teal-950/30 text-xs space-y-1.5">
                        <div className="font-extrabold text-teal-950 dark:text-white">{selectedRecyclerObj.name}</div>
                        <div className="text-slate-600 dark:text-slate-300">
                          <strong>Waste Specialization:</strong> {selectedRecyclerObj.typeWaste}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          <strong>Location:</strong> {selectedRecyclerObj.address}
                        </div>
                        <p className="text-[11px] text-slate-500 italic">
                          "{selectedRecyclerObj.description || 'Govt-authorized e-waste dismantling facility'}"
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <strong>GA Multi-Objective Optimization:</strong> Evaluates recycler waste compatibility (45%), scrap recovery yield/margin (35%), and bulk scale (20%).
                    </div>

                    <Button
                      onPress={runRealGA}
                      isLoading={gaRunning}
                      className="w-full bg-teal-600 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-teal-600/20"
                      startContent={!gaRunning && <Play className="h-4 w-4" />}
                    >
                      {gaRunning ? "Evolving 100 Generations..." : "🧬 Evolve GA to Find Best Product Lot"}
                    </Button>
                  </div>
                )}

                {/* Candidate Pool Inspector */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Candidate Pool from PostgreSQL:
                  </span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {gaMode === "seller" ? (
                      (selectedListingObj?.bids?.length ? selectedListingObj.bids : dbRecyclers.slice(0, 6)).map((item, idx) => (
                        <div key={item.id || idx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs flex justify-between items-center">
                          <div className="max-w-[70%]">
                            <div className="font-bold truncate">{item.bidderName || item.name}</div>
                            <div className="text-[10px] text-slate-500">{item.amount ? `₹${Number(item.amount).toLocaleString()}` : item.typeWaste?.slice(0, 28)}</div>
                          </div>
                          <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                            Gene [{idx}]
                          </span>
                        </div>
                      ))
                    ) : (
                      dbListings.slice(0, 6).map((l, idx) => (
                        <div key={l.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs flex justify-between items-center">
                          <div className="max-w-[70%]">
                            <div className="font-bold truncate">{l.title}</div>
                            <div className="text-[10px] text-slate-500">{l.category} · ₹{Number(l.askingPrice).toLocaleString()}</div>
                          </div>
                          <span className="text-[10px] font-mono bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                            Gene [{idx}]
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: GA Simulation Results on Real Data */}
              <div className="lg:col-span-2 space-y-6">
                {gaResult ? (
                  <>
                    {/* Winner Card */}
                    <div className={`rounded-2xl border p-6 shadow-sm ${
                      gaMode === "seller" 
                        ? "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-950/30" 
                        : "border-teal-200 bg-teal-50/70 dark:border-teal-900/50 dark:bg-teal-950/30"
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                            gaMode === "seller" 
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300" 
                              : "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300"
                          }`}>
                            <Award className="h-4 w-4 text-amber-500" />
                            {gaMode === "seller" ? "Optimal Buyer Match (Fittest Gene)" : "Optimal Product Lot (Fittest Gene)"}
                          </div>
                          <h2 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">
                            {gaMode === "seller" ? (gaResult.winner?.bidderName || gaResult.winner?.name) : gaResult.winner?.title}
                          </h2>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black font-mono">
                            {gaMode === "seller" 
                              ? `₹${Number(gaResult.winner?.amount || 0).toLocaleString()}` 
                              : `₹${Number(gaResult.winner?.askingPrice || 0).toLocaleString()}`}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {gaMode === "seller" ? "Bid Valuation" : "Asking Price"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">
                        {gaMode === "seller" 
                          ? `"${gaResult.winner?.message || 'Authorized recycler with verified doorstep transport.'}"`
                          : `"${gaResult.winner?.category} · ${gaResult.winner?.quantity} ${gaResult.winner?.unit} · Condition: ${gaResult.winner?.condition}"`}
                      </p>

                      {/* Real Breakdown Scores */}
                      <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                        <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs font-mono font-bold text-indigo-600 block">
                            {((gaResult.winnerScore || 0) * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-500">Fitness (J)</span>
                        </div>

                        {gaMode === "seller" ? (
                          <>
                            <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-mono font-bold text-emerald-600 block">
                                {gaResult.breakdown?.priceScore}
                              </span>
                              <span className="text-[10px] text-slate-500">Price Utility</span>
                            </div>
                            <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-mono font-bold text-blue-600 block">
                                {gaResult.breakdown?.roleScore}
                              </span>
                              <span className="text-[10px] text-slate-500">Credential</span>
                            </div>
                            <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-mono font-bold text-purple-600 block">
                                {gaResult.breakdown?.messageScore}
                              </span>
                              <span className="text-[10px] text-slate-500">Engagement</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-mono font-bold text-teal-600 block">
                                {gaResult.breakdown?.categoryMatch}
                              </span>
                              <span className="text-[10px] text-slate-500">Category Fit</span>
                            </div>
                            <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-mono font-bold text-emerald-600 block">
                                {gaResult.breakdown?.marginYield}
                              </span>
                              <span className="text-[10px] text-slate-500">Yield Margin</span>
                            </div>
                            <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-mono font-bold text-blue-600 block">
                                {gaResult.breakdown?.scaleVolume}
                              </span>
                              <span className="text-[10px] text-slate-500">Scale Volume</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Generational Convergence Curve */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                          Generational Fitness Convergence Curve ({gaResult.generationsRun} Epochs)
                        </h4>
                        <span className="text-xs font-mono text-slate-500">
                          Tournament k=3 · OX1 Crossover · Elitism
                        </span>
                      </div>

                      {/* SVG Curve */}
                      <div className="h-48 w-full bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3 flex items-end relative overflow-hidden border border-slate-100 dark:border-slate-800">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <polyline
                            fill="none"
                            stroke={gaMode === "seller" ? "#6366f1" : "#0d9488"}
                            strokeWidth="2.5"
                            points={gaResult.history.map((val, idx) => {
                              const x = (idx / (gaResult.history.length - 1)) * 100;
                              const y = 100 - (val * 100);
                              return `${x},${y}`;
                            }).join(" ")}
                          />
                        </svg>
                        <div className="absolute top-2 left-3 text-[10px] font-mono text-indigo-600 font-bold">
                          Optimal Fitness: {Math.max(...gaResult.history)}
                        </div>
                        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
                          Gen {gaResult.generationsRun}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>Generation 1 Initial: {gaResult.history[0]}</span>
                        <span>Generation 100 Converged: {gaResult.history[gaResult.history.length - 1]}</span>
                      </div>
                    </div>

                    {/* Chromosome Gene Inspector */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Fittest Chromosome Gene Order
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {gaResult.bestChromosome?.map((gene, idx) => (
                          <div key={idx} className={`px-3 py-1.5 rounded-xl text-xs font-mono border ${
                            idx === 0 
                              ? (gaMode === "seller" ? "bg-indigo-600 text-white font-bold" : "bg-teal-600 text-white font-bold")
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}>
                            {idx === 0 ? "★ Winning Match (Gene 0)" : `Rank ${idx + 1}: Index [${gene}]`}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-center py-24 flex flex-col items-center justify-center">
                    <Dna className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Real PostgreSQL Genetic Algorithm Ready
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 max-w-md">
                      {gaMode === "seller"
                        ? "Select a real selling product from the dropdown and click 'Evolve GA to Find Best Buyer'. The algorithm will evaluate real bids and certified recyclers."
                        : "Select a real buyer profile from the dropdown and click 'Evolve GA to Find Best Product Lot'. The algorithm will evaluate active PostgreSQL listings."}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
