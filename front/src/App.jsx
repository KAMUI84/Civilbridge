import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components & Layouts
import Navbar from "./components/common/Navbar";
import PageTransition from "./components/common/PageTransition";
// import AuthModalHost from "./components/auth/AuthModalHost";
import PublicLayout from "./app/layout/PublicLayout";
import DashboardLayout from "./app/layout/DashboardLayout";
import AdminLayout from "./app/layout/AdminLayout";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Pricing from "./pages/public/Pricing";
import FAQ from "./pages/public/FAQ";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import Uploads from "./pages/public/Uploads";
import Intelligence from "./pages/public/Intelligence";
import AuthLayout from "./Layout/AuthLayout";

// Guards
import RequireAuth from "./app/guards/RequireAuth";
import RequireRole from "./app/guards/RequireRole";

// ─── PAGES ───────────────────────────────────────────────────

// Public
import Home from "./pages/public/Home";
import Marketplace from "./pages/public/Marketplace";
import ListingDetail from "./pages/public/ListingDetail";
import PlansLibrary from "./pages/public/PlansLibrary";
import PlanDetails from "./pages/public/PlanDetails";
import Experts from "./pages/public/Experts";
import Estimator from "./pages/public/Estimator";

// Auth (Pages + Role-specific Logins)
import Login from "./pages/auth/ModernLogin";
import Register from "./pages/auth/ModernRegister";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import LoginAdmin from "./pages/auth/LoginAdmin";
import LoginEngineer from "./pages/auth/LoginEngineer";
import LoginContractor from "./pages/auth/LoginContractor";
import LoginSupplier from "./pages/auth/LoginSupplier";
import LoginStudent from "./pages/auth/LoginStudent";
import LoginHomeBuilder from "./pages/auth/LoginHomeBuilder";

// User Dashboard
import DashboardHome from "./pages/dashboard/DashboardHome";
import Projects from "./pages/dashboard/Projects";
import ProjectDetail from "./pages/dashboard/ProjectDetail";
import Estimates from "./pages/dashboard/Estimator";
import BudgetAnalysis from "./pages/dashboard/BudgetAnalysis";
import Documents from "./pages/dashboard/Documents";
import Team from "./pages/dashboard/Team";
import Permits from "./pages/dashboard/PermitGuide";
import AiStudio from "./pages/dashboard/AiStudio";
import RoiTools from "./pages/dashboard/RoiTools";
import CreateListing from "./pages/dashboard/CreateListing";
import CreatePlan from "./pages/dashboard/CreatePlan";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import VerificationQueue from "./pages/admin/VerificationQueue";
import PlansManagement from "./pages/admin/PlansManagement";
import ListingsManagement from "./pages/admin/ListingsManagement";
import CatalogManagement from "./pages/admin/CatalogManagement";

// ─── COMPONENT DEFINITION ─────────────────────────────────────

export default function App() {
  return (
    <>
      {/* <Navbar /> */}

      <Routes>
        {/* 1. PUBLIC ROUTES (Wrapped in PublicLayout) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
          <Route path="/marketplace/:id" element={<PageTransition><ListingDetail /></PageTransition>} />
          <Route path="/plans" element={<PageTransition><PlansLibrary /></PageTransition>} />
          <Route path="/plans/:id" element={<PageTransition><PlanDetails /></PageTransition>} />
          <Route path="/experts" element={<PageTransition><Experts /></PageTransition>} />
          <Route path="/estimator" element={<PageTransition><Estimator /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/uploads" element={<PageTransition><Uploads /></PageTransition>} />
          <Route path="/intelligence" element={<PageTransition><Intelligence /></PageTransition>} />
        </Route>

        {/* 2. AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AuthLayout />}>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/login/admin" element={<LoginAdmin />} />
        <Route path="/login/engineer" element={<LoginEngineer />} />
        <Route path="/login/contractor" element={<LoginContractor />} />
        <Route path="/login/supplier" element={<LoginSupplier />} />
        <Route path="/login/student" element={<LoginStudent />} />
        <Route path="/login/home-builder" element={<LoginHomeBuilder />} />

        {/* 3. USER DASHBOARD (Protected) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="estimates" element={<Estimates />} />
          <Route path="budget-analysis" element={<BudgetAnalysis />} />
          <Route path="documents" element={<Documents />} />
          <Route path="team" element={<Team />} />
          <Route path="permits" element={<Permits />} />
          <Route path="intelligence/ai" element={<AiStudio />} />
          <Route path="intelligence/roi" element={<RoiTools />} />
          <Route path="listings/new" element={<CreateListing />} />
          <Route path="plans/new" element={<CreatePlan />} />
        </Route>

        {/* 4. ADMIN DASHBOARD (Protected + Role Guard) */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireRole allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RequireRole>
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="verification" element={<VerificationQueue />} />
          <Route path="plans" element={<PlansManagement />} />
          <Route path="listings" element={<ListingsManagement />} />
          <Route path="catalog" element={<CatalogManagement />} />
        </Route>

        {/* 5. FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modal Host: Listens to URL for /login or /register to trigger modals */}
      {/* <AuthModalHost /> */}
    </>
  );
}