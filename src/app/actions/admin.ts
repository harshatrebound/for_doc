'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper function to convert HH:MM time string to minutes since midnight
function timeToMinutes(timeStr: string | null): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

// Helper function to check availability based on schedule
async function isDoctorAvailable(doctorId: string, date: Date, time: string): Promise<{ available: boolean; message: string }> {
  try {
    const scheduleResult = await fetchDoctorSchedule(doctorId);
    if (!scheduleResult.success || !scheduleResult.data) {
      return { available: false, message: 'Could not fetch doctor schedule.' };
    }

    const schedules = scheduleResult.data;
    if (schedules.length === 0) {
      return { available: false, message: 'Doctor has no defined schedule.' };
    }

    const appointmentDayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
    const relevantSchedule = schedules.find(s => s.dayOfWeek === appointmentDayOfWeek);

    if (!relevantSchedule) {
      return { available: false, message: `Doctor is not scheduled to work on this day.` };
    }

    if (!relevantSchedule.isActive) {
      return { available: false, message: 'Doctor is marked as inactive on this day.' };
    }

    const appointmentMinutes = timeToMinutes(time);
    const startMinutes = timeToMinutes(relevantSchedule.startTime);
    const endMinutes = timeToMinutes(relevantSchedule.endTime);

    if (appointmentMinutes === null || startMinutes === null || endMinutes === null) {
      return { available: false, message: 'Invalid time format provided or in schedule.' };
    }

    // Check if appointment time is within the scheduled work hours (inclusive start, exclusive end)
    if (appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes) {
      return { available: true, message: 'Slot available.' };
    } else {
      return { available: false, message: `Doctor's schedule on this day is ${relevantSchedule.startTime} to ${relevantSchedule.endTime}.` };
    }

  } catch (error) {
    console.error("Error checking doctor availability:", error);
    return { available: false, message: 'Error verifying doctor schedule.' };
  }
}

// Helper function to generate time slots between start and end times
function generateTimeSlots(startTimeStr: string, endTimeStr: string, slotDurationMinutes: number): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTimeStr);
  const endMinutes = timeToMinutes(endTimeStr);

  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    return []; // Invalid times or duration
  }

  let currentMinutes = startMinutes;
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    currentMinutes += slotDurationMinutes;
  }

  return slots;
}

// New server action to fetch available slots for a doctor on a specific date
export async function fetchAvailableSlots(doctorId: string, date: Date): Promise<ApiResponse<string[]>> {
  try {
    const scheduleResult = await fetchDoctorSchedule(doctorId);
    if (!scheduleResult.success || !scheduleResult.data) {
      return { success: false, error: 'Could not fetch doctor schedule.' };
    }

    const schedules = scheduleResult.data;
    if (schedules.length === 0) {
      return { success: true, data: [] }; // No schedule defined, so no slots
    }

    const appointmentDayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
    const relevantSchedule = schedules.find(s => s.dayOfWeek === appointmentDayOfWeek);

    if (!relevantSchedule || !relevantSchedule.isActive) {
      return { success: true, data: [] }; // Not working or not active on this day
    }

    // Generate slots based on schedule times and duration (defaulting to 30 mins if not set)
    const slotDuration = relevantSchedule.slotDuration || 30;
    const availableSlots = generateTimeSlots(
      relevantSchedule.startTime,
      relevantSchedule.endTime,
      slotDuration
    );
    
    // TODO: Optionally filter out already booked slots for this doctor/date

    return { success: true, data: availableSlots };

  } catch (error) {
    console.error("Error fetching available slots:", error);
    return { success: false, error: 'Error fetching available slots.' };
  }
}

export async function fetchDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return { success: true, data: doctors };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return { success: false, error: 'Failed to fetch doctors' };
  }
}

