import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { 
  ArrowRight, 
  Building2, 
  Calculator, 
  CheckCircle, 
  FileText, 
  Layers, 
  MapPin, 
  Shield, 
  Sparkles, 
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Build Your Dream Home",
      subtitle: "With confidence and clarity"
    },
    {
      image: "https://images.unsplash.com/photo-1708772565599-2c4e4b3ed9db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyd2FuZGElMjBjaXR5c2NhcGUlMjBraWdhbGl8ZW58MXx8fHwxNzc2MTkzOTg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Connecting Communities",
      subtitle: "From Kigali to the diaspora"
    },
    {
      image: "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwd29ya2Vyc3xlbnwxfHx8fDE3NzYxNTU2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Expert-Verified Results",
      subtitle: "Professional guidance every step"
    },
    {
      image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Premium Properties",
      subtitle: "Discover your perfect space"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const properties = [
    {
      image: "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Modern Residential Complex"
    },
    {
      image: "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Luxury Family Home"
    },
    {
      image: "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Estate Development"
    },
    {
      image: "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Prime Land Plots"
    },
    {
      image: "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "New Construction"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Build Smarter.<br />
              Build Better.<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Build in Rwanda.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              CivilBridge is the construction intelligence platform that helps you plan, estimate, and execute building projects with confidence. From idea to completion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/estimator"
                className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                to="/marketplace"
                className="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>

          {/* Hero Slider */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <ImageWithFallback
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-3xl font-bold text-white mb-2">{slide.title}</h3>
                  <p className="text-lg text-white/90">{slide.subtitle}</p>
                </div>
              </div>
            ))}
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? "bg-white w-8" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How CivilBridge Helps You</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We transform construction uncertainty into clear, actionable insights through intelligent tools and expert validation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accurate Cost Estimation</h3>
              <p className="text-gray-600">
                Get realistic construction cost estimates based on Rwanda-specific pricing, materials, and labor rates. Make financially safe decisions from day one.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Verification</h3>
              <p className="text-gray-600">
                Every plan and estimate can be reviewed by verified engineers and architects. AI accelerates, professionals validate.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Full Project Journey</h3>
              <p className="text-gray-600">
                From initial budget analysis to completed construction, track every phase with transparency and professional oversight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Estimator Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Smart Cost Estimation</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered estimator analyzes your project requirements and generates detailed cost breakdowns including materials, labor, and timelines.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Upload or Describe</h4>
                    <p className="text-gray-600">Upload existing plans or describe your vision conversationally.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                    <p className="text-gray-600">Intelligent processing generates Bill of Quantities and cost estimates.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Review</h4>
                    <p className="text-gray-600">Get expert validation and approval before execution.</p>
                  </div>
                </div>
              </div>

              <Link 
                to="/estimator"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try the Estimator
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1774600166818-e554a4d4c376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3QlMjBlbmdpbmVlciUyMGJsdWVwcmludHxlbnwxfHx8fDE3NzYxOTM5ODl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Cost estimation"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Properties & Connect with Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse verified properties, land plots, and connect with trusted engineers, architects, and contractors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl">
              <MapPin className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Property Marketplace</h3>
              <p className="mb-6">
                Explore houses, commercial properties, and land plots across Rwanda. Filter by location, price, and type.
              </p>
              <Link 
                to="/marketplace"
                className="inline-flex items-center gap-2 text-white hover:text-emerald-100 transition-colors"
              >
                Browse Properties
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl">
              <Users className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Expert Directory</h3>
              <p className="mb-6">
                Find and connect with verified construction professionals. Read reviews and book consultations.
              </p>
              <Link 
                to="/marketplace"
                className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
              >
                Find Experts
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Construction plans"
                className="rounded-2xl shadow-2xl"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready-Made & Custom Plans</h2>
              <p className="text-lg text-gray-600 mb-8">
                Browse our library of professionally designed building plans or generate custom designs using AI based on your budget, land, and preferences.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Pre-designed plans for common building types</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">AI-generated custom designs based on your requirements</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Professional review and approval workflow</p>
                </div>
              </div>

              <Link 
                to="/plans"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                View Plans
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Intelligence Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                AI-Powered Construction Intelligence
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI Studio helps you make smarter decisions with conversational planning, feasibility analysis, and intelligent recommendations tailored to the Rwandan market.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-8 w-8 text-emerald-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Document Generation</h4>
                  <p className="text-sm text-gray-600">Auto-generate project packages</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Layers className="h-8 w-8 text-emerald-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Feasibility Analysis</h4>
                  <p className="text-sm text-gray-600">Budget vs. requirements check</p>
                </div>
              </div>

              <Link 
                to="/ai-studio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Open AI Studio
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYXJjaGl0ZWN0JTIwd29tYW58ZW58MXx8fHwxNzc2MTkzOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="AI Intelligence"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Quality Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built on Trust & Quality</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              CivilBridge is designed specifically for Rwanda with local expertise, verified professionals, and realistic cost intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">500+</div>
              <p className="text-gray-300">Verified Professionals</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">1,200+</div>
              <p className="text-gray-300">Projects Estimated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">95%</div>
              <p className="text-gray-300">Cost Accuracy Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">24/7</div>
              <p className="text-gray-300">Platform Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Property Carousel */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Featured Properties & Developments
          </h2>
          <p className="text-xl text-gray-600 text-center">
            Explore a selection of quality properties across Rwanda
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-6 animate-scroll">
            {[...properties, ...properties].map((property, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-80 h-64 rounded-xl overflow-hidden shadow-lg relative group"
              >
                <ImageWithFallback
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <h3 className="text-xl font-semibold text-white">{property.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Construction Journey?
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            Join thousands of Rwandans building smarter with CivilBridge. Get your free cost estimate today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/estimator"
              className="px-8 py-4 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Get Free Estimate
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/dashboard/client"
              className="px-8 py-4 bg-emerald-700 text-white border-2 border-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}