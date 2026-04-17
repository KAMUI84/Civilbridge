import {
  AlertTriangle,
  Clock3,
  FileText,
  MapPinned,
  MessageSquare,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Upload,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { aiService } from "../../services/aiService.js";
import { upiService } from "../../services/upiService.js";

const BUILDING_TYPES = [
  "Residential House",
  "Apartment Building",
  "Commercial Building",
  "Industrial Facility",
  "Hospital / Clinic",
  "School / Institution",
];

const ESTIMATE_DELIVERABLES = [
  {
    title: "Bill of Quantities",
    description: "Structured line items for materials, quantities, and review points before procurement.",
    icon: FileText,
  },
  {
    title: "Cost Estimate",
    description: "Benchmark-based pricing with clear notes whenever current market precision still needs review.",
    icon: Wallet,
  },
  {
    title: "Time Outlook",
    description: "A practical construction timeframe with early risks and likely coordination checkpoints.",
    icon: Clock3,
  },
];

function formatCurrency(value, currency = "RWF") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function volatilityTone(volatility) {
  const status = String(volatility?.status || "").toUpperCase();
  if (status === "HIGH") return "border-amber-300 bg-amber-50 text-amber-900";
  if (status === "MODERATE") return "border-sky-300 bg-sky-50 text-sky-900";
  if (status === "STABLE") return "border-emerald-300 bg-emerald-50 text-emerald-900";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function Field({ label, required = false, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

export default function EstimatorStudio() {
  const [projectDescription, setProjectDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [location, setLocation] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [stories, setStories] = useState("1");
  const [landSize, setLandSize] = useState("");
  const [upiCode, setUpiCode] = useState("");
  const [upiState, setUpiState] = useState({ loading: false, error: "", data: null });
  const [uploadForm, setUploadForm] = useState({
    file: null,
    projectType: "",
    location: "",
    notes: "",
    previewUrl: "",
  });
  const [resultState, setResultState] = useState({
    loading: false,
    error: "",
    estimation: null,
    analysis: null,
  });
  const [activeRequest, setActiveRequest] = useState("");
  const [filters, setFilters] = useState({ trade: "", material: "" });

  useEffect(() => {
    if (!upiCode.trim()) {
      setUpiState({ loading: false, error: "", data: null });
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        setUpiState({ loading: true, error: "", data: null });
        const response = await upiService.lookup(upiCode.trim());
        if (!response?.verified) {
          setUpiState({ loading: false, error: "This UPI could not be verified yet.", data: response || null });
          return;
        }
        setUpiState({ loading: false, error: "", data: response });
      } catch (error) {
        setUpiState({ loading: false, error: error.message || "UPI verification failed.", data: null });
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [upiCode]);

  useEffect(() => {
    return () => {
      if (uploadForm.previewUrl) {
        URL.revokeObjectURL(uploadForm.previewUrl);
      }
    };
  }, [uploadForm.previewUrl]);

  const canRunManualEstimate = Boolean(
    projectDescription.trim() && budgetRange.trim() && buildingType && stories && upiState.data?.verified,
  );

  const filteredBoq = useMemo(() => {
    const items = resultState.analysis?.boq || [];
    return items.filter((item) => {
      const matchesTrade =
        !filters.trade || String(item.category || "").toLowerCase().includes(filters.trade.toLowerCase());
      const matchesMaterial =
        !filters.material ||
        `${item.item || ""} ${item.materialSpec || ""}`.toLowerCase().includes(filters.material.toLowerCase());
      return matchesTrade && matchesMaterial;
    });
  }, [filters.material, filters.trade, resultState.analysis?.boq]);

  async function handleManualEstimate(event) {
    event.preventDefault();
    if (!canRunManualEstimate) return;

    try {
      setActiveRequest("manual");
      setResultState({ loading: true, error: "", estimation: null, analysis: null });
      const estimation = await aiService.estimateProject({
        idea: projectDescription,
        budgetRange,
        location,
        timeline: `${stories} storey project`,
        buildingType,
        stories: Number(stories),
        upiData: upiState.data,
        siteConstraints: landSize ? { landSizeSqm: Number(landSize) } : undefined,
      });
      setActiveRequest("");
      setResultState({ loading: false, error: "", estimation: estimation?.estimation || null, analysis: null });
    } catch (error) {
      setActiveRequest("");
      setResultState({
        loading: false,
        error: error.message || "Failed to generate the estimate.",
        estimation: null,
        analysis: null,
      });
    }
  }

  async function handleUploadEstimate(event) {
    event.preventDefault();
    if (!uploadForm.file) {
      setResultState((current) => ({ ...current, error: "Upload a plan before running the takeoff." }));
      return;
    }

    try {
      setActiveRequest("upload");
      setResultState({ loading: true, error: "", estimation: null, analysis: null });
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("projectType", uploadForm.projectType || "Residential House");
      formData.append("location", uploadForm.location);
      formData.append("notes", uploadForm.notes);
      formData.append("provider", "claude");
      const analysis = await aiService.analyzePlan(formData);
      setActiveRequest("");
      setResultState({ loading: false, error: "", estimation: null, analysis: analysis?.analysis || null });
    } catch (error) {
      setActiveRequest("");
      setResultState({
        loading: false,
        error: error.message || "Failed to analyze the uploaded plan.",
        estimation: null,
        analysis: null,
      });
    }
  }

  const pricingBasis = resultState.analysis?.pricingBasis || resultState.estimation?.pricingBasis || null;
  const isImagePreview = Boolean(uploadForm.file?.type?.startsWith("image/") && uploadForm.previewUrl);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="px-4 pb-6 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              CivilBridge Estimator
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Choose the path that matches your project stage.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Upload an existing plan for BOQ analysis, or describe the project in your mind so CivilBridge can build a realistic starting estimate.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Upload Existing Plan</h2>
                <p className="mt-1 text-sm text-slate-500">For users who already have blueprints, PDFs, or sketch plans.</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>CivilBridge analyzes uploaded plans to prepare BOQs, cost estimates, and early timeline guidance.</span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>The takeoff uses benchmark-backed pricing where current market data is available.</span>
              </li>
              <li className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>If a drawing is too complex to read reliably, the system will say so clearly instead of guessing.</span>
              </li>
            </ul>

            <form className="mt-6 grid gap-5" onSubmit={handleUploadEstimate}>
              <label className="grid cursor-pointer gap-3 rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    if (uploadForm.previewUrl) {
                      URL.revokeObjectURL(uploadForm.previewUrl);
                    }
                    setUploadForm((current) => ({
                      ...current,
                      file,
                      previewUrl: file && file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
                    }));
                  }}
                />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <ScanSearch className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {uploadForm.file ? uploadForm.file.name : "Upload a PDF or plan image"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    The AI plans the measurement logic first, then performs the takeoff.
                  </div>
                </div>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Project type">
                  <select
                    value={uploadForm.projectType}
                    onChange={(event) => {
                      setUploadForm((current) => ({ ...current, projectType: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select project type</option>
                    {BUILDING_TYPES.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Location">
                  <input
                    value={uploadForm.location}
                    onChange={(event) => {
                      setUploadForm((current) => ({ ...current, location: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Gasabo, Kigali"
                  />
                </Field>
              </div>

              <Field label="Notes for the checker">
                <textarea
                  value={uploadForm.notes}
                  onChange={(event) => {
                    setUploadForm((current) => ({ ...current, notes: event.target.value }));
                  }}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Mention revisions, wall assumptions, or anything that should be checked carefully."
                />
              </Field>

              <button
                type="submit"
                disabled={!uploadForm.file || resultState.loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Sparkles className="h-4 w-4" />
                {resultState.loading && activeRequest === "upload" ? "Running quantity takeoff..." : "Analyze uploaded plan"}
              </button>
            </form>

          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Describe and calculate</h2>
                <p className="mt-1 text-sm text-slate-500">For users who want CivilBridge to shape a project idea into a realistic first estimate.</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              <p>CivilBridge will structure your idea into a practical estimate, but it will not invent details that are still unknown.</p>
              <p className="mt-2">The estimate button stays locked until the UPI is verified and the required project details are complete.</p>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleManualEstimate}>
              <Field label="Project description" required>
                <textarea
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Describe the house or building you have in mind, including rooms, finish level, and any must-have spaces."
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Budget range" required>
                  <input
                    value={budgetRange}
                    onChange={(event) => setBudgetRange(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="30M - 45M RWF"
                  />
                </Field>

                <Field label="Location">
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Kigali, Musanze, Huye..."
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Building type" required>
                  <select
                    value={buildingType}
                    onChange={(event) => setBuildingType(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select building type</option>
                    {BUILDING_TYPES.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Number of storeys" required>
                  <input
                    type="number"
                    min="1"
                    value={stories}
                    onChange={(event) => setStories(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="UPI code" required>
                  <input
                    value={upiCode}
                    onChange={(event) => setUpiCode(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="UPI-XXXX-XXXX-XXXX"
                  />
                </Field>

                <Field label="Land size (sqm)">
                  <input
                    type="number"
                    min="0"
                    value={landSize}
                    onChange={(event) => setLandSize(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="450"
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
                {upiState.loading ? (
                  <div className="text-slate-600">Verifying UPI with the land record service...</div>
                ) : null}
                {!upiState.loading && upiState.error ? (
                  <div className="text-rose-700">{upiState.error}</div>
                ) : null}
                {!upiState.loading && upiState.data?.verified ? (
                  <div className="space-y-1 text-slate-700">
                    <div className="font-semibold text-emerald-700">UPI verified</div>
                    <div>
                      {upiState.data.plotSizeSqm ? `Plot size: ${upiState.data.plotSizeSqm} sqm` : "Plot size pending"}
                      {upiState.data.zoning ? ` | Zoning: ${upiState.data.zoning}` : ""}
                    </div>
                    {upiState.data.ownerName ? <div>Owner: {upiState.data.ownerName}</div> : null}
                  </div>
                ) : null}
                {!upiState.loading && !upiState.error && !upiState.data ? (
                  <div className="text-slate-600">Enter a UPI so CivilBridge can verify the plot before estimating.</div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={!canRunManualEstimate || resultState.loading || upiState.loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Sparkles className="h-4 w-4" />
                {resultState.loading && activeRequest === "manual" ? "Building your estimate..." : "Generate manual estimate"}
              </button>
            </form>
          </div>
        </div>

        {resultState.error ? (
          <div className="mx-auto mt-6 max-w-6xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {resultState.error}
          </div>
        ) : null}
      </section>

      <section className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Market benchmark context</h2>
              <p className="text-sm text-slate-500">Current Rwanda pricing and volatility cues applied to the estimate when verified data is available.</p>
            </div>
          </div>

          {pricingBasis ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
              <div className={`rounded-2xl border px-4 py-4 ${volatilityTone(pricingBasis.volatility)}`}>
                <div className="text-sm font-semibold">{pricingBasis.volatility?.label || "Benchmark status"}</div>
                <div className="mt-1 text-sm">
                  Range: {formatCurrency(pricingBasis.minCostPerM2, pricingBasis.currency)} - {formatCurrency(pricingBasis.maxCostPerM2, pricingBasis.currency)} per sqm
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
                  {pricingBasis.province}
                  {pricingBasis.district ? `, ${pricingBasis.district}` : ""}
                </div>
                <div className="mt-1">Building type: {pricingBasis.buildingType}</div>
                <div className="mt-1">Updated: {pricingBasis.updatedAt ? new Date(pricingBasis.updatedAt).toLocaleString() : "Unknown"}</div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Run an estimate or upload a plan to see the matching benchmark. If current pricing is not available yet, CivilBridge will say that clearly instead of pretending the numbers are exact.
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">What You&apos;ll Get</h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Clear outputs that help you decide whether to move forward, revise scope, or request expert follow-up.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ESTIMATE_DELIVERABLES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {(resultState.estimation || resultState.analysis) ? (
        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6">
            {resultState.estimation ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-2xl font-bold text-slate-900">Manual estimate outcome</h2>
                <p className="mt-2 text-sm text-slate-500">{resultState.estimation.projectIntent?.summary || "AI estimate ready."}</p>

                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  {(resultState.estimation.feasibleOptions || []).map((option) => (
                    <div key={option.option} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold text-slate-900">{option.option}</div>
                      <div className="mt-1 text-lg font-bold text-blue-700">{option.estimatedCost}</div>
                      <div className="mt-2 text-sm text-slate-600">{option.fit}</div>
                      <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">Trade-offs</div>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-600">
                        {(option.tradeoffs || []).map((tradeoff) => (
                          <li key={tradeoff}>{tradeoff}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">Budget fit</div>
                  <div className="mt-2">{resultState.estimation.budgetFit || "CivilBridge has prepared an initial fit check for this scope."}</div>
                </div>

                {(resultState.estimation.flaggedRisks || []).length ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <AlertTriangle className="h-4 w-4" />
                      Key risks
                    </div>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-800">
                      {resultState.estimation.flaggedRisks.map((risk) => (
                        <li key={risk}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(resultState.estimation.recommendedNextSteps || []).length ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">Recommended next steps</div>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                      {resultState.estimation.recommendedNextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            ) : null}

            {resultState.analysis ? (
              <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-950 px-4 py-5 text-white">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Grand total</div>
                      <div className="mt-2 text-2xl font-bold">
                        {formatCurrency(resultState.analysis.totals?.grandTotal, resultState.analysis.totals?.currency)}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Confidence</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">
                        {Math.round(Number(resultState.analysis.confidence?.overall || 0) * 100)}%
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Line items</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">{resultState.analysis.totals?.lineItems || 0}</div>
                    </div>
                  </div>

                  {resultState.analysis.humanReview?.required ? (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
                        <ShieldCheck className="h-4 w-4" />
                        Maker-checker review required
                      </div>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-800">
                        {(resultState.analysis.humanReview.flaggedItems || []).map((item, index) => (
                          <li key={`${item.item}-${index}`}>
                            {item.item}: {item.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <input
                      value={filters.trade}
                      onChange={(event) => setFilters((current) => ({ ...current, trade: event.target.value }))}
                      placeholder="Filter by trade"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <input
                      value={filters.material}
                      onChange={(event) => setFilters((current) => ({ ...current, material: event.target.value }))}
                      placeholder="Filter by material or item"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Trade</th>
                            <th className="px-4 py-3 font-semibold">Item</th>
                            <th className="px-4 py-3 font-semibold">Qty</th>
                            <th className="px-4 py-3 font-semibold">Unit cost</th>
                            <th className="px-4 py-3 font-semibold">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredBoq.map((item, index) => (
                            <tr key={`${item.item}-${index}`}>
                              <td className="px-4 py-3 text-slate-700">{item.category}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">{item.item}</div>
                                <div className="text-xs text-slate-500">{item.materialSpec}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {formatCurrency(item.unitCost, resultState.analysis.totals?.currency)}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {Math.round(Number(item.confidence || 0) * 100)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Measurement logic</h3>
                    <div className="mt-4 space-y-3">
                      {(resultState.analysis.measurementPlan || []).map((step, index) => (
                        <div key={`${step.element}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="font-semibold text-slate-900">{step.element}</div>
                          <div className="mt-1 text-sm text-slate-700">{step.measurementRule}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{step.formula}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Visual overlay</h3>
                    {isImagePreview ? (
                      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                        <div className="relative">
                          <img src={uploadForm.previewUrl} alt="Uploaded plan preview" className="w-full" />
                          {(resultState.analysis.overlayRegions || []).map((region, index) => (
                            <div
                              key={`${region.label}-${index}`}
                              className="absolute border-2 border-blue-500 bg-blue-500/10"
                              style={{
                                left: `${region.x}%`,
                                top: `${region.y}%`,
                                width: `${region.width}%`,
                                height: `${region.height}%`,
                              }}
                              title={`${region.label} (${Math.round(Number(region.confidence || 0) * 100)}%)`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                        Upload an image plan to see overlay boxes. PDF uploads still return the counted regions below.
                      </div>
                    )}

                    <div className="mt-4 space-y-3">
                      {(resultState.analysis.overlayRegions || []).map((region, index) => (
                        <div key={`${region.label}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="font-semibold text-slate-900">{region.label}</div>
                          <div className="mt-1 text-sm text-slate-600">{region.notes}</div>
                          <div className="mt-2 text-xs text-slate-400">
                            Page {region.page} | {Math.round(Number(region.confidence || 0) * 100)}% confidence
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
