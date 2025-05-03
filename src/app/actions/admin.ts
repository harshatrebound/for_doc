'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { format, addMinutes, isBefore } from 'date-fns';

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

    // Generate slots based on schedule times, duration, and buffer
    const slotDuration = relevantSchedule.slotDuration;
    const bufferTime = relevantSchedule.bufferTime; // Get buffer time
    const totalSlotTime = slotDuration + bufferTime; // Calculate total interval

    // Re-use logic similar to the main API route, but simplified for this action
    const slots: string[] = [];
    const [startH, startM] = relevantSchedule.startTime.split(':').map(Number);
    const [endH, endM] = relevantSchedule.endTime.split(':').map(Number);

    let currentTime = new Date(date); // Use the passed date
    currentTime.setHours(startH, startM, 0, 0); // Set start time (local to server is okay here if consistent)

    const endTime = new Date(date);
    endTime.setHours(endH, endM, 0, 0); // Set end time

    // TODO: Consider breaks and booked slots if needed for the *modal* display
    // Currently, this action only generates based on work hours/interval

    while (isBefore(currentTime, endTime)) {
      const timeStr = format(currentTime, 'HH:mm');
      slots.push(timeStr);
      currentTime = addMinutes(currentTime, totalSlotTime); // Increment by TOTAL slot time
    }
    
    // TODO: Optionally filter out already booked slots for this doctor/date (similar to main API)
    // For now, returning all potential slots based on schedule.
    const availableSlots = slots; // Assign the generated slots

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

