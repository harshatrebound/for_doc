"use client";

import Image from 'next/image';
import { Container } from '@/components/ui/container';

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
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/60 to-transparent"></div>
        </div>
      </div>
      
      {/* Hero content */}
      <Container className="relative z-10 min-h-[60vh] md:min-h-[70vh] flex flex-col justify-end pb-16 pt-24 md:pt-32">
        <div className="max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">
            {name}
          </h1>
          
          {position && (
            <h2 className="text-xl md:text-2xl text-blue-100 font-medium mb-4">
              {position}
            </h2>
          )}
          
          {qualifications && (
            <p className="text-lg text-blue-200 font-light">
              {qualifications}
            </p>
          )}
        </div>
      </Container>
    </div>
  );
} 