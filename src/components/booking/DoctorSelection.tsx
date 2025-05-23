'use client';

import { useEffect, useState } from 'react';
import { Star, Clock, Calendar, MapPin, Search, Filter, X, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Doctor } from '@/types/booking';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBookingForm } from '@/contexts/BookingFormContext';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doctor: Doctor) => void;
}

const DoctorCard = ({ doctor, isSelected, onSelect }: DoctorCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onSelect(doctor)}
    className={`
      relative w-full rounded-2xl overflow-hidden cursor-pointer
      transition-all duration-200 touch-manipulation
      ${isSelected
        ? 'bg-gradient-to-br from-[#8B5C9E] to-[#6B4A7E] text-white shadow-xl'
        : 'bg-white border border-gray-200 hover:border-[#8B5C9E] hover:shadow-md'
      }
    `}
  >
    <div className="p-4 sm:p-5">
      <div className="flex gap-4">
        {/* Doctor Image with Status */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-white">
            <Image
              src={doctor.image || '/default-doctor.png'}
              alt={doctor.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          {doctor.availability && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white" />
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-lg font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {doctor.name}
              </h3>
              <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                {doctor.speciality}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-[#8B5C9E]'}`}>₹{doctor.fee}</div>
              <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>Per Visit</div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className={`
                p-2 rounded-lg
                ${isSelected ? 'bg-white/20' : 'bg-[#8B5C9E]/10'}
              `}>
                <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#8B5C9E]'}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  Available
                </p>
                <p className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-gray-700'}`}>
                  Today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`
                p-2 rounded-lg
                ${isSelected ? 'bg-white/20' : 'bg-[#8B5C9E]/10'}
              `}>
                <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#8B5C9E]'}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  HSR Layout
                </p>
                <p className={`text-xs font-medium ${isSelected ? 'text-white/90' : 'text-gray-700'}`}>
                  Location
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const DoctorSelection = () => {
  const { state, dispatch } = useBookingForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/doctors');
        if (!response.ok) throw new Error('Failed to fetch doctors');
        const data = await response.json();
        setDoctors(data);
        setError(null);
      } catch (err) {
        setError('Failed to load doctors. Please try again.');
        console.error('Error fetching doctors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specialties = Array.from(new Set(doctors.map(doctor => doctor.speciality)));

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.speciality === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-[#8B5C9E] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#8B5C9E] text-white rounded-lg hover:bg-[#7A4B8D] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Select a Doctor
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Choose from our experienced medical professionals
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name or specialty"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B5C9E] focus:ring-2 focus:ring-[#8B5C9E]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`
            p-2.5 rounded-xl border transition-all
            ${selectedSpecialty
              ? 'border-[#8B5C9E] bg-[#8B5C9E] text-white'
              : 'border-gray-200 text-gray-700 hover:border-[#8B5C9E] hover:text-[#8B5C9E]'
            }
          `}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Doctor List */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-24rem)] overscroll-contain pb-6 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                isSelected={state.doctor?.id === doctor.id}
                onSelect={(doctor) => dispatch({ type: 'SET_DOCTOR', payload: doctor })}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-8 px-4"
            >
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No doctors found</h3>
              <p className="text-gray-600 text-center">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Doctors</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Specialty</h3>
            <div className="space-y-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => {
                    setSelectedSpecialty(specialty === selectedSpecialty ? null : specialty);
                    setShowFilters(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 rounded-lg text-left
                    ${specialty === selectedSpecialty
                      ? 'bg-[#8B5C9E] text-white'
                      : 'hover:bg-[#F9F5FF] text-gray-700'
                    }
                  `}
                >
                  <span>{specialty}</span>
                  {specialty === selectedSpecialty && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DoctorSelection;
