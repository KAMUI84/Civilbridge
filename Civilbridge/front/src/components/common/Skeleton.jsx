/**
 * Lightweight skeleton loading components — no extra dependencies.
 * All animations use CSS keyframes defined once in this file.
 */

const shimmer = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "cb-shimmer 1.5s infinite",
  borderRadius: 8,
};

// Inject keyframes once
if (typeof document !== "undefined" && !document.getElementById("cb-skeleton-style")) {
  const style = document.createElement("style");
  style.id = "cb-skeleton-style";
  style.textContent = `
    @keyframes cb-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

/** Single rectangular skeleton block */
export function SkeletonBlock({ width = "100%", height = 16, radius = 8, style: extra }) {
  return (
    <div style={{ width, height, borderRadius: radius, ...shimmer, ...extra }} />
  );
}

/** Card skeleton — matches ExpertCard / PlanCard shape */
export function SkeletonCard({ style: extra }) {
  return (
    <div style={{
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.06)",
      padding: 20,
      display: "grid",
      gap: 12,
      ...extra,
    }}>
      <SkeletonBlock height={180} radius={12} />
      <SkeletonBlock width="60%" height={18} />
      <SkeletonBlock width="80%" height={13} />
      <div style={{ display: "flex", gap: 8 }}>
        <SkeletonBlock width={64} height={22} radius={999} />
        <SkeletonBlock width={64} height={22} radius={999} />
      </div>
    </div>
  );
}

/** Row skeleton — matches transaction / table row shape */
export function SkeletonRow({ style: extra }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 16px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.04)",
      ...extra,
    }}>
      <SkeletonBlock width={40} height={40} radius="50%" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: "grid", gap: 6 }}>
        <SkeletonBlock width="50%" height={13} />
        <SkeletonBlock width="30%" height={11} />
      </div>
      <SkeletonBlock width={80} height={13} />
    </div>
  );
}

/** Grid of skeleton cards */
export function SkeletonGrid({ count = 6, columns = "repeat(auto-fill, minmax(300px,1fr))" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns, gap: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Stats overview skeleton (4 cards) */
export function SkeletonStats() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ padding: 20, borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", display: "grid", gap: 10 }}>
          <SkeletonBlock width="50%" height={12} />
          <SkeletonBlock width="70%" height={26} />
          <SkeletonBlock width="40%" height={11} />
        </div>
      ))}
    </div>
  );
}
