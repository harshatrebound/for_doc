'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DoctorSelection from './DoctorSelectionNew';
import DateTimeSelection from './DateTimeSelection';
import PatientDetails from './PatientDetails';
import Summary from './Summary';
import ThankYou from './ThankYou';

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-500"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <motion.div
              className="h-full bg-[#8B5C9E]"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Error display */}
          {errors.length > 0 && (
            <div className="px-6 pt-2">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 0 && (
                  <DoctorSelection
                    selected={bookingData.doctor}
                    onSelect={(doctorId) => {
                      updateBookingData({ doctor: doctorId });
                      handleNext();
                    }}
                  />
                )}
                {currentStep === 1 && (
                  <DateTimeSelection
                    selected={{ date: bookingData.date, time: bookingData.time }}
                    doctorId={bookingData.doctor}
                    onSelect={(dateTime) => {
                      updateBookingData(dateTime);
                      handleNext();
                    }}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 2 && (
                  <PatientDetails
                    data={{
                      name: bookingData.name,
                      phone: bookingData.phone,
                      email: bookingData.email
                    }}
                    onSubmit={(details) => {
                      updateBookingData(details);
                      handleNext();
                    }}
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
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="font-medium text-[#8B5C9E]">
                {steps[currentStep].title}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
