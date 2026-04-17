import {
  ArrowRight,
  BellRing,
  Bot,
  Building2,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  getExpertsDirectory,
  getMarketplaceListings,
  getNotificationWorkflow,
  getPlanLibraryItems,
} from "../../Data/publicCatalog";

const featuredListings = getMarketplaceListings().slice(0, 3);
const featuredPlans = getPlanLibraryItems().slice(0, 3);
const featuredExperts = getExpertsDirectory().slice(0, 3);
const notificationWorkflow = getNotificationWorkflow();

const workspaceNotes = [
  "Chat history stays on the left for quick context switching.",
  "The active conversation gets a dedicated center workspace.",
  "Recommendations and follow-up actions stay visible without crowding the task area.",
];

const platformMoves = [
  {
    icon: MapPin,
    title: "Marketplace, Plans, Experts",
    copy: "Large preview cards, tighter spacing, and direct click-through into richer detail pages.",
  },
  {
    icon: Bot,
    title: "Focused AI Workspace",
    copy: "A dedicated planning surface keeps the assistant accessible without taking over the rest of the product.",
  },
  {
    icon: BellRing,
    title: "Live Notification Flow",
    copy: "Role-aware updates stay in sync through the existing socket-backed notification service.",
  },
];

function SectionFrame({ eyebrow, title, copy, action, children }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              {eyebrow}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
            {copy ? <p className="mt-3 text-base leading-7 text-slate-300">{copy}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

function HeroWorkspacePreview({ aiWorkspaceLink }) {
  return (
    <div className="grid gap-4 rounded-[28px] border border-slate-800 bg-slate-950/80 p-4 shadow-[0_30px_80px_rgba(8,15,32,0.55)] backdrop-blur">
      <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-4">
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/90 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Chat History</p>
              <p className="text-xs text-slate-400">Left-side recall</p>
            </div>
            <div className="rounded-full bg-teal-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-200">
              Live
            </div>
          </div>
          <div className="space-y-2">
            {[
              "4-bedroom estimate review",
              "Marketplace shortlist for Gasabo",
              "Engineer follow-up notes",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-2xl border px-3 py-3 text-sm ${
                  index === 0
                    ? "border-teal-500/40 bg-teal-500/12 text-white"
                    : "border-slate-800 bg-slate-950/70 text-slate-300"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/60 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Active Workspace</p>
                <p className="text-sm text-slate-400">One clear panel for the live task</p>
              </div>
              <Link
                to={aiWorkspaceLink}
                className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-100 transition hover:border-teal-400/60 hover:bg-teal-500/20"
              >
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="mr-10 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                I need a 3-bedroom plan under 50M RWF with room for phased expansion.
              </div>
              <div className="ml-10 rounded-2xl border border-teal-500/30 bg-teal-500/12 px-4 py-3 text-sm text-teal-50">
                I can compare suitable plans, estimate construction cost, and suggest experts for follow-up.
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {workspaceNotes.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <CheckCircle2 className="mb-3 h-5 w-5 text-teal-300" />
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ to, image, title, eyebrow, meta, summary, tone = "teal" }) {
  const toneClasses =
    tone === "blue"
      ? "from-sky-500/25 via-slate-950 to-slate-950"
      : tone === "slate"
        ? "from-slate-500/20 via-slate-950 to-slate-950"
        : "from-teal-500/25 via-slate-950 to-slate-950";

  return (
    <Link
      to={to}
      className="group grid overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 transition duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-[0_24px_60px_rgba(6,182,212,0.12)]"
    >
      <div className={`relative aspect-[16/11] overflow-hidden bg-gradient-to-br ${toneClasses}`}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
          {eyebrow}
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:p-6">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">{meta}</p>
        </div>
        <p className="text-sm leading-6 text-slate-300">{summary}</p>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200">
          View details
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function HomeRevamp() {
  const { user, isAuthenticated } = useAuthStore();
  const firstName =
    (user?.fullName || user?.full_name || user?.name || "").split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Builder";
  const aiWorkspaceLink = isAuthenticated ? "/dashboard/ai-studio" : "/intelligence";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]" />
        <div className="relative mx-auto grid w-full max-w-[1480px] gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_640px] lg:px-8 lg:pb-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
              Modern Engineering Workspace
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Bigger listings, tighter layout, and a focused AI workspace for real project work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              CivilBridge now centers the core journeys: browse plans, compare marketplace options,
              evaluate experts, and move directly into a follow-up workflow without wasting screen space.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={aiWorkspaceLink}
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Open AI Workspace
                <Sparkles className="h-4 w-4" />
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard" : "/plans"}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
              >
                {isAuthenticated ? "Go to Dashboard" : "Browse Plans"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Focused Work Area", value: "1 central task view" },
                { label: "Click-Through Catalogs", value: "Plans, Marketplace, Experts" },
                { label: "Live Updates", value: "Socket-backed notifications" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm text-teal-50">
                <LayoutDashboard className="h-4 w-4" />
                Welcome back, {firstName}. Your dashboard and AI workspace are ready.
              </div>
            ) : null}
          </div>

          <HeroWorkspacePreview aiWorkspaceLink={aiWorkspaceLink} />
        </div>
      </section>

      <SectionFrame
        eyebrow="Platform Moves"
        title="Navigation stays lean while the work surfaces get richer."
        copy="The primary navigation now focuses on where users can go. Detail and onboarding copy lives inside pages where it helps instead of cluttering the bar."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {platformMoves.map((item) => (
            <div key={item.title} className="rounded-[26px] border border-slate-800 bg-slate-900/70 p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/12 text-teal-200">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.copy}</p>
            </div>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame
        eyebrow="Marketplace"
        title="Listings get more room to breathe."
        copy="We reduced the page chrome and gave the main cards more space so users can judge image quality, location, and specs faster."
        action={
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200">
            See all listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredListings.map((listing, index) => (
            <CatalogCard
              key={listing.id}
              to={`/marketplace/${listing.id}`}
              image={listing.image}
              title={listing.title}
              eyebrow={listing.tag}
              meta={`${listing.location} · ${listing.priceLabel}`}
              summary={listing.shortDescription}
              tone={index === 1 ? "blue" : "teal"}
            />
          ))}
        </div>
      </SectionFrame>

      <SectionFrame
        eyebrow="Plan Library"
        title="Plan detail pages now support the follow-up journey."
        copy="Every plan can lead into a richer detail page with technical specs, clear reasons for follow-up, and recommended alternatives that keep people exploring."
        action={
          <Link to="/plans" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200">
            Open the library
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredPlans.map((plan, index) => (
            <CatalogCard
              key={plan.id}
              to={`/plans/${plan.id}`}
              image={plan.image}
              title={plan.title}
              eyebrow={plan.tier}
              meta={`${plan.format} · ${plan.sheets} sheets · ${plan.price}`}
              summary={plan.summary}
              tone={index === 2 ? "slate" : "teal"}
            />
          ))}
        </div>
      </SectionFrame>

      <SectionFrame
        eyebrow="Expert Network"
        title="Professional profiles are built to keep the conversation moving."
        copy="Users can move from discovery into a practical contact reason, and they can keep browsing through similar verified experts instead of dropping out after one page."
        action={
          <Link to="/experts" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200">
            Meet the experts
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredExperts.map((expert) => (
            <Link
              key={expert.id}
              to={`/experts/${expert.id}`}
              className="group rounded-[28px] border border-slate-800 bg-slate-900/75 p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-[0_24px_60px_rgba(20,184,166,0.12)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white"
                  style={{ backgroundColor: expert.color }}
                >
                  {expert.initials}
                </div>
                <div className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {expert.available ? "Available" : "Busy"}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white">{expert.name}</h3>
              <p className="mt-1 text-sm text-teal-200">{expert.profession}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{expert.bio}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                <span>{expert.location}</span>
                <span>RWF {expert.rate.toLocaleString()}/hr</span>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-teal-200">
                View full profile
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame
        eyebrow="Role-Based Notifications"
        title="The platform keeps every stakeholder aligned."
        copy="The notification layer is organized by responsibility so the right person gets the right message with the minimum amount of noise."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {notificationWorkflow.map((flow) => (
            <div key={flow.role} className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6">
              <div className={`mb-4 inline-flex rounded-full ${flow.accent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white`}>
                {flow.role}
              </div>
              <h3 className="text-xl font-semibold text-white">{flow.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                <span className="font-semibold text-slate-100">Notified when:</span> {flow.notifiedWhen}
              </p>
              <div className="mt-5 grid gap-2">
                {flow.keyInformation.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-teal-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionFrame>

      <section className="border-t border-slate-900 py-16">
        <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div className="rounded-[30px] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
              Ready to move
            </div>
            <h2 className="text-3xl font-semibold text-white">From first click to follow-up, the workflow is now clearer.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Browse a larger catalog, open richer detail pages, trigger essential contact forms, and keep conversations inside a dedicated workspace that feels intentional.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                {isAuthenticated ? "Go to Dashboard" : "Create an Account"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              >
                Browse Marketplace
                <Building2 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[30px] border border-slate-800 bg-slate-900/75 p-6">
            {[
              { icon: FileText, label: "Detail pages", value: "Specs + follow-up" },
              { icon: Users, label: "Expert discovery", value: "Profile to booking" },
              { icon: Network, label: "Realtime sync", value: "Socket notifications" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <item.icon className="mb-3 h-5 w-5 text-teal-300" />
                <div className="text-sm text-slate-400">{item.label}</div>
                <div className="mt-1 text-lg font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
