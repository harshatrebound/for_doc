'use client';

import Image from 'next/image';
import { useState } from 'react'; // Re-enable state

interface TopicImageProps {
  src: string;
  alt: string;
  fallbackSrc: string; // Add fallback prop
  fill?: boolean;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
}

// const FALLBACK_IMAGE_SRC = '/images_bone_joint/doctor-holding-tablet-e-health-concept-business-concept.webp';

// Temporary simplified version
export default function TopicImage({ 
  src,
  alt,
  fallbackSrc, // Use fallback prop
  fill = false, 
  className,
  priority = false,
  loading,
  sizes
}: TopicImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src); // Use state for image source

  // Handle cases where initial src might be invalid or loading fails
  const handleError = () => { 
    if (currentSrc !== fallbackSrc) { // Prevent infinite loop if fallback also fails
        setCurrentSrc(fallbackSrc); 
    }
  };

  // If currentSrc is null or empty (could happen if initial src and fallback are bad)
  if (!currentSrc) {
     return <div className={`w-full h-full bg-gray-200 ${className || ''}`}></div>;
  }

  return (
    <Image
      src={currentSrc} // Use state variable
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      loading={loading}
      sizes={sizes}
      onError={handleError} // Re-enable error handler
    />
  );
};