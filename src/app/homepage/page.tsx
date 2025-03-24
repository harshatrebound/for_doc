'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Activity, Heart, Users, Phone, Mail, MapPin, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

const specialties = [
  {
    title: 'Knee',
    description: 'Knee joint, Ligaments, Cartilage, Muscles & Bones around.',
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200',
  },
  {
    title: 'Shoulder',
    description: 'Shoulder joint, Ligaments, Cartilage, Muscles & Bones around.',
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200',
  },
  {
    title: 'Ankle',
    description: 'Ankle Joint, Ligaments, Cartilage, Muscles & Bones around.',
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1200',
  },
  {
    title: 'Hip',
    description: 'Hip Joint, Ligaments, Cartilage, Muscles and Bones around.',
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?q=80&w=1200',
  },
  {
    title: 'Elbow',
    description: 'Elbow Joint, Ligaments, Cartilage, Muscles and Bones around.',
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1612776572997-76cc42e058c3?q=80&w=1200',
  },
  {
    title: 'Wrist',
    description: 'Wrist Joint, Ligaments, Cartilage, Muscles & Bones around.',
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200',
  },
];

const features = [
  {
    title: 'Putting you first',
    description: 'We treat all our patients equally and humanely.',
    icon: Heart,
  },
  {
    title: 'Vast Pool of Experience',
    description: 'We have extensive experience treating patients across multiple regions.',
    icon: Users,
  },
  {
    title: 'Accurate Diagnosis',
    description: 'We strive to achieve the correct diagnosis with minimal investigations.',
    icon: Activity,
  },
  {
    title: 'Interactive Session',
    description: 'We believe in empowering our patients with clear information about their condition.',
    icon: Calendar,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    comment: "Exceptional care and attention to detail. The team made my recovery journey smooth.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400"
  },
  {
    name: "Michael Chen",
    role: "Athlete",
    comment: "Professional sports medicine care that got me back on track faster than expected.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"
  }
];

