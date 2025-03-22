import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { Doctor } from '@/types/doctor';

const doctors = [
  {
    id: 'dr-sameer',
    name: 'Dr. Sameer',
    fee: 700,
    speciality: 'Orthopedic Surgeon',
    experience: '15+ years',
    rating: 4.9,
    location: 'HSR Layout, Bangalore',
    availability: 'Available Today',
    qualifications: ['MBBS', 'MS Ortho', 'Fellowship in Sports Medicine'],
    image: '/doctors/dr-sameer.jpg'
  },
  {
    id: 'other-doctors',
    name: 'Other Doctors',
    fee: 1000,
    speciality: 'Sports Orthopedic Doctors',
    experience: '10+ years',
    rating: 4.7,
    location: 'HSR Layout, Bangalore',
    availability: 'Available Today',
    qualifications: ['MBBS', 'MS Ortho'],
    image: '/doctors/default-doctor.jpg'
  }
];

export async function GET() {
  try {
    // Query only the columns that exist in the table
    const doctors = await db.query<Doctor>(`
      SELECT id, name, speciality, fee, 
             "createdAt", "updatedAt"
      FROM "Doctor"
      ORDER BY name ASC
    `);

    // Add default image URL in the response
    const doctorsWithImage = doctors.rows.map((doctor: Doctor) => ({
      ...doctor,
      image: '/images/default-doctor.jpg'
    }));

    return NextResponse.json(doctorsWithImage);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const id = uuidv4();
    const now = new Date().toISOString();

    const result = await db.query(
      `INSERT INTO "Doctor" (id, name, speciality, fee, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, speciality, fee, "createdAt", "updatedAt"`,
      [id, name, speciality, fee, now, now]
    );

    // Add default image to the response
    const newDoctor = {
      ...result.rows[0],
      image: '/images/default-doctor.jpg'
    };

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    console.error('Failed to create doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
} 