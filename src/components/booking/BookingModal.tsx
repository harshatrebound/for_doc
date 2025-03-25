'use client';

import { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useBookingForm, BookingFormProvider } from '@/contexts/BookingFormContext';
import DoctorSelection from './DoctorSelection';
import DateTimeSelection from './DateTimeSelection';
import PatientDetails from './PatientDetails';
import Summary from './Summary';
import ThankYou from './ThankYou';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModalContent = ({ isOpen, onClose }: BookingModalProps) => {
  const { state, dispatch } = useBookingForm();

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: 'RESET_FORM' });
    }
  }, [isOpen, dispatch]);

  const handleBack = () => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  };

  const handleSubmit = async () => {
    if (!canProceed() || state.isSubmitting) return;

    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });
      // Add your submission logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      dispatch({ type: 'SET_STEP', payload: 4 });
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const canProceed = () => {
    switch (state.currentStep) {
      case 0: // Doctor Selection
        return !!state.doctor;
      
      case 1: // Date & Time Selection
        return !!state.selectedDate && !!state.selectedTime;
      
      case 2: // Patient Details
        return (
          !!state.patientName?.trim() &&
          !!state.email?.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim()) &&
          !!state.phone?.trim() &&
          /^\+?[\d\s-]{10,}$/.test(state.phone.replace(/\D/g, ''))
        );
      
      case 3: // Summary
        return !state.isSubmitting;
      
      default:
        return false;
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => state.currentStep === 4 && onClose()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Close button */}
          {state.currentStep !== 4 && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col h-[85vh]">
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  {state.currentStep === 0 && <DoctorSelection />}
                  {state.currentStep === 1 && <DateTimeSelection onBack={handleBack} />}
                  {state.currentStep === 2 && <PatientDetails onBack={handleBack} />}
                  {state.currentStep === 3 && (
                    <Summary 
                      formData={state}
                      onBack={handleBack} 
                      onSubmit={handleSubmit}
                      isSubmitting={state.isSubmitting}
                    />
                  )}
                  {state.currentStep === 4 && <ThankYou onClose={onClose} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer - Only show if not on Thank You step and Summary doesn't have its own submit button */}
            {state.currentStep < 3 && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  {state.currentStep > 0 ? (
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`
                      px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${canProceed()
                        ? 'bg-[#8B5C9E] text-white hover:bg-[#7A4B8D] shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default function BookingModal(props: BookingModalProps) {
  return (
    <BookingFormProvider>
      <BookingModalContent {...props} />
    </BookingFormProvider>
  );
}
