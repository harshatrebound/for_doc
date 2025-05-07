'use client';

import { useState } from 'react';
import BookingModal from '@/components/booking/BookingModal';

interface BookingButtonProps {
  category: string;
}

export default function BookingButton({ category }: BookingButtonProps) {
  // Using the useState hook directly from the client component
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        onClick={openModal}
        className="w-full py-3 px-4 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white font-medium rounded-lg transition-colors text-center"
      >
        Book an Appointment
      </button>

      {isModalOpen && (
        <BookingModal 
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}
