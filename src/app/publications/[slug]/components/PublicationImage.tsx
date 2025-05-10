'use client';

import { useEffect, useRef, useState } from 'react';
import ClientImage from '@/app/components/ClientImage';

interface PublicationImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  unoptimized?: boolean;
}

export default function PublicationImage({
  src,
  alt,
  width = 800,
  height = 500,
  className = 'w-full h-auto',
  unoptimized = false,
}: PublicationImageProps) {
  // Use a ref instead of state to avoid React import issues
  const errorRef = useRef(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create a test image to check if the source loads
    const img = new Image();
    img.src = src;
    
    img.onerror = () => {
      errorRef.current = true;
      // Hide the div if the image fails to load
      if (divRef.current) {
        divRef.current.style.display = 'none';
      }
    };
    
    return () => {
      // Clean up
      img.onerror = null;
    };
  }, [src]);

  return (
    <div 
      ref={divRef}
      className="rounded-lg overflow-hidden shadow-md"
    >
      <ClientImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        unoptimized={unoptimized}
      />
    </div>
  );
} 