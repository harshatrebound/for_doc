"use client";

import Image from 'next/image';
import { Container } from '@/components/ui/container';
import BookingButton from '@/components/BookingButton';
import { ArrowRight } from 'lucide-react';

interface StaffHeroProps {
  name: string;
  position: string;
  qualifications: string;
  imageUrl: string;
}

export function StaffHero({ name, position, qualifications, imageUrl }: StaffHeroProps) {
  return (
    <div className="relative w-full">
      {/* Hero background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full min-h-[60vh] md:min-h-[70vh] overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover object-top filter brightness-75"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#8B5C9E]/90 via-[#2E3A59]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        </div>
      </div>
      
      {/* Hero content */}
      <Container className="relative z-10 min-h-[60vh] md:min-h-[70vh] flex flex-col justify-end pb-16 pt-24 md:pt-32">
        <div className="max-w-3xl text-white">
          <div className="inline-block bg-[#8B5C9E]/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-[#8B5C9E]/30">
            ORTHOPEDIC SPECIALIST
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">
            {name}
          </h1>
          
          {position && (
            <h2 className="text-xl md:text-2xl text-white/90 font-medium mb-4">
              {position}
            </h2>
          )}
          
          {qualifications && (
            <p className="text-lg text-white/80 font-light mb-8">
              {qualifications}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <BookingButton 
              className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white rounded-md px-8 py-4 text-lg font-medium transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
              text="Request a Consultation"
              icon={<ArrowRight className="w-5 h-5 mr-2" />}
            />
          </div>
        </div>
      </Container>
    </div>
  );
} 