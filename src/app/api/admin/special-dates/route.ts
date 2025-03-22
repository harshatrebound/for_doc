import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Cache special dates for 5 minutes
const CACHE_TIME = 5 * 60 * 1000;
const cache = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!doctorId || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `${doctorId}-${start}-${end}`;
    const cachedData = cache.get(cacheKey);
    
    // Return cached data if available and not expired
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TIME) {
      return NextResponse.json(cachedData.data);
    }

    console.log('Fetching special dates:', { doctorId, start, end });

    const specialDates = await prisma.specialDate.findMany({
      where: {
        doctorId,
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    console.log('Found special dates:', specialDates);

    // Update cache
    cache.set(cacheKey, {
      data: specialDates,
      timestamp: Date.now()
    });

    return NextResponse.json(specialDates);
  } catch (error) {
    console.error('Failed to fetch special dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, date, type, reason, breakStart, breakEnd } = body;

    if (!doctorId || !date || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if a special date already exists for this date and doctor
    const existingDate = await prisma.specialDate.findFirst({
      where: {
        doctorId,
        date: new Date(date),
      },
    });

    if (existingDate) {
      // Update existing special date
      const updatedDate = await prisma.specialDate.update({
        where: { id: existingDate.id },
        data: {
          type,
          reason,
          breakStart,
          breakEnd,
        },
      });
      return NextResponse.json(updatedDate);
    }

    // Create new special date
    const specialDate = await prisma.specialDate.create({
      data: {
        doctorId,
        date: new Date(date),
        type,
        reason,
        breakStart,
        breakEnd,
      },
    });

    return NextResponse.json(specialDate);
  } catch (error) {
    console.error('Failed to create special date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Missing special date ID' },
        { status: 400 }
      );
    }

    await prisma.specialDate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete special date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 