export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  image?: string;
  experience?: string;
  rating?: number;
  location?: string;
  availability?: string[];
  qualifications?: string[];
}

export interface BookingFormData {
  doctor: Doctor | null;
  selectedDate: Date | null;
  selectedTime: string;
  patientName: string;
  email: string;
  phone: string;
  notes: string;
}

export interface DoctorSelectionProps {
  formData: BookingFormData;
  onChange: (data: Partial<BookingFormData>) => void;
  onSubmit: () => void;
}

export interface DateTimeSelectionProps {
  formData: BookingFormData;
  onChange: (data: Partial<BookingFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSelectable?: (date: Date) => boolean;
}

export interface PatientDetailsProps {
  formData: BookingFormData;
  onChange: (data: Partial<BookingFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export interface SummaryProps {
  formData: BookingFormData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export interface ThankYouProps {
  formData: BookingFormData;
}

export type BookingStep = {
  id: string;
  title: string;
}; 