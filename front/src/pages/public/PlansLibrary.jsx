import { useEffect, useMemo, useState } from "react";
import "./catalog.css";
import { api } from "../../services/apiClientService";
import PlanCard from "../../components/cards/PlanCard";
import SEO from "../../components/seo/SEO";
import { SkeletonGrid } from "../../components/common/Skeleton";

export default function PlansLibrary() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");       // maps to `category` API param
  const [tier, setTier] = useState("all");       // FREE | PRO | PREMIUM
  const [budget, setBudget] = useState("");       // max budget (client-side filter)
  const [sort, setSort] = useState("new");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const params = new URLSearchParams();
        if (type !== "all") params.set("category", type);
        if (tier !== "all") params.set("tier",     tier);
        if (q)              params.set("search",   q);
        const data = await api.get(`/api/plans?${params.toString()}`);
        if (!alive) return;
        setItems(data?.plans ?? []);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load plans" });
      }
    })();
    return () => { alive = false; };
  }, [type, tier, q]);

  const filtered = useMemo(() => {
    let list = [...items];

    // Client-side budget filter (max estimated cost)
    if (budget) {
      const max = Number(budget);
      if (!isNaN(max) && max > 0) {
        list = list.filter((p) => !p.estimatedCostMin || Number(p.estimatedCostMin) <= max);
      }
    }

    if (sort === "new")       list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "size")      list.sort((a, b) => (b.builtAreaM2 || 0) - (a.builtAreaM2 || 0));
    if (sort === "cost_low")  list.sort((a, b) => (a.estimatedCostMin || 0) - (b.estimatedCostMin || 0));
    if (sort === "cost_high") list.sort((a, b) => (b.estimatedCostMax || 0) - (a.estimatedCostMax || 0));
    return list;
  }, [items, sort, budget]);

  const stats = useMemo(() => ({
    total:    items.length,
    approved: items.filter((x) => x.status === "APPROVED").length,
  }), [items]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div className="cb-wrap">
        <SEO title="Plans Library" description="Browse pre-designed architectural plans for Rwanda." />
        <div className="cb-container">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state.error) {
    return (
      <div className="cb-wrap">
        <div className="cb-container">
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: "#b91c1c", fontWeight: 600, marginBottom: 8 }}>Failed to load plans</div>
            <div style={{ color: "#6b7280", marginBottom: 16 }}>{state.error}</div>
            <button
              className="cb-btn cb-btnPrimary"
              onClick={() => setState({ loading: true, error: "" })}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cb-wrap">
      <SEO
        title="Plans Library"
        description="Browse pre-designed architectural plans for Rwanda — residential, commercial, hospital, and industrial buildings with realistic cost ranges."
      />
      <div className="cb-container">
        <div className="cb-top">
          <div>
            <h1 className="cb-h1">Plans Library</h1>
            <p className="cb-sub">
              Pre-designed architectural templates with realistic cost ranges for browsing, review, and follow-up.
            </p>
          </div>

          <div className="cb-row">
            <span className="cb-chip">Plans: {stats.total}</span>
            <span className="cb-chip">Approved: {stats.approved}</span>
            <span className="cb-chip">Public library only</span>
          </div>
        </div>

        {/* Filters */}
        <div className="cb-panel">
          <input
            className="cb-input"
            placeholder="Search plans..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {/* Type (category) */}
          <select className="cb-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="INDUSTRIAL">Industrial</option>
          </select>

          {/* Tier */}
          <select className="cb-select" value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="all">All tiers</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
          </select>

          {/* Budget (max RWF) */}
          <input
            className="cb-input"
            type="number"
            placeholder="Max budget (RWF)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={{ maxWidth: 180 }}
          />

          {/* Sort */}
          <select className="cb-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="size">Largest size</option>
            <option value="cost_low">Cost: Low → High</option>
            <option value="cost_high">Cost: High → Low</option>
          </select>

          <button
            className="cb-btn"
            onClick={() => { setQ(""); setType("all"); setTier("all"); setBudget(""); setSort("new"); }}
          >
            Reset
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📐</div>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: "var(--color-text-primary)" }}>
              No plans match your filters
            </div>
            <div style={{ color: "#6b7280" }}>Try adjusting the type, tier, or budget</div>
          </div>
        )}

        {/* Grid */}
        <div className="cb-grid">
          {filtered.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
