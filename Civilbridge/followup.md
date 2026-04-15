# CivilBridge — Follow-up: Audit & Roadmap

This document consolidates the project diagnostic. **Part 1** describes the current state only. **Part 2** proposes solutions mapped to each item in Part 1.

---

# Part 1: The Audit (Project Assessment)

## Red flags

*Immediate security risks, breaking bugs, or severe architectural issues.*

1. **Google sign-in inconsistency (Register / some social flows)** — `Login` uses a Google **ID token** (`GoogleButton` → `credential`), which matches `POST /api/auth/google-login` (`verifyIdToken`). **`Register.jsx` and `SocialLoginButtons.jsx` pass `access_token` from `useGoogleLogin`**, which the backend does not verify as an ID token. Google signup via those paths is likely broken or insecure.

2. **Secrets exposure risk** — Repository or history may contain `.env` (or equivalent) with real DB, JWT, SMTP, or API keys. If ever committed, credentials must be treated as compromised until rotated.

3. **Stale client auth state** — Auth rehydration uses `/api/me` and `httpOnly` cookies but can fall back to **`localStorage` (`cb_user`)** when `/api/me` fails. UI may show a logged-in user while the session is invalid.

4. **Authorization not proven everywhere** — Some IDOR-style gaps were fixed (e.g. documents download, progress milestones), but many resources exist; without a **systematic** ownership/membership check per route, remaining endpoints may still allow cross-tenant access.

5. **CSRF / cookie alignment (regression risk)** — CSRF was moved to a stateless double-submit pattern (`X-CSRF-Token` vs `csrf` cookie). Any client that omits the header on mutations will get `403`; any future server change back to `session` CSRF would break again.

6. **Test or operational endpoints in app code** — Dev-only routes (e.g. test email) risk accidental exposure in production if not gated by environment.

7. **Email templates use hardcoded localhost URLs** — Links in transactional emails point at localhost in some templates, which breaks staging/production UX and undermines trust.

## Weaknesses

*Inefficiency, maintainability, or scalability concerns.*

1. **Dual data access** — Prisma and raw `mysql2` coexist without a single documented boundary; increases drift, duplicate logic, and migration risk.

2. **Domain model drift** — Prisma `Project` and related code historically used inconsistent field names (`creatorId` vs `ownerId` / `userId` in helpers), risking runtime errors and wrong authorization.

3. **Duplicate email stacks overlap** — Multiple email implementations/config keys (`emailService.js`, `email.service.js`; SMTP vs EMAIL env vars) confuse which path runs in production.

4. **Multiple HTTP clients on the frontend** — `apiClientService`, `lib/api`, and ad-hoc `fetch` differ on cookies, CSRF, and error handling.

5. **Performance hot spots** — Sequential DB work in nested loops (e.g. estimation BOQ persistence) will not scale with large BOQs.

6. **RBAC / seeding fragility** — Init paths for permissions have had bugs (e.g. undefined variables in logs/counters); low test coverage on admin/RBAC flows.

7. **Mock-heavy dashboard UIs** — Pages that look complete but use mock data (e.g. payments) mask real integration gaps.

8. **BigInt vs Int inconsistency** — Some Prisma calls use `BigInt(req.user.id)` where schema uses `Int`; works sometimes but signals inconsistency.

## Missing features

*Gaps vs `CivilBridge_Master_Promptt.md` and typical industry practice for this product class.*

1. **API-level monetization gating** — Free preview vs paid full BOQ/PDF/downloads enforced on the server for all estimation modes (plan upload, AI plan, conversational).

2. **Credits / subscriptions** — One free estimation credit on signup; additional access via purchase or subscription; no bypass at API.

3. **Expert review workflow** — Assign → review → approve/reject → annotate → stamp → deliver to client; engineer dashboards wired to real state.

4. **Full project package** — Bundled, permit-oriented PDF outputs (plan + BOQ + timeline + feasibility + procurement) as specified.

5. **UPI / land data integration** — Rwanda land parcel flow (API or guided manual capture) as a first-class input to planning/estimation.

6. **Marketplace privacy rules** — No exact GPS/address publicly; reveal only after verified inquiry — enforced in APIs and UI.

7. **In-app messaging** — Client ↔ professional threaded chat, attachments, per project.

8. **Appointment booking** — Calendar, reminders, linkage to projects.

