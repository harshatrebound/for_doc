'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, Check, Loader2, ChevronLeft } from 'lucide-react';
import { BookingFormData } from '@/types/booking';

interface SummaryProps {
  formData: BookingFormData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const Summary: React.FC<SummaryProps> = ({
  formData,
  onSubmit,
  onBack,
  isSubmitting = false
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Provide haptic feedback when submitting
  const handleSubmit = () => {
    if (isMobile && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 sm:space-y-6"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#8B5C9E] hover:text-[#6B4A7E] rounded-md hover:bg-[#8B5C9E]/5 transition-colors touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Booking Summary</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review your appointment details before confirming
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
        {/* Doctor Info */}
        {formData.doctor && (
          <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-gray-100">
            <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center">
              <User className="w-5 sm:w-6 h-5 sm:h-6 text-[#8B5C9E]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Doctor</p>
              <p className="font-semibold text-gray-900 text-base sm:text-lg">{formData.doctor.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8B5C9E]/10 text-[#8B5C9E]">
                  {formData.doctor.speciality}
                </span>
                {formData.doctor.experience && (
                  <span className="text-xs sm:text-sm text-gray-500">{formData.doctor.experience} years exp.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Info */}
        <div className="flex flex-col sm:flex-row sm:gap-10 py-4 border-b border-gray-100">
          {/* Date */}
          {formData.selectedDate && (
            <div className="flex items-start gap-3 mb-4 sm:mb-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Date</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {format(formData.selectedDate, isMobile ? 'EEE, MMM d, yyyy' : 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          )}

          {/* Time */}
          {formData.selectedTime && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Time</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {(() => {
                    const [hours, minutes] = formData.selectedTime.split(':');
                    const hour = parseInt(hours, 10);
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour % 12 || 12;
                    return `${hour12}:${minutes} ${period}`;
                  })()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="py-4 border-b border-gray-100">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Patient Information</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{formData.patientName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{formData.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{formData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes (if any) */}
        {formData.notes && (
          <div className="py-4 border-b border-gray-100">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Additional Notes</p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              {formData.notes}
            </div>
          </div>
        )}

        {/* Fee */}
        {formData.doctor && (
          <div className="pt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Consultation Fee</span>
              <span className="text-xl font-semibold text-[#8B5C9E]">₹{formData.doctor.fee}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Check className="w-4 h-4 mr-1.5 text-green-500" />
              Payment to be made at the clinic
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <motion.button
          type="button"
          onClick={handleSubmit}
          whileHover={{ scale: isMobile ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-white bg-[#8B5C9E] rounded-lg hover:bg-[#7A4B8D] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E] transition-colors disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Check className="w-4 h-4 mr-2" />
              Confirm Booking
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Summary;
