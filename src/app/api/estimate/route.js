import { NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";

const estimatePrompt = `
You are an expert e-waste valuation and environmental impact AI.
The user will provide a JSON object containing the details of their e-waste lot (title, category, quantity, unit, condition, and description).
You must:
1. Estimate the realistic market value for the ENTIRE lot in Indian Rupees (INR).
2. Calculate the estimated environmental impact of recycling this exact quantity of items using standard e-waste conversion factors (e.g., 1 smartphone ~ 12kg CO2, 1 laptop ~ 45kg CO2, 1 CRT TV ~ 100kg CO2).

**CRITICAL VALUATION RULES:**
- You MUST drastically adjust the price based on the \`condition\`. This is not a static formula!
  - \`working\`: Fully functional. Commands the highest second-hand market price (e.g., a working laptop might be 5,000-20,000+ INR each).
  - \`repairable\`: Needs fixing. Worth roughly 30-40% of the working price.
  - \`mixed\`: Evaluate at a lower, blended rate assuming some scrap and some repairable.
  - \`scrap\`: Completely dead/broken. Valued strictly on raw material/metal extraction (e.g., a scrap laptop is only worth 100-300 INR each).
- Consider factual, current global market situations and realistic supply/demand for the specific \`category\` in India.

Respond ONLY with a JSON object in this exact format, with NO markdown formatting or other text:
{
  "min": <number>,
  "max": <number>,
  "reasoning": "<1 sentence explaining the pricing calculation based on quantity, category, and condition>",
  "impact": {
    "co2SavedKg": <number>,
    "metalsRecoveredKg": <number>,
    "toxinsDivertedKg": <number>
  }
}
`;

export async function POST(req) {
    try {
        const listingData = await req.json();

        if (!listingData?.description?.trim()) {
            return NextResponse.json({ message: "Please provide a description." }, { status: 400 });
        }

        function computeFallback() {
            const qty = Number(listingData.quantity) || 1;
            const categoryMultipliers = {
                "Computers and peripherals": { base: 1200, co2: 28, metals: 3.2, toxins: 0.8 },
                "Mobile and personal devices": { base: 600, co2: 14, metals: 0.9, toxins: 0.3 },
                "Televisions and displays": { base: 800, co2: 35, metals: 2.1, toxins: 1.4 },
                "Audio and video equipment": { base: 450, co2: 12, metals: 1.5, toxins: 0.2 },
                "Networking devices": { base: 350, co2: 8, metals: 0.7, toxins: 0.1 },
                "Batteries and chargers": { base: 150, co2: 16, metals: 1.8, toxins: 2.2 },
                "Mixed e-waste": { base: 250, co2: 10, metals: 1.0, toxins: 0.5 },
            };
            const factors = categoryMultipliers[listingData.category] || categoryMultipliers["Mixed e-waste"];
            const conditionFactor = listingData.condition === "working" ? 1.5 : listingData.condition === "repairable" ? 1.0 : 0.6;
            const estimatedVal = Math.round(factors.base * qty * conditionFactor);
            const min = Math.round(estimatedVal * 0.8);
            const max = Math.round(estimatedVal * 1.2);

            return NextResponse.json({
                min,
                max,
                reasoning: `Calculated from circular economy scrap indices for ${qty} ${listingData.unit || 'units'} of ${listingData.category || 'mixed'} in ${listingData.condition || 'mixed'} condition.`,
                impact: {
                    co2SavedKg: Number((factors.co2 * qty).toFixed(1)),
                    metalsRecoveredKg: Number((factors.metals * qty).toFixed(1)),
                    toxinsDivertedKg: Number((factors.toxins * qty).toFixed(1)),
                },
                isFallback: true,
            });
        }

        try {
            const prompt = `${estimatePrompt}\n\nLot details: ${JSON.stringify(listingData)}`;
            const raw = await generateWithGemini(prompt, { temperature: 0.3, maxTokens: 300 });

            if (raw) {
                const match = raw.match(/\{[\s\S]*\}/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (parsed.min && parsed.max) {
                        return NextResponse.json({ ...parsed, provider: "gemini" });
                    }
                }
            }
        } catch (apiErr) {
            console.warn("Gemini estimation failed, using circular index heuristic:", apiErr.message);
        }

        return computeFallback();
    } catch (error) {
        console.error("Estimate API Error:", error);
        return NextResponse.json(
            { message: "AI estimation is unavailable right now." },
            { status: 500 }
        );
    }
}
