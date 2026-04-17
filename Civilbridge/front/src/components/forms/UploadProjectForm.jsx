export default function UploadProjectForm({ onSubmit, children }) {
    return (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            {children}
        </form>
    );
}
