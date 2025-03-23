'use client';

import { useEffect, useState } from 'react';
import { Star, Clock, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Doctor, DoctorSelectionProps } from '@/types/booking';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doctor: Doctor) => void;
}

const DoctorCard = ({ doctor, isSelected, onSelect }: DoctorCardProps) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onSelect(doctor)}
    className={`
      w-full p-5 rounded-2xl transition-all duration-200
      ${isSelected 
        ? 'bg-gradient-to-br from-[#8B5C9E] to-[#6B4A7E] text-white shadow-lg' 
        : 'bg-white border border-gray-200 hover:border-[#8B5C9E]/30 hover:bg-[#F9F5FF]'
      }
    `}
  >
    <div className="flex items-start gap-4">
      {/* Doctor Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={doctor.image || '/default-doctor.png'}
          alt={doctor.name}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Doctor Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
              {doctor.name}
            </h3>
            <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
              {doctor.speciality}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-xl font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>₹{doctor.fee}</div>
            <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>Per Consultation</div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="mt-3 flex flex-wrap gap-2">
          {doctor.qualifications?.map((qual: string, index: number) => (
            <span
              key={index}
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-[#8B5C9E]/5 text-[#8B5C9E]'
                }
              `}
            >
              {qual}
            </span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-6">
            {doctor.rating && (
              <div className="flex items-center">
                <Star className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-yellow-500'}`} fill="currentColor" />
                <span className={`ml-1 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {doctor.rating}
                </span>
                <span className={`ml-1 text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>Rating</span>
              </div>
            )}
            
            {doctor.experience && (
              <div className="flex items-center">
                <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#8B5C9E]'}`} />
                <span className={`ml-1 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {doctor.experience}+
                </span>
                <span className={`ml-1 text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>years</span>
              </div>
            )}
            
            {doctor.availability && (
              <div className="flex items-center">
                <Calendar className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#8B5C9E]'}`} />
                <span className={`ml-1 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  Available
                </span>
                <span className={`ml-1 text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>Today</span>
              </div>
            )}
          </div>
          
          {/* Location on new line */}
          {doctor.location && (
            <div className="flex items-center">
              <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#8B5C9E]'}`} />
              <span className={`ml-1 text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                {doctor.location}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.button>
);

const DoctorSelection = ({ formData, onChange, onSubmit }: DoctorSelectionProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        
        setDoctors(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load doctors';
        setError(errorMessage);
        console.error('Error fetching doctors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctor: Doctor) => {
    // Accept all doctor ID formats that are valid
    const isValidDoctorId = (id: string) => {
      // UUID v4 format regex
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      // Allow any hyphenated or alphanumeric ID
      const validIdRegex = /^[a-z0-9_-]+$/i;
      return uuidRegex.test(id) || validIdRegex.test(id);
    };

    if (!isValidDoctorId(doctor.id)) {
      setError(`Cannot book with this doctor (Invalid ID format: ${doctor.id}). Please select a different doctor.`);
      return;
    }
    
    // Provide haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    onChange({ doctor });
    onSubmit();
  };

  // Loading skeleton for better UX
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
        </div>
        
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-24 rounded-xl bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 sm:py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Doctors</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-[#8B5C9E] hover:bg-[#7A4B8D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="text-center py-6 sm:py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Doctors Available</h3>
        <p className="text-gray-600">Please check back later or contact support for assistance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Choose Your Doctor
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Select a doctor to proceed with your appointment
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            isSelected={formData.doctor?.id === doctor.id}
            onSelect={handleDoctorSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorSelection;
