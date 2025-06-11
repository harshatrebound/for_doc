'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, HeartPulse } from 'lucide-react';

interface ProcedureCardProps {
  slug: string;
  title: string;
  category: string;
  categoryId: string;
  summary: string;
  imageUrl: string;
  procedureTime?: string;
  recoveryPeriod?: string;
  inpatient?: boolean;
}

export const ProcedureCard = ({
  slug,
  title,
  category,
  categoryId,
  summary,
  imageUrl,
  procedureTime,
  recoveryPeriod,
  inpatient
}: ProcedureCardProps) => {
  const [imgSrc, setImgSrc] = React.useState(imageUrl);
  const fallbackSrc = '/images/default-procedure.jpg';
  const href = `/procedure-surgery/${slug}`;
  
  // Generate a pastel color based on categoryId for the category badge
  const getCategoryColor = (id: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800'
    ];
    
    // Simple hash function to get consistent color for same category
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const categoryColor = getCategoryColor(categoryId);

  return (
    <Link href={href} className="block h-full">
      <div className="group relative flex flex-col bg-white rounded-xl hover:translate-y-[-4px] transition-all duration-300 overflow-hidden h-full transform shadow-[0_4px_8px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] cursor-pointer">
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
          <Image 
            src={imgSrc} 
            alt={title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgSrc(fallbackSrc)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50 opacity-60 group-hover:opacity-70 transition-opacity" />
          
          {/* Category Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}>
            {category}
          </div>
        </div>
        
        {/* Content Container */}
        <div className="flex-grow p-5 flex flex-col">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#8B5C9E] transition-colors">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
            {summary}
          </p>
          
          {/* Procedure Details */}
          <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
            {procedureTime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-[#8B5C9E]" />
                <span>{procedureTime}</span>
              </div>
            )}
            
            {recoveryPeriod && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-[#8B5C9E]" />
                <span>{recoveryPeriod}</span>
              </div>
            )}
            
            {/* {inpatient !== undefined && (
              <div className="flex items-center">
                <HeartPulse className="w-4 h-4 mr-1 text-[#8B5C9E]" />
                <span>{inpatient ? 'Inpatient' : 'Outpatient'}</span>
              </div>
            )} */}
          </div>
          
          {/* Visual Indicator */}
          <div className="inline-flex items-center text-[#8B5C9E] font-medium text-sm mt-auto">
            Learn More
            <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}; 