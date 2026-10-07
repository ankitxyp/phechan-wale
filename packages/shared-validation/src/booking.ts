import { z } from 'zod';

export const reservationCreateSchema = z.object({
  listing_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  quantity: z.number().int().positive().default(1)
});
