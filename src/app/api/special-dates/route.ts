import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Query special dates from the database
    const result = await db.query(`
      SELECT *
      FROM "SpecialDate"
      WHERE "doctorId" = $1
      AND date >= $2
      AND date <= $3
    `, [doctorId, start, end]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch special dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special dates' },
      { status: 500 }
    );
  }
} 