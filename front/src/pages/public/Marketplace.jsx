import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const data = await api("/api/marketplace"); // <-- backend route
        if (!alive) return;
        setItems(data?.items || []);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load marketplace" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 18px" }}>
      <h1 style={{ margin: 0 }}>Marketplace</h1>
      <p style={{ color: "#64708a", fontWeight: 650 }}>
        Only uploaded listings will appear here.
      </p>

      {state.loading ? <div>Loading...</div> : null}
      {state.error ? <div style={{ color: "#b91c1c" }}>{state.error}</div> : null}

      {!state.loading && !state.error && items.length === 0 ? (
        <div style={{ padding: 18, border: "1px solid #eef0f4", borderRadius: 16 }}>
          No listings yet. (Admins/Engineers and property owners can upload.)
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 }}>
        {items.map((x) => (
          <Link
            key={x.id}
            to={`/marketplace/${x.id}`}
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
                height: 180,
                background: `url("${x.cover_url || ""}") center/cover no-repeat`,
                backgroundColor: "#f7f8fb",
              }}
            />
            <div style={{ padding: 14, display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 950 }}>{x.title}</div>
              <div style={{ color: "#64708a", fontWeight: 650, fontSize: 13 }}>
                {x.location || "—"} • {x.price ? `${x.price}` : "Price on request"}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 960px){
          div[style*="gridTemplateColumns: repeat(3, 1fr)"]{ grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}