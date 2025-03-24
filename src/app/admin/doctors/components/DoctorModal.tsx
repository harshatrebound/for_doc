'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      // Validate fee before submitting
      const fee = parseFloat(formData.fee);
      if (isNaN(fee)) {
        toast.error("Please enter a valid fee amount");
        setIsSubmitting(false);
        return;
      }

      const endpoint = doctor ? `/api/admin/doctors` : '/api/admin/doctors';
      const method = doctor ? 'PUT' : 'POST';

      // Create request payload
      const payload = {
        ...formData,
        fee: fee,  // Use the validated fee
        ...(doctor && { id: doctor.id }),
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || 'Failed to save doctor');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
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
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {doctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {doctor ? 'Update the doctor\'s information' : 'Add a new doctor to your clinic'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </Button>
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
                    placeholder="Enter doctor's name"
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
                    placeholder="e.g., Cardiologist, Pediatrician"
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
                    placeholder="Enter consultation fee"
                  />
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <div className="mt-1 flex rounded-lg border border-gray-300 overflow-hidden">
                    <input
                      type="url"
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B5C9E] focus:outline-none focus:ring-[#8B5C9E] sm:text-sm"
                      placeholder="https://example.com/doctor-image.jpg"
                    />
                    {formData.image && (
                      <div className="relative w-10 h-10 bg-gray-50 border-l border-gray-300">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/40';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Optional. Provide a URL for the doctor's profile image.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {doctor ? 'Update' : 'Add'} Doctor
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 