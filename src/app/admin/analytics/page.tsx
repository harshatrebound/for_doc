'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { format, subDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { fetchAnalytics } from '@/app/actions/admin';
import { Card } from '@/components/ui/card';

interface DoctorRevenue {
  id: string;
  name: string;
  revenue: number;
}

interface ActivityItem {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: string;
}

interface Analytics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  appointmentsByDay: {
    date: string;
    count: number;
  }[];
  revenueByDoctor: DoctorRevenue[];
  recentActivity: ActivityItem[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchAnalytics(dateRange.startDate, dateRange.endDate);
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        setError(result.error || 'Failed to load analytics');
        toast.error(result.error || 'Failed to load analytics');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const revenueColumns = [
    {
      header: 'Doctor',
      accessorKey: 'name' as keyof DoctorRevenue,
      sortable: true,
      cell: (row: DoctorRevenue) => (
        <span className="text-gray-900 font-medium">{row.name}</span>
      ),
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue' as keyof DoctorRevenue,
      cell: (row: DoctorRevenue) => (
        <span className="text-gray-900 font-medium">
          ₹{row.revenue.toFixed(2)}
        </span>
      ),
      sortable: true,
    },
  ];

  const activityColumns = [
    {
      header: 'Patient',
      accessorKey: 'patientName' as keyof ActivityItem,
      cell: (row: ActivityItem) => (
        <span className="text-gray-900">{row.patientName}</span>
      ),
      sortable: true,
    },
    {
      header: 'Doctor',
      accessorKey: 'doctorName' as keyof ActivityItem,
      cell: (row: ActivityItem) => (
        <span className="text-gray-900">{row.doctorName}</span>
      ),
      sortable: true,
    },
    {
      header: 'Date',
      accessorKey: 'date' as keyof ActivityItem,
      cell: (row: ActivityItem) => (
        <span className="text-gray-700">
          {format(new Date(row.date), 'PP')}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof ActivityItem,
      cell: (row: ActivityItem) => {
        const status = row.status.toLowerCase();
        const getStatusStyle = () => {
          switch (status) {
            case 'completed':
              return 'bg-green-100 text-green-800';
            case 'cancelled':
              return 'bg-red-100 text-red-800';
            case 'confirmed':
              return 'bg-blue-100 text-blue-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle()}`}
          >
            {status}
          </span>
        );
      },
      sortable: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12 text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12 text-red-600">
          {error || 'Failed to load analytics data'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last 30 days overview
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-0 shadow-md bg-white">
          <h3 className="text-sm font-medium text-gray-500">Total Appointments</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {analytics.totalAppointments}
          </p>
        </Card>
        <Card className="p-6 border-0 shadow-md bg-white">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {analytics.completedAppointments}
          </p>
        </Card>
        <Card className="p-6 border-0 shadow-md bg-white">
          <h3 className="text-sm font-medium text-gray-500">Cancelled</h3>
          <p className="mt-2 text-3xl font-semibold text-red-600">
            {analytics.cancelledAppointments}
          </p>
        </Card>
        <Card className="p-6 border-0 shadow-md bg-white">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-semibold text-[#8B5C9E]">
            ₹{analytics.totalRevenue.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Revenue by Doctor */}
      <Card className="border-0 shadow-md bg-white">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Revenue by Doctor</h2>
        </div>
        <div className="p-6">
          <DataTable
            columns={revenueColumns}
            data={analytics.revenueByDoctor}
            sortable
          />
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md bg-white">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <DataTable
            columns={activityColumns}
            data={analytics.recentActivity}
            sortable
          />
        </div>
      </Card>
    </div>
  );
} 