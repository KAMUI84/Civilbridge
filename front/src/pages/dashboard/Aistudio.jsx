import { useEffect, useMemo, useRef, useState } from "react";
import { getUser } from "../../store/authStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AiStudio() {
  const user = getUser();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // per-user local history (MVP)
  const storageKey = useMemo(() => `cb_ai_chat_${user?.id || user?.email || "guest"}`, [user]);
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const listRef = useRef(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const next = [
      ...messages,
      { role: "user", content: text, ts: nowTime() },
    ];
    setMessages(next);
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // adapt to your authStore token key
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history: next.slice(-10), // keep last 10 turns for cost + speed
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI request failed");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, ts: nowTime() },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message}`, ts: nowTime() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: "#0c1220", fontWeight: 950 }}>AI Studio</h1>
          <div style={{ color: "#64708a", fontWeight: 650 }}>
            Simple assistant chat (MVP). Later: memory, documents, estimation tools.
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Clear chat?")) setMessages([]);
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid #eef0f4",
            background: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      <div
        ref={listRef}
        style={{
          border: "1px solid #eef0f4",
          borderRadius: 18,
          background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
          height: "60vh",
          overflow: "auto",
          padding: 12,
          display: "grid",
          gap: 10,
        }}
      >
        {messages.length === 0 ? (
          <div style={{ padding: 14, borderRadius: 16, background: "#fff", border: "1px dashed #e9ecf2", color: "#64708a", fontWeight: 650 }}>
            Ask anything like:
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              <span>• “Give me a BOQ outline for a 2-bedroom house.”</span>
              <span>• “What permits are usually needed before building?”</span>
              <span>• “How do I estimate bricks and cement for a wall?”</span>
            </div>
          </div>
        ) : null}

        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} ts={m.ts} text={m.content} />
        ))}

        {loading ? (
          <div style={{ color: "#64708a", fontWeight: 700, padding: "8px 6px" }}>
            Thinking…
          </div>
        ) : null}
      </div>

      <div
        style={{
          border: "1px solid #eef0f4",
          borderRadius: 18,
          background: "#fff",
          padding: 12,
          display: "grid",
          gap: 10,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message…"
          style={{
            width: "100%",
            border: "1px solid #e9ecf2",
            borderRadius: 14,
            padding: 12,
            outline: "none",
            resize: "none",
            minHeight: 54,
            fontWeight: 650,
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ color: "#64708a", fontWeight: 650 }}>
            Enter to send • Shift+Enter new line
          </div>

          <button
            onClick={send}
            disabled={loading}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(29,78,216,0.2)",
              background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
              color: "#fff",
              fontWeight: 950,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
              boxShadow: "0 14px 26px rgba(29,78,216,.18)",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, text, ts }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 12px",
          borderRadius: 16,
          border: "1px solid #eef0f4",
          background: isUser ? "linear-gradient(135deg,#2a66ff,#1d4ed8)" : "#fff",
          color: isUser ? "#fff" : "#0c1220",
          boxShadow: "0 10px 24px rgba(12,18,32,.05)",
          whiteSpace: "pre-wrap",
        }}
      >
        <div style={{ fontWeight: 750, lineHeight: 1.5 }}>{text}</div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75, fontWeight: 700 }}>
          {isUser ? "You" : "CivilBridge AI"} • {ts}
        </div>
      </div>
    </div>
  );
}