9. **Real payments** — Mobile money (MTN/Airtel), optional cards, invoices, milestone releases — not mock-only.

10. **Reviews & ratings** — Post-completion reviews tied to completed projects; moderation.

11. **Phone-primary verification & diaspora flows** — SMS OTP as primary path; optional ID upload and verified badge; engineer credential approval.

12. **Analytics & admin metrics** — Revenue, demand, regional heatmaps, expert performance, platform health as specified.

13. **i18n** — English primary, Kinyarwanda secondary for UI.

14. **Object storage for uploads** — Durable, CDN-friendly storage instead of local disk only.

15. **Refresh tokens / session policy** — Spec mentions JWT + refresh; current design is primarily short-lived JWT in `httpOnly` cookie without a documented refresh rotation story.

16. **Observability** — Structured logging, tracing, alerting for AI/payment paths; CI secret scanning.

## Suggested improvements

*High-impact directions that are not exclusively “missing features” or “bugs” but strengthen the product and codebase.*

1. **Unify Google OAuth contract** — One client and one server verification path for all Google entry points.

2. **Canonical auth rehydration** — Treat `/api/me` success as the only “authenticated” signal; clear `cb_user` when session is invalid.

3. **Systematic authorization layer** — Shared middleware/helpers per resource type (`project`, `document`, `estimate`, etc.) with tests.

4. **Vertical slice delivery** — Ship one end-to-end path (register → estimate preview → pay → full report) before widening surface area.

5. **Single integration surface per concern** — One email module, one API client pattern, one env naming convention for SMTP.

6. **OpenAPI or typed contracts** — Reduce frontend/backend drift (`/api/me`, AI response shapes, etc.).

7. **Environment-based URLs in email** — `FRONTEND_URL` / `APP_URL` in all templates.

---

# Part 2: Proposed Solutions (The Roadmap)

*Each item maps to Part 1. Implementation order should be prioritized separately with you.*

## Solutions for red flags

| Ref | Problem | Proposed solution |
|-----|---------|-------------------|
| **RF #1** | Google ID token vs access token mismatch | Standardize on **Google ID token** end-to-end: replace `useGoogleLogin` + `access_token` on Register/SocialLogin with `GoogleLogin` / One Tap credential (same as Login), **or** add a backend path that accepts access token, calls Google userinfo, and issues session (single documented flow). Update `authService.googleLogin` payload to match. |
| **RF #2** | Secrets in repo/history | Remove secrets from tracking; use `.env.example` only; **rotate** DB passwords, JWT secret, SMTP, Gemini, etc.; add **secret scanning** in CI; use a secret manager in production. |
| **RF #3** | Stale `localStorage` vs real session | On mount: if `/api/me` returns 401, **clear** `cb_user` and Zustand auth; do not treat cache as authenticated. Optional: short-lived “profile” cache only after successful `/api/me`. |
| **RF #4** | Authorization gaps | Audit all protected routes; add **resource-scoped checks** (query filters with `userId`/membership or dedicated middleware); document a checklist; add integration tests for IDOR attempts. |
| **RF #5** | CSRF regression risk | Document CSRF contract in README; ensure **all** mutating clients use `apiClientService` (or equivalent) with `credentials: 'include'` and `X-CSRF-Token`; add E2E test for POST with/without CSRF. |
| **RF #6** | Test routes in production | Gate `test-email` and similar behind `NODE_ENV !== 'production'` or `ADMIN` + env flag; remove default personal emails from defaults. |
| **RF #7** | Localhost links in emails | Replace hardcoded URLs with `process.env.FRONTEND_URL` (and optional `EMAIL_LOGO_URL`); verify in staging. |

## Solutions for weaknesses

