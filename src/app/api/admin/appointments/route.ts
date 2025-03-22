import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'today';
    const today = startOfDay(new Date());

    let dateFilter = {};
    switch (type) {
      case 'today':
        dateFilter = {
          gte: today,
          lt: addDays(today, 1),
        };
        break;
      case 'upcoming':
        dateFilter = {
          gte: addDays(today, 1),
        };
        break;
      case 'past':
        dateFilter = {
          lt: today,
        };
        break;
    }

    console.log('Fetching appointments with filter:', { 
      type, 
      dateFilter,
      today: today.toISOString() 
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        date: dateFilter,
      },
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    console.log('Found appointments:', JSON.stringify(appointments, null, 2));

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, patientName, date, time, email, phone, notes } = body;

    if (!doctorId || !patientName || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientName,
        date: new Date(date),
        time,
        status: 'SCHEDULED',
        email,
        phone,
        notes,
      },
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 