'use client';

import * as React from 'react';
import Image from 'next/image';

// Default fallback image
const DEFAULT_IMAGE = '/images/default-procedure.jpg';

interface ClientImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  hideOnError?: boolean; // New prop to hide image on error
}

export default function ClientImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  unoptimized = false,
  hideOnError = false, // Default to showing the image even if it errors
}: ClientImageProps) {
  // Add state to track if the image has loaded or errored
  const [imageError, setImageError] = React.useState(false);
  
  // Use the provided src or fallback to default image
  const imageSrc = src || DEFAULT_IMAGE;
  
  // If hideOnError is true and we have an error, don't render anything
  if (hideOnError && imageError) {
    return null;
  }
  
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      unoptimized={true} // Set all images to unoptimized to avoid Next.js image optimization issues
      onError={() => {
        console.error(`Failed to load image: ${imageSrc}`);
        setImageError(true);
      }}
    />
  );
}