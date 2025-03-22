import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { Doctor } from '@/types/doctor';

// Fallback data in case database is not available
const fallbackDoctors = [
  {
    id: 'dr-sameer',
    name: 'Dr. Sameer Kumar',
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
    id: 'dr-priya',
    name: 'Dr. Priya Sharma',
    fee: 1000,
    speciality: 'Sports Medicine Specialist',
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
    // Try to fetch from database first
    const dbDoctors = await db.query(`
      SELECT id, name, speciality, fee, 
             "createdAt", "updatedAt"
      FROM "Doctor"
      ORDER BY name ASC
    `);

    if (dbDoctors.rows.length > 0) {
      // If we have database results, enhance them with additional info
      const enhancedDoctors = dbDoctors.rows.map((doctor) => ({
        ...doctor,
        experience: '10+ years',
        rating: 4.7,
        location: 'HSR Layout, Bangalore',
        availability: 'Available Today',
        qualifications: ['MBBS', 'MS Ortho'],
        image: '/doctors/default-doctor.jpg'
      }));
      return NextResponse.json(enhancedDoctors);
    }

    // If no database results, return fallback data
    return NextResponse.json(fallbackDoctors);
  } catch (error) {
    console.error('Database error:', error);
    // Return fallback data if database fails
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