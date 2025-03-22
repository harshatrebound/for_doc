import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get doctor's schedule
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const schedule = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: id,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// Create or update schedule
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, isActive } = body;

    // Validate required fields
    if (typeof dayOfWeek !== 'number' || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const existingSchedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: id,
        dayOfWeek,
      },
    });

    let schedule;
    if (existingSchedule) {
      // Update existing schedule
      schedule = await prisma.doctorSchedule.update({
        where: {
          id: existingSchedule.id,
        },
        data: {
          startTime,
          endTime,
          isActive,
        },
      });
    } else {
      // Create new schedule
      schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: id,
          dayOfWeek,
          startTime,
          endTime,
          isActive,
        },
      });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// Delete schedule
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const dayOfWeek = parseInt(url.searchParams.get('dayOfWeek') || '');

    if (isNaN(dayOfWeek)) {
      return NextResponse.json(
        { error: 'Invalid day of week' },
        { status: 400 }
      );
    }

    await prisma.doctorSchedule.deleteMany({
      where: {
        doctorId: id,
        dayOfWeek,
      },
    });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
} 