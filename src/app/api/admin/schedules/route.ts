import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId');

  if (!doctorId) {
    return NextResponse.json(
      { error: 'Doctor ID is required' },
      { status: 400 }
    );
  }

  try {
    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doctorId, schedules } = body;

    if (!doctorId || !schedules || !Array.isArray(schedules)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Delete existing schedules for the doctor
    await prisma.doctorSchedule.deleteMany({
      where: { doctorId },
    });

    // Create new schedules
    const createdSchedules = await prisma.doctorSchedule.createMany({
      data: schedules.map(schedule => ({
        doctorId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
        slotDuration: schedule.slotDuration,
        bufferTime: schedule.bufferTime,
        breakStart: schedule.breakStart,
        breakEnd: schedule.breakEnd,
      })),
    });

    return NextResponse.json(createdSchedules);
  } catch (error) {
    console.error('Failed to update schedules:', error);
    return NextResponse.json(
      { error: 'Failed to update schedules' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { scheduleId, ...updateData } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const updatedSchedule = await prisma.doctorSchedule.update({
      where: { id: scheduleId },
      data: updateData,
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
} 