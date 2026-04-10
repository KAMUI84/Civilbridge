import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/common/PageShell";
import { labelStyle, inputStyle, textareaStyle, primaryBtn, ghostBtn, errBox } from "../../components/common/FormUI";
import { useAuth } from "../../context/useAuth";
import { listingsService } from "../../services/listingsService";
import { plansService } from "../../services/plansService";
import { regionsService } from "../../services/regionsService";

const FALLBACK_REGIONS = [];

const PLAN_CATEGORIES = ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "INFRA"];
const PLAN_TIERS = ["FREE", "PRO", "PREMIUM"];

function normalizeRole(role) {
  return String(role || "").toUpperCase();
}

function canPublishPlans(role) {
  return ["ENGINEER", "ADMIN", "SUPER_ADMIN"].includes(normalizeRole(role));
}

function canPublishListings(role) {
  return ["ADMIN", "SUPER_ADMIN"].includes(normalizeRole(role));
}

function UploadBox({ label, accept, onFiles }) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        type="file"
        accept={accept}
        multiple
        onChange={(event) => onFiles(Array.from(event.target.files || []))}
        style={{ ...inputStyle, padding: 10 }}
      />
    </label>
  );
}

function Success({ text }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: "#ecfdf5", border: "1px solid #d1fae5", color: "#065f46", fontWeight: 850 }}>
      {text}
    </div>
  );
}