| Ref | Problem | Proposed solution |
|-----|---------|-------------------|
| **W #1** | Prisma + raw SQL split | Define **bounded contexts**: e.g. “auth/users/AI threads” on Prisma; “legacy marketplace SQL” on pool — or migrate one direction to Prisma with migrations; avoid mixing both for the same table without a plan. |
| **W #2** | Project field drift | Single migration + schema: pick `creatorId` (or rename consistently); update **all** controllers, `ownership.js`, and queries; add DB constraints (FK, indexes). |
| **W #3** | Duplicate email services | **Deprecate** one module; standardize on `email.service.js` (or one chosen file) and one env prefix; update all imports. |
| **W #4** | Multiple HTTP clients | Standardize on **`apiClientService`** for browser calls (cookies + CSRF); delete or wrap `lib/api` to match; ESLint rule or doc to forbid raw `fetch` except rare cases. |
| **W #5** | Sequential BOQ inserts | **Bulk insert** BOQ rows in one or few queries inside a transaction; benchmark with large BOQs. |
| **W #6** | RBAC init bugs | Fix init script; add unit test for `initializeRolePermissions`; run RBAC seed in CI. |
| **W #7** | Mock dashboard data | Label mocks in UI or gate behind `VITE_USE_MOCK_DATA`; replace with real API calls incrementally; empty states when API missing. |
| **W #8** | BigInt vs Int | Normalize `req.user.id` to **number** in middleware or use consistent Int in Prisma calls; remove unnecessary `BigInt()` wrappers. |

## Solutions for missing features

| Ref | Problem | Proposed solution |
|-----|---------|-------------------|
| **MF #1** | No API monetization gating | Add `EstimateEntitlement` / `UserCredit` model; middleware `requirePaidOrPreview`; return **preview DTO** by default; unlock full BOQ/PDF only after payment or active subscription. |
| **MF #2** | Credits/subscriptions | On signup grant one credit in DB; decrement atomically on “full run”; integrate payment provider webhook to add credits or activate subscription. |
| **MF #3** | Expert review workflow | State machine: `DRAFT → PENDING_REVIEW → APPROVED/REJECTED`; engineer queue; notifications; signed PDF metadata. |
| **MF #4** | Project package | Server-side PDF generation (e.g. puppeteer/pdfkit) or template service; store in object storage; version IDs per delivery. |
| **MF #5** | UPI / land | Integration adapter interface (real API when available); fallback form + validation; store normalized land snapshot on estimate/project. |
| **MF #6** | Marketplace privacy | API never returns precise coords/public address until `inquiry_verified`; UI matches; audit listings endpoints. |
| **MF #7** | Messaging | Thread model per project; WebSocket or polling; file refs to object storage; rate limits. |
| **MF #8** | Appointments | `AvailabilitySlot`, `Booking` tables; email reminders; link `booking.projectId`. |
| **MF #9** | Real payments | Choose provider(s) for MoMo/cards; webhooks; idempotent payment records; invoice PDF from same ledger. |
| **MF #10** | Reviews | Allow review only if `project.status === COMPLETED` and user was client; admin flag endpoint. |
| **MF #11** | Phone/diaspora verification | SMS provider for OTP; optional document upload + admin approval workflow; badge on profile API. |
| **MF #12** | Analytics | Aggregate queries + admin UI; export; respect privacy. |
| **MF #13** | i18n | Add `react-i18next` (or similar); extract strings; Kinyarwanda strings phase 2. |
| **MF #14** | Object storage | S3-compatible SDK; presigned uploads; migrate static `/uploads` paths to signed URLs. |
| **MF #15** | Refresh tokens | Issue refresh token in `httpOnly` cookie or rotation table; `/api/auth/refresh`; revoke on logout; short access JWT. |
| **MF #16** | Observability | Structured logs (pino/winston JSON); request IDs; Sentry already partial — extend; GitHub Action `gitleaks` or similar. |

## Solutions for suggested improvements

| Ref | Problem | Proposed solution |
|-----|---------|-------------------|
| **SI #1** | Unify Google OAuth | Same as **RF #1**; document in `CONTRIBUTING` or auth README. |
| **SI #2** | Canonical rehydration | Same as **RF #3**; optional periodic silent `/api/me` heartbeats. |
| **SI #3** | Authorization layer | Same as **RF #4**; extract `assertProjectMember(user, projectId)` shared helper. |
| **SI #4** | Vertical slice | Milestone plan: week 1–2 auth+payments stub; week 3 estimation+gating; week 4 PDF; adjust with you. |
| **SI #5** | Single integration surface | Same as **W #3**, **W #4**; env template one page. |
| **SI #6** | OpenAPI / types | Generate OpenAPI from Express (or hand-maintain); generate TypeScript types for frontend; CI: breaking diff check. |
| **SI #7** | Email URLs | Same as **RF #7**. |

---

*End of document. After you review Part 1, we can reorder Part 2 into a time-boxed roadmap (phases, owners, and acceptance criteria).*
