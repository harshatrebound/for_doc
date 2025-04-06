"use client";

import Image from 'next/image';
import { useState } from 'react';

export const HeroImage = ({ 
  src, 
  alt, 
  className 
}: { 
  src: string;
  alt: string;
  className?: string;
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const fallbackSrc = '/images_bone_joint/doctor-holding-tablet-e-health-concept-business-concept.webp';
  
  return (
    <Image 
      src={imgSrc} 
      alt={alt} 
      fill 
      className={className} 
      priority
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}; 