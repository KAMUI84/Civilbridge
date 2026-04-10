import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import appointmentsService from "../../services/appointmentsService";
import { expertsService } from "../../services/expertsService";
import { Badge, Button, Card, Container } from "../../components/ui";
import SEO from "../../components/seo/SEO";

function formatDateTime(value) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(value) {
  return (value || "Expert")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <Card padding="lg" style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{title}</h2>
          {subtitle ? (
            <p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <div
      style={{
        border: "1px dashed var(--color-border)",
        borderRadius: 16,
        padding: 24,
        textAlign: "center",
        color: "var(--color-text-secondary)",
      }}
    >
      <h3 style={{ margin: "0 0 8px", color: "var(--color-text-primary)" }}>{title}</h3>
      <p style={{ margin: "0 0 16px", lineHeight: 1.5 }}>{message}</p>
      {action}
    </div>
  );
}

export default function ExpertProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthed } = useAuth();
  const [expert, setExpert] = useState(null);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });
  const [bookingForm, setBookingForm] = useState({
    calendarSlotId: "",
    meetingType: "VIDEO",
    notes: "",
  });
  const [bookingState, setBookingState] = useState({ submitting: false, message: "", type: "" });
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [reviewState, setReviewState] = useState({ submitting: false, message: "", type: "" });

  const loadExpert = useCallback(async () => {
    try {
      setState({ loading: true, error: "" });
      const response = await expertsService.getById(id);
      setExpert(response?.expert || null);
      setReviewEligibility(response?.reviewEligibility || null);
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({ loading: false, error: error.message || "Failed to load expert profile." });
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadExpert();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadExpert]);

  useEffect(() => {
    if (searchParams.get("book") && expert?.availability?.length) {
      const bookingSection = document.getElementById("expert-booking-panel");
      bookingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [expert, searchParams]);

  const selectedSlot = useMemo(
    () => expert?.availability?.find((slot) => String(slot.id) === String(bookingForm.calendarSlotId)) || null,
    [bookingForm.calendarSlotId, expert?.availability],
  );

  const submitBooking = useCallback(async () => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    if (!bookingForm.calendarSlotId) {
      setBookingState({ submitting: false, message: "Choose an available slot before continuing.", type: "error" });
      return;
    }

    try {
      setBookingState({ submitting: true, message: "", type: "" });
      const response = await appointmentsService.create({
        providerId: expert.userId,
        calendarSlotId: bookingForm.calendarSlotId,
        meetingType: bookingForm.meetingType,
        notes: bookingForm.notes,
      });

      setBookingState({
        submitting: false,
        message: response?.appointment?.status === "REQUESTED"
          ? "Appointment request sent successfully."
          : "Appointment booked successfully.",
        type: "success",
      });
      setBookingForm({ calendarSlotId: "", meetingType: "VIDEO", notes: "" });
      await loadExpert();
    } catch (error) {
      setBookingState({ submitting: false, message: error.message || "Failed to create appointment.", type: "error" });
    }
  }, [bookingForm.calendarSlotId, bookingForm.meetingType, bookingForm.notes, expert, isAuthed, loadExpert, navigate]);

  const submitReview = useCallback(async (event) => {
    event.preventDefault();
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    try {
      setReviewState({ submitting: true, message: "", type: "" });
      await expertsService.createReview(id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      await loadExpert();
      setReviewForm({ rating: "5", comment: "" });
      setReviewState({ submitting: false, message: "Review submitted successfully.", type: "success" });
    } catch (error) {
      setReviewState({ submitting: false, message: error.message || "Failed to submit review.", type: "error" });
    }
  }, [id, isAuthed, loadExpert, navigate, reviewForm.comment, reviewForm.rating]);

  if (state.loading) {
    return (
      <Container size="xl">
        <div style={{ display: "grid", gap: 20, padding: "40px 0" }}>
          <div style={{ height: 220, borderRadius: 24, background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))" }} />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div style={{ height: 420, borderRadius: 24, background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))" }} />
            <div style={{ height: 420, borderRadius: 24, background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))" }} />
          </div>
        </div>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container size="xl">
        <div style={{ padding: "48px 0" }}>
          <EmptyState
            title="Could not load this expert"
            message={state.error}
            action={<Button onClick={loadExpert}>Retry</Button>}
          />
        </div>
      </Container>
    );
  }

  if (!expert) {
    return (
      <Container size="xl">
        <div style={{ padding: "48px 0" }}>
          <EmptyState
            title="Expert not found"
            message="This profile may have been removed or is not available right now."
            action={<Button onClick={() => navigate("/experts")}>Back to directory</Button>}
          />
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <SEO
        title={expert.user?.fullName || "Expert Profile"}
        description={expert.bio || `${expert.user?.fullName || "Expert"} — ${expert.providerType || "Construction Professional"} on CivilBridge.`}
        image={expert.user?.avatarUrl}
      />
      <div style={{ display: "grid", gap: 24, padding: "32px 0 48px" }}>
        <Card padding="lg" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            {expert.user?.avatarUrl ? (
              <img
                src={expert.user.avatarUrl}
                alt={expert.user?.fullName || "Expert"}
                style={{ width: 120, height: 120, borderRadius: 24, objectFit: "cover", border: "1px solid var(--color-border)" }}
              />
            ) : (
              <div
                aria-hidden="true"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 24,
                  border: "1px solid var(--color-border)",
                  background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "2rem",
                  fontWeight: 800,
                }}
              >
                {getInitials(expert.user?.fullName)}
              </div>
            )}
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ margin: "0 0 8px", fontSize: "2rem", color: "var(--color-text-primary)" }}>
                    {expert.user?.fullName}
                  </h1>
                  <p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                    {expert.user?.profession || expert.providerType} | {expert.region?.name || "Rwanda"} | {expert.businessName || "CivilBridge Expert"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <Badge variant="brand">{expert.providerType}</Badge>
                  {expert.verifiedAt ? <Badge variant="success">Verified</Badge> : null}
                  <Badge variant="default">{Number(expert.avgRating || 0).toFixed(1)} rating</Badge>
                  <Badge variant="default">{expert.reviewCount || 0} reviews</Badge>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(expert.specialties || []).slice(0, 6).map((item) => (
                  <Badge key={item} variant="default">{item}</Badge>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={styles.statTile}>
                  <div style={styles.statLabel}>Credentials</div>
                  <div style={styles.statValue}>{expert.user?.licenseNumber || "Shared on request"}</div>
                </div>
                <div style={styles.statTile}>
                  <div style={styles.statLabel}>Portfolio projects</div>
                  <div style={styles.statValue}>{expert.completedProjectsCount || 0}</div>
                </div>
                <div style={styles.statTile}>
                  <div style={styles.statLabel}>Availability</div>
                  <div style={styles.statValue}>{expert.availability?.length || 0} open slots</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 24 }}>
            <SectionCard
              title="Professional Summary"
              subtitle="Background, specialties, and recent portfolio work from the live expert directory."
            >
              <p style={{ margin: 0, lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
                {expert.user?.bio || "This expert has not added a detailed profile summary yet."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Specialty</div>
                  <div style={styles.detailValue}>{expert.headline || expert.user?.profession || expert.providerType}</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Company</div>
                  <div style={styles.detailValue}>{expert.user?.companyName || "Independent consultant"}</div>
                </div>
                <div style={styles.detailBlock}>
                  <div style={styles.detailLabel}>Contact</div>
                  <div style={styles.detailValue}>{expert.user?.email || "No public email"}</div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Portfolio"
              subtitle="Completed project work and approved documents linked to this expert."
            >
              {!expert.portfolio?.length ? (
                <EmptyState title="No portfolio items yet" message="Approved project packages and finished work will appear here once they are available." />
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {expert.portfolio.map((item) => (
                    <div key={item.id} style={styles.portfolioRow}>
                      <div>
                        <div style={styles.portfolioTitle}>{item.projectName || "Project package"}</div>
                        <div style={styles.portfolioMeta}>
                          {(item.projectType || "Project").replaceAll("_", " ")} | {item.regionName || "Rwanda"} | {item.status}
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                        <Badge variant="default">{item.progress}% progress snapshot</Badge>
                        <div style={styles.portfolioMeta}>{item.latestStage || "No stage logged yet"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Ratings and Reviews"
              subtitle="Submitted only by users with a completed project history with this expert."
            >
              {!expert.reviews?.length ? (
                <EmptyState title="No reviews yet" message="Completed project reviews will appear here once clients submit them." />
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {expert.reviews.map((review) => (
                    <div key={review.id} style={styles.reviewCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div>
                          <div style={styles.reviewAuthor}>{review.reviewer?.fullName || "CivilBridge client"}</div>
                          <div style={styles.reviewMeta}>{formatDateTime(review.createdAt)}</div>
                        </div>
                        <Badge variant="default">{review.rating}/5</Badge>
                      </div>
                      <p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                        {review.comment || "No written comment added."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Submit a Review"
              subtitle="This form only opens for clients who completed a project with this expert."
            >
              {!isAuthed ? (
                <EmptyState
                  title="Sign in to review"
                  message="Your project history is checked before review access is enabled."
                  action={<Button onClick={() => navigate("/login")}>Go to Login</Button>}
                />
              ) : reviewEligibility?.eligible ? (
                <form onSubmit={submitReview} style={{ display: "grid", gap: 14 }}>
                  {reviewState.message ? (
                    <div style={{
                      ...styles.messageBox,
                      background: reviewState.type === "error" ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                      borderColor: reviewState.type === "error" ? "rgba(239,68,68,0.24)" : "rgba(34,197,94,0.24)",
                      color: reviewState.type === "error" ? "#ef4444" : "#22c55e",
                    }}>
                      {reviewState.message}
                    </div>
                  ) : null}

                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
                    <label style={styles.formLabel}>
                      <span style={styles.formLabelText}>Rating</span>
                      <select
                        value={reviewForm.rating}
                        onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
                        style={styles.select}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Needs improvement</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </label>
                    <label style={styles.formLabel}>
                      <span style={styles.formLabelText}>Review</span>
                      <textarea
                        rows={5}
                        value={reviewForm.comment}
                        onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                        placeholder="Share what was delivered well, how the collaboration went, and any helpful project details."
                        style={styles.textarea}
                      />
                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button type="submit" disabled={reviewState.submitting}>
                      {reviewState.submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              ) : (
                <EmptyState
                  title="Review not available yet"
                  message={reviewEligibility?.reason || "A completed project with this expert is required before a review can be submitted."}
                />
              )}
            </SectionCard>
          </div>

          <div id="expert-booking-panel" style={{ display: "grid", gap: 24, position: "sticky", top: 92 }}>
            <SectionCard
              title="Book Appointment"
              subtitle="Choose a live slot, select the meeting type, then confirm the request."
              action={<Button variant="secondary" onClick={() => navigate("/experts")}>Back</Button>}
            >
              {bookingState.message ? (
                <div style={{
                  ...styles.messageBox,
                  background: bookingState.type === "error" ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                  borderColor: bookingState.type === "error" ? "rgba(239,68,68,0.24)" : "rgba(34,197,94,0.24)",
                  color: bookingState.type === "error" ? "#ef4444" : "#22c55e",
                }}>
                  {bookingState.message}
                </div>
              ) : null}

              {!isAuthed ? (
                <EmptyState
                  title="Sign in to book"
                  message="Appointments use your real CivilBridge account so they can be confirmed, cancelled, and reminded correctly."
                  action={<Button onClick={() => navigate("/login")}>Go to Login</Button>}
                />
              ) : (
                <div style={{ display: "grid", gap: 18 }}>
                  <div style={styles.stepper}>
                    {["Select slot", "Meeting type", "Confirm"].map((label, index) => (
                      <div key={label} style={styles.stepRow}>
                        <div style={{
                          ...styles.stepBadge,
                          background: (index === 0 && bookingForm.calendarSlotId) || (index === 1 && bookingForm.meetingType) || (index === 2 && selectedSlot && bookingForm.meetingType)
                            ? "var(--color-brand-600)"
                            : "rgba(148,163,184,0.16)",
                          color: (index === 0 && bookingForm.calendarSlotId) || (index === 1 && bookingForm.meetingType) || (index === 2 && selectedSlot && bookingForm.meetingType)
                            ? "#fff"
                            : "var(--color-text-secondary)",
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ color: "var(--color-text-secondary)" }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={styles.formLabelText}>Available slots</div>
                    {!expert.availability?.length ? (
                      <EmptyState
                        title="No open slots right now"
                        message="This expert has not published a free calendar slot yet. Check back later or message them once a thread is opened."
                      />
                    ) : (
                      <div style={{ display: "grid", gap: 10, maxHeight: 260, overflowY: "auto" }}>
                        {expert.availability.map((slot) => {
                          const checked = String(slot.id) === String(bookingForm.calendarSlotId);
                          return (
                            <label key={slot.id} style={{
                              border: checked ? "1px solid var(--color-brand-600)" : "1px solid var(--color-border)",
                              background: checked ? "rgba(37,99,235,0.08)" : "transparent",
                              borderRadius: 14,
                              padding: 14,
                              cursor: "pointer",
                              display: "grid",
                              gap: 6,
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                <strong style={{ color: "var(--color-text-primary)" }}>{formatDateTime(slot.startsAt)}</strong>
                                <input
                                  type="radio"
                                  name="calendarSlotId"
                                  checked={checked}
                                  value={slot.id}
                                  onChange={(event) => setBookingForm((current) => ({ ...current, calendarSlotId: event.target.value }))}
                                />
                              </div>
                              <div style={{ color: "var(--color-text-secondary)" }}>
                                Ends at {formatDateTime(slot.endsAt)}{slot.notes ? ` | ${slot.notes}` : ""}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={styles.formLabelText}>Meeting type</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { value: "VIDEO", label: "Video consultation" },
                        { value: "IN_PERSON", label: "In-person meeting" },
                      ].map((option) => {
                        const active = bookingForm.meetingType === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setBookingForm((current) => ({ ...current, meetingType: option.value }))}
                            style={{
                              border: active ? "1px solid var(--color-brand-600)" : "1px solid var(--color-border)",
                              borderRadius: 14,
                              padding: "14px 16px",
                              textAlign: "left",
                              background: active ? "rgba(37,99,235,0.08)" : "transparent",
                              color: "var(--color-text-primary)",
                              cursor: "pointer",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label style={styles.formLabel}>
                    <span style={styles.formLabelText}>Project notes</span>
                    <textarea
                      rows={4}
                      value={bookingForm.notes}
                      onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
                      placeholder="Add context for the consultation, the project stage, and anything the expert should prepare."
                      style={styles.textarea}
                    />
                  </label>

                  <div style={styles.confirmCard}>
                    <div style={styles.formLabelText}>Confirmation</div>
                    <div style={styles.confirmRow}><span>Expert</span><strong>{expert.user?.fullName}</strong></div>
                    <div style={styles.confirmRow}><span>Slot</span><strong>{selectedSlot ? formatDateTime(selectedSlot.startsAt) : "Select a slot"}</strong></div>
                    <div style={styles.confirmRow}><span>Meeting type</span><strong>{bookingForm.meetingType === "IN_PERSON" ? "In-person" : "Video"}</strong></div>
                  </div>

                  <Button onClick={submitBooking} disabled={bookingState.submitting || !selectedSlot}>
                    {bookingState.submitting ? "Submitting..." : "Confirm Appointment"}
                  </Button>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </Container>
  );
}

const styles = {
  statTile: {
    border: "1px solid var(--color-border)",
    borderRadius: 16,
    padding: 16,
    background: "rgba(255,255,255,0.02)",
  },
  statLabel: {
    color: "var(--color-text-secondary)",
    fontSize: "0.825rem",
    marginBottom: 6,
  },
  statValue: {
    color: "var(--color-text-primary)",
    fontWeight: 700,
  },
  detailBlock: {
    borderRadius: 16,
    border: "1px solid var(--color-border)",
    padding: 16,
  },
  detailLabel: {
    color: "var(--color-text-secondary)",
    marginBottom: 8,
    fontSize: "0.825rem",
  },
  detailValue: {
    color: "var(--color-text-primary)",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  portfolioRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: 16,
    border: "1px solid var(--color-border)",
    borderRadius: 16,
    alignItems: "center",
  },
  portfolioTitle: {
    color: "var(--color-text-primary)",
    fontWeight: 700,
    marginBottom: 6,
  },
  portfolioMeta: {
    color: "var(--color-text-secondary)",
    fontSize: "0.875rem",
  },
  reviewCard: {
    display: "grid",
    gap: 10,
    padding: 16,
    border: "1px solid var(--color-border)",
    borderRadius: 16,
  },
  reviewAuthor: {
    fontWeight: 700,
    color: "var(--color-text-primary)",
    marginBottom: 4,
  },
  reviewMeta: {
    fontSize: "0.825rem",
    color: "var(--color-text-secondary)",
  },
  formLabel: {
    display: "grid",
    gap: 8,
  },
  formLabelText: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "var(--color-text-primary)",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid var(--color-border)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
    resize: "vertical",
    fontFamily: "inherit",
  },
  select: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid var(--color-border)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
  },
  messageBox: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid transparent",
  },
  stepper: {
    display: "grid",
    gap: 10,
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: "0.875rem",
  },
  confirmCard: {
    display: "grid",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    border: "1px solid var(--color-border)",
    background: "rgba(255,255,255,0.02)",
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    color: "var(--color-text-secondary)",
  },
};

