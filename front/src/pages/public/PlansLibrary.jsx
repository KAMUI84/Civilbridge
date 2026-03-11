import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./catalog.css";
import { api } from "../../services/apiClientService";
import { useAuth } from "../../context/AuthContext";

function canPost(role) {
  return ["ADMIN", "ENGINEER", "CONTRACTOR", "ARCHITECT"].includes(role);
}

export default function PlansLibrary() {
  const { user, isAuthed } = useAuth();
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [style, setStyle] = useState("all");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const query = new URLSearchParams({ category: category !== "all" ? category : undefined, style: style !== "all" ? style : undefined, search: q || undefined }).toString();
        const data = await api.get(`/api/plans?${query}`);
        if (!alive) return;
        setItems(data?.plans || []);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load plans" });
      }
    })();
    return () => { alive = false; };
  }, [category, style, q]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (sort === "new") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "size") list.sort((a, b) => (b.builtAreaM2 || 0) - (a.builtAreaM2 || 0));
    if (sort === "cost_low") list.sort((a, b) => (a.estimatedCostMin || 0) - (b.estimatedCostMin || 0));
    if (sort === "cost_high") list.sort((a, b) => (b.estimatedCostMax || 0) - (a.estimatedCostMax || 0));
    return list;
  }, [items, sort]);

  const stats = useMemo(() => {
    const total = items.length;
    const approved = items.filter((x) => x.status === "APPROVED").length;
    return { total, approved };
  }, [items]);

  return (
    <div className="cb-wrap">
      <div className="cb-container">
        <div className="cb-top">
          <div>
            <h1 className="cb-h1">Plans Library</h1>
            <p className="cb-sub">
              Pre-designed architectural templates with realistic cost ranges. Professionals can submit plans for approval.
            </p>
          </div>

          <div className="cb-row">
            <span className="cb-chip">Plans: {stats.total}</span>
            <span className="cb-chip">Approved: {stats.approved}</span>

            {isAuthed && canPost(user?.role) ? (
              <Link className="cb-btn cb-btnPrimary" to="/dashboard/plans/new" style={{ textDecoration: "none" }}>
                + Submit Plan
              </Link>
            ) : (
              <span className="cb-chip">Submit requires professional role</span>
            )}
          </div>
        </div>

        <div className="cb-panel">
          <input
            className="cb-input"
            placeholder="Search plans..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select className="cb-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="INDUSTRIAL">Industrial</option>
          </select>

          <select className="cb-select" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="all">All styles</option>
            <option value="MODERN">Modern</option>
            <option value="TRADITIONAL">Traditional</option>
            <option value="MINIMAL">Minimal</option>
          </select>

          <select className="cb-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="size">Largest size</option>
            <option value="cost_low">Cost: Low → High</option>
            <option value="cost_high">Cost: High → Low</option>
          </select>

          <button
            className="cb-btn"
            onClick={() => {
              setQ("");
              setCategory("all");
              setStyle("all");
              setSort("new");
            }}
          >
            Reset
          </button>
        </div>

        {state.loading ? <div>Loading...</div> : null}
        {state.error ? <div style={{ color: "#b91c1c" }}>{state.error}</div> : null}

        <div className="cb-grid">
          {filtered.map((x) => {
            const cover = x.assets?.[0]?.assetUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80";

            return (
              <div className="cb-card" key={x.id}>
                <div className="cb-img" style={{ backgroundImage: `url("${cover}")` }} />

                <div className="cb-cardBody">
                  <div className="cb-titleRow">
                    <div className="cb-cardTitle">{x.title}</div>
                    <div className="cb-price">
                      {x.estimatedCostMin && x.estimatedCostMax
                        ? `${x.currency || "RWF"} ${x.estimatedCostMin.toLocaleString()} – ${x.estimatedCostMax.toLocaleString()}`
                        : "Cost on request"}
                    </div>
                  </div>

                  <div className="cb-row">
                    <span className="cb-chip">{x.category}</span>
                    <span className="cb-chip">{x.floors} floor(s)</span>
                    <span className="cb-chip">{x.builtAreaM2} m²</span>
                    <span className={`cb-chip ${x.status === "APPROVED" ? "cb-success" : "cb-muted"}`}>
                      {x.status}
                    </span>
                  </div>

                  <div className="cb-muted">{x.style}</div>

                  <div className="cb-actions">
                    <Link className="cb-linkBtn cb-linkBtnPrimary" to={`/plans/${x.id}`}>
                      View Plan
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}