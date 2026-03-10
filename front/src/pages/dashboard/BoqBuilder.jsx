import { useState, useEffect } from "react";
import { boqService } from "../../services/boqService.js";
import { estimationService } from "../../services/estimationService.js";
import { catalogService } from "../../services/utilServices.js";

const formatRWF = (n) => `${Number(n || 0).toLocaleString()} RWF`;

export default function BoqBuilder() {
    const [estimates, setEstimates] = useState([]);
    const [selectedEstimate, setSelectedEstimate] = useState(null);
    const [boq, setBOQ] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddItem, setShowAddItem] = useState(false);
    const [form, setForm] = useState({ section: "", description: "", unit: "lumpsum", quantity: "1", unit_rate: "", catalog_item_id: "" });

    useEffect(() => {
        Promise.all([
            estimationService.getAll().catch(() => ({ estimates: [] })),
            catalogService.getAll({ limit: 100 }).catch(() => ({ items: [] })),
        ]).then(([est, cat]) => {
            setEstimates(est.estimates || []);
            setCatalog(cat.items || []);
            if (est.estimates?.length) {
                setSelectedEstimate(est.estimates[0]);
                loadBOQ(est.estimates[0].id);
            }
        }).finally(() => setLoading(false));
    }, []);

    async function loadBOQ(id) {
        try {
            const res = await boqService.get(id);
            setBOQ(res);
        } catch (e) { console.error(e); }
    }

    async function addItem(e) {
        e.preventDefault();
        try {
            await boqService.addItem(selectedEstimate.id, {
                section: form.section,
                description: form.description,
                unit: form.unit,
                quantity: Number(form.quantity),
                unit_rate: Number(form.unit_rate),
                catalog_item_id: form.catalog_item_id || undefined,
            });
            setShowAddItem(false);
            setForm({ section: "", description: "", unit: "lumpsum", quantity: "1", unit_rate: "", catalog_item_id: "" });
            loadBOQ(selectedEstimate.id);
        } catch (e) { alert(e.message); }
    }

    async function deleteItem(id) {
        try {
            await boqService.deleteItem(id);
            loadBOQ(selectedEstimate.id);
        } catch (e) { alert(e.message); }
    }

    function handleCatalogSelect(id) {
        const item = catalog.find(c => String(c.id) === String(id));
        if (item) {
            setForm(f => ({
                ...f,
                catalog_item_id: id,
                description: item.name,
                unit: item.unit,
                unit_rate: item.base_price_rwf,
            }));
        }
    }

    // Group items by section
    const sections = {};
    (boq?.items || []).forEach(item => {
        const s = item.section || "General";
        if (!sections[s]) sections[s] = [];
        sections[s].push(item);
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">BOQ Builder</h1>
                        <p className="text-gray-500 mt-1">Bill of Quantities — itemize and manage construction costs</p>
                    </div>
                    {selectedEstimate && (
                        <button onClick={() => setShowAddItem(true)}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition">
                            + Add Line Item
                        </button>
                    )}
                </div>

                {/* Estimate Selector */}
                {estimates.length > 0 && (
                    <div className="mb-6 flex gap-3 flex-wrap">
                        {estimates.map(est => (
                            <button key={est.id}
                                onClick={() => { setSelectedEstimate(est); loadBOQ(est.id); }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${selectedEstimate?.id === est.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"}`}>
                                {est.title || `Estimate #${est.id}`}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : !selectedEstimate || estimates.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="text-5xl mb-3">📊</div>
                        <h3 className="font-semibold text-gray-700 mb-2">No estimates saved yet</h3>
                        <p className="text-gray-400 text-sm">Create and save an estimate from the Estimator page first</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Bar */}
                        {boq && (
                            <div className="bg-emerald-600 rounded-2xl p-5 mb-6 text-white flex items-center justify-between">
                                <div>
                                    <div className="text-sm opacity-80">{selectedEstimate.title || "Estimate"}</div>
                                    <div className="text-3xl font-bold">{formatRWF(boq.estimate?.total || 0)}</div>
                                </div>
                                <div className="text-right text-sm opacity-80">
                                    <div>{boq.items?.length || 0} line items</div>
                                </div>
                            </div>
                        )}

                        {/* BOQ Table by Section */}
                        {Object.entries(sections).map(([section, items]) => (
                            <div key={section} className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                                    <span className="font-bold text-gray-700">{section}</span>
                                    <span className="ml-3 text-sm text-gray-500">
                                        {formatRWF(items.reduce((sum, i) => sum + Number(i.amount), 0))}
                                    </span>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-xs text-gray-400 border-b border-gray-50">
                                            <th className="text-left px-6 py-2">Description</th>
                                            <th className="text-right px-4 py-2">Qty</th>
                                            <th className="text-right px-4 py-2">Unit</th>
                                            <th className="text-right px-4 py-2">Rate (RWF)</th>
                                            <th className="text-right px-6 py-2">Amount (RWF)</th>
                                            <th className="px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition text-sm">
                                                <td className="px-6 py-3 text-gray-800">{item.description}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-gray-500">{item.unit}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">{Number(item.unit_rate).toLocaleString()}</td>
                                                <td className="px-6 py-3 text-right font-semibold text-gray-900">{Number(item.amount).toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        {boq?.items?.length === 0 && (
                            <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-gray-100">
                                No items yet. Click "+ Add Line Item" to start building your BOQ.
                            </div>
                        )}
                    </>
                )}

                {/* Add Item Modal */}
                {showAddItem && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                            <h3 className="font-bold text-lg mb-4">Add BOQ Line Item</h3>
                            <form onSubmit={addItem} className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">From Catalog (optional)</label>
                                    <select value={form.catalog_item_id} onChange={e => handleCatalogSelect(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                                        <option value="">— Select from catalog —</option>
                                        {catalog.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unit}) — {Number(c.base_price_rwf).toLocaleString()} RWF</option>)}
                                    </select>
                                </div>
                                <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description *" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                <input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="Section (e.g. Foundation)" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="number" required value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Qty" className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                    <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Unit" className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                    <input type="number" required value={form.unit_rate} onChange={e => setForm(f => ({ ...f, unit_rate: e.target.value }))} placeholder="Rate (RWF)" className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                                </div>
                                {form.quantity && form.unit_rate && (
                                    <div className="text-right text-sm text-emerald-600 font-semibold">
                                        Total: {formatRWF(Number(form.quantity) * Number(form.unit_rate))}
                                    </div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddItem(false)} className="flex-1 border border-gray-300 rounded-xl py-2.5 font-semibold text-gray-700">Cancel</button>
                                    <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 font-semibold hover:bg-emerald-700 transition">Add Item</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
