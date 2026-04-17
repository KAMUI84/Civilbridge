export default function AuthForm({ onSubmit, children }) {
    return (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            {children}
        </form>
    );
}
