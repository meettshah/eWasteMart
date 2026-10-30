"use client";

import Link from "next/link";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@nextui-org/react";
import PaytmCheckout from "@/components/PaytmCheckout";
import PickupScheduler from "@/components/PickupScheduler";
import PickupCard from "@/components/PickupCard";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  IndianRupee, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Tag, 
  Box, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
  HelpCircle
} from "lucide-react";

const SELLER_ROLES = ["user", "bulk_seller", "enterprise"];
const BIDDER_ROLES = ["recycler", "enterprise"];

const categories = [
  "All Categories",
  "Computers and peripherals",
  "Mobile and personal devices",
  "Televisions and displays",
  "Audio and video equipment",
  "Networking devices",
  "Batteries and chargers",
  "Mixed e-waste",
];

const emptyListing = {
  title: "",
  category: "Computers and peripherals",
  quantity: 1,
  unit: "items",
  condition: "mixed",
  location: "",
  askingPrice: "",
  description: "",
};

export default function Marketplace() {
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [listingForm, setListingForm] = useState(emptyListing);
  const [bidForms, setBidForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimateResult, setEstimateResult] = useState(null);
  const [message, setMessage] = useState("");
      const [highlightedBidId, setHighlightedBidId] = useState(null);
  
  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'open' | 'my_listings' | 'my_bids'

  const role = session?.user?.role;
  const canSell = SELLER_ROLES.includes(role);
  const canBid = BIDDER_ROLES.includes(role);

  const stats = useMemo(() => {
    const open = listings.filter((listing) => listing.status === "open").length;
    const bids = listings.reduce((count, listing) => count + (listing.bids?.length || 0), 0);
    return { open, bids, sold: listings.length - open };
  }, [listings]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/listings");
      setListings(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load marketplace listings.");
    } finally {
      setLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setMessage("✓ Payment confirmed! You can now schedule a pickup.");
      router.replace("/marketplace");
    } else if (payment === "failed") {
      setMessage("Payment was not completed. Please try again.");
      router.replace("/marketplace");
    } else if (payment === "tampered") {
      setMessage("Payment verification failed. Please contact support.");
      router.replace("/marketplace");
    }
  }, [searchParams, router]);

  useEffect(() => {
    loadListings();

    // Check if prefill data exists from Gen AI Studio
    try {
      const prefillRaw = localStorage.getItem("ewastemart_prefill_listing");
      if (prefillRaw) {
        const prefillData = JSON.parse(prefillRaw);
        if (prefillData && prefillData.title) {
          setListingForm((prev) => ({
            ...prev,
            title: prefillData.title || prev.title,
            category: prefillData.category || prev.category,
            quantity: prefillData.quantity || prev.quantity,
            unit: prefillData.unit || prev.unit,
            condition: prefillData.condition || prev.condition,
            location: prefillData.location || prev.location,
            askingPrice: prefillData.askingPrice || prev.askingPrice,
            description: prefillData.description || prev.description,
            imageUrl: prefillData.imageUrl || prev.imageUrl || "",
          }));
          setMessage("✨ AI listing details loaded from Gen AI Studio! Review and publish below.");
          localStorage.removeItem("ewastemart_prefill_listing");
          setTimeout(() => {
            const el = document.getElementById("create-listing-form");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 350);
        }
      }
    } catch (e) {
      console.warn("Could not parse prefill listing:", e);
    }
  }, []);

  const updateListingField = (field, value) => {
    setListingForm((current) => ({ ...current, [field]: value }));
  };

  const updateBidField = (listingId, field, value) => {
    setBidForms((current) => ({
      ...current,
      [listingId]: { amount: "", message: "", ...current[listingId], [field]: value },
    }));
  };

  const createListing = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = { ...listingForm, impact: estimateResult?.impact };
      await axios.post("/api/listings", payload);
      setListingForm(emptyListing);
      setEstimateResult(null);
            setMessage("Listing created successfully. Verified recyclers can now place bids.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create listing.");
    } finally {
      setSaving(false);
    }
  };

  const estimatePrice = async () => {
    if (!listingForm.description || !listingForm.title || !listingForm.category) {
      setMessage("Please fill out Title, Category, and Description first for an accurate estimate.");
      return;
    }
    setEstimating(true);
    setMessage("");
    setEstimateResult(null);
    try {
      const res = await axios.post("/api/estimate", listingForm);
      const { min, max, reasoning, impact } = res.data;
      setEstimateResult({ min, max, reasoning, impact });
    } catch (error) {
      setMessage("Could not get AI estimate.");
    } finally {
      setEstimating(false);
    }
  };

  const placeBid = async (listingId) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/bid`, bidForms[listingId] || {});
      setBidForms((current) => ({ ...current, [listingId]: { amount: "", message: "" } }));
      setMessage("Bid placed successfully. Seller has been notified.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not place bid.");
    } finally {
      setSaving(false);
    }
  };

  const approveBid = async (listingId, bidId) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/approve`, { bidId });
      setMessage("Bid approved. Lot is marked as sold to the selected buyer.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not approve bid.");
    } finally {
      setSaving(false);
    }
  };

  const sendCounterOffer = async (listingId, bidId, amount) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/bid/${bidId}/counter`, { amount: Number(amount) });
      setMessage("Counter offer sent successfully.");
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not send counter offer.");
    } finally {
      setSaving(false);
    }
  };

  const respondCounterOffer = async (listingId, bidId, action) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.post(`/api/listings/${listingId}/bid/${bidId}/counter`, { action });
      setMessage(`Counter offer ${action}ed.`);
      await loadListings();
    } catch (error) {
      setMessage(error.response?.data?.message || `Could not ${action} counter offer.`);
    } finally {
      setSaving(false);
    }
  };

  // Filtered listings computation
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesLoc = item.location?.toLowerCase().includes(query);
        const matchesSeller = item.sellerName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesSeller) return false;
      }
      // Category filter
      if (selectedCategory !== "All Categories" && item.category !== selectedCategory) {
        return false;
      }
      // Tab filter
      if (filterTab === "open" && item.status !== "open") return false;
      if (filterTab === "my_listings" && item.sellerEmail !== session?.user?.email) return false;
      if (filterTab === "my_bids") {
        const hasMyBid = item.bids?.some((b) => b.bidderEmail === session?.user?.email);
        if (!hasMyBid) return false;
      }
      return true;
    });
  }, [listings, searchQuery, selectedCategory, filterTab, session?.user?.email]);

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-8 dark:bg-[#090D14] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* ─── Modern Acrylic Desk Header ───────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>CPCB Verified Trading Desk</span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                E-Waste Bidding Desk
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Transparent liquidation for decommissioned electronics. Sellers list verified lots, authorized recyclers bid with Mamdani fuzzy fairness, and sellers approve one buyer.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.open}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Open Lots</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="font-heading text-2xl font-bold text-sky-600 dark:text-sky-400">{stats.bids}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Live Bids</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <span className="font-heading text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.sold}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Notification Alert Banner ──────────────────────────── */}
        {message && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-50 px-5 py-3.5 text-sm font-medium text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage("")} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {/* ─── Search, Tabs & Filter Segment ────────────────────── */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="inline-flex rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {[
              { id: "all", label: `All Lots (${listings.length})` },
              { id: "open", label: `Open (${stats.open})` },
              { id: "my_listings", label: "My Listings" },
              { id: "my_bids", label: "My Active Bids" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  filterTab === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Category Dropdown */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search lots, city, or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 text-xs"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs max-w-[170px]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ─── Main Two-Column Grid ─────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* ─── Left Column: Listing Creation Dock (lg:col-span-4) ─── */}
          <section className="lg:col-span-4 space-y-6">
            <div id="create-listing-form" className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    Publish E-Waste Lot
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Individual sellers, bulk IT & enterprises
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Box className="h-4 w-4" />
                </div>
              </div>

              {!canSell ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  You are logged in as a <strong>{role || "guest"}</strong>. Recyclers can bid on lots, but are restricted from publishing seller lots.
                </div>
              ) : (
                <form onSubmit={createListing} className="mt-5 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Lot Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={listingForm.title}
                      onChange={(e) => updateListingField("title", e.target.value)}
                      placeholder="e.g., 50 Dell Latitude Laptops (2019)"
                      className="w-full text-xs"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={listingForm.category}
                      onChange={(e) => updateListingField("category", e.target.value)}
                      className="w-full text-xs"
                    >
                      {categories.filter(c => c !== "All Categories").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity & Units */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Quantity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={listingForm.quantity}
                        onChange={(e) => updateListingField("quantity", e.target.value)}
                        placeholder="50"
                        className="w-full text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Unit <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={listingForm.unit}
                        onChange={(e) => updateListingField("unit", e.target.value)}
                        className="w-full text-xs"
                      >
                        <option value="items">Items / Units</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="tons">Metric Tonnes</option>
                      </select>
                    </div>
                  </div>

                  {/* Condition & Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Condition <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={listingForm.condition}
                        onChange={(e) => updateListingField("condition", e.target.value)}
                        className="w-full text-xs"
                      >
                        <option value="working">Working / Refurbishable</option>
                        <option value="repairable">Repairable</option>
                        <option value="scrap">Dead Scrap / Parts</option>
                        <option value="mixed">Mixed Lot</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Expected (INR)
                      </label>
                      <div className="relative">
                        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          min="0"
                          value={listingForm.askingPrice}
                          onChange={(e) => updateListingField("askingPrice", e.target.value)}
                          placeholder="0"
                          className="w-full pl-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pickup Address / City <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        value={listingForm.location}
                        onChange={(e) => updateListingField("location", e.target.value)}
                        placeholder="e.g. Andheri East, Mumbai, MH"
                        className="w-full pl-8 text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Specifications & Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={listingForm.description}
                      onChange={(e) => updateListingField("description", e.target.value)}
                      placeholder="Include brand, processor, battery status, or serial notes for higher valuation."
                      rows={3}
                      className="w-full text-xs"
                      required
                    />
                  </div>

                  {/* AI Photo Preview if attached */}
                  {listingForm.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 flex items-center gap-3">
                      <img 
                        src={listingForm.imageUrl} 
                        alt="E-waste lot" 
                        className="h-14 w-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700" 
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          ✨ AI Synthesized Photo Attached
                        </span>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Hardware visual asset will be saved to your live listing
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateListingField("imageUrl", "")}
                        className="text-xs text-rose-500 hover:text-rose-700 p-1 font-bold"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Academic Labs Reference */}
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 p-3.5 dark:bg-slate-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-600" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Need AI listing copywriting or CV scanner?
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/gen-ai" target="_blank" className="font-bold text-violet-600 hover:underline">
                        Gen AI Lab →
                      </Link>
                      <Link href="/computer-vision" target="_blank" className="font-bold text-teal-600 hover:underline">
                        CV Lab →
                      </Link>
                    </div>
                  </div>

                  {/* ─── AI Price Estimate Result ─── */}
                  {estimateResult && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>AI Estimated Market Range</span>
                        </div>
                        <span className="font-heading font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                          ₹{estimateResult.min} – ₹{estimateResult.max}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {estimateResult.reasoning}
                      </p>
                      
                      {estimateResult.impact && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            🌱 {estimateResult.impact.co2SavedKg}kg CO₂e
                          </span>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            ♻️ {estimateResult.impact.metalsRecoveredKg}kg Metals
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            🛡️ {estimateResult.impact.toxinsDivertedKg}kg Toxins
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => updateListingField("askingPrice", Math.round((estimateResult.min + estimateResult.max) / 2))}
                        className="mt-3 block text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        + Apply Median Price (₹{Math.round((estimateResult.min + estimateResult.max) / 2)})
                      </button>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      type="button"
                      isLoading={estimating}
                      onPress={estimatePrice}
                      variant="flat"
                      color="secondary"
                      className="rounded-xl text-xs font-semibold"
                    >
                      {estimating ? "Calculating..." : "Auto-Estimate"}
                    </Button>
                    <Button
                      type="submit"
                      isLoading={saving}
                      color="primary"
                      className="rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                    >
                      Publish Lot
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* ─── Right Column: Live Listings Feed (lg:col-span-8) ─── */}
          <section className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <p className="mt-3 text-xs font-semibold text-slate-500">Loading live trading floor...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <Box className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
                  No matching e-waste lots found
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Try adjusting your search keywords, clear category filters, or publish the first lot using the panel on the left.
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All Categories"); setFilterTab("all"); }}
                  className="mt-4 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredListings.map((listing) => {
                const isOwner = listing.sellerEmail === session?.user?.email;
                const bidForm = bidForms[listing._id] || { amount: "", message: "" };
                const approvedBid = listing.bids?.find((bid) => bid.status === "approved");
                const isParticipant = (session?.user?.email === listing.sellerEmail) || (approvedBid?.bidderEmail === session?.user?.email);
                const isSoldOut = listing.paymentStatus === "paid";
                const isCompletelySoldOut = isSoldOut && !isParticipant;
                const pendingBids = listing.bids?.filter((b) => b.status === "pending") || [];

                return (
                  <article
                    key={listing._id}
                    className={`relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 ${
                      isCompletelySoldOut ? "opacity-60 grayscale-[0.3]" : ""
                    }`}
                  >
                    {/* Top Row: Title, Status, Price */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                            {listing.title}
                          </h3>
                          
                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isSoldOut 
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              : listing.status === "open"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-blue-50 text-blue-700 border border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isSoldOut ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                            {isSoldOut ? "SOLD OUT" : listing.status?.toUpperCase()}
                          </span>

                          {/* Condition Pill */}
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {listing.condition}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {listing.category}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {listing.quantity} {listing.unit}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.location}
                          </span>
                        </div>
                      </div>

                      {/* Asking Price Card */}
                      <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-right dark:border-slate-800 dark:bg-slate-800/40">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Expected Value</span>
                        <div className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
                          ₹{Number(listing.askingPrice || 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] text-slate-400">Seller: {listing.sellerName || "Verified"}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {listing.description}
                    </p>

                    {/* Environmental Impact Metrics */}
                    {listing.impact && (listing.impact.co2SavedKg > 0) && (
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300">
                          🌱 {listing.impact.co2SavedKg}kg CO₂e Mitigated
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-800 border border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-300">
                          ♻️ {listing.impact.metalsRecoveredKg}kg Metals Recycled
                        </span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300">
                          🛡️ {listing.impact.toxinsDivertedKg}kg Toxic Waste Diverted
                        </span>
                      </div>
                    )}

                    {/* Sold to Buyer Alert */}
                    {approvedBid && (
                      <div className="mt-4 flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-50/70 p-3.5 text-xs text-blue-950 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span>
                            Sold to <strong>{approvedBid.bidderName}</strong> for <strong>₹{Number(approvedBid.amount).toLocaleString("en-IN")}</strong>.
                          </span>
                        </div>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Deal Closed</span>
                      </div>
                    )}

                    

                    {/* ─── Payment & Logistics Workflow ─── */}
                    {listing.status === "sold" && (() => {
                      const isApprovedBuyer = approvedBid?.bidderEmail === session?.user?.email;
                      if (isApprovedBuyer && listing.paymentStatus === "unpaid") {
                        return (
                          <div className="mt-4">
                            <PaytmCheckout listing={listing} bidId={approvedBid._id} amount={approvedBid.amount} onSuccess={loadListings} onFailure={loadListings} />
                          </div>
                        );
                      }
                      if (isApprovedBuyer && listing.paymentStatus === "paid" && !listing.pickupId) {
                        return (
                          <div className="mt-4">
                            <PickupScheduler listing={listing} onScheduled={loadListings} />
                          </div>
                        );
                      }
                      if (listing.pickupId && (isOwner || isApprovedBuyer)) {
                        return (
                          <div className="mt-4">
                            <PickupCard pickupId={listing.pickupId} onUpdate={loadListings} />
                          </div>
                        );
                      }
                      if (isOwner && listing.paymentStatus === "unpaid") {
                        return (
                          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-50/70 p-3.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                            Waiting for the approved buyer to deposit escrow payment before dispatch logistics unlock.
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* ─── Recycler Bid Placement Form ─── */}
                    {listing.status === "open" && canBid && !isOwner && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                        <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Submit Competitive Recycler Bid
                        </span>
                        <div className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
                          <div className="relative">
                            <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              min="1"
                              value={bidForm.amount}
                              onChange={(e) => updateBidField(listing._id, "amount", e.target.value)}
                              placeholder="Offer amount"
                              className="w-full pl-8 text-xs"
                            />
                          </div>
                          <input
                            value={bidForm.message}
                            onChange={(e) => updateBidField(listing._id, "message", e.target.value)}
                            placeholder="Pickup timeline, R2/CPCB license, or compliance terms..."
                            className="w-full text-xs"
                          />
                          <Button
                            isLoading={saving}
                            color="primary"
                            onPress={() => placeBid(listing._id)}
                            className="rounded-xl text-xs font-bold"
                          >
                            Submit Bid
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* ─── Bids Feed & Genetic Matcher (Feature 2B) ─── */}
                    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Submitted Offers ({listing.bids?.length || 0})
                        </span>

                        
                      </div>

                      <div className="space-y-2">
                        {listing.bids?.length ? (
                          listing.bids.map((bid) => {
                            const isBidder = session?.user?.email === bid.bidderEmail;
                            const hasPendingCounter = bid.counterOffer?.status === "pending";
                            const isHighlighted = highlightedBidId && String(bid._id) === String(highlightedBidId);

                            return (
                              <div
                                key={bid._id}
                                className={`flex flex-col gap-3 rounded-2xl border p-3.5 transition-all sm:flex-row sm:items-center sm:justify-between ${
                                  isHighlighted
                                    ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-950/40"
                                    : "border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/50"
                                }`}
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                                      ₹{Number(bid.amount).toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-xs text-slate-500">by {bid.bidderName}</span>
                                    
                                    {/* Feature 2A: Mamdani Fuzzy Logic Rating */}
                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified Offer</span>

                                    {isHighlighted && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                        🧬 GA Top Recommendation
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                                    <span>{bid.bidderRole}</span>
                                    <span>•</span>
                                    <span className="capitalize">{bid.status}</span>
                                  </div>

                                  {bid.message && (
                                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                      &ldquo;{bid.message}&rdquo;
                                    </p>
                                  )}

                                  {bid.counterOffer && (
                                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                      <span>Counter: ₹{Number(bid.counterOffer.amount).toLocaleString("en-IN")} ({bid.counterOffer.status})</span>
                                    </div>
                                  )}
                                </div>

                                {/* Actions for Seller & Bidder */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {isOwner && listing.status === "open" && bid.status === "pending" && (
                                    <>
                                      {!hasPendingCounter && (
                                        <div className="flex items-center gap-1.5">
                                          <input
                                            type="number"
                                            placeholder="Counter ₹"
                                            className="w-24 px-2 py-1 text-xs"
                                            id={`counter-${bid._id}`}
                                          />
                                          <Button
                                            size="sm"
                                            isLoading={saving}
                                            variant="flat"
                                            color="warning"
                                            className="rounded-lg text-xs"
                                            onPress={() => {
                                              const amt = document.getElementById(`counter-${bid._id}`)?.value;
                                              if (amt) sendCounterOffer(listing._id, bid._id, amt);
                                            }}
                                          >
                                            Counter
                                          </Button>
                                        </div>
                                      )}
                                      <Button
                                        size="sm"
                                        isLoading={saving}
                                        color="success"
                                        className="rounded-lg text-xs font-bold text-white"
                                        onPress={() => approveBid(listing._id, bid._id)}
                                      >
                                        Approve Buyer
                                      </Button>
                                    </>
                                  )}

                                  {isBidder && hasPendingCounter && (
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        size="sm"
                                        isLoading={saving}
                                        color="success"
                                        className="rounded-lg text-xs font-bold text-white"
                                        onPress={() => respondCounterOffer(listing._id, bid._id, "accept")}
                                      >
                                        Accept Counter
                                      </Button>
                                      <Button
                                        size="sm"
                                        isLoading={saving}
                                        color="danger"
                                        variant="flat"
                                        className="rounded-lg text-xs"
                                        onPress={() => respondCounterOffer(listing._id, bid._id, "reject")}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 dark:border-slate-800">
                            No bids received yet. Verified recyclers review listings within 24 hours.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
