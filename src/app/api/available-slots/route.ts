import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse, format, addMinutes, isBefore, isAfter, setHours, setMinutes } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: 'Doctor ID and date are required' },
        { status: 400 }
      );
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get doctor's schedule for the selected day
    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing appointments for the selected date
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: selectedDate,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
      select: {
        time: true,
      },
    });

    const bookedTimes = new Set(appointments.map(a => a.time));

    // Get special dates (holidays, etc.)
    const specialDate = await prisma.specialDate.findFirst({
      where: {
        doctorId,
        date: selectedDate,
      },
    });

    if (specialDate?.type === 'HOLIDAY') {
      return NextResponse.json({ slots: [] });
    }

    // Generate available time slots
    const slots: string[] = [];
    const startTime = parse(schedule.startTime, 'HH:mm', selectedDate);
    const endTime = parse(schedule.endTime, 'HH:mm', selectedDate);
    const breakStart = schedule.breakStart ? parse(schedule.breakStart, 'HH:mm', selectedDate) : null;
    const breakEnd = schedule.breakEnd ? parse(schedule.breakEnd, 'HH:mm', selectedDate) : null;

    let currentTime = startTime;
    const slotDuration = schedule.slotDuration || 30;
    const bufferTime = schedule.bufferTime || 5;
    const totalSlotTime = slotDuration + bufferTime;

    while (isBefore(currentTime, endTime)) {
      const timeStr = format(currentTime, 'HH:mm');

      // Skip if time is during break
      if (
        breakStart &&
        breakEnd &&
        !isBefore(currentTime, breakStart) &&
        isBefore(currentTime, breakEnd)
      ) {
        currentTime = addMinutes(currentTime, totalSlotTime);
        continue;
      }

      // Skip if time is already booked
      if (!bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }

      currentTime = addMinutes(currentTime, totalSlotTime);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Failed to fetch available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
} 