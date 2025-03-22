export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  slotDuration: number;
  bufferTime: number;
  breakStart?: string; // HH:mm format
  breakEnd?: string; // HH:mm format
}

export interface SpecialDate {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD format
  type: 'HOLIDAY' | 'BREAK';
  reason?: string;
  breakStart?: string; // HH:mm format
  breakEnd?: string; // HH:mm format;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  customerId?: string;
  patientName?: string;
  date: string;
  time?: string;
  timeSlot?: string;
  status: AppointmentStatus;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface TimeSlot {
  time: string; // HH:mm format
  isAvailable: boolean;
  appointmentId?: string;
} 