export async function fetchAppointments(filters?: {
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

    return { success: true, data: appointments };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

export async function fetchAnalytics(startDate: Date, endDate: Date) {
  try {
    const [
      appointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsByDay,
      completedAppointmentsWithFees,
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
      prisma.$queryRaw`
        SELECT 
          DATE(date) as date,
          COUNT(*) as count
        FROM "Appointment"
        WHERE date >= ${startDate} AND date <= ${endDate}
        GROUP BY DATE(date)
        ORDER BY date ASC
      `,

      // Completed appointments with fees for revenue calculation
      prisma.appointment.findMany({
        where: {
          status: 'COMPLETED',
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          doctor: true
        }
      }),

      // Recent activity
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: true
        }
      })
    ]);

    // Calculate revenue by doctor
    const revenueMap = new Map<string, { id: string; name: string; revenue: number }>();
    
    completedAppointmentsWithFees.forEach(apt => {
      if (apt.doctor) {
        const doctorId = apt.doctor.id;
        const fee = apt.doctor.fee || 0;
        const existing = revenueMap.get(doctorId);
        
        if (existing) {
          existing.revenue += fee;
        } else {
          revenueMap.set(doctorId, {
            id: doctorId,
            name: apt.doctor.name,
            revenue: fee
          });
        }
      }
    });

    const revenueByDoctor = Array.from(revenueMap.values());
    const totalRevenue = revenueByDoctor.reduce((sum, doc) => sum + doc.revenue, 0);

    return {
      success: true,
      data: {
        totalAppointments: appointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        appointmentsByDay: (appointmentsByDay as any[]).map(day => ({
          date: day.date.toISOString(),
          count: Number(day.count)
        })),
        revenueByDoctor,
        recentActivity: recentActivity.map(apt => ({
          id: apt.id,
          patientName: apt.patientName || 'Unknown Patient',
          doctorName: apt.doctor?.name || 'Unknown Doctor',
          date: apt.date.toISOString(),
          status: apt.status || 'UNKNOWN'
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { success: false, error: 'Failed to fetch analytics' };
  }
}

export async function fetchDoctorSchedule(doctorId: string) {
  try {
    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' }
    });
    return { success: true, data: schedules };
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    return { success: false, error: 'Failed to fetch doctor schedule' };
  }
}

export async function updateAppointmentStatus(appointmentId: string, newStatus: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[appointment.status]?.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot change status from ${appointment.status} to ${newStatus}`
      };
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus },
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

    return {
      success: true,
      data: updated,
      message: `Appointment status updated to ${newStatus}`
    };

  } catch (error) {
    console.error('Error updating appointment status:', error);
    return { success: false, error: 'Failed to update appointment status' };
  }
}

// Define the response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create a new appointment with schedule validation
export const createAppointment = async (appointmentData: any): Promise<ApiResponse> => {
  try {
    console.log('Attempting to create appointment with data:', appointmentData);

    const { patientName, date, time, status, doctorId, customerId } = appointmentData;
    const appointmentDate = new Date(date);

    if (!patientName || !appointmentDate || !time || !status || !doctorId) {
      return { success: false, error: 'Missing required appointment fields' };
    }

    // *** Check doctor availability ***
    const availability = await isDoctorAvailable(doctorId, appointmentDate, time);
    if (!availability.available) {
        return { success: false, error: availability.message };
    }
    // *******************************

    const newAppointment = await prisma.appointment.create({
      data: {
        patientName,
        date: appointmentDate,
        time,
        status,
        doctorId,
        customerId,
      },
      include: {
        doctor: { select: { name: true, speciality: true, fee: true } }
      }
    });

    console.log('Successfully created appointment:', newAppointment);
    revalidatePath('/admin/appointments');
    return { success: true, data: newAppointment };

  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: 'Failed to create appointment in database' };
  }
};

// Update an existing appointment with schedule validation
export const updateAppointment = async (appointmentData: any): Promise<ApiResponse> => {
  try {
    const { id, patientName, date, time, status, doctorId, customerId } = appointmentData;
    const appointmentDate = new Date(date);

    console.log('Attempting to update appointment with ID:', id);
    console.log('Update data:', appointmentData);

    if (!id) {
      return { success: false, error: 'Appointment ID is required for update' };
    }
    if (!patientName || !appointmentDate || !time || !status || !doctorId) {
      return { success: false, error: 'Missing required appointment fields for update' };
    }

    // *** Check doctor availability ***
    const availability = await isDoctorAvailable(doctorId, appointmentDate, time);
    if (!availability.available) {
      return { success: false, error: availability.message };
    }
    // *******************************

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        patientName,
        date: appointmentDate,
        time,
        status,
        doctorId,
        customerId,
      },
      include: {
        doctor: { select: { name: true, speciality: true, fee: true } }
      }
    });

    console.log('Successfully updated appointment:', updatedAppointment);
    revalidatePath('/admin/appointments');
    return { success: true, data: updatedAppointment };

  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error instanceof Error && (error as any).code === 'P2025') {
       return { success: false, error: `Appointment with ID ${id} not found.` };
    }
    return { success: false, error: 'Failed to update appointment in database' };
  }
}; 