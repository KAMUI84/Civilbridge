// src/app/routes.jsx
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./app/layout/PublicLayout";
import DashboardLayout from "./app/layout/DashboardLayout";
import RequireAuth from "./app/guards/RequireAuth";

import Home from "./pages/public/Home";
import Marketplace from "./pages/public/Marketplace";
import ListingDetails from "./pages/public/ListingDetails";
import PlansLibrary from "./pages/public/PlansLibrary";
import PlanDetails from "./pages/public/PlanDetails";
import Experts from "./pages/public/Experts";
import EstimatorPublic from "../pages/public/EstimatorPublic";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

import DashboardHome from "./pages/dashboard/DashboardHome";
import Projects from "./pages/dashboard/Projects";
import ProjectDetails from "./pages/dashboard/ProjectDetails";
import Estimator from "./pages/dashboard/Estimator";
import AiStudio from "../pages/dashboard/AiStudio";
import RoiTools from "./pages/dashboard/RoiTools";
import PermitGuide from "./pages/dashboard/PermitGuide";
import UploadProject from "./pages/dashboard/UploadProject";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<ListingDetails />} />
        <Route path="/plans" element={<PlansLibrary />} />
        <Route path="/plans/:id" element={<PlanDetails />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/estimator" element={<EstimatorPublic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Dashboard (Protected) */}
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
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="estimator" element={<Estimator />} />
        <Route path="upload-plan" element={<UploadProject />} />
        <Route path="intelligence/ai" element={<AiStudio />} />
        <Route path="intelligence/roi" element={<RoiTools />} />
        <Route path="permits" element={<PermitGuide />} />
      </Route>
    </Routes>
  );
}