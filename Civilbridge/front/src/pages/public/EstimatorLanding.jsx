import { ArrowRight, MessageSquare, ScanSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { DeliverablesSection, IntelligenceHero } from "./EstimatorShared.jsx";

const START_PATHS = [
  {
    title: "Upload Plan",
    description: "Upload blueprints, PDFs, or sketch plans and let CivilBridge prepare BOQs, cost signals, and review flags.",
    to: "/estimator/upload",
    icon: ScanSearch,
    tone: "bg-blue-600",
  },
  {
    title: "Describe Project",
    description: "Start from the idea in your mind and let CivilBridge turn it into a realistic estimate path with verified land data.",
    to: "/estimator/describe",
    icon: MessageSquare,
    tone: "bg-slate-900",
  },
];

export default function EstimatorLanding() {
  return (
    <div className="min-h-screen bg-slate-50">
      <IntelligenceHero
        title="Precise BOQs, benchmark-aware pricing, and a verified Rwanda land gate."
        description="Manual estimates now wait for verified UPI data, and uploaded plans move through a maker-checker workflow before costing is shown."
      />

      <section className="-mt-8 px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6 lg:p-8">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Choose your starting point</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              One estimator workspace, two dedicated paths.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Select the path that fits your project stage. Each option opens its own dedicated estimator page so the workspace stays focused instead of showing everything at once.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {START_PATHS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group rounded-[28px] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-lg"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${item.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                    Open dedicated page
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <DeliverablesSection />
    </div>
  );
}
