import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Star, MapPin, Search, Award, Briefcase, User } from "lucide-react";
import { useState } from "react";

export function Marketplace() {
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  const properties = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Modern 4-Bedroom House",
      location: "Kigali, Gasabo",
      price: "RWF 85,000,000",
      type: "For Sale",
      bedrooms: 4,
      bathrooms: 3,
      area: "350 sqm"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Luxury Villa with Pool",
      location: "Kigali, Nyarutarama",
      price: "RWF 150,000,000",
      type: "For Sale",
      bedrooms: 6,
      bathrooms: 5,
      area: "600 sqm"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Prime Land - 0.8 Acres",
      location: "Kigali, Gacuriro",
      price: "RWF 45,000,000",
      type: "Land",
      area: "0.8 acres"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Commercial Complex",
      location: "Kigali, Kimihurura",
      price: "RWF 280,000,000",
      type: "Commercial",
      area: "1200 sqm"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Cozy 3-Bedroom Home",
      location: "Kigali, Remera",
      price: "RWF 52,000,000",
      type: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      area: "220 sqm"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Executive 5-Bedroom Villa",
      location: "Kigali, Kacyiru",
      price: "RWF 120,000,000",
      type: "For Sale",
      bedrooms: 5,
      bathrooms: 4,
      area: "480 sqm"
    }
  ];

  const experts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYXJjaGl0ZWN0JTIwd29tYW58ZW58MXx8fHwxNzc2MTkzOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Marie Uwase",
      profession: "Structural Engineer",
      rating: 5.0,
      reviews: 47,
      projects: 92,
      verified: true,
      specialization: "Residential & Commercial"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwd29ya2Vyc3xlbnwxfHx8fDE3NzYxNTU2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Jean Bosco Mugabo",
      profession: "Architect",
      rating: 4.9,
      reviews: 63,
      projects: 118,
      verified: true,
      specialization: "Modern Architecture"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYXJjaGl0ZWN0JTIwd29tYW58ZW58MXx8fHwxNzc2MTkzOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Aisha Kamara",
      profession: "Civil Engineer",
      rating: 5.0,
      reviews: 55,
      projects: 85,
      verified: true,
      specialization: "Infrastructure & Roads"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwd29ya2Vyc3xlbnwxfHx8fDE3NzYxNTU2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Patrick Niyonzima",
      profession: "Contractor",
      rating: 4.8,
      reviews: 71,
      projects: 134,
      verified: true,
      specialization: "Residential Construction"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYXJjaGl0ZWN0JTIwd29tYW58ZW58MXx8fHwxNzc2MTkzOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Grace Mukamana",
      profession: "Interior Designer",
      rating: 4.9,
      reviews: 42,
      projects: 68,
      verified: true,
      specialization: "Modern Interiors"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwd29ya2Vyc3xlbnwxfHx8fDE3NzYxNTU2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Emmanuel Habimana",
      profession: "Quantity Surveyor",
      rating: 5.0,
      reviews: 38,
      projects: 76,
      verified: true,
      specialization: "Cost Estimation"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Marketplace
          </h1>
          <p className="text-xl text-blue-50 max-w-3xl">
            Discover properties, land, and connect with verified construction professionals across Rwanda.
          </p>
        </div>
      </section>

      {/* Tabs & Search */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "properties"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Properties & Land
            </button>
            <button
              onClick={() => setActiveTab("experts")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "experts"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Expert Directory
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === "properties"
                  ? "Search properties by location, type, or price..."
                  : "Search experts by name, profession, or specialization..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          {activeTab === "properties" && (
            <div className="flex flex-wrap gap-3 mt-6">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                All Properties
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Houses
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Land
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Commercial
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Apartments
              </button>
            </div>
          )}

          {activeTab === "experts" && (
            <div className="flex flex-wrap gap-3 mt-6">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                All Experts
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Engineers
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Architects
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Contractors
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Surveyors
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "properties" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                      {property.type}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    {property.bedrooms && (
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <span>{property.bedrooms} Beds</span>
                        <span>•</span>
                        <span>{property.bathrooms} Baths</span>
                        <span>•</span>
                        <span>{property.area}</span>
                      </div>
                    )}

                    {!property.bedrooms && (
                      <div className="text-sm text-gray-600 mb-4">
                        {property.area}
                      </div>
                    )}

                    <p className="text-2xl font-bold text-blue-600">
                      {property.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "experts" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <ImageWithFallback
                          src={expert.image}
                          alt={expert.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {expert.verified && (
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {expert.name}
                      </h3>
                      <p className="text-sm text-gray-600">{expert.profession}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {expert.rating}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({expert.reviews} reviews)
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {expert.specialization}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Briefcase className="h-4 w-4" />
                    <span>{expert.projects} completed projects</span>
                  </div>

                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Load More
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {activeTab === "properties" 
              ? "Ready to List Your Property?"
              : "Are You a Construction Professional?"}
          </h2>
          <p className="text-lg text-blue-50 mb-8">
            {activeTab === "properties"
              ? "Reach thousands of potential buyers and investors on CivilBridge."
              : "Join our network of verified experts and grow your business."}
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            {activeTab === "properties" ? "List Property" : "Join as Expert"}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
