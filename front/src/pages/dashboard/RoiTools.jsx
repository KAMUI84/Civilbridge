import { useState } from "react";
import { roiService } from "../../services/utilServices.js";

const formatRWF = (n) => n ? `${Number(n).toLocaleString()} RWF` : "0 RWF";

export default function RoiTools() {
  const [form, setForm] = useState({
    land_cost: "", construction_cost: "", other_costs: "",
    projected_value: "", monthly_rental: "", expected_years: "10",
    notes: "", save: true,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCalculate(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await roiService.calculate({
        land_cost: Number(form.land_cost) || 0,
        construction_cost: Number(form.construction_cost) || 0,
        other_costs: Number(form.other_costs) || 0,
        projected_value: Number(form.projected_value) || 0,
        monthly_rental: Number(form.monthly_rental) || 0,
        expected_years: Number(form.expected_years),
        notes: form.notes,
        save: form.save,
      });
      setResult(res.analysis);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const totalInvestment = (Number(form.land_cost) || 0) + (Number(form.construction_cost) || 0) + (Number(form.other_costs) || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ROI Calculator</h1>
          <p className="text-gray-500 mt-1">Calculate return on investment for your construction project</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-lg mb-4">Investment Details</h2>
            <form onSubmit={handleCalculate} className="space-y-4">
              {[
                { key: "land_cost", label: "Land Cost (RWF)" },
                { key: "construction_cost", label: "Construction Cost (RWF)" },
                { key: "other_costs", label: "Other Costs (RWF)", placeholder: "Legal fees, landscaping, etc." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="number" min="0"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
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
                    value={form.projected_value}
                    onChange={e => setForm(f => ({ ...f, projected_value: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rental Income (RWF)</label>
                  <input
                    type="number" min="0"
                    value={form.monthly_rental}
                    onChange={e => setForm(f => ({ ...f, monthly_rental: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Hold Period (years)</label>
                  <input
                    type="number" min="1" max="50"
                    value={form.expected_years}
                    onChange={e => setForm(f => ({ ...f, expected_years: e.target.value }))}
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
      </div>
    </div>
  );
}
