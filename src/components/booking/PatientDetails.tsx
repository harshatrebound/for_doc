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
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientDetailsProps {
  data: {
    name: string;
    phone: string;
    email: string;
    notes?: string;
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
        <h2 className="text-xl font-semibold text-gray-900">Patient Details</h2>
        <p className="text-base text-gray-600">Please provide your contact information</p>
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

          {/* Notes Field */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-900">
              Additional Notes <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              className={`
                w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-[#8B5C9E] focus:border-transparent
                border-gray-200 hover:border-gray-300
              `}
              placeholder="Any additional information you'd like to share"
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button - We'll hide this and just use the parent's navigation */}
        <input type="submit" className="hidden" />
      </form>
    </div>
  );
};

export default PatientDetails;
