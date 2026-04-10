import prisma from "../../config/prisma.js";
import { ai, MODEL } from "../../ai/genaiclient.js";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import {
  AIServiceError,
  analyzePlanDocument,
  estimateProjectOptions,
  getAIProviderStatus,
  generatePlanSpecification,
} from "./ai.service.js";

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many AI requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }

    const guestId =
      typeof req.body?.guest_id === "string"
        ? req.body.guest_id.trim().toLowerCase()
        : "";

    if (guestId) {
      return `guest:${guestId}`;
    }

    return `ip:${ipKeyGenerator(req.ip || req.socket?.remoteAddress || "unknown-ip")}`;
  },
});

const GUEST_MSG_LIMIT = 3;

const SYSTEM_PROMPT = `You are CivilBridge AI, an expert construction assistant for Rwanda.
You specialize in:
- Construction cost estimation in Rwandan Francs (RWF)
- Building regulations and permits in Rwanda
- Architectural plans and building recommendations
- Local material prices and suppliers in Rwanda
- Construction phases and project management
- Rwanda-specific construction knowledge (soil types, climate, regulations)

Be concise, practical, and always contextualize advice for Rwanda. When giving costs, use RWF.
Format responses clearly with bullet points or numbered lists where appropriate.`;

function handleAIControllerError(res, error, fallbackMessage) {
  if (error instanceof AIServiceError) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ success: false, message: fallbackMessage });
}

export const getThreads = async (req, res) => {
  try {
    const threads = await prisma.chatThread.findMany({
      where: { userId: BigInt(req.user.id) },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        contextType: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    res.json({ success: true, threads });
  } catch (err) {
    console.error("Get threads error:", err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
};

export const createThread = async (req, res) => {
  try {
    const { title, contextType = "general" } = req.body;
    const thread = await prisma.chatThread.create({
      data: {
        userId: BigInt(req.user.id),
        title: title || "New Conversation",
        contextType,
      },
    });

    res.status(201).json({ success: true, thread_id: thread.id.toString() });
  } catch (err) {
    console.error("Create thread error:", err);
    res.status(500).json({ message: "Failed to create thread" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const threadId = BigInt(req.params.id);
    const thread = await prisma.chatThread.findFirst({
      where: {
        id: threadId,
        userId: BigInt(req.user.id),
      },
    });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, messages });
  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const threadId = BigInt(req.params.id);

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const thread = await prisma.chatThread.findFirst({
      where: {
        id: threadId,
        userId: BigInt(req.user.id),
      },
    });

    if (!thread) {
      return res.status(403).json({ message: "Access denied" });
    }

    const history = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    await prisma.chatMessage.create({
      data: {
        threadId,
        role: "user",
        content: message,
      },
    });

    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I am CivilBridge AI, ready to assist with your construction project in Rwanda.",
          },
        ],
      },
      ...history.map((entry) => ({
        role: entry.role === "assistant" ? "model" : "user",
        parts: [{ text: entry.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    let aiResponse = "";
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
      });
      aiResponse =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response?.text ||
        "I couldn't generate a response. Please try again.";
    } catch (aiErr) {
      console.error("Gemini error:", aiErr.message);
      aiResponse =
        "AI service is temporarily unavailable. Please try again in a moment.";
    }

    await prisma.chatMessage.create({
      data: {
        threadId,
        role: "assistant",
        content: aiResponse,
      },
    });

    if (thread.title === "New Conversation" && history.length === 0) {
      const autoTitle = `${message.slice(0, 60)}${message.length > 60 ? "..." : ""}`;
      await prisma.chatThread.update({
        where: { id: threadId },
        data: { title: autoTitle },
      });
    }

    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return res.json({ success: true, response: aiResponse });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

export const guestChat = async (req, res) => {
  try {
    const { message, guest_id: guestId } = req.body;
    if (!message?.trim() || !guestId) {
      return res.status(400).json({ message: "message and guest_id required" });
    }

    const limitRecord = await prisma.guestChatLimit.findUnique({
      where: { guestId },
    });

    if (limitRecord && limitRecord.messageCount >= GUEST_MSG_LIMIT) {
      return res.status(429).json({
        message:
          "You've used all 3 free messages. Create a free account to keep chatting.",
        limit_reached: true,
        messages_remaining: 0,
      });
    }

    let aiResponse = "";
    try {
      if (!process.env.GEMINI_API_KEY || !ai) {
        aiResponse =
          "I can help with cost estimation, permits, materials, timelines, and architecture for Rwanda. Configure GEMINI_API_KEY for full AI responses.";
      } else {
        const response = await ai.models.generateContent({
          model: MODEL,
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            {
              role: "model",
              parts: [
                { text: "Ready to assist with your Rwanda construction project." },
              ],
            },
            { role: "user", parts: [{ text: message }] },
          ],
        });
        aiResponse =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          response?.text ||
          "I couldn't generate a response.";
      }
    } catch (aiErr) {
      console.error("AI service error:", aiErr);
      aiResponse = "AI service temporarily unavailable. Please try again later.";
    }

    const updated = await prisma.guestChatLimit.upsert({
      where: { guestId },
      update: { messageCount: { increment: 1 } },
      create: { guestId, messageCount: 1 },
    });

    const remaining = Math.max(0, GUEST_MSG_LIMIT - updated.messageCount);

    return res.json({
      success: true,
      response: aiResponse,
      messages_remaining: remaining,
      limit_reached: remaining <= 0,
    });
  } catch (err) {
    console.error("Guest chat error:", err);
    return res.status(500).json({ message: "Failed to process chat" });
  }
};

export const analyzePlan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Upload a PDF or image file in the 'file' field.",
      });
    }

    const result = await analyzePlanDocument({
      file: req.file,
      location: req.body?.location,
      projectType: req.body?.projectType,
      notes: req.body?.notes,
      provider: req.body?.provider,
    });

    return res.json({
      success: true,
      provider: result.provider,
      model: result.model,
      analysis: result.data,
    });
  } catch (error) {
    return handleAIControllerError(res, error, "Failed to analyze plan.");
  }
};

