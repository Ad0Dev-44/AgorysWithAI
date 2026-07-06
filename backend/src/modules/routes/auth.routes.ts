import { Router } from "express";

import { authController } from "../auth/auth.controller.ts";

import { validate } from "../../middlewares/validate.middleware.ts";

import { registerSchema } from "../../validationSchemas/register.ts";
import { loginSchema } from "../../validationSchemas/login.ts";
import { refreshSchema } from "../../validationSchemas/refresh.ts";
import { forgotPasswordSchema } from "../../validationSchemas/forgotPassword.ts";
import { resetPasswordSchema } from "../../validationSchemas/resetPassword.ts";

const router = Router();

// ---------------- REGISTER ----------------
router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController)
);

// ---------------- LOGIN ----------------
router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

// ---------------- REFRESH ----------------
router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh.bind(authController)
);

// ---------------- LOGOUT ----------------
router.post(
  "/logout",
  validate(refreshSchema),
  authController.logout.bind(authController)
);

// ---------------- FORGOT PASSWORD ----------------
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

// ---------------- RESET PASSWORD ----------------
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

export default router;