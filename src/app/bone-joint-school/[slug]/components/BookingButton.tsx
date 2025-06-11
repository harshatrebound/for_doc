'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/booking/BookingModal';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsBookingModalOpen(true)}
        className={cn(
          "bg-[#8B5C9E] text-white hover:bg-[#7a4f8b] shadow-lg hover:shadow-xl font-semibold",
          "h-auto px-8 py-4 text-lg w-full sm:w-auto min-w-[180px] justify-center",
          variant === 'rounded' && "rounded-full",
          className
        )}
      >
         Book an Appointment
         <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
      </Button>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
} 