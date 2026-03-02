import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in .env");
}

export const ai = new GoogleGenAI({ apiKey });

export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";