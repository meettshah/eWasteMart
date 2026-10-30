import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateWithGemini } from "@/lib/gemini";

const SELLER_ROLES = ["user", "bulk_seller", "enterprise"];

const STANDARD_CATEGORIES = [
  "Computers and peripherals",
  "Mobile and personal devices",
  "Televisions and displays",
  "Audio and video equipment",
  "Networking devices",
  "Batteries and chargers",
  "Mixed e-waste",
];

/**
 * Builds few-shot prompt enforcing strictly short titles (3-6 words)
 * and rich circular e-waste product specifications.
 */
function buildUnifiedListingPrompt(inputData) {
  const { prompt, category, quantity, unit, condition, keywords, location, askingPrice } = inputData;
  const rawInput = prompt || keywords || category || "bulk electronic scrap";

  return `You are an expert e-waste marketplace listing engineer.
Given a seller's input prompt or specifications, generate a complete commercial marketplace product listing with a STRICTLY SHORT, PUNCHY TITLE.

Output ONLY valid JSON in this exact structure:
{
  "title": "Short Title (3-6 words max, under 40 characters)",
  "category": "One of: Computers and peripherals | Mobile and personal devices | Televisions and displays | Audio and video equipment | Networking devices | Batteries and chargers | Mixed e-waste",
  "condition": "scrap | repairable | working | mixed",
  "quantity": 10,
  "unit": "items | units | kg | sets",
  "askingPrice": 15000,
  "location": "City, State",
  "description": "2-3 concise professional sentences detailing hardware condition, recoverable metals (copper, gold, lithium), and suitability for certified recycling or refurbishment.",
  "materials": ["Gold (Au)", "Copper (Cu)", "Lithium (Li)"],
  "photoPrompt": "Domain tuned diffusion prompt for photorealistic hardware photo"
}

CRITICAL RULES:
1. TITLE MUST BE SHORT & CONCISE (STRICTLY 3 TO 6 WORDS, UNDER 40 CHARACTERS).
   - GOOD: "45x Mixed Scrap Smartphones"
   - GOOD: "20x Dell OptiPlex Core i7 PCs"
   - GOOD: "15x CRT Display Monitors"
   - GOOD: "20x Server Motherboard Lot"
   - BAD: "A batch of 12 vintage and modern smartphones neatly arranged on a clean blue workbench..." (NEVER use descriptions as titles!)
   - BAD: "45 items scrap Mobile and personal devices (Mixed broken smartphones, depleted lithium batteries...)"
2. Asking Price must be an integer in Indian Rupees (INR) reflecting realistic urban mining scrap or refurbished hardware rates.
3. Category must strictly match one of our 7 standard categories.
4. Do NOT wrap in markdown backticks or commentary.

FEW-SHOT EXAMPLES:

Example 1:
User: "A batch of 12 vintage and modern smartphones neatly arranged on a clean blue workbench in an electronics recycling facility"
Output:
{
  "title": "12x Mixed Smartphones (Scrap)",
  "category": "Mobile and personal devices",
  "condition": "scrap",
  "quantity": 12,
  "unit": "items",
  "askingPrice": 8500,
  "location": "Mumbai, Maharashtra",
  "description": "Decommissioned lot of 12 smartphones across mixed generations. Internal PCBs, gold bond wires, and copper antenna coils intact. Ideal for certified metal recovery and battery neutralisation.",
  "materials": ["Gold (Au)", "Copper (Cu)", "Lithium (Li)"],
  "photoPrompt": "A batch of 12 vintage and modern smartphones neatly arranged on a clean blue workbench in an electronics recycling facility, high detail, studio lighting"
}

Example 2:
User: "Stack of 20 server motherboards with visible gold-plated PCI slots and capacitors, industrial e-waste sorting facility"
Output:
{
  "title": "20x Server Motherboards (Gold PCI)",
  "category": "Computers and peripherals",
  "condition": "scrap",
  "quantity": 20,
  "unit": "items",
  "askingPrice": 38000,
  "location": "Bangalore, Karnataka",
  "description": "Enterprise lot of 20 decommissioned server motherboards. High-density gold-plated PCI Express lanes, ceramic BGA sockets, and tantalum capacitors ready for hydrometallurgical refining.",
  "materials": ["Gold (Au)", "Silver (Ag)", "Copper (Cu)", "Palladium (Pd)"],
  "photoPrompt": "Stack of 20 server motherboards with visible gold-plated PCI slots and capacitors, industrial e-waste sorting facility"
}

Example 3:
User: "15 Commercial CRT & Display Monitors heavy glass shells high copper deflection yokes"
Output:
{
  "title": "15x Commercial CRT Monitors",
  "category": "Televisions and displays",
  "condition": "scrap",
  "quantity": 15,
  "unit": "items",
  "askingPrice": 12500,
  "location": "Delhi NCR",
  "description": "Bulk collection of 15 commercial CRT display monitors with intact vacuum tubes and heavy copper deflection yokes. Suitable for certified glass recycling and copper harvesting.",
  "materials": ["Copper (Cu)", "Lead (Pb)", "Glass (SiO2)"],
  "photoPrompt": "Commercial CRT and display monitors stacked in recycling warehouse, copper deflection yokes visible"
}

Now parse this seller input:
Prompt/Specs: ${rawInput}
Category Hint: ${category || "Auto-detect"}
Quantity Hint: ${quantity || "Auto-detect"}
Condition Hint: ${condition || "Auto-detect"}
Keywords Hint: ${keywords || ""}
Location Hint: ${location || "Mumbai, Maharashtra"}
Price Hint: ${askingPrice || "Auto-estimate"}
Output:`;
}

