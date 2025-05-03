'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isBefore, startOfDay } from 'date-fns';
import { toast } from 'react-hot-toast';
import { fetchAvailableSlots } from '@/app/actions/admin';

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
  onBookAgain
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
      console.log("Modal Effect Triggered. Props received: isNew=", isNewAppointment, "appointment=", appointment, "selectedDate=", selectedDate, "prefilledTime=", prefilledTime);

      // Explicitly prioritize the isNewAppointment flag
      if (isNewAppointment) { 
        if (selectedDate) {
          console.log(`Modal Effect: Initializing for NEW. Using selectedDate: ${selectedDate} and prefilledTime: ${prefilledTime}`);
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
          console.log("--> Setting NEW formData:", initialData);
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
        console.log("Modal Effect: Initializing for EDIT.", appointment);
        // ADD DETAILED LOG FOR TIME
        console.log(`--> Received time for EDIT: '${appointment.time}' (Type: ${typeof appointment.time})`);
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
        console.log("--> Setting EDIT formData:", formattedAppointment);
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
  const handleChange = (field: string, value: string | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if any
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // If date or doctor changes, reset time (as slots will refetch)
    if ((field === 'date' || field === 'doctorId') && formData.time) {
       setFormData(prev => ({ ...prev, time: '' }));
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
    
    if (!formData.time) {
      errors.time = 'Time is required';
    }
    
    if (!formData.doctorId) {
      errors.doctorId = 'Doctor is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xs mx-1 sm:max-w-[425px] bg-white rounded-none sm:rounded-lg p-0 overflow-hidden m-0 sm:m-auto">
        <DialogHeader className="px-2 pt-2 pb-2 sm:px-6 sm:pt-6 sm:pb-4 bg-[#8B5C9E]/5 border-b border-[#8B5C9E]/10">
          <DialogTitle className="text-base sm:text-xl font-semibold text-[#8B5C9E]">
            {isNewAppointment ? 'New Appointment' : isPastAppointment ? 'View Past Appointment' : 'Edit Appointment'}
          </DialogTitle>
        </DialogHeader>
        <div className="p-2 sm:p-6 max-h-[80vh] overflow-y-auto space-y-3">
          {/* Patient Name (Full Width) */}
          <div className="space-y-1 mb-2">
            <Label htmlFor="patientName" className="text-xs sm:text-sm font-medium">
              Patient Name
            </Label>
            <Input
              id="patientName"
              value={formData.patientName || ''}
              onChange={(e) => handleChange('patientName', e.target.value)}
              placeholder="Enter patient name"
              className={`text-xs sm:text-sm h-8 sm:h-10 ${formErrors.patientName ? 'border-red-500' : ''}`}
              disabled={isPastAppointment}
            />
            {formErrors.patientName && (
              <p className="text-xs text-red-500">{formErrors.patientName}</p>
            )}
          </div>
          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter patient email"
                className={`text-xs sm:text-sm h-8 sm:h-10 ${formErrors.email ? 'border-red-500' : ''}`}
                disabled={isPastAppointment}
              />
              {formErrors.email && (
                <p className="text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter patient phone"
                className={`text-xs sm:text-sm h-8 sm:h-10 ${formErrors.phone ? 'border-red-500' : ''}`}
                disabled={isPastAppointment}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>
          </div>
          {/* Doctor & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <div className="space-y-1">
              <Label htmlFor="doctor" className="text-xs sm:text-sm font-medium">Doctor</Label>
              <Select 
                value={formData.doctorId} 
                onValueChange={(value) => handleChange('doctorId', value)}
                disabled={isPastAppointment}
              >
                <SelectTrigger id="doctor" className={`text-xs sm:text-sm h-8 sm:h-10 ${formErrors.doctorId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.speciality})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.doctorId && (
                <p className="text-xs text-red-500">{formErrors.doctorId}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs sm:text-sm font-medium">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
                disabled={isPastAppointment}
              >
                <SelectTrigger id="status" className="text-xs sm:text-sm h-8 sm:h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="date" className="text-xs sm:text-sm font-medium">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
                onChange={(e) => handleChange('date', new Date(e.target.value))}
                disabled={isPastAppointment || !isNewAppointment}
                min={format(new Date(), 'yyyy-MM-dd')} 
                className={`text-xs sm:text-sm h-8 sm:h-10 ${formErrors.date ? 'border-red-500' : ''}`}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time" className="text-xs sm:text-sm font-medium">Time</Label>
              <Select 
                value={formData.time || ''} 
                onValueChange={(value) => handleChange('time', value)}
                disabled={isPastAppointment || !formData.doctorId || !formData.date || isLoadingSlots || availableTimeSlots.length === 0}
              >
                <SelectTrigger id="time" className={`text-xs sm:text-sm h-8 sm:h-10 ${formErrors.time ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={isLoadingSlots ? 'Loading times...' : (availableTimeSlots.length === 0 ? 'No slots available' : 'Select time')} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {availableTimeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.time && (
                <p className="text-xs text-red-500">{formErrors.time}</p>
              )}
            </div>
          </div>
        </div>
        {/* Footer: Buttons side by side and full width on mobile */}
        <DialogFooter className="px-2 py-2 sm:px-6 sm:py-4 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            {isPastAppointment && (
              <Button
                onClick={handleBookAgain}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white order-1 sm:order-2"
              >
                Book Again
              </Button>
            )}
            {!isPastAppointment && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white order-1 sm:order-2"
              >
                {isSubmitting ? 'Saving...' : isNewAppointment ? 'Create' : 'Save Changes'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 