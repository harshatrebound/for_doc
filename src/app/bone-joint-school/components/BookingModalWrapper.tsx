'use client';

import React, { useState } from 'react';
import BookingModal from '@/components/booking/BookingModal';

interface BookingModalWrapperProps {
  children: React.ReactNode;
}

export default function BookingModalWrapper({ children }: BookingModalWrapperProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleClick = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>
      
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
} 