'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  badge: string;
  title: string;
  description?: string;
}

export function SectionHeader({ badge, title, description }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center mb-20 relative"
    >
      {/* Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="inline-block mb-4 relative"
      >
        <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-xl animate-pulse-soft" />
        <span className="relative bg-[#8B5C9E]/10 text-[#8B5C9E] px-6 py-3 rounded-full text-sm font-medium border border-[#8B5C9E]/20 backdrop-blur-sm">
          {badge}
        </span>
      </motion.div>

      {/* Title */}
      <h2 className="text-4xl md:text-6xl font-bold mb-6 relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#8B5C9E] to-gray-900 animate-gradient">
          {title}
        </span>
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#8B5C9E]/10 rounded-full blur-2xl animate-pulse-soft" />
      </h2>

      {/* Description */}
      {description && (
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#8B5C9E]/30 to-transparent" />
    </motion.div>
  );
} 