import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { doctorId, schedules } = body;

    if (!doctorId || !schedules) {
      return NextResponse.json(
        { error: 'Doctor ID and schedules are required' },
        { status: 400 }
      );
    }

    // Delete existing schedules for the doctor
    await prisma.doctorSchedule.deleteMany({
      where: { doctorId }
    });

    // Create new schedules
    const newSchedules = await Promise.all(
      schedules.map(async (schedule: any) => {
        if (!schedule.isActive) return null;

        return await prisma.doctorSchedule.create({
          data: {
            doctorId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isActive: schedule.isActive,
            slotDuration: schedule.slotDuration,
            bufferTime: schedule.bufferTime,
            breakStart: schedule.breakStart,
            breakEnd: schedule.breakEnd,
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: newSchedules.filter(Boolean)
    });
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor schedule' },
      { status: 500 }
    );
  }
} 