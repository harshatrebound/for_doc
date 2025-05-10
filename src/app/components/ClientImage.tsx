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
  hideOnError = false,
}: ClientImageProps) {
  const [hasError, setHasError] = React.useState(false);
  
  // If hideOnError is enabled and an error occurred, don't render anything
  if (hideOnError && hasError) {
    return null;
  }
  
  // Use provided source or fallback
  const imageSrc = src || DEFAULT_IMAGE;
  
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => {
        console.error(`Failed to load image: ${imageSrc}`);
        setHasError(true);
      }}
    />
  );
}