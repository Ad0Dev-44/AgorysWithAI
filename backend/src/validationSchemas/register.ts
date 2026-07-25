import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  companyId: z.string().uuid({ message: "companyId must be a valid UUID" }).optional(),
  companyName: z.string().min(1).optional(),
});