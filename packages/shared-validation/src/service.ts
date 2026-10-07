import { z } from 'zod';

export const serviceRequestCreateSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(10),
  photo_url: z.string().url().optional()
});
