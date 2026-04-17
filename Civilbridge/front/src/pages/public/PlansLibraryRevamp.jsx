import { ArrowRight, Download, FileText, Search, SlidersHorizontal, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPlanLibraryItems } from "../../Data/publicCatalog";

const filterTabs = [
  { id: "all", label: "All Plans" },
  { id: "new", label: "Newly Added" },
  { id: "popular", label: "Most Downloaded" },
  { id: "ready", label: "Print Ready" },
];

const plans = getPlanLibraryItems();

export default function PlansLibraryRevamp() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [formatFilter, setFormatFilter] = useState("All Formats");

  const filtered = useMemo(() => {
    let next = [...plans];

    if (activeFilter === "new") next = next.filter((item) => item.badge === "New");
    if (activeFilter === "popular") next = [...next].sort((a, b) => b.downloads - a.downloads);
    if (activeFilter === "ready") next = next.filter((item) => item.status === "Print Ready");

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      next = next.filter((item) =>
        [item.title, item.type, item.style, item.format].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    if (typeFilter !== "All Types") next = next.filter((item) => item.type === typeFilter);
    if (formatFilter !== "All Formats") next = next.filter((item) => item.format.includes(formatFilter));

    return next;
  }, [activeFilter, formatFilter, searchQuery, typeFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-slate-900 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.18),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] pt-28 pb-12">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">
              Plan Library
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Plans get bigger previews and stronger detail-page handoff.</h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Larger cards surface sheet counts, plan type, and cost direction earlier so users can move into a full technical page with less friction.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-[72px] z-30 border-b border-slate-900 bg-slate-950/90 py-5 backdrop-blur">
        <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by plan type, style, or format"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
                setTypeFilter("All Types");
                setFormatFilter("All Formats");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Reset filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === tab.id
                    ? "bg-teal-500 text-slate-950"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-teal-400"
            >
              <option>All Types</option>
              <option value="residential">residential</option>
              <option value="villa">villa</option>
              <option value="commercial">commercial</option>
              <option value="apartment">apartment</option>
            </select>
            <select
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-teal-400"
            >
              <option>All Formats</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
            </select>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-slate-400">
            Showing <span className="font-semibold text-slate-100">{filtered.length}</span> plan{filtered.length !== 1 ? "s" : ""}
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((plan) => (
              <Link
                key={plan.id}
                to={`/plans/${plan.id}`}
                className="group overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900/75 transition duration-300 hover:-translate-y-1 hover:border-teal-500/35 hover:shadow-[0_24px_60px_rgba(20,184,166,0.12)]"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className="rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-slate-950">
                      {plan.tier}
                    </span>
                    {plan.badge ? (
                      <span className="rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-xs font-semibold text-slate-100">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{plan.title}</h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <FileText className="h-4 w-4 text-teal-300" />
                        {plan.format} · {plan.style}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-teal-200">{plan.price}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{plan.type}</div>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-300">{plan.summary}</p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                      <div className="text-sm font-semibold text-white">{plan.bedrooms || "-"}</div>
                      <div className="text-xs text-slate-500">Bedrooms</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                      <div className="text-sm font-semibold text-white">{plan.builtAreaM2} sqm</div>
                      <div className="text-xs text-slate-500">Built area</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                      <div className="text-sm font-semibold text-white">{plan.sheets}</div>
                      <div className="text-xs text-slate-500">Sheets</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-amber-300">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${index < plan.rating ? "fill-current" : "text-slate-700"}`}
                        />
                      ))}
                      <span className="ml-2 text-slate-400">{plan.downloads.toLocaleString()} downloads</span>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200">
                      View detail page
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-[30px] border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-white">Need a custom plan instead?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Start with the AI workspace, compare cost and layout tradeoffs, then hand the request to an architect or engineer for follow-up.
                </p>
              </div>
              <Link
                to="/intelligence"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Open AI Workspace
                <Download className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
