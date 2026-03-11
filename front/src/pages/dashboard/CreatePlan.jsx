import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/apiClientService";

export default function CreatePlan() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "RESIDENTIAL",
    style: "MODERN",
    bedrooms: "",
    floors: "1",
    builtAreaM2: "",
    estimatedCostMin: "",
    estimatedCostMax: "",
    zoningInfo: "",
  });
  const [assets, setAssets] = useState([]);
  const [state, setState] = useState({ loading: false, error: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAssetChange = (e) => {
    setAssets(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: "" });

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    assets.forEach((asset) => formData.append("assets", asset));

    try {
      await api.post("/api/plans", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Plan submitted for approval!");
      navigate("/dashboard/plans");
    } catch (err) {
      setState({ loading: false, error: err.message || "Failed to create plan" });
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "26px 18px" }}>
      <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 800 }}>Submit Plan</h1>
      <p style={{ color: "#64708a", marginBottom: 32 }}>
        Submit your architectural plan for review. It will be published after admin approval.
      </p>

      {state.error && <div style={{ color: "#b91c1c", marginBottom: 20 }}>{state.error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Title *</div>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Category *</div>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="HOSPITAL">Hospital</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Style</div>
            <select
              name="style"
              value={form.style}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            >
              <option value="MODERN">Modern</option>
              <option value="TRADITIONAL">Traditional</option>
              <option value="MINIMAL">Minimal</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Floors</div>
            <input
              name="floors"
              type="number"
              value={form.floors}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
        </div>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Description</div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Bedrooms</div>
            <input
              name="bedrooms"
              type="number"
              value={form.bedrooms}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Built Area (m²)</div>
            <input
              name="builtAreaM2"
              type="number"
              value={form.builtAreaM2}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Zoning / Land Use</div>
            <input
              name="zoningInfo"
              value={form.zoningInfo}
              onChange={handleChange}
              placeholder="e.g., Residential, Commercial"
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Estimated Cost Min (RWF)</div>
            <input
              name="estimatedCostMin"
              type="number"
              value={form.estimatedCostMin}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Estimated Cost Max (RWF)</div>
            <input
              name="estimatedCostMax"
              type="number"
              value={form.estimatedCostMax}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
        </div>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Assets (renders, drawings, PDFs; up to 10, max 5MB each)</div>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.dwg,.skp"
            onChange={handleAssetChange}
            style={{ width: "100%" }}
          />
          {assets.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#64708a" }}>
              {assets.length} file(s) selected
            </div>
          )}
        </label>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={state.loading}
            style={{
              padding: "10px 24px",
              background: "#00f2ff",
              color: "#050505",
              border: "none",
              borderRadius: 6,
              fontWeight: 700,
              cursor: state.loading ? "not-allowed" : "pointer",
            }}
          >
            {state.loading ? "Submitting…" : "Submit Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}
