import AIAssistant from '../../components/dashboard/AIAssistant.jsx';

export default function AiStudio() {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 26, color: "#0c1220", marginBottom: 20 }}>
        AI Studio
      </h1>
      <p style={{ color: "#64708a", fontWeight: 650, marginBottom: 30 }}>
        Your intelligent construction assistant for expert guidance, budget analysis, and project planning.
      </p>
      
      <AIAssistant />
    </div>
  );
}
