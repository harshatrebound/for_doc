'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Check, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import DoctorSelection from './DoctorSelection';
import DateTimeSelection from './DateTimeSelection';
import PatientDetails from './PatientDetails';
import Summary from './Summary';
import ThankYou from './ThankYou';
import { ErrorBoundary } from '../ErrorBoundary';
import { cn } from '@/lib/utils';

// Brand colors
const BRAND = {
  primary: 'var(--brand-primary)',
  primaryDark: 'var(--brand-primary-dark)',
  primaryLight: 'var(--brand-primary-light)',
  gradient: 'bg-brand-gradient'
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define the steps in the booking process
const STEPS = [
  { id: 'doctor', title: 'Doctor', description: 'Choose your doctor' },
  { id: 'datetime', title: 'Date & Time', description: 'Select appointment time' },
  { id: 'details', title: 'Your Details', description: 'Fill in your information' },
  { id: 'confirm', title: 'Review', description: 'Confirm your booking' },
];

// Define the booking data structure with initial state
interface BookingData {
  doctor: string;
  doctorName?: string;
  date: Date | null;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

const initialBookingData: BookingData = {
  doctor: '',
  doctorName: '',
  date: null,
  time: '',
  name: '',
  phone: '',
  email: '',
  notes: '',
};

// Define validation rules for each step
const validateStep = (step: number, data: BookingData): string[] => {
  const errors: string[] = [];
  
  switch (step) {
    case 0: // Doctor selection
      if (!data.doctor) errors.push('Please select a doctor');
      break;
    case 1: // Date & Time selection
      if (!data.date) {
        errors.push('Please select a date');
      } else if (!isValid(data.date)) {
        errors.push('Selected date is invalid');
      }
      
      if (!data.time) {
        errors.push('Please select a time');
      }
      break;
    case 2: // Patient details
      if (!data.name || data.name.trim().length < 2) 
        errors.push('Please enter your full name (minimum 2 characters)');
      if (!data.phone || data.phone.trim().length < 10) 
        errors.push('Please enter a valid phone number (minimum 10 digits)');
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.push('Please enter a valid email address');
      break;
    case 3: // Review step - validate entire form again
      if (!data.doctor) errors.push('Doctor selection is missing');
      if (!data.date || !isValid(data.date)) errors.push('Invalid appointment date');
      if (!data.time) errors.push('Appointment time is missing');
      if (!data.name || data.name.trim().length < 2) errors.push('Patient name is invalid');
      if (!data.phone || data.phone.trim().length < 10) errors.push('Phone number is invalid');
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Email address is invalid');
      break;
  }
  
  return errors;
};

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [isValidatingStep, setIsValidatingStep] = useState(false);

  // Reset form when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(0);
        setBookingData(initialBookingData);
        setErrors([]);
        setIsSubmitting(false);
        setIsBooked(false);
      }, 300); // Wait for exit animation to complete
    }
  }, [isOpen]);

  // Update booking data
  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
    
    // Clear errors when data changes
    setErrors([]);
  }, []);

  // Handle next step with validation
  const handleNext = useCallback(() => {
    // Start validation
    setIsValidatingStep(true);

    // Validate current step
    const stepErrors = validateStep(currentStep, bookingData);
    setErrors(stepErrors);

    if (stepErrors.length === 0) {
      // No errors, proceed to next step
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      // Show toast for validation errors
      toast.error('Please complete all required fields');
    }

    // End validation
    setIsValidatingStep(false);
  }, [currentStep, bookingData]);

  // Handle step back
  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors([]);
  }, []);

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    // Final validation before submission
    const finalErrors = validateStep(3, bookingData);
    if (finalErrors.length > 0) {
      setErrors(finalErrors);
      toast.error('Please correct all errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      // Prepare the appointment data with proper date formatting
      const appointmentData = {
        doctorId: bookingData.doctor,
        patientName: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        date: bookingData.date ? format(bookingData.date, 'yyyy-MM-dd') : '',
        time: bookingData.time,
        notes: bookingData.notes || '',
      };
      
      // Call the API to create the appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      // Parse response
      const data = await response.json();

      // Handle response
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          toast.error('This time slot is no longer available. Please select another time.');
          setCurrentStep(1); // Go back to time selection
          return;
        }
        
        // Generic error handling
        throw new Error(data.error || 'Failed to book appointment');
      }

      // Success path
      setIsBooked(true);
      setCurrentStep(STEPS.length); // Move to thank you step
      toast.success('Appointment booked successfully!');
    } catch (error) {
      // Error handling
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment';
      toast.error(errorMessage);
      
      // Add error to the list
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  }, [bookingData, isSubmitting]);

  // Handle closing the modal
  const handleClose = useCallback(() => {
    if (isSubmitting) {
      toast.error('Please wait while we process your booking');
      return;
    }
    
    // If there are changes and we're not at the thank you step, show confirmation
    const hasChanges = 
      bookingData.doctor !== initialBookingData.doctor ||
      bookingData.date !== initialBookingData.date ||
      bookingData.time !== initialBookingData.time ||
      bookingData.name !== initialBookingData.name;
    
    if (hasChanges && !isBooked) {
      const confirmed = window.confirm('Are you sure you want to cancel your booking? Any information entered will be lost.');
      if (!confirmed) return;
    }
    
    onClose();
  }, [onClose, isSubmitting, bookingData, isBooked]);

  // Doctor selection handler with doctor name
  const handleDoctorSelect = useCallback((doctorId: string, doctorName: string) => {
    updateBookingData({ doctor: doctorId, doctorName });
    
    // Immediately validate and proceed if valid
    setTimeout(() => {
      if (doctorId) {
        setCurrentStep(1);
      }
    }, 100);
  }, [updateBookingData]);

  // Function to get contents for current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Doctor selection
        return (
          <DoctorSelection
            selected={bookingData.doctor}
            onSelect={handleDoctorSelect}
          />
        );
      case 1: // Date & Time selection
        return (
          <DateTimeSelection
            selected={{ date: bookingData.date, time: bookingData.time }}
            doctorId={bookingData.doctor}
            onSelect={dateTime => updateBookingData(dateTime)}
            onBack={handleBack}
          />
        );
      case 2: // Patient details
        return (
          <PatientDetails
            data={{
              name: bookingData.name,
              phone: bookingData.phone,
              email: bookingData.email,
              notes: bookingData.notes
            }}
            onSubmit={data => {
              updateBookingData(data);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 3: // Summary
        return (
          <Summary
            bookingData={{
              doctor: bookingData.doctor,
              doctorName: bookingData.doctorName || '',
              date: bookingData.date,
              time: bookingData.time,
              patientName: bookingData.name,
              phone: bookingData.phone,
              email: bookingData.email
            }}
            // The Summary component shouldn't need its own navigation or confirm button
            // We'll handle this at the BookingModal level
            onConfirm={() => {}} // Empty function as we're using our own buttons
            onBack={() => {}} // Empty function as we're using our own buttons
            isSubmitting={isSubmitting}
          />
        );
      case 4: // Thank you
        return (
          <ThankYou
            bookingData={{
              doctor: bookingData.doctor,
              doctorName: bookingData.doctorName || '',
              date: bookingData.date,
              time: bookingData.time
            }}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <AnimatePresence mode="wait">
        <motion.div
          className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full z-10"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Progress Steps - Only show for main steps, not final confirmation */}
          {currentStep < STEPS.length && (
            <div className="bg-gradient-to-br from-brand-light to-white border-b pt-6 pb-4 px-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {STEPS[currentStep].title}
                </h2>
                <span className="text-sm font-medium text-gray-500">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
              </div>
              
              <div className="flex items-center w-full">
                {STEPS.map((step, index) => (
                  <div 
                    key={step.id} 
                    className="flex items-center relative"
                    style={{ width: index === STEPS.length - 1 ? 'auto' : `${100 / STEPS.length}%` }}
                  >
                    {/* Step Circle */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold z-10 border-2 transition-colors",
                        index < currentStep 
                          ? "bg-brand text-white border-brand" 
                          : index === currentStep
                            ? "bg-white text-brand border-brand"
                            : "bg-white text-gray-400 border-gray-300"
                      )}
                    >
                      {index < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Label - Show only on desktop */}
                    <div className="hidden sm:block absolute -bottom-7 left-0 w-full text-center">
                      <span 
                        className={cn(
                          "text-xs font-medium",
                          index <= currentStep ? "text-brand" : "text-gray-500"
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    
                    {/* Connecting Line */}
                    {index < STEPS.length - 1 && (
                      <div className="h-[2px] flex-grow mx-2" style={{ width: `calc(100% - 3rem)` }}>
                        <div
                          className={index < currentStep ? "h-full bg-brand" : "h-full bg-gray-200"}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Content Area */}
          <ErrorBoundary>
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[300px]"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
              
              {/* Error Messages */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {errors.length === 1 ? 'There is an issue' : 'There are issues that need your attention'}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ErrorBoundary>
          
          {/* Footer Navigation - Don't show on last (confirmation) step */}
          {currentStep < STEPS.length && !isBooked && (
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between items-center">
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors",
                  currentStep === 0 || isSubmitting
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              
              {/* Next/Submit Button */}
              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isValidatingStep}
                  className="px-5 py-2 rounded-lg bg-brand text-white font-medium text-sm hover:bg-brand-dark flex items-center gap-2 shadow-sm"
                >
                  {isValidatingStep ? 'Checking...' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-brand text-white font-medium text-sm hover:bg-brand-dark flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
