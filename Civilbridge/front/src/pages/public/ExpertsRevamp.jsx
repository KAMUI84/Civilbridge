import { ArrowRight, BadgeCheck, MapPin, Search, SlidersHorizontal, Star, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getExpertsDirectory } from "../../Data/publicCatalog";

const experts = getExpertsDirectory();
const filterTabs = [
  { id: "all", label: "All Experts" },
  { id: "top-rated", label: "Top Rated" },
  { id: "most-reviewed", label: "Most Reviewed" },
  { id: "available", label: "Available Now" },
];

export default function ExpertsRevamp() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [profession, setProfession] = useState("All Professions");
  const [availability, setAvailability] = useState("Any Status");

  const filtered = useMemo(() => {
    let next = [...experts];

    if (activeFilter === "top-rated") next = next.filter((item) => item.rating >= 4.8);
    if (activeFilter === "most-reviewed") next = [...next].sort((a, b) => b.reviews - a.reviews);
    if (activeFilter === "available") next = next.filter((item) => item.available);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      next = next.filter((item) =>
        [item.name, item.profession, item.location, ...item.specialties].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    if (profession !== "All Professions") next = next.filter((item) => item.profession === profession);
    if (availability === "Available only") next = next.filter((item) => item.available);
    if (availability === "Busy only") next = next.filter((item) => !item.available);

    return next;
  }, [activeFilter, availability, profession, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-slate-900 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] pt-28 pb-12">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              Expert Directory
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Expert pages are tuned for follow-up, not dead ends.</h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Browse verified specialists, open richer profiles, and keep users moving with clear reasons to contact and similar expert recommendations.
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
                placeholder="Search by name, specialty, or location"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
                setProfession("All Professions");
                setAvailability("Any Status");
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
                    ? "bg-sky-400 text-slate-950"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
            >
              <option>All Professions</option>
              {[...new Set(experts.map((item) => item.profession))].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
            >
              <option>Any Status</option>
              <option>Available only</option>
              <option>Busy only</option>
            </select>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-slate-400">
            Showing <span className="font-semibold text-slate-100">{filtered.length}</span> expert{filtered.length !== 1 ? "s" : ""}
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((expert) => (
              <Link
                key={expert.id}
                to={`/experts/${expert.id}`}
                className="group rounded-[30px] border border-slate-800 bg-slate-900/75 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-500/35 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)]"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white"
                      style={{ backgroundColor: expert.color }}
                    >
                      {expert.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-white">{expert.name}</h2>
                        {expert.verified ? <BadgeCheck className="h-4 w-4 text-sky-300" /> : null}
                      </div>
                      <div className="mt-1 text-sm text-sky-200">{expert.profession}</div>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${expert.available ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                    {expert.available ? "Available" : "Busy"}
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 text-sky-300" />
                  {expert.location}
                </div>

                <p className="text-sm leading-6 text-slate-300">{expert.bio}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {expert.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full border border-slate-800 bg-slate-950/75 px-3 py-1 text-xs text-slate-300"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                    <Star className="mb-2 h-4 w-4 text-amber-300" />
                    <div className="text-sm font-semibold text-white">{expert.rating}</div>
                    <div className="text-xs text-slate-500">Rating</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                    <Timer className="mb-2 h-4 w-4 text-sky-300" />
                    <div className="text-sm font-semibold text-white">{expert.experience} yrs</div>
                    <div className="text-xs text-slate-500">Experience</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                    <div className="mb-2 text-sm font-semibold text-sky-200">RWF</div>
                    <div className="text-sm font-semibold text-white">{expert.rate.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Per hour</div>
                  </div>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-200">
                  View profile
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
