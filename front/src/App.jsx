import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { useAuthStore } from "./store/authStore";
import { getRoleDashboardKey } from "./utils/roles";

// Layouts & guards (not lazy — tiny, always needed on first paint)
import PublicLayout    from "./app/layout/PublicLayout";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import RequireAuth     from "./app/guards/RequireAuth";
import RequireRole     from "./app/guards/RequireRole";
import ErrorBoundary   from "./components/common/ErrorBoundary";
import PageTransition  from "./components/common/PageTransition";

// ─── Suspense fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", color: "#6b7280", fontSize: 14, gap: 10,
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        style={{ animation: "cb-app-spin 0.9s linear infinite" }}>
        <style>{`@keyframes cb-app-spin { to { transform:rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.15" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      Loading…
    </div>
  );
}

// ─── Lazy public pages ─────────────────────────────────────────────────────────
const Home               = lazy(() => import("./pages/public/Home"));
const About              = lazy(() => import("./pages/public/About"));
const Contact            = lazy(() => import("./pages/public/Contact"));
const FAQ                = lazy(() => import("./pages/public/FAQ"));
const Uploads            = lazy(() => import("./pages/public/UploadsReal"));
const Intelligence       = lazy(() => import("./pages/public/Intelligence"));
const Marketplace        = lazy(() => import("./pages/public/Marketplace"));
const ListingDetail      = lazy(() => import("./pages/public/ListingDetail"));
const PlansLibrary       = lazy(() => import("./pages/public/PlansLibrary"));
const PlanDetails        = lazy(() => import("./pages/public/PlanDetails"));
const Experts            = lazy(() => import("./pages/public/Experts"));
const ExpertProfile      = lazy(() => import("./pages/public/ExpertProfile"));
const Estimator          = lazy(() => import("./pages/public/Estimator"));
const TermsAndConditions = lazy(() => import("./pages/public/TermsAndConditions"));
const PrivacyPolicy      = lazy(() => import("./pages/public/PrivacyPolicy"));

// ─── Lazy auth pages ───────────────────────────────────────────────────────────
const Login          = lazy(() => import("./pages/public/Login"));
const Register       = lazy(() => import("./pages/public/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword  = lazy(() => import("./pages/auth/ResetPassword"));

// ─── Lazy error pages ──────────────────────────────────────────────────────────
const NotFound   = lazy(() => import("./pages/errors/NotFound"));
const Forbidden  = lazy(() => import("./pages/errors/Forbidden"));
const ServerError = lazy(() => import("./pages/errors/ServerError"));

// ─── Lazy role dashboards ──────────────────────────────────────────────────────
const SuperAdminDashboard  = lazy(() => import("./pages/dashboard/roles/SuperAdminDashboard"));
const AdminDashboard       = lazy(() => import("./pages/dashboard/roles/AdminDashboard"));
const EngineerDashboard    = lazy(() => import("./pages/dashboard/roles/EngineerDashboard"));
const HomeBuilderDashboard = lazy(() => import("./pages/dashboard/roles/HomeBuilderDashboard"));

// ─── Lazy dashboard pages ──────────────────────────────────────────────────────
const UserManagement      = lazy(() => import("./pages/dashboard/UserManagement"));
const ProjectManagement   = lazy(() => import("./pages/dashboard/ProjectManagement"));
const Analytics           = lazy(() => import("./pages/dashboard/Analytics"));
const Settings            = lazy(() => import("./pages/dashboard/Settings"));
const Logs                = lazy(() => import("./pages/dashboard/Logs"));
const Payments            = lazy(() => import("./pages/dashboard/Payments"));
const Tasks               = lazy(() => import("./pages/dashboard/Tasks"));
const Messages            = lazy(() => import("./pages/dashboard/Messages"));
const Files               = lazy(() => import("./pages/dashboard/Files"));
const Profile             = lazy(() => import("./pages/dashboard/Profile"));
const PropertyMarketplace = lazy(() => import("./pages/dashboard/PropertyMarketplace"));
const PlanLibraryEnhanced = lazy(() => import("./pages/dashboard/PlanLibraryEnhanced"));
const EngineerSystem      = lazy(() => import("./pages/dashboard/EngineerSystem"));

// ─── Role-based dashboard router ──────────────────────────────────────────────
const RoleBasedDashboard = () => {
  const { user } = useAuthStore();
  switch (getRoleDashboardKey(user?.role)) {
    case "SUPER_ADMIN": return <SuperAdminDashboard />;
    case "ADMIN":       return <AdminDashboard />;
    case "PROFESSIONAL":return <EngineerDashboard />;
    default:            return <HomeBuilderDashboard />;
  }
};

// ─── PageTransition shorthand ─────────────────────────────────────────────────
const PT = ({ children }) => <PageTransition>{children}</PageTransition>;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 1. PUBLIC */}
          <Route element={<PublicLayout />}>
            <Route path="/"                element={<PT><Home /></PT>} />
            <Route path="/marketplace"     element={<PT><Marketplace /></PT>} />
            <Route path="/marketplace/:id" element={<PT><ListingDetail /></PT>} />
            <Route path="/plans"           element={<PT><PlansLibrary /></PT>} />
            <Route path="/plans/:id"       element={<PT><PlanDetails /></PT>} />
            <Route path="/experts"         element={<PT><Experts /></PT>} />
            <Route path="/experts/:id"     element={<PT><ExpertProfile /></PT>} />
            <Route path="/estimator"       element={<PT><Estimator /></PT>} />
            <Route path="/about"           element={<PT><About /></PT>} />
            <Route path="/contact"         element={<PT><Contact /></PT>} />
            <Route path="/faq"             element={<PT><FAQ /></PT>} />
            <Route path="/terms"           element={<PT><TermsAndConditions /></PT>} />
            <Route path="/privacy"         element={<PT><PrivacyPolicy /></PT>} />
            <Route path="/uploads"         element={<PT><Uploads /></PT>} />
            <Route path="/intelligence"    element={<PT><Intelligence /></PT>} />
            <Route path="/403"             element={<PT><Forbidden /></PT>} />
            <Route path="/500"             element={<PT><ServerError /></PT>} />
          </Route>

          {/* 2. AUTH */}
          <Route path="/login"    element={<PT><Login /></PT>} />
          <Route path="/register" element={<PT><Register /></PT>} />
          <Route path="/forgot-password" element={<PT><ForgotPassword /></PT>} />
          <Route path="/reset-password"  element={<PT><ResetPassword /></PT>} />

          {/* 3. DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index               element={<PT><RoleBasedDashboard /></PT>} />
            <Route path="users"        element={<PT><UserManagement /></PT>} />
            <Route path="projects"     element={<PT><ProjectManagement /></PT>} />
            <Route path="analytics"    element={<PT><Analytics /></PT>} />
            <Route path="settings"     element={<PT><Settings /></PT>} />
            <Route path="logs"         element={<PT><Logs /></PT>} />
            <Route path="payments"     element={<PT><Payments /></PT>} />
            <Route path="tasks"        element={<PT><Tasks /></PT>} />
            <Route path="messages"     element={<PT><Messages /></PT>} />
            <Route path="files"        element={<PT><Files /></PT>} />
            <Route path="profile"      element={<PT><Profile /></PT>} />
            <Route path="marketplace"  element={<PT><PropertyMarketplace /></PT>} />
            <Route path="plan-library" element={<PT><PlanLibraryEnhanced /></PT>} />
            <Route path="engineer-system" element={<PT><EngineerSystem /></PT>} />
          </Route>

          {/* 4. CATCH-ALL → 404 */}
          <Route path="*" element={<PT><NotFound /></PT>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
