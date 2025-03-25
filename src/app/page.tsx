'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Calendar, Activity, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientCard } from '@/components/home/GradientCard';
import { FloatingElement } from '@/components/home/FloatingElement';
import { SectionHeader } from '@/components/home/SectionHeader';
import BookingModal from '@/components/booking/BookingModal';

export default function HomePage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);

  return (
    <div className="min-h-screen bg-white" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden">
        {/* Enhanced Background with Parallax */}
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop"
            alt="Modern medical facility"
            fill
            className="object-cover scale-110"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-soft-light" />
        </motion.div>

        {/* Floating Elements */}
        <FloatingElement
          className="absolute top-1/4 left-1/4"
          size="lg"
          speed="slow"
        />
        <FloatingElement
          className="absolute bottom-1/4 right-1/4"
          size="lg"
          speed="medium"
          color="#B491C8"
        />
        <FloatingElement
          className="absolute top-1/3 right-1/3"
          size="sm"
          speed="fast"
        />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              {/* Logo with Glow */}
              <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-16 relative"
              >
                <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-3xl animate-pulse-soft" />
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={140}
                  height={140}
                  className="mx-auto relative z-10 drop-shadow-2xl"
                />
              </motion.div>

              {/* Heading Group */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] relative mb-6">
                  <span className="relative inline-block">
                    Your Wellness,
                    <div className="absolute -inset-1 bg-[#8B5C9E]/20 blur-xl animate-pulse-soft" />
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5C9E] via-[#B491C8] to-[#8B5C9E] animate-gradient">
                    Our Priority
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto mb-12">
                  Excellence in orthopedic care, sports medicine, and rehabilitation
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              >
                <Button
                  size="lg"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="group bg-white text-[#8B5C9E] hover:bg-gray-100 rounded-full px-8 sm:px-10 py-6 sm:py-7 text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/0 via-[#8B5C9E]/10 to-[#8B5C9E]/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center">
                    Book an Appointment
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 border-white text-white hover:bg-white/10 rounded-full px-8 sm:px-10 py-6 sm:py-7 text-lg font-medium transition-all duration-300 w-full sm:w-auto relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative">Learn More</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1.5 h-3 bg-white rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
