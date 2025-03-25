'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
  glowOnHover?: boolean;
}

export function GradientCard({
  children,
  className,
  hoverScale = true,
  glowOnHover = true,
}: GradientCardProps) {
  return (
    <motion.div
      whileHover={hoverScale ? { scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        'group relative rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/20 to-[#B491C8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow Effect */}
      {glowOnHover && (
        <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      {/* Content */}
      <div className="relative bg-white/80 backdrop-blur-sm p-6 border border-white/20 rounded-2xl">
        {children}
      </div>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-r from-[#8B5C9E]/0 via-[#8B5C9E]/30 to-[#8B5C9E]/0 transform rotate-45 translate-x-[2rem] group-hover:translate-x-[-5rem] transition-transform duration-1000" />
      </div>
    </motion.div>
  );
} 