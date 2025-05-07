'use client';

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
}

// Simplified version that doesn't use React state
export default function ClientImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  unoptimized = false,
}: ClientImageProps) {
  // Use the provided src or fallback to default image
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
      unoptimized={true} // Set all images to unoptimized to avoid Next.js image optimization issues
      onError={() => console.error(`Failed to load image: ${imageSrc}`)} // Simple error logging
    />
  );
} 