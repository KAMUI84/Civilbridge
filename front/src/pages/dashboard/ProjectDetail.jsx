import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/apiClientService";

const STATUS_COLORS = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: "" });
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProject();
  }, [id]);

  async function fetchProject() {
    try {
      setState({ loading: true, error: "" });
      const data = await api.get(`/api/projects/${id}`);
      setProject(data);
    } catch (err) {
      setState({ loading: false, error: err.message || "Failed to load project" });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }

  if (state.loading) return <div className="p-6 text-center">Loading project...</div>;
  if (state.error) return <div className="p-6 text-center text-red-600">{state.error}</div>;
  if (!project) return <div className="p-6 text-center">Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[project.status] || STATUS_COLORS.DRAFT}`}>
              {project.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Region</span>
              <div className="font-semibold">{project.region || "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">Budget</span>
              <div className="font-semibold">{project.budgetAmount ? `${project.budgetAmount.toLocaleString()} RWF` : "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">Spent</span>
              <div className="font-semibold">{project.spentAmount ? `${project.spentAmount.toLocaleString()} RWF` : "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">Progress</span>
              <div className="font-semibold">{project.progressPercent || 0}%</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100">
            {["overview", "documents", "permits", "progress", "team"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Project Overview</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Building Type</div>
                      <div className="font-semibold">{project.buildingType || "—"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Land Size</div>
                      <div className="font-semibold">{project.landSizeSqm ? `${project.landSizeSqm} m²` : "—"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Start Date</div>
                      <div className="font-semibold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Target End</div>
                      <div className="font-semibold">{project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : "—"}</div>
                    </div>
                  </div>
                </div>

                {project.progressPercent && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Overall Progress</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Completion</span>
                        <span>{project.progressPercent}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${project.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                {project.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {project.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                        <div>
                          <div className="font-medium">{doc.fileName}</div>
                          <div className="text-sm text-gray-500">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</div>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents uploaded yet.</p>
                )}
              </div>
            )}

            {activeTab === "permits" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Permits</h3>
                {project.permits?.length > 0 ? (
                  <div className="space-y-3">
                    {project.permits.map(permit => (
                      <div key={permit.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{permit.permitType}</div>
                            <div className="text-sm text-gray-500">{permit.issuingAuthority}</div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            permit.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                            permit.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {permit.status}
                          </span>
                        </div>
                        {permit.expiryDate && (
                          <div className="text-sm text-gray-500">
                            Expires: {new Date(permit.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                        {permit.notes && (
                          <div className="text-sm text-gray-600 mt-2">{permit.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No permits recorded yet.</p>
                )}
              </div>
            )}

            {activeTab === "progress" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Progress Updates</h3>
                {project.progress?.length > 0 ? (
                  <div className="space-y-3">
                    {project.progress.map(update => (
                      <div key={update.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{update.title}</div>
                            <div className="text-sm text-gray-500">{new Date(update.date).toLocaleDateString()}</div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">{update.progressPercent}%</span>
                        </div>
                        {update.description && (
                          <div className="text-sm text-gray-600">{update.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No progress updates yet.</p>
                )}
              </div>
            )}

            {activeTab === "team" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Team Members</h3>
                {project.members?.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {project.members.map(member => (
                      <div key={member.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                        <img
                          src={member.user.avatarUrl || "/placeholder-avatar.jpg"}
                          alt={member.user.fullName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{member.user.fullName}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No team members added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
