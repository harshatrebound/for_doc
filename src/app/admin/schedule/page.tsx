'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  fetchDoctors, 
  fetchDoctorSchedule, 
} from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
}

interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDuration: number;
  bufferTime: number;
  breakStart?: string | null;
  breakEnd?: string | null;
}

interface DoctorWithSchedule extends Doctor {
  schedules: Schedule[];
}

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const [doctorsWithSchedule, setDoctorsWithSchedule] = useState<DoctorWithSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDoctorsWithSchedule();
  }, []);

  const loadDoctorsWithSchedule = async () => {
    try {
      const doctorsResult = await fetchDoctors();
      if (!doctorsResult.success || !doctorsResult.data) {
        throw new Error(doctorsResult.error || 'Failed to fetch doctors');
      }

      const doctorsWithSchedule = await Promise.all(
        doctorsResult.data.map(async (doctor) => {
          const scheduleResult = await fetchDoctorSchedule(doctor.id);
          return {
            id: doctor.id,
            name: doctor.name,
            speciality: doctor.speciality,
            schedules: scheduleResult.success && scheduleResult.data ? scheduleResult.data.map(schedule => ({
              id: schedule.id,
              doctorId: schedule.doctorId,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isActive: schedule.isActive,
              slotDuration: schedule.slotDuration,
              bufferTime: schedule.bufferTime,
              breakStart: schedule.breakStart,
              breakEnd: schedule.breakEnd,
            })) : [],
          } as DoctorWithSchedule;
        })
      );
      setDoctorsWithSchedule(doctorsWithSchedule);
      if (doctorsWithSchedule.length > 0) {
        setSelectedDoctor(doctorsWithSchedule[0].id);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();

  const filteredDoctors = doctorsWithSchedule.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoctorData = doctorsWithSchedule.find(d => d.id === selectedDoctor);
  const todaySchedule = selectedDoctorData?.schedules.find(
    s => s.dayOfWeek === selectedDate.getDay()
  );

  const getTimeSlots = (schedule: Schedule) => {
    if (!schedule) return [];
    const slots = [];
    let currentTime = schedule.startTime;
    while (currentTime < schedule.endTime) {
      slots.push(currentTime);
      // Add duration and buffer time
      const [hours, minutes] = currentTime.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + schedule.slotDuration + schedule.bufferTime;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }
    return slots;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage availability and time slots
              </p>
            </div>
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Button to manage global special dates */}
              <Button
                variant="outline"
                className="border-[#8B5C9E] text-[#8B5C9E] hover:bg-[#8B5C9E]/5"
                onClick={() => router.push('/admin/special-dates')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Manage Special Dates
              </Button>
              {/* Button to edit the selected doctor's weekly schedule */}
              <Button
                className="bg-[#8B5C9E] hover:bg-[#8B5C9E]/90"
                onClick={() => selectedDoctor && router.push(`/admin/doctors/${selectedDoctor}/schedule`)}
                disabled={!selectedDoctor}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Weekly Schedule
              </Button>
            </div>
          </div>

          {/* Doctor Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {filteredDoctors.map((doctor) => (
              <Button
                key={doctor.id}
                variant={selectedDoctor === doctor.id ? "default" : "outline"}
                size="sm"
                className={`flex-shrink-0 ${
                  selectedDoctor === doctor.id 
                    ? 'bg-[#8B5C9E] hover:bg-[#8B5C9E]/90' 
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedDoctor(doctor.id)}
              >
                {doctor.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Week Navigation */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-gray-900">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((date, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`p-1 h-auto flex flex-col items-center ${
                  isSameDay(date, selectedDate)
                    ? 'bg-[#8B5C9E]/10 text-[#8B5C9E] font-medium'
                    : ''
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-xs">{shortDays[date.getDay()]}</span>
                <span className="text-sm mt-1">{format(date, 'd')}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="p-4">
        {todaySchedule ? (
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8B5C9E]" />
                  <span className="font-medium text-gray-900">
                    {todaySchedule.startTime} - {todaySchedule.endTime}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  todaySchedule.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {todaySchedule.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {getTimeSlots(todaySchedule).map((slot, index) => {
                const isBreak = todaySchedule.breakStart && todaySchedule.breakEnd &&
                  slot >= todaySchedule.breakStart && slot < todaySchedule.breakEnd;

                return (
                  <div
                    key={index}
                    className={`p-4 ${
                      isBreak ? 'bg-amber-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">
                          {slot}
                        </span>
                        {isBreak && (
                          <span className="text-xs text-amber-600 font-medium">
                            Break Time
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {todaySchedule.slotDuration} min
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-[#8B5C9E]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Schedule Set</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedDoctorData?.name} doesn't have a schedule for {format(selectedDate, 'EEEE')}
            </p>
            <Button
              onClick={() => router.push(`/admin/doctors/${selectedDoctor}/schedule`)}
              className="bg-[#8B5C9E] hover:bg-[#8B5C9E]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Set Schedule
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Current Week Schedule View - Keep existing structure */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Time</th>
                    {weekDays.map((date, index) => (
                      <th key={index} className="p-2 border text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {shortDays[date.getDay()]}<br/>{format(date, 'd')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map(time => (
                    <tr key={time}>
                      <td className="p-2 border text-xs text-gray-500 align-top h-12 w-24">{time}</td>
                      {weekDays.map((date, dayIndex) => {
                        const daySchedule = selectedDoctorData?.schedules.find(s => s.dayOfWeek === date.getDay());
                        const isWorking = daySchedule?.isActive;
                        return (
                          <td 
                            key={dayIndex} 
                            className={cn(
                              'p-1 border text-xs text-center align-top h-12',
                              isWorking ? 'bg-green-50' : 'bg-gray-100 opacity-50'
                            )}
                          >
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 