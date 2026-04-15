import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { 
  Calculator, 
  Upload, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Download,
  Sparkles
} from "lucide-react";
import { useState } from "react";

export function Estimator() {
  const [activeMethod, setActiveMethod] = useState<"upload" | "describe" | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleEstimate = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Smart Construction Cost Estimator
            </h1>
            <p className="text-xl text-emerald-50">
              Get accurate, Rwanda-specific cost estimates powered by AI and verified by expert engineers.
            </p>
          </div>
        </div>
      </section>

      {!showResults ? (
        <>
          {/* Method Selection */}
          <section className="py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How would you like to get started?
                </h2>
                <p className="text-lg text-gray-600">
                  Choose the method that works best for you
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <button
                  onClick={() => setActiveMethod("upload")}
                  className={`p-8 rounded-2xl border-2 transition-all text-left ${
                    activeMethod === "upload"
                      ? "border-emerald-600 bg-emerald-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
                  }`}
                >
                  <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Upload Existing Plan
                  </h3>
                  <p className="text-gray-600">
                    Upload your architectural plans or sketches. Our AI will analyze them and generate a detailed cost estimate.
                  </p>
                </button>

                <button
                  onClick={() => setActiveMethod("describe")}
                  className={`p-8 rounded-2xl border-2 transition-all text-left ${
                    activeMethod === "describe"
                      ? "border-emerald-600 bg-emerald-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
                  }`}
                >
                  <div className="h-12 w-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Describe Your Project
                  </h3>
                  <p className="text-gray-600">
                    Tell us about your building project conversationally. We'll ask questions and generate an estimate based on your description.
                  </p>
                </button>
              </div>

              {/* Input Forms */}
              {activeMethod === "upload" && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Upload Your Plans
                  </h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center mb-6 hover:border-emerald-500 transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-700 mb-2">
                      Drop your files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, PNG, JPG, DWG (Max 50MB)
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Project Type
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option>Select type...</option>
                        <option>Residential House</option>
                        <option>Apartment Building</option>
                        <option>Commercial Building</option>
                        <option>Mixed-Use Development</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location (District)
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option>Select location...</option>
                        <option>Gasabo</option>
                        <option>Kicukiro</option>
                        <option>Nyarugenge</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleEstimate}
                    className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Generate Estimate
                  </button>
                </div>
              )}

              {activeMethod === "describe" && (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Describe Your Project
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        What do you want to build?
                      </label>
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Example: I want to build a modern 4-bedroom house with a garage in Kigali. I have a budget of around 60 million RWF. The land is 500 square meters..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Budget Range (RWF)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 50,000,000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Land Size (sqm)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 500"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Location
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                          <option>Select...</option>
                          <option>Gasabo</option>
                          <option>Kicukiro</option>
                          <option>Nyarugenge</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleEstimate}
                    className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Generate Estimate
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Features */}
          <section className="py-16 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What You'll Get
                </h2>
                <p className="text-lg text-gray-600">
                  Comprehensive cost intelligence for informed decisions
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Bill of Quantities
                  </h3>
                  <p className="text-gray-600">
                    Detailed breakdown of all materials and quantities needed
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Cost Breakdown
                  </h3>
                  <p className="text-gray-600">
                    Materials, labor, and total costs with regional adjustments
                  </p>
                </div>

                <div className="text-center">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Timeline Estimate
                  </h3>
                  <p className="text-gray-600">
                    Projected construction phases and completion timeframe
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Results Section */
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Cost Estimate Generated</h2>
                  <p className="text-emerald-50">
                    For: Modern 4-Bedroom House in Gasabo District
                  </p>
                </div>
                <CheckCircle className="h-12 w-12" />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-emerald-100 mb-1">Total Estimated Cost</p>
                  <p className="text-4xl font-bold">RWF 58.5M</p>
                </div>
                <div>
                  <p className="text-emerald-100 mb-1">Timeline</p>
                  <p className="text-4xl font-bold">8-10 months</p>
                </div>
                <div>
                  <p className="text-emerald-100 mb-1">Cost per sqm</p>
                  <p className="text-4xl font-bold">RWF 234K</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Cost Breakdown */}
              <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Cost Breakdown
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700">Foundation & Structure</span>
                    <span className="font-semibold text-gray-900">RWF 18,500,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700">Walls & Roofing</span>
                    <span className="font-semibold text-gray-900">RWF 14,200,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700">Plumbing & Electrical</span>
                    <span className="font-semibold text-gray-900">RWF 8,900,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700">Finishes & Interior</span>
                    <span className="font-semibold text-gray-900">RWF 11,400,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-700">Labor Costs</span>
                    <span className="font-semibold text-gray-900">RWF 5,500,000</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-emerald-600 text-xl">RWF 58,500,000</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This is a free summary estimate. Upgrade to access the full Bill of Quantities, detailed material lists, and downloadable reports.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Next Steps
                  </h3>
                  
                  <button className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mb-3 flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" />
                    Get Full Report
                  </button>

                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3">
                    Request Expert Review
                  </button>

                  <button className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Save & Share
                  </button>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                  <h4 className="font-bold text-gray-900 mb-2">
                    95% Accuracy Rate
                  </h4>
                  <p className="text-sm text-gray-700">
                    Our estimates are validated against real Rwanda construction data and reviewed by certified engineers.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Construction Timeline
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-semibold text-gray-900 mb-1">Foundation (Weeks 1-4)</h4>
                    <p className="text-sm text-gray-600">Excavation, footings, and foundation work</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-semibold text-gray-900 mb-1">Structure (Weeks 5-16)</h4>
                    <p className="text-sm text-gray-600">Walls, columns, slabs, and roofing</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-semibold text-gray-900 mb-1">Services (Weeks 17-24)</h4>
                    <p className="text-sm text-gray-600">Plumbing, electrical, and HVAC installation</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Finishing (Weeks 25-36)</h4>
                    <p className="text-sm text-gray-600">Interior finishes, painting, and final touches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
