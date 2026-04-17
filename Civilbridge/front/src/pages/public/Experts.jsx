import { Star, Search, SlidersHorizontal, MapPin, BadgeCheck, Clock, MessageSquare } from "lucide-react";
import { useState, useMemo } from "react";

const experts = [
  {
    id: 1,
    name: "Jean-Paul Nkurunziza",
    profession: "Architect",
    category: "architect",
    location: "Kigali, Gasabo",
    rating: 4.9,
    reviews: 127,
    rate: 45000,
    experience: 12,
    projects: 89,
    verified: true,
    available: true,
    badge: "Top Rated",
    specialties: ["Residential Design", "3D Rendering", "Interior Layouts"],
    bio: "Senior architect specializing in modern Rwandan residential and mixed-use developments. RIBA certified with 12 years of local practice.",
    initials: "JN",
    color: "#059669",
  },
  {
    id: 2,
    name: "Marie Claire Uwimana",
    profession: "Structural Engineer",
    category: "engineer",
    location: "Kigali, Nyarugenge",
    rating: 4.8,
    reviews: 89,
    rate: 38000,
    experience: 9,
    projects: 64,
    verified: true,
    available: true,
    badge: "Verified",
    specialties: ["Structural Analysis", "Foundation Design", "BOQ"],
    bio: "Civil & structural engineer with expertise in reinforced concrete design and site supervision across Kigali and the Eastern Province.",
    initials: "MU",
    color: "#2563eb",
  },
  {
    id: 3,
    name: "Patrick Habimana",
    profession: "General Contractor",
    category: "contractor",
    location: "Kigali, Kicukiro",
    rating: 4.7,
    reviews: 203,
    rate: 55000,
    experience: 15,
    projects: 142,
    verified: true,
    available: false,
    badge: "Top Rated",
    specialties: ["Full Construction", "Project Management", "Site Supervision"],
    bio: "Experienced contractor managing full-cycle residential and commercial builds. Known for on-time delivery and transparent costing.",
    initials: "PH",
    color: "#d97706",
  },
  {
    id: 4,
    name: "Amina Mukamana",
    profession: "Interior Designer",
    category: "architect",
    location: "Kigali, Kimihurura",
    rating: 4.9,
    reviews: 156,
    rate: 42000,
    experience: 8,
    projects: 110,
    verified: true,
    available: true,
    badge: "Top Rated",
    specialties: ["Space Planning", "Material Selection", "3D Visualization"],
    bio: "Award-winning interior designer blending African aesthetics with modern minimalism for homes and commercial spaces across Kigali.",
    initials: "AM",
    color: "#7c3aed",
  },
  {
    id: 5,
    name: "Emmanuel Ndayishimiye",
    profession: "Civil Engineer",
    category: "engineer",
    location: "Musanze, Northern Province",
    rating: 4.6,
    reviews: 67,
    rate: 35000,
    experience: 7,
    projects: 51,
    verified: false,
    available: true,
    badge: null,
    specialties: ["Road Design", "Drainage Systems", "Land Surveying"],
    bio: "Civil engineer with hands-on experience in infrastructure and residential development projects in the Northern Province.",
    initials: "EN",
    color: "#0891b2",
  },
  {
    id: 6,
    name: "Claudine Uwase",
    profession: "Quantity Surveyor",
    category: "surveyor",
    location: "Kigali, Gasabo",
    rating: 4.8,
    reviews: 94,
    rate: 40000,
    experience: 10,
    projects: 78,
    verified: true,
    available: true,
    badge: "Verified",
    specialties: ["Cost Estimation", "BOQ Preparation", "Contract Management"],
    bio: "Chartered quantity surveyor delivering accurate cost plans and BOQs for projects ranging from small homes to large commercial complexes.",
    initials: "CU",
    color: "#059669",
  },
  {
    id: 7,
    name: "Robert Mugisha",
    profession: "General Contractor",
    category: "contractor",
    location: "Rubavu, Western Province",
    rating: 4.5,
    reviews: 78,
    rate: 48000,
    experience: 11,
    projects: 59,
    verified: false,
    available: true,
    badge: null,
    specialties: ["Masonry", "Roofing", "Finishing Works"],
    bio: "Reliable contractor based in Rubavu with a strong track record in residential construction and renovation projects across the Western Province.",
    initials: "RM",
    color: "#dc2626",
  },
  {
    id: 8,
    name: "Nadine Ingabire",
    profession: "Architect",
    category: "architect",
    location: "Kigali, Nyarutarama",
    rating: 4.7,
    reviews: 112,
    rate: 50000,
    experience: 10,
    projects: 76,
    verified: true,
    available: false,
    badge: "Verified",
    specialties: ["Contemporary Design", "Sustainable Architecture", "Permit Drawings"],
    bio: "Architect focused on eco-conscious design and building permit documentation. Specialises in luxury residential and boutique commercial projects.",
    initials: "NI",
    color: "#0d9488",
  },
  {
    id: 9,
    name: "Pierre Niyonzima",
    profession: "Electrical Engineer",
    category: "engineer",
    location: "Huye, Southern Province",
    rating: 4.6,
    reviews: 45,
    rate: 32000,
    experience: 6,
    projects: 38,
    verified: false,
    available: true,
    badge: null,
    specialties: ["Electrical Systems", "Solar Installation", "Power Planning"],
    bio: "Electrical engineer experienced in low-voltage systems, solar PV installations, and full MEP coordination for residential and institutional buildings.",
    initials: "PN",
    color: "#ca8a04",
  },
  {
    id: 10,
    name: "Judith Umurerwa",
    profession: "Landscape Architect",
    category: "architect",
    location: "Kigali, Gacuriro",
    rating: 4.8,
    reviews: 83,
    rate: 36000,
    experience: 7,
    projects: 62,
    verified: true,
    available: true,
    badge: "Verified",
    specialties: ["Garden Design", "Outdoor Spaces", "Site Masterplanning"],
    bio: "Landscape architect creating beautiful, functional outdoor environments for private homes, hotels, and public spaces across Rwanda.",
    initials: "JU",
    color: "#16a34a",
  },
  {
    id: 11,
    name: "Felix Nshimiyimana",
    profession: "MEP Engineer",
    category: "engineer",
    location: "Nyamata, Eastern Province",
    rating: 4.4,
    reviews: 34,
    rate: 30000,
    experience: 5,
    projects: 29,
    verified: false,
    available: true,
    badge: null,
    specialties: ["Plumbing Design", "HVAC", "MEP Coordination"],
    bio: "Mechanical and plumbing engineer with growing experience in residential MEP systems, sanitation, and water supply design.",
    initials: "FN",
    color: "#475569",
  },
  {
    id: 12,
    name: "Alice Kankindi",
    profession: "Urban Planner",
    category: "surveyor",
    location: "Kigali, Nyarugenge",
    rating: 4.9,
    reviews: 141,
    rate: 52000,
    experience: 14,
    projects: 97,
    verified: true,
    available: true,
    badge: "Top Rated",
    specialties: ["Master Planning", "Zoning Compliance", "Environmental Impact"],
    bio: "Senior urban planner with deep expertise in Rwandan land-use regulations, zoning approvals, and environmental impact assessments for large-scale developments.",
    initials: "AK",
    color: "#9333ea",
  },
];

