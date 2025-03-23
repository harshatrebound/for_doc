import { motion } from 'framer-motion';
import type { BookingStep } from '@/types/booking';

interface ProgressBarProps {
  steps: BookingStep[];
  currentStep: number;
  isMobile?: boolean;
}

export default function ProgressBar({ steps, currentStep, isMobile }: ProgressBarProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden pr-6">
        <motion.div 
          className="h-full bg-[#8B5C9E] origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>
      
      {/* Step indicators - Compact for mobile */}
      {isMobile ? (
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1 text-sm font-medium text-[#8B5C9E]">
            {currentStep < steps.length - 1 ? steps[currentStep].title : 'Complete'}
          </div>
          <div className="text-sm font-medium text-gray-500">
            {currentStep + 1}/{steps.length}
          </div>
        </div>
      ) : (
        /* Desktop step indicators */
        <div className="flex justify-between mt-2 pr-8">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-[#8B5C9E]' : 'text-gray-400'
              }`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1
                transition-colors duration-300
                ${index <= currentStep 
                  ? 'bg-[#8B5C9E] text-white' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}>
                {index + 1}
              </div>
              <span className="text-xs font-medium whitespace-nowrap">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 