'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BookingFormData, BookingStep } from '@/types/booking';
import DoctorSelection from './DoctorSelection';
import DateTimeSelection from './DateTimeSelection';
import PatientDetails from './PatientDetails';
import Summary from './Summary';
import ThankYou from './ThankYou';
import ProgressBar from './ProgressBar';
import { AlertCircle, X } from 'lucide-react';

const STEPS: BookingStep[] = [
  { id: 'doctor', title: 'Select Doctor' },
  { id: 'datetime', title: 'Date & Time' },
  { id: 'details', title: 'Your Details' },
  { id: 'summary', title: 'Summary' },
  { id: 'thankyou', title: 'Thank You' }
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fix for the Dialog.Panel motion component
const MotionDialogPanel = motion(Dialog.Panel);

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BookingFormData>({
    doctor: null,
    selectedDate: null,
    selectedTime: '',
    patientName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (updates: Partial<BookingFormData>) => {
    // Clear error when user makes changes
    if (errorMessage) setErrorMessage(null);
    setFormData(prevData => ({ ...prevData, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      doctor: null,
      selectedDate: null,
      selectedTime: '',
      patientName: '',
      email: '',
      phone: '',
      notes: ''
    });
    onClose();
  };

  const handleSubmitBooking = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      // Validate required fields before submission
      if (!formData.doctor?.id) {
        throw new Error('Doctor selection is required');
      }
      
      // Check if the doctor ID is a valid UUID or hyphenated ID
      const isValidDoctorId = () => {
        const id = formData.doctor?.id || '';
        // UUID v4 format regex
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        // Allow any hyphenated or alphanumeric ID
        const validIdRegex = /^[a-z0-9_-]+$/i;
        return uuidRegex.test(id) || validIdRegex.test(id);
      };
      
      if (!isValidDoctorId()) {
        throw new Error(`Invalid doctor ID format (${formData.doctor?.id}). Please select a different doctor.`);
      }
      
      if (!formData.selectedDate) {
        throw new Error('Appointment date is required');
      }
      
      if (!formData.selectedTime) {
        throw new Error('Appointment time is required');
      }
      
      if (!formData.patientName.trim()) {
        throw new Error('Patient name is required');
      }
      
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Valid email address is required');
      }
      
      // Phone validation similar to backend (10+ digits)
      if (!formData.phone.trim() || !/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
        throw new Error('Phone number must have at least 10 digits');
      }
      
      // Format time to ensure it's in HH:MM format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(formData.selectedTime)) {
        throw new Error('Invalid time format. Should be HH:MM');
      }

      // Prepare booking data for submission
      const phoneDigitsOnly = formData.phone.replace(/\D/g, '');
      const formattedPhone = phoneDigitsOnly.length > 10 
        ? `+${phoneDigitsOnly}` 
        : phoneDigitsOnly;
      
      // Format the date to ensure it's properly normalized and in ISO format
      const appointmentDate = new Date(formData.selectedDate);
      // Set hours to 0 to avoid timezone issues
      appointmentDate.setHours(0, 0, 0, 0);
      
      const bookingData = {
        doctorId: formData.doctor.id,
        patientName: formData.patientName.trim(),
        email: formData.email.trim(),
        phone: formattedPhone,
        date: appointmentDate.toISOString(),
        time: formData.selectedTime,
        notes: formData.notes?.trim() || '',
      };
      
      console.log('Submitting booking data:', bookingData);
      
      // Use the test endpoint when needed for debugging
      const useTestEndpoint = true; // Set to true to use test endpoint
      const endpoint = useTestEndpoint ? '/api/appointments/test' : '/api/appointments';
      
      // Make API call to create the appointment (webhook is handled on the server)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData);
      
      if (!response.ok) {
        // Extract detailed error information if available
        const errorMessage = responseData.error || 'Failed to create appointment';
        const errorCode = responseData.code || '';
        const detailedError = errorCode ? `${errorMessage} (${errorCode})` : errorMessage;
        throw new Error(detailedError);
      }

      // Move to thank you step after successful submission
      handleNext();
    } catch (error) {
      console.error('Error submitting booking:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DoctorSelection
            formData={formData}
            onChange={handleChange}
            onSubmit={handleNext}
          />
        );
      case 1:
        return (
          <DateTimeSelection
            formData={formData}
            onChange={handleChange}
            onSubmit={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <PatientDetails
            formData={formData}
            onChange={handleChange}
            onSubmit={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Summary
            formData={formData}
            onSubmit={handleSubmitBooking}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      case 4:
        return <ThankYou formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={currentStep === 4 ? handleClose : () => {}}
      className="relative z-50"
    >
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <MotionDialogPanel
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative mx-auto max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col h-[85vh] max-h-[750px]">
            {/* Progress Bar */}
            {currentStep < 4 && (
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 pr-10">
                <ProgressBar 
                  steps={STEPS} 
                  currentStep={currentStep} 
                />
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 mr-2" />
                  <div className="flex-1 text-sm text-red-700">{errorMessage}</div>
                  <button 
                    onClick={() => setErrorMessage(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Area with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>

            {/* Close Button - positioned to avoid overlap with step indicators */}
            {currentStep < 4 && (
              <button
                onClick={handleClose}
                className="absolute top-5 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/30"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </MotionDialogPanel>
      </div>

      {/* Global styles for custom scrollbar */}
      <style jsx global>{`
        /* Modern scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
          margin: 0.5rem 0;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 158, 0.2);
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 158, 0.4);
        }
        
        /* Firefox */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 158, 0.2) transparent;
        }
      `}</style>
    </Dialog>
  );
}
