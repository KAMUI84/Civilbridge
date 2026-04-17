import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Ruler, Layers3, BedDouble } from "lucide-react";
import { plansService } from "../../services/plansService";

function formatPlanCost(plan) {
  if (plan.estimatedCostMin == null && plan.estimatedCostMax == null) {
    return "Cost on request";
  }

  const parts = [plan.estimatedCostMin, plan.estimatedCostMax]
    .filter((value) => value != null)
    .map((value) => `${plan.currency || "RWF"} ${Number(value).toLocaleString()}`);

  return parts.join(" - ");
}

export default function PlansLibraryLive() {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setState({ loading: true, error: "" });
        const response = await plansService.getAll();
        if (!active) return;
        setPlans(response?.plans || []);
        setState({ loading: false, error: "" });
      } catch (error) {
        if (!active) return;
        setPlans([]);
        setState({ loading: false, error: error.message || "Failed to load plans." });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredPlans = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return plans;

    return plans.filter((plan) =>
      [plan.title, plan.description, plan.category, plan.style, plan.tier]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [plans, search]);

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-white pt-24 pb-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Plans Library</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
            Explore uploaded building plans and open each item for full specifications, follow-up, and related recommendations.
          </p>

          <div className="mt-5 max-w-xl">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, category, style, or tier"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-5">
          {state.loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading plans...</div>
          ) : state.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
              {state.error}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-900">No items available</h2>
              <p className="mt-2 text-sm text-gray-500">
                {search.trim() ? "No live plans match your search yet." : "Plans will appear here once they are uploaded and approved."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Showing {filteredPlans.length} live plan{filteredPlans.length === 1 ? "" : "s"}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredPlans.map((plan) => (
                  <Link
                    key={plan.id}
                    to={`/plans/${plan.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] bg-gray-100">
                      {plan.assets?.[0]?.assetUrl ? (
                        <img
                          src={plan.assets[0].assetUrl}
                          alt={plan.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No preview</div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="line-clamp-2 text-base font-semibold text-gray-900">{plan.title}</h2>
                          <div className="mt-1 text-sm text-gray-500">{plan.category || "Plan"}</div>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          {plan.tier || "FREE"}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-emerald-700">{formatPlanCost(plan)}</div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {plan.builtAreaM2 ? (
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3.5 w-3.5" />
                            {plan.builtAreaM2} m2
                          </span>
                        ) : null}
                        {plan.floors ? (
                          <span className="flex items-center gap-1">
                            <Layers3 className="h-3.5 w-3.5" />
                            {plan.floors} floor{plan.floors === 1 ? "" : "s"}
                          </span>
                        ) : null}
                        {plan.bedrooms ? (
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3.5 w-3.5" />
                            {plan.bedrooms} beds
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-auto text-sm font-medium text-emerald-700 transition group-hover:text-emerald-800">
                        View plan details
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
