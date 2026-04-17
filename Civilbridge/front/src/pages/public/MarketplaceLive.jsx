import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, BedDouble, Bath, Ruler } from "lucide-react";
import { listingsService } from "../../services/listingsService";

function formatPrice(listing) {
  if (listing.price == null) return "Price on request";
  return `${listing.currency || "RWF"} ${Number(listing.price).toLocaleString()}`;
}

export default function MarketplaceLive() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setState({ loading: true, error: "" });
        const response = await listingsService.getAll({ status: "ACTIVE", limit: 100 });
        if (!active) return;
        setListings(response?.listings || []);
        setState({ loading: false, error: "" });
      } catch (error) {
        if (!active) return;
        setListings([]);
        setState({ loading: false, error: error.message || "Failed to load marketplace listings." });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredListings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return listings;

    return listings.filter((listing) =>
      [listing.title, listing.description, listing.locationText, listing.region?.name, listing.listingType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [listings, search]);

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-white pt-24 pb-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Marketplace</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
            Browse live property and land listings uploaded to CivilBridge. Open any listing for full details and follow-up.
          </p>

          <div className="mt-5 max-w-xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search location, title, or listing type"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5">
          {state.loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading listings...</div>
          ) : state.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
              {state.error}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-900">No items available</h2>
              <p className="mt-2 text-sm text-gray-500">
                {search.trim() ? "No live uploaded listings match your search yet." : "Only real uploaded marketplace listings appear here once they are published."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Showing {filteredListings.length} live listing{filteredListings.length === 1 ? "" : "s"}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/marketplace/${listing.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] bg-gray-100">
                      {listing.images?.[0]?.imageUrl ? (
                        <img
                          src={listing.images[0].imageUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="line-clamp-2 text-base font-semibold text-gray-900">{listing.title}</h2>
                          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{listing.locationText || listing.region?.name || "Rwanda"}</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          {listing.listingType}
                        </span>
                      </div>

                      <div className="text-lg font-bold text-emerald-700">{formatPrice(listing)}</div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {listing.bedrooms ? (
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3.5 w-3.5" />
                            {listing.bedrooms} beds
                          </span>
                        ) : null}
                        {listing.bathrooms ? (
                          <span className="flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5" />
                            {listing.bathrooms} baths
                          </span>
                        ) : null}
                        {listing.sizeM2 ? (
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3.5 w-3.5" />
                            {listing.sizeM2} m2
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-auto text-sm font-medium text-emerald-700 transition group-hover:text-emerald-800">
                        View details
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
