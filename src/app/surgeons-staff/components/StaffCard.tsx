"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserCircle2, Award } from 'lucide-react';
import { getPublicImageUrl } from '@/lib/directus';

interface StaffCardProps {
  staff: {
    slug: string;
    name: string;
    title: string;
    qualifications: string;
    imageUrl: string;
    contactInfo?: string;
  };
}

export function StaffCard({ staff }: StaffCardProps) {
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      y: -4,
      boxShadow: '0 12px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 max-w-xs mx-auto"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <div className="block group flex flex-col">
        <div className="relative overflow-hidden">
          {staff.imageUrl ? (
            <Image
              src={getPublicImageUrl(staff.imageUrl) || '/placeholder-staff.jpg'}
              alt={staff.name}
              width={200}
              height={0}
              className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
              style={{ height: 'auto' }}
              sizes="(max-width: 768px) 200px, (max-width: 1200px) 200px, 200px"
            />
          ) : (
            <div className="bg-purple-50 h-full w-full flex items-center justify-center">
              <UserCircle2 className="w-16 h-16 text-[#8B5C9E]/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#8B5C9E]/60 to-transparent opacity-80"></div>
          
          {/* Position tag */}
          {staff.title && (
            <div className="absolute top-3 right-3 bg-[#8B5C9E] text-white text-xs font-medium px-2 py-1 rounded text-center">
              {staff.title.includes('Consultant') ? 'Surgeon' : 
               staff.title.includes('Psychologist') ? 'Specialist' : 
               staff.title.includes('Director') ? 'Director' : 'Staff'}
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#8B5C9E] transition-colors line-clamp-2">
            {staff.name}
          </h3>
          
          {staff.title && (
            <p className="text-sm text-gray-600 font-medium mb-2">{staff.title}</p>
          )}
          
          {staff.qualifications && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{staff.qualifications}</p>
          )}
          
          <div className="mt-auto pt-2 flex items-center text-[#8B5C9E] text-xs font-medium">
            <Award className="w-3 h-3 mr-1" />
            <span>Expert Team Member</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 