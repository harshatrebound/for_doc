'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ThankYouProps } from '@/types/booking';

const ThankYou = ({ formData }: ThankYouProps) => {
  const [confetti, setConfetti] = useState<{ x: number; y: number; size: number; color: string }[]>([]);
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

  useEffect(() => {
    // Generate confetti particles - reduced for mobile
    const colors = ['#8B5C9E', '#6B4A7E', '#FFC0CB', '#FFD700', '#90EE90', '#ADD8E6'];
    const particleCount = isMobile ? 50 : 100; // Reduced for mobile
    
    const newConfetti = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * 100, // percentage across screen
      y: -20 - Math.random() * 80, // start above screen
      size: isMobile ? 3 + Math.random() * 7 : 5 + Math.random() * 10, // smaller on mobile
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    
    setConfetti(newConfetti);
    
    // Success haptic feedback
    if (isMobile && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 20, 100]);
    }
  }, [isMobile]);

  const addToCalendar = () => {
    if (!formData.selectedDate || !formData.doctor) return;

    const [hours, minutes] = formData.selectedTime.split(':');
    const startDate = new Date(formData.selectedDate);
    startDate.setHours(parseInt(hours), parseInt(minutes));
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    const event = {
      title: `Appointment with ${formData.doctor.name}`,
      description: `Medical appointment\nDoctor: ${formData.doctor.name} (${formData.doctor.speciality})\nFee: ₹${formData.doctor.fee}`,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location: 'Medical Clinic',
    };

    // Use different calendar provider based on device
    if (isMobile && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // iOS calendar format
      const iosCalendarUrl = `webcal://p76-caldav.icloud.com/published/2/MTI5NDI0MzM3MDEyOTQyNM3MTSCgbR7mUOCPpxM2G6qRCm`;
      window.open(iosCalendarUrl, '_blank');
    } else {
      // Google Calendar (default)
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      }/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
      }&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(
        event.location
      )}`;
      window.open(googleCalendarUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center"
    >
      {/* Confetti animation - optimized for performance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full will-change-transform"
            initial={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`, 
              opacity: 1 
            }}
            animate={{ 
              y: '120vh', 
              opacity: [1, 1, 0.8, 0.6, 0.4, 0],
              rotate: Math.random() * 360,
            }}
            transition={{ 
              duration: isMobile ? 2 + Math.random() * 2 : 4 + Math.random() * 4,
              delay: Math.random() * 1,
              ease: [0.23, 0.44, 0.34, 0.99],
            }}
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              transform: `translateZ(0)`, // hardware acceleration
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg mb-6"
      >
        <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
      >
        Thank You!
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-8"
      >
        <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">Your Appointment is Confirmed</p>
        {formData.doctor && formData.selectedDate && (
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4 sm:px-0">
            Your appointment with <span className="font-medium text-[#8B5C9E]">{formData.doctor.name}</span> has been scheduled for{' '}
            <span className="font-medium text-gray-800">
              {format(formData.selectedDate, isMobile ? 'EEE, MMM d' : 'EEEE, MMMM d')} at {(() => {
                const [hours, minutes] = formData.selectedTime.split(':');
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${period}`;
              })()}
            </span>
          </p>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-md w-full max-w-md mb-6 sm:mb-8 mx-4 sm:mx-0"
      >
        <div className="flex items-start mb-4">
          <div className="bg-[#8B5C9E]/10 p-3 rounded-lg mr-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B5C9E]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Appointment Details</h3>
            <p className="text-xs sm:text-sm text-gray-500">Please arrive 10 minutes before your scheduled time</p>
          </div>
        </div>

        {formData.doctor && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-3">
              <span className="text-sm text-gray-500">Doctor</span>
              <span className="text-sm font-medium text-gray-900">{formData.doctor.name}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-sm text-gray-500">Specialty</span>
              <span className="text-sm font-medium text-gray-900">{formData.doctor.speciality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Fee</span>
              <span className="text-sm font-medium text-[#8B5C9E]">₹{formData.doctor.fee}</span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
            <p className="text-xs sm:text-sm text-gray-500">
              A confirmation email has been sent to <span className="font-medium">{formData.email}</span>
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
            <p className="text-xs sm:text-sm text-gray-500">
              We've also sent the details to your phone at <span className="font-medium">{formData.phone}</span>
            </p>
          </div>
        </div>

        <motion.button
          onClick={addToCalendar}
          whileHover={{ scale: isMobile ? 1.01 : 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center w-full px-5 py-3 rounded-lg bg-gradient-to-r from-[#8B5C9E] to-[#7B4C8E] text-white font-medium hover:opacity-95 transition-all duration-200 shadow-md hover:shadow-lg touch-manipulation"
        >
          <Calendar className="w-4 h-4 mr-2" />
          <span>Add to {isMobile && /iPhone|iPad|iPod/.test(navigator.userAgent) ? "iOS" : "Google"} Calendar</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <a 
          href="/" 
          className="text-[#8B5C9E] hover:text-[#7A4B8D] text-sm font-medium transition-colors hover:underline px-4 py-2 touch-manipulation"
        >
          ← Return to Home
        </a>
      </motion.div>
    </motion.div>
  );
};

export default ThankYou; 