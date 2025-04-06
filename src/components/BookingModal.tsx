import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, MapPin, ChevronRight, Search } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Doctor {
  id: string;
  name: string;
  image: string;
  speciality: string;
  qualifications: string[];
  fee: number;
  rating: number;
  reviewCount: number;
  location: string;
  experience: string;
  available: boolean;
}

interface BookingModalProps {
  onClose?: () => void;
  procedureTitle?: string;
}

const StepIndicator = ({ onClose, title }: { onClose?: () => void, title?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="sticky top-0 z-10"
  >
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        <motion.div 
          className="h-10 w-10 rounded-full bg-[#8B5C9E] text-white flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg font-medium">1</span>
        </motion.div>
        <div className="flex flex-col">
          <span className="text-sm text-[#8B5C9E] font-medium">Step 1 of 5</span>
          <h2 className="text-xl font-semibold text-gray-900">
            {title ? `Schedule: ${title}` : 'Select Doctor'}
          </h2>
        </div>
      </div>
      <motion.button 
        whileTap={{ scale: 0.95 }}
        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
        onClick={onClose}
      >
        <X className="w-6 h-6 text-gray-600" />
      </motion.button>
    </div>
  </motion.div>
);

const SearchBar = () => (
  <div className="relative">
    <Input
      placeholder="Search doctors by name or specialty"
      className="pl-10 pr-4 h-12 rounded-xl border-gray-200 focus:border-[#8B5C9E] focus:ring-[#8B5C9E]/20"
    />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  </div>
);

const FilterTags = () => {
  const filters = ['Available Today', 'Morning', 'Evening', 'Highest Rated'];
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-full bg-purple-50 text-[#8B5C9E] text-sm font-medium whitespace-nowrap
                     hover:bg-[#8B5C9E] hover:text-white transition-colors"
        >
          {filter}
        </motion.button>
      ))}
    </div>
  );
};

const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="relative p-4 rounded-xl border border-gray-100 hover:border-[#8B5C9E]/20 hover:shadow-lg 
               transition-all duration-300 bg-white group cursor-pointer"
  >
    <div className="flex gap-4">
      <div className="relative">
        <Image
          src={doctor.image}
          alt={doctor.name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
        {doctor.available && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#8B5C9E] transition-colors">
            {doctor.name}
          </h3>
          <span className="text-xl font-bold text-[#8B5C9E]">₹{doctor.fee}</span>
        </div>
        
        <p className="text-gray-600 font-medium">{doctor.speciality}</p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {doctor.qualifications.map(qual => (
            <span key={qual} className="px-2 py-1 bg-purple-50 text-[#8B5C9E] text-sm rounded-full">
              {qual}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(doctor.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {doctor.rating} ({doctor.reviewCount})
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{doctor.location}</span>
          </div>
        </div>
      </div>
    </div>
    
    <motion.div 
      className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5C9E] to-purple-400"
      initial={{ scaleX: 0 }}
      whileHover={{ scaleX: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.div>
);

export const BookingModal = ({ onClose, procedureTitle }: BookingModalProps) => {
  const [selectedDoctor, setSelectedDoctor] = React.useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full sm:w-[480px] max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden"
      >
        <StepIndicator onClose={onClose} title={procedureTitle} />
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          <SearchBar />
          <FilterTags />
          
          <div className="space-y-3">
            {mockDoctors.map(doctor => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor}
              />
            ))}
          </div>
        </div>
        
        <motion.div 
          className="sticky bottom-0 p-4 bg-white border-t border-gray-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            className="w-full bg-[#8B5C9E] hover:bg-[#8B5C9E]/90 text-white font-medium py-6 rounded-xl
                     flex items-center justify-center gap-2"
            disabled={!selectedDoctor}
          >
            Continue to Book Appointment
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Mock data for demonstration
const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sameer Kumar',
    image: '/doctors/sameer.jpg',
    speciality: 'Orthopedic Surgeon',
    qualifications: ['MBBS', 'MS Ortho'],
    fee: 700,
    rating: 4.9,
    reviewCount: 128,
    location: 'HSR Layout, Bangalore',
    experience: '15+ years',
    available: true
  },
  // Add more mock doctors as needed
];

export default BookingModal; 