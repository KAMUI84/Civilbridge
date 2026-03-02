import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./catalog.css";
import { createPlan, getPlans, updatePlan } from "../../data/store";
import { getUser, isAuthed } from "../../store/authStore";

function fmtMoney(n, currency = "RWF") {
  if (typeof n !== "number") return "";
  return new Intl.NumberFormat(undefined).format(n) + " " + currency;
}
function canPost(role) {
  return role === "ADMIN" || role === "ENGINEER";
}

export default function PlansLibrary() {
  const [items, setItems] = useState(() => getPlans());
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("new"); // new | size | cost_low | cost_high
  const [onlyStamp, setOnlyStamp] = useState(false);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const user = getUser();
  const authed = isAuthed();
  const role = user?.role || "USER";

  const filtered = useMemo(() => {
    let list = [...items];

    if (category !== "all") list = list.filter((x) => x.category === category);

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((x) =>
        [x.title, x.category, x.locationFit, ...(x.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(s)
      );
    }

    if (onlyStamp) list = list.filter((x) => x.stampReady);

    if (sort === "new") list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (sort === "size") list.sort((a, b) => (b.size_m2 || 0) - (a.size_m2 || 0));
    if (sort === "cost_low") list.sort((a, b) => (a.est_cost_low || 0) - (b.est_cost_low || 0));
    if (sort === "cost_high") list.sort((a, b) => (b.est_cost_high || 0) - (a.est_cost_high || 0));

    return list;
  }, [items, q, category, sort, onlyStamp]);

  const onDone = () => {
    setItems(getPlans());
    setOpen(false);
    setEditId(null);
  };

  const stats = useMemo(() => {
    const total = items.length;
    const stamp = items.filter((x) => x.stampReady).length;
    return { total, stamp };
  }, [items]);

  return (
    <div className="cb-wrap">
      <div className="cb-container">
        <div className="cb-top">
          <div>
            <h1 className="cb-h1">Plans Library</h1>
            <p className="cb-sub">
              Pre-designed templates with realistic cost ranges. Engineers/Admin can publish plans now (MVP).
            </p>
          </div>

          <div className="cb-row">
            <span className="cb-chip">Plans: {stats.total}</span>
            <span className="cb-chip">Stamp-ready: {stats.stamp}</span>

            {authed && canPost(role) ? (
              <button className="cb-btn cb-btnPrimary" onClick={() => setOpen(true)}>
                + Publish Plan
              </button>
            ) : (
              <span className="cb-chip">Publish requires Admin/Engineer</span>
            )}
          </div>
        </div>

        <div className="cb-panel">
          <input
            className="cb-input"
            placeholder="Search plan title, tags, use case..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select className="cb-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Hospital">Hospital</option>
            <option value="Industrial">Industrial</option>
          </select>

          <select className="cb-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="size">Largest size</option>
            <option value="cost_low">Cost: Low → High</option>
            <option value="cost_high">Cost: High → Low</option>
          </select>

          <button className="cb-btn" onClick={() => setOnlyStamp((p) => !p)}>
            {onlyStamp ? "Stamp-ready only" : "Filter: Stamp-ready"}
          </button>

          <button
            className="cb-btn"
            onClick={() => {
              setQ("");
              setCategory("all");
              setSort("new");
              setOnlyStamp(false);
            }}
          >
            Reset
          </button>
        </div>

        <div className="cb-grid">
          {filtered.map((x) => {
            const cover = x.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80";

            return (
              <div className="cb-card" key={x.id}>
                <div className="cb-img" style={{ backgroundImage: `url("${cover}")` }} />

                <div className="cb-cardBody">
                  <div className="cb-titleRow">
                    <div className="cb-cardTitle">{x.title}</div>
                    <div className="cb-price">
                      {fmtMoney(x.est_cost_low, x.currency)} – {fmtMoney(x.est_cost_high, x.currency)}
                    </div>
                  </div>

                  <div className="cb-row">
                    <span className="cb-chip">{x.category}</span>
                    <span className="cb-chip">{x.floors} floor(s)</span>
                    <span className="cb-chip">{x.size_m2} m²</span>
                    {x.stampReady ? <span className="cb-chip">Stamp-ready</span> : <span className="cb-chip">Concept</span>}
                  </div>

                  <div className="cb-muted">{x.locationFit}</div>

                  <div className="cb-actions">
                    <Link className="cb-linkBtn cb-linkBtnPrimary" to={`/plans/${x.id}`}>
                      View Plan
                    </Link>

                    {authed && canPost(role) ? (
                      <button
                        className="cb-btn"
                        onClick={() => {
                          setEditId(x.id);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {open ? <PlanModal role={role} editId={editId} onClose={() => { setOpen(false); setEditId(null); }} onDone={onDone} /> : null}
      </div>
    </div>
  );
}

function PlanModal({ role, editId, onClose, onDone }) {
  const all = getPlans();
  const editing = editId ? all.find((x) => x.id === editId) : null;

  const [err, setErr] = useState("");
  const [category, setCategory] = useState(editing?.category || "Residential");
  const [title, setTitle] = useState(editing?.title || "");
  const [floors, setFloors] = useState(editing?.floors || 1);
  const [size, setSize] = useState(editing?.size_m2 || 0);
  const [low, setLow] = useState(editing?.est_cost_low || 0);
  const [high, setHigh] = useState(editing?.est_cost_high || 0);
  const [locationFit, setLocationFit] = useState(editing?.locationFit || "");
  const [stampReady, setStampReady] = useState(Boolean(editing?.stampReady));
  const [images, setImages] = useState((editing?.images || []).join("\n"));
  const [desc, setDesc] = useState(editing?.description || "");
  const [tags, setTags] = useState((editing?.tags || []).join(", "));

  const submit = (e) => {
    e.preventDefault();
    setErr("");

    if (!title.trim()) return setErr("Title is required.");
    if (!Number(size) || Number(size) <= 0) return setErr("Size must be a positive number.");
    if (!Number(low) || Number(low) <= 0) return setErr("Low cost must be positive.");
    if (!Number(high) || Number(high) <= 0) return setErr("High cost must be positive.");
    if (Number(high) < Number(low)) return setErr("High cost must be >= low cost.");

    const imgs = images.split("\n").map((s) => s.trim()).filter(Boolean);
    const tagList = tags.split(",").map((s) => s.trim()).filter(Boolean);

    const payload = {
      category,
      title: title.trim(),
      floors: Number(floors || 1),
      size_m2: Number(size),
      est_cost_low: Number(low),
      est_cost_high: Number(high),
      locationFit: locationFit.trim(),
      stampReady,
      images: imgs,
      description: desc.trim(),
      tags: tagList,
      postedByRole: role,
      files: editing?.files || [],
    };

    if (editing) updatePlan(editing.id, payload);
    else createPlan(payload);

    onDone();
  };

  return (
    <div className="cb-modalBackdrop" onMouseDown={onClose}>
      <div className="cb-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cb-modalHead">
          <div className="cb-modalTitle">{editing ? "Edit Plan" : "Publish New Plan"}</div>
          <button className="cb-btn" onClick={onClose}>✕</button>
        </div>

        <form className="cb-modalBody" onSubmit={submit}>
          {err ? <div className="cb-danger">{err}</div> : null}

          <div className="cb-formGrid">
            <label>
              <div className="cb-muted">Category</div>
              <select className="cb-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Hospital">Hospital</option>
                <option value="Industrial">Industrial</option>
              </select>
            </label>

            <label>
              <div className="cb-muted">Stamp-ready</div>
              <select className="cb-select" value={stampReady ? "yes" : "no"} onChange={(e) => setStampReady(e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No (Concept)</option>
              </select>
            </label>

            <label>
              <div className="cb-muted">Title</div>
              <input className="cb-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., 2BR Compact Modern" />
            </label>

            <label>
              <div className="cb-muted">Location fit</div>
              <input className="cb-input" value={locationFit} onChange={(e) => setLocationFit(e.target.value)} placeholder="Urban / Suburban / Main road..." />
            </label>

            <label>
              <div className="cb-muted">Floors</div>
              <input className="cb-input" value={floors} onChange={(e) => setFloors(e.target.value)} type="number" />
            </label>

            <label>
              <div className="cb-muted">Size (m²)</div>
              <input className="cb-input" value={size} onChange={(e) => setSize(e.target.value)} type="number" />
            </label>

            <label>
              <div className="cb-muted">Estimated cost (low)</div>
              <input className="cb-input" value={low} onChange={(e) => setLow(e.target.value)} type="number" />
            </label>

            <label>
              <div className="cb-muted">Estimated cost (high)</div>
              <input className="cb-input" value={high} onChange={(e) => setHigh(e.target.value)} type="number" />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              <div className="cb-muted">Image URLs (one per line)</div>
              <textarea className="cb-input cb-textarea" value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://..." />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              <div className="cb-muted">Tags (comma separated)</div>
              <input className="cb-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="popular, fast-build, roi" />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              <div className="cb-muted">Description</div>
              <textarea className="cb-input cb-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short realistic description..." />
            </label>
          </div>

          <div className="cb-row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="cb-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="cb-btn cb-btnPrimary">
              {editing ? "Save Changes" : "Publish Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}