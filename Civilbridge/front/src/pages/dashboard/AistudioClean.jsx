import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Send, Sparkles, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { aiService } from "../../services/aiService";
import { useAuthStore } from "../../store/authStore";

function buildSuggestions(message) {
  const text = String(message || "").toLowerCase();
  const suggestions = [];

  if (/plan|design|bedroom|floor/i.test(text)) {
    suggestions.push({ label: "Browse plans", to: "/plans" });
  }
  if (/cost|budget|estimate|price/i.test(text)) {
    suggestions.push({ label: "Open estimator", to: "/estimator" });
  }
  if (/land|plot|property|house|market/i.test(text)) {
    suggestions.push({ label: "View marketplace", to: "/marketplace" });
  }
  if (/engineer|architect|expert|contractor/i.test(text)) {
    suggestions.push({ label: "See approved experts", to: "/experts" });
  }

  return suggestions.slice(0, 3);
}

function getFirstName(user) {
  const raw = user?.first_name || user?.fullName || user?.full_name || user?.name || user?.email || "";
  const first = String(raw).trim().split(/\s+/)[0];
  return first || "there";
}

export default function AistudioClean() {
  const user = useAuthStore((state) => state.user);
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const endRef = useRef(null);

  const selectThread = useCallback(async (thread) => {
    setActiveThread(thread);
    setLoading(true);

    try {
      const response = await aiService.getMessages(thread.id);
      setMessages(response?.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await aiService.getThreads();
      const nextThreads = response?.threads || [];
      setThreads(nextThreads);

      if (nextThreads.length) {
        await selectThread(nextThreads[0]);
      } else {
        setActiveThread(null);
        setMessages([]);
      }
    } catch {
      setThreads([]);
      setActiveThread(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [selectThread]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastUserMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "user")?.content || "",
    [messages],
  );
  const suggestions = useMemo(() => buildSuggestions(lastUserMessage), [lastUserMessage]);
  const hasInteracted = useMemo(
    () => threads.length > 0 || messages.length > 0,
    [messages.length, threads.length],
  );
  const greeting = useMemo(() => `Hello there, ${getFirstName(user)}!`, [user]);

  async function handleNewThread() {
    try {
      const response = await aiService.createThread({ title: "New chat" });
      const nextThread = {
        id: response.thread_id,
        title: response.title || "New chat",
        created_at: new Date().toISOString(),
      };
      setThreads((current) => [nextThread, ...current]);
      setActiveThread(nextThread);
      setMessages([]);
      setInput("");
    } catch {
      // Ignore create thread failures and leave the user in place.
    }
  }

  async function handleSend(event) {
    event?.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    let threadToUse = activeThread;

    if (!threadToUse) {
      try {
        const created = await aiService.createThread({ title: content.slice(0, 42) || "New chat" });
        threadToUse = {
          id: created.thread_id,
          title: created.title || content.slice(0, 42) || "New chat",
          created_at: new Date().toISOString(),
        };
        setThreads((current) => [threadToUse, ...current]);
        setActiveThread(threadToUse);
      } catch {
        return;
      }
    }

    const userMessage = { role: "user", content, created_at: new Date().toISOString() };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await aiService.sendMessage(threadToUse.id, content);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response?.response || "I could not generate a reply right now.",
          created_at: new Date().toISOString(),
        },
      ]);
      await loadThreads();
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || "Failed to get a response. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
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

  async function handleDeleteThread(threadId, event) {
    event.stopPropagation();

    try {
      await aiService.deleteThread(threadId);
      const nextThreads = threads.filter((thread) => thread.id !== threadId);
      setThreads(nextThreads);

      if (activeThread?.id === threadId) {
        if (nextThreads.length) {
          await selectThread(nextThreads[0]);
        } else {
          setActiveThread(null);
          setMessages([]);
        }
      }
    } catch {
      // Ignore delete failure.
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[calc(100vh-120px)] gap-4 overflow-hidden">
      {hasInteracted ? (
        <aside
          className={`hidden h-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg transition-all duration-300 lg:flex lg:flex-col ${sidebarCollapsed ? "w-[76px]" : "w-[290px]"}`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Chat History</div>
                  <div className="text-xs text-slate-500">Saved dashboard threads</div>
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
              onClick={handleNewThread}
              className={`flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 ${sidebarCollapsed ? "h-11 w-full px-0" : "w-full px-4 py-3"}`}
            >
              <MessageSquarePlus className="h-4 w-4" />
              {!sidebarCollapsed ? "New chat" : null}
            </button>
          </div>

          <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "p-2" : "p-3"}`}>
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => selectThread(thread)}
                className={`group mb-2 flex w-full items-start justify-between gap-3 rounded-2xl text-left transition ${thread.id === activeThread?.id ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-50"} ${sidebarCollapsed ? "justify-center px-2 py-3" : "px-3 py-3"}`}
              >
                {sidebarCollapsed ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-600 shadow-sm">
                    {String(thread.title || "C").slice(0, 1).toUpperCase()}
                  </span>
                ) : (
                  <>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{thread.title || "Untitled chat"}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        {thread.created_at ? new Date(thread.created_at).toLocaleString() : ""}
                      </div>
                    </div>
                    <span
                      onClick={(event) => handleDeleteThread(thread.id, event)}
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

      <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit AI
            </Link>

            {hasInteracted ? (
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

          {hasInteracted ? (
            <button
              type="button"
              onClick={handleNewThread}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              New chat
            </button>
          ) : null}
        </div>

        <div className={`flex min-h-0 flex-1 flex-col transition-all duration-500 ${hasInteracted ? "justify-between" : "justify-center"}`}>
          <div className={`min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 ${hasInteracted ? "" : "flex items-center justify-center"}`}>
            <div className={`mx-auto w-full transition-all duration-500 ${hasInteracted ? "max-w-4xl space-y-4" : "max-w-3xl"}`}>
              {loading && hasInteracted ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                  Loading conversation...
                </div>
              ) : !hasInteracted ? (
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{greeting}</h1>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                    Start with a real project question and this page will shift into a full workspace with saved history, next steps, and a focused conversation area.
                  </p>
                </div>
              ) : !messages.length ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Describe your project</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Once you send the first message, I’ll keep the conversation here and suggest the next relevant step.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={`${message.created_at}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
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
  );
}
