'use client';

import { useState, useEffect } from 'react';
import { Doctor } from '@/types/doctor';
import { ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DoctorSelectProps {
  value: Doctor | null;
  onChange: (doctor: Doctor | null) => void;
}

export function DoctorSelect({ value, onChange }: DoctorSelectProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-64 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E]"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : value ? (
          <span>{value.name}</span>
        ) : (
          <span>Select a doctor</span>
        )}
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                <button
                  onClick={() => {
                    onChange(doctor);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    value?.id === doctor.id ? 'bg-[#8B5C9E]/10 text-[#8B5C9E]' : 'text-gray-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-xs text-gray-500">{doctor.speciality}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 