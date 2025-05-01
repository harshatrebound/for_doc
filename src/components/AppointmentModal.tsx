'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
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
}

const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onSave, 
  doctors = [], 
  isNewAppointment = false,
  selectedDate
}: AppointmentModalProps) {
  // Form state
  const [formData, setFormData] = useState<Appointment>({
    patientName: '',
    date: new Date(),
    time: '',
    status: 'SCHEDULED',
    doctorId: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Initialize form with appointment data or default values
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened with appointment:", appointment);
      console.log("isNewAppointment:", isNewAppointment);
      console.log("selectedDate:", selectedDate);
      console.log("doctors:", doctors);
      
      if (isNewAppointment && selectedDate) {
        setFormData({
          patientName: '',
          date: selectedDate,
          time: '',
          status: 'SCHEDULED',
          doctorId: doctors.length > 0 ? doctors[0].id : '',
        });
      } else if (appointment) {
        console.log("Setting form data from appointment:", appointment);
        
        // Log each property to debug
        console.log("id:", appointment.id);
        console.log("patientName:", appointment.patientName);
        console.log("date:", appointment.date);
        console.log("time:", appointment.time);
        console.log("status:", appointment.status);
        console.log("doctorId:", appointment.doctorId);
        console.log("doctor:", appointment.doctor);
        
        // Create a complete appointment object with all properties
        const formattedAppointment = {
          id: appointment.id,
          patientName: appointment.patientName || '',
          date: new Date(appointment.date),
          time: appointment.time || '',
          status: (appointment.status || 'SCHEDULED').toUpperCase(),
          doctorId: appointment.doctorId || '',
          customerId: appointment.customerId || null,
          doctor: appointment.doctor || null,
        };
        
        console.log("Formatted appointment data for form:", formattedAppointment);
        console.log("--- DEBUG --- Doctor ID before setting form data:", formattedAppointment.doctorId);
        console.log("--- DEBUG --- Time before setting form data:", formattedAppointment.time);
        setFormData(formattedAppointment);
      }
      setAvailableTimeSlots([]);
    }
  }, [isOpen, appointment, isNewAppointment, selectedDate, doctors]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-[#8B5C9E]/5 border-b border-[#8B5C9E]/10">
          <DialogTitle className="text-xl font-semibold text-[#8B5C9E]">
            {isNewAppointment ? 'New Appointment' : 'Edit Appointment'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* Patient Name */}
          <div className="space-y-2">
            <Label htmlFor="patientName" className="text-sm font-medium">
              Patient Name
            </Label>
            <Input
              id="patientName"
              value={formData.patientName || ''}
              onChange={(e) => handleChange('patientName', e.target.value)}
              placeholder="Enter patient name"
              className={formErrors.patientName ? 'border-red-500' : ''}
            />
            {formErrors.patientName && (
              <p className="text-xs text-red-500">{formErrors.patientName}</p>
            )}
          </div>
          
          {/* Doctor Select (Moved Up) */}
          <div className="space-y-2">
            <Label htmlFor="doctor" className="text-sm font-medium">Doctor</Label>
            <Select 
              value={formData.doctorId} 
              onValueChange={(value) => handleChange('doctorId', value)}
            >
              <SelectTrigger id="doctor" className={formErrors.doctorId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} ({doctor.speciality})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.doctorId && (
              <p className="text-xs text-red-500">{formErrors.doctorId}</p>
            )}
          </div>
          
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
              onChange={(e) => handleChange('date', new Date(e.target.value))}
              disabled={!isNewAppointment}
              min={format(new Date(), 'yyyy-MM-dd')} 
              className={formErrors.date ? 'border-red-500' : ''}
            />
          </div>
          
          {/* Time Select (Now dependent on doctor/date) */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium">
              Time
            </Label>
            <Select 
              value={formData.time || ''} 
              onValueChange={(value) => handleChange('time', value)}
              disabled={!formData.doctorId || !formData.date || isLoadingSlots || availableTimeSlots.length === 0}
            >
              <SelectTrigger id="time" className={formErrors.time ? 'border-red-500' : ''}>
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
          
          {/* Status Select (Moved Down) */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger id="status">
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
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#8B5C9E] hover:bg-[#7a4f8a]"
          >
            {isSubmitting ? 'Saving...' : isNewAppointment ? 'Create' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 