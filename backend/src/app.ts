import express from "express";
import cors from "cors";

import authRoutes from "./modules/routes/auth.routes";
import userRoutes from "./modules/routes/user.routes";
import datasetRoutes from "./routes/dataset.routes";
import aiRoutes from "./ai/ai.routes";

import { errorMiddleware } from "./middlewares/error.middleware.js";
import { requireAuth } from "./middlewares/auth.middleware";

const app = express();

// ---------------- CORE MIDDLEWARE ----------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/ai", requireAuth, aiRoutes);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running smoothly 🚀",
  });
});

// ---------------- ERROR HANDLER (MUST BE LAST) ----------------
app.use(errorMiddleware);

export default app;