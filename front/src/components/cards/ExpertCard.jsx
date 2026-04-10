/**
 * ExpertCard — renders a single expert from the real /api/experts response shape.
 * Props:
 *   expert   — ServiceProvider record (with user, bio, skills, avgRating, etc.)
 *   onContact — callback(expert) when the Contact button is clicked
 *   style    — optional extra styles for animation delay, etc.
 */
export default function ExpertCard({ expert = {}, onContact, style }) {
  const name     = expert.user?.fullName ?? "Expert";
  const avatar   = expert.user?.avatarUrl ?? null;
  const type     = expert.providerType ?? expert.user?.profession ?? "";
  const region   = expert.region?.name ?? expert.regionName ?? "";
  const rating   = expert.avgRating != null ? Number(expert.avgRating).toFixed(1) : "—";
  const reviews  = expert.reviewCount ?? expert.ratingCount ?? 0;
  const verified = Boolean(expert.verifiedAt ?? expert.verificationStatus === "VERIFIED");
  const bio      = expert.bio ?? "";
  const skills   = Array.isArray(expert.skills) ? expert.skills : [];

  return (
    <div
      style={{
        border: "1px solid var(--color-border, #e5e7eb)",
        borderRadius: 12,
        padding: 20,
        background: "var(--color-surface, #fff)",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
        ...style,
      }}
    >
      {/* Avatar + identity */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border, #e5e7eb)", flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
            {name[0]}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-primary, #111)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary, #6b7280)", marginBottom: 6 }}>
            {[type, region].filter(Boolean).join(" · ")}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {verified && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#15803d" }}>
                ✓ Verified
              </span>
            )}
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-bg-subtle, #f3f4f6)", color: "var(--color-text-secondary, #6b7280)" }}>
              ⭐ {rating}
            </span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-bg-subtle, #f3f4f6)", color: "var(--color-text-secondary, #6b7280)" }}>
              {reviews} review{reviews !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p style={{ fontSize: 13, color: "var(--color-text-secondary, #6b7280)", marginBottom: 12, lineHeight: 1.5 }}>
          {bio.length > 140 ? bio.slice(0, 140) + "…" : bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {skills.slice(0, 3).map((s) => (
            <span key={s} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-bg-subtle, #f3f4f6)", color: "var(--color-text-secondary, #6b7280)" }}>
              {s}
            </span>
          ))}
          {skills.length > 3 && (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--color-bg-subtle, #f3f4f6)", color: "var(--color-text-secondary, #6b7280)" }}>
              +{skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary, #9ca3af)" }}>
          Available for projects
        </span>
        {onContact && (
          <button
            onClick={(e) => { e.stopPropagation(); onContact(expert); }}
            style={{ fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" }}
          >
            Contact
          </button>
        )}
      </div>
    </div>
  );
}
