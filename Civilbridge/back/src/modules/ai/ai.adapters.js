import { createPartFromBase64 } from "@google/genai";
import fetch from "node-fetch";
import { ai, MODEL } from "../../ai/genaiclient.js";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_STRUCTURED_MODEL || MODEL || "gemini-2.5-flash";
const DEFAULT_GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || DEFAULT_GEMINI_MODEL;
const DEFAULT_CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_VERSION = process.env.ANTHROPIC_API_VERSION || "2023-06-01";

function readResponseText(response) {
  return (
    response?.text ||
    response?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text)
      .filter(Boolean)
      .join("") ||
    ""
  );
}

function buildClaudeContent(file, prompt) {
  const content = [];

  if (file?.buffer) {
    const base64 = file.buffer.toString("base64");
    const isPdf = file.mimetype === "application/pdf";
    content.push({
      type: isPdf ? "document" : "image",
      source: {
        type: "base64",
        media_type: file.mimetype,
        data: base64,
      },
    });
  }

  content.push({
    type: "text",
    text: prompt,
  });

  return content;
}

export function isGeminiAvailable() {
  return Boolean(ai && process.env.GEMINI_API_KEY);
}

export function isClaudeAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function callGeminiJson({ prompt, schema, file, model }) {
  if (!isGeminiAvailable()) {
    throw new Error("Gemini API is not configured.");
  }

  const contents = file?.buffer
    ? [prompt, createPartFromBase64(file.buffer.toString("base64"), file.mimetype)]
    : prompt;

  const response = await ai.models.generateContent({
    model: model || (file ? DEFAULT_GEMINI_VISION_MODEL : DEFAULT_GEMINI_MODEL),
    contents,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      temperature: 0.2,
    },
  });

  return {
    provider: "gemini",
    model: model || (file ? DEFAULT_GEMINI_VISION_MODEL : DEFAULT_GEMINI_MODEL),
    text: readResponseText(response),
  };
}

export async function callClaudeJson({ prompt, file, model }) {
  if (!isClaudeAvailable()) {
    throw new Error("Claude API is not configured.");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_API_VERSION,
    },
    body: JSON.stringify({
      model: model || DEFAULT_CLAUDE_MODEL,
      max_tokens: 4096,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: buildClaudeContent(file, prompt),
        },
      ],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        `Claude API request failed with status ${response.status}.`
    );
  }

  const text = Array.isArray(payload?.content)
    ? payload.content
        .filter((entry) => entry?.type === "text")
        .map((entry) => entry.text)
        .join("")
    : "";

  return {
    provider: "claude",
    model: model || DEFAULT_CLAUDE_MODEL,
    text,
  };
}
