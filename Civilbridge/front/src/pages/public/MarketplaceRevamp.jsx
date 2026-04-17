import { ArrowRight, BedDouble, Building2, MapPin, Maximize2, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMarketplaceListings } from "../../Data/publicCatalog";

const filterTabs = [
  { id: "all", label: "All Listings" },
  { id: "new", label: "Newly Listed" },
  { id: "best-value", label: "Best Value" },
  { id: "prime", label: "Prime Locations" },
];

const listings = getMarketplaceListings();

export default function MarketplaceRevamp() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Types");
  const [locationFilter, setLocationFilter] = useState("All Districts");

  const filtered = useMemo(() => {
    let next = [...listings];

    if (activeFilter === "new") next = next.filter((item) => item.badge === "New");
    if (activeFilter === "best-value") next = [...next].sort((a, b) => a.price - b.price);
    if (activeFilter === "prime") next = next.filter((item) => item.prime);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      next = next.filter((item) =>
        [item.title, item.location, item.tag, item.category].some((value) => value.toLowerCase().includes(query)),
      );
    }

    if (categoryFilter !== "All Types") next = next.filter((item) => item.category === categoryFilter);
    if (locationFilter !== "All Districts") next = next.filter((item) => item.district === locationFilter);

    return next;
  }, [activeFilter, categoryFilter, locationFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-slate-900 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] pt-28 pb-12">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">
              Marketplace
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Large listing cards with the details that matter first.</h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Tighter margins give more space to imagery, price, location, and specs so users can compare properties without squinting through oversized page chrome.
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
                placeholder="Search by name, district, or listing type"
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
                setCategoryFilter("All Types");
                setLocationFilter("All Districts");
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
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-teal-400"
            >
              <option>All Types</option>
              <option value="house">house</option>
              <option value="villa">villa</option>
              <option value="land">land</option>
              <option value="commercial">commercial</option>
            </select>
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-teal-400"
            >
              <option>All Districts</option>
              <option>Gasabo</option>
              <option>Nyarugenge</option>
              <option>Kicukiro</option>
            </select>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-slate-400">
            Showing <span className="font-semibold text-slate-100">{filtered.length}</span> listing{filtered.length !== 1 ? "s" : ""}
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <Link
                key={listing.id}
                to={`/marketplace/${listing.id}`}
                className="group overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900/75 transition duration-300 hover:-translate-y-1 hover:border-teal-500/35 hover:shadow-[0_24px_60px_rgba(20,184,166,0.12)]"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    {listing.badge ? (
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">
                        {listing.badge}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-xs font-semibold text-slate-100">
                      {listing.tag}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{listing.title}</h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4 text-teal-300" />
                        {listing.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-teal-200">{listing.priceLabel}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{listing.engineeringGrade}</div>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-300">{listing.shortDescription}</p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                      <BedDouble className="mb-2 h-4 w-4 text-teal-300" />
                      <div className="text-sm font-semibold text-white">{listing.bedrooms || "-"}</div>
                      <div className="text-xs text-slate-500">Bedrooms</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                      <Maximize2 className="mb-2 h-4 w-4 text-teal-300" />
                      <div className="text-sm font-semibold text-white">{listing.area}</div>
                      <div className="text-xs text-slate-500">Area</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-3">
                      <Building2 className="mb-2 h-4 w-4 text-teal-300" />
                      <div className="text-sm font-semibold text-white">{listing.lotSize}</div>
                      <div className="text-xs text-slate-500">Site</div>
                    </div>
                  </div>

                  <div className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-teal-200">
                    View detail page
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
