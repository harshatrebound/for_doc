'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { useBookingForm } from '@/contexts/BookingFormContext';

interface ThankYouProps {
  onClose: () => void;
}

const ThankYou = ({ onClose }: ThankYouProps) => {
  const { state } = useBookingForm();

  useEffect(() => {
    // Confetti effect
    const confetti = () => {
      const colors = ['#8B5C9E', '#6B4A7E', '#F9F5FF'];
      const confettiCount = 100;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);

      Array.from({ length: confettiCount }).forEach(() => {
        const confetti = document.createElement('div');
        const size = Math.random() * 10 + 5;
        confetti.style.position = 'absolute';
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.opacity = '0';
        confetti.style.transform = `translate(${Math.random() * window.innerWidth}px, ${-20}px)`;
        container.appendChild(confetti);

        const animation = confetti.animate(
          [
            {
              transform: `translate(${Math.random() * window.innerWidth}px, ${-20}px)`,
              opacity: 1,
            },
            {
              transform: `translate(${Math.random() * window.innerWidth}px, ${window.innerHeight + 20}px)`,
              opacity: 0,
            },
          ],
          {
            duration: Math.random() * 2000 + 1000,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }
        );

        animation.onfinish = () => {
          confetti.remove();
          if (container.children.length === 0) {
            container.remove();
          }
        };
      });
    };

    confetti();

    // Cleanup function
    return () => {
      const container = document.querySelector('div[style*="pointer-events: none"]');
      if (container) {
        container.remove();
      }
    };
  }, []);

  return (
    <div className="text-center py-12 px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
      >
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600 mb-8">
          Your appointment has been successfully scheduled
        </p>

        <div className="max-w-sm mx-auto bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Doctor</p>
            <p className="text-base font-semibold text-gray-900">
              {state.doctor?.name}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Date & Time</p>
            <p className="text-base font-semibold text-gray-900">
              {state.selectedDate && format(state.selectedDate, 'MMMM d, yyyy')}
              {' at '}
              {state.selectedTime}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Patient</p>
            <p className="text-base font-semibold text-gray-900">
              {state.patientName}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 px-6 py-2.5 bg-[#8B5C9E] text-white rounded-lg hover:bg-[#7A4B8D] transition-colors"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
};

export default ThankYou; 