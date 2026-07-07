import { Router } from "express";

import { authController } from "../auth/auth.controller";

import { validate } from "../../middlewares/validate.middleware";

import { registerSchema } from "../../validationSchemas/register";
import { loginSchema } from "../../validationSchemas/login";
import { refreshSchema } from "../../validationSchemas/refresh";
import { forgotPasswordSchema } from "../../validationSchemas/forgotPassword";
import { resetPasswordSchema } from "../../validationSchemas/resetPassword";

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