import { NextResponse } from 'next/server';
import { z } from 'zod';

export function validateRequest<T>(schema: z.Schema<T>) {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: error.errors 
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
  };
}

// Common validation schemas
export const appointmentSchema = z.object({
  doctorId: z.string().uuid(),
  patientName: z.string().min(2).max(100),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  notes: z.string().max(500).optional(),
});

export const doctorSchema = z.object({
  name: z.string().min(2).max(100),
  speciality: z.string().min(2).max(100),
  fee: z.number().positive(),
  image: z.string().url().optional(),
});

export const scheduleSchema = z.object({
  doctorId: z.string().uuid(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isActive: z.boolean(),
  slotDuration: z.number().min(5).max(120),
  bufferTime: z.number().min(0).max(60),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
}); 