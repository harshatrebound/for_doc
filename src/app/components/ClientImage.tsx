'use client';

import { useState } from 'react';
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
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_IMAGE);
  
  // Handle image load error
  const handleError = () => {
    if (imgSrc !== DEFAULT_IMAGE) {
      setImgSrc(DEFAULT_IMAGE);
    }
  };
  
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      unoptimized={unoptimized || imgSrc.startsWith('http://') || imgSrc.startsWith('https://')}
      onError={handleError}
    />
  );
} 