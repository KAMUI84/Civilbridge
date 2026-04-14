import { useMemo, useState } from "react";
import { KEYS, readLS, writeLS } from "../../utils/storage.js";

export default function Estimator() {
  const [type, setType] = useState("");
  const [area, setArea] = useState("");
  const [quality, setQuality] = useState("");
  const [region, setRegion] = useState("");
  const [saved, setSaved] = useState(() => readLS(KEYS.SAVED_ESTIMATES, []));

  const rate = useMemo(() => {
    if (!type || !quality || !region || !Number(area || 0)) return 0;
    // simple realistic ranges (you can tune)
    const base = type === "Commercial" ? 650000 : type === "Healthcare" ? 750000 : 520000; // RWF/m²
    const q = quality === "Premium" ? 1.35 : quality === "Basic" ? 0.85 : 1.0;
    const r = region === "Kigali" ? 1.05 : 1.0;
    return Math.round(base * q * r);
  }, [type, quality, region]);

  const total = useMemo(() => Math.round(rate * Number(area || 0)), [rate, area]);
  const canEstimate = Boolean(type && quality && region && Number(area || 0) > 0);

  const boq = useMemo(() => {
    if (!canEstimate) return [];
    // quick BOQ split (very normal MVP)
    const items = [
      { name: "Substructure (foundation)", pct: 0.14 },
      { name: "Superstructure (walls/columns)", pct: 0.22 },
      { name: "Roofing", pct: 0.10 },
      { name: "Finishes (plaster/paint/tiles)", pct: 0.18 },
      { name: "Doors & Windows", pct: 0.10 },
      { name: "Plumbing", pct: 0.08 },
      { name: "Electrical", pct: 0.06 },
      { name: "External works", pct: 0.07 },
      { name: "Contractor preliminaries", pct: 0.05 },
    ];
    return items.map((x) => ({
      ...x,
      amount: Math.round(total * x.pct),
    }));
  }, [canEstimate, total]);

  const saveEstimate = () => {
    if (!canEstimate) return;
    const entry = {
      id: "EST-" + Date.now(),
      type,
      area: Number(area),
      quality,
      region,
      rate,
      total,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...saved].slice(0, 15);
    setSaved(next);
    writeLS(KEYS.SAVED_ESTIMATES, next);
  };

  const exportCSV = () => {
    if (!canEstimate) return;
    const rows = [
      ["Item", "Percent", "Amount (RWF)"],
      ...boq.map((x) => [x.name, (x.pct * 100).toFixed(0) + "%", String(x.amount)]),
      ["TOTAL", "", String(total)],
    ];
    const csv = rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "civilbridge_estimate_boq.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px 40px" }}>
      <h1 style={{ margin: 0, fontSize: 34, color: "#0c1220" }}>Estimator</h1>
      <p style={{ marginTop: 8, color: "#64708a", fontWeight: 650 }}>
        Enter your own project details to generate a fresh estimate, save the result, and export the BOQ split.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 12, marginTop: 14 }}>
        {/* Controls */}
        <div style={box}>
          <div style={label}>Project type</div>
          <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
            <option value="">Choose project type</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Healthcare</option>
          </select>

          <div style={{ height: 10 }} />

          <div style={label}>Area (m²)</div>
          <input value={area} onChange={(e) => setArea(e.target.value)} style={input} type="number" min="10" />

          <div style={{ height: 10 }} />

          <div style={label}>Quality</div>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} style={input}>
            <option value="">Choose quality</option>
            <option>Basic</option>
            <option>Standard</option>
            <option>Premium</option>
          </select>

          <div style={{ height: 10 }} />

          <div style={label}>Region</div>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={input}>
            <option value="">Choose region</option>
            <option>Kigali</option>
            <option>Southern Province</option>
            <option>Eastern Province</option>
            <option>Northern Province</option>
            <option>Western Province</option>
          </select>

          <div style={{ height: 14 }} />

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ color: "#0c1220", fontWeight: 950 }}>
              Rate: {money(rate)} RWF / m²
            </div>
            <div style={{ color: "#0c1220", fontWeight: 950, fontSize: 20 }}>
              Total: {money(total)} RWF
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={saveEstimate} style={btnPrimary} disabled={!canEstimate}>Save Estimate</button>
            <button onClick={exportCSV} style={btnGhost} disabled={!canEstimate}>Export BOQ CSV</button>
          </div>
        </div>

        {/* BOQ table */}
        <div style={box}>
          <div style={{ fontWeight: 950, color: "#0c1220", marginBottom: 10 }}>
            BOQ split (MVP)
          </div>

          {canEstimate ? (
            <div style={{ overflow: "auto", border: "1px solid #eef0f4", borderRadius: 14 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg,#ffffff,#f7f9ff)" }}>
                    <th style={th}>Item</th>
                    <th style={th}>%</th>
                    <th style={th}>Amount (RWF)</th>
                  </tr>
                </thead>
                <tbody>
                  {boq.map((x) => (
                    <tr key={x.name}>
                      <td style={td}>{x.name}</td>
                      <td style={td}>{Math.round(x.pct * 100)}%</td>
                      <td style={td}>{money(x.amount)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...td, fontWeight: 950 }}>TOTAL</td>
                    <td style={td}></td>
                    <td style={{ ...td, fontWeight: 950 }}>{money(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyEstimateState}>
              Add your project type, area, quality, and region to generate the first estimate.
            </div>
          )}

          <div style={{ height: 14 }} />

          <div style={{ fontWeight: 950, color: "#0c1220" }}>Saved history</div>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {saved.length === 0 ? (
              <div style={{ color: "#64708a", fontWeight: 650 }}>
                No saved estimates yet.
              </div>
            ) : (
              saved.map((s) => (
                <div key={s.id} style={historyItem}>
                  <div style={{ fontWeight: 900, color: "#0c1220" }}>
                    {s.type} • {s.area}m² • {s.quality} • {s.region}
                  </div>
                  <div style={{ color: "#64708a", fontWeight: 700 }}>
                    Total: {money(s.total)} RWF
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const money = (n) => new Intl.NumberFormat().format(n);

function escapeCSV(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

const box = {
  border: "1px solid #eef0f4",
  borderRadius: 18,
  background: "#fff",
  padding: 16,
  boxShadow: "0 14px 40px rgba(12,18,32,.06)",
};

const label = { fontWeight: 900, color: "#0c1220", fontSize: 13, marginBottom: 6 };

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  background: "#fff",
  fontWeight: 750,
  outline: "none",
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
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  background: "#fff",
  color: "#0c1220",
  fontWeight: 950,
  cursor: "pointer",
};

const emptyEstimateState = {
  border: "1px dashed #dbe2ec",
  borderRadius: 14,
  padding: 24,
  color: "#64708a",
  fontWeight: 650,
  textAlign: "center",
  lineHeight: 1.6,
};

const th = { textAlign: "left", padding: 12, borderBottom: "1px solid #eef0f4", color: "#0c1220" };
const td = { padding: 12, borderBottom: "1px solid #eef0f4", color: "#3a4357", fontWeight: 650 };

const historyItem = {
  border: "1px solid #eef0f4",
  borderRadius: 14,
  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
  padding: 12,
};
