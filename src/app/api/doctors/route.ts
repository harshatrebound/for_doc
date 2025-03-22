import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import type { Doctor } from '@/types/booking';

// Fallback data in case database is not available
const fallbackDoctors: Doctor[] = [
  {
    id: 'dr-sameer',
    name: 'Dr. Sameer Kumar',
    speciality: 'Orthopedic Surgeon',
    fee: 700,
    experience: '15+ years',
    rating: 4.9,
    location: 'HSR Layout, Bangalore',
    availability: ['Available Today'],
    qualifications: ['MBBS', 'MS Ortho', 'Fellowship in Sports Medicine'],
    image: '/doctors/dr-sameer.jpg'
  },
  {
    id: 'other-doctors',
    name: 'Other Doctors',
    speciality: 'Sports Medicine Specialist',
    fee: 1000,
    experience: '10+ years',
    rating: 4.7,
    location: 'HSR Layout, Bangalore',
    availability: ['Available Today'],
    qualifications: ['MBBS', 'MS Ortho'],
    image: '/doctors/default-doctor.jpg'
  }
];

export async function GET() {
  try {
    // Query doctors from the database
    const result = await db.query(`
      SELECT id, name, speciality, fee, image
      FROM "Doctor"
      ORDER BY name ASC
    `);

    // Log doctor data for debugging
    console.log('Doctors from database:', result.rows);

    // Enhance doctor data with additional fields
    const doctors: Doctor[] = result.rows.map(doctor => ({
      ...doctor,
      experience: doctor.id === 'dr-sameer' ? '15+ years' : '10+ years',
      rating: doctor.id === 'dr-sameer' ? 4.9 : 4.7,
      location: 'HSR Layout, Bangalore',
      availability: ['Available Today'],
      qualifications: doctor.id === 'dr-sameer' 
        ? ['MBBS', 'MS Ortho', 'Fellowship in Sports Medicine']
        : ['MBBS', 'MS Ortho'],
      image: doctor.image || 
        (doctor.id === 'dr-sameer' 
          ? '/doctors/dr-sameer.jpg' 
          : doctor.id === 'other-doctors'
            ? '/doctors/default-doctor.jpg'
            : '/doctors/default-doctor.jpg')
    }));

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    
    // Return fallback data in case of database error
    return NextResponse.json(fallbackDoctors);
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