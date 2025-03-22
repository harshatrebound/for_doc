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
  id?: string;
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  bufferTime: number;
  breakStart?: string;
  breakEnd?: string;
}

export default function ScheduleManagement() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const durations = [5, 10, 15, 30, 45, 60];
  const bufferTimes = [0, 5, 10, 15, 30];

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        toast.error('Failed to load doctors');
      }
    };
    fetchDoctors();
  }, []);

  // Fetch schedule when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;

    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/schedules?doctorId=${selectedDoctor}`);
        const data = await response.json();
        
        // Initialize schedule for days without data
        const fullSchedule = daysOfWeek.map((_, index) => {
          const existingSchedule = data.find((s: DaySchedule) => s.dayOfWeek === index);
          return existingSchedule || {
            dayOfWeek: index,
            isActive: false,
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 15,
            bufferTime: 5
          };
        });
        
        setSchedule(fullSchedule);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
        toast.error('Failed to load schedule');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDoctor]);

  const handleSave = async () => {
    if (!selectedDoctor) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          schedules: schedule
        }),
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

  const updateDaySchedule = (dayIndex: number, updates: Partial<DaySchedule>) => {
    setSchedule(current => 
      current.map((day, index) => 
        index === dayIndex ? { ...day, ...updates } : day
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[--text-primary]">Schedule Management</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!selectedDoctor || isSaving}
            className="inline-flex items-center px-4 py-2 bg-[--primary] text-white font-medium rounded-lg hover:bg-[--primary-dark] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Doctor Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[--text-primary] mb-4">Doctor Selection</h2>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[--text-primary] focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Weekly Schedule */}
            {selectedDoctor && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-[--text-primary] mb-6">Weekly Schedule</h2>
                <div className="space-y-6">
                  {daysOfWeek.map((day, index) => (
                    <div
                      key={day}
                      className={`p-4 rounded-xl border ${
                        schedule[index]?.isActive
                          ? 'border-[--primary] bg-[--primary]/5'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-[--text-primary]">{day}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule[index]?.isActive}
                            onChange={(e) => updateDaySchedule(index, { isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[--primary]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[--primary]"></div>
                        </label>
                      </div>

                      {schedule[index]?.isActive && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={schedule[index].startTime}
                                onChange={(e) => updateDaySchedule(index, { startTime: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={schedule[index].endTime}
                                onChange={(e) => updateDaySchedule(index, { endTime: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                Slot Duration
                              </label>
                              <select
                                value={schedule[index].slotDuration}
                                onChange={(e) => updateDaySchedule(index, { slotDuration: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                              >
                                {durations.map(duration => (
                                  <option key={duration} value={duration}>
                                    {duration} minutes
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                Buffer Time
                              </label>
                              <select
                                value={schedule[index].bufferTime}
                                onChange={(e) => updateDaySchedule(index, { bufferTime: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                              >
                                {bufferTimes.map(time => (
                                  <option key={time} value={time}>
                                    {time} minutes
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                Break Start
                              </label>
                              <input
                                type="time"
                                value={schedule[index].breakStart || ''}
                                onChange={(e) => updateDaySchedule(index, { breakStart: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                                Break End
                              </label>
                              <input
                                type="time"
                                value={schedule[index].breakEnd || ''}
                                onChange={(e) => updateDaySchedule(index, { breakEnd: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[--primary] focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Special Dates */}
          {selectedDoctor && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <SpecialDatesCalendar doctorId={selectedDoctor} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 