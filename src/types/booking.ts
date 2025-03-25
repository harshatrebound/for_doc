export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  image?: string;
  fee: number;
  experience?: number;
  availability?: boolean;
}

export interface BookingFormData {
  doctor: Doctor | null;
  selectedDate: Date | null;
  selectedTime: string;
  patientName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface DoctorSelectionProps {
  formData: BookingFormData;
  onChange: (updates: Partial<BookingFormData>) => void;
  onSubmit: () => void;
}

export interface DateTimeSelectionProps {
  formData: BookingFormData;
  onChange: (updates: Partial<BookingFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export interface PatientDetailsProps {
  formData: BookingFormData;
  onChange: (updates: Partial<BookingFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export interface SummaryProps {
  formData: BookingFormData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export interface ThankYouProps {
  formData: BookingFormData;
}

export type BookingStep = {
  id: string;
  title: string;
}; 