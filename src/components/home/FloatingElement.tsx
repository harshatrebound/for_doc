'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingElementProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  speed?: 'slow' | 'medium' | 'fast';
  blur?: boolean;
}

export function FloatingElement({
  className,
  size = 'md',
  color = '#8B5C9E',
  speed = 'medium',
  blur = true,
}: FloatingElementProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
  };

  const speedClasses = {
    slow: 'animate-float-slow',
    medium: 'animate-float-medium',
    fast: 'animate-float-fast',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 1 }}
      className={cn(
        'rounded-full',
        sizeClasses[size],
        speedClasses[speed],
        blur ? 'blur-xl' : '',
        className
      )}
      style={{
        backgroundColor: color,
        opacity: 0.2,
      }}
    />
  );
} 