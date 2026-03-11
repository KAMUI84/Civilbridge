import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/apiClientService";
import { useAuth } from "../../context/AuthContext";

export default function Marketplace() {
  const { user, isAuthed } = useAuth();
  const [listings, setListings] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [filters, setFilters] = useState({ type: "", region: "", search: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const query = new URLSearchParams(Object.entries(filters).filter(([,,v]) => v)).toString();
        const data = await api.get(`/api/listings?${query}`);
        if (!alive) return;
        setListings(data?.listings || []);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load listings" });
      }
    })();
    return () => { alive = false; };
  }, [filters]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Marketplace</h1>
          <p style={{ color: "#64708a", fontWeight: 650 }}>
            Browse property and land listings across Rwanda.
          </p>
        </div>
        {isAuthed && (
          <Link
            to="/dashboard/listings/new"
            style={{
              textDecoration: "none",
              background: "#00f2ff",
              color: "#050505",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            + Create Listing
          </Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search listings..."
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
        />
        <select
          value={filters.type}
          onChange={e => setFilters({ ...filters, type: e.target.value })}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
        >
          <option value="">All Types</option>
          <option value="PROPERTY">Property</option>
          <option value="LAND">Land</option>
        </select>
        <select
          value={filters.region}
          onChange={e => setFilters({ ...filters, region: e.target.value })}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6 }}
        >
          <option value="">All Regions</option>
          <option value="1">Kigali</option>
          <option value="2">Northern</option>
          <option value="3">Southern</option>
          <option value="4">Eastern</option>
          <option value="5">Western</option>
        </select>
      </div>

      {state.loading ? <div>Loading...</div> : null}
      {state.error ? <div style={{ color: "#b91c1c" }}>{state.error}</div> : null}

      {!state.loading && !state.error && listings.length === 0 ? (
        <div style={{ padding: 18, border: "1px solid #eef0f4", borderRadius: 16 }}>
          No listings found. {isAuthed ? "Create your first listing!" : "Sign in to create a listing."}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {listings.map((listing) => (
          <Link
            key={listing.id}
            to={`/marketplace/${listing.id}`}
            style={{
              textDecoration: "none",
              border: "1px solid #eef0f4",
              borderRadius: 16,
              overflow: "hidden",
              background: "#fff",
              color: "#0c1220",
            }}
          >
            <div
              style={{
                height: 200,
                background: `url("${listing.images?.[0]?.imageUrl || "/placeholder.jpg"}") center/cover no-repeat`,
                backgroundColor: "#f7f8fb",
              }}
            />
            <div style={{ padding: 16, display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{listing.title}</div>
              <div style={{ color: "#64708a", fontWeight: 500, fontSize: 14 }}>
                {listing.region?.name || "—"} • {listing.price ? `${listing.currency} ${listing.price.toLocaleString()}` : "Price on request"}
              </div>
              {listing.sizeM2 && (
                <div style={{ color: "#64708a", fontSize: 13 }}>
                  Size: {listing.sizeM2} m²
                </div>
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