'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DoctorSelection from './DoctorSelection';
import DateTimeSelection from './DateTimeSelection';
import PatientDetails from './PatientDetails';
import Summary from './Summary';
import ThankYou from './ThankYou';
import { ErrorBoundary } from '../ErrorBoundary';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { id: 'doctor', title: 'Choose Doctor' },
  { id: 'datetime', title: 'Select Time' },
  { id: 'details', title: 'Your Details' },
  { id: 'confirm', title: 'Confirm' },
  { id: 'success', title: 'Success' }
];

interface BookingData {
  doctor: string;
  date: Date | null;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

interface BookingError {
  field: keyof BookingData;
  message: string;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<BookingError[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    doctor: '',
    date: null,
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const validateStep = (step: number): boolean => {
    const newErrors: BookingError[] = [];
    
    switch (step) {
      case 0:
        if (!bookingData.doctor) {
          newErrors.push({ field: 'doctor', message: 'Please select a doctor' });
        }
        break;
      case 1:
        if (!bookingData.date) {
          newErrors.push({ field: 'date', message: 'Please select a date' });
        }
        if (!bookingData.time) {
          newErrors.push({ field: 'time', message: 'Please select a time' });
        }
        break;
      case 2:
        if (!bookingData.name) {
          newErrors.push({ field: 'name', message: 'Name is required' });
        }
        if (!bookingData.email) {
          newErrors.push({ field: 'email', message: 'Email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) {
          newErrors.push({ field: 'email', message: 'Invalid email format' });
        }
        if (!bookingData.phone) {
          newErrors.push({ field: 'phone', message: 'Phone number is required' });
        }
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setErrors([]);
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors([]);
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
    setErrors([]);
  };

  const handleDoctorSelect = (doctorId: string) => {
    updateBookingData({ doctor: doctorId });
    // Move to next step after state update
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleDateTimeSelect = (dateTime: { date: Date | null; time: string }) => {
    updateBookingData(dateTime);
    if (dateTime.date && dateTime.time) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePatientDetailsSubmit = (details: Partial<BookingData>) => {
    updateBookingData(details);
    if (validateStep(2)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: bookingData.doctor,
          patientName: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          date: bookingData.date?.toISOString(),
          time: bookingData.time,
          notes: bookingData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('This time slot is no longer available. Please select another time.');
          handleBack(); // Go back to time selection
          return;
        }
        throw new Error(data.error || 'Failed to book appointment');
      }

      handleNext(); // Move to success step
      toast.success('Appointment booked successfully!');
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment';
      toast.error(errorMessage);
      
      // Handle retry logic
      if (retryCount < 2) {
        setRetryCount((prev) => prev + 1);
        toast.error(`Booking failed. Retrying... (Attempt ${retryCount + 1}/3)`);
        setTimeout(() => handleSubmit(), 2000);
      } else {
        toast.error('Maximum retry attempts reached. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      const confirmed = window.confirm('A booking is in progress. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    
    onClose();
    // Reset form after animation completes
    setTimeout(() => {
      setCurrentStep(0);
      setBookingData({
        doctor: '',
        date: null,
        time: '',
        name: '',
        phone: '',
        email: '',
        notes: '',
      });
      setErrors([]);
      setRetryCount(0);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="fixed inset-0 bg-black/25" onClick={handleClose} />
          <motion.div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <ErrorBoundary>
              <div className="p-6">
                {currentStep === 0 && (
                  <DoctorSelection
                    selected={bookingData.doctor}
                    onSelect={handleDoctorSelect}
                  />
                )}
                {currentStep === 1 && (
                  <DateTimeSelection
                    selected={{ date: bookingData.date, time: bookingData.time }}
                    doctorId={bookingData.doctor}
                    onSelect={handleDateTimeSelect}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 2 && (
                  <PatientDetails
                    data={{
                      name: bookingData.name,
                      phone: bookingData.phone,
                      email: bookingData.email,
                      notes: bookingData.notes
                    }}
                    onSubmit={handlePatientDetailsSubmit}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 3 && (
                  <Summary
                    bookingData={{
                      doctor: bookingData.doctor,
                      date: bookingData.date,
                      time: bookingData.time,
                      patientName: bookingData.name,
                      phone: bookingData.phone,
                      email: bookingData.email
                    }}
                    onConfirm={handleSubmit}
                    onBack={handleBack}
                    isSubmitting={isSubmitting}
                  />
                )}
                {currentStep === 4 && (
                  <ThankYou
                    bookingData={{
                      doctor: bookingData.doctor,
                      date: bookingData.date,
                      time: bookingData.time
                    }}
                    onClose={handleClose}
                  />
                )}
              </div>
            </ErrorBoundary>
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 border-t border-red-100">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm">
                    {error.message}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
