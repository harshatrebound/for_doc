"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export const BoneJointSchoolCard = ({ title, slug, summary, imageUrl, category }: { 
  title: string;
  slug: string;
  summary: string;
  imageUrl: string;
  category?: string;
}) => {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const fallbackSrc = '/images_bone_joint/doctor-holding-tablet-e-health-concept-business-concept.webp';
  
  const href = `/bone-joint-school/${slug}`;

  return (
    <Link href={href} className="group flex flex-col relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#8B5C9E]/30 overflow-hidden h-full">
      
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-200">
        <Image 
          src={imgSrc} 
          alt={title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            setImgSrc(fallbackSrc);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"/>
        
        {/* Add category label if available */}
        {category && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-[#8B5C9E]/80 text-white text-xs font-medium rounded-full z-10">
            {category}
          </div>
        )}
      </div>
      
      {/* Content Container */}
      <div className="flex-grow p-6 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#8B5C9E] transition-colors">
          {title}
        </h3>
        {summary && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
            {summary}
          </p>
        )}
        <div className="flex items-center text-[#8B5C9E] text-sm font-medium mt-auto pt-2">
          Learn More
          <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"/>
        </div>
      </div>
    </Link>
  );
}; 