import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get total appointments
    const totalAppointments = await prisma.appointment.count();

    // Get appointments by status
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get appointments by doctor
    const appointmentsByDoctor = await prisma.appointment.groupBy({
      by: ['doctorId'],
      _count: true,
    });

    // Get doctor details
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Map doctor names to appointment counts
    const doctorAppointments = appointmentsByDoctor.map(item => ({
      doctor: doctors.find(d => d.id === item.doctorId)?.name || 'Unknown',
      count: item._count,
    }));

    return NextResponse.json({
      totalAppointments,
      appointmentsByStatus: appointmentsByStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      appointmentsByDoctor: doctorAppointments,
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 