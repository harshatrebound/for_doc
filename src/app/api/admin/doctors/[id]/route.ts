import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// More lenient schema with better error messages for doctor updates
const doctorUpdateSchema = z.object({
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
  isActive: z.preprocess(
    // Handle various representations of boolean values
    val => {
      // Convert string 'true'/'false' to boolean
      if (val === 'true') return true;
      if (val === 'false') return false;
      // Return the value as is (should be boolean)
      return val;
    },
    z.boolean().optional().default(true)
  ),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id }
    });
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Failed to fetch doctor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    console.log("PUT /api/admin/doctors/[id] received:", {
      id: params.id,
      body,
      isActiveType: typeof body.isActive,
      isActiveValue: body.isActive
    });
    
    try {
      const validatedData = doctorUpdateSchema.parse(body);
      
      console.log("Validated data:", validatedData);

      // Check if doctor exists
      const existingDoctor = await prisma.doctor.findUnique({
        where: { id: params.id }
      });

      if (!existingDoctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }

      // Update doctor
      const doctor = await prisma.doctor.update({
        where: { id: params.id },
        data: validatedData,
      });

      return NextResponse.json({
        success: true,
        data: doctor,
        message: 'Doctor updated successfully'
      });
    } catch (err) {
      console.error('Validation error:', err);
      
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: params.id }
    });
    
    if (!existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Check if the doctor has any appointments
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: params.id },
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
      where: { doctorId: params.id }
    });
    
    // Delete the doctor
    await prisma.doctor.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete doctor:', error);
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
} 