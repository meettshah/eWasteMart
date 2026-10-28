import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateWithGemini } from "@/lib/gemini";

const SELLER_ROLES = ["user", "bulk_seller", "enterprise"];

// --- Few-shot Prompt Engineering (Generative AI — Subject 1A) ---
function buildListingPrompt(category, quantity, unit, condition, keywords) {
  return `You are an expert e-waste marketplace listing writer. Generate a professional, 
concise listing title and description that will attract certified recyclers and enterprises.

Output ONLY valid JSON in this exact format:
{"title": "...", "description": "..."}

Rules:
- Title: max 10 words, specific and factual
- Description: 2-3 sentences, include condition, brands if mentioned, and recycling potential
- Do NOT include price, seller info, or location
- Do NOT wrap in markdown code blocks

Examples:

Input: category=Computers and peripherals, quantity=25, unit=items, condition=working, keywords=Dell Optiplex servers
Output: {"title": "25 Working Dell OptiPlex Desktop PCs – Bulk Lot", "description": "Lot of 25 Dell OptiPlex desktop computers in working condition with intact power supplies and RAM. Mixed generations (7010–9020), ideal for refurbishment or component harvesting. CPUs, HDDs, and GPUs recoverable."}

Input: category=Mobile and personal devices, quantity=100, unit=items, condition=scrap, keywords=old phones mixed brands
Output: {"title": "100 Mixed-Brand Smartphones – Scrap for Metal Recovery", "description": "100 end-of-life smartphones from various brands (Samsung, Xiaomi, Oppo) in scrap condition. Batteries are depleted but internal components including circuit boards and copper wiring are intact. Suitable for certified e-waste recycling."}

Now generate:
Input: category=${category}, quantity=${quantity}, unit=${unit}, condition=${condition}, keywords=${keywords || category}
Output:`;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }
  if (!SELLER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Only sellers can use this feature." }, { status: 403 });
  }

  const body = await req.json();
  const { category, quantity, unit, condition, keywords } = body;

  if (!category || !quantity || !unit || !condition) {
    return NextResponse.json({ message: "Please fill category, quantity, unit, and condition first." }, { status: 400 });
  }

  const fallbackGen = () => {
    const keywordStr = keywords ? ` (${keywords})` : "";
    const title = `${quantity} ${unit} ${condition} ${category}${keywordStr}`;
    const description = `Lot of ${quantity} ${unit} of ${category} in ${condition} condition. Sourced for certified electronic recycling and material recovery. Contains recoverable precious metals, circuit boards, and components suitable for circular economy reuse.`;
    return { title, description };
  };

  try {
    const prompt = buildListingPrompt(category, quantity, unit, condition, keywords);

    // Try Google Gemini API
    const raw = await generateWithGemini(prompt, { temperature: 0.6, maxTokens: 250 });

    if (raw) {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.title && parsed.description) {
          return NextResponse.json({ title: parsed.title, description: parsed.description, provider: "gemini" });
        }
      }
    }
  } catch (error) {
    console.warn("[Listing AI] Gemini error:", error.message);
  }

  // Graceful deterministic generation guarantee
  const fallback = fallbackGen();
  return NextResponse.json({ ...fallback, isFallback: true });
}
