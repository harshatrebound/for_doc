'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isBefore, startOfDay } from 'date-fns';
import { toast } from 'react-hot-toast';
import { fetchAvailableSlots } from '@/app/actions/admin';
import { Trash2 } from 'lucide-react';

// Define the interface for an appointment - should match your backend model
interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
}

interface Appointment {
  id?: string;
  patientName: string | null;
  email: string | null;
  phone: string | null;
  date: Date;
  time: string | null;
  status: string;
  doctorId: string;
  customerId?: string | null;
  doctor?: Doctor;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSave: (appointment: Appointment) => Promise<void>;
  doctors?: Doctor[]; // List of doctors to select from
  isNewAppointment?: boolean;
  selectedDate?: Date; // For new appointments
  prefilledTime?: string; // ADDED: For pre-filling time from drawer
  onBookAgain?: (appointment: Appointment) => void; // NEW
  onDelete?: (appointmentId: string) => void; // ADDED: For delete functionality
}

const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onSave, 
  doctors = [], 
  isNewAppointment = false,
  selectedDate,
  prefilledTime,
  onBookAgain,
  onDelete
}: AppointmentModalProps) {
  // Form state
  const [formData, setFormData] = useState<Appointment>({
    patientName: '',
    email: '',
    phone: '',
    date: new Date(),
    time: '',
    status: 'SCHEDULED',
    doctorId: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Determine if this is a past appointment (not new, and date is before today)
  const isPastAppointment = !isNewAppointment && appointment && isBefore(startOfDay(new Date(appointment.date)), startOfDay(new Date()));

  // Initialize form with appointment data or default values
  useEffect(() => {
    if (isOpen) {
      // Explicitly prioritize the isNewAppointment flag
      if (isNewAppointment) { 
        if (selectedDate) {
          const initialData = {
            patientName: '',
            date: selectedDate, // Use the prop directly here
            time: prefilledTime || '',
            status: 'SCHEDULED',
            doctorId: doctors && doctors.length > 0 ? doctors[0].id : '',
            id: undefined,
            customerId: null,
            doctor: undefined,
            email: '',
            phone: '',
          };
          setFormData(initialData);
        } else {
          // This case might indicate an issue, as selectedDate should be set for new appointments from calendar/drawer
          console.warn("Modal opened for new appointment but selectedDate is missing.");
          // Fallback to a default empty state
          setFormData({
            patientName: '', date: new Date(), time: '', status: 'SCHEDULED', doctorId: '', email: '', phone: '' 
          }); 
        }
      } else if (appointment) { // Only process as edit if NOT new AND appointment exists
        const formattedAppointment = {
          id: appointment.id,
          patientName: appointment.patientName || '',
          date: new Date(appointment.date),
          time: appointment.time || '', // This is where the time is set for the form
          status: (appointment.status || 'SCHEDULED').toUpperCase(),
          doctorId: appointment.doctorId || '',
          customerId: appointment.customerId || null,
          doctor: appointment.doctor || undefined,
          email: appointment.email || '',
          phone: appointment.phone || '',
        };
        setFormData(formattedAppointment);
      } else {
        // Handle state where modal is opened not as new, but no appointment provided
        console.warn("Modal opened in non-new state without appointment data.");
        // Reset to a default empty state
        setFormData({
          patientName: '', date: new Date(), time: '', status: 'SCHEDULED', doctorId: '', email: '', phone: '' 
        });
      }
      // Reset available slots regardless of new/edit
      setAvailableTimeSlots([]);
    }
  }, [isOpen, appointment, isNewAppointment, selectedDate, doctors, prefilledTime]);

  // Effect to fetch available time slots when doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.doctorId && formData.date) {
        setIsLoadingSlots(true);
        setAvailableTimeSlots([]);
        const result = await fetchAvailableSlots(formData.doctorId, new Date(formData.date));
        setIsLoadingSlots(false);
        if (result.success && result.data) {
          setAvailableTimeSlots(result.data);
          if (formData.time && !result.data.includes(formData.time)) {
            handleChange('time', ''); 
          }
        } else {
          console.error("Failed to fetch time slots:", result.error);
          toast.error('Could not load available times.');
        }
      }
    };

    if (isOpen) {
       fetchSlots();
    }
    
  }, [formData.doctorId, formData.date, isOpen]);

  // Handle input changes
  const handleChange = (field: keyof Appointment, value: string | Date | null) => {
    setFormData((prev: Appointment) => {
      const newState = { ...prev, [field]: value };
      if (field === 'status' && value === 'CANCELLED') {
        newState.time = ''; // Clear time when status is CANCELLED
        setAvailableTimeSlots([]); // Clear available slots as time is not relevant
      }
      if ((field === 'date' || field === 'doctorId') && newState.status !== 'CANCELLED') {
        newState.time = '';
      }
      return newState;
    });
    
    if (formErrors[field]) {
      setFormErrors((prevErrors: {[key: string]: string}) => {
        const newErrors = {...prevErrors};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.patientName) {
      errors.patientName = 'Patient name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.status !== 'CANCELLED' && !formData.time) {
      errors.time = 'Time is required';
    }
    
    if (!formData.doctorId) {
      errors.doctorId = 'Doctor is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success(isNewAppointment ? 'Appointment created successfully' : 'Appointment updated successfully');
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Book Again handler
  const handleBookAgain = () => {
    if (!appointment) return;
    if (onBookAgain) {
      onBookAgain(appointment);
    }
  };

  const handleAttemptDelete = () => {
    if (!formData.id) {
      toast.error("Cannot delete an appointment without an ID.");
      return;
    }
    if (onDelete) {
      onDelete(formData.id); // Trigger the parent's delete process (which includes confirmation)
      onClose(); // Close this modal now that the delete process has been initiated
    } else {
      toast.error("Delete functionality is not configured for this modal.");
    }
  };

  // console.log('Dialog component:', Dialog); // Keep if needed for diagnostics, or remove

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white p-0">
        <DialogHeader className="bg-[#8B5C9E] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
          <DialogTitle className="text-lg sm:text-xl">
            {isNewAppointment ? 'Create New Appointment' : 'Appointment Details'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-4 sm:p-6">
          <div>
            <Label htmlFor="patientName" className="font-semibold text-xs sm:text-sm">Patient Name</Label>
            <Input 
              id="patientName" 
              className="h-9 sm:h-10 mt-1 text-sm focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-[#8B5C9E]"
              value={formData.patientName || ''} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('patientName', e.target.value)} 
              disabled={isPastAppointment}
            />
            {formErrors.patientName && <p className="text-red-500 text-xs mt-1">{formErrors.patientName}</p>}
          </div>

          {/* Responsive grid for Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="font-semibold text-xs sm:text-sm">Email</Label>
              <Input 
                id="email" 
                type="email"
                className="h-9 sm:h-10 mt-1 text-sm focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-[#8B5C9E]"
                value={formData.email || ''} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)} 
                disabled={isPastAppointment}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone" className="font-semibold text-xs sm:text-sm">Phone</Label>
              <Input 
                id="phone" 
                type="tel"
                className="h-9 sm:h-10 mt-1 text-sm focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-[#8B5C9E]"
                value={formData.phone || ''} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)} 
                disabled={isPastAppointment}
              />
              {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          {/* Responsive grid for Date and Time - NOW ALWAYS 2 COLUMNS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="font-semibold text-xs sm:text-sm">Date</Label>
              <Input 
                type="date" 
                id="date" 
                className="h-9 sm:h-10 mt-1 text-sm focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-[#8B5C9E]"
                value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('date', e.target.value ? new Date(e.target.value) : null)} 
                disabled={isPastAppointment}
              />
            </div>
            
            {formData.status !== 'CANCELLED' && (
              <div>
                <Label htmlFor="time" className="font-semibold text-xs sm:text-sm">Time</Label>
                <Select 
                  value={formData.time || ''} 
                  onValueChange={(value: any) => handleChange('time', value)} 
                  disabled={isLoadingSlots || isPastAppointment}
                >
                  <SelectTrigger className="h-9 sm:h-10 mt-1 text-sm focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-[#8B5C9E]">
                    <SelectValue placeholder={isLoadingSlots ? "Loading..." : "Select time"} />
                  </SelectTrigger>
                  <SelectContent className="overflow-y-hidden">
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((slot: any) => (
                        <SelectItem key={slot} value={slot} className="text-sm">{slot}</SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs sm:text-sm text-muted-foreground text-center">No slots available for this date/doctor</div>
                    )}
                  </SelectContent>
                </Select>
                {formErrors.time && <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="doctorId" className="font-semibold text-xs sm:text-sm">Doctor</Label>
            <Select 
              value={formData.doctorId || ''} 
              onValueChange={(value: any) => handleChange('doctorId', value)} 
              disabled={isPastAppointment}
            >
              <SelectTrigger className="h-9 sm:h-10 mt-1 text-sm focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-[#8B5C9E]">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors && doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id} className="text-sm">{doc.name} - {doc.speciality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.doctorId && <p className="text-red-500 text-xs mt-1">{formErrors.doctorId}</p>}
          </div>
          
          <div>
            <Label htmlFor="status" className="font-semibold text-xs sm:text-sm">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => handleChange('status', value)} disabled={isPastAppointment && formData.status !== 'CANCELLED' }>
              <SelectTrigger className="h-9 sm:h-10 mt-1 text-sm focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-[#8B5C9E]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((stat) => (
                  <SelectItem key={stat} value={stat} className="text-sm">{stat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center">
            <div className="w-full sm:w-auto flex justify-start">
                {!isNewAppointment && onDelete && (
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={handleAttemptDelete}
                    disabled={isSubmitting}
                    className="w-auto text-red-600 hover:text-red-700 p-2"
                    aria-label="Delete appointment"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:space-x-2 w-full sm:w-auto mt-3 sm:mt-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto mb-2 sm:mb-0">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || (formData.status !== 'CANCELLED' && isLoadingSlots)} 
                className="w-full sm:w-auto bg-[#8B5C9E] hover:bg-[#794e8a] text-white"
              >
                {isSubmitting ? 'Saving...' : (isNewAppointment ? 'Create Appointment' : 'Save Changes')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 