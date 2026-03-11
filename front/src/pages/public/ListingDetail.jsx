import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../services/apiClientService";
import { useAuth } from "../../context/AuthContext";

export default function ListingDetail() {
  const { id } = useParams();
  const { isAuthed, user } = useAuth();
  const [listing, setListing] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const data = await api.get(`/api/listings/${id}`);
        if (!alive) return;
        setListing(data);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load listing" });
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/api/listings/${id}/lead`, contactForm);
      alert("Your message has been sent to the seller.");
      setContactForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      alert(err.message || "Failed to send message.");
    }
    setSubmitting(false);
  };

  if (state.loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (state.error) return <div style={{ padding: 40, textAlign: "center", color: "#b91c1c" }}>{state.error}</div>;
  if (!listing) return <div style={{ padding: 40, textAlign: "center" }}>Listing not found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "26px 18px" }}>
      <Link to="/marketplace" style={{ color: "#00f2ff", textDecoration: "none", fontWeight: 600 }}>
        ← Back to Marketplace
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, marginTop: 24 }}>
        {/* Left: Images and details */}
        <div>
          {/* Image carousel */}
          <div style={{ borderRadius: 16, overflow: "hidden", background: "#f7f8fb", height: 400 }}>
            {listing.images?.length ? (
              <img
                src={listing.images[0].imageUrl}
                alt={listing.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64708a" }}>
                No images
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images?.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {listing.images.map((img, idx) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                />
              ))}
            </div>
          )}

          {/* Details */}
          <div style={{ marginTop: 32 }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>{listing.title}</h1>
            <div style={{ fontSize: 20, color: "#00f2ff", fontWeight: 700, marginTop: 8 }}>
              {listing.price ? `${listing.currency} ${listing.price.toLocaleString()}` : "Price on request"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 24 }}>
              <div>
                <div style={{ color: "#64708a", fontSize: 14, fontWeight: 600 }}>Type</div>
                <div>{listing.listingType}</div>
              </div>
              <div>
                <div style={{ color: "#64708b", fontSize: 14, fontWeight: 600 }}>Region</div>
                <div>{listing.region?.name || "—"}</div>
              </div>
              {listing.sizeM2 && (
                <div>
                  <div style={{ color: "#64708b", fontSize: 14, fontWeight: 600 }}>Size</div>
                  <div>{listing.sizeM2} m²</div>
                </div>
              )}
              {listing.bedrooms && (
                <div>
                  <div style={{ color: "#64708b", fontSize: 14, fontWeight: 600 }}>Bedrooms</div>
                  <div>{listing.bedrooms}</div>
                </div>
              )}
              {listing.bathrooms && (
                <div>
                  <div style={{ color: "#64708b", fontSize: 14, fontWeight: 600 }}>Bathrooms</div>
                  <div>{listing.bathrooms}</div>
                </div>
              )}
              {listing.locationText && (
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ color: "#64708b", fontSize: 14, fontWeight: 600 }}>Location</div>
                  <div>{listing.locationText}</div>
                </div>
              )}
            </div>

            {listing.description && (
              <div style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Description</h2>
                <p style={{ lineHeight: 1.6, color: "#374151" }}>{listing.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Contact and seller info */}
        <div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Contact Seller</h3>
            <form onSubmit={handleContactSubmit}>
              <input
                type="text"
                placeholder="Your name"
                value={contactForm.name}
                onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6, marginBottom: 12 }}
              />
              <input
                type="email"
                placeholder="Your email"
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6, marginBottom: 12 }}
              />
              <input
                type="tel"
                placeholder="Your phone"
                value={contactForm.phone}
                onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6, marginBottom: 12 }}
              />
              <textarea
                placeholder="Message (optional)"
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6, marginBottom: 12, resize: "vertical" }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#00f2ff",
                  color: "#050505",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: "#f9fafb", borderRadius: 12 }}>
            <div style={{ fontSize: 14, color: "#64708b", fontWeight: 600 }}>Listed by</div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>{listing.owner?.fullName || "Anonymous"}</div>
            <div style={{ fontSize: 12, color: "#64708b", marginTop: 4 }}>
              Status: <span style={{ color: listing.status === "ACTIVE" ? "#22c55e" : "#f59e0b", fontWeight: 600 }}>{listing.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
