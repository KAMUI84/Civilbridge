import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Star, MapPin, Search, SlidersHorizontal, Bed, Bath, Maximize2 } from "lucide-react";
import { useState, useMemo } from "react";

const filterTabs = [
  { id: "all", label: "All Listings" },
  { id: "new", label: "Newly Listed" },
  { id: "best-value", label: "Best Value" },
  { id: "prime", label: "Prime Locations" },
];

const properties = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Modern 4-Bedroom House",
    location: "Kigali, Gasabo",
    district: "Gasabo",
    price: 85000000,
    priceLabel: "RWF 85,000,000",
    category: "house",
    tag: "For Sale",
    bedrooms: 4,
    bathrooms: 3,
    area: "350 sqm",
    badge: "New",
    prime: false,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Luxury Villa with Pool",
    location: "Kigali, Nyarutarama",
    district: "Nyarugenge",
    price: 150000000,
    priceLabel: "RWF 150,000,000",
    category: "villa",
    tag: "For Sale",
    bedrooms: 6,
    bathrooms: 5,
    area: "600 sqm",
    badge: "Hot",
    prime: true,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Prime Land — 0.8 Acres",
    location: "Kigali, Gacuriro",
    district: "Gasabo",
    price: 45000000,
    priceLabel: "RWF 45,000,000",
    category: "land",
    tag: "Land",
    area: "0.8 acres",
    badge: "New",
    prime: true,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Commercial Complex — City Centre",
    location: "Kigali, Kimihurura",
    district: "Nyarugenge",
    price: 280000000,
    priceLabel: "RWF 280,000,000",
    category: "commercial",
    tag: "Commercial",
    area: "1,200 sqm",
    badge: "Hot",
    prime: true,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Cozy 3-Bedroom Home",
    location: "Kigali, Remera",
    district: "Gasabo",
    price: 52000000,
    priceLabel: "RWF 52,000,000",
    category: "house",
    tag: "For Sale",
    bedrooms: 3,
    bathrooms: 2,
    area: "220 sqm",
    badge: null,
    prime: false,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Executive 5-Bedroom Villa",
    location: "Kigali, Kacyiru",
    district: "Gasabo",
    price: 120000000,
    priceLabel: "RWF 120,000,000",
    category: "villa",
    tag: "For Sale",
    bedrooms: 5,
    bathrooms: 4,
    area: "480 sqm",
    badge: null,
    prime: true,
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "1 Acre Residential Plot",
    location: "Kigali, Rusororo",
    district: "Gasabo",
    price: 38000000,
    priceLabel: "RWF 38,000,000",
    category: "land",
    tag: "Land",
    area: "1 acre",
    badge: "New",
    prime: false,
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "2-Bedroom Apartment — Nyamirambo",
    location: "Kigali, Nyamirambo",
    district: "Nyarugenge",
    price: 32000000,
    priceLabel: "RWF 32,000,000",
    category: "apartment",
    tag: "For Sale",
    bedrooms: 2,
    bathrooms: 1,
    area: "95 sqm",
    badge: null,
    prime: false,
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Warehouse & Office Space",
    location: "Kigali, Kanombe",
    district: "Kicukiro",
    price: 95000000,
    priceLabel: "RWF 95,000,000",
    category: "commercial",
    tag: "Commercial",
    area: "800 sqm",
    badge: null,
    prime: false,
  },
];

export default function Marketplace() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Types");
  const [locationFilter, setLocationFilter] = useState("All Districts");
  const [priceFilter, setPriceFilter] = useState("Any Price");
  const [bedroomsFilter, setBedroomsFilter] = useState("Any Bedrooms");
  const [sortBy, setSortBy] = useState("Newest First");

  const filtered = useMemo(() => {
    let list = [...properties];

    if (activeFilter === "new") list = list.filter((p) => p.badge === "New");
    if (activeFilter === "best-value") list = [...list].sort((a, b) => a.price - b.price);
    if (activeFilter === "prime") list = list.filter((p) => p.prime);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "All Types") {
      const map = { Houses: "house", Villas: "villa", Apartments: "apartment", Land: "land", Commercial: "commercial" };
      list = list.filter((p) => p.category === map[categoryFilter]);
    }

    if (locationFilter !== "All Districts") list = list.filter((p) => p.district === locationFilter);

    if (priceFilter === "Under RWF 50M") list = list.filter((p) => p.price < 50000000);
    else if (priceFilter === "RWF 50M – 120M") list = list.filter((p) => p.price >= 50000000 && p.price <= 120000000);
    else if (priceFilter === "Above RWF 120M") list = list.filter((p) => p.price > 120000000);

    if (bedroomsFilter === "1–2 Bedrooms") list = list.filter((p) => p.bedrooms && p.bedrooms <= 2);
    else if (bedroomsFilter === "3–4 Bedrooms") list = list.filter((p) => p.bedrooms && p.bedrooms >= 3 && p.bedrooms <= 4);
    else if (bedroomsFilter === "5+ Bedrooms") list = list.filter((p) => p.bedrooms && p.bedrooms >= 5);

    if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [activeFilter, searchQuery, categoryFilter, locationFilter, priceFilter, bedroomsFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Property Marketplace</h1>
          <p className="text-xl text-blue-50 max-w-3xl">
            Browse verified properties and build-ready land across Rwanda. Filter by location, price, type, and more.
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
                placeholder="Search by location, type, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    ? "bg-blue-600 text-white"
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option>All Types</option>
              <option>Houses</option>
              <option>Villas</option>
              <option>Apartments</option>
              <option>Land</option>
              <option>Commercial</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option>All Districts</option>
              <option>Gasabo</option>
              <option>Nyarugenge</option>
              <option>Kicukiro</option>
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option>Any Price</option>
              <option>Under RWF 50M</option>
              <option>RWF 50M – 120M</option>
              <option>Above RWF 120M</option>
            </select>

            <select
              value={bedroomsFilter}
              onChange={(e) => setBedroomsFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option>Any Bedrooms</option>
              <option>1–2 Bedrooms</option>
              <option>3–4 Bedrooms</option>
              <option>5+ Bedrooms</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>

            <button
              onClick={() => {
                setCategoryFilter("All Types");
                setLocationFilter("All Districts");
                setPriceFilter("Any Price");
                setBedroomsFilter("Any Bedrooms");
                setSortBy("Newest First");
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Clear Filters
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> listing{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No listings match your filters.</p>
              <p className="text-gray-400 mt-2">Try adjusting or clearing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <ImageWithFallback
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {property.tag}
                    </div>
                    {property.badge && (
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        property.badge === "New" ? "bg-emerald-600 text-white" : "bg-orange-500 text-white"
                      }`}>
                        {property.badge}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{property.location}</span>
                    </div>

                    {(property.bedrooms || property.bathrooms || property.area) && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4 text-gray-400" />
                            {property.bedrooms} bed
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4 text-gray-400" />
                            {property.bathrooms} bath
                          </span>
                        )}
                        {property.area && (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="h-4 w-4 text-gray-400" />
                            {property.area}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-blue-600">{property.priceLabel}</p>
                      <button className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Load More Listings
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">List Your Property</h2>
          <p className="text-lg text-blue-50 mb-8">
            Reach thousands of buyers and investors across Rwanda. Listing is free during our launch period.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Submit a Listing
          </button>
        </div>
      </section>
    </div>
  );
}
