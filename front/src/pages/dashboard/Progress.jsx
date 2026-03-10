import { useState, useEffect } from "react";
import { progressService } from "../../services/utilServices.js";

const PHASES = ["PLANNING", "FOUNDATION", "STRUCTURE", "ROOFING", "FINISHING", "HANDOVER"];
const PHASE_COLORS = { PLANNING: "bg-blue-100 text-blue-700", FOUNDATION: "bg-amber-100 text-amber-700", STRUCTURE: "bg-orange-100 text-orange-700", ROOFING: "bg-purple-100 text-purple-700", FINISHING: "bg-pink-100 text-pink-700", HANDOVER: "bg-emerald-100 text-emerald-700" };
const STATUS_ICONS = { PENDING: "⏳", IN_PROGRESS: "🔨", COMPLETED: "✅" };

export default function Progress() {
    const [projectId, setProjectId] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", phase: "PLANNING", planned_date: "", cost_estimate: "" });

    // Get project from URL or first available
    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        const pid = sp.get("project_id") || sp.get("p");
        if (pid) { setProjectId(pid); loadProgress(pid); }
    }, []);

    async function loadProgress(pid) {
        setLoading(true);
        try {
            const res = await progressService.get(pid);
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function addMilestone(e) {
        e.preventDefault();
        try {
            await progressService.createMilestone(projectId, { ...form, cost_estimate: Number(form.cost_estimate) || undefined });
            setShowForm(false);
            setForm({ title: "", phase: "PLANNING", planned_date: "", cost_estimate: "" });
            loadProgress(projectId);
        } catch (e) { alert(e.message); }
    }

    async function toggleStatus(milestone) {
        const next = { PENDING: "IN_PROGRESS", IN_PROGRESS: "COMPLETED", COMPLETED: "PENDING" };
        try {
            await progressService.updateMilestone(milestone.id, {
                status: next[milestone.status],
                ...(next[milestone.status] === "COMPLETED" ? { completed_date: new Date().toISOString().split("T")[0] } : {})
            });
            loadProgress(projectId);
        } catch (e) { alert(e.message); }
    }

    if (!projectId) return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Construction Progress Tracker</h2>
                <p className="text-gray-500">Please open a project first to track its milestones.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Progress Tracker</h1>
                        <p className="text-gray-500 mt-1">Track construction milestones and phases</p>
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition">
                        + Add Milestone
                    </button>
                </div>

                {data && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-700">Overall Progress</span>
                            <span className="font-bold text-emerald-600 text-xl">{data.progress_percent || 0}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${data.progress_percent || 0}%` }} />
                        </div>
                        <div className="flex gap-6 mt-3 text-sm text-gray-500">
                            <span>✅ {data.completed || 0} completed</span>
                            <span>📋 {data.total || 0} total milestones</span>
                        </div>
                    </div>
                )}

                {loading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
                    <div className="space-y-3">
                        {(data?.milestones || []).map(m => (
                            <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                                <button onClick={() => toggleStatus(m)} className="text-2xl flex-shrink-0 hover:scale-110 transition">
                                    {STATUS_ICONS[m.status] || "⏳"}
                                </button>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-semibold text-gray-900 ${m.status === "COMPLETED" ? "line-through text-gray-400" : ""}`}>{m.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PHASE_COLORS[m.phase] || "bg-gray-100 text-gray-600"}`}>{m.phase}</span>
                                    </div>
                                    {m.planned_date && <p className="text-xs text-gray-400">Planned: {new Date(m.planned_date).toLocaleDateString()}</p>}
                                </div>
                                {m.cost_estimate && (
                                    <div className="text-right text-sm">
                                        <div className="text-gray-400 text-xs">Budget</div>
                                        <div className="font-semibold text-gray-800">{Number(m.cost_estimate).toLocaleString()} RWF</div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!data?.milestones?.length) && (
                            <div className="text-center py-12 text-gray-400">
                                <div className="text-4xl mb-2">🎯</div>
                                <p>No milestones yet. Add your first milestone to start tracking progress.</p>
                            </div>
                        )}
                    </div>
                )}

                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="font-bold text-lg mb-4">Add Milestone</h3>
                            <form onSubmit={addMilestone} className="space-y-4">
                                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Milestone title" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                                <select value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
                                    {PHASES.map(p => <option key={p}>{p}</option>)}
                                </select>
                                <input type="date" value={form.planned_date} onChange={e => setForm(f => ({ ...f, planned_date: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                                <input type="number" value={form.cost_estimate} onChange={e => setForm(f => ({ ...f, cost_estimate: e.target.value }))} placeholder="Cost estimate (RWF)" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2.5 font-semibold text-gray-700">Cancel</button>
                                    <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 font-semibold hover:bg-emerald-700 transition">Add</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
