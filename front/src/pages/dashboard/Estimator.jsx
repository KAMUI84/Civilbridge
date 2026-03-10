import { useState } from "react";
import { estimationService } from "../../services/estimationService.js";

const REGIONS = [
  { id: 1, name: "Kigali" }, { id: 2, name: "Musanze" }, { id: 3, name: "Huye" },
  { id: 4, name: "Rwamagana" }, { id: 5, name: "Rubavu" },
];

const formatRWF = (n) => `${Number(n).toLocaleString()} RWF`;

export default function Estimator() {
  const [form, setForm] = useState({
    area_sqm: "", floors: "1", building_quality: "standard", region_id: "1",
    title: "", save: false,
  });
  const [result, setResult] = useState(null);
  const [feasibility, setFeasibility] = useState(null);
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("estimator");

  async function handleEstimate(e) {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await estimationService.run({
        area_sqm: Number(form.area_sqm),
        floors: Number(form.floors),
        building_quality: form.building_quality,
        region_id: Number(form.region_id),
        title: form.title,
        save: form.save,
      });
      setResult(res.boq);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeasibility(e) {
    e.preventDefault();
    setLoading(true); setError(null); setFeasibility(null);
    try {
      const res = await estimationService.checkFeasibility({
        budget: Number(budget),
        area_sqm: Number(form.area_sqm),
        floors: Number(form.floors),
        region_id: Number(form.region_id),
      });
      setFeasibility(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smart Project Estimator</h1>
          <p className="text-gray-500 mt-1">Generate accurate construction cost estimates for Rwanda</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {[["estimator", "Cost Estimator"], ["feasibility", "Budget Feasibility"]].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === tab ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-4">Project Parameters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Area (m²) *</label>
                  <input
                    type="number" min="20" required
                    value={form.area_sqm}
                    onChange={e => setForm(f => ({ ...f, area_sqm: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. 120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
                  <select
                    value={form.floors}
                    onChange={e => setForm(f => ({ ...f, floors: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? "floor" : "floors"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Construction Quality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["simple", "standard", "premium"].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, building_quality: q }))}
                        className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${form.building_quality === q
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={form.region_id}
                    onChange={e => setForm(f => ({ ...f, region_id: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                {activeTab === "estimator" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimate Title</label>
                      <input
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="My home estimate"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.save}
                        onChange={e => setForm(f => ({ ...f, save: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Save estimate to my account</span>
                    </label>
                    <button
                      onClick={handleEstimate}
                      disabled={!form.area_sqm || loading}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                      {loading ? "Calculating..." : "Generate Estimate"}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Budget (RWF)</label>
                      <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. 50000000"
                      />
                    </div>
                    <button
                      onClick={handleFeasibility}
                      disabled={!form.area_sqm || !budget || loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                    >
                      {loading ? "Checking..." : "Check Feasibility"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Estimator Results */}
            {result && activeTab === "estimator" && (
              <>
                <div className="bg-emerald-600 rounded-2xl p-6 text-white">
                  <div className="text-sm opacity-80 mb-1">Total Estimated Cost</div>
                  <div className="text-4xl font-bold mb-1">{formatRWF(result.summary.grand_total)}</div>
                  <div className="text-sm opacity-80">{formatRWF(result.summary.cost_per_m2)} per m² · {result.total_area_m2} m² total</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Cost Summary</h3>
                  <div className="space-y-2">
                    {[
                      ["Construction Subtotal", result.summary.construction_subtotal],
                      ["Transport", result.summary.transport],
                      ["Permits & Approvals", result.summary.permits],
                      ["Provisional Sums", result.summary.provisional_sums],
                      ["Contingency (10%)", result.summary.contingency_10pct],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-gray-600 text-sm">{label}</span>
                        <span className="font-semibold text-sm">{formatRWF(val)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 bg-emerald-50 rounded-lg px-2 mt-2">
                      <span className="font-bold text-emerald-800">Grand Total</span>
                      <span className="font-bold text-emerald-800">{formatRWF(result.summary.grand_total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">BOQ Breakdown by Section</h3>
                  <div className="space-y-3">
                    {result.sections.map(s => (
                      <div key={s.section} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm text-gray-800">{s.label}</span>
                          <span className="font-bold text-emerald-700 text-sm">{formatRWF(s.section_total)}</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {s.items.map(item => (
                            <div key={item.description} className="flex justify-between text-xs text-gray-500 pl-2">
                              <span>{item.description}</span>
                              <span>{formatRWF(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Feasibility Results */}
            {feasibility && activeTab === "feasibility" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Feasibility Matrix</h3>
                <p className="text-sm text-gray-500 mb-4">Budget: {formatRWF(feasibility.budget)}</p>
                <div className="space-y-4">
                  {Object.entries(feasibility.feasibility_matrix || {}).map(([quality, data]) => (
                    <div
                      key={quality}
                      className={`p-5 rounded-xl border-2 ${data.within_budget ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-red-50"}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-gray-900">{data.label}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{data.description}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${data.within_budget ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
                          {data.within_budget ? "✓ Feasible" : "✗ Over budget"}
                        </span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs">Estimated Cost</div>
                          <div className="font-semibold">{formatRWF(data.estimated_cost)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Budget Gap</div>
                          <div className={`font-semibold ${data.budget_gap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {data.budget_gap >= 0 ? "+" : ""}{formatRWF(Math.abs(data.budget_gap))}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Budget Used</div>
                          <div className="font-semibold">{data.budget_utilization_pct}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!result && !feasibility && !loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-3">🏠</div>
                <h3 className="font-semibold text-gray-700 mb-2">Enter project details to get started</h3>
                <p className="text-gray-400 text-sm">Fill in the form on the left to see your cost estimate or check budget feasibility</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}