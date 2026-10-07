import { z } from 'zod';

export const shopOnboardSchema = z.object({
  shop_name: z.string().min(2),
  owner_name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/),
  category: z.string().min(1),
  address: z.string().min(5),
  lat: z.number(),
  lng: z.number()
});
