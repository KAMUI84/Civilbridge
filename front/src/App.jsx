import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Store
import { useAuthStore } from "./store/authStore";

// Components & Layouts
import Navbar from "./components/common/Navbar";
import PageTransition from "./components/common/PageTransition";
import PublicLayout from "./app/layout/PublicLayout";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import AuthLayout from "./Layout/AuthLayout";

// Guards
import RequireAuth from "./app/guards/RequireAuth";
import RequireRole from "./app/guards/RequireRole";

// ─── PAGES ───────────────────────────────────────────────────

// Public
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import FAQ from "./pages/public/FAQ";
import Uploads from "./pages/public/Uploads";
import Intelligence from "./pages/public/Intelligence";
import Marketplace from "./pages/public/Marketplace";
import ListingDetail from "./pages/public/ListingDetail";
import PlansLibrary from "./pages/public/PlansLibrary";
import PlanDetails from "./pages/public/PlanDetails";
import Experts from "./pages/public/Experts";
import Estimator from "./pages/public/Estimator";

// Auth Pages
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Terms & Privacy Pages
import TermsAndConditions from "./pages/public/TermsAndConditions";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";

// Role-Based Dashboards
import SuperAdminDashboard from "./pages/dashboard/roles/SuperAdminDashboard";
import AdminDashboard from "./pages/dashboard/roles/AdminDashboard";
import EngineerDashboard from "./pages/dashboard/roles/EngineerDashboard";
import HomeBuilderDashboard from "./pages/dashboard/roles/HomeBuilderDashboard";

// Dashboard Components
import UserManagement from "./pages/dashboard/UserManagement";
import ProjectManagement from "./pages/dashboard/ProjectManagement";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import Logs from "./pages/dashboard/Logs";
import Payments from "./pages/dashboard/Payments";
import Tasks from "./pages/dashboard/Tasks";
import Messages from "./pages/dashboard/Messages";
import Files from "./pages/dashboard/Files";
import Profile from "./pages/dashboard/Profile";

// Enhanced Components
import PropertyMarketplace from "./pages/dashboard/PropertyMarketplace";
import PlanLibraryEnhanced from "./pages/dashboard/PlanLibraryEnhanced";
import EngineerSystem from "./pages/dashboard/EngineerSystem";

// Role-Based Dashboard Router
const RoleBasedDashboard = () => {
  const { user } = useAuthStore();
  
  switch(user?.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'ENGINEER':
      return <EngineerDashboard />;
    case 'CLIENT':
      return <HomeBuilderDashboard />;
    default:
      return <HomeBuilderDashboard />; // Default to standard build dashboard
  }
};

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
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
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

        {/* 3. DASHBOARD (Protected - Role-Based) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<RoleBasedDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="logs" element={<Logs />} />
          <Route path="payments" element={<Payments />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="messages" element={<Messages />} />
          <Route path="files" element={<Files />} />
          <Route path="profile" element={<Profile />} />
          {/* Enhanced Features */}
          <Route path="marketplace" element={<PropertyMarketplace />} />
          <Route path="plan-library" element={<PlanLibraryEnhanced />} />
          <Route path="engineer-system" element={<EngineerSystem />} />
        </Route>

        {/* 4. FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modal Host: Listens to URL for /login or /register to trigger modals */}
      {/* <AuthModalHost /> */}
    </>
  );
}
