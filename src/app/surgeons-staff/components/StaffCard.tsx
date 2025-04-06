"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserCircle2, Award } from 'lucide-react';

interface StaffCardProps {
  staff: {
    slug: string;
    name: string;
    position: string;
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
      y: -8,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-shadow duration-300"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <div className="block group h-full flex flex-col">
        <div className="relative h-72 overflow-hidden">
          {staff.imageUrl ? (
            <Image
              src={staff.imageUrl}
              alt={staff.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-purple-100 h-full w-full flex items-center justify-center">
              <UserCircle2 className="w-24 h-24 text-[#8B5C9E]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#8B5C9E]/80 to-transparent opacity-70"></div>
          
          {/* Position tag */}
          {staff.position && (
            <div className="absolute top-4 right-4 bg-[#8B5C9E] text-white text-xs font-medium px-2 py-1 rounded-md">
              {staff.position.includes('Consultant') ? 'Surgeon' : 
               staff.position.includes('Psychologist') ? 'Specialist' : 'Staff'}
            </div>
          )}
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#8B5C9E] transition-colors">
            {staff.name}
          </h3>
          
          {staff.position && (
            <p className="text-gray-700 font-medium mb-2">{staff.position}</p>
          )}
          
          {staff.qualifications && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{staff.qualifications}</p>
          )}
          
          <div className="mt-auto pt-4 flex items-center text-[#8B5C9E] text-sm font-medium">
            <Award className="w-4 h-4 mr-1" />
            <span>Expert Team Member</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 