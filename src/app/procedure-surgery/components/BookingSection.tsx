'use client';

import { useState } from 'react';
import Link from 'next/link';
import BookingModal from '@/components/booking/BookingModal';

export default function BookingSection() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule a Consultation</h3>
        <p className="text-gray-600 mb-6">
          Would you like to learn more about this procedure or schedule a consultation with our specialists?
        </p>
        <div className="space-y-4">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="block w-full py-3 px-4 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white font-medium rounded-lg text-center transition-colors"
          >
            Book an Appointment
          </button>
          <Link
            href="/contact"
            className="block w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium rounded-lg text-center transition-colors"
          >
            Contact Us
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Related Procedures</h4>
          <p className="text-gray-500 text-sm italic mb-2">Coming soon</p>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </>
  );
} 