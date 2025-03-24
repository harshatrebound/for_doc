'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { fetchAnalytics } from '@/app/actions/admin';
import { format, subDays } from 'date-fns';

const features = [
  {
    name: 'Schedule Management',
    description: 'Configure doctor schedules, time slots, and availability',
    href: '/admin/schedules',
    icon: Calendar,
    color: 'bg-[#8B5C9E]'
  },
  {
    name: 'Doctor Management',
    description: 'Add and manage doctors, their profiles, and specialties',
    href: '/admin/doctors',
    icon: Users,
    color: 'bg-[#8B5C9E]/90'
  },
  {
    name: 'Appointment Overview',
    description: 'View and manage all appointments and bookings',
    href: '/admin/appointments',
    icon: Clock,
    color: 'bg-[#8B5C9E]/80'
  },
  {
    name: 'Analytics & Reports',
    description: 'Track performance metrics and generate reports',
    href: '/admin/analytics',
    icon: BarChart2,
    color: 'bg-[#8B5C9E]/70'
  }
];

interface Analytics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  appointmentsByDay: {
    date: string;
    count: number;
  }[];
  revenueByDoctor: {
    id: string;
    name: string;
    revenue: number;
  }[];
  recentActivity: {
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    status: string;
  }[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const result = await fetchAnalytics(subDays(new Date(), 30), new Date());
        if (result.success && result.data) {
          setAnalytics(result.data);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome to BookingPress Admin</h1>
          <p className="mt-2 text-base lg:text-lg text-gray-600">Manage your clinic operations efficiently</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={feature.href}
                className="block h-full p-4 lg:p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#8B5C9E]/30 transition-colors"
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${feature.color} flex items-center justify-center mb-3 lg:mb-4`}>
                  <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">
                  {feature.name}
                </h3>
                <p className="text-sm lg:text-base text-gray-600">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { 
              label: "Today's Appointments", 
              value: isLoading ? '...' : analytics?.appointmentsByDay?.find(day => 
                format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              )?.count || '0'
            },
            { 
              label: 'Active Doctors', 
              value: isLoading ? '...' : analytics?.revenueByDoctor?.length || '0'
            },
            { 
              label: 'Total Appointments', 
              value: isLoading ? '...' : analytics?.totalAppointments?.toString() || '0'
            },
            { 
              label: 'This Month Revenue', 
              value: isLoading ? '...' : `₹${analytics?.totalRevenue?.toFixed(2) || '0'}`
            }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6"
            >
              <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="mt-1 lg:mt-2 text-xl lg:text-3xl font-bold text-[#8B5C9E]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 