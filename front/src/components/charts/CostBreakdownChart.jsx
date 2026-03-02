export default function CostBreakdownChart({ data = [] }) {
    return (
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Cost Breakdown</div>
            {data.length === 0 && <p style={{ color: "#9ca3af", fontSize: 13 }}>No data yet.</p>}
        </div>
    );
}
