'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Settings, Plus, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import SpecialDatesCalendar from '@/components/SpecialDatesCalendar';

interface Doctor {
  id: string;
  name: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  bufferTime: number;
}

interface DaySchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Schedule {
  [day: string]: {
    [time: string]: boolean;
  };
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function ScheduleManagement() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [schedule, setSchedule] = useState<Schedule>({});
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const durations = [5, 10, 15, 30, 45, 60];
  const bufferTimes = [0, 5, 10, 15, 30];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchSchedule();
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/admin/doctors');
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/schedules/${selectedDoctor}`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const fullSchedule: DaySchedule[] = await response.json();
      
      const newSchedule: Schedule = {};
      fullSchedule.forEach((daySchedule) => {
        if (!newSchedule[daySchedule.dayOfWeek]) {
          newSchedule[daySchedule.dayOfWeek] = {};
        }
        newSchedule[daySchedule.dayOfWeek][daySchedule.startTime] = daySchedule.isActive;
        newSchedule[daySchedule.dayOfWeek][daySchedule.endTime] = daySchedule.isActive;
      });
      
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDoctor) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/schedules/${selectedDoctor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });

      if (!response.ok) throw new Error('Failed to save schedule');
      
      toast.success('Schedule saved successfully');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleChange = (day: string, time: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: !prev[day]?.[time]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-[--text-primary]">Schedule Management</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!selectedDoctor || isSaving}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-[--primary] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[--primary-dark] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Doctor Selection */}
        <div className="mb-6">
          <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
            Select Doctor
          </label>
          <select
            id="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-[#8B5C9E] focus:border-[#8B5C9E] text-sm sm:text-base"
          >
            <option value="">Choose a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <th key={day} className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {day.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {time}
                    </td>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <td key={day} className="px-4 sm:px-6 py-3 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={schedule[day]?.[time] || false}
                          onChange={() => handleScheduleChange(day, time)}
                          className="h-4 w-4 text-[#8B5C9E] focus:ring-[#8B5C9E] border-gray-300 rounded"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Special Dates Calendar */}
        <div className="mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Special Dates</h2>
          <SpecialDatesCalendar doctorId={selectedDoctor} />
        </div>
      </div>
    </div>
  );
} 