'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  User,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import DoctorModal from './components/DoctorModal';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  image?: string;
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete doctor');

      setDoctors(doctors.filter(doctor => doctor.id !== id));
      toast.success('Doctor deleted successfully');
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Doctors</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your clinic's doctors</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedDoctor(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#8B5C9E] text-white hover:bg-[#7B4C8E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Doctor
          </motion.button>
        </div>

        {/* Doctor List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B5C9E]" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <User className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new doctor.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-[#8B5C9E] bg-[#8B5C9E]/10 hover:bg-[#8B5C9E]/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Doctor
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                layoutId={doctor.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-[#8B5C9E]/30 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {doctor.image ? (
                          <Image
                            src={doctor.image}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#8B5C9E]/5">
                            <User className="w-8 h-8 text-[#8B5C9E]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-[#8B5C9E] font-medium">
                          {doctor.speciality}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ₹{doctor.fee} per consultation
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-[#8B5C9E] hover:bg-[#8B5C9E]/5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        onSuccess={fetchDoctors}
      />
    </div>
  );
} 