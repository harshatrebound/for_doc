'use client';

import { useEffect, useState } from 'react';
import { Star, Clock, Award, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Doctor {
  id: string;
  name: string;
  fee: number;
  speciality: string;
  image?: string;
  experience?: string;
  rating?: number;
  location?: string;
  availability?: string;
  qualifications?: string[];
}

interface DoctorSelectionProps {
  selected: string;
  onSelect: (doctorId: string) => void;
}

const DoctorCard = motion.button;

const DoctorSelection = ({ selected, onSelect }: DoctorSelectionProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        const enhancedData = data.map((doctor: Doctor) => ({
          ...doctor,
          experience: doctor.id === 'dr-sameer' ? '15+ years' : '10+ years',
          rating: doctor.id === 'dr-sameer' ? 4.9 : 4.7,
          location: 'HSR Layout, Bangalore',
          availability: 'Available Today',
          qualifications: doctor.id === 'dr-sameer' 
            ? ['MBBS', 'MS Ortho', 'Fellowship in Sports Medicine']
            : ['MBBS', 'MS Ortho'],
          image: doctor.id === 'dr-sameer' 
            ? '/doctors/dr-sameer.jpg' 
            : '/doctors/default-doctor.jpg'
        }));
        setDoctors(enhancedData);
      } catch (err) {
        setError('Failed to load doctors. Please try again later.');
        console.error('Error fetching doctors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#8B5C9E] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 font-medium">Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-[#8B5C9E] hover:text-[#6B4A7E] font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          onClick={() => onSelect(doctor.id)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            w-full text-left transition-all duration-200
            ${selected === doctor.id
              ? 'bg-gradient-to-br from-[#8B5C9E] to-[#6B4A7E] text-white shadow-lg'
              : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#8B5C9E]/30'
            }
            p-6 rounded-2xl
          `}
        >
          <div className="flex gap-6">
            {/* Doctor Image */}
            <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {doctor.image ? (
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 96px) 100vw, 96px"
                  className="object-cover"
                  priority={doctor.id === 'dr-sameer'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#8B5C9E]/5">
                  <User className="w-12 h-12 text-[#8B5C9E]" />
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {doctor.name}
                  </h3>
                  <p className={`
                    text-sm font-medium
                    ${selected === doctor.id ? 'text-white/90' : 'text-[#8B5C9E]'}
                  `}>
                    {doctor.speciality}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`
                    text-2xl font-bold
                    ${selected === doctor.id ? 'text-white' : 'text-[#8B5C9E]'}
                  `}>
                    ₹{doctor.fee}
                  </p>
                  <p className={`
                    text-xs mt-1
                    ${selected === doctor.id ? 'text-white/75' : 'text-gray-500'}
                  `}>
                    Per Consultation
                  </p>
                </div>
              </div>

              {/* Qualifications */}
              <div className="flex flex-wrap gap-2 mb-4">
                {doctor.qualifications?.map((qual, index) => (
                  <span
                    key={index}
                    className={`
                      text-xs font-medium px-2.5 py-1 rounded-full
                      ${selected === doctor.id
                        ? 'bg-white/10 text-white'
                        : 'bg-[#8B5C9E]/5 text-[#8B5C9E]'
                      }
                    `}
                  >
                    {qual}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`
                    p-2 rounded-lg
                    ${selected === doctor.id ? 'bg-white/10' : 'bg-[#8B5C9E]/5'}
                  `}>
                    <Star className={`w-4 h-4 ${selected === doctor.id ? 'text-white' : 'text-[#8B5C9E]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doctor.rating}</p>
                    <p className={`text-xs ${selected === doctor.id ? 'text-white/75' : 'text-gray-500'}`}>
                      Rating
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`
                    p-2 rounded-lg
                    ${selected === doctor.id ? 'bg-white/10' : 'bg-[#8B5C9E]/5'}
                  `}>
                    <Award className={`w-4 h-4 ${selected === doctor.id ? 'text-white' : 'text-[#8B5C9E]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doctor.experience}</p>
                    <p className={`text-xs ${selected === doctor.id ? 'text-white/75' : 'text-gray-500'}`}>
                      Experience
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`
                    p-2 rounded-lg
                    ${selected === doctor.id ? 'bg-white/10' : 'bg-[#8B5C9E]/5'}
                  `}>
                    <Clock className={`w-4 h-4 ${selected === doctor.id ? 'text-white' : 'text-[#8B5C9E]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Available</p>
                    <p className={`text-xs ${selected === doctor.id ? 'text-white/75' : 'text-gray-500'}`}>
                      Today
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`
                    p-2 rounded-lg
                    ${selected === doctor.id ? 'bg-white/10' : 'bg-[#8B5C9E]/5'}
                  `}>
                    <MapPin className={`w-4 h-4 ${selected === doctor.id ? 'text-white' : 'text-[#8B5C9E]'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">HSR Layout</p>
                    <p className={`text-xs ${selected === doctor.id ? 'text-white/75' : 'text-gray-500'}`}>
                      Location
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DoctorCard>
      ))}
    </div>
  );
};

export default DoctorSelection;
