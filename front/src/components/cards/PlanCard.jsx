export default function PlanCard({ plan = {} }) {
    return (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{plan.title || "Plan"}</div>
        </div>
    );
}
