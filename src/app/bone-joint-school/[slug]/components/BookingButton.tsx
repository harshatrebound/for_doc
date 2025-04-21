'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/booking/BookingModal';
import { ArrowRight } from 'lucide-react';

interface BookingButtonProps {
  fullWidth?: boolean;
  size?: 'default' | 'lg' | 'sm';
  variant?: 'default' | 'rounded' | 'outline';
  className?: string;
}

export default function BookingButton({ 
  fullWidth = false, 
  size = 'default',
  variant = 'default',
  className = '',
}: BookingButtonProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const getButtonClasses = () => {
    let classes = 'transition-all duration-300 font-medium flex items-center justify-center ';
    
    // Handle size
    if (size === 'lg') {
      classes += 'text-base py-3 ';
    } else if (size === 'sm') {
      classes += 'text-sm py-2 ';
    } else {
      classes += 'text-sm py-2.5 ';
    }
    
    // Handle width
    if (fullWidth) {
      classes += 'w-full ';
    }
    
    // Handle variant
    if (variant === 'rounded') {
      classes += 'rounded-full px-8 hover:scale-105 hover:shadow-xl ';
    } else if (variant === 'outline') {
      classes += 'rounded-md px-6 border-2 border-[#8B5C9E] bg-transparent text-[#8B5C9E] hover:bg-[#8B5C9E]/5 ';
    } else {
      classes += 'rounded-md px-6 ';
    }
    
    return `${classes} ${className}`;
  };

  return (
    <>
      <Button 
        onClick={() => setIsBookingModalOpen(true)}
        className={`${getButtonClasses()} bg-[#8B5C9E] text-white hover:bg-[#7a4f8b]`}
      >
         Request Consultation
         <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
      </Button>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
} 