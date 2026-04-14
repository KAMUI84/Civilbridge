import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/apiClientService";
import { useAuth } from "../../context/useAuth";
import SEO from "../../components/seo/SEO";
import { plansService } from "../../services/plansService";

const TIER_LABEL = { FREE: "Free", PRO: "Pro", PREMIUM: "Premium" };
const TIER_COLOR = { FREE: "#22c55e", PRO: "#3b82f6", PREMIUM: "#a855f7" };
const STATUS_COLOR = { APPROVED: "#22c55e", PENDING: "#f59e0b", INACTIVE: "#ef4444" };

function Chip({ children, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      border: `1px solid ${color || "#3b82f6"}`,
      color: color || "#3b82f6",
    }}>
      {children}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontSize: 15, color: "#0f172a", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function fmtRwf(n) {
  if (!n && n !== 0) return null;
  return `RWF ${Number(n).toLocaleString()}`;
}

export default function PlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthed } = useAuth();

  const [plan, setPlan] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });
  const [activeImg, setActiveImg] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState({ type: "", text: "" });
  const [requestType, setRequestType] = useState("ASK_EXPERT");
  const [requestNotes, setRequestNotes] = useState("");
  const [requestState, setRequestState] = useState({ saving: false, type: "", text: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState({ loading: true, error: "" });
        const data = await api.get(`/api/plans/${id}`);
        if (!alive) return;
        setPlan(data);
        setState({ loading: false, error: "" });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, error: e.message || "Failed to load plan" });
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleDownload = async () => {
    if (!plan) return;

    // FREE plans — anyone can download (or log in to get the real files)
    if (plan.tier === "FREE" && !isAuthed) {
      navigate("/login");
      return;
    }

    // PRO / PREMIUM — must be authenticated
    if ((plan.tier === "PRO" || plan.tier === "PREMIUM") && !isAuthed) {
      navigate("/login");
      return;
    }

    setDownloading(true);
    setDownloadMsg({ type: "", text: "" });
    try {
      const result = await api.get(`/api/plans/${id}/download`);
      if (result?.plan?.downloadUrl) {
        window.open(result.plan.downloadUrl, "_blank");
        setDownloadMsg({ type: "success", text: "Download started." });
      } else {
        setDownloadMsg({ type: "success", text: "Your download link has been sent to your email." });
      }
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("payment") || msg.includes("purchase") || msg.includes("paid")) {
        setDownloadMsg({
          type: "locked",
          text: `This is a ${TIER_LABEL[plan.tier]} plan. Purchase it to download.`,
        });
      } else {
        setDownloadMsg({ type: "error", text: msg || "Download failed." });
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleFollowUpRequest = async (event) => {
    event.preventDefault();

    if (!isAuthed) {
      navigate("/login");
      return;
    }

    try {
      setRequestState({ saving: true, type: "", text: "" });
      const response = await plansService.requestFollowUp(id, {
        requestType,
        notes: requestNotes,
      });
      setRequestState({
        saving: false,
        type: "success",
        text: response?.message || "Plan follow-up request submitted.",
      });
      setRequestNotes("");
    } catch (error) {
      setRequestState({
        saving: false,
        type: "error",
        text: error.message || "Failed to submit plan follow-up request.",
      });
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.loading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", textAlign: "center", color: "var(--color-text-secondary, #9ca3af)" }}>
        Loading plan…
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (state.error) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ color: "#ef4444", marginBottom: 16 }}>{state.error}</div>
        <Link to="/plans" style={{ color: "#3b82f6" }}>← Back to Plans Library</Link>
      </div>
    );
  }

  if (!plan) return null;

  const assets = plan.assets || [];
  const renders = assets.filter((a) => a.assetType === "render");
  const docs = assets.filter((a) => a.assetType !== "render");
  const activeAsset = renders[activeImg];

  const costRange = plan.estimatedCostMin || plan.estimatedCostMax
    ? [fmtRwf(plan.estimatedCostMin), fmtRwf(plan.estimatedCostMax)].filter(Boolean).join(" – ")
    : null;

  const tierColor = TIER_COLOR[plan.tier] || "#9ca3af";
  const statusColor = STATUS_COLOR[plan.status] || "#9ca3af";

  const downloadLabel = () => {
    if (downloading) return "Requesting…";
    if (!isAuthed) return "Sign in to Download";
    if (plan.tier === "FREE") return "Download Free Plan";
    return `Purchase & Download (${TIER_LABEL[plan.tier]})`;
  };

  const planJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": plan.title,
    "description": plan.description,
    "category": plan.category,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "RWF",
      "price": plan.estimatedCostMin ?? plan.estimatedCostMax ?? 0,
      "availability": plan.status === "APPROVED" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px", background: "#ffffff" }}>
      <SEO
        title={plan.title}
        description={plan.description || `${plan.category} architectural plan — ${plan.builtAreaM2 ? `${plan.builtAreaM2} m²` : ""} ${plan.bedrooms ? `${plan.bedrooms} bedrooms` : ""} — available on CivilBridge`}
        image={plan.assets?.[0]?.assetUrl}
        jsonLd={planJsonLd}
      />
      {/* Back */}
      <Link
        to="/plans"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#3b82f6", textDecoration: "none", fontSize: 14, marginBottom: 24 }}
      >
        ← Back to Plans Library
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        {/* ── Left column ─────────────────────────────────────────── */}
        <div>
          {/* Image gallery */}
          <div style={{
            borderRadius: 16, overflow: "hidden",
            background: "#f8fbff", height: 420, position: "relative", border: "1px solid #e8eef5", boxShadow: "0 14px 30px rgba(15,23,42,0.05)",
          }}>
            {activeAsset ? (
              <img
                src={activeAsset.assetUrl}
                alt={plan.title}
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

            {/* Nav arrows */}
            {renders.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((p) => (p - 1 + renders.length) % renders.length)}
                  style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.92)", border: "1px solid #e8eef5", color: "#0f172a",
                    width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18,
                  }}
                >‹</button>
                <button
                  onClick={() => setActiveImg((p) => (p + 1) % renders.length)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.92)", border: "1px solid #e8eef5", color: "#0f172a",
                    width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18,
                  }}
                >›</button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {renders.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }}>
              {renders.map((img, idx) => (
                <img
                  key={img.id}
                  src={img.assetUrl}
                  alt={`View ${idx + 1}`}
                  onClick={() => setActiveImg(idx)}
                  style={{
                    width: 68, height: 68, objectFit: "cover", borderRadius: 8,
                    cursor: "pointer", flexShrink: 0,
                    border: idx === activeImg ? "2px solid #3b82f6" : "2px solid transparent",
                    opacity: idx === activeImg ? 1 : 0.65,
                    transition: "opacity 0.15s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Title & chips */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {plan.tier && <Chip color={tierColor}>{TIER_LABEL[plan.tier] || plan.tier}</Chip>}
              {plan.category && <Chip color="#6b7280">{plan.category}</Chip>}
              {plan.style && <Chip color="#6b7280">{plan.style}</Chip>}
              {plan.status && <Chip color={statusColor}>{plan.status}</Chip>}
            </div>
            <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
              {plan.title}
            </h1>
            {plan.creator?.fullName && (
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                Submitted by {plan.creator.fullName}
              </div>
            )}

            {/* Spec grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 14, padding: 16,
              background: "#f8fbff", borderRadius: 14, marginBottom: 20, border: "1px solid #e8eef5", boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
            }}>
              <InfoRow label="Built Area" value={plan.builtAreaM2 ? `${plan.builtAreaM2} m²` : null} />
              <InfoRow label="Floors" value={plan.floors} />
              <InfoRow label="Bedrooms" value={plan.bedrooms} />
              <InfoRow label="Est. Cost" value={costRange} />
            </div>

            {/* Description */}
            {plan.description && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                  Description
                </h2>
                <p style={{ margin: 0, lineHeight: 1.7, color: "#64748b", fontSize: 14 }}>
                  {plan.description}
                </p>
              </div>
            )}

            {/* Zoning / site info */}
            {plan.zoningInfo && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                  Zoning & Site Information
                </h2>
                <p style={{ margin: 0, lineHeight: 1.7, color: "#64748b", fontSize: 14 }}>
                  {plan.zoningInfo}
                </p>
              </div>
            )}

            {/* Document assets */}
            {docs.length > 0 && (
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                  Included Files
                </h2>
                <div style={{ display: "grid", gap: 8 }}>
                  {docs.map((doc) => (
                    <div key={doc.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: 8,
                      background: "#ffffff",
                      border: "1px solid #e8eef5",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                    }}>
                      <span style={{ fontSize: 14, color: "#0f172a" }}>
                        {doc.assetType === "floor_plan" ? "Floor Plan" : doc.assetType === "material_list" ? "Material List" : doc.assetType}
                      </span>
                      <span style={{ fontSize: 12, color: "#3b82f6" }}>
                        {plan.tier === "FREE" ? "Included" : `${TIER_LABEL[plan.tier]} tier`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{
            padding: 20, borderRadius: 16,
            border: "1px solid #e8eef5",
            background: "#ffffff",
            boxShadow: "0 14px 30px rgba(15,23,42,0.05)",
          }}>
            {/* Cost highlight */}
            {costRange && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>
                  ESTIMATED COST
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#60a5fa" }}>
                  {costRange}
                </div>
              </div>
            )}

            {/* Tier info */}
            <div style={{
              padding: "12px 14px", borderRadius: 10, marginBottom: 20,
              background: `${tierColor}18`, border: `1px solid ${tierColor}40`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tierColor, marginBottom: 4 }}>
                {TIER_LABEL[plan.tier] || plan.tier} Plan
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {plan.tier === "FREE"
                  ? "Download immediately after signing in."
                  : plan.tier === "PRO"
                    ? "Requires a one-time purchase to download."
                    : "Premium access with full material list and support."}
              </div>
            </div>

            {/* Download message */}
            {downloadMsg.text && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13,
                background: downloadMsg.type === "success"
                  ? "rgba(34,197,94,0.12)"
                  : downloadMsg.type === "locked"
                    ? "rgba(234,179,8,0.12)"
                    : "rgba(239,68,68,0.12)",
                color: downloadMsg.type === "success"
                  ? "#22c55e"
                  : downloadMsg.type === "locked"
                    ? "#eab308"
                    : "#ef4444",
              }}>
                {downloadMsg.text}
                {downloadMsg.type === "locked" && (
                  <div style={{ marginTop: 8 }}>
                    <Link to="/dashboard/payments" style={{ color: "#3b82f6", fontWeight: 600 }}>
                      Go to Payments →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Download button */}
            {plan.status === "APPROVED" ? (
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
                  background: downloading ? "#374151" : "#3b82f6",
                  color: "#fff", fontWeight: 700, fontSize: 15,
                  cursor: downloading ? "not-allowed" : "pointer",
                }}
              >
                {downloadLabel()}
              </button>
            ) : (
              <div style={{
                padding: "12px 14px", borderRadius: 10, textAlign: "center",
                background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontSize: 14, fontWeight: 600,
              }}>
                This plan is pending approval
              </div>
            )}

            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #edf2f8", display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                  Request plan follow-up
                </div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                  Use this when a client wants review, customization, stamping support, or to move forward with the full package.
                </div>
              </div>

              {!isAuthed ? (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(59,130,246,0.12)", color: "#93c5fd", fontSize: 13 }}>
                  <Link to="/login" style={{ color: "#60a5fa", fontWeight: 700, textDecoration: "none" }}>Sign in</Link> to send a tracked follow-up request and keep it in your ongoing workspace.
                </div>
              ) : (
                <form onSubmit={handleFollowUpRequest} style={{ display: "grid", gap: 12 }}>
                  <select
                    value={requestType}
                    onChange={(event) => setRequestType(event.target.value)}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e6ecf4", background: "#ffffff", color: "#0f172a" }}
                  >
                    <option value="ASK_EXPERT">Request review and follow-up</option>
                    <option value="CUSTOMIZE">Need plan customization</option>
                    <option value="BUY_FULL_PACKAGE">Proceed with full package</option>
                  </select>
                  <textarea
                    value={requestNotes}
                    onChange={(event) => setRequestNotes(event.target.value)}
                    rows={4}
                    placeholder="Tell us what you need next from this plan..."
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e6ecf4", background: "#ffffff", color: "#0f172a", resize: "vertical" }}
                  />
                  {requestState.text ? (
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      background: requestState.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: requestState.type === "success" ? "#4ade80" : "#f87171",
                    }}>
                      {requestState.text}
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    disabled={requestState.saving || plan.status !== "APPROVED"}
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      borderRadius: 10,
                      border: "1px solid rgba(96,165,250,0.28)",
                      background: requestState.saving ? "#374151" : "rgba(59,130,246,0.16)",
                      color: "#dbeafe",
                      fontWeight: 700,
                      cursor: requestState.saving || plan.status !== "APPROVED" ? "not-allowed" : "pointer",
                    }}
                  >
                    {requestState.saving ? "Sending..." : "Request Follow-Up"}
                  </button>
                </form>
              )}
            </div>

            {/* Spec summary */}
            <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
              {[
                { label: "Category", value: plan.category },
                { label: "Style", value: plan.style },
                { label: "Floors", value: plan.floors },
                { label: "Bedrooms", value: plan.bedrooms },
                { label: "Built Area", value: plan.builtAreaM2 ? `${plan.builtAreaM2} m²` : null },
              ].filter((r) => r.value).map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>{label}</span>
                  <span style={{ color: "#0f172a", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Browse similar */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Link
              to={`/plans?category=${plan.category || ""}`}
              style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}
            >
              Browse similar plans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
