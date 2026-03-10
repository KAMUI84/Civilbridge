import { pool } from "../../config/db.js";
import { ai, MODEL } from "../../ai/genaiclient.js";

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
        const [threads] = await pool.query(
            `SELECT id, title, context_type, created_at, updated_at
       FROM ai_threads WHERE user_id = ?
       ORDER BY updated_at DESC LIMIT 20`,
            [req.user.id]
        );
        res.json({ success: true, threads });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch threads" });
    }
};

// ─── POST /api/ai/threads ─────────────────────────────────────────────────────
export const createThread = async (req, res) => {
    try {
        const { title, context_type = "general" } = req.body;
        const [result] = await pool.query(
            "INSERT INTO ai_threads (user_id, title, context_type) VALUES (?,?,?)",
            [req.user.id, title || "New Conversation", context_type]
        );
        res.status(201).json({ success: true, thread_id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: "Failed to create thread" });
    }
};

// ─── GET /api/ai/threads/:id/messages ────────────────────────────────────────
export const getMessages = async (req, res) => {
    try {
        const [thread] = await pool.query(
            "SELECT * FROM ai_threads WHERE id = ? AND (user_id = ? OR user_id IS NULL)",
            [req.params.id, req.user.id]
        );
        if (!thread.length) return res.status(404).json({ message: "Thread not found" });

        const [messages] = await pool.query(
            "SELECT id, role, content, created_at FROM ai_messages WHERE thread_id = ? ORDER BY created_at ASC",
            [req.params.id]
        );
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// ─── POST /api/ai/threads/:id/chat ────────────────────────────────────────────
export const sendMessage = async (req, res) => {
    try {
        const { message, guest_id } = req.body;
        const thread_id = req.params.id;

        if (!message?.trim()) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        // Verify thread ownership
        const userId = req.user?.id || null;
        const [thread] = await pool.query(
            "SELECT * FROM ai_threads WHERE id = ? AND (user_id = ? OR guest_id = ?)",
            [thread_id, userId, guest_id || null]
        );
        if (!thread.length) return res.status(403).json({ message: "Access denied" });

        // Get conversation history for context
        const [history] = await pool.query(
            "SELECT role, content FROM ai_messages WHERE thread_id = ? ORDER BY created_at ASC LIMIT 20",
            [thread_id]
        );

        // Save user message
        await pool.query(
            "INSERT INTO ai_messages (thread_id, role, content) VALUES (?,?,?)",
            [thread_id, "user", message]
        );

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
        await pool.query(
            "INSERT INTO ai_messages (thread_id, role, content) VALUES (?,?,?)",
            [thread_id, "assistant", aiResponse]
        );

        // Update thread title from first message if untitled
        if (thread[0].title === "New Conversation" && history.length === 0) {
            const autoTitle = message.slice(0, 60) + (message.length > 60 ? "..." : "");
            await pool.query("UPDATE ai_threads SET title = ?, updated_at = NOW() WHERE id = ?", [autoTitle, thread_id]);
        } else {
            await pool.query("UPDATE ai_threads SET updated_at = NOW() WHERE id = ?", [thread_id]);
        }

        res.json({ success: true, response: aiResponse });
    } catch (err) {
        console.error(err);
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

        // Check/enforce guest limit
        const [[limit]] = await pool.query(
            "SELECT message_count FROM guest_chat_limits WHERE guest_id = ?",
            [guest_id]
        );

        if (limit && limit.message_count >= GUEST_MSG_LIMIT) {
            return res.status(403).json({
                message: `You've used your ${GUEST_MSG_LIMIT} free messages. Please sign up to continue.`,
                limit_reached: true,
            });
        }

        // Update limit counter
        await pool.query(
            `INSERT INTO guest_chat_limits (guest_id, message_count) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE message_count = message_count + 1, last_seen_at = NOW()`,
            [guest_id]
        );

        const remaining = GUEST_MSG_LIMIT - ((limit?.message_count || 0) + 1);

        let aiResponse = "";
        try {
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
        } catch (aiErr) {
            aiResponse = "AI service temporarily unavailable. Please try again.";
        }

        res.json({
            success: true,
            response: aiResponse,
            messages_remaining: remaining,
            limit_reached: remaining <= 0,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to process chat" });
    }
};

// ─── DELETE /api/ai/threads/:id ───────────────────────────────────────────────
export const deleteThread = async (req, res) => {
    try {
        await pool.query("DELETE FROM ai_threads WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        res.json({ success: true, message: "Thread deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete thread" });
    }
};
