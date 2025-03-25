import { NextResponse } from 'next/server';
import { getDoctors, createDoctor } from '@/lib/db';
import type { Doctor } from '@/types/booking';
import { doctorSchema } from '@/lib/middleware/validateRequest';
import { z } from 'zod';

const mockDoctors: Doctor[] = [
  {
    id: 'dr-sameer',
    name: 'Dr. Sameer Kumar',
    speciality: 'Cardiologist',
    image: '/doctors/doctor-1.jpg',
    fee: 1500,
    availability: true
  },
  {
    id: 'dr-priya',
    name: 'Dr. Priya Sharma',
    speciality: 'Dermatologist',
    image: '/doctors/doctor-2.jpg',
    fee: 1200,
    availability: true
  },
  {
    id: 'dr-rahul',
    name: 'Dr. Rahul Verma',
    speciality: 'Pediatrician',
    image: '/doctors/doctor-3.jpg',
    fee: 1000,
    availability: true
  },
  {
    id: 'dr-anita',
    name: 'Dr. Anita Desai',
    speciality: 'Gynecologist',
    image: '/doctors/doctor-4.jpg',
    fee: 1800,
    availability: true
  }
];

export async function GET() {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(mockDoctors);
    }

    // For production, fetch from database
    const doctors = await getDoctors();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validatedData = doctorSchema.parse(body);

    // Create doctor in database
    const newDoctor = await createDoctor({
      ...validatedData,
      image: validatedData.image || '/images/default-doctor.jpg'
    });

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
} 