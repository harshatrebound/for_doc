import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!doctorId || !start || !end) {
      return NextResponse.json(
        { error: 'Doctor ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Use Prisma client to query special dates
    const specialDates = await prisma.specialDate.findMany({
      where: {
        doctorId: doctorId,
        date: {
          gte: new Date(start),
          lte: new Date(end)
        }
      }
    });

    return NextResponse.json(specialDates);
  } catch (error) {
    console.error('Failed to fetch special dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special dates' },
      { status: 500 }
    );
  }
} 