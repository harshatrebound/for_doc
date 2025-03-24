import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const scheduleSchema = z.object({
  doctorId: z.string().uuid(),
  schedules: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isActive: z.boolean(),
    slotDuration: z.number().min(5),
    bufferTime: z.number().min(0),
    breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  }))
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, schedules } = scheduleSchema.parse(body);

    // Delete existing schedules
    await prisma.doctorSchedule.deleteMany({
      where: { doctorId }
    });

    // Create new schedules
    const createdSchedules = await prisma.doctorSchedule.createMany({
      data: schedules.map(schedule => ({
        ...schedule,
        doctorId
      }))
    });

    return NextResponse.json({
      success: true,
      message: 'Schedules updated successfully',
      count: createdSchedules.count
    });
  } catch (error) {
    console.error('Failed to update schedules:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update schedules' },
      { status: 500 }
    );
  }
} 