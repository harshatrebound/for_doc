'use client';

import { useState, ReactNode } from 'react';
import { Calendar } from 'lucide-react';
import BookingModal from '@/components/booking/BookingModal';

interface BookingButtonProps {
  className?: string;
  icon?: ReactNode;
  text?: string;
  variant?: 'primary' | 'secondary';
  ariaLabel?: string;
}

export default function BookingButton({ 
  className = "w-full py-3 px-6 flex items-center justify-center space-x-2 bg-[#8B5C9E] text-white rounded-md hover:bg-[#7A4C8C] transition-colors",
  icon = <Calendar className="w-5 h-5 mr-2" />,
  text = "Book an Appointment",
  variant = 'primary',
  ariaLabel
}: BookingButtonProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsBookingModalOpen(true)}
        className={className}
        aria-label={ariaLabel || text}
      >
        {icon}
        {text && <span>{text}</span>}
      </button>
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
} 