export default function BudgetHealth({ percent = 0 }) {
    return (
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Budget Health</div>
            <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4 }}>
                <div style={{ height: 8, width: `${percent}%`, background: "#16a34a", borderRadius: 4 }} />
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: "#6b7280" }}>{percent}% on track</div>
        </div>
    );
}