export const getProviders = async (req, res) => {
  try {
    return res.json({
      success: true,
      status: getAIProviderStatus(),
    });
  } catch (error) {
    return handleAIControllerError(
      res,
      error,
      "Failed to read AI provider status."
    );
  }
};

export const generatePlan = async (req, res) => {
  try {
    const { budget, currency, preferences, location, upiData, siteConstraints } =
      req.body || {};

    if (budget === undefined || budget === null) {
      return res.status(400).json({
        success: false,
        message: "budget is required.",
      });
    }

    const result = await generatePlanSpecification({
      budget,
      currency,
      preferences,
      location,
      upiData,
      siteConstraints,
    });

    return res.json({
      success: true,
      provider: result.provider,
      model: result.model,
      plan: result.data,
    });
  } catch (error) {
    return handleAIControllerError(res, error, "Failed to generate plan.");
  }
};

export const estimateProject = async (req, res) => {
  try {
    const { idea, budgetRange, location, timeline, conversationHistory } =
      req.body || {};

    if (!idea?.trim() || !budgetRange) {
      return res.status(400).json({
        success: false,
        message: "idea and budgetRange are required.",
      });
    }

    const result = await estimateProjectOptions({
      idea,
      budgetRange,
      location,
      timeline,
      conversationHistory,
    });

    return res.json({
      success: true,
      provider: result.provider,
      model: result.model,
      estimation: result.data,
    });
  } catch (error) {
    return handleAIControllerError(res, error, "Failed to estimate project.");
  }
};

export const deleteThread = async (req, res) => {
  try {
    const threadId = BigInt(req.params.id);
    const thread = await prisma.chatThread.findFirst({
      where: {
        id: threadId,
        userId: BigInt(req.user.id),
      },
    });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    await prisma.chatThread.delete({
      where: { id: threadId },
    });

    return res.json({ success: true, message: "Thread deleted" });
  } catch (err) {
    console.error("Delete thread error:", err);
    return res.status(500).json({ message: "Failed to delete thread" });
  }
};
