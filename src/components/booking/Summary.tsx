'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, Check, Loader2 } from 'lucide-react';

interface SummaryProps {
  bookingData: {
    doctor: string;
    date: Date | null;
    time: string;
    patientName: string;
    phone: string;
    email: string;
  };
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const Summary = ({ bookingData, onConfirm, onBack, isSubmitting }: SummaryProps) => {
  const doctorFee = bookingData.doctor === 'dr-sameer' ? 700 : 1000;
  const doctorName = bookingData.doctor === 'dr-sameer' ? 'Dr. Sameer' : 'Other Doctor';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Booking Summary</h2>
        <p className="text-base font-medium text-gray-600">Review your appointment details</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4 max-h-[calc(100vh-24rem)] overflow-y-auto">
        {/* Doctor Info */}
        <div className="flex items-start space-x-3">
          <User className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-600">Doctor</p>
            <p className="font-semibold text-gray-900">{doctorName}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-600">Date</p>
            <p className="font-semibold text-gray-900">
              {bookingData.date ? format(bookingData.date, 'EEEE, MMMM d, yyyy') : ''}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-600">Time</p>
            <p className="font-semibold text-gray-900">{bookingData.time}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex items-start space-x-3">
          <User className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-600">Patient Name</p>
            <p className="font-semibold text-gray-900">{bookingData.patientName}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Phone className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-600">Phone</p>
            <p className="font-semibold text-gray-900">{bookingData.phone}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Mail className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">{bookingData.email}</p>
          </div>
        </div>

        {/* Fee */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Consultation Fee</span>
            <span className="text-lg font-semibold text-[#8B5C9E]">₹{doctorFee}</span>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-1">
            Payment to be made at the clinic
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <motion.button
          onClick={onConfirm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-[#8B5C9E] text-white font-medium hover:bg-[#7B4C8E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Confirm Booking</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Summary;
