'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface DoctorImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function DoctorImage({ src, alt, className = '' }: DoctorImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`
        w-full h-full flex items-center justify-center
        bg-[#8B5C9E]/5 rounded-xl
        ${className}
      `}>
        <User className="w-12 h-12 text-[#8B5C9E]" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
} 