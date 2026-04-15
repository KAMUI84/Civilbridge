import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../services/apiClientService";
import { useAuth } from "../../context/useAuth";
import SEO from "../../components/seo/SEO";
import { listingsService } from "../../services/listingsService";

const STATUS_COLOR = { ACTIVE: "#22c55e", RESERVED: "#f59e0b", SOLD: "#ef4444" };

export default function ListingDetail() {
  const { id } = useParams();
  const { isAuthed, user } = useAuth();

  const [listing, setListing] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });
  const [activeImg, setActiveImg] = useState(0);

  // Inquiry form — pre-fill from auth user when available
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", requestType: "SCHEDULE_VISIT" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState({ type: "", text: "" });
  const [inquiryDone, setInquiryDone] = useState(false);

  // Load listing
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

  // Pre-fill form when user is known
  useEffect(() => {
    if (isAuthed && user) {
      setForm((prev) => ({
        ...prev,
        name:  prev.name  || user.fullName  || "",
        email: prev.email || user.email     || "",
        phone: prev.phone || user.phone     || "",
      }));
    }
  }, [isAuthed, user]);

  const images = listing?.images || [];

  const prevImg = () => setActiveImg((p) => (p - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((p) => (p + 1) % images.length);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg({ type: "", text: "" });
    try {
      const response = await listingsService.inquire(id, form);
      setSubmitMsg({
        type: "success",
        text: response?.message || (form.requestType === "SCHEDULE_VISIT" ? "Your visit request has been sent." : "Your inquiry has been sent."),
      });
      setInquiryDone(true);
    } catch (err) {
      setSubmitMsg({ type: "error", text: err.message || "Failed to send inquiry." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
        Loading listing…
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ color: "#ef4444", marginBottom: 16 }}>{state.error}</div>
        <Link to="/marketplace" style={{ color: "#3b82f6" }}>← Back to Marketplace</Link>
      </div>
    );
  }

  if (!listing) return null;

  const statusColor = STATUS_COLOR[listing.status] || "#9ca3af";

  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": listing.listingType === "LAND" ? "LandForm" : "RealEstateListing",
    "name": listing.title,
    "description": listing.description,
    "url": typeof window !== "undefined" ? window.location.href : undefined,
    "offers": listing.price ? {
      "@type": "Offer",
      "price": listing.price,
      "priceCurrency": listing.currency || "RWF",
    } : undefined,
    "areaServed": listing.region?.name || "Rwanda",
  };

  // Location: only province/region before inquiry; show full text after
  const locationDisplay = inquiryDone
    ? (listing.locationText || listing.region?.name || "—")
    : (listing.region?.name || listing.locationText?.split(",")?.[0]?.trim() || "—");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px", color: "#0f172a", background: "#ffffff" }}>
      <SEO
        title={listing.title}
        description={listing.description || `${listing.listingType} listing in ${listing.region?.name || "Rwanda"} — ${listing.price ? `${listing.currency || "RWF"} ${Number(listing.price).toLocaleString()}` : "Price on request"}`}
        image={listing.images?.[0]?.imageUrl}
        jsonLd={listingJsonLd}
      />
      {/* Back */}
      <Link
        to="/marketplace"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#3b82f6", textDecoration: "none", fontSize: 14, marginBottom: 24 }}
      >
        ← Back to Marketplace
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        {/* ── Left ─────────────────────────────────────────────────── */}
        <div>
          {/* Image carousel */}
          <div style={{ borderRadius: 16, overflow: "hidden", background: "#f8fbff", height: 420, position: "relative", border: "1px solid #e8eef5", boxShadow: "0 14px 30px rgba(15,23,42,0.05)" }}>
            {images.length > 0 ? (
              <img
                src={images[activeImg]?.imageUrl}
                alt={listing.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "#64748b", fontSize: 14,
              }}>
                No images available
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.92)", border: "1px solid #e8eef5", color: "#0f172a",
                    width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18,
                  }}
                >‹</button>
                <button
                  onClick={nextImg}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.92)", border: "1px solid #e8eef5", color: "#0f172a",
                    width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18,
                  }}
                >›</button>
                <div style={{
                  position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
                  display: "flex", gap: 6,
                }}>
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      style={{
                        width: idx === activeImg ? 20 : 8,
                        height: 8, borderRadius: 4, border: "none",
                        background: idx === activeImg ? "#3b82f6" : "rgba(255,255,255,0.4)",
                        cursor: "pointer", transition: "width 0.2s",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }}>
              {images.map((img, idx) => (
                <img
                  key={img.id || idx}
                  src={img.imageUrl}
                  alt={`View ${idx + 1}`}
                  onClick={() => setActiveImg(idx)}
                  style={{
                    width: 68, height: 68, objectFit: "cover", borderRadius: 8,
                    cursor: "pointer", flexShrink: 0,
                    border: idx === activeImg ? "2px solid #3b82f6" : "2px solid transparent",
                    opacity: idx === activeImg ? 1 : 0.6,
                    transition: "opacity 0.15s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Details */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
              <span style={{
                padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                color: statusColor, border: `1px solid ${statusColor}`,
              }}>
                {listing.status}
              </span>
              {listing.listingType && (
                <span style={{
                  padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  color: "#64748b", border: "1px solid #d9e3ef",
                }}>
                  {listing.listingType}
                </span>
              )}
            </div>

            <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>{listing.title}</h1>

            <div style={{ fontSize: 22, fontWeight: 800, color: "#60a5fa", marginBottom: 20 }}>
              {listing.price
                ? `${listing.currency || "RWF"} ${Number(listing.price).toLocaleString()}`
                : "Price on request"}
            </div>

            {/* Spec grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 14, padding: 16, background: "#f8fbff", borderRadius: 14, marginBottom: 20, border: "1px solid #e8eef5", boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
            }}>
              {[
                { label: "Type", value: listing.listingType },
                { label: "Location", value: locationDisplay },
                { label: "Size", value: listing.sizeM2 ? `${listing.sizeM2} m²` : null },
                { label: "Bedrooms", value: listing.bedrooms || null },
                { label: "Bathrooms", value: listing.bathrooms || null },
              ].filter((r) => r.value).map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            {!inquiryDone && listing.locationText && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 20,
                background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)",
                fontSize: 13, color: "#eab308",
              }}>
                Exact location revealed after submitting an inquiry.
              </div>
            )}

            {listing.description && (
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Description</h2>
                <p style={{ margin: 0, lineHeight: 1.7, color: "#64748b", fontSize: 14 }}>
                  {listing.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right ─────────────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{
            padding: 20, borderRadius: 16,
            border: "1px solid #e8eef5",
            background: "#ffffff",
            boxShadow: "0 14px 30px rgba(15,23,42,0.05)",
          }}>
            {inquiryDone ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                <div style={{ fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>Inquiry sent!</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  {submitMsg.text || "The seller will contact you shortly."}
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700 }}>
                  {isAuthed ? "Send an Inquiry" : "Interested in this listing?"}
                </h3>

                {!isAuthed && (
                  <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#f8fbff", border: "1px solid #e8eef5", fontSize: 13, color: "#64748b" }}>
                    <Link to="/login" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>Sign in</Link> to have your details pre-filled and track your inquiries.
                  </div>
                )}

                {submitMsg.text && submitMsg.type === "error" && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: 13 }}>
                    {submitMsg.text}
                  </div>
                )}

                <form onSubmit={handleInquiry} style={{ display: "grid", gap: 12 }}>
                  <select
                    value={form.requestType}
                    onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                    style={{
                      padding: "10px 12px", border: "1px solid #e6ecf4", borderRadius: 8,
                      background: "#ffffff", color: "#0f172a", fontSize: 14, width: "100%", boxSizing: "border-box",
                    }}
                  >
                    <option value="SCHEDULE_VISIT">Request a property tour</option>
                    <option value="MORE_INFO">Request more information</option>
                    <option value="CONNECT_AGENT">Request direct follow-up</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={{
                      padding: "10px 12px", border: "1px solid #e6ecf4", borderRadius: 8,
                      background: "#ffffff", color: "#0f172a", fontSize: 14, width: "100%", boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{
                      padding: "10px 12px", border: "1px solid #e6ecf4", borderRadius: 8,
                      background: "#ffffff", color: "#0f172a", fontSize: 14, width: "100%", boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (optional)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{
                      padding: "10px 12px", border: "1px solid #e6ecf4", borderRadius: 8,
                      background: "#ffffff", color: "#0f172a", fontSize: 14, width: "100%", boxSizing: "border-box",
                    }}
                  />
                  <textarea
                    placeholder={form.requestType === "SCHEDULE_VISIT" ? "Tell us when you would like to visit or what kind of viewing you need..." : "Describe your interest or ask a question..."}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    style={{
                      padding: "10px 12px", border: "1px solid #e6ecf4", borderRadius: 8,
                      background: "#ffffff", color: "#0f172a", fontSize: 14,
                      width: "100%", boxSizing: "border-box", resize: "vertical",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "12px 0", borderRadius: 10, border: "none",
                      background: submitting ? "#94a3b8" : "#3b82f6",
                      color: "#fff", fontWeight: 700, fontSize: 15,
                      cursor: submitting ? "not-allowed" : "pointer",
                      width: "100%",
                    }}
                  >
                    {submitting ? "Sending..." : form.requestType === "SCHEDULE_VISIT" ? "Request Visit" : "Send Inquiry"}
                  </button>
                </form>
              </>
            )}

            {/* Listed by */}
            {listing.owner && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #edf2f8" }}>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>LISTED BY</div>
                <div style={{ fontWeight: 700 }}>{listing.owner.fullName || "Anonymous"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
