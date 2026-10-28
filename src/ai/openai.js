import { generateWithGemini } from "@/lib/gemini";

const systemPrompt = `
You are the official eWasteMart AI Assistant.
Your primary role is to answer questions strictly about the eWasteMart application, how it works, and general facts about e-waste recycling.

Rules:
1. Keep your answers concise, friendly, and helpful.
2. If the user asks something completely unrelated to e-waste or the eWasteMart app, politely refuse and guide them back.
3. Provide direct markdown links: [Marketplace](/marketplace), [Dashboard](/home), [My Orders](/orders), [Pickups](/pickups), [Settings](/settings).
`;

const runPrompt = async (content) => {
    try {
        const reply = await generateWithGemini(content, { systemInstruction: systemPrompt });
        if (reply) return reply;
    } catch (e) {
        console.warn("Gemini runPrompt failed:", e.message);
    }

    return "eWasteMart AI is active. You can browse active listings and trade in the [Marketplace](/marketplace).";
};

export default runPrompt;
