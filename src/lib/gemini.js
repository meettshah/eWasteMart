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

  const modelsToTry = [
    "gemini-2.5-flash",
  ];

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

/**
 * Multimodal Computer Vision Analysis using Gemini Vision models.
 * @param {string} base64Data - Raw or data-URL encoded base64 image data
 * @param {string} mimeType - e.g. "image/jpeg", "image/png", "image/webp"
 * @param {string} prompt - Inspection prompt
 * @param {object} options - Generation options
 */
export async function analyzeImageWithGemini(base64Data, mimeType = "image/jpeg", prompt = "", options = {}) {
  const genAI = getGeminiClient();
  if (!genAI) return null;

  // Clean data URL prefix if present
  let cleanBase64 = base64Data;
  if (typeof base64Data === "string" && base64Data.includes(";base64,")) {
    const parts = base64Data.split(";base64,");
    cleanBase64 = parts[1];
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch && mimeMatch[1]) {
      mimeType = mimeMatch[1];
    }
  }

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: mimeType || "image/jpeg",
    },
  };

  const visionModels = [
    "gemini-2.5-flash",
  ];

  for (const modelName of visionModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          responseMimeType: options.jsonOutput ? "application/json" : undefined,
        },
      });

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err) {
      console.warn(`[Gemini Vision] Model ${modelName} call failed:`, err.message);
    }
  }

  return null;
}
