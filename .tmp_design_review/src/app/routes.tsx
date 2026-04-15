import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Plans } from "./pages/Plans";
import { Marketplace } from "./pages/Marketplace";
import { Estimator } from "./pages/Estimator";
import { AIStudio } from "./pages/AIStudio";
import { Dashboard } from "./pages/Dashboard";
import { RoleSelector } from "./components/RoleSelector";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/plans",
    Component: Plans,
  },
  {
    path: "/marketplace",
    Component: Marketplace,
  },
  {
    path: "/estimator",
    Component: Estimator,
  },
  {
    path: "/ai-studio",
    Component: AIStudio,
  },
  {
    path: "/dashboard",
    Component: RoleSelector,
  },
  {
    path: "/dashboard/:role",
    Component: Dashboard,
  },
]);