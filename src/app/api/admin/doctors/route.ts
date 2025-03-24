import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const doctorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  speciality: z.string().min(1, 'Speciality is required'),
  fee: z.number().min(0, 'Fee must be non-negative'),
  image: z.string().optional(),
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
    const validatedData = doctorSchema.parse(body);

    const doctor = await prisma.doctor.create({
      data: validatedData,
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error('Failed to create doctor:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Ensure ID is present in the request body
    if (!body.id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error('Failed to update doctor:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update doctor' },
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