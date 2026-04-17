export default function Sidebar({ children }) {
    return (
        <aside style={{ width: 260, borderRight: "1px solid #e5e7eb", background: "#fff", padding: 16, minHeight: "100vh" }}>
            {children}
        </aside>
    );
}
