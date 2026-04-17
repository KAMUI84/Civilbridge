import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Star, SlidersHorizontal, Search, Download, FileText } from "lucide-react";
import { useState, useMemo } from "react";

const filterTabs = [
  { id: "all", label: "All Plans" },
  { id: "new", label: "Newly Added" },
  { id: "popular", label: "Most Downloaded" },
  { id: "ready", label: "Print Ready" },
];

const plans = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwZmxvb3IlMjBwbGFufGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "4-Bedroom Family Home — Full Drawing Set",
    rating: 5,
    downloads: 312,
    price: "RWF 85,000",
    badge: "New",
    type: "residential",
    format: "2D + 3D",
    sheets: 18,
    status: "Print Ready",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxhcmNoaXRlY3R1cmFsJTIwZHJhd2luZ3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Modern Villa — 3D Render + Elevation Plans",
    rating: 5,
    downloads: 487,
    price: "RWF 120,000",
    badge: "Hot",
    type: "villa",
    format: "3D Renders",
    sheets: 24,
    status: "Print Ready",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlcHJpbnQlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "2-Bedroom Starter Home — Blueprint Package",
    rating: 4,
    downloads: 228,
    price: "RWF 45,000",
    badge: "New",
    type: "residential",
    format: "2D Blueprint",
    sheets: 10,
    status: "Print Ready",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBkcmF3aW5nJTIwdGVjaG5pY2FsfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Commercial Strip Mall — Full Architectural Set",
    rating: 5,
    downloads: 156,
    price: "RWF 250,000",
    badge: "Hot",
    type: "commercial",
    format: "2D + 3D",
    sheets: 36,
    status: "Print Ready",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGRlc2lnbiUyMHBsYW58ZW58MXx8fHwxNzc2MTkzOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "3-Bedroom Bungalow — 2D Floor Plans + Sections",
    rating: 4,
    downloads: 341,
    price: "RWF 65,000",
    type: "residential",
    format: "2D Blueprint",
    sheets: 14,
    status: "Print Ready",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1601918774516-b3f0dc3dd3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBidWlsZGluZyUyMGRyYXdpbmd8ZW58MXx8fHwxNzc2MTkzOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Apartment Block Type A — 8 Units, Full Set",
    rating: 5,
    downloads: 203,
    price: "RWF 180,000",
    badge: "New",
    type: "apartment",
    format: "2D + 3D",
    sheets: 28,
    status: "Print Ready",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxhcmNoaXRlY3R1cmFsJTIwZHJhd2luZ3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "3-Storey Office Building — Technical Drawings",
    rating: 4,
    downloads: 178,
    price: "RWF 200,000",
    type: "commercial",
    format: "2D Blueprint",
    sheets: 32,
    status: "Print Ready",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxhcmNoaXRlY3R1cmFsJTIwZmxvb3IlMjBwbGFufGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Eco-Friendly Villa — Sustainable Design Package",
    rating: 5,
    downloads: 265,
    price: "RWF 150,000",
    badge: "Hot",
    type: "villa",
    format: "2D + 3D",
    sheets: 22,
    status: "Print Ready",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxibHVlcHJpbnQlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Studio Apartment — Compact Design with Loft",
    rating: 4,
    downloads: 412,
    price: "RWF 35,000",
    badge: "New",
    type: "apartment",
    format: "2D Blueprint",
    sheets: 8,
    status: "Print Ready",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxhcmNoaXRlY3R1cmUlMjBkcmF3aW5nJTIwdGVjaG5pY2FsfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Luxury 5-Bedroom Mansion — Premium Design Pack",
    rating: 5,
    downloads: 134,
    price: "RWF 350,000",
    badge: "Hot",
    type: "villa",
    format: "2D + 3D",
    sheets: 42,
    status: "Print Ready",
  },
];

export default function Plans() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [formatFilter, setFormatFilter] = useState("All Formats");
  const [priceFilter, setPriceFilter] = useState("Any Price");
  const [sheetsFilter, setSheetsFilter] = useState("Any Size");

  const filtered = useMemo(() => {
    let list = [...plans];

    if (activeFilter === "new") list = list.filter((p) => p.badge === "New");
    if (activeFilter === "popular") list = [...list].sort((a, b) => b.downloads - a.downloads);
    if (activeFilter === "ready") list = list.filter((p) => p.status === "Print Ready");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.format.toLowerCase().includes(q));
    }

    if (typeFilter !== "All Types") list = list.filter((p) => p.type === typeFilter.toLowerCase());
    if (formatFilter !== "All Formats") list = list.filter((p) => p.format.includes(formatFilter === "2D Only" ? "2D Blueprint" : formatFilter === "3D Included" ? "3D" : ""));
    if (priceFilter === "Under RWF 80,000") list = list.filter((p) => parseInt(p.price.replace(/\D/g, "")) < 80000);
    if (priceFilter === "RWF 80,000 – 200,000") {
      list = list.filter((p) => { const v = parseInt(p.price.replace(/\D/g, "")); return v >= 80000 && v <= 200000; });
    }
    if (priceFilter === "Above RWF 200,000") list = list.filter((p) => parseInt(p.price.replace(/\D/g, "")) > 200000);
    if (sheetsFilter === "Under 15 sheets") list = list.filter((p) => p.sheets < 15);
    if (sheetsFilter === "15 – 30 sheets") list = list.filter((p) => p.sheets >= 15 && p.sheets <= 30);
    if (sheetsFilter === "30+ sheets") list = list.filter((p) => p.sheets > 30);

    return list;
  }, [activeFilter, searchQuery, typeFilter, formatFilter, priceFilter, sheetsFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Building Plans Library
          </h1>
          <p className="text-xl text-emerald-50 max-w-3xl">
            Download professionally drawn 2D blueprints, floor plans, and full 3D render packages. Every plan is ready to hand to your builder.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-5">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by plan type, format, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option>All Types</option>
              <option>Residential</option>
              <option>Villa</option>
              <option>Apartment</option>
              <option>Commercial</option>
            </select>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option>All Formats</option>
              <option>2D Only</option>
              <option>3D Included</option>
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option>Any Price</option>
              <option>Under RWF 80,000</option>
              <option>RWF 80,000 – 200,000</option>
              <option>Above RWF 200,000</option>
            </select>

            <select
              value={sheetsFilter}
              onChange={(e) => setSheetsFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option>Any Size</option>
              <option>Under 15 sheets</option>
              <option>15 – 30 sheets</option>
              <option>30+ sheets</option>
            </select>

            <button
              onClick={() => { setTypeFilter("All Types"); setFormatFilter("All Formats"); setPriceFilter("Any Price"); setSheetsFilter("Any Size"); setSearchQuery(""); setActiveFilter("all"); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Clear Filters
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> plan{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No plans match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {plan.badge && (
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.badge === "New" ? "bg-emerald-600 text-white" : "bg-orange-500 text-white"
                      }`}>
                        {plan.badge}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-700">
                      {plan.format}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.75rem] text-sm leading-snug">
                      {plan.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < plan.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {plan.sheets} sheets
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" />
                        {plan.downloads.toLocaleString()} downloads
                      </span>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-emerald-600">{plan.price}</p>
                      <button className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
              Load More Plans
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need a Custom Plan?</h2>
          <p className="text-lg text-teal-50 mb-8">
            Describe your land, budget, and requirements. Our AI generates a tailored drawing package, reviewed by a certified architect.
          </p>
          <button className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors">
            Generate Custom Plan
          </button>
        </div>
      </section>
    </div>
  );
}
