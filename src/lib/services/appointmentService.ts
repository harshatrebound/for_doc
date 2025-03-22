import { prisma } from '@/lib/prisma';
import { format, parse, isSameDay, isWithinInterval, addMinutes } from 'date-fns';
import { Appointment, DoctorSchedule, SpecialDate } from '@/types/schedule';
import { z } from 'zod';

// Validation schema for new appointments
export const newAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone number'),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  notes: z.string().optional(),
});

export type NewAppointment = z.infer<typeof newAppointmentSchema>;

export class AppointmentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AppointmentError';
  }
}

export async function validateAndCreateAppointment(data: NewAppointment) {
  try {
    // Step 1: Validate input data
    const validatedData = newAppointmentSchema.parse(data);
    
    // Step 2: Check if doctor exists and is available
    const doctor = await prisma.doctor.findUnique({
      where: { id: validatedData.doctorId },
      include: {
        schedules: true,
      },
    });

    if (!doctor) {
      throw new AppointmentError('Doctor not found', 'DOCTOR_NOT_FOUND');
    }

    const appointmentDate = new Date(validatedData.date);
    const dayOfWeek = appointmentDate.getDay();

    // Step 3: Check doctor's schedule
    const schedule = doctor.schedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isActive) {
      throw new AppointmentError('Doctor is not available on this day', 'SCHEDULE_NOT_AVAILABLE');
    }

    // Step 4: Check for holidays and breaks
    const specialDate = await prisma.specialDate.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        date: {
          equals: appointmentDate,
        },
      },
    });

    if (specialDate?.type === 'HOLIDAY') {
      throw new AppointmentError('Selected date is a holiday', 'HOLIDAY');
    }

    // Step 5: Check if time slot is within schedule and not in break time
    const isTimeSlotValid = await validateTimeSlot(
      validatedData.time,
      schedule,
      specialDate,
      appointmentDate
    );

    if (!isTimeSlotValid) {
      throw new AppointmentError('Selected time slot is not available', 'INVALID_TIME_SLOT');
    }

    // Step 6: Check for existing appointments in the same time slot
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        date: appointmentDate,
        time: validatedData.time,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
      },
    });

    if (existingAppointment) {
      throw new AppointmentError('Time slot is already booked', 'SLOT_TAKEN');
    }

    // Step 7: Create appointment with transaction
    const appointment = await prisma.$transaction(async (prisma) => {
      // Double-check availability within transaction
      const slotCheck = await prisma.appointment.findFirst({
        where: {
          doctorId: validatedData.doctorId,
          date: appointmentDate,
          time: validatedData.time,
          status: {
            notIn: ['CANCELLED', 'NO_SHOW'],
          },
        },
      });

      if (slotCheck) {
        throw new AppointmentError('Time slot was just taken', 'SLOT_TAKEN');
      }

      return prisma.appointment.create({
        data: {
          ...validatedData,
          status: 'SCHEDULED',
          date: appointmentDate,
        },
      });
    });

    return {
      success: true,
      appointment,
      message: 'Appointment scheduled successfully',
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppointmentError('Invalid appointment data', 'VALIDATION_ERROR');
    }
    if (error instanceof AppointmentError) {
      throw error;
    }
    throw new AppointmentError('Failed to create appointment', 'INTERNAL_ERROR');
  }
}

async function validateTimeSlot(
  time: string,
  schedule: DoctorSchedule,
  specialDate: SpecialDate | null,
  date: Date
): Promise<boolean> {
  const timeSlot = parse(time, 'HH:mm', date);
  const startTime = parse(schedule.startTime, 'HH:mm', date);
  const endTime = parse(schedule.endTime, 'HH:mm', date);

  // Check if time is within schedule
  if (timeSlot < startTime || timeSlot >= endTime) {
    return false;
  }

  // Check regular break time
  if (schedule.breakStart && schedule.breakEnd) {
    const breakStart = parse(schedule.breakStart, 'HH:mm', date);
    const breakEnd = parse(schedule.breakEnd, 'HH:mm', date);
    if (isWithinInterval(timeSlot, { start: breakStart, end: breakEnd })) {
      return false;
    }
  }

  // Check special break time
  if (specialDate?.type === 'BREAK' && specialDate.breakStart && specialDate.breakEnd) {
    const specialBreakStart = parse(specialDate.breakStart, 'HH:mm', date);
    const specialBreakEnd = parse(specialDate.breakEnd, 'HH:mm', date);
    if (isWithinInterval(timeSlot, { start: specialBreakStart, end: specialBreakEnd })) {
      return false;
    }
  }

  // Check buffer time between appointments
  const bufferStart = addMinutes(timeSlot, -schedule.bufferTime);
  const bufferEnd = addMinutes(timeSlot, schedule.slotDuration + schedule.bufferTime);

  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: schedule.doctorId,
      date: date,
      time: {
        gte: format(bufferStart, 'HH:mm'),
        lte: format(bufferEnd, 'HH:mm'),
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW'],
      },
    },
  });

  return !conflictingAppointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new AppointmentError('Appointment not found', 'NOT_FOUND');
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
      throw new AppointmentError(
        `Invalid status transition from ${appointment.status} to ${newStatus}`,
        'INVALID_TRANSITION'
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus },
    });

    return {
      success: true,
      appointment: updated,
      message: `Appointment status updated to ${newStatus}`,
    };

  } catch (error) {
    if (error instanceof AppointmentError) {
      throw error;
    }
    throw new AppointmentError('Failed to update appointment status', 'INTERNAL_ERROR');
  }
} 