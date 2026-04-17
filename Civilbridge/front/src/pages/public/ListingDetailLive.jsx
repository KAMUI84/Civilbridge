import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../../components/seo/SEO";
import { listingsService } from "../../services/listingsService";

function formatPrice(listing) {
  if (listing?.price == null) return "Price on request";
  return `${listing.currency || "RWF"} ${Number(listing.price).toLocaleString()}`;
}

export default function ListingDetailLive() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [related, setRelated] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [activeImage, setActiveImage] = useState(0);
  const [form, setForm] = useState({ email: "", phone: "", reason: "" });
  const [submitState, setSubmitState] = useState({ saving: false, message: "", type: "" });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setState({ loading: true, error: "" });
        const [listingResponse, listResponse] = await Promise.all([
          listingsService.getById(id),
          listingsService.getAll(),
        ]);

        if (!active) return;

        const currentListing = listingResponse || null;
        const allListings = listResponse?.listings || [];
        setListing(currentListing);
        setRelated(
          allListings
            .filter((item) => String(item.id) !== String(id))
            .filter((item) => item.listingType === currentListing?.listingType || item.region?.name === currentListing?.region?.name)
            .slice(0, 4),
        );
        setState({ loading: false, error: "" });
      } catch (error) {
        if (!active) return;
        setListing(null);
        setRelated([]);
        setState({ loading: false, error: error.message || "Failed to load listing." });
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const images = listing?.images || [];
  const specs = useMemo(
    () =>
      [
        listing?.listingType ? { label: "Type", value: listing.listingType } : null,
        listing?.region?.name ? { label: "Region", value: listing.region.name } : null,
        listing?.locationText ? { label: "Location", value: listing.locationText } : null,
        listing?.sizeM2 ? { label: "Size", value: `${listing.sizeM2} m2` } : null,
        listing?.bedrooms ? { label: "Bedrooms", value: listing.bedrooms } : null,
        listing?.bathrooms ? { label: "Bathrooms", value: listing.bathrooms } : null,
      ].filter(Boolean),
    [listing],
  );

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitState({ saving: true, message: "", type: "" });
      const response = await listingsService.inquire(id, {
        email: form.email,
        phone: form.phone,
        message: form.reason,
        requestType: "MORE_INFO",
      });
      setSubmitState({
        saving: false,
        message: response?.message || "Follow-up request sent successfully.",
        type: "success",
      });
      setForm({ email: "", phone: "", reason: "" });
    } catch (error) {
      setSubmitState({
        saving: false,
        message: error.message || "Failed to send follow-up request.",
        type: "error",
      });
    }
  }

  if (state.loading) {
    return <div className="mx-auto max-w-6xl px-4 py-28 text-center text-sm text-gray-500">Loading listing...</div>;
  }

  if (state.error || !listing) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-28 text-center">
        <div className="text-sm text-red-600">{state.error || "Listing not found."}</div>
        <Link to="/marketplace" className="mt-4 inline-block text-sm font-medium text-emerald-700">
          Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={listing.title}
        description={listing.description || `${listing.title} in ${listing.region?.name || "Rwanda"}`}
        image={images[0]?.imageUrl}
      />

      <div className="mx-auto max-w-6xl px-3 pb-12 pt-24 sm:px-4 lg:px-5">
        <Link to="/marketplace" className="text-sm font-medium text-emerald-700">
          Back to marketplace
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
          <div>
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">
              {images[activeImage]?.imageUrl ? (
                <img
                  src={images[activeImage].imageUrl}
                  alt={listing.title}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-sm text-gray-400">No image available</div>
              )}
            </div>

            {images.length > 1 ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-2xl border bg-white ${index === activeImage ? "border-emerald-500 shadow-sm" : "border-gray-200"}`}
                  >
                    <img src={image.imageUrl} alt={`Listing view ${index + 1}`} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{listing.title}</h1>
                  <p className="mt-2 text-base font-semibold text-emerald-700">{formatPrice(listing)}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {listing.status || "ACTIVE"}
                </span>
              </div>

              {specs.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {specs.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-gray-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.label}</div>
                      <div className="mt-1 text-sm font-medium text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {listing.zoningInfo ? (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-gray-900">Technical notes</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{listing.zoningInfo}</p>
                </div>
              ) : null}

              {listing.description ? (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-gray-900">Description</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{listing.description}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">Reason for Follow-up</h2>
              <p className="mt-2 text-sm text-gray-600">
                Leave only the essential details and we will route the request to the listing owner.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email"
                  className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Phone"
                  className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <textarea
                  required
                  rows={5}
                  value={form.reason}
                  onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                  placeholder="Reason"
                  className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                {submitState.message ? (
                  <div className={`rounded-xl px-4 py-3 text-sm ${submitState.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {submitState.message}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={submitState.saving}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitState.saving ? "Sending..." : "Request follow-up"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {related.length ? (
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Similar listings</h2>
                <p className="mt-1 text-sm text-gray-500">Keep browsing with related live uploads.</p>
              </div>
              <Link to="/marketplace" className="text-sm font-medium text-emerald-700">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <Link key={item.id} to={`/marketplace/${item.id}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-emerald-400 hover:shadow-lg">
                  <div className="aspect-[4/3] bg-gray-100">
                    {item.images?.[0]?.imageUrl ? (
                      <img src={item.images[0].imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="line-clamp-2 text-base font-semibold text-gray-900">{item.title}</div>
                    <div className="mt-2 text-sm text-gray-500">{item.locationText || item.region?.name || "Rwanda"}</div>
                    <div className="mt-2 text-sm font-semibold text-emerald-700">{formatPrice(item)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
