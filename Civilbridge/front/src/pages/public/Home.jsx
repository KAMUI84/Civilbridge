import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle,
  ChevronRight,
  FileText,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    tag: "Residential",
    title: "Build Your Dream Home",
    subtitle: "With confidence and clarity",
  },
  {
    image:
      "https://images.unsplash.com/photo-1708772565599-2c4e4b3ed9db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    tag: "Community",
    title: "Connecting Communities",
    subtitle: "From Kigali to the diaspora",
  },
  {
    image:
      "https://images.unsplash.com/photo-1636790921342-cbdc4b783de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    tag: "Expert Work",
    title: "Expert-Verified Results",
    subtitle: "Professional guidance every step",
  },
  {
    image:
      "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    tag: "Luxury",
    title: "Premium Properties",
    subtitle: "Discover your perfect space",
  },
];

const properties = [
  {
    image:
      "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXNpZGVudGlhbCUyMGJ1aWxkaW5nfGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Modern Residential Complex",
  },
  {
    image:
      "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhZnJpY2FuJTIwaG9tZXxlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Luxury Family Home",
  },
  {
    image:
      "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NzYxOTM5OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Estate Development",
  },
  {
    image:
      "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kJTIwcGxvdCUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NjE5Mzk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Prime Land Plots",
  },
  {
    image:
      "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwaG91c2UlMjBjb25zdHJ1Y3Rpb258ZW58MXx8fHwxNzc2MTkzOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "New Construction",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ─── SECTION 1 — Hero ─────────────────────────────────────────── */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <div>
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Rwanda&apos;s #1 Construction Platform
              </div>

              {/* H1 */}
              <h1 className="text-6xl lg:text-7xl font-black tracking-tight leading-tight text-gray-900 mb-6">
                Build Smarter.<br />
                Build Better.<br />
                <span className="text-emerald-600">Build in Rwanda.</span>
              </h1>

              <p className="text-lg text-gray-500 mb-10 max-w-xl leading-relaxed">
                CivilBridge is the construction intelligence platform that helps you plan, estimate, and execute building projects with confidence — from idea to completion.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/estimator"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
                >
                  Get Free Estimate
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200"
                >
                  Explore Marketplace
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-500">Verified Experts</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">1,200+</p>
                  <p className="text-sm text-gray-500">Projects</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                  <p className="text-sm text-gray-500">Accuracy</p>
                </div>
              </div>
            </div>

            {/* Right — Image Carousel */}
            <div className="relative">
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
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
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Tag chip */}
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
                        {slide.tag}
                      </span>
                    </div>

                    {/* Slide content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h3 className="text-3xl font-bold text-white mb-2">{slide.title}</h3>
                      <p className="text-white/80 text-base">{slide.subtitle}</p>

                      {/* Slide indicators */}
                      <div className="flex gap-2 mt-6 justify-end">
                        {heroSlides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === currentSlide ? "bg-white w-8" : "bg-white/40 w-4"
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 min-w-[220px] ring-1 ring-black/5">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Estimated Cost</p>
                  <p className="text-sm font-bold text-gray-900">RWF 58.5M — 4BR House</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2 — How CivilBridge Helps You ───────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered header */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              Core Features
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
              How CivilBridge Helps You
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              We transform construction uncertainty into clear, actionable insights through intelligent tools and expert validation.
            </p>
          </div>

          {/* 3-column card grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accurate Cost Estimation</h3>
              <p className="text-gray-500 leading-relaxed">
                Get realistic construction cost estimates based on Rwanda-specific pricing, materials, and labor rates. Make financially safe decisions from day one.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-teal-50 to-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 bg-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Verification</h3>
              <p className="text-gray-500 leading-relaxed">
                Every plan and estimate can be reviewed by verified engineers and architects. AI accelerates, professionals validate — so you can build with certainty.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Full Project Journey</h3>
              <p className="text-gray-500 leading-relaxed">
                From initial budget analysis to completed construction, track every phase with full transparency and professional oversight every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — Smart Cost Estimation ──────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                Cost Estimator
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
                Smart Cost Estimation
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Our AI-powered estimator analyzes your project requirements and generates detailed cost breakdowns — including materials, labor, and timelines — specific to the Rwandan market.
              </p>

              <div className="space-y-7 mb-10">
                <div className="flex gap-5">
                  <div className="flex-shrink-0 h-11 w-11 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Upload or Describe</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Upload existing plans or describe your vision conversationally. We handle both.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 h-11 w-11 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI Analysis</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Intelligent processing generates a full Bill of Quantities and itemised cost estimates instantly.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 h-11 w-11 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Professional Review</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Get expert validation and approval from verified engineers before you break ground.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/estimator"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-100"
              >
                Try the Estimator
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Right — Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1774600166818-e554a4d4c376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Cost estimation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 — Marketplace Preview ────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
              Marketplace
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
              Discover Properties & Connect with Experts
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Browse verified properties, land plots, and connect with trusted engineers, architects, and contractors across Rwanda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Property Marketplace card */}
            <div className="group rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-500 text-white p-10">
                <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Property Marketplace</h3>
                <p className="text-emerald-100 leading-relaxed mb-8">
                  Explore houses, commercial properties, and land plots across Rwanda. Filter by location, price, and type to find your perfect match.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all duration-200"
                >
                  Browse Properties
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Expert Directory card */}
            <div className="group rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-10">
                <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Expert Directory</h3>
                <p className="text-blue-100 leading-relaxed mb-8">
                  Find and connect with verified construction professionals. Read reviews, compare rates, and book consultations with confidence.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all duration-200"
                >
                  Find Experts
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5 — Plans Library Preview ──────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Construction plans"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right */}
            <div>
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                Plans Library
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
                Ready-Made &amp; Custom Plans
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Browse our library of professionally designed building plans or generate custom designs using AI based on your budget, land, and preferences.
              </p>

              <div className="space-y-5 mb-10">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">Pre-designed plans for common Rwandan building types</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">AI-generated custom designs based on your requirements</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">Professional review and approval workflow included</p>
                </div>
              </div>

              <Link
                to="/plans"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-100"
              >
                View All Plans
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6 — AI Intelligence ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                AI Studio
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight leading-tight">
                AI-Powered Construction Intelligence
              </h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                Our AI Studio helps you make smarter decisions with conversational planning, feasibility analysis, and intelligent recommendations tailored to the Rwandan market.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:shadow-md transition-all duration-200">
                  <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">Document Generation</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Auto-generate full project packages</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:shadow-md transition-all duration-200">
                  <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">Feasibility Analysis</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Budget vs. requirements check</p>
                </div>
              </div>

              <Link
                to="/intelligence"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-100"
              >
                Open AI Studio
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Right — Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1671917057275-c5014a6addcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="AI Intelligence"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7 — Trust Stats ──────────────────────────────────── */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
              Built on Trust &amp; Quality
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              CivilBridge is designed specifically for Rwanda with local expertise, verified professionals, and realistic cost intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-5xl font-black text-emerald-400 mb-3">500+</p>
              <p className="text-gray-400 text-sm font-medium">Verified Professionals</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-emerald-400 mb-3">1,200+</p>
              <p className="text-gray-400 text-sm font-medium">Projects Estimated</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-emerald-400 mb-3">95%</p>
              <p className="text-gray-400 text-sm font-medium">Cost Accuracy Rate</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-emerald-400 mb-3">24/7</p>
              <p className="text-gray-400 text-sm font-medium">Platform Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8 — Featured Properties Carousel ────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            Portfolio
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Featured Properties &amp; Developments
          </h2>
          <p className="text-lg text-gray-500">
            Explore a selection of quality properties and developments across Rwanda
          </p>
        </div>

        {/* Infinite scroll strip */}
        <div className="flex gap-6 animate-scroll" style={{ width: "max-content" }}>
          {[...properties, ...properties].map((property, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 h-72 rounded-2xl overflow-hidden shadow-md relative group"
            >
              <ImageWithFallback
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                <h3 className="text-lg font-semibold text-white leading-tight">{property.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 9 — CTA Band ────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Start Your Construction Journey?
          </h2>
          <p className="text-xl text-emerald-50 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of Rwandans building smarter with CivilBridge. Get your free cost estimate today and move from idea to completion with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/estimator"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg"
            >
              Get Free Estimate
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-800 transition-all duration-200"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
