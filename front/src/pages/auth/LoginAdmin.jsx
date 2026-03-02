import LoginCard from "./LoginCard";

export default function LoginAdmin() {
    return (
        <LoginCard
            role="Admin"
            accentColor="#1a1a2e"
            icon="🛡️"
            description="Full platform control. Restricted to authorised administrators only."
        />
    );
}
