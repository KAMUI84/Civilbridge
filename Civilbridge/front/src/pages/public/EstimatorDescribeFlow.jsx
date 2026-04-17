import { ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { aiService } from "../../services/aiService.js";
import { upiService } from "../../services/upiService.js";
import {
  BUILDING_TYPES,
  DeliverablesSection,
  Field,
  IntelligenceHero,
  MarketContextCard,
} from "./EstimatorShared.jsx";

export default function EstimatorDescribeFlow() {
  const [projectDescription, setProjectDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [location, setLocation] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [stories, setStories] = useState("1");
  const [landSize, setLandSize] = useState("");
  const [upiCode, setUpiCode] = useState("");
  const [upiState, setUpiState] = useState({ loading: false, error: "", data: null });
  const [resultState, setResultState] = useState({ loading: false, error: "", estimation: null });

  async function handleUpiBlur() {
    if (!upiCode.trim()) {
      setUpiState({ loading: false, error: "", data: null });
      return;
    }

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
  }

  const canRunManualEstimate = Boolean(
    projectDescription.trim() && budgetRange.trim() && buildingType && stories && upiState.data?.verified,
  );

  async function handleManualEstimate(event) {
    event.preventDefault();
    if (!canRunManualEstimate) return;

    try {
      setResultState({ loading: true, error: "", estimation: null });
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
      setResultState({ loading: false, error: "", estimation: estimation?.estimation || null });
    } catch (error) {
      setResultState({
        loading: false,
        error: error.message || "Failed to generate the estimate.",
        estimation: null,
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <IntelligenceHero
        title="Describe the project you have in mind."
        description="CivilBridge uses verified plot data, realistic scope checks, and current benchmark context to shape your idea into an achievable next step."
      />

      <section className="-mt-8 px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <Link to="/estimator" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to estimator options
          </Link>

          <div className="mt-5 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Describe and calculate</h2>
                  <p className="mt-1 text-sm text-slate-500">Use this page when the project is still in your head and you need a realistic starting estimate.</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                <p>CivilBridge will structure your idea into a practical estimate, but it will not invent details that are still unknown.</p>
                <p className="mt-2">The estimate button stays locked until the UPI is verified and the required project details are complete.</p>
              </div>
            </div>

            <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5" onSubmit={handleManualEstimate}>
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
                    onBlur={handleUpiBlur}
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
                {upiState.loading ? <div className="text-slate-600">Verifying UPI with the land record service...</div> : null}
                {!upiState.loading && upiState.error ? <div className="text-rose-700">{upiState.error}</div> : null}
                {!upiState.loading && upiState.data?.verified ? (
                  <div className="space-y-1 text-slate-700">
                    <div className="font-semibold text-emerald-700">UPI verified</div>
                    <div>
                      {upiState.data.plotSizeSqm ? `Plot size: ${upiState.data.plotSizeSqm} sqm` : "Plot size pending"}
                      {upiState.data.zoning ? ` | Zoning: ${upiState.data.zoning}` : ""}
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={!canRunManualEstimate || resultState.loading || upiState.loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Sparkles className="h-4 w-4" />
                {resultState.loading ? "Building your estimate..." : "Generate manual estimate"}
              </button>
            </form>
          </div>

          {resultState.error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{resultState.error}</div>
          ) : null}
        </div>
      </section>

      <MarketContextCard
        pricingBasis={resultState.estimation?.pricingBasis || null}
        emptyText="Run an estimate to see the matching benchmark. If current pricing is not available yet, CivilBridge will say that clearly instead of pretending the numbers are exact."
      />

      {resultState.estimation ? (
        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
          </div>
        </section>
      ) : (
        <DeliverablesSection />
      )}
    </div>
  );
}
