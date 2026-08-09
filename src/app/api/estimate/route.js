import { NextResponse } from "next/server";

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

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ message: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "eWasteMart",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: "system", content: estimatePrompt },
                    { role: "user", content: JSON.stringify(listingData) }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            let content = data.choices[0].message.content;
            
            // Extract JSON object using regex in case the AI includes conversational text before/after
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
            }

            try {
                const parsed = JSON.parse(content);
                return NextResponse.json(parsed);
            } catch (e) {
                console.error("AI returned invalid JSON:", content);
                return NextResponse.json({ 
                  min: 100, max: 500, 
                  reasoning: "Generic estimate fallback due to AI parse error.",
                  impact: { co2SavedKg: 0, metalsRecoveredKg: 0, toxinsDivertedKg: 0 }
                });
            }
        } else {
            throw new Error("No completion choices returned.");
        }
    } catch (error) {
        console.error("Estimate API Error:", error);
        return NextResponse.json(
            { message: "AI estimation is unavailable right now." },
            { status: 503 }
        );
    }
}
