'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/Calendar';
import { TimeGrid } from '@/components/TimeGrid';
import { DoctorSelect } from '@/components/DoctorSelect';
import { Doctor } from '@/types/doctor';
import { DoctorSchedule, Appointment } from '@/types/schedule';
import { format, startOfWeek, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function ScheduleManagement() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedDoctor) {
      fetchSchedule();
      fetchAppointments();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchSchedule = async () => {
    if (!selectedDoctor) return;
    
    try {
      const response = await fetch(`/api/doctors/${selectedDoctor.id}/schedule`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      toast.error('Failed to load schedule');
    }
  };

  const fetchAppointments = async () => {
    if (!selectedDoctor) return;

    try {
      const startDate = format(startOfWeek(selectedDate), 'yyyy-MM-dd');
      const endDate = format(addDays(startOfWeek(selectedDate), 6), 'yyyy-MM-dd');
      
      const response = await fetch(
        `/api/doctors/${selectedDoctor.id}/appointments?start=${startDate}&end=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleUpdate = async (daySchedule: DoctorSchedule) => {
    if (!selectedDoctor) return;

    try {
      const response = await fetch(`/api/doctors/${selectedDoctor.id}/schedule/${daySchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(daySchedule),
      });

      if (!response.ok) throw new Error('Failed to update schedule');
      toast.success('Schedule updated successfully');
      fetchSchedule();
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Schedule Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage doctor schedules and appointments
            </p>
          </div>
          <DoctorSelect
            value={selectedDoctor}
            onChange={setSelectedDoctor}
          />
        </div>

        {selectedDoctor ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                appointments={appointments}
              />
            </div>
            <div className="lg:col-span-2">
              <TimeGrid
                date={selectedDate}
                schedule={schedule}
                appointments={appointments}
                onScheduleUpdate={handleScheduleUpdate}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctor selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please select a doctor to manage their schedule
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 