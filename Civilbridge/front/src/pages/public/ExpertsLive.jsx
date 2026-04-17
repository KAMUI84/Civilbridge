import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, BadgeCheck, Star } from "lucide-react";
import { expertsService } from "../../services/expertsService";

export default function ExpertsLive() {
  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setState({ loading: true, error: "" });
        const response = await expertsService.getAll();
        if (!active) return;
        setExperts(response?.experts || []);
        setState({ loading: false, error: "" });
      } catch (error) {
        if (!active) return;
        setExperts([]);
        setState({ loading: false, error: error.message || "Failed to load experts." });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredExperts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return experts;

    return experts.filter((expert) =>
      [
        expert.user?.fullName,
        expert.user?.profession,
        expert.providerType,
        expert.region?.name,
        ...(expert.specialties || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [experts, search]);

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-white pt-24 pb-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Experts</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
            Only approved experts appear here. Open any profile for availability, portfolio details, and live follow-up options.
          </p>

          <div className="mt-5 max-w-xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search profession, specialty, or location"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5">
          {state.loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading experts...</div>
          ) : state.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
              {state.error}
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-900">No items available</h2>
              <p className="mt-2 text-sm text-gray-500">
                {search.trim() ? "No approved experts match your search yet." : "Approved experts will appear here once an admin publishes them."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Showing {filteredExperts.length} approved expert{filteredExperts.length === 1 ? "" : "s"}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredExperts.map((expert) => (
                  <Link
                    key={expert.id}
                    to={`/experts/${expert.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      {expert.user?.avatarUrl ? (
                        <img
                          src={expert.user.avatarUrl}
                          alt={expert.user?.fullName || "Expert"}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white">
                          {(expert.user?.fullName || "E").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="line-clamp-1 text-base font-semibold text-gray-900">
                            {expert.user?.fullName || "Expert"}
                          </h2>
                          {expert.verifiedAt || expert.verificationStatus === "VERIFIED" ? (
                            <BadgeCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                          ) : null}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {expert.user?.profession || expert.providerType}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{expert.region?.name || "Rwanda"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span>{Number(expert.avgRating || 0).toFixed(1)}</span>
                      <span className="text-gray-400">({expert.reviewCount || 0} reviews)</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(expert.specialties || []).slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                      {expert.user?.bio || expert.verificationNotes || "Profile details will expand on the full expert page."}
                    </p>

                    <div className="mt-auto pt-4 text-sm font-medium text-emerald-700 transition group-hover:text-emerald-800">
                      View profile
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
