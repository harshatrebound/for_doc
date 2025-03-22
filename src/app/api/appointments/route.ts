import { NextResponse } from 'next/server';
import { validateAndCreateAppointment, updateAppointmentStatus, AppointmentError } from '@/lib/services/appointmentService';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await validateAndCreateAppointment(data);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppointmentError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { appointmentId, status } = await request.json();
    
    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await updateAppointmentStatus(appointmentId, status);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppointmentError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    
    console.error('Appointment update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const where: any = {};
    if (doctorId) where.doctorId = doctorId;
    if (date) where.date = new Date(date);
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Appointment fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 