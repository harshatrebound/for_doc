'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Clock, BarChart2 } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    name: 'Schedule Management',
    description: 'Configure doctor schedules, time slots, and availability',
    href: '/admin/schedules',
    icon: Calendar,
    color: 'bg-blue-500'
  },
  {
    name: 'Doctor Management',
    description: 'Add and manage doctors, their profiles, and specialties',
    href: '/admin/doctors',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    name: 'Appointment Overview',
    description: 'View and manage all appointments and bookings',
    href: '/admin/appointments',
    icon: Clock,
    color: 'bg-purple-500'
  },
  {
    name: 'Analytics & Reports',
    description: 'Track performance metrics and generate reports',
    href: '/admin/analytics',
    icon: BarChart2,
    color: 'bg-orange-500'
  }
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to BookingPress Admin</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your clinic operations efficiently</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={feature.href}
                className="block h-full p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#8B5C9E]/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Today's Appointments", value: '12' },
            { label: 'Active Doctors', value: '8' },
            { label: 'Total Patients', value: '1,234' },
            { label: 'This Month Revenue', value: '₹45,670' }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#8B5C9E]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 