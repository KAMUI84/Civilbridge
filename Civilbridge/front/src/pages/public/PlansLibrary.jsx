import { useState } from "react";
import { Search, Star, SlidersHorizontal, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const plans = [
  { id: 1, image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "3-Bedroom Modern Suburban Home", rating: 5, price: "RWF 45,000,000", badge: "New", type: "residential", location: "Kigali" },
  { id: 2, image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Luxury 5-Bedroom Villa", rating: 5, price: "RWF 95,000,000", badge: "Hot", type: "residential", location: "Nyarutarama" },
  { id: 3, image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "0.5 Acre Residential Plot", rating: 4, price: "RWF 28,000,000", badge: "New", type: "land", location: "Gasabo" },
  { id: 4, image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "2-Bedroom Apartment Plan", rating: 5, price: "RWF 32,000,000", type: "residential", location: "Remera" },
  { id: 5, image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Estate Development Package", rating: 5, price: "RWF 150,000,000", badge: "Hot", type: "commercial", location: "Kicukiro" },
  { id: 6, image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "4-Bedroom Family House", rating: 4, price: "RWF 58,000,000", type: "residential", location: "Kimihurura" },
  { id: 7, image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Contemporary 3-Bedroom Villa", rating: 5, price: "RWF 62,000,000", badge: "New", type: "residential", location: "Gacuriro" },
  { id: 8, image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "1 Acre Prime Land", rating: 4, price: "RWF 55,000,000", type: "land", location: "Rusororo" },
  { id: 9, image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Compact 2-Bedroom Starter Home", rating: 5, price: "RWF 38,000,000", type: "residential", location: "Nyamirambo" },
  { id: 10, image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", title: "Commercial Building Plan", rating: 5, price: "RWF 180,000,000", badge: "Hot", type: "commercial", location: "City Center" },
];

const filterTabs = ["All Plans", "Newly Listed", "Best Value", "Prime Locations"];

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5 mb-2">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function PlansLibrary() {
  const [activeFilter, setActiveFilter] = useState("All Plans");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black text-white mb-4 leading-tight">
              Building Plans &amp; Properties
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-2xl">
              Explore Rwanda's most comprehensive library of certified building plans, residential plots, and commercial properties — all ready for your next project.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
          {/* Row 1: Search */}
          <div className="relative max-w-2xl w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search plans, properties, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Row 2: Filter Tab Pills */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  activeFilter === tab
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Row 3: Dropdowns + More Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer">
              <option value="">Property Type</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
            <select className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer">
              <option value="">Location</option>
              <option value="kigali">Kigali</option>
              <option value="gasabo">Gasabo</option>
              <option value="nyarutarama">Nyarutarama</option>
              <option value="remera">Remera</option>
              <option value="kicukiro">Kicukiro</option>
            </select>
            <select className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer">
              <option value="">Price Range</option>
              <option value="0-50m">Under RWF 50M</option>
              <option value="50-100m">RWF 50M – 100M</option>
              <option value="100-200m">RWF 100M – 200M</option>
              <option value="200m+">Above RWF 200M</option>
            </select>
            <select className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer">
              <option value="">Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4 Bedrooms</option>
              <option value="5+">5+ Bedrooms</option>
            </select>
            <button className="flex items-center gap-2 text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 bg-white hover:bg-gray-50 hover:border-emerald-300 hover:text-emerald-600 transition-all font-medium">
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {plan.badge && (
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                        plan.badge === "New"
                          ? "bg-emerald-600 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] leading-snug">
                    {plan.title}
                  </h3>
                  <StarRating rating={plan.rating} />
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span>{plan.location}</span>
                  </div>
                  <p className="text-base font-bold text-emerald-600">{plan.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-10">
            <button className="border-2 border-gray-200 hover:border-emerald-300 px-8 py-3 rounded-xl text-gray-600 hover:text-emerald-600 font-semibold transition-all duration-200 bg-white">
              Load More Plans
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't See What You're Looking For?
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Our team of certified architects and engineers can design a custom plan tailored to your exact requirements and budget.
          </p>
          <Link to="/estimator">
            <button className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg">
              Request a Custom Plan
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
