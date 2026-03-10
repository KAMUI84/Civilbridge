import { useState, useEffect } from "react";
import { permitsService } from "../../services/utilServices.js";

export default function PermitGuide() {
  const [guides, setGuides] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [activeTab, setActiveTab] = useState("checklist");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      permitsService.getChecklist().catch(() => ({ checklist: [] })),
      permitsService.getAll().catch(() => ({ guides: [] })),
    ]).then(([cl, gd]) => {
      setChecklist(cl.checklist || []);
      setGuides(gd.guides || []);
    }).finally(() => setLoading(false));
  }, []);

  const formatCost = (n) => n ? `${Number(n).toLocaleString()} RWF` : "Varies";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Permit & Approvals Guide</h1>
          <p className="text-gray-500 mt-1">Navigate Rwanda's construction permit process step by step</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {[["checklist", "Step-by-Step Checklist"], ["guides", "Permit Database"]].map(([t, l]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === t ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading permit information...</div>
        ) : activeTab === "checklist" ? (
          <div className="space-y-4">
            {checklist.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setSelected(selected === item.step ? null : item.step)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${item.required !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.authority}</p>
                  </div>
                  <div className="text-right text-sm">
                    {item.duration && <div className="text-gray-500">⏱ {item.duration}</div>}
                    {item.estimated_cost_rwf && <div className="text-emerald-600 font-semibold">{formatCost(item.estimated_cost_rwf)}</div>}
                  </div>
                  <span className="text-gray-400">{selected === item.step ? "▲" : "▼"}</span>
                </div>
                {selected === item.step && item.documents && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Required Documents:</p>
                    <ul className="space-y-1">
                      {item.documents.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-emerald-500">✓</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map(g => (
              <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg flex-1">{g.title}</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg ml-2 font-medium">{g.category}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{g.description}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  {g.estimated_cost_rwf && <span>💰 {formatCost(g.estimated_cost_rwf)}</span>}
                  {g.estimated_days && <span>⏱ {g.estimated_days} days</span>}
                </div>
                {g.issuing_authority && (
                  <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                    🏛 {g.issuing_authority}
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