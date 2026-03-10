import BudgetAnalyzer from '../../components/dashboard/BudgetAnalyzer.jsx';

export default function BudgetAnalysis() {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 26, color: "#0c1220", marginBottom: 20 }}>
        Budget Analysis & Planning
      </h1>
      <p style={{ color: "#64708a", fontWeight: 650, marginBottom: 30 }}>
        Get AI-powered recommendations and real cost analysis for your construction project.
      </p>
      
      <BudgetAnalyzer />
    </div>
  );
}
