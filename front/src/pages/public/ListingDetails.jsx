import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../utils/api";

export default function ListingDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const data = await api(`/api/marketplace/${id}`);
        if (!alive) return;
        setItem(data?.item || null);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load listing" });
      }
    })();
    return () => (alive = false);
  }, [id]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 18px" }}>
      <Link to="/marketplace" style={{ textDecoration: "none", fontWeight: 900 }}>
        ← Back
      </Link>

      {state.loading ? <div style={{ marginTop: 12 }}>Loading...</div> : null}
      {state.error ? <div style={{ marginTop: 12, color: "#b91c1c" }}>{state.error}</div> : null}

      {!state.loading && !state.error && !item ? (
        <div style={{ marginTop: 12 }}>Not found.</div>
      ) : null}

      {item ? (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <div
            style={{
              height: 360,
              borderRadius: 18,
              border: "1px solid #eef0f4",
              background: `url("${item.cover_url || ""}") center/cover no-repeat`,
              backgroundColor: "#f7f8fb",
            }}
          />
          <h1 style={{ margin: 0 }}>{item.title}</h1>
          <div style={{ color: "#64708a", fontWeight: 650 }}>
            {item.location || "—"} • {item.price ? `${item.price}` : "Price on request"}
          </div>
          <div style={{ lineHeight: 1.7 }}>{item.description || "No description yet."}</div>
        </div>
      ) : null}
    </div>
  );
}