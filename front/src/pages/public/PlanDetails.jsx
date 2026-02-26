import { useParams } from "react-router-dom";

export default function PlanDetails() {
  const { id } = useParams();
  return (
    <div style={{ padding: 24 }}>
      <h1>Plan Details</h1>
      <p>Plan ID: {id}</p>
    </div>
  );
}