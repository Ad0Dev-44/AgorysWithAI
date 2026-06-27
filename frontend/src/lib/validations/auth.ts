import { z } from "zod";

/**
 * Login validation schema (frontend)
 * Mirrors backend authentication rules
 */
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Type inferred directly from schema
 * Ensures schema and TypeScript never drift apart
 */
export type LoginFormValues = z.infer<typeof loginSchema>;
