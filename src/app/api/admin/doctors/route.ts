import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// More lenient schema with better error messages
const doctorSchema = z.object({
  id: z.string().optional().transform(val => val || undefined),
  name: z.string().min(1, 'Name is required'),
  speciality: z.string().min(1, 'Speciality is required'),
  fee: z.union([
    z.number().min(0, 'Fee must be non-negative'),
    z.string().transform(val => {
      const parsed = parseFloat(val);
      if (isNaN(parsed)) {
        throw new Error('Fee must be a valid number');
      }
      return parsed;
    })
  ]),
  image: z.string().optional().transform(val => val || undefined),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Return a specific doctor
      const doctor = await prisma.doctor.findUnique({
        where: { id }
      });
      
      if (!doctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(doctor);
    }
    
    // Return all doctors
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received POST request body:", body);
    
    try {
      const validatedData = doctorSchema.parse(body);

      const doctor = await prisma.doctor.create({
        data: validatedData,
      });

      return NextResponse.json(doctor, { status: 201 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Zod validation error:', JSON.stringify(err.errors, null, 2));
        return NextResponse.json(
          { 
            error: 'Invalid data', 
            details: err.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('Failed to create doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Received PUT request body:", body);
    
    // Ensure ID is present in the request body
    if (!body.id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    try {
      const validatedData = doctorSchema.parse(body);
      const { id, ...updateData } = validatedData;

      // Check if doctor exists
      const existingDoctor = await prisma.doctor.findUnique({
        where: { id }
      });

      if (!existingDoctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }

      // Update doctor
      const doctor = await prisma.doctor.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        data: doctor,
        message: 'Doctor updated successfully'
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Zod validation error:', JSON.stringify(err.errors, null, 2));
        return NextResponse.json(
          { 
            error: 'Invalid data', 
            details: err.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('Failed to update doctor:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }
    
    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id }
    });
    
    if (!existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Check if the doctor has any appointments
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: id },
      take: 1
    });
    
    if (appointments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete doctor with existing appointments' },
        { status: 400 }
      );
    }
    
    // Delete doctor's schedule first
    await prisma.doctorSchedule.deleteMany({
      where: { doctorId: id }
    });
    
    // Delete the doctor
    await prisma.doctor.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete doctor:', error);
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      } else if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Cannot delete doctor with existing references' },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
} 