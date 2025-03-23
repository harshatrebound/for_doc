'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { PatientDetailsProps } from '@/types/booking';

export default function PatientDetails({ formData, onChange, onSubmit, onBack }: PatientDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[- ]/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    
    // Provide haptic feedback if there are errors and on mobile
    if (Object.keys(newErrors).length > 0 && isMobile && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([100, 50, 100]);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Success haptic feedback
      if (isMobile && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
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
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Your Details</h2>
        <p className="mt-1 text-sm text-gray-600">
          Please provide your contact information for the appointment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className={`
            relative rounded-lg border overflow-hidden transition-all duration-150
            ${errors.patientName 
              ? 'border-red-300 ring-1 ring-red-300' 
              : isFocused === 'patientName'
                ? 'border-[#8B5C9E] ring-2 ring-[#8B5C9E]/30' 
                : 'border-gray-300'
            }
          `}>
            <input
              type="text"
              id="patientName"
              value={formData.patientName}
              onChange={(e) => onChange({ patientName: e.target.value })}
              onFocus={() => setIsFocused('patientName')}
              onBlur={() => setIsFocused(null)}
              autoComplete="name"
              className="block w-full px-3.5 py-3 sm:py-2.5 text-gray-900 shadow-sm bg-transparent focus:outline-none"
              placeholder="Enter your full name"
              inputMode="text"
            />
          </div>
          {errors.patientName && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {errors.patientName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className={`
            relative rounded-lg border overflow-hidden transition-all duration-150
            ${errors.email 
              ? 'border-red-300 ring-1 ring-red-300' 
              : isFocused === 'email'
                ? 'border-[#8B5C9E] ring-2 ring-[#8B5C9E]/30' 
                : 'border-gray-300'
            }
          `}>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              onFocus={() => setIsFocused('email')}
              onBlur={() => setIsFocused(null)}
              autoComplete="email"
              className="block w-full px-3.5 py-3 sm:py-2.5 text-gray-900 shadow-sm bg-transparent focus:outline-none"
              placeholder="you@example.com"
              inputMode="email"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className={`
            relative rounded-lg border overflow-hidden transition-all duration-150
            ${errors.phone 
              ? 'border-red-300 ring-1 ring-red-300' 
              : isFocused === 'phone'
                ? 'border-[#8B5C9E] ring-2 ring-[#8B5C9E]/30' 
                : 'border-gray-300'
            }
          `}>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              onFocus={() => setIsFocused('phone')}
              onBlur={() => setIsFocused(null)}
              autoComplete="tel"
              className="block w-full px-3.5 py-3 sm:py-2.5 text-gray-900 shadow-sm bg-transparent focus:outline-none"
              placeholder="(123) 456-7890"
              inputMode="tel"
            />
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {errors.phone}
            </p>
          )}
        </div>

        <div className="pt-1">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <div className={`
            relative rounded-lg border overflow-hidden transition-all duration-150
            ${isFocused === 'notes'
              ? 'border-[#8B5C9E] ring-2 ring-[#8B5C9E]/30' 
              : 'border-gray-300'
            }
          `}>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              onFocus={() => setIsFocused('notes')}
              onBlur={() => setIsFocused(null)}
              placeholder="Any specific concerns or requirements..."
              className="block w-full px-3.5 py-3 text-gray-900 shadow-sm bg-transparent focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <motion.button
            type="submit"
            whileHover={{ scale: isMobile ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-3 w-full sm:w-auto text-sm font-medium text-white bg-[#8B5C9E] rounded-lg hover:bg-[#7A4B8D] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E] transition-colors touch-manipulation"
          >
            Continue to Summary
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
