import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listings } from "../../data/mockMarketplace";
import { KEYS, readLS, toggleInSet } from "../../utils/storage";

export default function Marketplace() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all"); // all | property | land
  const [sort, setSort] = useState("new"); // new | price_asc | price_desc
  const [favIds, setFavIds] = useState(() => readLS(KEYS.FAV_LISTINGS, []));

  useEffect(() => {
    const on = () => setFavIds(readLS(KEYS.FAV_LISTINGS, []));
    window.addEventListener("cb_ls_changed", on);
    return () => window.removeEventListener("cb_ls_changed", on);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let arr = listings.filter((x) => {
      const matchesType = type === "all" ? true : x.type === type;
      const matchesQ =
        !query ||
        x.title.toLowerCase().includes(query) ||
        x.location.toLowerCase().includes(query) ||
        (x.tags || []).join(" ").toLowerCase().includes(query);
      return matchesType && matchesQ;
    });

    if (sort === "price_asc") arr = [...arr].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") arr = [...arr].sort((a, b) => b.price - a.price);

    return arr;
  }, [q, type, sort]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34, color: "#0c1220" }}>Marketplace</h1>
          <p style={{ marginTop: 8, color: "#64708a", fontWeight: 650 }}>
            Verified properties and build-ready land. Save favorites and request visits.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by location, type, keyword..."
            style={inputStyle}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            <option value="all">All</option>
            <option value="property">Properties</option>
            <option value="land">Land</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
            <option value="new">Sort: Default</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>
      </div>

      <div style={gridStyle}>
        {filtered.map((x) => {
          const isFav = favIds.includes(x.id);
          return (
            <div key={x.id} style={cardStyle}>
              <div
                style={{
                  height: 180,
                  borderRadius: 16,
                  backgroundImage: `url("${x.images[0]}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: "1px solid #eef0f4",
                }}
              />
              <div style={{ padding: 14, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 950, color: "#0c1220" }}>{x.title}</div>
                  <button
                    onClick={() => setFavIds(toggleInSet(KEYS.FAV_LISTINGS, x.id))}
                    style={{
                      border: "1px solid #eef0f4",
                      background: "#fff",
                      borderRadius: 12,
                      padding: "8px 10px",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                    title="Save"
                  >
                    {isFav ? "★" : "☆"}
                  </button>
                </div>

                <div style={{ color: "#64708a", fontWeight: 700 }}>{x.location}</div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={pill}>{x.type === "land" ? "Land" : "Property"}</span>
                  <span style={pill}>{x.sizeM2} m²</span>
                  <span style={pill}>{x.status}</span>
                </div>

                <div style={{ fontWeight: 950, color: "#0c1220" }}>
                  {formatMoney(x.price)} {x.currency}
                </div>

                <Link to={`/marketplace/${x.id}`} style={btnPrimary}>
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, color: "#64708a", fontWeight: 650 }}>
        Favorites saved: <b style={{ color: "#0c1220" }}>{favIds.length}</b>
      </div>
    </div>
  );
}

function formatMoney(n) {
  return new Intl.NumberFormat().format(n);
}

const inputStyle = {
  minWidth: 280,
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
  overflow: "hidden",
  boxShadow: "0 14px 40px rgba(12,18,32,.06)",
};

const pill = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #eef0f4",
  background: "linear-gradient(135deg,#ffffff,#f7f9ff)",
  fontWeight: 800,
  fontSize: 12,
  color: "#0c1220",
};

const btnPrimary = {
  textDecoration: "none",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "12px 12px",
  borderRadius: 14,
  color: "#fff",
  fontWeight: 950,
  background: "linear-gradient(135deg,#2a66ff,#1d4ed8)",
  border: "1px solid rgba(29,78,216,0.2)",
  boxShadow: "0 14px 26px rgba(29,78,216,.18)",
};