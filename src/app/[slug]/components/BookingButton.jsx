'use client';

import { useState } from 'react';
import BookingModal from '@/components/booking/BookingModal';

export default function BookingButton({ category }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
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
