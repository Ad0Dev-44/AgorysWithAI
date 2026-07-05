import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// ---------------- CORE MIDDLEWARE ----------------
app.use(express.json());

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);

// ---------------- HEALTH CHECK ROUTE ----------------
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running smoothly 🚀",
  });
});

// ---------------- ERROR HANDLER (MUST BE LAST) ----------------
app.use(errorMiddleware);

export default app;