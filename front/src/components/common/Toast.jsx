import { useEffect, useState } from "react";

export default function Toast({ message = "", type = "info", duration = 3000, onClose }) {
    const [visible, setVisible] = useState(!!message);

    useEffect(() => {
        if (!message) return;
        setVisible(true);
        const t = setTimeout(() => { setVisible(false); onClose?.(); }, duration);
        return () => clearTimeout(t);
    }, [message, duration, onClose]);

    if (!visible) return null;

    const colors = { info: "#2563eb", success: "#16a34a", error: "#dc2626", warning: "#d97706" };

    return (
        <div
            style={{
                position: "fixed", bottom: 24, right: 24, zIndex: 2000,
                background: "#fff", border: `1.5px solid ${colors[type] || colors.info}`,
                borderRadius: 12, padding: "12px 18px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                color: colors[type] || colors.info, fontWeight: 700, fontSize: 14,
                maxWidth: 320,
            }}
        >
            {message}
        </div>
    );
}
