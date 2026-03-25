import { useMemo, useState } from "react";
import PageShell from "../../components/common/PageShell";
import { labelStyle, inputStyle, textareaStyle, primaryBtn, ghostBtn, errBox } from "../../components/common/FormUI";

const TABS = [
  { id: "property", label: "Upload Property" },
  { id: "land", label: "Upload Land" },
  { id: "plan", label: "Upload Plan" },
  { id: "project", label: "Upload Project Docs" },
];

export default function Uploads() {
  const [tab, setTab] = useState("property");

  return (
    <PageShell
      title="Upload Center"
      subtitle="Add properties, build-ready plots, plan templates, or upload your own project drawings for estimation."
    >
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...ghostBtn,
              borderRadius: 999,
              background: tab === t.id ? "#000000" : "#0a0a0a",
              color: tab === t.id ? "#ffffff" : "#ffffff",
              borderColor: tab === t.id ? "#3b82f6" : "#1a1a1a",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "property" ? <PropertyForm /> : null}
      {tab === "land" ? <LandForm /> : null}
      {tab === "plan" ? <PlanForm /> : null}
      {tab === "project" ? <ProjectDocsForm /> : null}
    </PageShell>
  );
}

/* LocalStorage helpers (works today). Later replace with backend APIs. */
function saveItem(key, item) {
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.unshift({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...item });
  localStorage.setItem(key, JSON.stringify(arr));
}

function UploadBox({ label, accept, onFiles }) {
  return (
    <label style={{ ...labelStyle }}>
      {label}
      <input
        type="file"
        accept={accept}
        multiple
        onChange={(e) => onFiles(Array.from(e.target.files || []))}
        style={{ ...inputStyle, padding: 10 }}
      />
    </label>
  );
}

/* --- Forms --- */
function PropertyForm() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("2");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  function submit(e) {
    e.preventDefault();
    setErr(""); setOk(false);
    if (!title || !location || !price) return setErr("Title, location and price are required.");

    saveItem("cb_properties", {
      title,
      location,
      price,
      beds: Number(beds),
      desc,
      // we store only filenames now (real file upload later)
      images: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      status: "PENDING_REVIEW",
    });

    setOk(true);
    setTitle(""); setLocation(""); setPrice(""); setBeds("2"); setDesc(""); setFiles([]);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      {err ? <div style={errBox}>{err}</div> : null}
      {ok ? <Success text="Property submitted. Admin review pending." /> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>Title<input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Modern 3-bedroom house" /></label>
        <label style={labelStyle}>Location<input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, Kicukiro" /></label>
        <label style={labelStyle}>Price<input style={inputStyle} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 95,000,000 RWF" /></label>
        <label style={labelStyle}>Bedrooms<input style={inputStyle} value={beds} onChange={(e) => setBeds(e.target.value)} /></label>
      </div>

      <label style={labelStyle}>
        Description
        <textarea style={textareaStyle} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short details about the property..." />
      </label>

      <UploadBox label="Photos" accept="image/*" onFiles={setFiles} />

      {previews.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {previews.slice(0, 4).map((src) => (
            <div key={src} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #eef0f4" }}>
              <img src={src} alt="" style={{ width: "100%", height: 110, objectFit: "cover" }} />
            </div>
          ))}
        </div>
      ) : null}

      <button style={primaryBtn}>Submit Property</button>
      <style>{`@media (max-width: 960px){ div[style*="grid-template-columns: 1fr 1fr"]{ grid-template-columns: 1fr !important; } }`}</style>
    </form>
  );
}

function LandForm() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  function submit(e) {
    e.preventDefault();
    setErr(""); setOk(false);
    if (!title || !location || !size || !price) return setErr("Title, location, size and price are required.");

    saveItem("cb_lands", { title, location, size, price, desc, status: "PENDING_REVIEW" });
    setOk(true);
    setTitle(""); setLocation(""); setSize(""); setPrice(""); setDesc("");
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      {err ? <div style={errBox}>{err}</div> : null}
      {ok ? <Success text="Land listing submitted. Admin review pending." /> : null}

      <label style={labelStyle}>Title<input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Build-ready plot (Residential)" /></label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>Location<input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, Gasabo" /></label>
        <label style={labelStyle}>Size (m² / ares)<input style={inputStyle} value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 450 m²" /></label>
      </div>
      <label style={labelStyle}>Price<input style={inputStyle} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 18,000,000 RWF" /></label>
      <label style={labelStyle}>Description<textarea style={textareaStyle} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Zoning, access road, water/electricity..." /></label>

      <button style={primaryBtn}>Submit Land</button>
      <style>{`@media (max-width: 960px){ div[style*="grid-template-columns: 1fr 1fr"]{ grid-template-columns: 1fr !important; } }`}</style>
    </form>
  );
}

function PlanForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Residential");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  function submit(e) {
    e.preventDefault();
    setErr(""); setOk(false);
    if (!name || !files.length) return setErr("Plan name and at least one file are required.");

    saveItem("cb_plans_uploaded", {
      name,
      category,
      desc,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      status: "PENDING_REVIEW",
    });

    setOk(true);
    setName(""); setCategory("Residential"); setDesc(""); setFiles([]);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      {err ? <div style={errBox}>{err}</div> : null}
      {ok ? <Success text="Plan uploaded. Admin review pending." /> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>Plan name<input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Modern 2-bedroom house plan" /></label>
        <label style={labelStyle}>Category
          <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Industrial</option>
            <option>Infrastructure</option>
          </select>
        </label>
      </div>

      <label style={labelStyle}>Description<textarea style={textareaStyle} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What’s included: floor plans, elevations, renders..." /></label>

      <UploadBox label="Upload files (PDF, images)" accept=".pdf,image/*" onFiles={setFiles} />

      <button style={primaryBtn}>Submit Plan</button>
      <style>{`@media (max-width: 960px){ div[style*="grid-template-columns: 1fr 1fr"]{ grid-template-columns: 1fr !important; } }`}</style>
    </form>
  );
}

function ProjectDocsForm() {
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  function submit(e) {
    e.preventDefault();
    setErr(""); setOk(false);
    if (!projectName || !files.length) return setErr("Project name and files are required.");

    saveItem("cb_project_docs", {
      projectName,
      notes,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      status: "RECEIVED",
    });

    setOk(true);
    setProjectName(""); setNotes(""); setFiles([]);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      {err ? <div style={errBox}>{err}</div> : null}
      {ok ? <Success text="Project documents uploaded. You can now open Estimator and build a BOQ." /> : null}

      <label style={labelStyle}>Project name<input style={inputStyle} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My house in Kicukiro" /></label>
      <label style={labelStyle}>Notes<textarea style={textareaStyle} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Budget, number of floors, finish level, any special requirements..." /></label>

      <UploadBox label="Upload drawings & docs (PDF, images)" accept=".pdf,image/*" onFiles={setFiles} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={primaryBtn}>Save Documents</button>
        <a href="/estimator" style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          Go to Estimator →
        </a>
      </div>
    </form>
  );
}

function Success({ text }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: "#ecfdf5", border: "1px solid #d1fae5", color: "#065f46", fontWeight: 850 }}>
      {text}
    </div>
  );
}