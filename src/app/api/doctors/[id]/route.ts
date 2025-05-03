import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, speciality, fee } = body;

    // Validate required fields
    if (!name || !speciality || !fee) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate fee is a positive number
    if (typeof fee !== 'number' || fee < 0) {
      return NextResponse.json(
        { error: 'Fee must be a positive number' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const result = await db.query(
      `UPDATE "Doctor"
       SET name = $1, speciality = $2, fee = $3, "updatedAt" = $4
       WHERE id = $5
       RETURNING id, name, speciality, fee, "createdAt", "updatedAt"`,
      [name, speciality, fee, now, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Add default image to the response
    const updatedDoctor = {
      ...result.rows[0],
      image: '/images/default-doctor.jpg'
    };

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error('Failed to update doctor:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await db.query(
      `DELETE FROM "Doctor" WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Failed to delete doctor:', error);
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
} 