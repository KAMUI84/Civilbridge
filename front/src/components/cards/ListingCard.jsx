export default function ListingCard({ listing = {} }) {
    return (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{listing.title || "Listing"}</div>
        </div>
    );
}
