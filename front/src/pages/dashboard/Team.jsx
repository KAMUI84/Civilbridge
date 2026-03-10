import { useState, useEffect } from "react";
import { api } from "../../services/apiClientService.js";

const ROLE_COLORS = { OWNER: "bg-purple-100 text-purple-700", ENGINEER: "bg-blue-100 text-blue-700", CONTRACTOR: "bg-amber-100 text-amber-700", SUPPLIER: "bg-pink-100 text-pink-700", VIEWER: "bg-gray-100 text-gray-700" };

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/projects/user").then(d => {
      setProjects(d.projects || []);
      if (d.projects?.length > 0) {
        setSelectedProject(d.projects[0]);
        loadMembers(d.projects[0].id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function loadMembers(projectId) {
    try {
      const res = await api.get(`/api/projects/${projectId}`);
      setMembers(res.project?.members || []);
    } catch (e) { console.error(e); }
  }

  function handleProjectChange(id) {
    const p = projects.find(p => String(p.id) === String(id));
    setSelectedProject(p);
    loadMembers(id);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Team</h1>
          <p className="text-gray-500 mt-1">Manage team members across your construction projects</p>
        </div>

        {projects.length > 1 && (
          <div className="mb-6">
            <select
              value={selectedProject?.id || ""}
              onChange={e => handleProjectChange(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading team...</div>
        ) : !selectedProject ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-700">No projects found</h3>
            <p className="text-gray-400 text-sm mt-2">Create a project first to manage your team</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map(m => (
              <div key={m.user_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {m.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{m.full_name}</div>
                  <div className="text-sm text-gray-500">{m.email}</div>
                  {m.profession && <div className="text-xs text-gray-400 mt-0.5">{m.profession}</div>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[m.member_role] || ROLE_COLORS.VIEWER}`}>
                  {m.member_role}
                </span>
              </div>
            ))}
            {members.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">👤</div>
                <p>No team members found for this project</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}