'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientDetailsProps {
  data: {
    name: string;
    phone: string;
    email: string;
  };
  onSubmit: (data: PatientFormData) => void;
  onBack: () => void;
}

const PatientDetails = ({ data, onSubmit, onBack }: PatientDetailsProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: data,
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Patient Details</h2>
        <p className="text-base font-medium text-gray-600">Please provide your contact information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`
                w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent
                ${errors.name ? 'border-red-300 ring-red-50' : 'border-gray-200 hover:border-gray-300'}
              `}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-sm font-medium text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className={`
                w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent
                ${errors.phone ? 'border-red-300 ring-red-50' : 'border-gray-200 hover:border-gray-300'}
              `}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-sm font-medium text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`
                w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent
                ${errors.email ? 'border-red-300 ring-red-50' : 'border-gray-200 hover:border-gray-300'}
              `}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-sm font-medium text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 text-gray-700 font-medium hover:text-gray-900 transition-colors"
          >
            Back
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              px-6 py-2.5 rounded-lg bg-[#8B5C9E] text-white font-medium
              hover:bg-[#7B4C8E] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default PatientDetails;
