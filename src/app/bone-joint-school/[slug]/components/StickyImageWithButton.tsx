'use client';

import { useState } from 'react';
import TopicImage from './TopicImage';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/booking/BookingModal';
import { ArrowRight } from 'lucide-react';

interface StickyImageWithButtonProps {
  imageUrl: string | null;
  altText: string;
  fallbackImageUrl: string;
}

export default function StickyImageWithButton({ 
  imageUrl, 
  altText, 
  fallbackImageUrl
}: StickyImageWithButtonProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const imageSrcToUse = imageUrl || fallbackImageUrl;

  return (
    <div className="sticky top-28"> {/* Make the whole div sticky */}
      {imageUrl && (
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-100 aspect-w-3 aspect-h-4 mb-6"> 
          <TopicImage
            src={imageSrcToUse} 
            alt={altText}
            fallbackSrc={fallbackImageUrl}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        </div>
      )}
      {!imageUrl && (
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-100 aspect-w-3 aspect-h-4 flex items-center justify-center mb-6">
          <span className="text-gray-400 italic">No image found</span>
        </div>
      )} 

      {/* Button below the image */}
      <Button 
        size="lg"
        onClick={() => setIsBookingModalOpen(true)}
        className="w-full group bg-[#8B5C9E] text-white hover:bg-[#7a4f8b] rounded-full px-8 py-4 text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
         Book an Appointment
         <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
      </Button>

      {/* Modal remains linked here */}
       <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
} 