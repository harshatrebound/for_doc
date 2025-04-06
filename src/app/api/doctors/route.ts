import { NextResponse } from 'next/server';
import { getDoctors, createDoctor } from '@/lib/db';
import type { Doctor } from '@/types/booking';
import { doctorSchema } from '@/lib/middleware/validateRequest';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Removed mock data as we'll use actual database data

export async function GET() {
  try {
    // Fetch doctors from the database
    const dbDoctors = await prisma.doctor.findMany({
      include: {
        schedules: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data to include availability and other required fields
    const doctors = dbDoctors.map(doctor => {
      // Check if doctor has any active schedules to determine availability
      const hasActiveSchedules = doctor.schedules.some(schedule => schedule.isActive);
      
      return {
        id: doctor.id,
        name: doctor.name,
        speciality: doctor.speciality,
        fee: doctor.fee,
        image: doctor.image || '/images/team-hero.jpg', // Default image if none provided
        availability: hasActiveSchedules,
        // Add default values for any missing fields required by the frontend
        experience: 5, // Default experience value
        rating: 4.5    // Default rating value
      };
    });

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
      image: validatedData.image || '/images/team-hero.jpg'
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