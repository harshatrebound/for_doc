import { z } from 'zod';

export const patientSchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter your full name')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Please enter a valid name'),
  
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(
      /^\+?[\d\s-]{10,}$/,
      'Please enter a valid phone number'
    ),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long'),
  
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
}); 