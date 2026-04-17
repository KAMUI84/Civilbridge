export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={onClose}
        >
            <div
                style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 520, width: "90%", position: "relative" }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>{title}</h2>}
                {children}
                <button
                    onClick={onClose}
                    style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 18, cursor: "pointer" }}
                >✕</button>
            </div>
        </div>
    );
}
