import { AlertTriangle, Clock3, FileText, MapPinned, ShieldCheck, Wallet } from "lucide-react";

export const BUILDING_TYPES = [
  "Residential House",
  "Apartment Building",
  "Commercial Building",
  "Industrial Facility",
  "Hospital / Clinic",
  "School / Institution",
];

export const ESTIMATE_DELIVERABLES = [
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

export function formatCurrency(value, currency = "RWF") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function volatilityTone(volatility) {
  const status = String(volatility?.status || "").toUpperCase();
  if (status === "HIGH") return "border-amber-300 bg-amber-50 text-amber-900";
  if (status === "MODERATE") return "border-sky-300 bg-sky-50 text-sky-900";
  if (status === "STABLE") return "border-emerald-300 bg-emerald-50 text-emerald-900";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function Field({ label, required = false, children }) {
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

export function IntelligenceHero({ title, description }) {
  return (
    <section className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_32%),linear-gradient(135deg,#0f172a_0%,#162447_54%,#1d2d50_100%)] px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <span className="inline-flex rounded-full border border-white/20 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
          CivilBridge Quantity Intelligence
        </span>
        <div className="mt-7 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-100 sm:text-xl">{description}</p>
        </div>
      </div>
    </section>
  );
}

export function DeliverablesSection() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
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
  );
}

export function MarketContextCard({ pricingBasis, emptyText }) {
  return (
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
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}

export function UploadCareNotice() {
  return (
    <ul className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
      <li className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <span>CivilBridge analyzes uploaded plans to prepare BOQs, cost estimates, and early timeline guidance.</span>
      </li>
      <li className="flex gap-3">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <span>The takeoff uses benchmark-backed pricing where current market data is available.</span>
      </li>
      <li className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <span>If a drawing is too complex to read reliably, the system will say so clearly instead of guessing.</span>
      </li>
    </ul>
  );
}
