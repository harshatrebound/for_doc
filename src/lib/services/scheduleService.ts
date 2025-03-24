import { prisma } from '@/lib/prisma';

// Helper function to generate time slots for a day
function generateTimeSlots(startTime: string, endTime: string, duration: number = 30): string[] {
  const slots: string[] = [];
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  while (start < end) {
    slots.push(start.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }));
    start.setMinutes(start.getMinutes() + duration);
  }

  return slots;
}

export async function getAvailableTimeSlots(doctorId: string, date: Date): Promise<string[]> {
  try {
    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    // Get doctor's schedule for this day
    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
      },
    });

    if (!schedule) {
      console.log(`No schedule found for doctor ${doctorId} on day ${dayOfWeek}`);
      return [];
    }

    // Check for special dates (holidays, special hours, etc.)
    const specialDate = await prisma.specialDate.findFirst({
      where: {
        doctorId,
        date: {
          equals: new Date(dateString),
        },
      },
    });

    if (specialDate?.isUnavailable) {
      console.log(`Doctor ${doctorId} is unavailable on ${dateString}`);
      return [];
    }

    // Get all existing appointments for this doctor on this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          equals: new Date(dateString),
        },
      },
      select: {
        time: true,
      },
    });

    const bookedSlots = new Set(existingAppointments.map(apt => apt.time));

    // Generate all possible time slots for the day
    const startTime = specialDate?.startTime || schedule.startTime;
    const endTime = specialDate?.endTime || schedule.endTime;
    
    const allSlots = generateTimeSlots(startTime, endTime);

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));

    // Don't show past slots if it's today
    if (dateString === new Date().toISOString().split('T')[0]) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      return availableSlots.filter(slot => slot > currentTime);
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
} 