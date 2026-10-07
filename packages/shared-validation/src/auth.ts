import { z } from 'zod';

export const phoneSchema = z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits');
export const otpSchema = z.string().min(4).max(6).regex(/^\d+$/, 'OTP must be numeric');
