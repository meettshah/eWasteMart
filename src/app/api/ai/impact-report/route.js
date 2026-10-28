import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { mongooseConnect } from "@/lib/mongoose";
import Listing from "@/models/ListingModel";
import { generateWithGemini } from "@/lib/gemini";

// --- RAG-style Impact Report Generator (Generative AI — Subject 1B) ---
function buildImpactPrompt(listing, impact) {
  const treesEquivalent = (impact.co2SavedKg / 22).toFixed(1);
  const kmDrivingEquivalent = (impact.co2SavedKg / 0.21).toFixed(0);

  return `You are an environmental impact report writer for eWasteMart, an e-waste recycling marketplace.

Generate a personalized, inspiring 3-paragraph impact certificate for a completed e-waste transaction.
Use the exact numbers provided below — do NOT fabricate or change them.

Transaction Data (verified from database):
- Listing: "${listing.title}"
- Category: ${listing.category}
- Quantity: ${listing.quantity} ${listing.unit}
- Condition: ${listing.condition}
- CO2 Saved: ${impact.co2SavedKg} kg
- Metals Recovered: ${impact.metalsRecoveredKg} kg
- Toxins Diverted: ${impact.toxinsDivertedKg} kg
- Equivalent to ${treesEquivalent} trees absorbing carbon for a year
- Equivalent to not driving ${kmDrivingEquivalent} km by car

Write exactly 3 paragraphs:
1. What was recycled and why it matters (specific to this lot's category)
2. The measurable environmental impact using the exact numbers above and the real-world analogies
3. A forward-looking, motivational closing about circular economy

Tone: Warm, factual, slightly formal. Like an official certificate but human.
Output: Plain text only, no markdown, no headers, no bullet points.`;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  const body = await req.json();
  const { listingId } = body;

  if (!listingId) {
    return NextResponse.json({ message: "Listing ID required." }, { status: 400 });
  }

  await mongooseConnect();

  const listing = await Listing.findById(listingId).lean();
  if (!listing) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  let impact = listing.impact;
  if (!impact || !impact.co2SavedKg || impact.co2SavedKg === 0) {
    const qty = Math.max(1, Number(listing.quantity) || 1);
    const cat = (listing.category || "").toLowerCase();
    let co2PerUnit = 28;
    let metalsPerUnit = 1.2;
    let toxinsPerUnit = 0.35;

    if (cat.includes("computer") || cat.includes("laptop")) {
      co2PerUnit = 52;
      metalsPerUnit = 2.4;
      toxinsPerUnit = 0.6;
    } else if (cat.includes("mobile") || cat.includes("phone")) {
      co2PerUnit = 16;
      metalsPerUnit = 0.8;
      toxinsPerUnit = 0.18;
    } else if (cat.includes("television") || cat.includes("display")) {
      co2PerUnit = 70;
      metalsPerUnit = 3.1;
      toxinsPerUnit = 1.1;
    } else if (cat.includes("battery")) {
      co2PerUnit = 24;
      metalsPerUnit = 1.8;
      toxinsPerUnit = 1.5;
    }

    impact = {
      co2SavedKg: Math.round(qty * co2PerUnit),
      metalsRecoveredKg: Number((qty * metalsPerUnit).toFixed(1)),
      toxinsDivertedKg: Number((qty * toxinsPerUnit).toFixed(1)),
    };
  }

  const treesEquivalent = (impact.co2SavedKg / 22).toFixed(1);
  const kmDrivingEquivalent = (impact.co2SavedKg / 0.21).toFixed(0);

  const fallbackReport = `Through this verified transaction on eWasteMart, ${listing.quantity} ${listing.unit} of ${listing.category} (${listing.title}) were responsibly processed through certified circular economy recycling channels instead of ending up in unmanaged landfills.\n\nThis single transaction prevented the release of ${impact.co2SavedKg} kg of CO₂ into the atmosphere, preserved ${impact.metalsRecoveredKg} kg of critical raw metals (including gold, copper, and rare-earth elements), and neutralized ${impact.toxinsDivertedKg} kg of hazardous toxins. This is equivalent to planting ${treesEquivalent} mature trees absorbing carbon for an entire year, or eliminating ${kmDrivingEquivalent} kilometers of passenger vehicle emissions.\n\nBy ensuring end-of-life electronics are reclaimed rather than discarded, eWasteMart participants lead the transition toward zero electronic waste and sustainable urban mining.`;

  try {
    const prompt = buildImpactPrompt(listing, impact);
    const geminiText = await generateWithGemini(prompt, { temperature: 0.7, maxTokens: 600 });

    if (geminiText && geminiText.trim().length > 0) {
      return NextResponse.json({
        report: geminiText.trim(),
        impact,
        listingTitle: listing.title,
        generatedAt: new Date().toISOString(),
        provider: "gemini"
      });
    }
  } catch (error) {
    console.warn("Impact report Gemini error:", error.message);
  }

  return NextResponse.json({
    report: fallbackReport,
    impact,
    listingTitle: listing.title,
    generatedAt: new Date().toISOString(),
    isFallback: true,
  });
}
