export default function Loader({ size = 32 }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
            <div
                style={{
                    width: size,
                    height: size,
                    border: "3px solid #e5e7eb",
                    borderTopColor: "#2563eb",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                }}
            />
        </div>
    );
}
