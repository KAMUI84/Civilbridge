import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEO from "../../components/seo/SEO";
import { plansService } from "../../services/plansService";

function formatPlanCost(plan) {
  if (plan?.estimatedCostMin == null && plan?.estimatedCostMax == null) return "Cost on request";
  const values = [plan.estimatedCostMin, plan.estimatedCostMax]
    .filter((value) => value != null)
    .map((value) => `${plan.currency || "RWF"} ${Number(value).toLocaleString()}`);
  return values.join(" - ");
}

export default function PlanDetailsLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [related, setRelated] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [activeImage, setActiveImage] = useState(0);
  const [form, setForm] = useState({ email: "", phone: "", reason: "" });
  const [requestState, setRequestState] = useState({ saving: false, message: "", type: "" });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setState({ loading: true, error: "" });
        const [planResponse, listResponse] = await Promise.all([
          plansService.getById(id),
          plansService.getAll(),
        ]);

        if (!active) return;

        const currentPlan = planResponse || null;
        const allPlans = listResponse?.plans || [];
        setPlan(currentPlan);
        setRelated(
          allPlans
            .filter((item) => String(item.id) !== String(id))
            .filter((item) => item.category === currentPlan?.category || item.tier === currentPlan?.tier)
            .slice(0, 4),
        );
        setState({ loading: false, error: "" });
      } catch (error) {
        if (!active) return;
        setPlan(null);
        setRelated([]);
        setState({ loading: false, error: error.message || "Failed to load plan." });
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const specs = useMemo(
    () =>
      [
        plan?.category ? { label: "Category", value: plan.category } : null,
        plan?.style ? { label: "Style", value: plan.style } : null,
        plan?.builtAreaM2 ? { label: "Built area", value: `${plan.builtAreaM2} m2` } : null,
        plan?.floors ? { label: "Floors", value: plan.floors } : null,
        plan?.bedrooms ? { label: "Bedrooms", value: plan.bedrooms } : null,
        plan?.tier ? { label: "Tier", value: plan.tier } : null,
      ].filter(Boolean),
    [plan],
  );

  async function handleFollowUp(event) {
    event.preventDefault();

    try {
      setRequestState({ saving: true, message: "", type: "" });
      const response = await plansService.requestFollowUp(id, {
        requestType: "ASK_EXPERT",
        notes: `Email: ${form.email}\nPhone: ${form.phone}\nReason: ${form.reason}`,
      });
      setRequestState({
        saving: false,
        message: response?.message || "Plan follow-up request submitted.",
        type: "success",
      });
      setForm({ email: "", phone: "", reason: "" });
    } catch (error) {
      if (/auth|login|sign in/i.test(error.message || "")) {
        navigate("/login");
        return;
      }

      setRequestState({
        saving: false,
        message: error.message || "Failed to submit plan follow-up request.",
        type: "error",
      });
    }
  }

  if (state.loading) {
    return <div className="mx-auto max-w-6xl px-4 py-28 text-center text-sm text-gray-500">Loading plan...</div>;
  }

  if (state.error || !plan) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-28 text-center">
        <div className="text-sm text-red-600">{state.error || "Plan not found."}</div>
        <Link to="/plans" className="mt-4 inline-block text-sm font-medium text-emerald-700">
          Back to plans
        </Link>
      </div>
    );
  }

  const renderAssets = plan.assets || [];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={plan.title}
        description={plan.description || `${plan.title} on CivilBridge`}
        image={renderAssets[0]?.assetUrl}
      />

      <div className="mx-auto max-w-6xl px-3 pb-12 pt-24 sm:px-4 lg:px-5">
        <Link to="/plans" className="text-sm font-medium text-emerald-700">
          Back to plans
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
          <div>
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">
              {renderAssets[activeImage]?.assetUrl ? (
                <img
                  src={renderAssets[activeImage].assetUrl}
                  alt={plan.title}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-sm text-gray-400">No preview available</div>
              )}
            </div>

            {renderAssets.length > 1 ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {renderAssets.map((asset, index) => (
                  <button
                    key={asset.id || index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-2xl border bg-white ${index === activeImage ? "border-emerald-500 shadow-sm" : "border-gray-200"}`}
                  >
                    <img src={asset.assetUrl} alt={`Plan view ${index + 1}`} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{plan.title}</h1>
                  <p className="mt-2 text-base font-semibold text-emerald-700">{formatPlanCost(plan)}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {plan.status || "APPROVED"}
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

              {plan.description ? (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-gray-900">Full technical overview</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{plan.description}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">Reason for Follow-up</h2>
              <p className="mt-2 text-sm text-gray-600">
                Share only the essentials and we will create a tracked follow-up request for this plan.
              </p>

              <form onSubmit={handleFollowUp} className="mt-4 grid gap-3">
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
                {requestState.message ? (
                  <div className={`rounded-xl px-4 py-3 text-sm ${requestState.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {requestState.message}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={requestState.saving}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {requestState.saving ? "Sending..." : "Request follow-up"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {related.length ? (
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
                <p className="mt-1 text-sm text-gray-500">More live plans related to what you are viewing now.</p>
              </div>
              <Link to="/plans" className="text-sm font-medium text-emerald-700">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <Link key={item.id} to={`/plans/${item.id}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-emerald-400 hover:shadow-lg">
                  <div className="aspect-[4/3] bg-gray-100">
                    {item.assets?.[0]?.assetUrl ? (
                      <img src={item.assets[0].assetUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">No preview</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="line-clamp-2 text-base font-semibold text-gray-900">{item.title}</div>
                    <div className="mt-2 text-sm text-gray-500">{item.category || "Plan"}</div>
                    <div className="mt-2 text-sm font-semibold text-emerald-700">{formatPlanCost(item)}</div>
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
