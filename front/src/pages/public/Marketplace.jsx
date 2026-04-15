import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/apiClientService";
import SEO from "../../components/seo/SEO";
import { SkeletonGrid } from "../../components/common/Skeleton";

const PROVINCE_IDS = {
  "": "",
  "Kigali":   "1",
  "Northern": "2",
  "Southern": "3",
  "Eastern":  "4",
  "Western":  "5",
};

const RWANDA_DISTRICTS = {
  Kigali: ["Gasabo", "Kicukiro", "Nyarugenge"],
  Northern: ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  Southern: ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
  Eastern: ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
  Western: ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"],
};

const PRICE_RANGES = [
  { value: "", label: "Any price" },
  { value: "UNDER_20M", label: "Under 20M RWF", min: 0, max: 20000000 },
  { value: "20M_50M", label: "20M - 50M RWF", min: 20000000, max: 50000000 },
  { value: "50M_100M", label: "50M - 100M RWF", min: 50000000, max: 100000000 },
  { value: "100M_250M", label: "100M - 250M RWF", min: 100000000, max: 250000000 },
  { value: "ABOVE_250M", label: "Above 250M RWF", min: 250000000, max: Number.POSITIVE_INFINITY },
];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [type,     setType]     = useState("");
  const [province, setProvince] = useState("");   // human-readable → maps to regionId
  const [district, setDistrict] = useState("");
  const [search,   setSearch]   = useState("");
  const [priceRange, setPriceRange] = useState("");
  const availableDistricts = useMemo(() => (province ? RWANDA_DISTRICTS[province] || [] : []), [province]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const params = new URLSearchParams();
        if (type)                         params.set("type",   type);
        if (province && PROVINCE_IDS[province]) params.set("region", PROVINCE_IDS[province]);
        if (search)                       params.set("search", search);
        const data = await api.get(`/api/listings?${params.toString()}`);
        if (!alive) return;
        setListings(data?.listings ?? []);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load listings" });
      }
    })();
    return () => { alive = false; };
  }, [type, province, search]);

  // Client-side filters: district + price range
  const filtered = useMemo(() => {
    let list = [...listings];
    if (district) {
      const d = district.toLowerCase();
      list = list.filter((l) => l.locationText?.toLowerCase().includes(d));
    }
    if (priceRange) {
      const activeRange = PRICE_RANGES.find((range) => range.value === priceRange);
      if (activeRange) {
        list = list.filter((l) => {
          if (l.price == null) return false;
          const amount = Number(l.price);
          return amount >= activeRange.min && amount <= activeRange.max;
        });
      }
    }
    return list;
  }, [district, listings, priceRange]);

  const inputStyle = {
    padding: "9px 12px",
    border: "1px solid #e6ecf4",
    borderRadius: 10,
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 13,
    boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px" }}>
        <SEO title="Marketplace" description="Browse property and land listings across Rwanda." />
        <SkeletonGrid count={6} />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (state.error) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px", color: "#0f172a" }}>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>Failed to load listings</div>
          <div style={{ color: "#64748b", marginBottom: 16 }}>{state.error}</div>
          <button
            onClick={() => setState({ loading: true, error: "" })}
            style={{ padding: "8px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 18px", background: "#ffffff" }}>
      <SEO
        title="Marketplace"
        description="Browse property and land listings across Rwanda. Find residential, commercial, and industrial properties in Kigali and all provinces."
      />
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, color: "#0f172a", fontSize: 28, fontWeight: 800 }}>Marketplace</h1>
          <p style={{ color: "#64748b", fontWeight: 650 }}>
            Browse property and land listings across Rwanda.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: 180 }}
        />
        <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
          <option value="">All types</option>
          <option value="PROPERTY">Property</option>
          <option value="LAND">Land</option>
        </select>
        {/* Province (maps to regionId) */}
        <select value={province} onChange={e => { setProvince(e.target.value); setDistrict(""); }} style={inputStyle}>
          <option value="">All provinces</option>
          <option value="Kigali">Kigali</option>
          <option value="Northern">Northern</option>
          <option value="Southern">Southern</option>
          <option value="Eastern">Eastern</option>
          <option value="Western">Western</option>
        </select>
        <select value={district} onChange={e => setDistrict(e.target.value)} style={{ ...inputStyle, minWidth: 160 }} disabled={!province}>
          <option value="">{province ? "All districts" : "Select province first"}</option>
          {availableDistricts.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={priceRange} onChange={e => setPriceRange(e.target.value)} style={{ ...inputStyle, minWidth: 170 }}>
          {PRICE_RANGES.map((range) => <option key={range.value || "ANY"} value={range.value}>{range.label}</option>)}
        </select>
        <button
          onClick={() => { setType(""); setProvince(""); setDistrict(""); setSearch(""); setPriceRange(""); }}
          style={{ padding: "9px 14px", background: "#ffffff", color: "#0f172a", border: "1px solid #e6ecf4", borderRadius: 10, cursor: "pointer", fontSize: 13, boxShadow: "0 6px 16px rgba(15,23,42,0.04)" }}
        >
          Clear
        </button>
      </div>

      {/* Result count */}
      {filtered.length > 0 && (
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ padding: 24, border: "1px solid #e8eef5", borderRadius: 16, background: "#ffffff", color: "#0f172a", textAlign: "center", boxShadow: "0 12px 30px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏠</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No listings found</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>
            Adjust your filters or check back later for new listings.
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.map((listing) => (
          <Link
            key={listing.id}
            to={`/marketplace/${listing.id}`}
            style={{ textDecoration: "none", border: "1px solid #e8eef5", borderRadius: 16, overflow: "hidden", background: "#ffffff", color: "#0f172a", boxShadow: "0 12px 28px rgba(15,23,42,0.05)" }}
          >
            {listing.images?.[0]?.imageUrl ? (
              <div
                style={{
                  height: 200,
                  background: `url("${listing.images[0].imageUrl}") center/cover no-repeat`,
                  backgroundColor: "#000000",
                }}
              />
            ) : (
              <div
                style={{
                  height: 200,
                  background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(248,251,255,1))",
                  display: "grid",
                  placeItems: "center",
                  color: "#2563eb",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                {listing.title || "Listing"}
              </div>
            )}
            <div style={{ padding: 16, display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{listing.title}</div>
              <div style={{ color: "#64748b", fontWeight: 500, fontSize: 14 }}>
                {listing.region?.name || listing.locationText || "—"}
                {listing.price
                  ? ` · ${listing.currency || "RWF"} ${Number(listing.price).toLocaleString()}`
                  : " · Price on request"}
              </div>
              {listing.sizeM2 && (
                <div style={{ color: "#64748b", fontSize: 13 }}>Size: {listing.sizeM2} m²</div>
              )}
              <div style={{ fontSize: 12, color: listing.status === "ACTIVE" ? "#22c55e" : "#f59e0b", fontWeight: 600 }}>
                {listing.status}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
