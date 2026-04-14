import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("Failed to initialize GoogleGenAI:", err.message);
  }
} else {
  console.warn("GEMINI_API_KEY not configured. AI features will be limited.");
}

export { ai };
export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";