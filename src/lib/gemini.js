import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Universal Google Gemini API client for eWasteMart
 * Supports multi-model failover and graceful fallback.
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  try {
    return new GoogleGenerativeAI(apiKey.trim());
  } catch (error) {
    console.error("[Gemini] Initialization error:", error.message);
    return null;
  }
}

/**
 * Generate text using Gemini with multi-model fallback.
 * @param {string} prompt - The user prompt or instruction
 * @param {object} options - { systemInstruction, history, temperature, maxTokens }
 */
export async function generateWithGemini(prompt, options = {}) {
  const genAI = getGeminiClient();
  if (!genAI) return null;

  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

  for (const modelName of modelsToTry) {
    try {
      const modelConfig = { model: modelName };
      if (options.systemInstruction) {
        modelConfig.systemInstruction = options.systemInstruction;
      }
      if (options.temperature !== undefined) {
        modelConfig.generationConfig = {
          temperature: options.temperature,
          ...(options.maxTokens ? { maxOutputTokens: options.maxTokens } : {})
        };
      }

      const model = genAI.getGenerativeModel(modelConfig);

      if (options.history && Array.isArray(options.history) && options.history.length > 0) {
        // Multi-turn chat
        // Map history to Gemini format: role: "user" | "model", parts: [{ text }]
        const formattedHistory = options.history.map((msg) => ({
          role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.content || msg.text || "" }]
        }));

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(prompt);
        const text = result.response.text();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        // Single prompt
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn(`[Gemini] Failed with model ${modelName}:`, err.message);
      // Try next model in sequence
    }
  }

  return null;
}
