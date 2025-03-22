'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  fee: number;
  image?: string;
}

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  onSuccess: () => void;
}

export default function DoctorModal({ isOpen, onClose, doctor, onSuccess }: DoctorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    speciality: '',
    fee: '',
    image: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name,
        speciality: doctor.speciality,
        fee: doctor.fee.toString(),
        image: doctor.image || '',
      });
    } else {
      setFormData({
        name: '',
        speciality: '',
        fee: '',
        image: '',
      });
    }
  }, [doctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = doctor ? `/api/doctors/${doctor.id}` : '/api/doctors';
      const method = doctor ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fee: parseFloat(formData.fee),
        }),
      });

      if (!response.ok) throw new Error('Failed to save doctor');

      toast.success(`Doctor ${doctor ? 'updated' : 'added'} successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(`Failed to ${doctor ? 'update' : 'add'} doctor`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {doctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B5C9E] focus:outline-none focus:ring-[#8B5C9E] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700">
                  Speciality
                </label>
                <input
                  type="text"
                  id="speciality"
                  value={formData.speciality}
                  onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B5C9E] focus:outline-none focus:ring-[#8B5C9E] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="fee" className="block text-sm font-medium text-gray-700">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  id="fee"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B5C9E] focus:outline-none focus:ring-[#8B5C9E] sm:text-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B5C9E] focus:outline-none focus:ring-[#8B5C9E] sm:text-sm"
                  placeholder="https://example.com/doctor-image.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#8B5C9E] border border-transparent rounded-lg hover:bg-[#7B4C8E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {doctor ? 'Update' : 'Add'} Doctor
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 