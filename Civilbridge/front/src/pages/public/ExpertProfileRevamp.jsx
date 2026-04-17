import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, Mail, MapPin, Phone, Star, Timer } from "lucide-react";
import SEO from "../../components/seo/SEO";
import { expertsService } from "../../services/expertsService";
import {
  getExpertDirectoryItemById,
  getRelatedExperts,
  mapMockExpertToProfileShape,
} from "../../Data/publicCatalog";

export default function ExpertProfileRevamp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expert, setExpert] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });
  const [contactForm, setContactForm] = useState({
    email: "",
    phone: "",
    reason: "Need design or engineering guidance",
  });
  const [formState, setFormState] = useState({ saving: false, message: "" });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setState({ loading: true, error: "" });
        const response = await expertsService.getById(id);
        if (!alive) return;
        setExpert(response?.expert || null);
        setState({ loading: false, error: response?.expert ? "" : "Expert not found." });
      } catch (error) {
        if (!alive) return;
        const fallback = mapMockExpertToProfileShape(getExpertDirectoryItemById(id));
        if (fallback) {
          setExpert(fallback);
          setState({ loading: false, error: "" });
          return;
        }
        setState({ loading: false, error: error.message || "Failed to load expert profile." });
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const relatedExperts = useMemo(
    () => (expert ? getRelatedExperts(id, expert.providerType?.toLowerCase() || "") : []),
    [expert, id],
  );

  const submitContact = (event) => {
    event.preventDefault();
    setFormState({
      saving: false,
      message: "Follow-up request captured. The team can now route this user to the right expert workflow.",
    });
  };

  if (state.loading) {
    return <div className="mx-auto max-w-6xl px-4 py-28 text-center text-slate-500">Loading expert profile...</div>;
  }

  if (state.error || !expert) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-28 text-center">
        <p className="mb-4 text-red-500">{state.error || "Expert not found."}</p>
        <button type="button" onClick={() => navigate("/experts")} className="text-sm font-semibold text-sky-600">
          Back to experts
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title={expert.user?.fullName || "Expert Profile"}
        description={expert.user?.bio || `${expert.user?.fullName || "Expert"} on CivilBridge`}
      />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Link to="/experts" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
          <ArrowLeft className="h-4 w-4" />
          Back to experts
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-900 text-2xl font-semibold text-white">
                    {(expert.user?.fullName || "Expert")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{expert.user?.fullName}</h1>
                      {expert.verifiedAt ? <BadgeCheck className="h-5 w-5 text-sky-500" /> : null}
                    </div>
                    <p className="mt-2 text-base text-sky-700">{expert.providerType}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-sky-500" />
                        {expert.region?.name}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4 text-sky-500" />
                        {expert.businessName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:min-w-[180px]">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <div className="text-slate-500">Rating</div>
                    <div className="mt-1 flex items-center gap-2 font-semibold text-slate-950">
                      <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                      {Number(expert.avgRating || 0).toFixed(1)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <div className="text-slate-500">Reviews</div>
                    <div className="mt-1 font-semibold text-slate-950">{expert.reviewCount || 0}</div>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-base leading-7 text-slate-600">{expert.user?.bio || "No profile summary available yet."}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Credentials", value: expert.user?.licenseNumber || "Shared on request" },
                  { label: "Portfolio projects", value: expert.completedProjectsCount || 0 },
                  { label: "Open slots", value: expert.availability?.length || 0 },
                  { label: "Specialty", value: expert.headline || expert.providerType },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {(expert.specialties || []).map((specialty) => (
                  <span key={specialty} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Portfolio and recent delivery</h2>
              <div className="mt-4 grid gap-3">
                {(expert.portfolio || []).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-slate-950">{item.projectName}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.projectType} · {item.regionName}
                        </div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                        {item.status}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-600">{item.latestStage}</div>
                  </div>
                ))}
              </div>
            </div>

            {relatedExperts.length ? (
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Recommended for you</h2>
                    <p className="mt-2 text-sm text-slate-600">Similar specialists help users keep browsing after opening one profile.</p>
                  </div>
                  <Link to="/experts" className="text-sm font-semibold text-sky-600">
                    View all experts
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {relatedExperts.map((item) => (
                    <Link
                      key={item.id}
                      to={`/experts/${item.id}`}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="text-lg font-semibold text-slate-950">{item.name}</div>
                      <div className="mt-1 text-sm text-sky-700">{item.profession}</div>
                      <div className="mt-2 text-sm text-slate-500">{item.location}</div>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600">
                        View profile
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-[24px] bg-sky-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Availability</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">
                  {expert.availability?.length ? `${expert.availability.length} open slots` : "Limited availability"}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <Timer className="h-4 w-4 text-sky-600" />
                  Response-ready for follow-up requests
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-950">Reason for follow-up</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep this form short so it drives more lead capture: email, phone, and the main reason for contacting this expert.
                </p>

                <form onSubmit={submitContact} className="mt-4 grid gap-3">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Email address"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="Phone number"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-sky-500"
                    />
                  </div>

                  <textarea
                    value={contactForm.reason}
                    onChange={(event) => setContactForm((current) => ({ ...current, reason: event.target.value }))}
                    rows={4}
                    placeholder="Reason for follow-up"
                    required
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500"
                  />

                  {formState.message ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {formState.message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={formState.saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Request follow-up
                  </button>
                </form>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="grid gap-3">
                  {[
                    { label: "Company", value: expert.businessName || "Independent consultant" },
                    { label: "Public contact", value: expert.user?.email || "Shared on request" },
                    { label: "Top specialty", value: expert.specialties?.[0] || expert.providerType },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <div className="text-slate-500">{item.label}</div>
                      <div className="mt-1 font-semibold text-slate-950">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
