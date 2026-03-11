import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/apiClientService";

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    regionId: "",
    listingType: "PROPERTY",
    locationText: "",
    price: "",
    currency: "RWF",
    sizeM2: "",
    bedrooms: "",
    bathrooms: "",
    zoningInfo: "",
  });
  const [images, setImages] = useState([]);
  const [state, setState] = useState({ loading: false, error: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: "" });

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    images.forEach((img) => formData.append("images", img));

    try {
      await api.post("/api/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Listing submitted for moderation!");
      navigate("/dashboard/listings");
    } catch (err) {
      setState({ loading: false, error: err.message || "Failed to create listing" });
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "26px 18px" }}>
      <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 800 }}>Create Listing</h1>
      <p style={{ color: "#64708a", marginBottom: 32 }}>
        Submit your property or land for review. It will be published after moderation.
      </p>

      {state.error && <div style={{ color: "#b91c1c", marginBottom: 20 }}>{state.error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Title *</div>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Type *</div>
            <select
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            >
              <option value="PROPERTY">Property</option>
              <option value="LAND">Land</option>
            </select>
          </label>
        </div>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Description</div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6, resize: "vertical" }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Region *</div>
            <select
              name="regionId"
              value={form.regionId}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            >
              <option value="">Select region</option>
              <option value="1">Kigali</option>
              <option value="2">Northern</option>
              <option value="3">Southern</option>
              <option value="4">Eastern</option>
              <option value="5">Western</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Location</div>
            <input
              name="locationText"
              value={form.locationText}
              onChange={handleChange}
              placeholder="e.g., Nyarutarama, Kacyiru"
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Price (RWF)</div>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Leave blank if on request"
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Size (m²)</div>
            <input
              name="sizeM2"
              type="number"
              value={form.sizeM2}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            />
          </label>
          <label>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Currency</div>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
            >
              <option value="RWF">RWF</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>

        {form.listingType === "PROPERTY" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Bedrooms</div>
              <input
                name="bedrooms"
                type="number"
                value={form.bedrooms}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
              />
            </label>
            <label>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Bathrooms</div>
              <input
                name="bathrooms"
                type="number"
                value={form.bathrooms}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
              />
            </label>
          </div>
        )}

        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Zoning / Land Use Info</div>
          <input
            name="zoningInfo"
            value={form.zoningInfo}
            onChange={handleChange}
            placeholder="e.g., Residential, Commercial, Mixed-use"
            style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: 6 }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Images (up to 10, max 5MB each)</div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: "100%" }}
          />
          {images.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#64708a" }}>
              {images.length} file(s) selected
            </div>
          )}
        </label>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={state.loading}
            style={{
              padding: "10px 24px",
              background: "#00f2ff",
              color: "#050505",
              border: "none",
              borderRadius: 6,
              fontWeight: 700,
              cursor: state.loading ? "not-allowed" : "pointer",
            }}
          >
            {state.loading ? "Submitting…" : "Submit Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
