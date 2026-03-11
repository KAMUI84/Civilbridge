import { useState } from "react";
import { api } from "../../services/apiClientService";

const formatRWF = (n) => n ? `${Number(n).toLocaleString()} RWF` : "0 RWF";

export default function RoiTools() {
  const [activeTab, setActiveTab] = useState("roi");
  const [roiForm, setRoiForm] = useState({
    land_cost: "", construction_cost: "", other_costs: "",
    projected_value: "", monthly_rental: "", expected_years: "10",
    notes: "", save: true,
  });
  const [carbonForm, setCarbonForm] = useState({
    building_type: "residential", built_area_m2: "", floors: "1",
    construction_months: "", transport_distance: "", save: true,
  });
  const [result, setResult] = useState(null);
  const [carbonResult, setCarbonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCalculateROI(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await api.post("/api/roi/calculate", {
        land_cost: Number(roiForm.land_cost) || 0,
        construction_cost: Number(roiForm.construction_cost) || 0,
        other_costs: Number(roiForm.other_costs) || 0,
        projected_value: Number(roiForm.projected_value) || 0,
        monthly_rental: Number(roiForm.monthly_rental) || 0,
        expected_years: Number(roiForm.expected_years),
        notes: roiForm.notes,
        save: roiForm.save,
      });
      setResult(res.analysis);
    } catch (e) { setError(e.message || "Failed to calculate ROI"); }
    finally { setLoading(false); }
  }

  async function handleCalculateCarbon(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await api.post("/api/roi/carbon", {
        building_type: carbonForm.building_type,
        built_area_m2: Number(carbonForm.built_area_m2) || 0,
        floors: Number(carbonForm.floors) || 1,
        construction_months: Number(carbonForm.construction_months) || 0,
        transport_distance: Number(carbonForm.transport_distance) || 0,
        save: carbonForm.save,
      });
      setCarbonResult(res.analysis);
    } catch (e) { setError(e.message || "Failed to calculate carbon emissions"); }
    finally { setLoading(false); }
  }

  const totalInvestment = (Number(roiForm.land_cost) || 0) + (Number(roiForm.construction_cost) || 0) + (Number(roiForm.other_costs) || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ROI & Carbon Analysis</h1>
          <p className="text-gray-500 mt-1">Calculate return on investment and carbon footprint for your construction project</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab("roi")}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "roi" ? "bg-emerald-600 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ROI Calculator
          </button>
          <button
            onClick={() => setActiveTab("carbon")}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "carbon" ? "bg-emerald-600 text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Carbon Footprint
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

        {activeTab === "roi" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-4">Investment Details</h2>
              <form onSubmit={handleCalculateROI} className="space-y-4">
                {[
                  { key: "land_cost", label: "Land Cost (RWF)" },
                  { key: "construction_cost", label: "Construction Cost (RWF)" },
                  { key: "other_costs", label: "Other Costs (RWF)", placeholder: "Legal fees, landscaping, etc." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="number" min="0"
                      value={roiForm[key]}
                      onChange={e => setRoiForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder={placeholder || "e.g. 10000000"}
                    />
                  </div>
                ))}
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
                  <span className="text-gray-500">Total Investment: </span>
                  <span className="font-bold text-gray-900">{formatRWF(totalInvestment)}</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Return Projections</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Projected Market Value (RWF)</label>
                    <input
                      type="number" min="0"
                      value={roiForm.projected_value}
                      onChange={e => setRoiForm(f => ({ ...f, projected_value: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rental Income (RWF)</label>
                    <input
                      type="number" min="0"
                      value={roiForm.monthly_rental}
                      onChange={e => setRoiForm(f => ({ ...f, monthly_rental: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Hold Period (years)</label>
                    <input
                      type="number" min="1" max="50"
                      value={roiForm.expected_years}
                      onChange={e => setRoiForm(f => ({ ...f, expected_years: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!totalInvestment || loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {loading ? "Calculating..." : "Calculate ROI"}
                </button>
              </form>
            </div>

          {result ? (
            <div className="space-y-4">
              <div className={`rounded-2xl p-6 text-white ${result.roi_percent >= 0 ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-red-500 to-orange-600"}`}>
                <div className="text-sm opacity-80 mb-1">Total Return on Investment</div>
                <div className="text-5xl font-bold mb-1">{result.roi_percent}%</div>
                {result.payback_years && (
                  <div className="text-sm opacity-80">Payback period: {result.payback_years} years</div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold mb-4">Analysis Breakdown</h3>
                <div className="space-y-3">
                  {[
                    ["Total Investment", result.total_investment, "text-gray-900"],
                    ["Projected Value", result.projected_value, "text-blue-600"],
                    ["Capital Gain", result.capital_gain, result.capital_gain >= 0 ? "text-emerald-600" : "text-red-600"],
                    ["Capital Gain %", `${result.capital_gain_pct}%`, result.capital_gain_pct >= 0 ? "text-emerald-600" : "text-red-600"],
                    ["Annual Rental Income", result.annual_rental_income, "text-purple-600"],
                    ["Total Rental Income", result.total_rental_income, "text-purple-600"],
                    ["Rental Yield", `${result.rental_yield_pct}%`, "text-purple-600"],
                    ["Total Return", result.total_return, result.total_return >= 0 ? "text-emerald-600" : "text-red-600"],
                  ].map(([label, val, color]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 text-sm">{label}</span>
                      <span className={`font-semibold text-sm ${color}`}>
                        {typeof val === "number" ? formatRWF(val) : val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-3">📈</div>
              <h3 className="font-semibold text-gray-700 mb-2">ROI Analysis</h3>
              <p className="text-gray-400 text-sm">Fill in investment details to see return projections, payback period, and rental yield</p>
            </div>
          )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-4">Carbon Footprint Analysis</h2>
              <form onSubmit={handleCalculateCarbon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                  <select
                    value={carbonForm.building_type}
                    onChange={e => setCarbonForm(f => ({ ...f, building_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed">Mixed Use</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Built Area (m²)</label>
                  <input
                    type="number" min="0"
                    value={carbonForm.built_area_m2}
                    onChange={e => setCarbonForm(f => ({ ...f, built_area_m2: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. 250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                  <input
                    type="number" min="1" max="50"
                    value={carbonForm.floors}
                    onChange={e => setCarbonForm(f => ({ ...f, floors: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Construction Duration (months)</label>
                  <input
                    type="number" min="1"
                    value={carbonForm.construction_months}
                    onChange={e => setCarbonForm(f => ({ ...f, construction_months: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material Transport Distance (km)</label>
                  <input
                    type="number" min="0"
                    value={carbonForm.transport_distance}
                    onChange={e => setCarbonForm(f => ({ ...f, transport_distance: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Optional"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!carbonForm.built_area_m2 || loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {loading ? "Calculating..." : "Calculate Carbon"}
                </button>
              </form>
            </div>

            {carbonResult ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="text-sm opacity-80 mb-1">Total Carbon Emissions</div>
                  <div className="text-5xl font-bold mb-1">{carbonResult.total_emissions.toLocaleString()} kg CO₂e</div>
                  <div className="text-sm opacity-80">Carbon intensity: {carbonResult.carbon_intensity} kg CO₂e/m²</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold mb-4">Emissions Breakdown</h3>
                  <div className="space-y-3">
                    {carbonResult.breakdown?.materials && Object.entries(carbonResult.breakdown.materials).map(([material, emissions]) => (
                      <div key={material} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-500 text-sm capitalize">{material}</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {Math.round(emissions).toLocaleString()} kg CO₂e
                        </span>
                      </div>
                    ))}
                    {carbonResult.breakdown?.equipment && Object.entries(carbonResult.breakdown.equipment).map(([equipment, emissions]) => (
                      <div key={equipment} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-500 text-sm capitalize">{equipment} fuel</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {Math.round(emissions).toLocaleString()} kg CO₂e
                        </span>
                      </div>
                    ))}
                    {carbonResult.breakdown?.energy && (
                      <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-500 text-sm">Energy consumption</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {Math.round(carbonResult.breakdown.energy).toLocaleString()} kg CO₂e
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {carbonResult.comparison && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold mb-4">Benchmark Comparison</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 text-sm">Benchmark ({carbonResult.building_type})</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {carbonResult.comparison.benchmark} kg CO₂e/m²
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 text-sm">Your project</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {carbonResult.comparison.actual} kg CO₂e/m²
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 text-sm">Difference</span>
                        <span className={`font-semibold text-sm ${
                          carbonResult.comparison.difference <= 0 ? "text-emerald-600" : "text-red-600"
                        }`}>
                          {carbonResult.comparison.difference > 0 ? "+" : ""}{Math.round(carbonResult.comparison.difference)} kg CO₂e/m²
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 text-sm">Percent difference</span>
                        <span className={`font-semibold text-sm ${
                          carbonResult.comparison.percent_difference <= 0 ? "text-emerald-600" : "text-red-600"
                        }`}>
                          {carbonResult.comparison.percent_difference > 0 ? "+" : ""}{Math.round(carbonResult.comparison.percent_difference * 10) / 10}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-3">🌱</div>
                <h3 className="font-semibold text-gray-700 mb-2">Carbon Footprint Analysis</h3>
                <p className="text-gray-400 text-sm">Enter building details to calculate carbon emissions and compare with industry benchmarks</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
