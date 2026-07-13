import { z } from "zod";


export const columnMappingSchema = z.object({
  dateColumn: z.string().min(1),
  productColumn: z.string().min(1),
  revenueColumn: z.string().min(1),
});