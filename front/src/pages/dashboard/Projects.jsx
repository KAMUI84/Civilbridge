import { useState, useEffect } from "react";
import { api } from "../../services/apiClientService.js";
import { Link, useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", region: "", building_type: "", budget_amount: "", start_date: "",
  });

  const REGIONS = ["Kigali", "Musanze", "Huye", "Rwamagana", "Rubavu", "Kayonza", "Muhanga"];
  const TYPES = ["Residential", "Commercial", "Industrial", "Mixed Use", "Infrastructure"];

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const data = await api.get("/api/projects/user");
      setProjects(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/api/projects", {
        ...form,
        budget_amount: form.budget_amount ? Number(form.budget_amount) : undefined,
      });
      setShowForm(false);
      setForm({ title: "", description: "", region: "", building_type: "", budget_amount: "", start_date: "" });
      await fetchProjects();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-500 mt-1">Track your construction projects from start to finish</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> New Project
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* New Project Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
              <h2 className="text-xl font-bold mb-6">Create New Project</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="e.g. Family Home - Kigali"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Brief description of your project..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <select
                      value={form.region}
                      onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Select region</option>
                      {REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                    <select
                      value={form.building_type}
                      onChange={e => setForm(f => ({ ...f, building_type: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Select type</option>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (RWF)</label>
                    <input
                      type="number"
                      value={form.budget_amount}
                      onChange={e => setForm(f => ({ ...f, budget_amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 50000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-300 rounded-xl py-2.5 font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Start your first construction project to begin tracking costs, progress, and team</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{p.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] || STATUS_COLORS.DRAFT}`}>
                    {p.status}
                  </span>
                </div>
                {p.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                )}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{p.progress_percent || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${p.progress_percent || 0}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {p.region && <span>📍 {p.region}</span>}
                  {p.budget_amount && (
                    <span>💰 {(p.budget_amount / 1_000_000).toFixed(1)}M RWF</span>
                  )}
                </div>
                {(p.team_size > 0 || p.milestone_count > 0) && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    <span>👥 {p.team_size} members</span>
                    <span>🎯 {p.milestone_count} milestones</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}