/**
 * Intelligent deterministic fallback generator
 * Produces crisp short titles and realistic parameters without failure.
 */
function generateDeterministicListing(data) {
  const raw = (data.prompt || data.keywords || data.category || "electronics").toLowerCase();
  
  let category = data.category || "Computers and peripherals";
  let shortProduct = "Electronic Hardware";
  let defaultPrice = 15000;
  let materials = ["Copper (Cu)", "Aluminum (Al)", "Gold (Au)"];

  if (raw.includes("phone") || raw.includes("smart") || raw.includes("mobile")) {
    category = "Mobile and personal devices";
    shortProduct = "Smartphones";
    defaultPrice = 9500;
    materials = ["Gold (Au)", "Copper (Cu)", "Lithium (Li)"];
  } else if (raw.includes("motherboard") || raw.includes("pcb") || raw.includes("circuit") || raw.includes("server")) {
    category = "Computers and peripherals";
    shortProduct = "Server Motherboards";
    defaultPrice = 32000;
    materials = ["Gold (Au)", "Palladium (Pd)", "Copper (Cu)"];
  } else if (raw.includes("laptop") || raw.includes("desktop") || raw.includes("optiplex") || raw.includes("workstation")) {
    category = "Computers and peripherals";
    shortProduct = "Workstation PCs";
    defaultPrice = 45000;
    materials = ["Copper (Cu)", "Aluminum (Al)", "Silicon (Si)"];
  } else if (raw.includes("display") || raw.includes("crt") || raw.includes("monitor") || raw.includes("screen") || raw.includes("tv")) {
    category = "Televisions and displays";
    shortProduct = "CRT Monitors";
    defaultPrice = 11000;
    materials = ["Copper (Cu)", "Glass (SiO2)", "Lead (Pb)"];
  } else if (raw.includes("router") || raw.includes("switch") || raw.includes("network") || raw.includes("telecom")) {
    category = "Networking devices";
    shortProduct = "Telecom Routers";
    defaultPrice = 28000;
    materials = ["Copper (Cu)", "Gold (Au)", "Aluminum (Al)"];
  } else if (raw.includes("battery") || raw.includes("charger") || raw.includes("lithium") || raw.includes("power")) {
    category = "Batteries and chargers";
    shortProduct = "Li-Ion Battery Packs";
    defaultPrice = 14000;
    materials = ["Lithium (Li)", "Cobalt (Co)", "Nickel (Ni)"];
  }

  // Extract quantity from prompt if present
  let qty = Number(data.quantity) || 10;
  const numMatch = raw.match(/\b(\d+)\b/);
  if (numMatch && !data.quantity) {
    const parsed = parseInt(numMatch[1], 10);
    if (parsed > 0 && parsed < 10000) qty = parsed;
  }

  const cond = data.condition || (raw.includes("working") ? "working" : raw.includes("repair") ? "repairable" : "scrap");
  const condTag = cond.charAt(0).toUpperCase() + cond.slice(1);

  // Short, punchy title: strictly 3-5 words
  const title = `${qty}x ${shortProduct} (${condTag})`;

  const description = `Decommissioned commercial lot of ${qty} ${shortProduct.toLowerCase()} sorted in ${cond} condition. Retains high-purity internal circuitry, precious metal contact pins, and recyclable chassis components. Sourced for authorized circular e-waste recycling and compliant material recovery.`;

  return {
    title,
    category,
    condition: cond,
    quantity: qty,
    unit: data.unit || "items",
    askingPrice: Number(data.askingPrice) || defaultPrice,
    location: data.location || "Mumbai, Maharashtra",
    description,
    materials,
    photoPrompt: data.prompt || `${qty} ${shortProduct.toLowerCase()} neatly arranged on a clean workshop table in an electronics recycling facility`,
    isFallback: true,
  };
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Please login first." }, { status: 401 });
  }
  if (!SELLER_ROLES.includes(session.user.role)) {
    return NextResponse.json({ message: "Only sellers can create listings." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const rawInput = body.prompt || body.keywords || body.category;

  if (!rawInput && !body.category) {
    return NextResponse.json({ message: "Please provide a description or prompt for the listing." }, { status: 400 });
  }

  try {
    const prompt = buildUnifiedListingPrompt(body);
    const raw = await generateWithGemini(prompt, { temperature: 0.5, maxTokens: 400 });

    if (raw) {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.title && parsed.description) {
          // Double-check title length: if model returned more than 8 words, trim to crisp headline
          let title = parsed.title.trim().replace(/^["']|["']$/g, "");
          const words = title.split(/\s+/);
          if (words.length > 7) {
            title = words.slice(0, 6).join(" ");
          }

          // Ensure valid category
          let category = parsed.category;
          if (!STANDARD_CATEGORIES.includes(category)) {
            category = body.category || "Mixed e-waste";
          }

          return NextResponse.json({
            title,
            category,
            condition: parsed.condition || body.condition || "scrap",
            quantity: Number(parsed.quantity) || Number(body.quantity) || 1,
            unit: parsed.unit || body.unit || "items",
            askingPrice: Number(parsed.askingPrice) || Number(body.askingPrice) || 15000,
            location: parsed.location || body.location || "Mumbai, Maharashtra",
            description: parsed.description,
            materials: Array.isArray(parsed.materials) ? parsed.materials : ["Gold (Au)", "Copper (Cu)"],
            photoPrompt: parsed.photoPrompt || body.prompt || title,
            provider: "gemini",
          });
        }
      }
    }
  } catch (error) {
    console.warn("[Unified Listing AI] Gemini call warning:", error.message);
  }

  // Guaranteed deterministic fallback
  const fallback = generateDeterministicListing(body);
  return NextResponse.json({ ...fallback, provider: "domain-engine" });
}
