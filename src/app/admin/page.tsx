'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Clock, 
  BarChart2, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { fetchAnalytics } from '@/app/actions/admin';
import { format, subDays, isToday, isPast } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

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

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const quickActions = [
    {
      name: 'Schedule',
      description: 'Manage doctor schedules',
      href: '/admin/schedule',
      icon: Calendar,
      color: 'bg-[#8B5C9E]',
      iconColor: 'text-[#8B5C9E]'
    },
    {
      name: 'Doctors',
      description: 'View and edit doctors',
      href: '/admin/doctors',
      icon: Users,
      color: 'bg-[#8B5C9E]/90',
      iconColor: 'text-[#8B5C9E]'
    },
    {
      name: 'Appointments',
      description: 'Manage bookings',
      href: '/admin/appointments',
      icon: Clock,
      color: 'bg-[#8B5C9E]/80',
      iconColor: 'text-[#8B5C9E]'
    },
    {
      name: 'Analytics',
      description: 'View detailed reports',
      href: '/admin/analytics',
      icon: BarChart2,
      color: 'bg-[#8B5C9E]/70',
      iconColor: 'text-[#8B5C9E]'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-6">
        <div className="space-y-4">
          {/* Skeleton Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-4 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          {/* Skeleton Actions */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
                <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const todayAppointments = analytics?.recentActivity.filter(
    activity => isToday(new Date(activity.date))
  ).length || 0;

  const upcomingAppointments = analytics?.recentActivity.filter(
    activity => !isPast(new Date(activity.date))
  ).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview and quick actions
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-[#8B5C9E] to-[#8B5C9E]/90">
            <div className="text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 opacity-75" />
                <span className="text-sm font-medium opacity-75">Today</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{todayAppointments}</p>
              <p className="text-sm opacity-75">Appointments</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#8B5C9E]/90 to-[#8B5C9E]/80">
            <div className="text-white">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 opacity-75" />
                <span className="text-sm font-medium opacity-75">Upcoming</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{upcomingAppointments}</p>
              <p className="text-sm opacity-75">Appointments</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#8B5C9E]/80 to-[#8B5C9E]/70">
            <div className="text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 opacity-75" />
                <span className="text-sm font-medium opacity-75">Completed</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{analytics?.completedAppointments || 0}</p>
              <p className="text-sm opacity-75">This Month</p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#8B5C9E]/70 to-[#8B5C9E]/60">
            <div className="text-white">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 opacity-75" />
                <span className="text-sm font-medium opacity-75">Cancelled</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{analytics?.cancelledAppointments || 0}</p>
              <p className="text-sm opacity-75">This Month</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link 
                key={action.name} 
                href={action.href}
                className="block"
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full"
                >
                  <div className={`w-10 h-10 rounded-full ${action.color} bg-opacity-10 flex items-center justify-center mb-3`}>
                    <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <h3 className="font-medium text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#8B5C9E] hover:text-[#8B5C9E] hover:bg-[#8B5C9E]/5"
              onClick={() => router.push('/admin/appointments')}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {analytics?.recentActivity.slice(0, 5).map((activity) => (
              <Card key={activity.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{activity.patientName}</p>
                    <p className="text-sm text-gray-500">with Dr. {activity.doctorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(activity.date), 'MMM d, yyyy')}
                    </p>
                    <span 
                      className={`inline-block px-2 py-1 text-xs rounded-full mt-1
                        ${activity.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 
                          activity.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Revenue Overview */}
        {analytics?.revenueByDoctor && analytics.revenueByDoctor.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-gray-900">Top Performing Doctors</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#8B5C9E] hover:text-[#8B5C9E] hover:bg-[#8B5C9E]/5"
                onClick={() => router.push('/admin/analytics')}
              >
                View Analytics
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {analytics.revenueByDoctor.slice(0, 3).map((doctor) => (
                <Card key={doctor.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#8B5C9E]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                        <p className="text-sm text-[#8B5C9E]">₹{doctor.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 