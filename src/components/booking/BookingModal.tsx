'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
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
    const newErrors: string[] = [];
    
    switch (step) {
      case 0:
        if (!bookingData.doctor) {
          newErrors.push('Please select a doctor');
        }
        break;
      case 1:
        if (!bookingData.date) {
          newErrors.push('Please select a date');
        }
        if (!bookingData.time) {
          newErrors.push('Please select a time');
        }
        break;
      case 2:
        if (!bookingData.name) {
          newErrors.push('Name is required');
        }
        if (!bookingData.email) {
          newErrors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) {
          newErrors.push('Invalid email format');
        }
        if (!bookingData.phone) {
          newErrors.push('Phone number is required');
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
      toast.error('Please complete all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors([]);
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
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
          setCurrentStep(1); // Go back to time selection
          return;
        }
        throw new Error(data.error || 'Failed to book appointment');
      }

      setCurrentStep(4); // Move to success step
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with progress indicators */}
            <div className="relative">
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Stepped Progress Bar */}
              <div className="bg-gradient-to-r from-purple-100 to-purple-50 pt-6 pb-4 px-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentStep < steps.length ? steps[currentStep].title : ''}
                </h2>
                
                <div className="flex items-center justify-between w-full">
                  {steps.slice(0, steps.length - 1).map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div 
                        className={`
                          relative flex items-center justify-center w-8 h-8 rounded-full 
                          text-sm font-medium border-2 transition-colors
                          ${index < currentStep 
                            ? 'bg-[#8B5C9E] text-white border-[#8B5C9E]' 
                            : index === currentStep 
                              ? 'bg-white text-[#8B5C9E] border-[#8B5C9E]' 
                              : 'bg-white text-gray-400 border-gray-300'
                          }
                        `}
                      >
                        {index < currentStep ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      
                      {index < steps.length - 2 && (
                        <div 
                          className={`w-full h-1 mx-2 ${
                            index < currentStep ? 'bg-[#8B5C9E]' : 'bg-gray-200'
                          }`}
                          style={{ width: '100%', maxWidth: '60px' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <ErrorBoundary>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep === 0 && (
                      <DoctorSelection
                        selected={bookingData.doctor}
                        onSelect={(doctor) => {
                          updateBookingData({ doctor });
                          handleNext();
                        }}
                      />
                    )}
                    
                    {currentStep === 1 && (
                      <DateTimeSelection
                        selected={{ date: bookingData.date, time: bookingData.time }}
                        doctorId={bookingData.doctor}
                        onSelect={(dateTime) => updateBookingData(dateTime)}
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

                {/* Error display */}
                {errors.length > 0 && (
                  <div className="mt-6 bg-red-50 border border-red-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      Please fix the following errors:
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Footer with navigation buttons (except for success step) */}
              {currentStep < 4 && (
                <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-1
                      ${currentStep === 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2 rounded-lg bg-[#8B5C9E] text-white font-medium hover:bg-[#7B4C8E] flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg bg-[#8B5C9E] text-white font-medium hover:bg-[#7B4C8E] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  )}
                </div>
              )}
            </ErrorBoundary>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
