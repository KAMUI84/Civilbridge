import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components & Layouts
import Navbar from "./components/common/Navbar";
import AuthModalHost from "./components/auth/AuthModalHost";
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

// Guards
import RequireAuth from "./app/guards/RequireAuth";
import RequireRole from "./app/guards/RequireRole";

// ─── PAGES ───────────────────────────────────────────────────

// Public
import Home from "./pages/public/Home";
import Marketplace from "./pages/public/Marketplace";
import ListingDetails from "./pages/public/ListingDetails";
import PlansLibrary from "./pages/public/PlansLibrary";
import PlanDetails from "./pages/public/PlanDetails";
import Experts from "./pages/public/Experts";
import Estimator from "./pages/public/Estimator";

// Auth (Pages + Role-specific Logins)
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import LoginAdmin from "./pages/auth/LoginAdmin";
import LoginEngineer from "./pages/auth/LoginEngineer";
import LoginContractor from "./pages/auth/LoginContractor";
import LoginSupplier from "./pages/auth/LoginSupplier";
import LoginStudent from "./pages/auth/LoginStudent";
import LoginHomeBuilder from "./pages/auth/LoginHomeBuilder";

// User Dashboard
import DashboardHome from "./pages/dashboard/DashboardHome";
import Projects from "./pages/dashboard/Projects";
import Estimates from "./pages/dashboard/Estimator";
import Documents from "./pages/dashboard/Documents";
import Team from "./pages/dashboard/Team"; // From snippet 1
import Permits from "./pages/dashboard/PermitGuide";
import AiStudio from "./pages/dashboard/AiStudio";
import RoiTools from "./pages/dashboard/RoiTools";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import VerificationQueue from "./pages/admin/VerificationQueue";

// ─── COMPONENT DEFINITION ─────────────────────────────────────

export default function App() {
  return (
    <>
      {/* <Navbar /> */}

      <Routes>
        {/* 1. PUBLIC ROUTES (Wrapped in PublicLayout) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetails />} />
          <Route path="/plans" element={<PlansLibrary />} />
          <Route path="/plans/:id" element={<PlanDetails />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/estimator" element={<Estimator />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/intelligence" element={<Intelligence />} /> 
        </Route>

        {/* 2. AUTH ROUTES (Supporting both Page and Modal logic) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
          <Route path="estimates" element={<Estimates />} />
          <Route path="documents" element={<Documents />} />
          <Route path="team" element={<Team />} />
          <Route path="permits" element={<Permits />} />
          <Route path="intelligence/ai" element={<AiStudio />} />
          <Route path="intelligence/roi" element={<RoiTools />} />
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
        </Route>

        {/* 5. FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modal Host: Listens to URL for /login or /register to trigger modals */}
      <AuthModalHost />
    </>
  );
}