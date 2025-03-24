import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { z } from 'zod';

export const runtime = 'nodejs';

const appointmentSchema = z.object({
  doctorId: z.string().uuid(),
  patientName: z.string().min(1, 'Patient name is required'),
  date: z.string().transform(str => new Date(str)),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .default('SCHEDULED'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'today';
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    const today = startOfDay(new Date());

    let dateFilter = {};
    switch (type) {
      case 'today':
        dateFilter = {
          gte: today,
          lt: addDays(today, 1),
        };
        break;
      case 'upcoming':
        dateFilter = {
          gte: addDays(today, 1),
        };
        break;
      case 'past':
        dateFilter = {
          lt: today,
        };
        break;
    }

    const where: any = {
      date: dateFilter,
    };

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
            fee: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: validatedData.doctorId },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check for schedule availability
    const dayOfWeek = validatedData.date.getDay();
    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Doctor is not available on this day' },
        { status: 400 }
      );
    }

    // Check for existing appointments at the same time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        date: validatedData.date,
        time: validatedData.time,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: validatedData,
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
            fee: true,
          },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }
    
    const { id, doctorId, patientName, date, time, email, phone, notes, status } = body;
    
    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });
    
    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Validate date format if provided
    if (date && isNaN(new Date(date).getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    // Validate time format if provided
    if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format (use HH:MM)' },
        { status: 400 }
      );
    }
    
    // Validate status if provided
    if (status && !['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // If changing doctor, check if doctor exists
    if (doctorId && doctorId !== existingAppointment.doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId }
      });
      
      if (!doctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
    }
    
    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        doctorId: doctorId || undefined,
        patientName: patientName || undefined,
        date: date ? new Date(date) : undefined,
        time: time || undefined,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
        status: status || undefined
      },
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
            fee: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedAppointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
} 