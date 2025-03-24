'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { BookingFormData, BookingStep } from '@/types/booking';
import DoctorSelection from './DoctorSelection';
import DateTimeSelection from './DateTimeSelection';
import PatientDetails from './PatientDetails';
import Summary from './Summary';
import ThankYou from './ThankYou';
import ProgressBar from './ProgressBar';
import { AlertCircle, X, ChevronDown } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(false);
  const dragControls = useDragControls();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('prevent-scroll');
    } else {
      document.body.classList.remove('prevent-scroll');
    }
    
    return () => {
      document.body.classList.remove('prevent-scroll');
    };
  }, [isOpen]);

  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    async function fetchAvailableSlots() {
      if (!selectedDate || !formData.doctor?.id) return;

      setIsLoadingSlots(true);
      try {
        const response = await fetch(
          `/api/available-slots?doctorId=${encodeURIComponent(formData.doctor.id)}&date=${selectedDate.toISOString().split('T')[0]}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();
        setAvailableSlots(data.slots);
        
        // Clear selected time if it's no longer available
        if (!data.slots.includes(selectedTime)) {
          setSelectedTime('');
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setErrorMessage('Failed to load available time slots');
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchAvailableSlots();
  }, [selectedDate, formData.doctor?.id]);

  const handleChange = (updates: Partial<BookingFormData>) => {
    // Clear error when user makes changes
    if (errorMessage) setErrorMessage(null);
    
    // If updates include selectedDate or selectedTime, update the state variables too
    if (updates.selectedDate !== undefined) {
      setSelectedDate(updates.selectedDate);
    }
    if (updates.selectedTime !== undefined) {
      setSelectedTime(updates.selectedTime);
    }
    
    setFormData(prevData => ({ ...prevData, ...updates }));
  };

  const handleNext = () => {
    setCurrentStep(prevStep => prevStep + 1);
    // Improved scroll reset with requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    });
  };

  const handleBack = () => {
    setCurrentStep(prevStep => prevStep - 1);
    // Improved scroll reset with requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    });
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
      
      // Always use the main endpoint to ensure webhook is triggered
      const endpoint = '/api/appointments';
      
      // Make API call to create the appointment
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

      // For debugging: Send webhook from client side to see in network tab
      if (responseData.debug?.webhookUrl && responseData.debug?.shouldSendWebhook) {
        console.log('Sending client-side webhook for debugging');
        try {
          const webhookResponse = await fetch(responseData.debug.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': 'appointment.created',
              'X-Debug-Mode': 'true'
            },
            body: JSON.stringify({
              event: 'appointment.created',
              data: responseData.appointment,
              timestamp: new Date().toISOString(),
            }),
          });
          
          const webhookResult = await webhookResponse.text();
          console.log('Debug webhook response:', {
            status: webhookResponse.status,
            body: webhookResult
          });
        } catch (webhookError) {
          console.error('Debug webhook error:', webhookError);
        }
      }

      // Provide haptic feedback on success (if available)
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }

      // Move to thank you step after successful submission
      handleNext();
    } catch (error) {
      console.error('Error submitting booking:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create appointment. Please try again.');
      
      // Provide error haptic feedback (if available)
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }
      
      // Scroll error into view if needed
      setTimeout(() => {
        const errorEl = document.querySelector('.error-message');
        errorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time slot selection component
  const TimeSlotSelector = () => (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {isLoadingSlots ? (
        <div className="col-span-3 text-center py-4">
          Loading available slots...
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="col-span-3 text-center py-4 text-gray-500">
          No available slots for this date
        </div>
      ) : (
        availableSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedTime(slot)}
            className={`p-2 rounded-lg text-sm ${
              selectedTime === slot
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {slot}
          </button>
        ))
      )}
    </div>
  );

  // Add this to your form validation
  const validateForm = () => {
    if (!selectedDate) {
      setErrorMessage('Please select a date');
      return false;
    }
    if (!selectedTime) {
      setErrorMessage('Please select an available time slot');
      return false;
    }
    if (!formData.patientName.trim()) {
      setErrorMessage('Please enter patient name');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Please enter email');
      return false;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter phone number');
      return false;
    }
    return true;
  };

  // Update your handleSubmit to use the selected time
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Ensure the formData is fully updated with current selected date and time
    const updatedFormData = {
      ...formData,
      selectedDate: selectedDate,
      selectedTime: selectedTime
    };

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      console.log('Submitting booking with data:', updatedFormData);
      
      if (!updatedFormData.doctor?.id) {
        throw new Error('Doctor selection is required');
      }
      
      if (!updatedFormData.selectedDate) {
        throw new Error('Please select a date');
      }
      
      if (!updatedFormData.selectedTime) {
        throw new Error('Please select a time');
      }

      // Format the date properly to avoid timezone issues
      const formattedDate = updatedFormData.selectedDate.toISOString().split('T')[0];
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: updatedFormData.doctor.id,
          patientName: updatedFormData.patientName.trim(),
          email: updatedFormData.email.trim(),
          phone: updatedFormData.phone.trim(),
          date: formattedDate,
          time: updatedFormData.selectedTime,
          notes: updatedFormData.notes?.trim() || '',
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create appointment');
      }

      console.log('Appointment created successfully:', responseData);
      
      // Update formData with the final values
      setFormData(updatedFormData);
      
      // Move to the next step (thank you page)
      handleNext();
    } catch (error) {
      console.error('Booking submission error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
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
            onSubmit={handleSubmit}
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

  // Dynamic heights based on screen size
  const getMaxHeight = () => {
    if (isMobile) {
      return { 
        height: '90vh', 
        maxHeight: '90vh'
      } as const;
    } else {
      return { 
        maxHeight: '90vh',
        height: 'auto'
      } as const;
    }
  };

  // Mobile variants for bottom sheet
  const mobileVariants = {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
    exit: { y: '100%', transition: { duration: 0.2 } }
  };

  // Desktop variants
  const desktopVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={currentStep === 4 ? handleClose : () => {}}
      className="relative z-50"
    >
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" aria-hidden="true" />

      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6">
        <MotionDialogPanel
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={isMobile ? mobileVariants : desktopVariants}
          drag={isMobile ? "y" : false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 && currentStep !== 4) {
              handleClose();
            }
          }}
          dragListener={isMobile && currentStep !== 4}
          className={`
            relative mx-auto w-full sm:max-w-xl bg-white overflow-hidden
            ${isMobile ? 'rounded-t-2xl shadow-2xl' : 'rounded-2xl shadow-2xl desktop-modal'}
          `}
          style={getMaxHeight()}
        >
          {/* Drag handle for mobile */}
          {isMobile && currentStep !== 4 && (
            <div 
              className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center cursor-grab active:cursor-grabbing z-20"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
          )}

          <div className={`flex flex-col h-full ${isMobile ? 'pt-6' : 'pt-0'}`}
               style={{ minHeight: isMobile ? undefined : '50vh' }}
          >
            {/* Progress Bar */}
            {currentStep < 4 && (
              <div className={`
                px-4 sm:px-6 pb-4 border-b border-gray-100 
                ${isMobile ? 'pr-4 sm:pr-10 pt-1' : 'pr-10 pt-6'}
                sticky top-0 bg-white z-10
              `}>
                <ProgressBar 
                  steps={STEPS} 
                  currentStep={currentStep}
                  isMobile={isMobile}
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
                  className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start error-message sticky top-[70px] z-10"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 mr-2" />
                  <div className="flex-1 text-sm text-red-700">{errorMessage}</div>
                  <button 
                    onClick={() => setErrorMessage(null)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Area with Custom Scrollbar */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto scrollbar-visible p-4 sm:p-6"
            >
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
              
              {/* Add extra padding at bottom to ensure content is scrollable past any fixed elements */}
              <div className="h-16 sm:h-8"></div>
            </div>

            {/* Close Button - positioned to avoid overlap with step indicators */}
            {currentStep < 4 && (
              <button
                onClick={handleClose}
                className={`
                  flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/30
                  transition-all duration-200 z-20
                  ${isMobile 
                    ? 'absolute top-1 right-2 w-8 h-8 text-gray-500' 
                    : 'absolute top-5 right-2 w-7 h-7 bg-gray-100 text-gray-500 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]'
                  }
                `}
                aria-label="Close"
              >
                <X size={isMobile ? 20 : 16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </MotionDialogPanel>
      </div>

      {/* Global styles for custom scrollbar and iOS-style components */}
      <style jsx global>{`
        /* Desktop modal styles */
        .desktop-modal {
          display: flex;
          flex-direction: column;
          max-height: 85vh;
          overflow: hidden; /* Contain overflow within the modal */
        }

        /* Modal content should expand but allow overflow */
        .desktop-modal > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0; /* Allow flex child to shrink below content size */
        }

        /* Modern scrollbar styling */
        .scrollbar-visible {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 158, 0.4) #f1f1f1;
          -webkit-overflow-scrolling: touch;
          overflow-y: auto !important;
          overflow-x: hidden;
          /* Critical for proper scrolling containment */
          flex: 1;
          min-height: 0;
        }
        
        .scrollbar-visible::-webkit-scrollbar {
          width: 8px !important;
          height: 8px !important;
          display: block !important;
        }
        
        .scrollbar-visible::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .scrollbar-visible::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 158, 0.4);
          border-radius: 10px;
          min-height: 40px;
        }
        
        .scrollbar-visible::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 158, 0.6);
        }

        /* Prevent scroll on body when modal is open */
        .prevent-scroll {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
          touch-action: none;
        }
        
        /* iOS style momentum scrolling */
        @media (pointer: coarse) {
          .scrollbar-visible {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
        }
        
        /* Desktop scrolling */
        @media (pointer: fine) {
          .scrollbar-visible {
            overflow-y: auto !important;
            overflow-x: hidden;
            scroll-behavior: smooth;
          }
        }
      `}</style>
    </Dialog>
  );
}