const filterTabs = [
  { id: "all", label: "All Experts" },
  { id: "top-rated", label: "Top Rated" },
  { id: "most-reviewed", label: "Most Reviewed" },
  { id: "available", label: "Available Now" },
];

const professionOptions = ["All Professions", "Architect", "Civil Engineer", "Structural Engineer", "Electrical Engineer", "MEP Engineer", "General Contractor", "Quantity Surveyor", "Urban Planner", "Landscape Architect", "Interior Designer"];
const ratingOptions = ["Any Rating", "4.8 & above", "4.5 & above", "4.0 & above"];
const rateOptions = ["Any Rate", "Under RWF 35,000/hr", "RWF 35,000 – 50,000/hr", "Above RWF 50,000/hr"];
const locationOptions = ["All Locations", "Kigali", "Northern Province", "Southern Province", "Eastern Province", "Western Province"];
const sortOptions = ["Best Match", "Highest Rated", "Most Reviews", "Lowest Rate", "Most Experienced"];

export default function ExpertsPublic() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [profession, setProfession] = useState("All Professions");
  const [rating, setRating] = useState("Any Rating");
  const [rate, setRate] = useState("Any Rate");
  const [location, setLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("Best Match");

  const filtered = useMemo(() => {
    let list = [...experts];

    if (activeFilter === "top-rated") list = list.filter((e) => e.rating >= 4.7);
    if (activeFilter === "most-reviewed") list = list.sort((a, b) => b.reviews - a.reviews);
    if (activeFilter === "available") list = list.filter((e) => e.available);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.profession.toLowerCase().includes(q) ||
          e.specialties.some((s) => s.toLowerCase().includes(q)) ||
          e.location.toLowerCase().includes(q)
      );
    }

    if (profession !== "All Professions") list = list.filter((e) => e.profession === profession);

    if (rating === "4.8 & above") list = list.filter((e) => e.rating >= 4.8);
    else if (rating === "4.5 & above") list = list.filter((e) => e.rating >= 4.5);
    else if (rating === "4.0 & above") list = list.filter((e) => e.rating >= 4.0);

    if (rate === "Under RWF 35,000/hr") list = list.filter((e) => e.rate < 35000);
    else if (rate === "RWF 35,000 – 50,000/hr") list = list.filter((e) => e.rate >= 35000 && e.rate <= 50000);
    else if (rate === "Above RWF 50,000/hr") list = list.filter((e) => e.rate > 50000);

    if (location !== "All Locations") list = list.filter((e) => e.location.includes(location));

    if (sortBy === "Highest Rated") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortBy === "Most Reviews") list = [...list].sort((a, b) => b.reviews - a.reviews);
    else if (sortBy === "Lowest Rate") list = [...list].sort((a, b) => a.rate - b.rate);
    else if (sortBy === "Most Experienced") list = [...list].sort((a, b) => b.experience - a.experience);

    return list;
  }, [activeFilter, searchQuery, profession, rating, rate, location, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-teal-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Verified Construction Experts
          </h1>
          <p className="text-xl text-teal-50 max-w-3xl">
            Connect with Rwanda's top architects, engineers, contractors, and surveyors. Every profile is reviewed. Browse freely and book with confidence.
          </p>
          <div className="flex gap-6 mt-8">
            {[
              { value: "120+", label: "Verified Experts" },
              { value: "4.7★", label: "Average Rating" },
              { value: "2,400+", label: "Projects Completed" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-teal-100">{s.label}</div>
              </div>
            ))}
          </div>
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
                placeholder="Search by name, specialty, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-3 items-center">
            {[
              { value: profession, setter: setProfession, options: professionOptions },
              { value: rating, setter: setRating, options: ratingOptions },
              { value: rate, setter: setRate, options: rateOptions },
              { value: location, setter: setLocation, options: locationOptions },
              { value: sortBy, setter: setSortBy, options: sortOptions },
            ].map(({ value, setter, options }) => (
              <select
                key={options[0]}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ))}
            <button
              onClick={() => {
                setProfession("All Professions");
                setRating("Any Rating");
                setRate("Any Rate");
                setLocation("All Locations");
                setSortBy("Best Match");
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Clear All
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> expert{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No experts match your filters.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or clearing filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((expert) => (
                <div
                  key={expert.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  {/* Top strip color */}
                  <div className="h-2 w-full" style={{ backgroundColor: expert.color }} />

                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div
                        className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: expert.color }}
                      >
                        {expert.initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-base leading-tight">{expert.name}</h3>
                          {expert.verified && (
                            <BadgeCheck className="h-4 w-4 text-teal-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{expert.profession}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-400">{expert.location}</span>
                        </div>
                      </div>

                      {expert.badge && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                            expert.badge === "Top Rated"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-teal-50 text-teal-700"
                          }`}
                        >
                          {expert.badge}
                        </span>
                      )}
                    </div>

                    {/* Rating + stats */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(expert.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold text-gray-900 ml-1">{expert.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {expert.reviews} reviews
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{expert.bio}</p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {expert.specialties.map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          RWF {expert.rate.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">/hr</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className={`text-xs font-medium ${expert.available ? "text-emerald-600" : "text-gray-400"}`}>
                            {expert.available ? "Available" : "Busy"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{expert.experience}yr exp</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      className="mt-3 w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: expert.available ? expert.color : "#e5e7eb",
                        color: expert.available ? "#fff" : "#9ca3af",
                      }}
                    >
                      {expert.available ? "View Profile & Book" : "View Profile"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Are You a Construction Professional?</h2>
          <p className="text-lg text-teal-50 mb-8">
            Join CivilBridge's verified expert network. Get discovered by clients across Rwanda and grow your practice.
          </p>
          <button className="px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors">
            Apply to Join
          </button>
        </div>
      </section>
    </div>
  );
}
