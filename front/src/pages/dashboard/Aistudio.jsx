import { useState, useEffect, useRef } from "react";
import { aiService } from "../../services/aiService.js";

export default function AiStudio() {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadThreads() {
    try {
      const data = await aiService.getThreads();
      setThreads(data.threads || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function selectThread(thread) {
    setActiveThread(thread);
    setLoading(true);
    try {
      const data = await aiService.getMessages(thread.id);
      setMessages(data.messages || []);
    } catch (e) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function newThread() {
    try {
      const data = await aiService.createThread({ title: "New Conversation" });
      const newT = { id: data.thread_id, title: "New Conversation", created_at: new Date().toISOString() };
      setThreads(prev => [newT, ...prev]);
      setActiveThread(newT);
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  }

  async function sendMessage(e) {
    e?.preventDefault();
    if (!input.trim() || !activeThread || sending) return;

    const userMsg = { role: "user", content: input, created_at: new Date().toISOString() };
    const currentInput = input;
    setInput("");
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await aiService.sendMessage(activeThread.id, currentInput);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.response,
        created_at: new Date().toISOString(),
      }]);
      // Update thread title if it was auto-generated
      await loadThreads();
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Failed to get response. Please try again.",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  }

  async function deleteThread(threadId, e) {
    e.stopPropagation();
    try {
      await aiService.deleteThread(threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (activeThread?.id === threadId) {
        setActiveThread(null);
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function renderAssistantMessage(content) {
    const text = String(content ?? "");

    // Split into code blocks (``` ... ```)
    const parts = text.split(/```([\s\S]*?)```/g); // even idx = text, odd idx = code

    return parts.map((part, idx) => {
      const isCode = idx % 2 === 1;
      if (isCode) {
        return (
          <pre
            key={`code-${idx}`}
            className="bg-gray-800 text-green-400 p-3 rounded-lg text-xs my-2 overflow-x-auto whitespace-pre-wrap"
          >
            {part}
          </pre>
        );
      }

      // Inline formatting for non-code segments:
      // - backticks: `code`
      // - bold: **text**
      // - italic: *text*
      // We do this by tokenizing, never by injecting HTML.
      const tokens = part.split(/(`[^`]*`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

      return (
        <span key={`txt-${idx}`}>
          {tokens.map((t, j) => {
            if (t.startsWith("`") && t.endsWith("`")) {
              return (
                <code key={`inlcode-${idx}-${j}`} className="bg-gray-100 text-red-600 px-1 rounded text-sm">
                  {t.slice(1, -1)}
                </code>
              );
            }
            if (t.startsWith("**") && t.endsWith("**")) {
              return <strong key={`bold-${idx}-${j}`}>{t.slice(2, -2)}</strong>;
            }
            if (t.startsWith("*") && t.endsWith("*")) {
              return <em key={`em-${idx}-${j}`}>{t.slice(1, -1)}</em>;
            }

            // Preserve newlines without HTML.
            const lines = t.split("\n");
            return (
              <span key={`plain-${idx}-${j}`}>
                {lines.map((line, k) => (
                  <span key={`line-${idx}-${j}-${k}`}>
                    {line}
                    {k < lines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </span>
            );
          })}
        </span>
      );
    });
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg">🤖</div>
            <div>
              <h2 className="font-bold text-gray-900">AI Studio</h2>
              <p className="text-xs text-gray-400">Construction Intelligence</p>
            </div>
          </div>
          <button
            onClick={newThread}
            className="w-full bg-emerald-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-emerald-700 transition"
          >
            + New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {threads.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-6 px-4">No conversations yet. Start a new one!</p>
          ) : (
            threads.map(t => (
              <div
                key={t.id}
                onClick={() => selectThread(t)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group transition ${activeThread?.id === t.id ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <span className="text-sm truncate flex-1">{t.title}</span>
                <button
                  onClick={(e) => deleteThread(t.id, e)}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-500 transition text-xs"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{activeThread.title}</h3>
              <p className="text-xs text-gray-400">CivilBridge AI — Rwanda Construction Expert</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🏗️</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Ask me anything about construction</h3>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-4">
                    {[
                      "How much does it cost to build a 3-bedroom house in Kigali?",
                      "What permits do I need for a commercial project?",
                      "Best materials for roofing in Rwanda?",
                      "How to calculate concrete for a foundation?",
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-left text-xs bg-white border border-gray-200 rounded-xl p-3 hover:border-emerald-300 hover:bg-emerald-50 transition text-gray-600"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5">
                        🤖
                      </div>
                    )}
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                          ? "bg-emerald-600 text-white rounded-tr-none"
                          : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"
                        }`}
                    >
                      {m.role === "user" ? m.content : renderAssistantMessage(m.content)}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mr-3 flex-shrink-0">🤖</div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about construction costs, materials, permits in Rwanda..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">CivilBridge AI Studio</h3>
              <p className="text-gray-400 mb-6">Your expert construction assistant for Rwanda</p>
              <button
                onClick={newThread}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                Start a Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
