"use client";

import React from 'react';
import Image from 'next/image';
import BookingButton from '@/components/BookingButton';
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StaffHeroProps {
  name: string;
  position: string;
  qualifications: string;
  imageUrl: string;
}

export function StaffHero({ name, position, qualifications, imageUrl }: StaffHeroProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-r from-[#8B5C9E]/10 to-[#8B5C9E]/5 rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#8B5C9E]/20 to-transparent opacity-30" />
      
      <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
        {/* Profile Image */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={160}
              height={160}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </motion.div>
        
        {/* Profile Info */}
        <div className="flex-grow">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            {name}
          </motion.h1>
          
          {position && (
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-[#8B5C9E] font-medium mb-3 flex items-center"
            >
              <Briefcase className="h-5 w-5 mr-2 text-[#8B5C9E]/70" />
              {position}
            </motion.h2>
          )}
          
          {qualifications && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-sm text-gray-600 flex items-center mb-4"
            >
              <GraduationCap className="h-5 w-5 mr-2 text-[#8B5C9E]/70" />
              {qualifications}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 md:mt-3"
          >
            <BookingButton 
              className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white text-center py-3 px-6 rounded-md font-medium transition-all duration-300 hover:shadow-lg flex items-center justify-center"
              text="Book Appointment"
              icon={<ArrowRight className="w-5 h-5 ml-2" />}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 