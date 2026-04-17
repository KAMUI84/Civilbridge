import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Send, Sparkles, Trash2 } from "lucide-react";
import { aiService } from "../../services/aiService";
import { useAuthStore } from "../../store/authStore";

const STORAGE_KEY = "cb_public_ai_sessions";

function readSessions() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSessions(sessions) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function clearSessionsStorage() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function buildSuggestions(message) {
  const text = String(message || "").toLowerCase();
  const suggestions = [];

  if (/plan|design|bedroom|floor/i.test(text)) {
    suggestions.push({ label: "Browse related plans", to: "/plans" });
  }
  if (/cost|budget|estimate|price/i.test(text)) {
    suggestions.push({ label: "Open the estimator", to: "/estimator" });
  }
  if (/land|plot|property|house|market/i.test(text)) {
    suggestions.push({ label: "View marketplace listings", to: "/marketplace" });
  }
  if (/engineer|architect|expert|contractor/i.test(text)) {
    suggestions.push({ label: "See approved experts", to: "/experts" });
  }

  return suggestions.slice(0, 3);
}

function createSession() {
  return {
    id: `guest-${Date.now()}`,
    title: "New chat",
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}

function getFirstName(user) {
  const raw = user?.first_name || user?.fullName || user?.full_name || user?.name || user?.email || "";
  const first = String(raw).trim().split(/\s+/)[0];
  return first || "there";
}

function getGreeting(user, isAuthenticated) {
  if (isAuthenticated && user) {
    return `Hello ${getFirstName(user)}, I’m your personal assistant. What can I help you with today?`;
  }

  return "Hello guest, I’m your personal assistant. What can I help you with today?";
}

export default function AIStudioPublic() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const stored = isAuthenticated ? readSessions() : [];

    if (!isAuthenticated) {
      clearSessionsStorage();
    }

    if (stored.length) {
      setSessions(stored);
      setActiveId(stored[0].id);
      return;
    }

    const initial = createSession();
    setSessions([initial]);
    setActiveId(initial.id);
    if (isAuthenticated) {
      writeSessions([initial]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeId]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId) || null,
    [sessions, activeId],
  );
  const hasInteracted = useMemo(
    () => Boolean(activeSession?.messages?.length),
    [activeSession],
  );
  const hasSavedHistory = useMemo(
    () => isAuthenticated && sessions.some((session) => Array.isArray(session.messages) && session.messages.length > 0),
    [isAuthenticated, sessions],
  );
  const lastUserMessage = useMemo(
    () => [...(activeSession?.messages || [])].reverse().find((message) => message.role === "user")?.content || "",
    [activeSession],
  );
  const suggestions = useMemo(() => buildSuggestions(lastUserMessage), [lastUserMessage]);
  const greeting = useMemo(() => getGreeting(user, isAuthenticated), [isAuthenticated, user]);

  function updateSessions(updater) {
    setSessions((current) => {
      const next = updater(current);
      if (isAuthenticated) {
        writeSessions(next);
      }
      return next;
    });
  }

  function handleNewChat() {
    const nextSession = createSession();
    updateSessions((current) => (isAuthenticated ? [nextSession, ...current] : [nextSession]));
    setActiveId(nextSession.id);
    setInput("");
  }

  function handleDeleteSession(sessionId) {
    updateSessions((current) => {
      const next = current.filter((session) => session.id !== sessionId);
      if (!next.length) {
        const fallback = createSession();
        setActiveId(fallback.id);
        return [fallback];
      }
      if (activeId === sessionId) {
        setActiveId(next[0].id);
      }
      return next;
    });
  }

  async function handleSend(event) {
    event?.preventDefault();
    if (!input.trim() || !activeSession || sending) return;

    const content = input.trim();
    const userMessage = { role: "user", content, createdAt: new Date().toISOString() };

    updateSessions((current) =>
      current.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              title: session.messages.length ? session.title : content.slice(0, 42),
              updatedAt: new Date().toISOString(),
              messages: [...session.messages, userMessage],
            }
          : session,
      ),
    );
    setInput("");
    setSending(true);

    try {
      const response = await aiService.guestChat(content);
      const assistantMessage = {
        role: "assistant",
        content: response?.response || "I could not generate a reply right now.",
        createdAt: new Date().toISOString(),
      };

      updateSessions((current) =>
        current.map((session) =>
          session.id === activeSession.id
            ? {
                ...session,
                updatedAt: new Date().toISOString(),
                messages: [...session.messages, assistantMessage],
              }
            : session,
        ),
      );
    } catch (error) {
      const assistantMessage = {
        role: "assistant",
        content: error.message || "Failed to get a response. Please try again.",
        createdAt: new Date().toISOString(),
      };

      updateSessions((current) =>
        current.map((session) =>
          session.id === activeSession.id
            ? {
                ...session,
                updatedAt: new Date().toISOString(),
                messages: [...session.messages, assistantMessage],
              }
            : session,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="mx-auto flex h-[calc(100vh-88px)] max-w-[1600px] gap-4 px-3 pb-4 pt-24 sm:px-4">
        {hasSavedHistory ? (
          <aside
            className={`hidden h-full rounded-[28px] border border-slate-200 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur transition-all duration-300 lg:flex lg:flex-col ${sidebarCollapsed ? "w-[76px]" : "w-[290px]"}`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              {!sidebarCollapsed ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Chat History</div>
                    <div className="text-xs text-slate-500">Your saved AI sessions</div>
                  </div>
                </div>
              ) : (
                <div className="flex w-full items-center justify-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 [writing-mode:vertical-rl]">
                  History
                </div>
              )}

              <button
                type="button"
                onClick={() => setSidebarCollapsed((current) => !current)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                aria-label={sidebarCollapsed ? "Expand history" : "Collapse history"}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>

            <div className={`border-b border-slate-200 ${sidebarCollapsed ? "px-2 py-3" : "p-4"}`}>
              <button
                type="button"
                onClick={handleNewChat}
                className={`flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 ${sidebarCollapsed ? "h-11 w-full px-0" : "w-full px-4 py-3"}`}
              >
                <MessageSquarePlus className="h-4 w-4" />
                {!sidebarCollapsed ? "New chat" : null}
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "p-2" : "p-3"}`}>
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setActiveId(session.id)}
                  className={`group mb-2 flex w-full items-start justify-between gap-3 rounded-2xl text-left transition ${session.id === activeId ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-50"} ${sidebarCollapsed ? "justify-center px-2 py-3" : "px-3 py-3"}`}
                >
                  {sidebarCollapsed ? (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-600 shadow-sm">
                      {String(session.title || "C").slice(0, 1).toUpperCase()}
                    </span>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{session.title}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          {new Date(session.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="opacity-0 transition group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-slate-400" />
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </aside>
        ) : null}

        <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white/96 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>

              {hasSavedHistory ? (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 lg:hidden"
                  aria-label="Toggle history"
                >
                  {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
              ) : null}
            </div>

            {hasSavedHistory ? (
              <button
                type="button"
                onClick={handleNewChat}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                New chat
              </button>
            ) : null}
          </div>

          <div className={`flex min-h-0 flex-1 flex-col transition-all duration-500 ${hasInteracted ? "justify-between" : "justify-center"}`}>
            <div className={`min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 ${hasInteracted ? "" : "flex items-center justify-center"}`}>
              <div className={`mx-auto w-full transition-all duration-500 ${hasInteracted ? "max-w-4xl space-y-4" : "max-w-3xl"}`}>
                {!hasInteracted ? (
                  <div className="rounded-[32px] border border-white/60 bg-white/85 px-6 py-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{greeting}</h1>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                      Describe your project, budget, plan idea, land question, or expert follow-up need and I’ll help you turn it into a workable next step.
                    </p>
                  </div>
                ) : (<>
                  {/*
                      The workspace is ready. Ask a question and I’ll keep the conversation here with relevant follow-up suggestions.
                    </p>
                  </div>
                  */}
                    {activeSession.messages.map((message, index) => (
                      <div key={`${message.createdAt}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-3xl rounded-3xl px-5 py-4 text-sm leading-7 ${message.role === "user" ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-800 shadow-sm"}`}>
                          {message.content}
                        </div>
                      </div>
                    ))}

                    {sending ? (
                      <div className="flex justify-start">
                        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                          Thinking...
                        </div>
                      </div>
                    ) : null}

                    {lastUserMessage && suggestions.length ? (
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">Relevant next steps</h3>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {suggestions.map((item) => (
                            <Link key={item.to} to={item.to} className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div ref={endRef} />
                  </>
                )}

                {!hasInteracted ? (
                  <form onSubmit={handleSend} className="mx-auto mt-8 grid max-w-3xl grid-cols-[minmax(0,1fr)_132px] gap-3 rounded-[28px] border border-slate-200 bg-white p-3 shadow-lg transition-all duration-500">
                    <textarea
                      rows={1}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Ask about plans, pricing, land, or construction follow-up..."
                      className="min-h-[64px] w-full resize-none rounded-2xl border border-slate-200 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="inline-flex h-full min-h-[64px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-5 w-5" />
                      <span>Send</span>
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            {hasInteracted ? (
              <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                <form onSubmit={handleSend} className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_132px] gap-3">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Ask about plans, pricing, land, or construction follow-up..."
                    className="min-h-[56px] w-full resize-none rounded-2xl border border-slate-300 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="inline-flex h-full min-h-[56px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-5 w-5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
