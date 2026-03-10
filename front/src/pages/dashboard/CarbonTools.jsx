import { useState } from "react";
import { carbonService } from "../../services/utilServices.js";

const REGIONS = [{ id: 1, name: "Kigali" }, { id: 2, name: "Musanze" }, { id: 3, name: "Huye" }, { id: 4, name: "Rwamagana" }, { id: 5, name: "Rubavu" }];

export default function CarbonTools() {
    const [form, setForm] = useState({ area_sqm: "", floors: "1", building_quality: "standard", transport_distance_km: "50" });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleCalculate(e) {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res = await carbonService.calculate({
                area_sqm: Number(form.area_sqm),
                floors: Number(form.floors),
                building_quality: form.building_quality,
                transport_distance_km: Number(form.transport_distance_km),
                save: true,
            });
            setResult(res.carbon_analysis);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }

    const CO2_COLOR = (val, max) => {
        const pct = (val / max) * 100;
        if (pct < 30) return "bg-emerald-500";
        if (pct < 60) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Carbon Footprint Calculator</h1>
                    <p className="text-gray-500 mt-1">Estimate construction emissions and get sustainability recommendations</p>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-bold text-lg mb-4">Project Details</h2>
                        <form onSubmit={handleCalculate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Area (m²) *</label>
                                <input required type="number" min="20" value={form.area_sqm} onChange={e => setForm(f => ({ ...f, area_sqm: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 120" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                                <select value={form.floors} onChange={e => setForm(f => ({ ...f, floors: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none">
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["simple", "standard", "premium"].map(q => (
                                        <button key={q} type="button" onClick={() => setForm(f => ({ ...f, building_quality: q }))}
                                            className={`py-2 rounded-xl text-sm font-semibold border-2 transition capitalize ${form.building_quality === q ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"}`}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Material transport distance (km)</label>
                                <input type="number" min="5" value={form.transport_distance_km} onChange={e => setForm(f => ({ ...f, transport_distance_km: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <button type="submit" disabled={!form.area_sqm || loading}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
                                {loading ? "Calculating..." : "Calculate Emissions"}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                        {result ? (
                            <>
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
                                    <div className="text-sm opacity-80 mb-1">Total Carbon Footprint</div>
                                    <div className="text-4xl font-bold">{result.total_co2_tonnes} tonnes CO₂</div>
                                    <div className="text-sm opacity-80 mt-1">{result.co2_per_m2} kg CO₂ per m²</div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold mb-4">Emissions by Category</h3>
                                    {[
                                        { label: "Materials", kg: result.materials_co2_kg },
                                        { label: "Transport", kg: result.transport_co2_kg },
                                        { label: "Labour", kg: result.labor_co2_kg },
                                    ].map(({ label, kg }) => (
                                        <div key={label} className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">{label}</span>
                                                <span className="font-semibold">{kg.toLocaleString()} kg</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full">
                                                <div className={`h-full rounded-full ${CO2_COLOR(kg, result.total_co2_kg)}`}
                                                    style={{ width: `${(kg / result.total_co2_kg) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                                    <h3 className="font-bold text-emerald-800 mb-3">💡 Offset Suggestions</h3>
                                    {(result.offset_suggestions || []).map((s, i) => (
                                        <div key={i} className="flex gap-2 mb-2 text-sm text-emerald-700">
                                            <span>🌱</span><span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="text-5xl mb-3">🌍</div>
                                <h3 className="font-semibold text-gray-700 mb-2">Measure your project's impact</h3>
                                <p className="text-gray-400 text-sm">Enter project details to calculate CO₂ emissions and get sustainability recommendations</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