function UploadList({ title, items, emptyText, renderMeta, hrefPrefix }) {
  return (
    <section style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 18, background: "rgba(255,255,255,0.03)", display: "grid", gap: 14 }}>
      <h3 style={{ margin: 0, color: "var(--color-text-primary, #fff)", fontSize: 18 }}>{title}</h3>
      {!items.length ? (
        <div style={{ color: "var(--color-text-secondary, #94a3b8)", lineHeight: 1.6 }}>{emptyText}</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.slice(0, 6).map((item) => (
            <Link
              key={item.id}
              to={`${hrefPrefix}/${item.id}`}
              style={{ textDecoration: "none", color: "inherit", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, background: "rgba(7,12,18,0.6)", display: "grid", gap: 6 }}
            >
              <strong style={{ color: "var(--color-text-primary, #fff)" }}>{item.title}</strong>
              <span style={{ color: "var(--color-text-secondary, #94a3b8)", fontSize: 13 }}>{renderMeta(item)}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function PropertyForm({ regions, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    regionId: "",
    locationText: "",
    price: "",
    sizeM2: "",
    bedrooms: "3",
    bathrooms: "2",
    zoningInfo: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [state, setState] = useState({ error: "", success: "", saving: false });
  const selectedRegionId = form.regionId || String(regions[0]?.id || "");
  const hasRegions = regions.length > 0;

  async function submit(event) {
    event.preventDefault();
    if (!hasRegions) {
      setState({ error: "No regions are available yet. Please refresh and try again.", success: "", saving: false });
      return;
    }

    if (!form.title || !selectedRegionId || !form.locationText) {
      setState({ error: "Title, province, and location are required.", success: "", saving: false });
      return;
    }

    try {
      setState({ error: "", success: "", saving: true });
      const response = await listingsService.create({
        ...form,
        regionId: selectedRegionId,
        listingType: "PROPERTY",
        images,
      });
      setState({ error: "", success: response?.message || "Property published.", saving: false });
      setForm({
        title: "",
        regionId: "",
        locationText: "",
        price: "",
        sizeM2: "",
        bedrooms: "3",
        bathrooms: "2",
        zoningInfo: "",
        description: "",
      });
      setImages([]);
      onSuccess?.();
    } catch (error) {
      setState({ error: error.message || "Failed to publish property.", success: "", saving: false });
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      {state.error ? <div style={errBox}>{state.error}</div> : null}
      {state.success ? <Success text={state.success} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <label style={labelStyle}>Title<input style={inputStyle} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Modern family house in Kigali" /></label>
        <label style={labelStyle}>Province
          <select style={inputStyle} value={selectedRegionId} onChange={(event) => setForm((current) => ({ ...current, regionId: event.target.value }))} disabled={!hasRegions}>
            {!hasRegions ? <option value="">No regions available</option> : null}
            {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Location details<input style={inputStyle} value={form.locationText} onChange={(event) => setForm((current) => ({ ...current, locationText: event.target.value }))} placeholder="Kicukiro, Niboye" /></label>
        <label style={labelStyle}>Price (RWF)<input style={inputStyle} type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="95000000" /></label>
        <label style={labelStyle}>Size (m²)<input style={inputStyle} type="number" value={form.sizeM2} onChange={(event) => setForm((current) => ({ ...current, sizeM2: event.target.value }))} placeholder="320" /></label>
        <label style={labelStyle}>Bedrooms<input style={inputStyle} type="number" value={form.bedrooms} onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))} /></label>
        <label style={labelStyle}>Bathrooms<input style={inputStyle} type="number" value={form.bathrooms} onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))} /></label>
        <label style={labelStyle}>Property notes<input style={inputStyle} value={form.zoningInfo} onChange={(event) => setForm((current) => ({ ...current, zoningInfo: event.target.value }))} placeholder="Utilities, parking, legal notes" /></label>
      </div>
      <label style={labelStyle}>Description<textarea style={textareaStyle} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the property, viewing value, and what the client should expect." /></label>
      <UploadBox label="Property photos" accept="image/*" onFiles={setImages} />
      <button type="submit" style={primaryBtn} disabled={state.saving || !hasRegions}>{state.saving ? "Publishing..." : "Publish Property"}</button>
    </form>
  );
}

function LandForm({ regions, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    regionId: "",
    locationText: "",
    price: "",
    sizeM2: "",
    zoningInfo: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [state, setState] = useState({ error: "", success: "", saving: false });
  const selectedRegionId = form.regionId || String(regions[0]?.id || "");
  const hasRegions = regions.length > 0;

  async function submit(event) {
    event.preventDefault();
    if (!hasRegions) {
      setState({ error: "No regions are available yet. Please refresh and try again.", success: "", saving: false });
      return;
    }

    if (!form.title || !selectedRegionId || !form.locationText || !form.sizeM2) {
      setState({ error: "Title, province, location, and land size are required.", success: "", saving: false });
      return;
    }

    try {
      setState({ error: "", success: "", saving: true });
      const response = await listingsService.create({
        ...form,
        regionId: selectedRegionId,
        listingType: "LAND",
        images,
      });
      setState({ error: "", success: response?.message || "Land listing published.", saving: false });
      setForm({
        title: "",
        regionId: "",
        locationText: "",
        price: "",
        sizeM2: "",
        zoningInfo: "",
        description: "",
      });
      setImages([]);
      onSuccess?.();
    } catch (error) {
      setState({ error: error.message || "Failed to publish land listing.", success: "", saving: false });
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      {state.error ? <div style={errBox}>{state.error}</div> : null}
      {state.success ? <Success text={state.success} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <label style={labelStyle}>Title<input style={inputStyle} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Serviced residential plot" /></label>
        <label style={labelStyle}>Province
          <select style={inputStyle} value={selectedRegionId} onChange={(event) => setForm((current) => ({ ...current, regionId: event.target.value }))} disabled={!hasRegions}>
            {!hasRegions ? <option value="">No regions available</option> : null}
            {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Location details<input style={inputStyle} value={form.locationText} onChange={(event) => setForm((current) => ({ ...current, locationText: event.target.value }))} placeholder="Gasabo, Rusororo" /></label>
        <label style={labelStyle}>Size (m²)<input style={inputStyle} type="number" value={form.sizeM2} onChange={(event) => setForm((current) => ({ ...current, sizeM2: event.target.value }))} placeholder="450" /></label>
        <label style={labelStyle}>Price (RWF)<input style={inputStyle} type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="18000000" /></label>
        <label style={labelStyle}>Land notes<input style={inputStyle} value={form.zoningInfo} onChange={(event) => setForm((current) => ({ ...current, zoningInfo: event.target.value }))} placeholder="Residential zoning, road access" /></label>
      </div>
      <label style={labelStyle}>Description<textarea style={textareaStyle} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Explain the land, nearby access, and why a buyer should request a visit." /></label>
      <UploadBox label="Land photos" accept="image/*" onFiles={setImages} />
      <button type="submit" style={primaryBtn} disabled={state.saving || !hasRegions}>{state.saving ? "Publishing..." : "Publish Land Listing"}</button>
    </form>
  );
}

function PlanForm({ onSuccess, isAdminPublisher }) {
  const [form, setForm] = useState({
    title: "",
    category: "RESIDENTIAL",
    style: "",
    bedrooms: "3",
    floors: "1",
    builtAreaM2: "",
    estimatedCostMin: "",
    estimatedCostMax: "",
    tier: "FREE",
    description: "",
  });
  const [assets, setAssets] = useState([]);
  const [state, setState] = useState({ error: "", success: "", saving: false });

  async function submit(event) {
    event.preventDefault();
    if (!form.title || !form.builtAreaM2 || !assets.length) {
      setState({ error: "Plan title, built area, and at least one asset are required.", success: "", saving: false });
      return;
    }

    try {
      setState({ error: "", success: "", saving: true });
      const response = await plansService.create({
        ...form,
        assets,
      });
      setState({
        error: "",
        success: response?.message || (isAdminPublisher ? "Plan published." : "Plan submitted for approval."),
        saving: false,
      });
      setForm({
        title: "",
        category: "RESIDENTIAL",
        style: "",
        bedrooms: "3",
        floors: "1",
        builtAreaM2: "",
        estimatedCostMin: "",
        estimatedCostMax: "",
        tier: "FREE",
        description: "",
      });
      setAssets([]);
      onSuccess?.();
    } catch (error) {
      setState({ error: error.message || "Failed to submit plan.", success: "", saving: false });
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      {state.error ? <div style={errBox}>{state.error}</div> : null}
      {state.success ? <Success text={state.success} /> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <label style={labelStyle}>Plan title<input style={inputStyle} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Stamped 4-bedroom villa plan" /></label>
        <label style={labelStyle}>Category
          <select style={inputStyle} value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
            {PLAN_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Style<input style={inputStyle} value={form.style} onChange={(event) => setForm((current) => ({ ...current, style: event.target.value }))} placeholder="Contemporary" /></label>
        <label style={labelStyle}>Bedrooms<input style={inputStyle} type="number" value={form.bedrooms} onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))} /></label>
        <label style={labelStyle}>Floors<input style={inputStyle} type="number" value={form.floors} onChange={(event) => setForm((current) => ({ ...current, floors: event.target.value }))} /></label>
        <label style={labelStyle}>Built area (m²)<input style={inputStyle} type="number" value={form.builtAreaM2} onChange={(event) => setForm((current) => ({ ...current, builtAreaM2: event.target.value }))} placeholder="280" /></label>
        <label style={labelStyle}>Estimated cost min<input style={inputStyle} type="number" value={form.estimatedCostMin} onChange={(event) => setForm((current) => ({ ...current, estimatedCostMin: event.target.value }))} placeholder="45000000" /></label>
        <label style={labelStyle}>Estimated cost max<input style={inputStyle} type="number" value={form.estimatedCostMax} onChange={(event) => setForm((current) => ({ ...current, estimatedCostMax: event.target.value }))} placeholder="62000000" /></label>
        <label style={labelStyle}>Tier
          <select style={inputStyle} value={form.tier} onChange={(event) => setForm((current) => ({ ...current, tier: event.target.value }))}>
            {PLAN_TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
          </select>
        </label>
      </div>
      <label style={labelStyle}>Description<textarea style={textareaStyle} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Explain what is included, the intended client, and any review or stamping details." /></label>
      <UploadBox label="Plan assets (PDFs and images)" accept=".pdf,image/*" onFiles={setAssets} />
      <button type="submit" style={primaryBtn} disabled={state.saving}>{state.saving ? "Submitting..." : "Submit Plan"}</button>
    </form>
  );
}

export default function UploadsReal() {
  const { isAuthed, user } = useAuth();
  const role = normalizeRole(user?.role);
  const isPlanPublisher = canPublishPlans(role);
  const isListingPublisher = canPublishListings(role);
  const tabs = useMemo(() => {
    const nextTabs = [];
    if (isListingPublisher) nextTabs.push({ id: "property", label: "Publish Property" }, { id: "land", label: "Publish Land" });
    if (isPlanPublisher) nextTabs.push({ id: "plan", label: "Submit Plan" });
    return nextTabs;
  }, [isListingPublisher, isPlanPublisher]);
  const [tab, setTab] = useState(isListingPublisher ? "property" : "plan");
  const activeTab = tabs.some((item) => item.id === tab) ? tab : tabs[0]?.id || "plan";
  const [regions, setRegions] = useState(FALLBACK_REGIONS);
  const [myPlans, setMyPlans] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(isAuthed && (isPlanPublisher || isListingPublisher));
  const [loadError, setLoadError] = useState("");

  const loadPublishingData = useCallback(async () => {
    if (!isAuthed || (!isPlanPublisher && !isListingPublisher)) return;

    try {
      setLoading(true);
      setLoadError("");
      const [regionsResponse, plansResponse, listingsResponse] = await Promise.all([
        regionsService.getAllRegions().catch(() => ({ regions: FALLBACK_REGIONS })),
        isPlanPublisher ? plansService.getMine().catch(() => []) : Promise.resolve([]),
        isListingPublisher ? listingsService.getMine().catch(() => []) : Promise.resolve([]),
      ]);

      const nextRegions = Array.isArray(regionsResponse?.regions) && regionsResponse.regions.length
        ? regionsResponse.regions
        : FALLBACK_REGIONS;

      setRegions(nextRegions.map((region) => ({ id: String(region.id), name: region.name })));
      setMyPlans(Array.isArray(plansResponse) ? plansResponse : []);
      setMyListings(Array.isArray(listingsResponse) ? listingsResponse : []);
      if (isListingPublisher && nextRegions.length === 0) {
        setLoadError("No regions are available yet for listing creation.");
      }
      setLoading(false);
    } catch (error) {
      setLoadError(error.message || "Failed to load publishing workspace.");
      setLoading(false);
    }
  }, [isAuthed, isListingPublisher, isPlanPublisher]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPublishingData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPublishingData]);

  if (!isAuthed) {
    return (
      <PageShell title="Upload Center" subtitle="Publishing on CivilBridge is reserved for authorized team roles.">
        <div style={{ display: "grid", gap: 16, padding: 24, borderRadius: 22, border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(135deg, rgba(8,16,24,0.96), rgba(14,28,37,0.82))" }}>
          <h2 style={{ margin: 0, color: "var(--color-text-primary, #fff)" }}>Sign in to publish plans or marketplace items</h2>
          <p style={{ margin: 0, color: "var(--color-text-secondary, #94a3b8)", lineHeight: 1.7 }}>
            Engineers can publish plans. Admins and super admins can publish plans, properties, and land listings for visitors to browse.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/login" style={{ ...primaryBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Sign in</Link>
            <Link to="/plans" style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Browse plans</Link>
            <Link to="/marketplace" style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Browse marketplace</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!tabs.length) {
    return (
      <PageShell title="Upload Center" subtitle="This space is for the public catalog only.">
        <div style={{ display: "grid", gap: 16, padding: 24, borderRadius: 22, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
          <h2 style={{ margin: 0, color: "var(--color-text-primary, #fff)" }}>Your account cannot publish public catalog items</h2>
          <p style={{ margin: 0, color: "var(--color-text-secondary, #94a3b8)", lineHeight: 1.7 }}>
            Clients and home builders browse what has already been uploaded, then start private follow-up from plans, land, or properties they are interested in.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/plans" style={{ ...primaryBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Explore plans</Link>
            <Link to="/marketplace" style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Open marketplace</Link>
            <Link to="/dashboard" style={{ ...ghostBtn, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Go to workspace</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Upload Center"
      subtitle={isListingPublisher
        ? "Publish plans, properties, and land directly to the public catalog."
        : "Publish architectural plans for client follow-up, review, and stamping."}
    >
      <div style={{ display: "grid", gap: 20 }}>
        <section style={{ display: "grid", gap: 12, padding: 22, borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(135deg, rgba(7,15,24,0.96), rgba(10,30,35,0.76))" }}>
          <div style={{ color: "#fbbf24", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em" }}>Publishing roles</div>
          <h2 style={{ margin: 0, color: "var(--color-text-primary, #fff)" }}>
            {role === "ENGINEER" ? "Engineer publishing desk" : "Admin publishing desk"}
          </h2>
          <p style={{ margin: 0, color: "var(--color-text-secondary, #94a3b8)", lineHeight: 1.7 }}>
            Engineers are limited to public plans. Admins and super admins can publish marketplace listings as well, so visitors can browse them and send tour or follow-up requests.
          </p>
        </section>

        {loadError ? <div style={errBox}>{loadError}</div> : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              style={{
                ...ghostBtn,
                borderRadius: 999,
                background: activeTab === item.id ? "#0f172a" : "rgba(255,255,255,0.03)",
                color: "#ffffff",
                borderColor: activeTab === item.id ? "#38bdf8" : "rgba(255,255,255,0.08)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 22, background: "rgba(255,255,255,0.03)" }}>
          {loading ? <div style={{ color: "var(--color-text-secondary, #94a3b8)" }}>Loading publishing workspace...</div> : null}
          {!loading && activeTab === "property" ? <PropertyForm regions={regions} onSuccess={loadPublishingData} /> : null}
          {!loading && activeTab === "land" ? <LandForm regions={regions} onSuccess={loadPublishingData} /> : null}
          {!loading && activeTab === "plan" ? <PlanForm onSuccess={loadPublishingData} isAdminPublisher={isListingPublisher} /> : null}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {isPlanPublisher ? (
            <UploadList
              title="Your submitted plans"
              items={myPlans}
              emptyText="No plans have been submitted from this account yet."
              hrefPrefix="/plans"
              renderMeta={(plan) => `${plan.status || "PENDING"} · ${plan.category || "PLAN"}${plan.builtAreaM2 ? ` · ${plan.builtAreaM2} m²` : ""}`}
            />
          ) : null}
          {isListingPublisher ? (
            <UploadList
              title="Your published listings"
              items={myListings}
              emptyText="No public properties or land listings have been published from this account yet."
              hrefPrefix="/marketplace"
              renderMeta={(listing) => `${listing.status || "ACTIVE"} · ${listing.listingType || "LISTING"}${listing.region?.name ? ` · ${listing.region.name}` : ""}`}
            />
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
