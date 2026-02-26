import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import { isAuthed } from "./store/authStore";

import Home from "./pages/public/Home";
import Marketplace from "./pages/public/Marketplace";
import ListingDetails from "./pages/public/ListingDetails";
import PlansLibrary from "./pages/public/PlansLibrary";
import PlanDetails from "./pages/public/PlanDetails";
import Experts from "./pages/public/Experts";
import Estimator from "./pages/public/Estimator";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

import DashboardLayout from "./app/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Projects from "./pages/dashboard/Projects";
import Estimates from "./pages/dashboard/Estimator";
import Documents from "./pages/dashboard/Documents";
import Team from "./pages/dashboard/Team";
import Permits from "./pages/dashboard/PermitGuide";
import AiStudio from "./pages/dashboard/AiStudio";

import AdminLayout from "./app/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import VerificationQueue from "./pages/admin/VerificationQueue";

function ProtectedRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<ListingDetails />} />
        <Route path="/plans" element={<PlansLibrary />} />
        <Route path="/plans/:id" element={<PlanDetails />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/estimator" element={<Estimator />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="projects" element={<Projects />} />
          <Route path="estimates" element={<Estimates />} />
          <Route path="documents" element={<Documents />} />
          <Route path="team" element={<Team />} />
          <Route path="permits" element={<Permits />} />
          <Route path="ai-studio" element={<AiStudio />} />
        </Route>

        {/* Admin Dashboard (Protected + Unique) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="verification" element={<VerificationQueue />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}