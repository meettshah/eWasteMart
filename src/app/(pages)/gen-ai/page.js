"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Sparkles, 
  Bot, 
  User, 
  Send, 
  Wand2, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Trash2,
  Copy,
  ExternalLink,
  Edit3,
  PlusCircle,
  Check,
  MapPin,
  IndianRupee,
  Tag,
  Box,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function GenAIPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("smart_studio");

  // ── 1A: Chatbot State ──
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am the eWasteMart Generative AI Assistant. I operate with multi-turn context memory across CPCB 2022 recycling regulations, scrap commodity index rates, and active marketplace lots. How can I assist you today?", 
      sender: "bot" 
    }
  ]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const endOfChatRef = useRef(null);

  const quickPrompts = [
    "Explain CPCB 2022 guidelines for corporate e-waste manifests.",
    "Calculate recoverable gold, copper & silver in 50 scrap smartphones.",
    "How does Mamdani Fuzzy FIS evaluate bid fairness in eWasteMart?",
    "What are the steps for verified doorstep OTP pickup?"
  ];

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  const handleSendChat = async (textToSend) => {
    const text = (textToSend || chatInput).trim();
    if (!text || chatLoading) return;

    const userMsg = { text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await axios.post("/api/openai", {
        content: text,
        history: conversationHistory,
      });
      const botReply = res.data.completion || "Response generated.";
      setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: botReply }
      ]);
    } catch (err) {
      toast.error("Chatbot query failed.");
      setMessages((prev) => [
        ...prev, 
        { text: "I encountered a network timeout. You can continue exploring marketplace listings or retry your inquiry.", sender: "bot" }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setConversationHistory([]);
    setMessages([{ text: "Conversation memory reset. Ask any question about e-waste disposal or market valuation.", sender: "bot" }]);
  };

  // ── 1B: Unified Single-Prompt Smart Listing & Photo Studio ──
  const [singlePrompt, setSinglePrompt] = useState(
    "A batch of 12 vintage and modern smartphones neatly arranged on a clean blue workbench in an electronics recycling facility, depleted batteries, gold contacts"
  );
  const [studioLoading, setStudioLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedListing, setPublishedListing] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Unified Product State
  const [unifiedListing, setUnifiedListing] = useState({
    title: "12x Mixed Smartphones (Scrap)",
    category: "Mobile and personal devices",
    condition: "scrap",
    quantity: 12,
    unit: "items",
    askingPrice: 8500,
    location: "Mumbai, Maharashtra",
    description: "Decommissioned lot of 12 smartphones across mixed generations. Internal circuit boards, gold bond wires, and copper antenna coils intact. Ideal for certified metal recovery and battery neutralisation.",
    materials: ["Gold (Au)", "Copper (Cu)", "Lithium (Li)"],
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=85",
  });

  const studioPresets = [
    {
      title: "12x Mixed Smartphones",
      prompt: "A batch of 12 vintage and modern smartphones neatly arranged on a clean blue workbench in an electronics recycling facility, depleted batteries, gold contacts",
      category: "Mobile and personal devices",
      icon: "📱",
    },
    {
      title: "20x Server Motherboards",
      prompt: "Stack of 20 server motherboards with visible gold-plated PCI slots and capacitors, industrial e-waste sorting facility",
      category: "Computers and peripherals",
      icon: "⚡",
    },
    {
      title: "20x Dell OptiPlex Workstations",
      prompt: "20 decommissioned Dell OptiPlex Core i7 desktop workstations with 16GB DDR4 RAM and power supplies for certified IT asset recovery",
      category: "Computers and peripherals",
      icon: "🖥️",
    },
    {
      title: "15x Commercial CRT Monitors",
      prompt: "15 commercial CRT display monitors with heavy glass shells and copper deflection yokes ready for material reclamation",
      category: "Televisions and displays",
      icon: "📺",
    },
    {
      title: "10x Cisco Enterprise Routers",
      prompt: "10 decommissioned enterprise rackmount networking routers and gigabit switches with intact aluminum chassis",
      category: "Networking devices",
      icon: "🌐",
    },
  ];

  // Unified Generation Trigger: Both Info and Photo from a single prompt
  const handleSynthesizeUnifiedListing = async (overridePrompt) => {
    const promptText = (overridePrompt || singlePrompt).trim();
    if (!promptText) {
      toast.error("Please enter a prompt or select a preset.");
      return;
    }

    setStudioLoading(true);
    setPublishedListing(null);

    try {
      // 1. Generate Structured Listing Info with Gemini Few-Shot Prompting
      const listingRes = await axios.post("/api/ai/generate-listing", {
        prompt: promptText,
      });

      const listingData = listingRes.data;

      // 2. Generate/Resolve Photorealistic Product Photo
      let photoUrl = unifiedListing.imageUrl;
      try {
        const photoRes = await axios.post("/api/ai/generate-image", {
          prompt: listingData.photoPrompt || promptText,
          category: listingData.category,
          condition: listingData.condition,
        });
        if (photoRes.data?.imageUrl) {
          photoUrl = photoRes.data.imageUrl;
        }
      } catch (imgErr) {
        console.warn("Photo generation fallback:", imgErr.message);
      }

      // 3. Update Unified State with crisp title and image
      setUnifiedListing({
        title: listingData.title || "E-Waste Hardware Lot",
        category: listingData.category || "Computers and peripherals",
        condition: listingData.condition || "scrap",
        quantity: Number(listingData.quantity) || 1,
        unit: listingData.unit || "items",
        askingPrice: Number(listingData.askingPrice) || 10000,
        location: listingData.location || "Mumbai, Maharashtra",
        description: listingData.description || promptText,
        materials: Array.isArray(listingData.materials) ? listingData.materials : ["Copper (Cu)", "Gold (Au)"],
        imageUrl: photoUrl,
      });

      setIsEditing(false);
      toast.success("Listing & Photo synthesized from prompt!");
    } catch (err) {
      console.error("Studio synthesis error:", err);
      toast.error(err.response?.data?.message || "Synthesis failed. Please try again.");
    } finally {
      setStudioLoading(false);
    }
  };

  // Regenerate Photo Only
  const handleRegeneratePhotoOnly = async () => {
    setGeneratingPhoto(true);
    try {
      const res = await axios.post("/api/ai/generate-image", {
        prompt: unifiedListing.title + ", " + unifiedListing.category,
        category: unifiedListing.category,
        condition: unifiedListing.condition,
      });
      if (res.data?.imageUrl) {
        setUnifiedListing((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
        toast.success("New product visual asset synthesized!");
      }
    } catch (err) {
      toast.error("Could not regenerate photo.");
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // Direct Post / Publish to Marketplace
  const handlePublishToMarketplace = async () => {
    if (!session?.user) {
      toast.error("Please log in as a seller to publish this listing.");
      router.push("/login?callbackUrl=/gen-ai");
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        title: unifiedListing.title,
        category: unifiedListing.category,
        quantity: Number(unifiedListing.quantity),
        unit: unifiedListing.unit,
        condition: unifiedListing.condition,
        location: unifiedListing.location || "Mumbai, Maharashtra",
        askingPrice: Number(unifiedListing.askingPrice || 0),
        description: unifiedListing.description,
        imageUrl: unifiedListing.imageUrl,
        images: unifiedListing.imageUrl ? [unifiedListing.imageUrl] : [],
      };

      const res = await axios.post("/api/listings", payload);
      setPublishedListing(res.data.listing);
      toast.success("🎉 Published! Your listing is now live in the Marketplace.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to publish listing.";
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  // Open & Pre-fill in Marketplace Form
  const handleOpenInMarketplaceForm = () => {
    try {
      localStorage.setItem("ewastemart_prefill_listing", JSON.stringify(unifiedListing));
      toast.success("Details transferred! Opening Marketplace listing form...");
      setTimeout(() => {
        router.push("/marketplace");
      }, 300);
    } catch (e) {
      router.push("/marketplace");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      <Toaster position="top-right" />

      {/* Header Banner */}
      <section className="border-b border-slate-200/80 bg-white/95 px-4 py-8 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Artificial Intelligence Studio
                </span>
              </div>
              <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Generative AI Lab
              </h1>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Integrated Multi-Turn Large Language Models (Gemini 1.5) and Single-Prompt Instant Product Listing & Diffusion Synthesis.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 self-start md:self-auto border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <button
                onClick={() => setActiveTab("smart_studio")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === "smart_studio" 
                    ? "bg-white text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-400" 
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Wand2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                1B: Smart Listing & Photo Studio
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === "chat" 
                    ? "bg-white text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-400" 
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Bot className="h-4 w-4" /> 1A: Conversational LLM
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ─────────────────────────────────────────────────────────────
            FEATURE 1B: UNIFIED SINGLE-PROMPT SMART LISTING & PHOTO STUDIO
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "smart_studio" && (
          <div className="space-y-8">
            
            {/* Top Prompt Console */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold text-xs">
                      1B
                    </span>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      Single-Prompt Marketplace Listing & Photo Synthesizer
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Type a description of your e-waste lot. AI extracts concise commercial metadata, calculates scrap valuation, and synthesizes a photorealistic product asset simultaneously.
                  </p>
                </div>

                {/* Architecture Pills */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-lg bg-violet-50 px-2.5 py-1 font-mono font-semibold text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800">
                    LLM: Gemini 1.5 Flash
                  </span>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-mono font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    Diffusion: briaai/Fibo-2.0-dev
                  </span>
                </div>
              </div>

              {/* Single Prompt Input */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Describe Your E-Waste Lot (or click a preset):</span>
                    <span className="text-[11px] font-normal text-slate-500">Single prompt triggers both text + image pipeline</span>
                  </label>
                  <div className="relative mt-2">
                    <textarea
                      rows={3}
                      value={singlePrompt}
                      onChange={(e) => setSinglePrompt(e.target.value)}
                      placeholder="e.g. A batch of 12 vintage and modern smartphones on a workbench with depleted batteries for metal recovery..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 leading-relaxed outline-none"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evaluation Demo Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {studioPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSinglePrompt(preset.prompt);
                          handleSynthesizeUnifiedListing(preset.prompt);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-400 hover:bg-violet-50/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 transition shadow-2xs"
                      >
                        <span>{preset.icon}</span>
                        <span>{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                    <span>Produces concise 3–6 word title, specs, materials, and photorealistic asset</span>
                  </div>

                  <Button
                    isLoading={studioLoading}
                    onPress={() => handleSynthesizeUnifiedListing()}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl px-6 py-2.5 shadow-md shadow-violet-600/20"
                    startContent={!studioLoading && <Wand2 className="h-4 w-4" />}
                  >
                    {studioLoading ? "Synthesizing Listing & Photo..." : "✨ Synthesize Complete Listing & Photo"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Published Success Notification Banner */}
            {publishedListing && (
              <div className="rounded-3xl border border-emerald-300 bg-emerald-50/90 p-6 dark:border-emerald-800 dark:bg-emerald-950/40 shadow-sm animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Live on Marketplace
                      </span>
                      <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                        "{publishedListing.title}" is now published!
                      </h3>
                      <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                        Listing ID: <code className="font-mono font-bold text-emerald-900 dark:text-emerald-200">{publishedListing.id || publishedListing._id}</code> · Verified recyclers can now inspect specs and place competitive bids.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      <span>View in Marketplace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPublishedListing(null)}
                      className="rounded-xl border border-emerald-300 bg-white/80 px-3 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-white dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Product Studio Card & Edit Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Visual Product Card (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-violet-600" />
                      Synthesized Product Photo
                    </span>
                    <button
                      type="button"
                      onClick={handleRegeneratePhotoOnly}
                      disabled={generatingPhoto}
                      className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 flex items-center gap-1"
                    >
                      <RefreshCw className={`h-3 w-3 ${generatingPhoto ? "animate-spin" : ""}`} />
                      <span>{generatingPhoto ? "Regenerating..." : "Change Photo"}</span>
                    </button>
                  </div>

                  {/* Photo Display */}
                  <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800">
                    {unifiedListing.imageUrl ? (
                      <img
                        src={unifiedListing.imageUrl}
                        alt={unifiedListing.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImageIcon className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                    
                    {/* Badge Overlays */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        {unifiedListing.condition.toUpperCase()}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Synthesized
                      </span>
                    </div>
                  </div>

                  {/* Materials Chip Strip */}
                  {unifiedListing.materials && unifiedListing.materials.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Harvestable Materials & Urban Ores:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {unifiedListing.materials.map((mat, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          >
                            ⚗️ {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Listing Details & Actions (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
                  
                  {/* Header: Title & Edit Toggle */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                          {unifiedListing.category}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" /> {unifiedListing.location}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        {unifiedListing.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition flex items-center gap-1.5 shrink-0"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-violet-600" />
                      <span>{isEditing ? "Close Editor" : "Edit Details"}</span>
                    </button>
                  </div>

                  {/* Inline Editable Form (when Edit clicked) */}
                  {isEditing ? (
                    <div className="space-y-4 rounded-2xl bg-slate-50/80 p-4 border border-violet-200 dark:border-violet-900/40 dark:bg-slate-800/60">
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                        <span className="text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                          <Edit3 className="h-3.5 w-3.5" /> Modify Generated Parameters
                        </span>
                        <span className="text-[11px] text-slate-500">Keep titles concise (3–6 words)</span>
                      </div>

                      {/* Title Edit */}
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                          Lot Title (Short Commercial Headline)
                        </label>
                        <input
                          type="text"
                          value={unifiedListing.title}
                          onChange={(e) => setUnifiedListing({ ...unifiedListing, title: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder="e.g. 12x Mixed Smartphones (Scrap)"
                        />
                      </div>

                      {/* Category & Condition */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Category</label>
                          <select
                            value={unifiedListing.category}
                            onChange={(e) => setUnifiedListing({ ...unifiedListing, category: e.target.value })}
                            className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                          >
                            <option>Computers and peripherals</option>
                            <option>Mobile and personal devices</option>
                            <option>Televisions and displays</option>
                            <option>Audio and video equipment</option>
                            <option>Networking devices</option>
                            <option>Batteries and chargers</option>
                            <option>Mixed e-waste</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Condition</label>
                          <select
                            value={unifiedListing.condition}
                            onChange={(e) => setUnifiedListing({ ...unifiedListing, condition: e.target.value })}
                            className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                          >
                            <option value="scrap">Scrap (Dead / Parts)</option>
                            <option value="repairable">Repairable</option>
                            <option value="working">Working / Surplus</option>
                            <option value="mixed">Mixed Lot</option>
                          </select>
                        </div>
                      </div>

                      {/* Quantity, Unit & Asking Price */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Quantity</label>
                          <input
                            type="number"
                            value={unifiedListing.quantity}
                            onChange={(e) => setUnifiedListing({ ...unifiedListing, quantity: Number(e.target.value) })}
                            className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Unit</label>
                          <input
                            type="text"
                            value={unifiedListing.unit}
                            onChange={(e) => setUnifiedListing({ ...unifiedListing, unit: e.target.value })}
                            className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Expected (₹)</label>
                          <input
                            type="number"
                            value={unifiedListing.askingPrice}
                            onChange={(e) => setUnifiedListing({ ...unifiedListing, askingPrice: Number(e.target.value) })}
                            className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 font-bold text-emerald-600"
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Pickup Location</label>
                        <input
                          type="text"
                          value={unifiedListing.location}
                          onChange={(e) => setUnifiedListing({ ...unifiedListing, location: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Commercial Description</label>
                        <textarea
                          rows={3}
                          value={unifiedListing.description}
                          onChange={(e) => setUnifiedListing({ ...unifiedListing, description: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          onPress={() => setIsEditing(false)}
                          className="bg-violet-600 text-white font-bold text-xs rounded-xl"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Read-Only Spec Grid */
                    <div className="space-y-4">
                      {/* Metrics Strip */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Valuation</span>
                          <p className="mt-0.5 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            ₹{Number(unifiedListing.askingPrice || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Quantity</span>
                          <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                            {unifiedListing.quantity} {unifiedListing.unit}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Condition</span>
                          <p className="mt-0.5 text-base font-bold capitalize text-slate-900 dark:text-white">
                            {unifiedListing.condition}
                          </p>
                        </div>
                      </div>

                      {/* Description Text */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Generated Marketplace Copy:
                        </span>
                        <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed rounded-2xl bg-slate-50/60 p-3.5 border border-slate-100 dark:border-slate-800 dark:bg-slate-800/30">
                          {unifiedListing.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Primary Call-to-Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleOpenInMarketplaceForm}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition shadow-2xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      <span>Open in Marketplace Form</span>
                    </button>

                    <Button
                      isLoading={publishing}
                      onPress={handlePublishToMarketplace}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl px-6 py-2.5 shadow-md shadow-emerald-600/20"
                      startContent={!publishing && <CheckCircle2 className="h-4 w-4" />}
                    >
                      {publishing ? "Publishing to Marketplace..." : "🚀 Finalize & List in Marketplace"}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            FEATURE 1A: STATEFUL MULTI-TURN CHATBOT
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Feature 1A Architecture
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Operates using Google Gemini 1.5 Flash LLM with client-side conversation history serialization. Maintains multi-turn context memory across turn exchanges and enforces strict safety and circular economy domain guardrails.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quick Academic Inquiries</span>
                  <div className="flex flex-col gap-1.5">
                    {quickPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(p)}
                        className="text-left text-xs rounded-xl bg-violet-50/70 p-2.5 text-violet-900 dark:bg-violet-950/30 dark:text-violet-300 hover:bg-violet-100 transition border border-violet-200/50 dark:border-violet-800/40"
                      >
                        ⚡ {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-500">{messages.length - 1} turns in memory</span>
                  <Button size="sm" variant="flat" color="danger" onPress={clearChat} startContent={<Trash2 className="h-3.5 w-3.5" />}>
                    Reset Memory
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Gemini 1.5 Multi-Turn Session</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">Academic Lab Interactive Chat</span>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                      {m.sender === "bot" && (
                        <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        m.sender === "user" 
                          ? "bg-violet-600 text-white rounded-br-none whitespace-pre-wrap" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60"
                      }`}>
                        {m.sender === "bot" ? (
                          <MarkdownRenderer content={m.text} />
                        ) : (
                          m.text
                        )}
                      </div>
                      {m.sender === "user" && (
                        <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 dark:bg-slate-700">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3 justify-start items-center">
                      <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 animate-spin" />
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Generating response via Gemini LLM...
                      </div>
                    </div>
                  )}
                  <div ref={endOfChatRef} />
                </div>

                {/* Chat Input */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} 
                  className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about e-waste disposal, metal recovery or compliance..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <Button type="submit" isLoading={chatLoading} color="secondary" className="bg-violet-600 text-white font-semibold">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
