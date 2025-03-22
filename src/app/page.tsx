'use client';

import { useState } from 'react';
import BookingModal from '@/components/booking/BookingModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Sports Orthopedics
        </h1>
        <p className="text-xl text-gray-600">
          Book your appointment with our specialists
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="
          px-6 py-3 text-lg font-medium text-white
          bg-gradient-to-r from-[#8B5C9E] to-[#6B4A7E]
          rounded-xl shadow-lg
          hover:shadow-xl hover:scale-105
          transition-all duration-200
        "
      >
        Book Appointment
      </button>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
