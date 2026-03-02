import { ai, MODEL } from "../ai/genaiclient.js";

function toContents(history = [], message = "") {
  // history format expected from frontend:
  // [{ role: "user"|"model", content: "..." }, ...]
  const contents = [];

  for (const h of history) {
    const role = h?.role === "model" ? "model" : "user";
    const text = String(h?.content ?? "").trim();
    if (!text) continue;

    contents.push({
      role,
      parts: [{ text }],
    });
  }

  const msg = String(message ?? "").trim();
  if (msg) {
    contents.push({
      role: "user",
      parts: [{ text: msg }],
    });
  }

  return contents;
}

export async function chat(req, res) {
  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: "message is required" });

    const contents = toContents(history, message);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
    });

    // SDK returns a response object; safest is:
    const text =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "";

    return res.json({ reply: text || "No response text returned." });
  } catch (err) {
    console.error("AI error:", err?.message || err);
    return res.status(500).json({
      error: "AI service failed",
      details: err?.message || String(err),
    });
  }
}

export async function models(req, res) {
  // listModels might not exist in some SDK builds; keep this endpoint as “health/info”
  return res.json({
    supported: true,
    model: MODEL,
    message: "AI configured. Use POST /api/ai/chat to test.",
  });
}