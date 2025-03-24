import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// More flexible schedule validation
const scheduleSchema = z.object({
  doctorId: z.string(),
  schedules: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isActive: z.boolean(),
    slotDuration: z.number().int().min(5),
    bufferTime: z.number().int().min(0),
    breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
    breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
    // Accept any other fields but don't validate them
    id: z.any().optional()
  }))
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received schedule update request:", body);

    try {
      const { doctorId, schedules } = scheduleSchema.parse(body);

      // Check if doctor exists
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId }
      });

      if (!doctor) {
        return NextResponse.json(
          { error: `Doctor with ID ${doctorId} not found` },
          { status: 404 }
        );
      }

      // Delete existing schedules
      await prisma.doctorSchedule.deleteMany({
        where: { doctorId }
      });

      // Create new schedules - only including valid fields
      const validScheduleData = schedules.map(schedule => ({
        doctorId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
        slotDuration: schedule.slotDuration,
        bufferTime: schedule.bufferTime,
        breakStart: schedule.breakStart,
        breakEnd: schedule.breakEnd
      }));

      const createdSchedules = await prisma.doctorSchedule.createMany({
        data: validScheduleData
      });

      return NextResponse.json({
        success: true,
        message: 'Schedules updated successfully',
        count: createdSchedules.count
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Zod validation error:', JSON.stringify(err.errors, null, 2));
        return NextResponse.json(
          { 
            error: 'Invalid schedule data', 
            details: err.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('Failed to update schedules:', error);
    return NextResponse.json(
      { error: 'Failed to update schedules', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 