import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Default schedule for all doctors (for now)
    const defaultSchedule = [
      {
        id: 'mon',
        doctorId,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        slotDuration: 30,
        bufferTime: 5,
        breakStart: '13:00',
        breakEnd: '14:00'
      },
      {
        id: 'tue',
        doctorId,
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        slotDuration: 30,
        bufferTime: 5,
        breakStart: '13:00',
        breakEnd: '14:00'
      },
      {
        id: 'wed',
        doctorId,
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        slotDuration: 30,
        bufferTime: 5,
        breakStart: '13:00',
        breakEnd: '14:00'
      },
      {
        id: 'thu',
        doctorId,
        dayOfWeek: 4,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        slotDuration: 30,
        bufferTime: 5,
        breakStart: '13:00',
        breakEnd: '14:00'
      },
      {
        id: 'fri',
        doctorId,
        dayOfWeek: 5,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        slotDuration: 30,
        bufferTime: 5,
        breakStart: '13:00',
        breakEnd: '14:00'
      }
    ];

    return NextResponse.json(defaultSchedule);
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
} 