import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./catalog.css";
import { createListing, getListings, updateListing } from "../../data/store";
import { getUser, isAuthed } from "../../store/userStore";

function fmtMoney(n, currency = "RWF") {
  if (typeof n !== "number") return "";
  return new Intl.NumberFormat(undefined).format(n) + " " + currency;
}

function canPost(role) {
  return role === "ADMIN" || role === "ENGINEER";
}

export default function Marketplace() {
  const [items, setItems] = useState(() => getListings());
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all"); // all | property | land
  const [sort, setSort] = useState("new"); // new | price_low | price_high
  const [onlyFav, setOnlyFav] = useState(false);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const user = getUser();
  const authed = isAuthed();
  const role = user?.role || "USER";

  // favorites
  const [fav, setFav] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cb_fav_listings") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cb_fav_listings", JSON.stringify(fav));
  }, [fav]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (kind !== "all") list = list.filter((x) => x.kind === kind);

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((x) =>
        [x.title, x.location, x.kind, x.status, ...(x.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(s)
      );
    }

    if (onlyFav) list = list.filter((x) => fav.includes(x.id));

    if (sort === "new") list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (sort === "price_low") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price_high") list.sort((a, b) => (b.price || 0) - (a.price || 0));

    return list;
  }, [items, q, kind, sort, onlyFav, fav]);

  const stats = useMemo(() => {
    const total = items.length;
    const props = items.filter((x) => x.kind === "property").length;
    const land = items.filter((x) => x.kind === "land").length;
    return { total, props, land };
  }, [items]);

  const toggleFav = (id) => {
    setFav((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  };

  const onCreatedOrUpdated = () => {
    setItems(getListings());
    setOpen(false);
    setEditId(null);
  };

  return (
    <div className="cb-wrap">
      <div className="cb-container">
        <div className="cb-top">
          <div>
            <h1 className="cb-h1">Marketplace</h1>
            <p className="cb-sub">
              Verified listings for properties and build-ready plots. Save favorites, open details, and request visits.
            </p>
          </div>

          <div className="cb-row">
            <span className="cb-chip">Total: {stats.total}</span>
            <span className="cb-chip">Properties: {stats.props}</span>
            <span className="cb-chip">Land: {stats.land}</span>

            {authed && canPost(role) ? (
              <button className="cb-btn cb-btnPrimary" onClick={() => setOpen(true)}>
                + Post Listing
              </button>
            ) : (
              <span className="cb-chip">
                Post requires Admin/Engineer
              </span>
            )}
          </div>
        </div>

        <div className="cb-panel">
          <input
            className="cb-input"
            placeholder="Search location, title, tags..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select className="cb-select" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All types</option>
            <option value="property">Property</option>
            <option value="land">Land</option>
          </select>

          <select className="cb-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
          </select>

          <button className="cb-btn" onClick={() => setOnlyFav((p) => !p)}>
            {onlyFav ? "Showing Favorites" : "Show Favorites"}
          </button>

          <button
            className="cb-btn"
            onClick={() => {
              setQ("");
              setKind("all");
              setSort("new");
              setOnlyFav(false);
            }}
          >
            Reset
          </button>
        </div>

        <div className="cb-grid">
          {filtered.map((x) => {
            const cover = x.images?.[0] || "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&w=2000&q=80";
            const isFav = fav.includes(x.id);

            return (
              <div className="cb-card" key={x.id}>
                <div className="cb-img" style={{ backgroundImage: `url("${cover}")` }} />
                <div className="cb-cardBody">
                  <div className="cb-titleRow">
                    <div className="cb-cardTitle">{x.title}</div>
                    <div className="cb-price">{fmtMoney(x.price, x.currency)}</div>
                  </div>

                  <div className="cb-row">
                    <span className="cb-chip">{x.kind === "land" ? "Land" : "Property"}</span>
                    <span className="cb-chip">{x.status || "Available"}</span>
                    {x.tags?.slice(0, 2)?.map((t) => (
                      <span key={t} className="cb-chip">{t}</span>
                    ))}
                  </div>

                  <div className="cb-muted">{x.location}</div>

                  <div className="cb-row">
                    {x.kind === "property" ? (
                      <>
                        <span className="cb-muted">{x.bedrooms || 0} bed</span>
                        <span className="cb-muted">{x.bathrooms || 0} bath</span>
                        <span className="cb-muted">{x.size_m2} m²</span>
                      </>
                    ) : (
                      <span className="cb-muted">{x.size_m2} m² plot</span>
                    )}
                  </div>

                  <div className="cb-actions">
                    <Link className="cb-linkBtn cb-linkBtnPrimary" to={`/marketplace/${x.id}`}>
                      View Details
                    </Link>

                    <button className="cb-btn" onClick={() => toggleFav(x.id)}>
                      {isFav ? "★ Saved" : "☆ Save"}
                    </button>

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

        {open ? (
          <ListingModal
            role={role}
            editId={editId}
            onClose={() => {
              setOpen(false);
              setEditId(null);
            }}
            onDone={onCreatedOrUpdated}
          />
        ) : null}
      </div>
    </div>
  );
}

function ListingModal({ role, editId, onClose, onDone }) {
  const all = getListings();
  const editing = editId ? all.find((x) => x.id === editId) : null;

  const [err, setErr] = useState("");
  const [kind, setKind] = useState(editing?.kind || "property");
  const [title, setTitle] = useState(editing?.title || "");
  const [location, setLocation] = useState(editing?.location || "");
  const [price, setPrice] = useState(editing?.price || 0);
  const [size, setSize] = useState(editing?.size_m2 || 0);
  const [beds, setBeds] = useState(editing?.bedrooms || 0);
  const [baths, setBaths] = useState(editing?.bathrooms || 0);
  const [status, setStatus] = useState(editing?.status || "Available");
  const [images, setImages] = useState((editing?.images || []).join("\n"));
  const [desc, setDesc] = useState(editing?.description || "");
  const [tags, setTags] = useState((editing?.tags || []).join(", "));

  const submit = (e) => {
    e.preventDefault();
    setErr("");

    if (!title.trim() || !location.trim()) return setErr("Title and location are required.");
    if (!Number(price) || Number(price) <= 0) return setErr("Price must be a positive number.");
    if (!Number(size) || Number(size) <= 0) return setErr("Size must be a positive number.");

    const imgs = images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tagList = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      kind,
      title: title.trim(),
      location: location.trim(),
      price: Number(price),
      size_m2: Number(size),
      bedrooms: kind === "property" ? Number(beds || 0) : null,
      bathrooms: kind === "property" ? Number(baths || 0) : null,
      status,
      images: imgs,
      description: desc.trim(),
      tags: tagList,
      postedByRole: role,
      contact: { name: "CivilBridge", phone: "+250 7xx xxx xxx", email: "sales@civilbridge.local" },
    };

    if (editing) updateListing(editing.id, payload);
    else createListing(payload);

    onDone();
  };

  return (
    <div className="cb-modalBackdrop" onMouseDown={onClose}>
      <div className="cb-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cb-modalHead">
          <div className="cb-modalTitle">{editing ? "Edit Listing" : "Post New Listing"}</div>
          <button className="cb-btn" onClick={onClose}>✕</button>
        </div>

        <form className="cb-modalBody" onSubmit={submit}>
          {err ? <div className="cb-danger">{err}</div> : null}

          <div className="cb-formGrid">
            <label>
              <div className="cb-muted">Type</div>
              <select className="cb-select" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="property">Property</option>
                <option value="land">Land</option>
              </select>
            </label>

            <label>
              <div className="cb-muted">Status</div>
              <select className="cb-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </label>

            <label>
              <div className="cb-muted">Title</div>
              <input className="cb-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Modern 3BR House" />
            </label>

            <label>
              <div className="cb-muted">Location</div>
              <input className="cb-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Kigali, Gasabo" />
            </label>

            <label>
              <div className="cb-muted">Price (RWF)</div>
              <input className="cb-input" value={price} onChange={(e) => setPrice(e.target.value)} type="number" />
            </label>

            <label>
              <div className="cb-muted">{kind === "land" ? "Plot size (m²)" : "Size (m²)"}</div>
              <input className="cb-input" value={size} onChange={(e) => setSize(e.target.value)} type="number" />
            </label>

            {kind === "property" ? (
              <>
                <label>
                  <div className="cb-muted">Bedrooms</div>
                  <input className="cb-input" value={beds} onChange={(e) => setBeds(e.target.value)} type="number" />
                </label>
                <label>
                  <div className="cb-muted">Bathrooms</div>
                  <input className="cb-input" value={baths} onChange={(e) => setBaths(e.target.value)} type="number" />
                </label>
              </>
            ) : null}

            <label style={{ gridColumn: "1 / -1" }}>
              <div className="cb-muted">Image URLs (one per line)</div>
              <textarea className="cb-input cb-textarea" value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://..." />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              <div className="cb-muted">Tags (comma separated)</div>
              <input className="cb-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="verified, site-visit, popular" />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              <div className="cb-muted">Description</div>
              <textarea className="cb-input cb-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short realistic description..." />
            </label>
          </div>

          <div className="cb-row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="cb-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="cb-btn cb-btnPrimary">
              {editing ? "Save Changes" : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}