import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import otpRoutes from "./routes/otp.route.js";
import { protect } from "./middlewares/auth.js";
import aiRoutes from "./routes/ai.route.js";
import budgetAnalysisRoutes from "./routes/budgetAnalysis.route.js";
import projectsRoutes from "./modules/projects/projects.routes.js";
import regionsRoutes from "./routes/regions.route.js";
import uploadsRoutes from "./routes/uploads.route.js";
import passwordResetRoutes from "./routes/passwordReset.route.js";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budget", budgetAnalysisRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/password-reset", passwordResetRoutes);

app.get("/api/me", protect, async (req, res) => {
  res.json({ message: "Protected route working", user: req.user });
});

app.get("/health", (req, res) => {
  res.json({ status: "CivilBridge API running" });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the CivilBridge API" });
});

export default app;