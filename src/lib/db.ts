import { prisma } from './prisma';
import { format } from 'date-fns';
import { Prisma } from '@prisma/client';

// Doctor Management
export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return doctors;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Failed to fetch doctors');
  }
}

export async function getDoctorById(id: string) {
  return await prisma.doctor.findUnique({
    where: { id }
  });
}

export async function createDoctor(data: {
  name: string;
  speciality: string;
  fee: number;
  image?: string;
}) {
  return await prisma.doctor.create({
    data
  });
}

export async function updateDoctor(id: string, data: {
  name?: string;
  speciality?: string;
  fee?: number;
  image?: string;
}) {
  return await prisma.doctor.update({
    where: { id },
    data
  });
}

export async function deleteDoctor(id: string) {
  return await prisma.doctor.delete({
    where: { id }
  });
}

// Schedule Management
export async function getDoctorSchedule(doctorId: string) {
  try {
    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });
    return schedules;
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    throw new Error('Failed to fetch doctor schedule');
  }
}

export async function updateDoctorSchedule(doctorId: string, scheduleData: any) {
  try {
    const updated = await prisma.doctorSchedule.update({
      where: {
        id: scheduleData.id
      },
      data: {
        isActive: scheduleData.isActive,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        breakStart: scheduleData.breakStart,
        breakEnd: scheduleData.breakEnd,
        slotDuration: scheduleData.slotDuration,
        bufferTime: scheduleData.bufferTime
      }
    });
    return updated;
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    throw new Error('Failed to update doctor schedule');
  }
}

// Special Dates
export async function getSpecialDates(doctorId: string) {
  return await prisma.specialDate.findMany({
    where: { doctorId }
  });
}

export async function updateSpecialDate(id: string, data: {
  date: Date;
  isAvailable: boolean;
}) {
  return await prisma.specialDate.update({
    where: { id },
    data
  });
}

// Analytics
export async function getAnalytics(startDate: Date, endDate: Date) {
  try {
    const [
      appointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsByDay,
      revenueByDoctor,
      recentActivity
    ] = await Promise.all([
      // Total appointments
      prisma.appointment.count(),
      
      // Completed appointments
      prisma.appointment.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Cancelled appointments
      prisma.appointment.count({
        where: { status: 'CANCELLED' }
      }),
      
      // Appointments by day
      prisma.appointment.groupBy({
        by: ['date'],
        _count: true,
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          date: 'asc'
        }
      }),
      
      // Revenue by doctor
      prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          doctorId: true,
          doctor: {
            select: {
              name: true,
              fee: true
            }
          }
        }
      }).then(results => {
        const revenueByDoctor = results.reduce((acc, curr) => {
          const existing = acc.find(item => item.id === curr.doctorId);
          if (existing) {
            existing.revenue += curr.doctor.fee;
          } else {
            acc.push({
              id: curr.doctorId,
              name: curr.doctor.name,
              revenue: curr.doctor.fee
            });
          }
          return acc;
        }, [] as Array<{ id: string; name: string; revenue: number }>);
        
        // Calculate total appointments per doctor to multiply by fee
        const appointmentCounts = results.reduce((acc, curr) => {
          acc[curr.doctorId] = (acc[curr.doctorId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Adjust revenue by multiplying fee by appointment count
        return revenueByDoctor.map(doctor => ({
          ...doctor,
          revenue: doctor.revenue * (appointmentCounts[doctor.id] || 0)
        }));
      }),
      
      // Recent activity
      prisma.appointment.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          doctor: {
            select: {
              name: true
            }
          }
        }
      }).then(appointments => 
        appointments.map(apt => ({
          id: apt.id,
          patientName: apt.patientName,
          doctorName: apt.doctor.name,
          date: apt.date.toISOString(),
          status: apt.status
        }))
      )
    ]);

    const totalRevenue = revenueByDoctor.reduce((sum, doc) => sum + doc.revenue, 0);

    return {
      totalAppointments: appointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue,
      appointmentsByDay: appointmentsByDay.map(day => ({
        date: day.date,
        count: day._count
      })),
      revenueByDoctor,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new Error('Failed to fetch analytics');
  }
}

// Settings
export async function getSettings() {
  const settings = await prisma.settings.findUnique({
    where: { id: 'default' }
  });
  return settings?.data || null;
}

export async function updateSettings(data: any) {
  return await prisma.settings.upsert({
    where: { id: 'default' },
    update: { data },
    create: {
      id: 'default',
      data
    }
  });
}

export async function getAppointments(filters?: {
  startDate?: Date;
  endDate?: Date;
  doctorId?: string;
  status?: string;
}) {
  try {
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }

    if (filters?.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: {
            name: true,
            speciality: true,
            fee: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
} 