export async function fetchAppointments(
  page: number = 1, 
  pageSize: number = 10, 
  filters?: {
    startDate?: Date;
    endDate?: Date;
    doctorId?: string;
    status?: string;
  }
) {
  try {
    const where: any = {};
    const skip = (page - 1) * pageSize;

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
    
    // Get total count for pagination
    const totalCount = await prisma.appointment.count({ where });

    const appointments = await prisma.appointment.findMany({
      where,
      select: {
        id: true,
        patientName: true,
        email: true,
        phone: true,
        date: true,
        time: true,
        status: true,
        doctorId: true,
        customerId: true,
        createdAt: true,
        updatedAt: true,
        notes: true,
        timeSlot: true,
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
      },
      skip,
      take: pageSize
    });

    return { 
      success: true, 
      data: {
        appointments,
        pagination: {
          total: totalCount,
          page,
          pageSize,
          pageCount: Math.ceil(totalCount / pageSize)
        }
      } 
    };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

// NEW: Action to fetch all appointments specifically for the calendar view
export async function fetchAllAppointmentsForCalendar(): Promise<ApiResponse<any[]>> {
  try {
    const appointments = await prisma.appointment.findMany({
      select: { // Select fields needed by FullCalendarView AND AppointmentModal
        id: true,
        patientName: true,
        date: true,
        time: true,
        status: true,
        doctorId: true,
        customerId: true,
        email: true, // Add email
        phone: true, // Add phone
        doctor: {
          select: {
            name: true,
            speciality: true
          }
        }
      },
      orderBy: {
        date: 'asc' // Order chronologically for calendar
      }
      // No skip or take - fetch all
    });
    return { success: true, data: appointments };
  } catch (error) {
    console.error('Error fetching all appointments for calendar:', error);
    return { success: false, error: 'Failed to fetch all appointments for calendar' };
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

    // Calculate revenue by doctor - improved with null checks
    const revenueMap = new Map<string, { id: string; name: string; revenue: number }>();
    
    completedAppointmentsWithFees.forEach(apt => {
      if (apt.doctor && apt.doctor.id) {
        const doctorId = apt.doctor.id;
        const fee = apt.doctor.fee || 0;
        const existing = revenueMap.get(doctorId);
        
        if (existing) {
          existing.revenue += fee;
        } else {
          revenueMap.set(doctorId, {
            id: doctorId,
            name: apt.doctor.name || 'Unknown Doctor',
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

    const { patientName, email, phone, date, time, status, doctorId, customerId } = appointmentData;
    const appointmentDate = new Date(date);

    if (!patientName || !email || !phone || !appointmentDate || !time || !status || !doctorId) {
      return { success: false, error: 'Missing required appointment fields (incl. email/phone)' };
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
        email,
        phone,
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

    // --- Webhook Logic Start ---
    const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
    if (webhookUrl) {
      console.log(`Webhook URL found, attempting to send POST request to: ${webhookUrl}`)
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAppointment), // Send the newly created appointment object
        });

        if (!webhookResponse.ok) {
          // Log error if webhook request failed
          console.error(`Webhook failed with status: ${webhookResponse.status}`, await webhookResponse.text());
        } else {
          console.log('Successfully sent booking webhook for appointment:', newAppointment.id);
        }
      } catch (webhookError) {
        console.error('Error sending booking webhook:', webhookError);
        // Non-fatal error: Log it but don't prevent the success response for appointment creation
      }
    } else {
      console.log('BOOKING_WEBHOOK_URL not found in environment variables. Skipping webhook.')
    }
    // --- Webhook Logic End ---

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

// --- Special Date / Availability Management Actions ---

// Fetches special dates. If doctorId provided, fetch specific, otherwise fetch global.
export async function fetchSpecialDates(doctorId?: string): Promise<ApiResponse<any[]>> {
  try {
    const whereClause: any = {};
    if (doctorId) {
      // Fetch dates specific to this doctor
      whereClause.doctorId = doctorId;
    } else {
      // Fetch only global dates (doctorId is null)
      whereClause.doctorId = null;
    }

    const specialDates = await prisma.specialDate.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc',
      },
    });
    
    return { success: true, data: specialDates };
  } catch (error) {
    console.error('Error fetching special dates:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Updated Payload for creating global or doctor-specific dates
interface CreateSpecialDatePayload {
  date: Date | string;
  name?: string; // Optional: Required for global
  type?: string; // Optional: Required for global
  reason?: string; // Optional: Used for doctor-specific blocks
  doctorId?: string; // Optional: ID of the doctor if not global
}

// Creates a special date (global or doctor-specific)
export async function createSpecialDate(payload: CreateSpecialDatePayload): Promise<ApiResponse<any>> {
  try {
    const { date, name, type, reason, doctorId } = payload;
    
    // Ensure date is properly formatted
    let dateObject: Date;
    if (typeof date === 'string') {
      // Parse the string date to a Date object
      const [year, month, day] = date.split('-').map(Number);
      dateObject = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    } else {
      dateObject = date;
    }
    
    const newSpecialDate = await prisma.specialDate.create({
      data: {
        date: dateObject,
        name: name || (doctorId ? (reason || 'Blocked') : 'Unnamed Date'),
        type: type || (doctorId ? 'UNAVAILABLE' : 'OTHER'),
        reason,
        doctorId: doctorId || null,
      }
    });
    
    // Revalidate relevant paths
    revalidatePath('/admin/special-dates');
    if (doctorId) {
      revalidatePath(`/admin/doctors/${doctorId}/schedule`);
    }
    revalidatePath('/admin/schedule'); // Revalidate main schedule page too
    
    return { success: true, data: newSpecialDate };
  } catch (error) {
    console.error('Error creating special date:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// deleteSpecialDate action remains the same, uses ID
export async function deleteSpecialDate(specialDateId: string): Promise<ApiResponse> {
  try {
    await prisma.specialDate.delete({
      where: { id: specialDateId }
    });
    
    // Revalidate paths after delete
    revalidatePath('/admin/special-dates');
    revalidatePath('/admin/schedule');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting special date:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// New action to fetch a single doctor by ID
export async function fetchDoctorById(doctorId: string) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      return { success: false, error: 'Doctor not found' };
    }
    return { success: true, data: doctor };
  } catch (error) {
    console.error(`Error fetching doctor with ID ${doctorId}:`, error);
    return { success: false, error: 'Failed to fetch doctor details' };
  }
}

// --- Doctor Management Actions ---

// Action to delete a doctor
export async function deleteDoctor(doctorId: string): Promise<ApiResponse> {
  try {
    // Check if the doctor exists (optional, delete operation will fail safely if not found)
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return { success: false, error: 'Doctor not found' };
    }

    // Perform the deletion
    await prisma.doctor.delete({ 
      where: { id: doctorId } 
    });

    console.log(`Successfully deleted doctor with ID: ${doctorId}`);
    revalidatePath('/admin/doctors'); // Revalidate the doctors list page
    return { success: true, message: 'Doctor deleted successfully' };

  } catch (error) {
    console.error(`Error deleting doctor with ID ${doctorId}:`, error);
    // Check for specific Prisma error related to foreign key constraints
    if (error instanceof Error && (error as any).code === 'P2003') { 
      // Foreign key constraint violation (e.g., doctor has appointments)
      return { success: false, error: 'Cannot delete doctor: They have existing appointments or schedules associated. Please reassign or remove them first.' };
    }
    return { success: false, error: 'Failed to delete doctor' };
  }
}