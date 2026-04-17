import {
  ArrowRight,
  BellRing,
  BookOpen,
  Calculator,
  FileText,
  Plus,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getExpertsDirectory,
  getMarketplaceListings,
  getPlanLibraryItems,
} from "../../Data/publicCatalog";

const threads = [
  { id: "thread-1", title: "4-bedroom estimate review", time: "2 hours ago" },
  { id: "thread-2", title: "Gasabo land shortlist", time: "Yesterday" },
  { id: "thread-3", title: "Engineer assignment prep", time: "This week" },
];

const startingMessages = [
  {
    role: "assistant",
    content:
      "I can help you compare plans, estimate build cost, shortlist marketplace options, and prepare a clear reason for follow-up with an expert.",
  },
  {
    role: "user",
    content: "I need a 3-bedroom house plan and a rough budget under 50M RWF.",
  },
  {
    role: "assistant",
    content:
      "A compact bungalow or starter duplex is the strongest fit. I would compare a 3-bedroom bungalow package, estimate the build range, then line up a structural review if you want to proceed.",
  },
];

const suggestions = [
  "Compare two build-ready house plans for a 50M RWF budget.",
  "What marketplace listings match a compact family build strategy?",
  "Which expert should review drainage and structural assumptions first?",
  "Help me prepare a follow-up request for a plan I like.",
];

const planMatches = getPlanLibraryItems().slice(0, 2);
const expertMatches = getExpertsDirectory().slice(0, 2);
const marketMatches = getMarketplaceListings().slice(0, 2);

export default function AIWorkspaceRevamp() {
  const [activeThread, setActiveThread] = useState(threads[0].id);
  const [message, setMessage] = useState("");
  const activeMessages = startingMessages;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-800 bg-slate-900/75 px-5 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">AI Workspace</h1>
                <p className="text-sm text-slate-400">Chat history on the left, active work in the center, recommendations on the right.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/ai-studio"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/75 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Dashboard workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">
              <Plus className="h-4 w-4" />
              New conversation
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
          <aside className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Chat History</h2>
                <p className="text-xs text-slate-400">Recent planning threads</p>
              </div>
              <BellRing className="h-4 w-4 text-teal-300" />
            </div>

            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThread(thread.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    activeThread === thread.id
                      ? "border-teal-500/35 bg-teal-500/12 text-white"
                      : "border-slate-800 bg-slate-950/75 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="text-sm font-semibold">{thread.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{thread.time}</div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">Why left-side history</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                This mirrors familiar chat tools so users can switch context quickly without sacrificing the active task panel.
              </p>
            </div>
          </aside>

          <main className="flex min-h-[720px] flex-col rounded-[28px] border border-slate-800 bg-slate-900/75">
            <div className="border-b border-slate-800 px-6 py-5">
              <h2 className="text-lg font-semibold text-white">Active Planning Session</h2>
              <p className="text-sm text-slate-400">Use the center panel for the current question, estimate, or follow-up draft.</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {activeMessages.map((entry, index) => (
                <div
                  key={`${entry.role}-${index}`}
                  className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-3xl rounded-[24px] px-5 py-4 text-sm leading-7 ${
                      entry.role === "user"
                        ? "bg-teal-500 text-slate-950"
                        : "border border-slate-800 bg-slate-950/80 text-slate-200"
                    }`}
                  >
                    {entry.content}
                  </div>
                </div>
              ))}

              <div className="grid gap-3 md:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setMessage(suggestion)}
                    className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4 text-left text-sm text-slate-300 transition hover:border-teal-500/35 hover:bg-teal-500/8"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 px-6 py-5">
              <div className="flex gap-3">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  placeholder="Ask for a plan comparison, a shortlist, a cost estimate, or a follow-up draft..."
                  className="min-h-[92px] flex-1 rounded-[22px] border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400"
                />
                <button className="inline-flex h-14 items-center gap-2 self-end rounded-2xl bg-teal-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                The workspace stays focused on the current task. Recommendations live in a separate side panel so the center never feels crowded.
              </p>
            </div>
          </main>

          <aside className="space-y-4 rounded-[28px] border border-slate-800 bg-slate-900/80 p-4">
            <div className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Calculator className="h-4 w-4 text-teal-300" />
                Plan matches
              </div>
              <div className="space-y-3">
                {planMatches.map((plan) => (
                  <Link
                    key={plan.id}
                    to={`/plans/${plan.id}`}
                    className="block rounded-2xl border border-slate-800 bg-slate-900/80 p-3 transition hover:border-teal-500/35"
                  >
                    <div className="text-sm font-semibold text-white">{plan.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{plan.price} · {plan.format}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Users className="h-4 w-4 text-teal-300" />
                Experts to involve
              </div>
              <div className="space-y-3">
                {expertMatches.map((expert) => (
                  <Link
                    key={expert.id}
                    to={`/experts/${expert.id}`}
                    className="block rounded-2xl border border-slate-800 bg-slate-900/80 p-3 transition hover:border-teal-500/35"
                  >
                    <div className="text-sm font-semibold text-white">{expert.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{expert.profession} · RWF {expert.rate.toLocaleString()}/hr</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <BookOpen className="h-4 w-4 text-teal-300" />
                Similar listings
              </div>
              <div className="space-y-3">
                {marketMatches.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/marketplace/${listing.id}`}
                    className="block rounded-2xl border border-slate-800 bg-slate-900/80 p-3 transition hover:border-teal-500/35"
                  >
                    <div className="text-sm font-semibold text-white">{listing.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{listing.location} · {listing.priceLabel}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-teal-500/20 bg-teal-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-100">
                <FileText className="h-4 w-4" />
                Workspace rule
              </div>
              <p className="text-sm leading-6 text-teal-50/90">
                Keep chat history on the left, the active task in the middle, and supplementary recommendations on the side.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
