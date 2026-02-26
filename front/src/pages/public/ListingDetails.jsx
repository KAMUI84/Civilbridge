import { useParams } from "react-router-dom";

export default function ListingDetails() {
  const { id } = useParams();
  return (
    <div style={{ padding: 24 }}>
      <h1>Listing Details</h1>
      <p>Listing ID: {id}</p>
    </div>
  );
}