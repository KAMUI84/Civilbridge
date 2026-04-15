import { useState } from "react";
import { Star, MapPin, Search, Award, Briefcase, ChevronRight } from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PROPERTIES = [
  {
    id: 1,
    title: "Modern 4-Bedroom House",
    location: "Kigali Gasabo",
    price: 85000000,
    type: "For Sale",
    category: "Houses",
    beds: 4,
    baths: 3,
    area: "350 sqm",
    image:
      "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 2,
    title: "Luxury Villa with Pool",
    location: "Kigali Nyarutarama",
    price: 150000000,
    type: "For Sale",
    category: "Houses",
    beds: 6,
    baths: 5,
    area: "600 sqm",
    image:
      "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 3,
    title: "Prime Land - 0.8 Acres",
    location: "Kigali Gacuriro",
    price: 45000000,
    type: "Land",
    category: "Land",
    beds: null,
    baths: null,
    area: "0.8 acres",
    image:
      "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 4,
    title: "Commercial Complex",
    location: "Kigali Kimihurura",
    price: 280000000,
    type: "Commercial",
    category: "Commercial",
    beds: null,
    baths: null,
    area: "1200 sqm",
    image:
      "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 5,
    title: "Cozy 3-Bedroom Home",
    location: "Kigali Remera",
    price: 52000000,
    type: "For Sale",
    category: "Houses",
    beds: 3,
    baths: 2,
    area: "220 sqm",
    image:
      "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 6,
    title: "Executive 5-Bedroom Villa",
    location: "Kigali Kacyiru",
    price: 120000000,
    type: "For Sale",
    category: "Houses",
    beds: 5,
    baths: 4,
    area: "480 sqm",
    image:
      "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const EXPERTS = [
  {
    id: 1,
    name: "Marie Uwase",
    profession: "Structural Engineer",
    rating: 5.0,
    reviews: 47,
    projects: 92,
    specialization: "Residential & Commercial",
    category: "Engineers",
    image:
      "https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 2,
    name: "Jean Bosco Mugabo",
    profession: "Architect",
    rating: 4.9,
    reviews: 63,
    projects: 118,
    specialization: "Modern Architecture",
    category: "Architects",
    image:
      "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 3,
    name: "Aisha Kamara",
    profession: "Civil Engineer",
    rating: 5.0,
    reviews: 55,
    projects: 85,
    specialization: "Infrastructure & Roads",
    category: "Engineers",
    image:
      "https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 4,
    name: "Patrick Niyonzima",
    profession: "Contractor",
    rating: 4.8,
    reviews: 71,
    projects: 134,
    specialization: "Residential Construction",
    category: "Contractors",
    image:
      "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 5,
    name: "Grace Mukamana",
    profession: "Interior Designer",
    rating: 4.9,
    reviews: 42,
    projects: 68,
    specialization: "Modern Interiors",
    category: "Architects",
    image:
      "https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 6,
    name: "Emmanuel Habimana",
    profession: "Quantity Surveyor",
    rating: 5.0,
    reviews: 38,
    projects: 76,
    specialization: "Cost Estimation",
    category: "Surveyors",
    image:
      "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const PROPERTY_CATEGORIES = [
  "All Properties",
  "Houses",
  "Land",
  "Commercial",
  "Apartments",
];

const EXPERT_CATEGORIES = [
  "All Experts",
  "Engineers",
  "Architects",
  "Contractors",
  "Surveyors",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price) {
  return "RWF " + price.toLocaleString("en-RW");
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    } else if (i === full && hasHalf) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-200 text-yellow-400" />
      );
    } else {
      stars.push(
        <Star key={i} className="h-4 w-4 text-gray-300" />
      );
    }
  }
  return stars;
}

// ─── Property Card ────────────────────────────────────────────────────────────

