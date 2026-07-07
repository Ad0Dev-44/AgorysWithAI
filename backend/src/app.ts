import express from "express";

import authRoutes from "./modules/routes/auth.routes";
import userRoutes from "./modules/routes/user.routes";

import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// ---------------- CORE MIDDLEWARE ----------------
app.use(express.json());

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running smoothly 🚀",
  });
});

// ---------------- ERROR HANDLER (MUST BE LAST) ----------------
app.use(errorMiddleware);

export default app;