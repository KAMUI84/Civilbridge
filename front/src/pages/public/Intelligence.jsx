import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { aiChat } from "../../api/ai";
import { useAuthStore } from "../../store/authStore";
import AuthGateModal from "../../components/auth/authGateModal";

const GUEST_LIMIT = 3;

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function Intelligence() {
  const nav = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const authed = isAuthenticated;

  const [messages, setMessages] = useState(() =>
    lsGet("cb_ai_messages", [
      {
        role: "model",
        content:
          "Hi! I’m CivilBridge Intelligence. Ask anything about plans, BOQ, costs, permits, or project steps.",
      },
    ])
  );

  const [guestCount, setGuestCount] = useState(() => lsGet("cb_ai_guest_count", 0));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showGate, setShowGate] = useState(false);

  const listRef = useRef(null);

  // Persist
  useEffect(() => {
    lsSet("cb_ai_messages", messages);
  }, [messages]);

  useEffect(() => {
    lsSet("cb_ai_guest_count", guestCount);
  }, [guestCount]);

  // Scroll to bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const remaining = useMemo(() => {
    if (authed) return Infinity;
    return Math.max(0, GUEST_LIMIT - guestCount);
  }, [authed, guestCount]);

  const canSend = authed || guestCount < GUEST_LIMIT;

  async function send() {
    setError("");
    const text = input.trim();
    if (!text || busy) return;

    // If guest already hit the limit => open modal
    if (!canSend) {
      setShowGate(true);
      return;
    }

    setInput("");
    setBusy(true);

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    // increment guest count only for guests
    if (!authed) setGuestCount((c) => c + 1);

    try {
      // Convert to history for backend
      const history = nextMessages
        .filter((m) => m.role === "user" || m.role === "model")
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await aiChat({ message: text, history });

      setMessages((prev) => [
        ...prev,
        { role: "model", content: data.reply || "No reply returned." },
      ]);
    } catch (e) {
      setError(e?.message || "AI failed");
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry — something failed. Try again." },
      ]);
    } finally {
      setBusy(false);

      // If this message made guest hit limit, we can open gate on next try,
      // OR immediately show a small tip:
      // (we keep it simple: gate opens only when trying to send again)
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function resetChat() {
    const fresh = [
      {
        role: "model",
        content:
          "Hi! I’m CivilBridge Intelligence. Ask anything about plans, BOQ, costs, permits, or project steps.",
      },
    ];
    setMessages(fresh);
    if (!authed) setGuestCount(0);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 18px 40px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: "#0c1220", letterSpacing: "-0.02em" }}>
            Intelligence
          </h1>
          <p style={{ margin: "8px 0 0", color: "#64708a", fontWeight: 650, maxWidth: 720 }}>
            Fast BOQ outlines, project steps, planning advice, materials guidance, and compliance checklists.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!authed ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid #eef0f4",
                background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
                color: "#0c1220",
                fontWeight: 850,
                fontSize: 13,
              }}
            >
              Guest messages left: <span style={{ color: "#1d4ed8" }}>{remaining}</span>
            </div>
          ) : (
            <div style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid #eef0f4", fontWeight: 850, fontSize: 13 }}>
              Unlimited (Logged in)
            </div>
          )}

          <button
            onClick={resetChat}
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid #eef0f4",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            New chat
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          border: "1px solid #eef0f4",
          borderRadius: 18,
          background: "#fff",
          overflow: "hidden",
          boxShadow: "0 14px 40px rgba(12,18,32,.06)",
        }}
      >
        {/* Chat body */}
        <div
          ref={listRef}
          style={{
            height: "62vh",
            minHeight: 420,
            padding: 16,
            overflow: "auto",
            background:
              "radial-gradient(900px 420px at 0% 0%, rgba(42,102,255,0.08), transparent 60%), linear-gradient(180deg,#ffffff,#fbfcff)",
          }}
        >
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}

          {busy ? <Bubble role="model" text="Thinking…" dim /> : null}
        </div>

        {/* Error */}
        {error ? (
          <div style={{ padding: "10px 14px", borderTop: "1px solid #eef0f4", background: "#fff1f2", color: "#9f1239", fontWeight: 750 }}>
            {error}
          </div>
        ) : null}

        {/* Composer */}
        <div style={{ borderTop: "1px solid #eef0f4", padding: 12, background: "#fff" }}>
          {!authed && !canSend ? (
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                border: "1px solid #eef0f4",
                background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ color: "#0c1220", fontWeight: 850 }}>
                Guest limit reached. Please sign in to continue.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowGate(true)} style={primaryBtn}>
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about BOQ, costs, permits, steps, materials..."
                rows={2}
                style={{
                  flex: 1,
                  resize: "none",
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid #e9ecf2",
                  outline: "none",
                  fontWeight: 650,
                }}
              />
              <button
                onClick={send}
                disabled={busy}
                style={{
                  ...primaryBtn,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthGateModal
        open={showGate}
        onClose={() => setShowGate(false)}
        onGoLogin={() => nav("/login")}
        onGoRegister={() => nav("/register")}
      />
    </div>
  );
}

function Bubble({ role, text, dim }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      <div
        style={{
          maxWidth: 720,
          padding: "12px 14px",
          borderRadius: 16,
          border: "1px solid #eef0f4",
          background: isUser ? "linear-gradient(135deg,#2a66ff,#1d4ed8)" : "#fff",
          color: isUser ? "#fff" : "#0c1220",
          boxShadow: isUser ? "0 14px 26px rgba(29,78,216,.18)" : "0 10px 24px rgba(12,18,32,.05)",
          fontWeight: 650,
          lineHeight: 1.55,
          opacity: dim ? 0.75 : 1,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    </div>
  );
}

const primaryBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(65, 89, 157, 0.2)",
  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(29,78,216,.18)",
};