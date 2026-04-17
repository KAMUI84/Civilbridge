import { ArrowLeft, ScanSearch, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aiService } from "../../services/aiService.js";
import {
  BUILDING_TYPES,
  DeliverablesSection,
  Field,
  formatCurrency,
  IntelligenceHero,
  MarketContextCard,
  UploadCareNotice,
} from "./EstimatorShared.jsx";

export default function EstimatorUploadFlow() {
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
    analysis: null,
  });
  const isImagePreview = Boolean(uploadForm.file?.type?.startsWith("image/") && uploadForm.previewUrl);

  async function handleUploadEstimate(event) {
    event.preventDefault();
    if (!uploadForm.file) {
      setResultState({ loading: false, error: "Upload a plan before running the takeoff.", analysis: null });
      return;
    }

    try {
      setResultState({ loading: true, error: "", analysis: null });
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("projectType", uploadForm.projectType || "Residential House");
      formData.append("location", uploadForm.location);
      formData.append("notes", uploadForm.notes);
      formData.append("provider", "claude");
      const analysis = await aiService.analyzePlan(formData);
      setResultState({ loading: false, error: "", analysis: analysis?.analysis || null });
    } catch (error) {
      setResultState({
        loading: false,
        error: error.message || "Failed to analyze the uploaded plan.",
        analysis: null,
      });
    }
  }

  const filteredBoq = useMemo(() => resultState.analysis?.boq || [], [resultState.analysis?.boq]);

  return (
    <div className="min-h-screen bg-slate-50">
      <IntelligenceHero
        title="Upload a plan for quantity intelligence."
        description="CivilBridge reads the plan carefully, prepares the measurement logic first, and only then produces BOQ and benchmark-aware costing signals."
      />

      <section className="-mt-8 px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <Link to="/estimator" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to estimator options
          </Link>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <ScanSearch className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Upload existing plan</h2>
                  <p className="mt-1 text-sm text-slate-500">Use this page when you already have a blueprint, PDF, or sketch plan.</p>
                </div>
              </div>

              <div className="mt-5">
                <UploadCareNotice />
              </div>
            </div>

            <form className="grid gap-5 rounded-[28px] border border-slate-200 bg-slate-50 p-5" onSubmit={handleUploadEstimate}>
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
                <div className="font-semibold text-slate-900">
                  {uploadForm.file ? uploadForm.file.name : "Upload a PDF or plan image"}
                </div>
                <div className="text-sm text-slate-500">The file stays in this focused upload workspace.</div>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Project type">
                  <select
                    value={uploadForm.projectType}
                    onChange={(event) => setUploadForm((current) => ({ ...current, projectType: event.target.value }))}
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
                    onChange={(event) => setUploadForm((current) => ({ ...current, location: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Gasabo, Kigali"
                  />
                </Field>
              </div>

              <Field label="Notes for the checker">
                <textarea
                  value={uploadForm.notes}
                  onChange={(event) => setUploadForm((current) => ({ ...current, notes: event.target.value }))}
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
                {resultState.loading ? "Running quantity takeoff..." : "Analyze uploaded plan"}
              </button>
            </form>
          </div>

          {resultState.error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{resultState.error}</div>
          ) : null}
        </div>
      </section>

      <MarketContextCard
        pricingBasis={resultState.analysis?.pricingBasis || null}
        emptyText="Run a plan analysis to see the matching benchmark. If current pricing is not available yet, CivilBridge will say that clearly instead of pretending the numbers are exact."
      />

      {resultState.analysis ? (
        <section className="px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1.1fr,0.9fr]">
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

              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Trade</th>
                        <th className="px-4 py-3 font-semibold">Item</th>
                        <th className="px-4 py-3 font-semibold">Qty</th>
                        <th className="px-4 py-3 font-semibold">Unit cost</th>
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
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    Upload an image plan to see overlay boxes. PDF uploads still return the counted regions below.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <DeliverablesSection />
      )}
    </div>
  );
}
