import { useMemo, useState } from "react";
import { experts } from "../../Data/MockExpert";
import { KEYS, readLS, writeLS } from "../../utils/storage";

export default function Experts() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [region, setRegion] = useState("all");
  const [selected, setSelected] = useState(null);
  const [req, setReq] = useState({ name: "", phone: "", message: "" });

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return experts.filter((e) => {
      const matchQ =
        !query ||
        e.name.toLowerCase().includes(query) ||
        e.role.toLowerCase().includes(query) ||
        e.skills.join(" ").toLowerCase().includes(query);

      const matchRole = role === "all" ? true : e.role === role;
      const matchRegion = region === "all" ? true : e.region === region;

      return matchQ && matchRole && matchRegion;
    });
  }, [q, role, region]);

  const submitRequest = () => {
    if (!selected) return;
    if (!req.name || !req.phone || !req.message) {
      alert("Fill name, phone and message.");
      return;
    }

    const payload = {
      id: "REQ-" + Date.now(),
      expertId: selected.id,
      expertName: selected.name,
      ...req,
      createdAt: new Date().toISOString(),
    };

    const prev = readLS(KEYS.EXPERT_REQUESTS, []);
    writeLS(KEYS.EXPERT_REQUESTS, [payload, ...prev].slice(0, 30));

    setReq({ name: "", phone: "", message: "" });
    alert("Request sent (saved locally for now).");
    setSelected(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34, color: "#0c1220" }}>Experts</h1>
          <p style={{ marginTop: 8, color: "#64708a", fontWeight: 650 }}>
            Browse verified professionals. Request quotes and consultations.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search experts..." style={inputStyle} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={selectStyle}>
            <option value="all">All roles</option>
            <option>Structural Engineer</option>
            <option>Architect</option>
            <option>Contractor</option>
            <option>Supplier</option>
            <option>Surveyor</option>
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
            <option value="all">All regions</option>
            <option>Kigali</option>
            <option>Eastern Province</option>
            <option>Southern Province</option>
            <option>Northern Province</option>
            <option>Western Province</option>
          </select>
        </div>
      </div>

      <div style={gridStyle}>
        {filtered.map((e) => (
          <div key={e.id} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={e.avatar} alt={e.name} style={{ width: 54, height: 54, borderRadius: 16, border: "1px solid #eef0f4" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 950, color: "#0c1220" }}>{e.name}</div>
                <div style={{ color: "#64708a", fontWeight: 750 }}>{e.role} • {e.region}</div>
              </div>
              <span style={pill}>{e.rating.toFixed(1)} ★</span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {e.verified ? <span style={pillBlue}>Verified</span> : <span style={pillSoft}>Unverified</span>}
              <span style={pillSoft}>{e.jobs} jobs</span>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {e.skills.slice(0, 3).map((s) => (
                <span key={s} style={skillPill}>{s}</span>
              ))}
            </div>

            <button onClick={() => setSelected(e)} style={{ ...btnPrimary, marginTop: 12 }}>
              View Profile / Request
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected ? (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 950, fontSize: 18, color: "#0c1220" }}>{selected.name}</div>
                <div style={{ color: "#64708a", fontWeight: 750 }}>
                  {selected.role} • {selected.region} • {selected.rating.toFixed(1)} ★
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={btnGhost}>Close</button>
            </div>

            <div style={{ height: 12 }} />
            <div style={{ color: "#3a4357", fontWeight: 650, lineHeight: 1.55 }}>{selected.bio}</div>

            <div style={{ height: 12 }} />
            <div style={{ fontWeight: 900, color: "#0c1220" }}>Request a quote</div>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <input style={inputStyle} placeholder="Your name" value={req.name} onChange={(e) => setReq({ ...req, name: e.target.value })} />
              <input style={inputStyle} placeholder="Phone (+250...)" value={req.phone} onChange={(e) => setReq({ ...req, phone: e.target.value })} />
              <textarea
                style={{ ...inputStyle, minHeight: 100 }}
                placeholder="Describe your project (location, size, timeline)..."
                value={req.message}
                onChange={(e) => setReq({ ...req, message: e.target.value })}
              />
              <button onClick={submitRequest} style={btnPrimary}>Send Request</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputStyle = {
  minWidth: 260,
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  outline: "none",
  fontWeight: 700,
};

const selectStyle = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  background: "#fff",
  fontWeight: 750,
};

const gridStyle = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
};

const cardStyle = {
  border: "1px solid #eef0f4",
  borderRadius: 18,
  background: "#fff",
  padding: 14,
  boxShadow: "0 14px 40px rgba(12,18,32,.06)",
};

const pill = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #eef0f4",
  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
  fontWeight: 900,
  fontSize: 12,
  color: "#0c1220",
};

const pillBlue = {
  ...pill,
  color: "#1d4ed8",
  border: "1px solid rgba(29,78,216,0.18)",
  background: "rgba(29,78,216,0.06)",
};

const pillSoft = {
  ...pill,
  color: "#3a4357",
};

const skillPill = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #eef0f4",
  background: "#fff",
  color: "#0c1220",
  fontWeight: 800,
  fontSize: 12,
};

const btnPrimary = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.2)",
  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 14px 26px rgba(29,78,216,.18)",
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  background: "#fff",
  color: "#0c1220",
  fontWeight: 900,
  cursor: "pointer",
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(12,18,32,0.55)",
  display: "grid",
  placeItems: "center",
  padding: 18,
  zIndex: 200,
};

const modalCard = {
  width: "min(720px, 100%)",
  borderRadius: 18,
  background: "#fff",
  border: "1px solid #eef0f4",
  boxShadow: "0 24px 80px rgba(12,18,32,.28)",
  padding: 16,
};