import { useState, useEffect } from "react";
import { documentsService } from "../../services/utilServices.js";

const FILE_ICONS = { IMAGE: "🖼️", PDF: "📄", DOC: "📝", DWG: "📐", OTHER: "📎" };

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    try {
      const res = await documentsService.getAll();
      setDocs(res.documents || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this document?")) return;
    try {
      await documentsService.remove(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (e) { alert(e.message); }
  }

  const filtered = docs.filter(d =>
    !filter || d.original_name?.toLowerCase().includes(filter.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Manage project files, plans, and documents</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-4">
          <div className="flex items-center gap-4">
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading documents...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📁</div>
            <h3 className="font-semibold text-gray-700 mb-2">{docs.length === 0 ? "No documents yet" : "No results found"}</h3>
            <p className="text-gray-400 text-sm">Documents uploaded through project pages will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">File</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{FILE_ICONS[d.file_type] || "📎"}</span>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{d.original_name || d.filename}</div>
                          <div className="text-xs text-gray-400">{d.entity_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.file_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatSize(d.size_bytes)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a href={d.url} target="_blank" rel="noopener"
                          className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-100 transition font-medium">
                          View
                        </a>
                        <button onClick={() => handleDelete(d.id)}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}