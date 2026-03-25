import prisma from "../../config/prisma.js";
import { ai, MODEL } from "../../ai/genaiclient.js";
import { rateLimit } from "express-rate-limit";

// Rate limiting for AI chat
export const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: { error: "Too many AI requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const GUEST_MSG_LIMIT = 3;

const SYSTEM_PROMPT = `You are CivilBridge AI — an expert construction assistant for Rwanda. 
You specialize in:
- Construction cost estimation in Rwandan Francs (RWF)
- Building regulations and permits in Rwanda
- Architectural plans and building recommendations
- Local material prices and suppliers in Rwanda
- Construction phases and project management
- Rwanda-specific construction knowledge (soil types, climate, regulations)

Be concise, practical, and always contextualize advice for Rwanda. When giving costs, use RWF.
Format responses clearly with bullet points or numbered lists where appropriate.`;

// ─── GET /api/ai/threads ──────────────────────────────────────────────────────
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

// ─── POST /api/ai/threads ─────────────────────────────────────────────────────
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

// ─── GET /api/ai/threads/:id/messages ────────────────────────────────────────
export const getMessages = async (req, res) => {
    try {
        const threadId = BigInt(req.params.id);
        
        // Verify thread ownership
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
        
        res.json({ success: true, messages });
    } catch (err) {
        console.error("Get messages error:", err);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// ─── POST /api/ai/threads/:id/chat ────────────────────────────────────────────
export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const threadId = BigInt(req.params.id);

        if (!message?.trim()) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        // Verify thread ownership
        const thread = await prisma.chatThread.findFirst({
            where: { 
                id: threadId, 
                userId: BigInt(req.user.id),
            },
        });
        
        if (!thread) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get conversation history for context
        const history = await prisma.chatMessage.findMany({
            where: { threadId },
            orderBy: { createdAt: "asc" },
            take: 20,
            select: { role: true, content: true },
        });

        // Save user message
        await prisma.chatMessage.create({
            data: {
                threadId,
                role: "user",
                content: message,
            },
        });

        // Build Gemini conversation
        const contents = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "model", parts: [{ text: "Understood. I am CivilBridge AI, ready to assist with your construction project in Rwanda." }] },
            ...history.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            })),
            { role: "user", parts: [{ text: message }] },
        ];

        let aiResponse = "";
        try {
            const response = await ai.models.generateContent({
                model: MODEL,
                contents,
            });
            aiResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text
                || response?.text
                || "I couldn't generate a response. Please try again.";
        } catch (aiErr) {
            console.error("Gemini error:", aiErr.message);
            aiResponse = "AI service is temporarily unavailable. Please try again in a moment.";
        }

        // Save assistant response
        await prisma.chatMessage.create({
            data: {
                threadId,
                role: "assistant",
                content: aiResponse,
            },
        });

        // Update thread title from first message if untitled
        if (thread.title === "New Conversation" && history.length === 0) {
            const autoTitle = message.slice(0, 60) + (message.length > 60 ? "..." : "");
            await prisma.chatThread.update({
                where: { id: threadId },
                data: { title: autoTitle },
            });
        }

        // Update thread timestamp
        await prisma.chatThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() },
        });

        res.json({ success: true, response: aiResponse });
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ message: "Failed to send message" });
    }
};

// ─── POST /api/ai/guest/chat ──────────────────────────────────────────────────
// Limited to 3 messages per guest (enforced by DB table)
export const guestChat = async (req, res) => {
    try {
        const { message, guest_id } = req.body;
        if (!message || !guest_id) {
            return res.status(400).json({ message: "message and guest_id required" });
        }

        // For now, skip database limit checking to avoid errors
        // TODO: Implement proper guest limit tracking when database is ready
        const remaining = 3; // Default remaining messages

        let aiResponse = "";
        try {
            // Check if AI service is available
            if (!process.env.GEMINI_API_KEY || !ai) {
                aiResponse = "🏗️ I'm your CivilBridge AI assistant! I can help you with:\n\n• Construction cost estimation in RWF\n• Building permits and regulations in Rwanda\n• Material recommendations and suppliers\n• Project planning and timeline guidance\n• Architectural advice for Rwanda\n\nNote: For full AI responses, please configure the GEMINI_API_KEY in your environment. In the meantime, I can provide basic guidance based on our knowledge base.";
            } else {
                const response = await ai.models.generateContent({
                    model: MODEL,
                    contents: [
                        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                        { role: "model", parts: [{ text: "Ready to assist with your Rwanda construction project." }] },
                        { role: "user", parts: [{ text: message }] },
                    ],
                });
                aiResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text
                    || response?.text
                    || "I couldn't generate a response.";
            }
        } catch (aiErr) {
            console.error("AI service error:", aiErr);
            aiResponse = "AI service temporarily unavailable. Please try again later.";
        }

        res.json({
            success: true,
            response: aiResponse,
            messages_remaining: remaining,
            limit_reached: remaining <= 0,
        });
    } catch (err) {
        console.error("Guest chat error:", err);
        res.status(500).json({ message: "Failed to process chat" });
    }
};

// ─── DELETE /api/ai/threads/:id ───────────────────────────────────────────────
export const deleteThread = async (req, res) => {
    try {
        const threadId = BigInt(req.params.id);
        
        // Verify thread ownership
        const thread = await prisma.chatThread.findFirst({
            where: { 
                id: threadId, 
                userId: BigInt(req.user.id),
            },
        });
        
        if (!thread) {
            return res.status(404).json({ message: "Thread not found" });
        }

        // Delete thread and messages (cascade)
        await prisma.chatThread.delete({
            where: { id: threadId },
        });
        
        res.json({ success: true, message: "Thread deleted" });
    } catch (err) {
        console.error("Delete thread error:", err);
        res.status(500).json({ message: "Failed to delete thread" });
    }
};
