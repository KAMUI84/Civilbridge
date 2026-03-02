import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listings } from "../../data/mockMarketplace";
import { KEYS, readLS, toggleInSet, writeLS } from "../../utils/storage";

export default function ListingDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const listing = useMemo(() => listings.find((x) => x.id === id), [id]);
  const [activeImg, setActiveImg] = useState(0);

  const [favIds, setFavIds] = useState(() => readLS(KEYS.FAV_LISTINGS, []));
  const isFav = favIds.includes(id);

  const [visit, setVisit] = useState({ name: "", phone: "", note: "" });

  const similar = useMemo(() => {
    if (!listing) return [];
    return listings
      .filter((x) => x.id !== listing.id && x.type === listing.type)
      .slice(0, 3);
  }, [listing]);

  if (!listing) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <h1 style={{ margin: 0, color: "#0c1220" }}>Listing not found</h1>
        <p style={{ color: "#64708a", fontWeight: 650 }}>
          This listing may have been removed.
        </p>
        <Link to="/marketplace" style={btnGhost}>Back to Marketplace</Link>
      </div>
    );
  }

  const startProject = () => {
    const draft = {
      id: "PRJ-" + Date.now(),
      createdAt: new Date().toISOString(),
      source: "marketplace",
      listingId: listing.id,
      title: listing.type === "land" ? `Project on ${listing.title}` : `Renovate/Manage ${listing.title}`,
      location: listing.location,
      status: "Draft",
      notes: "",
      planId: null,
      estimateId: null,
    };

    const prev = readLS(KEYS.PROJECT_DRAFTS, []);
    writeLS(KEYS.PROJECT_DRAFTS, [draft, ...prev].slice(0, 30));

    alert("Project draft created (saved locally).");
    nav("/dashboard");
  };

  const submitVisit = () => {
    if (!visit.name || !visit.phone) {
      alert("Please enter your name and phone.");
      return;
    }

    const payload = {
      id: "LEAD-" + Date.now(),
      createdAt: new Date().toISOString(),
      kind: "visit_request",
      listingId: listing.id,
      listingTitle: listing.title,
      location: listing.location,
      ...visit,
    };

    const prev = readLS(KEYS.LEADS, []);
    writeLS(KEYS.LEADS, [payload, ...prev].slice(0, 50));

    setVisit({ name: "", phone: "", note: "" });
    alert("Visit request sent (saved locally for now). We’ll wire backend later.");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px 40px" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/marketplace" style={crumb}>Marketplace</Link>
        <span style={{ color: "#94a3b8" }}>→</span>
        <span style={{ color: "#0c1220", fontWeight: 900 }}>{listing.title}</span>
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 12 }}>
        {/* Left: Gallery */}
        <div style={box}>
          <div
            style={{
              height: 420,
              borderRadius: 18,
              border: "1px solid #eef0f4",
              backgroundImage: `url("${listing.images[Math.min(activeImg, listing.images.length - 1)]}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            {listing.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImg(i)}
                style={{
                  width: 92,
                  height: 64,
                  borderRadius: 14,
                  border: i === activeImg ? "2px solid #1d4ed8" : "1px solid #eef0f4",
                  backgroundImage: `url("${src}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: "pointer",
                }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pill}>{listing.type === "land" ? "Land" : "Property"}</span>
            <span style={pill}>{listing.sizeM2} m²</span>
            <span style={pill}>{listing.status}</span>
            {(listing.tags || []).slice(0, 3).map((t) => (
              <span key={t} style={pillSoft}>{t}</span>
            ))}
          </div>

          <div style={{ height: 12 }} />

          <div style={{ color: "#64708a", fontWeight: 750 }}>{listing.location}</div>
          <h1 style={{ margin: "8px 0 0", color: "#0c1220", fontSize: 28 }}>{listing.title}</h1>

          <div style={{ marginTop: 8, fontWeight: 950, color: "#0c1220", fontSize: 18 }}>
            {money(listing.price)} {listing.currency}
          </div>

          <div style={{ marginTop: 12, color: "#3a4357", fontWeight: 650, lineHeight: 1.6 }}>
            {listing.desc}
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "grid", gap: 12 }}>
          <div style={box}>
            <div style={{ fontWeight: 950, color: "#0c1220" }}>Quick actions</div>

            <div style={{ height: 12 }} />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setFavIds(toggleInSet(KEYS.FAV_LISTINGS, listing.id))}
                style={btnGhost}
              >
                {isFav ? "★ Saved" : "☆ Save"}
              </button>

              <button onClick={startProject} style={btnPrimary}>
                Start Project
              </button>
            </div>

            <div style={{ height: 12 }} />

            <div style={{ color: "#64708a", fontWeight: 650 }}>
              Starting a project creates a draft in your dashboard (we’ll connect it later).
            </div>
          </div>

          <div style={box}>
            <div style={{ fontWeight: 950, color: "#0c1220" }}>Request a visit</div>
            <p style={{ marginTop: 8, color: "#64708a", fontWeight: 650 }}>
              Leave your contact. We’ll store it for now and later connect to backend.
            </p>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                style={input}
                placeholder="Your name"
                value={visit.name}
                onChange={(e) => setVisit({ ...visit, name: e.target.value })}
              />
              <input
                style={input}
                placeholder="Phone (+250...)"
                value={visit.phone}
                onChange={(e) => setVisit({ ...visit, phone: e.target.value })}
              />
              <textarea
                style={{ ...input, minHeight: 90 }}
                placeholder="Optional note (time, questions, location details...)"
                value={visit.note}
                onChange={(e) => setVisit({ ...visit, note: e.target.value })}
              />
              <button onClick={submitVisit} style={btnPrimary}>Send Request</button>
            </div>
          </div>

          <div style={box}>
            <div style={{ fontWeight: 950, color: "#0c1220" }}>Helpful next steps</div>
            <div style={{ height: 10 }} />
            <div style={{ display: "grid", gap: 10 }}>
              <Link to="/estimator" style={btnGhost}>Estimate costs for this project</Link>
              <Link to="/plans" style={btnGhost}>Browse plans that fit this listing</Link>
              <Link to="/experts" style={btnGhost}>Contact experts for advice</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Similar */}
      {similar.length ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 950, color: "#0c1220", fontSize: 18 }}>Similar listings</div>
          <div style={{ height: 10 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {similar.map((x) => (
              <Link
                key={x.id}
                to={`/marketplace/${x.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #eef0f4",
                  borderRadius: 18,
                  background: "#fff",
                  overflow: "hidden",
                  boxShadow: "0 14px 40px rgba(12,18,32,.06)",
                }}
              >
                <div
                  style={{
                    height: 140,
                    backgroundImage: `url("${x.images[0]}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 950, color: "#0c1220" }}>{x.title}</div>
                  <div style={{ color: "#64708a", fontWeight: 700, marginTop: 6 }}>{x.location}</div>
                  <div style={{ color: "#0c1220", fontWeight: 950, marginTop: 8 }}>
                    {money(x.price)} {x.currency}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ height: 12 }} />
      <div style={{ color: "#64708a", fontWeight: 650 }}>
        Note: this is MVP demo data. Backend will replace it later.
      </div>

      {/* simple responsive tweak */}
      <style>{`
        @media (max-width: 980px){
          .cb-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const money = (n) => new Intl.NumberFormat().format(n);

const box = {
  border: "1px solid #eef0f4",
  borderRadius: 18,
  background: "#fff",
  padding: 16,
  boxShadow: "0 14px 40px rgba(12,18,32,.06)",
};

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  outline: "none",
  fontWeight: 750,
};

const pill = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #eef0f4",
  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
  fontWeight: 900,
  fontSize: 12,
  color: "#0c1220",
};

const pillSoft = {
  ...pill,
  color: "#3a4357",
  fontWeight: 800,
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
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #eef0f4",
  background: "#fff",
  color: "#0c1220",
  fontWeight: 950,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const crumb = {
  textDecoration: "none",
  color: "#64708a",
  fontWeight: 800,
};