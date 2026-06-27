import { z } from "zod";

/* ---------------- LOGIN ---------------- */
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/* ---------------- REGISTER ---------------- */
export const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

/* ---------------- VERIFY EMAIL ---------------- */
export const verifyEmailSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
