'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type HeroVariant = 'image' | 'gradient' | 'light' | 'color';

interface HeroSectionProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  bgImage?: string;
  bgColor?: string;
  variant?: HeroVariant;
  height?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
  actions?: ReactNode;
  overlayOpacity?: number;
  className?: string;
  children?: ReactNode;
}

export default function HeroSection({
  title,
  subtitle,
  bgImage,
  bgColor = '#8B5C9E',
  variant = 'gradient',
  height = 'medium',
  align = 'center',
  actions,
  overlayOpacity = 0.6,
  className,
  children,
}: HeroSectionProps) {
  // Determine height class based on prop
  const heightClass = {
    small: 'h-[30vh] md:h-[40vh]',
    medium: 'h-[40vh] md:h-[50vh]',
    large: 'h-[50vh] md:h-[70vh]',
  }[height];

  // Determine text alignment
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  // Background gradient - convert hex to rgba for transparency
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Render the appropriate background based on variant
  const renderBackground = () => {
    switch (variant) {
      case 'image':
        return (
          <div className="absolute inset-0 z-0 bg-gray-800">
            <Image
              src={bgImage || '/images/default-hero.jpg'}
              alt="Background"
              fill
              priority
              className="object-cover"
            />
            <div 
              className="absolute inset-0" 
              style={{ 
                background: `linear-gradient(to bottom, ${hexToRgba(bgColor, 0.7)} 0%, ${hexToRgba(bgColor, overlayOpacity)} 60%, ${hexToRgba(bgColor, 0.8)} 100%)`
              }}
            />
          </div>
        );
      
      case 'gradient':
        return (
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              background: `linear-gradient(135deg, ${bgColor} 0%, ${hexToRgba(bgColor, 0.7)} 100%)`
            }}
          >
            <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-5"></div>
          </div>
        );
      
      case 'light':
        return (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-50 to-white">
            <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-5"></div>
            <div 
              className="absolute top-0 left-0 right-0 h-1/3 opacity-10"
              style={{ 
                background: `linear-gradient(to bottom, ${bgColor} 0%, transparent 100%)`
              }}
            />
          </div>
        );
      
      case 'color':
        return (
          <div 
            className="absolute inset-0 z-0" 
            style={{ backgroundColor: bgColor }}
          >
            <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-5"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        heightClass,
        variant === 'light' ? 'text-gray-900' : 'text-white',
        className
      )}
      style={{ textShadow: variant !== 'light' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' }}
    >
      {renderBackground()}
      
      <motion.div 
        className={cn(
          "relative z-10 container mx-auto px-4 pt-12 flex flex-col justify-center", 
          alignClass
        )}
        initial="hidden"
        animate="visible"
        variants={containerAnimation}
      >
        {typeof title === 'string' ? (
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            variants={itemAnimation}
          >
            <span className="relative inline-block">
              {title}
              <div className="absolute -inset-1 bg-[#8B5C9E]/20 blur-xl animate-pulse opacity-70"></div>
            </span>
          </motion.h1>
        ) : (
          <motion.div variants={itemAnimation}>
            {title}
          </motion.div>
        )}
        
        {subtitle && (
          typeof subtitle === 'string' ? (
            <motion.p 
              className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8"
              variants={itemAnimation}
            >
              {subtitle}
            </motion.p>
          ) : (
            <motion.div variants={itemAnimation}>
              {subtitle}
            </motion.div>
          )
        )}
        
        {actions && (
          <motion.div 
            className="flex flex-wrap gap-4 justify-center mt-4"
            variants={itemAnimation}
          >
            {actions}
          </motion.div>
        )}
        
        {children && (
          <motion.div 
            className="w-full mt-8"
            variants={itemAnimation}
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
} 