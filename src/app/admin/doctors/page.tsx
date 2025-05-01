'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Edit3, 
  ChevronRight,
  Users,
  Loader2
} from 'lucide-react';
import DoctorModal from './components/DoctorModal';
import { toast } from 'react-hot-toast';
import { fetchDoctors } from '@/app/actions/admin';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  image?: string;
}

const specialtyColors: { [key: string]: { bg: string; text: string } } = {
  'Cardiologist': { bg: 'bg-red-100', text: 'text-red-800' },
  'Pediatrician': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Orthopedic': { bg: 'bg-green-100', text: 'text-green-800' },
  'Neurologist': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Dermatologist': { bg: 'bg-pink-100', text: 'text-pink-800' },
  'default': { bg: 'bg-[#8B5C9E]/10', text: 'text-[#8B5C9E]' }
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadDoctors = async () => {
    try {
      const result = await fetchDoctors();
      if (result.success && result.data) {
        setDoctors(result.data as Doctor[]);
      } else {
        toast.error(result.error || 'Failed to load doctors');
      }
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const getSpecialtyStyle = (specialty: string) => {
    const normalizedSpecialty = Object.keys(specialtyColors).find(
      key => specialty.toLowerCase().includes(key.toLowerCase())
    );
    return specialtyColors[normalizedSpecialty || 'default'];
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.speciality === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = Array.from(new Set(doctors.map(d => d.speciality)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
        <div>
              <h1 className="text-xl font-bold text-gray-900">Doctors</h1>
          <p className="mt-1 text-sm text-gray-500">
                Manage your clinic's doctors
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDoctor(null);
            setIsModalOpen(true);
          }}
              size="sm"
              className="bg-[#8B5C9E] hover:bg-[#8B5C9E]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-base bg-white border-gray-200 focus:border-[#8B5C9E] focus:ring-1 focus:ring-[#8B5C9E] placeholder:text-gray-400 rounded-lg"
              />
            </div>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={selectedSpecialty ? 'border-[#8B5C9E] text-[#8B5C9E]' : ''}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white p-6">
                <SheetHeader>
                  <SheetTitle>Filter Doctors</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 pb-3 border-b">
                    Specialty
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedSpecialty(null);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left rounded-lg text-sm transition-colors duration-150 ${
                        !selectedSpecialty
                          ? 'bg-[#8B5C9E] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Specialties
                    </button>
                    {specialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => {
                          setSelectedSpecialty(specialty);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left rounded-lg text-sm transition-colors duration-150 ${
                          selectedSpecialty === specialty
                            ? 'bg-[#8B5C9E] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#8B5C9E]/10 flex items-center justify-center flex-shrink-0">
                      {doctor.image ? (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-[#8B5C9E]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {doctor.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getSpecialtyStyle(doctor.speciality).bg
                            } ${getSpecialtyStyle(doctor.speciality).text}`}>
                              {doctor.speciality}
                            </span>
                            <span className="text-sm text-gray-500">
                              ₹{doctor.fee} / visit
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setIsModalOpen(true);
                              }}
                              className="text-gray-700"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                window.location.href = `/admin/doctors/${doctor.id}/schedule`;
                              }}
                              className="text-gray-700"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Manage Schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#8B5C9E] hover:text-[#8B5C9E] hover:bg-[#8B5C9E]/5"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#8B5C9E] hover:text-[#8B5C9E] hover:bg-[#8B5C9E]/5"
                    onClick={() => {
                      window.location.href = `/admin/doctors/${doctor.id}/schedule`;
                    }}
                  >
                    Manage Schedule
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
      </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#8B5C9E]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No doctors found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || selectedSpecialty
                ? 'Try adjusting your search or filters'
                : 'Add your first doctor to get started'}
            </p>
            {!searchQuery && !selectedSpecialty && (
              <Button
                onClick={() => {
                  setSelectedDoctor(null);
                  setIsModalOpen(true);
                }}
                className="mt-4 bg-[#8B5C9E] hover:bg-[#8B5C9E]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            )}
          </div>
        )}
      </div>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={selectedDoctor}
        onSuccess={() => {
          setIsModalOpen(false);
          loadDoctors();
          toast.success(
            `Doctor ${selectedDoctor ? 'updated' : 'added'} successfully`
          );
        }}
      />
    </div>
  );
} 