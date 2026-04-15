import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Star, SlidersHorizontal, Search } from "lucide-react";
import { useState } from "react";

export function Plans() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filterTabs = [
    { id: "all", label: "All Plans" },
    { id: "newly-listed", label: "Newly Listed" },
    { id: "best-value", label: "Best Value" },
    { id: "prime-locations", label: "Prime Locations" },
  ];

  const plans = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "3-Bedroom Modern Suburban Home",
      rating: 5,
      price: "RWF 45,000,000",
      badge: "New",
      type: "residential",
      location: "Kigali"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Luxury 5-Bedroom Villa",
      rating: 5,
      price: "RWF 95,000,000",
      badge: "Hot",
      type: "residential",
      location: "Nyarutarama"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "0.5 Acre Residential Plot",
      rating: 4,
      price: "RWF 28,000,000",
      badge: "New",
      type: "land",
      location: "Gasabo"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "2-Bedroom Apartment Plan",
      rating: 5,
      price: "RWF 32,000,000",
      type: "residential",
      location: "Remera"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Estate Development Package",
      rating: 5,
      price: "RWF 150,000,000",
      badge: "Hot",
      type: "commercial",
      location: "Kicukiro"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "4-Bedroom Family House",
      rating: 4,
      price: "RWF 58,000,000",
      type: "residential",
      location: "Kimihurura"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Contemporary 3-Bedroom Villa",
      rating: 5,
      price: "RWF 62,000,000",
      badge: "New",
      type: "residential",
      location: "Gacuriro"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "1 Acre Prime Land",
      rating: 4,
      price: "RWF 55,000,000",
      type: "land",
      location: "Rusororo"
    },
    {
      id: 9,
      image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Compact 2-Bedroom Starter Home",
      rating: 5,
      price: "RWF 38,000,000",
      type: "residential",
      location: "Nyamirambo"
    },
    {
      id: 10,
      image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Commercial Building Plan",
      rating: 5,
      price: "RWF 180,000,000",
      badge: "Hot",
      type: "commercial",
      location: "City Center"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Building Plans & Properties
          </h1>
          <p className="text-xl text-emerald-50 max-w-3xl">
            Browse professionally designed plans and properties across Rwanda. Find your perfect match or generate a custom plan.
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, type, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeFilter === tab.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option>Property Type</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Land</option>
            </select>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option>Location</option>
              <option>Kigali</option>
              <option>Gasabo</option>
              <option>Kicukiro</option>
              <option>Nyarugenge</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option>Price Range</option>
              <option>Under RWF 30M</option>
              <option>RWF 30M - 60M</option>
              <option>RWF 60M - 100M</option>
              <option>Above RWF 100M</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option>Bedrooms</option>
              <option>1-2 Bedrooms</option>
              <option>3-4 Bedrooms</option>
              <option>5+ Bedrooms</option>
            </select>

            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {plan.badge && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.badge === "New" 
                        ? "bg-emerald-600 text-white" 
                        : "bg-orange-500 text-white"
                    }`}>
                      {plan.badge}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {plan.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < plan.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Location */}
                  <p className="text-sm text-gray-500 mb-3">{plan.location}</p>

                  {/* Price */}
                  <p className="text-lg font-bold text-emerald-600">
                    {plan.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Load More Plans
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't See What You're Looking For?
          </h2>
          <p className="text-lg text-teal-50 mb-8">
            Generate a custom plan using our AI-powered design tool, tailored to your budget and requirements.
          </p>
          <button className="px-8 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
            Create Custom Plan
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
