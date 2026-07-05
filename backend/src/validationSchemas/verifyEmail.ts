import { z } from "zod";

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});
