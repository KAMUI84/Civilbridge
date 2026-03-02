import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { protect } from "./middlewares/auth.js";
import aiRoutes from "./routes/ai.route.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

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