export default function HomePage() {
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
      <section className="relative min-h-[100vh] flex flex-col justify-between overflow-hidden">
        {/* Enhanced Background with Parallax and Overlay Effects */}
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000"
            alt="Modern medical facility"
            fill
            className="object-cover scale-110"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          {/* Added Dynamic Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-soft-light" />
          {/* Added Animated Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5C9E]/20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#B491C8]/20 rounded-full blur-3xl animate-float-medium" />
        </motion.div>

        {/* Top Navigation Space */}
        <div className="h-24" />

        {/* Enhanced Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-32">
          <div className="w-full max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              {/* Enhanced Logo with Glow */}
              <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-16 relative"
              >
                <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-3xl animate-pulse" />
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={140}
                  height={140}
                  className="mx-auto relative z-10 drop-shadow-2xl"
                />
              </motion.div>

              {/* Enhanced Heading Group */}
              <div className="space-y-8 mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] relative"
                >
                  <span className="relative inline-block">
                    Your Wellness,
                    <div className="absolute -inset-1 bg-[#8B5C9E]/20 blur-xl animate-pulse" />
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5C9E] via-[#B491C8] to-[#8B5C9E] animate-gradient">
                    Our Priority
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto"
                >
                  Excellence in orthopedic care, sports medicine, and rehabilitation
                </motion.p>
              </div>

              {/* Enhanced Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              >
                <Button
                  size="lg"
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
                  className="group border-2 border-white text-white bg-[#8B5C9E]/40 hover:bg-white/10 rounded-full px-8 sm:px-10 py-6 sm:py-7 text-lg font-medium transition-all duration-300 w-full sm:w-auto relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative">Learn More</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="relative z-10 w-full">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 mix-blend-soft-light" />
          </div>
          <div className="container mx-auto px-6 pb-24">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                {[
                  { label: "Happy Patients", value: "2000+" },
                  { label: "Expert Doctors", value: "15+" },
                  { label: "Years Experience", value: "25+" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/20 via-[#B491C8]/20 to-[#8B5C9E]/20 rounded-2xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500">
                      <div className="text-center">
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#8B5C9E] via-[#B491C8] to-[#8B5C9E] opacity-20 blur group-hover:opacity-30 transition-opacity duration-500" />
                          <p className="relative text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-white/90 to-white bg-clip-text text-transparent">
                            {stat.value}
                          </p>
                        </div>
                        <p className="text-base md:text-lg text-white/80 font-medium tracking-wide">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[#8B5C9E]/10 to-transparent blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-[#8B5C9E]/5 to-transparent blur-3xl" />
          {/* Added Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-[#8B5C9E]/20 animate-float-slow" />
          <div className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-[#8B5C9E]/10 animate-float-medium" />
          <div className="absolute bottom-1/4 right-1/4 w-8 h-8 rounded-full bg-[#8B5C9E]/15 animate-float-fast" />
        </div>

        <div className="container mx-auto px-4">
          {/* Enhanced Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20 relative"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4 relative"
            >
              <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-xl animate-pulse" />
              <span className="relative bg-[#8B5C9E]/10 text-[#8B5C9E] px-6 py-3 rounded-full text-sm font-medium border border-[#8B5C9E]/20 backdrop-blur-sm">
                Our Expertise
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#8B5C9E] to-gray-600">
                Specialized Care Areas
              </span>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#8B5C9E]/10 rounded-full blur-2xl animate-pulse" />
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive care for every stage of recovery in orthopedic treatments and rehabilitation
            </p>
            {/* Added Decorative Line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#8B5C9E]/30 to-transparent" />
          </motion.div>

          {/* Enhanced Specialties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/0 via-[#8B5C9E]/5 to-[#8B5C9E]/0 blur-3xl -z-10" />
            
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Enhanced Card Container */}
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Image Container with Enhanced Effects */}
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={specialty.image}
                      alt={specialty.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500" />
                    
                    {/* Enhanced Floating Icon */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      className="absolute top-4 right-4 w-12 h-12"
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-xl blur-md transform group-hover:scale-110 transition-transform duration-500" />
                      <div className="relative w-full h-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                        <specialty.icon className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </motion.div>

                    {/* Added Corner Accent */}
                    <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-white/0 via-white/50 to-white/0 transform -rotate-45 translate-x-[-2rem] group-hover:translate-x-[5rem] transition-transform duration-1000" />
                    </div>
                  </div>

                  {/* Enhanced Content Container */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-white flex items-center">
                        <span className="relative">
                          {specialty.title}
                          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-500" />
                        </span>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.3, duration: 0.5 }}
                          className="ml-3 w-2 h-2 rounded-full bg-[#8B5C9E] group-hover:animate-pulse"
                        />
                      </h3>
                      <p className="text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-500 leading-relaxed transform translate-y-2 group-hover:translate-y-0">
                        {specialty.description}
                      </p>
                      <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <Button
                          variant="outline"
                          className="bg-[#8B5C9E]/40 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-full transition-all duration-300 group-hover:scale-105"
                        >
                          Learn More
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Hover Gradient */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#8B5C9E]/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/10 via-transparent to-[#8B5C9E]/10" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-32 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#8B5C9E]/5 to-transparent" />
          {/* Added Animated Shapes */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#8B5C9E]/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#B491C8]/10 rounded-full blur-3xl animate-float-medium" />
        </div>
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20 relative"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 relative"
            >
              <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-xl animate-pulse" />
              <span className="relative bg-[#8B5C9E]/10 text-[#8B5C9E] px-6 py-3 rounded-full text-sm font-medium border border-[#8B5C9E]/20 backdrop-blur-sm">
                Why Choose Us
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#8B5C9E] to-gray-900">
                Our Commitment to Excellence
              </span>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#8B5C9E]/10 rounded-full blur-2xl animate-pulse" />
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide tailored care to help patients regain mobility and confidence
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group hover:translate-y-[-10px] transition-all duration-300"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E] to-[#B491C8] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                  <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100/20 backdrop-blur-sm">
                    <div className="relative mb-6 group-hover:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 bg-[#8B5C9E]/20 rounded-full blur-xl animate-pulse" />
                      <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#8B5C9E]/10 text-[#8B5C9E]">
                        <feature.icon className="w-10 h-10" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#8B5C9E] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    {/* Added Corner Accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-r from-[#8B5C9E]/0 via-[#8B5C9E]/30 to-[#8B5C9E]/0 transform rotate-45 translate-x-[2rem] group-hover:translate-x-[-5rem] transition-transform duration-1000" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/dots.svg')] opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8B5C9E]/5 to-transparent" />
          {/* Added Animated Shapes */}
          <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-[#8B5C9E]/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-[#B491C8]/10 rounded-full blur-3xl animate-float-medium" />
        </div>
        
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20 relative"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 relative"
            >
              <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-xl animate-pulse" />
              <span className="relative bg-[#8B5C9E]/10 text-[#8B5C9E] px-6 py-3 rounded-full text-sm font-medium border border-[#8B5C9E]/20 backdrop-blur-sm">
                Testimonials
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#8B5C9E] to-gray-900">
                What Our Patients Say
              </span>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#8B5C9E]/10 rounded-full blur-2xl animate-pulse" />
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/20 to-[#B491C8]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#8B5C9E]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={60}
                        height={60}
                        className="rounded-full relative z-10"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array(testimonial.rating).fill(0).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed italic relative">
                    <span className="absolute -top-2 -left-2 text-4xl text-[#8B5C9E]/20">"</span>
                    {testimonial.comment}
                    <span className="absolute -bottom-2 -right-2 text-4xl text-[#8B5C9E]/20">"</span>
                  </p>
                  {/* Added Corner Accent */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 right-0 w-24 h-1 bg-gradient-to-r from-[#8B5C9E]/0 via-[#8B5C9E]/30 to-[#8B5C9E]/0 transform -rotate-45 translate-x-[2rem] group-hover:translate-x-[-5rem] transition-transform duration-1000" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gray-50">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=2000"
            alt="Medical facility interior"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#8B5C9E]/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-[#B491C8]/10 rounded-full blur-3xl animate-float-medium" />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/20 to-[#B491C8]/20 rounded-2xl blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 border border-white/20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mb-8 md:mb-12"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block mb-4 relative"
                  >
                    <div className="absolute inset-0 bg-[#8B5C9E]/20 blur-xl animate-pulse" />
                    <span className="relative bg-[#8B5C9E]/10 text-[#8B5C9E] px-6 py-3 rounded-full text-sm font-medium border border-[#8B5C9E]/20 backdrop-blur-sm">
                      Contact Us
                    </span>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#8B5C9E] to-gray-900">
                      Get in Touch
                    </span>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#8B5C9E]/10 rounded-full blur-2xl animate-pulse" />
                  </h2>
                  <p className="text-lg md:text-xl text-gray-600">Connect with our expert team</p>
                </motion.div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { icon: Phone, label: "Call Us", value: "+91 6364538660" },
                    { icon: Mail, label: "Email Us", value: "contact@example.com" },
                    { icon: MapPin, label: "Visit Us", value: "HSR Layout, Bengaluru" }
                  ].map((contact, index) => (
                    <motion.div
                      key={contact.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="group hover:translate-y-[-5px] transition-all duration-300"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8B5C9E]/20 to-[#B491C8]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                          <div className="flex items-center space-x-3">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-[#8B5C9E]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="relative p-3 rounded-full bg-[#8B5C9E]/10 text-[#8B5C9E] group-hover:scale-110 transition-transform duration-300">
                                <contact.icon className="w-6 h-6" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-600 mb-1">{contact.label}</p>
                              <p className="text-base font-semibold text-gray-900 group-hover:text-[#8B5C9E] transition-colors duration-300 truncate">
                                {contact.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 