'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isFuture, isPast, startOfDay } from 'date-fns';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Appointment {
  id: string;
  doctorId: string;
  doctor: {
    name: string;
    speciality: string;
  };
  patientName: string;
  date: string;
  time: string;
  status: string;
  email?: string;
  phone?: string;
  notes?: string;
}

type TabType = 'today' | 'upcoming' | 'past';

export default function AppointmentsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching appointments for tab:', activeTab);
      const response = await fetch(`/api/admin/appointments?type=${activeTab}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      console.log('Received appointments:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update appointment');
      
      setAppointments(current =>
        current.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      toast.success('Appointment status updated');
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="flex gap-2">
          {(['today', 'upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${activeTab === tab
                  ? 'bg-[#8B5C9E] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B5C9E]" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No appointments found for {activeTab}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {appointment.patientName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Dr. {appointment.doctor.name} - {appointment.doctor.speciality}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{appointment.time}</span>
                </div>
              </div>

              {appointment.status.toUpperCase() !== 'COMPLETED' && 
               appointment.status.toUpperCase() !== 'CANCELLED' && (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(appointment.id, 'CONFIRMED')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(appointment.id, 'COMPLETED')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </button>
                  <button
                    onClick={() => handleStatusChange(appointment.id, 'CANCELLED')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(appointment.id, 'NO_SHOW')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                    No Show
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 