function PropertyCard({ property }) {
  const { title, location, price, type, category, beds, baths, area, image } =
    property;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Type badge — top left */}
        <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm">
          {type}
        </span>
        {/* Category badge — top right */}
        <span className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold bg-blue-600 text-white shadow-sm">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
          {title}
        </h3>

        {/* Location row */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-500">{location}</span>
        </div>

        {/* Details row */}
        {beds !== null ? (
          <p className="text-sm text-gray-500 mb-4">
            {beds} Beds&nbsp;&middot;&nbsp;{baths} Baths&nbsp;&middot;&nbsp;{area}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">Area: {area}</p>
        )}

        {/* Price + CTA */}
        <div className="flex items-end justify-between">
          <p className="text-2xl font-black text-blue-600">
            {formatPrice(price)}
          </p>
          <button className="flex items-center gap-0.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            View Details
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Expert Card ──────────────────────────────────────────────────────────────

function ExpertCard({ expert }) {
  const { name, profession, rating, reviews, projects, specialization, image } =
    expert;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Photo + Name row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Circular photo with verified badge */}
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="h-[72px] w-[72px] rounded-full object-cover ring-2 ring-gray-100"
            onError={(e) => {
              e.target.src =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(name) +
                "&background=3b82f6&color=fff&size=72";
            }}
          />
          <span className="absolute -bottom-1 -right-1 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
            <Award className="h-3.5 w-3.5 text-white" />
          </span>
        </div>

        {/* Name + profession */}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
            {name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{profession}</p>
        </div>
      </div>

      {/* Stars + rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
        <span className="text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400">({reviews} reviews)</span>
      </div>

      {/* Specialization */}
      <p className="text-sm text-gray-600 mb-3">{specialization}</p>

      {/* Projects count */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span>{projects} completed projects</span>
      </div>

      {/* CTA button */}
      <button className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
        View Profile
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyCategory, setPropertyCategory] = useState("All Properties");
  const [expertCategory, setExpertCategory] = useState("All Experts");
  const [visibleProperties, setVisibleProperties] = useState(6);
  const [visibleExperts, setVisibleExperts] = useState(6);

  // Filtered lists
  const filteredProperties = PROPERTIES.filter((p) => {
    const matchesCategory =
      propertyCategory === "All Properties" || p.category === propertyCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const filteredExperts = EXPERTS.filter((e) => {
    const matchesCategory =
      expertCategory === "All Experts" || e.category === expertCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      e.name.toLowerCase().includes(q) ||
      e.profession.toLowerCase().includes(q) ||
      e.specialization.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const displayedProperties = filteredProperties.slice(0, visibleProperties);
  const displayedExperts = filteredExperts.slice(0, visibleExperts);
  const hasMoreProperties = visibleProperties < filteredProperties.length;
  const hasMoreExperts = visibleExperts < filteredExperts.length;

  function handleTabSwitch(tab) {
    setActiveTab(tab);
    setSearchQuery("");
    setPropertyCategory("All Properties");
    setExpertCategory("All Experts");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-700 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            Marketplace
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Discover premium properties and connect with Rwanda's top
            construction experts — all in one place.
          </p>

          {/* Stat pills */}
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5">
              <span className="text-2xl font-black text-white">
                {PROPERTIES.length}
              </span>
              <span className="text-blue-100 text-sm font-medium">
                Properties Listed
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5">
              <span className="text-2xl font-black text-white">
                {EXPERTS.length}
              </span>
              <span className="text-blue-100 text-sm font-medium">
                Verified Experts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky Filter Bar ────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Row 1: Tabs + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            {/* Pill tabs */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleTabSwitch("properties")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === "properties"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Properties &amp; Land
              </button>
              <button
                onClick={() => handleTabSwitch("experts")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === "experts"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Expert Directory
              </button>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:max-w-sm ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "properties"
                    ? "Search properties..."
                    : "Search experts..."
                }
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Row 2: Category chips */}
          <div className="flex flex-wrap gap-2">
            {activeTab === "properties"
              ? PROPERTY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPropertyCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      propertyCategory === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))
              : EXPERT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setExpertCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      expertCategory === cat
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "properties" ? (
          <>
            {/* Results count */}
            <p className="text-sm text-gray-500 mb-6">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredProperties.length}
              </span>{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}
              {propertyCategory !== "All Properties" && (
                <>
                  {" "}in{" "}
                  <span className="font-semibold text-gray-700">
                    {propertyCategory}
                  </span>
                </>
              )}
            </p>

            {/* Properties grid */}
            {displayedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-gray-400 text-lg font-medium">
                  No properties found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setPropertyCategory("All Properties");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Load More */}
            {hasMoreProperties && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleProperties((prev) => prev + 3)}
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
                >
                  Load More Properties
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-gray-500 mb-6">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredExperts.length}
              </span>{" "}
              {filteredExperts.length === 1 ? "expert" : "experts"}
              {expertCategory !== "All Experts" && (
                <>
                  {" "}in{" "}
                  <span className="font-semibold text-gray-700">
                    {expertCategory}
                  </span>
                </>
              )}
            </p>

            {/* Experts grid */}
            {displayedExperts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedExperts.map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-gray-400 text-lg font-medium">
                  No experts found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setExpertCategory("All Experts");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Load More */}
            {hasMoreExperts && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleExperts((prev) => prev + 3)}
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
                >
                  Load More Experts
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── CTA Section ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {activeTab === "properties"
              ? "Ready to List Your Property?"
              : "Are You a Construction Professional?"}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            {activeTab === "properties"
              ? "Reach thousands of serious buyers and investors across Rwanda. List your property today and let CivilBridge do the rest."
              : "Join Rwanda's fastest-growing construction network. Showcase your expertise, connect with clients, and grow your business."}
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold text-base rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            {activeTab === "properties"
              ? "List Your Property"
              : "Join as an Expert"}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
