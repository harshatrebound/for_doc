import { useFormContext } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PatientFormData } from './types';

interface FormFieldProps {
  name: keyof PatientFormData;
  label: string;
  type: 'text' | 'tel' | 'email' | 'textarea';
  placeholder: string;
  autoComplete?: string;
  optional?: boolean;
}

export function FormField({
  name,
  label,
  type,
  placeholder,
  autoComplete,
  optional,
}: FormFieldProps) {
  const {
    register,
    formState: { errors, touchedFields },
    watch,
  } = useFormContext<PatientFormData>();

  const value = watch(name);
  const error = errors[name];
  const isTouched = touchedFields[name];
  const isValid = isTouched && value && !error;

  const inputClassName = cn(
    'w-full px-4 py-3 rounded-2xl border bg-white/50',
    'text-[17px] text-gray-900 placeholder:text-gray-400/80',
    'backdrop-blur-sm transition-all duration-200',
    'focus:outline-none focus:ring-4',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-200/50': error,
      'border-green-300 focus:border-green-500 focus:ring-green-200/50': isValid,
      'border-gray-200/80 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-200/50':
        !error && !isValid,
    }
  );

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="block text-[15px] font-medium text-gray-700">
          {label}
        </label>
        {optional && (
          <span className="text-[13px] text-gray-500">Optional</span>
        )}
      </div>

      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            {...register(name)}
            className={cn(inputClassName, 'resize-none min-h-[100px]')}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
        ) : (
          <input
            type={type}
            {...register(name)}
            className={inputClassName}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-6 left-0 text-[13px] font-medium text-red-600"
            >
              {error.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 