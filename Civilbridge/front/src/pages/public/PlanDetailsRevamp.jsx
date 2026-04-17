import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, FileText, Layers3, Phone, Sparkles } from "lucide-react";
import { api } from "../../services/apiClientService";
import { useAuth } from "../../context/useAuth";
import SEO from "../../components/seo/SEO";
import { plansService } from "../../services/plansService";
import {
  getPlanLibraryItemById,
  getRelatedPlanLibraryItems,
  mapMockPlanToApiShape,
} from "../../Data/publicCatalog";

const tierLabel = { FREE: "Free", PRO: "Pro", PREMIUM: "Premium" };

function formatCurrency(value) {
  if (!value && value !== 0) return null;
  return `RWF ${Number(value).toLocaleString()}`;
}

export default function PlanDetailsRevamp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthed, user } = useAuth();

  const [plan, setPlan] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });
  const [activeImage, setActiveImage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [requestType, setRequestType] = useState("ASK_EXPERT");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestState, setRequestState] = useState({ saving: false, message: "", type: "" });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setState({ loading: true, error: "" });
        const response = await api.get(`/api/plans/${id}`);
        if (!alive) return;
        setPlan(response);
        setState({ loading: false, error: "" });
      } catch (error) {
        if (!alive) return;
        const fallback = mapMockPlanToApiShape(getPlanLibraryItemById(id));
        if (fallback) {
          setPlan(fallback);
          setState({ loading: false, error: "" });
          return;
        }
        setState({ loading: false, error: error.message || "Failed to load plan details." });
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user) return;
    setRequestEmail((current) => current || user.email || "");
    setRequestPhone((current) => current || user.phone || "");
  }, [user]);

  const renders = useMemo(
    () => (plan?.assets || []).filter((asset) => asset.assetType === "render"),
    [plan?.assets],
  );
  const documents = useMemo(
    () => (plan?.assets || []).filter((asset) => asset.assetType !== "render"),
    [plan?.assets],
  );
  const relatedPlans = useMemo(
    () => (plan ? getRelatedPlanLibraryItems(id, plan.category) : []),
    [id, plan],
  );
  const costRange = useMemo(() => {
    if (!plan) return null;
    return [formatCurrency(plan.estimatedCostMin), formatCurrency(plan.estimatedCostMax)]
      .filter(Boolean)
      .join(" - ");
  }, [plan]);

  const handleDownload = async () => {
    if (!plan) return;

    if (!isAuthed) {
      navigate("/login");
      return;
    }

    setDownloading(true);
    setDownloadMessage("");

    try {
      const response = await api.get(`/api/plans/${id}/download`);
      if (response?.plan?.downloadUrl) {
        window.open(response.plan.downloadUrl, "_blank");
        setDownloadMessage("Your download has started.");
      } else {
        setDownloadMessage("Your download link is being prepared and will be shared shortly.");
      }
    } catch {
      setDownloadMessage("The plan is ready for follow-up. A team member will help you unlock the full package.");
    } finally {
      setDownloading(false);
    }
  };

  const handleRequest = async (event) => {
    event.preventDefault();

    if (!isAuthed) {
      navigate("/login");
      return;
    }

    try {
      setRequestState({ saving: true, message: "", type: "" });
      const response = await plansService.requestFollowUp(id, {
        requestType,
        notes: [
          requestEmail ? `Email: ${requestEmail}` : "",
          requestPhone ? `Phone: ${requestPhone}` : "",
          requestReason ? `Reason: ${requestReason}` : "",
        ].filter(Boolean).join("\n"),
      });
      setRequestState({
        saving: false,
        message: response?.message || "Plan follow-up request submitted.",
        type: "success",
      });
      setRequestReason("");
    } catch (error) {
      setRequestState({
        saving: false,
        message: error.message || "Failed to submit plan follow-up request.",
        type: "error",
      });
    }
  };

  if (state.loading) {
    return <div className="mx-auto max-w-6xl px-4 py-28 text-center text-slate-500">Loading plan...</div>;
  }

  if (state.error || !plan) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-28 text-center">
        <p className="mb-4 text-red-500">{state.error || "Plan not found."}</p>
        <Link to="/plans" className="text-sm font-semibold text-sky-600">
          Back to plans
        </Link>
      </div>
    );
  }

  const activeRender = renders[activeImage];
  const pageImage = activeRender?.assetUrl || renders[0]?.assetUrl;

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title={plan.title}
        description={plan.description || `${plan.category} plan on CivilBridge`}
        image={pageImage}
      />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Link to="/plans" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
          <ArrowLeft className="h-4 w-4" />
          Back to plans
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-slate-100">
                {pageImage ? (
                  <img src={pageImage} alt={plan.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">No render available</div>
                )}
              </div>
              {renders.length > 1 ? (
                <div className="flex gap-3 overflow-x-auto border-t border-slate-200 p-4">
                  {renders.map((asset, index) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`overflow-hidden rounded-2xl border ${index === activeImage ? "border-sky-500" : "border-slate-200"}`}
                    >
                      <img src={asset.assetUrl} alt={`${plan.title} preview ${index + 1}`} className="h-20 w-24 object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap gap-2">
                {plan.tier ? (
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {tierLabel[plan.tier] || plan.tier}
                  </span>
                ) : null}
                {plan.category ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {plan.category}
                  </span>
                ) : null}
                {plan.style ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {plan.style}
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{plan.title}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">{plan.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Built area", value: plan.builtAreaM2 ? `${plan.builtAreaM2} sqm` : "-" },
                  { label: "Floors", value: plan.floors || "-" },
                  { label: "Bedrooms", value: plan.bedrooms || "-" },
                  { label: "Estimated cost", value: costRange || "On request" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {plan.zoningInfo ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Technical and zoning notes</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{plan.zoningInfo}</p>
              </div>
            ) : null}

            {documents.length ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">Included files</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-sky-600" />
                        <span className="text-sm font-medium text-slate-700">{document.assetType.replaceAll("_", " ")}</span>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{tierLabel[plan.tier] || plan.tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {relatedPlans.length ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Similar to this</h2>
                    <p className="mt-2 text-sm text-slate-600">Recommended alternatives keep users browsing after a single detail page.</p>
                  </div>
                  <Link to="/plans" className="text-sm font-semibold text-sky-600">
                    View all plans
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {relatedPlans.map((item) => (
                    <Link
                      key={item.id}
                      to={`/plans/${item.id}`}
                      className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
                      <div className="space-y-2 p-4">
                        <div className="text-lg font-semibold text-slate-950">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.format} · {item.sheets} sheets</div>
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
                          Open detail page
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-[24px] bg-sky-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Package summary</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{costRange || "Price on request"}</div>
                <div className="mt-2 text-sm text-slate-600">
                  {plan.tier === "FREE"
                    ? "Best for early exploration and starter reviews."
                    : plan.tier === "PRO"
                      ? "Strong fit for serious buyers preparing delivery."
                      : "Full support package with richer detail and follow-up."}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Download className="h-4 w-4" />
                {downloading ? "Preparing..." : isAuthed ? "Download or unlock plan" : "Sign in to continue"}
              </button>

              {downloadMessage ? (
                <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                  {downloadMessage}
                </div>
              ) : null}

              <div className="mt-6 border-t border-slate-200 pt-6">
                <h2 className="text-lg font-semibold text-slate-950">Reason for follow-up</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep the form short: email, phone, and the reason for the next step.
                </p>

                {!isAuthed ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <Link to="/login" className="font-semibold text-sky-600">
                      Sign in
                    </Link>{" "}
                    to send a tracked follow-up request tied to your workspace.
                  </div>
                ) : (
                  <form onSubmit={handleRequest} className="mt-4 grid gap-3">
                    <select
                      value={requestType}
                      onChange={(event) => setRequestType(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500"
                    >
                      <option value="ASK_EXPERT">Request review and follow-up</option>
                      <option value="CUSTOMIZE">Need plan customization</option>
                      <option value="BUY_FULL_PACKAGE">Proceed with full package</option>
                    </select>
                    <input
                      type="email"
                      value={requestEmail}
                      onChange={(event) => setRequestEmail(event.target.value)}
                      placeholder="Email address"
                      required
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500"
                    />
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={requestPhone}
                        onChange={(event) => setRequestPhone(event.target.value)}
                        placeholder="Phone number"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-sky-500"
                      />
                    </div>
                    <textarea
                      value={requestReason}
                      onChange={(event) => setRequestReason(event.target.value)}
                      rows={4}
                      placeholder="Reason for follow-up"
                      required
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500"
                    />

                    {requestState.message ? (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          requestState.type === "error"
                            ? "border border-red-200 bg-red-50 text-red-600"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {requestState.message}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={requestState.saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      <Sparkles className="h-4 w-4" />
                      {requestState.saving ? "Sending..." : "Request follow-up"}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="grid gap-3">
                  {[
                    { label: "Category", value: plan.category },
                    { label: "Style", value: plan.style },
                    { label: "Floors", value: plan.floors },
                    { label: "Bedrooms", value: plan.bedrooms || "-" },
                    { label: "Built area", value: plan.builtAreaM2 ? `${plan.builtAreaM2} sqm` : "-" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-slate-950">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Layers3 className="h-4 w-4 text-sky-600" />
                  Smart recommendations
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Users who view one plan usually need alternatives with similar cost, format, or build logic. That recommendation rail is included below.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
