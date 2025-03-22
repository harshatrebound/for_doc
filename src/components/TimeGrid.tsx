'use client';

import { useState, useEffect } from 'react';
import { DoctorSchedule, Appointment, TimeSlot } from '@/types/schedule';
import { format, parse, addMinutes } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface TimeGridProps {
  date: Date;
  schedule: DoctorSchedule[];
  appointments: Appointment[];
  onScheduleUpdate: (schedule: DoctorSchedule) => void;
  isLoading: boolean;
}

export function TimeGrid({
  date,
  schedule,
  appointments,
  onScheduleUpdate,
  isLoading,
}: TimeGridProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const dayOfWeek = date.getDay();
  const daySchedule = schedule.find((s) => s.dayOfWeek === dayOfWeek);

  useEffect(() => {
    if (daySchedule) {
      generateTimeSlots();
    }
  }, [daySchedule, appointments]);

  const generateTimeSlots = () => {
    if (!daySchedule) return;

    const slots: TimeSlot[] = [];
    const startTime = parse(daySchedule.startTime, 'HH:mm', new Date());
    const endTime = parse(daySchedule.endTime, 'HH:mm', new Date());
    let currentTime = startTime;

    while (currentTime <= endTime) {
      const timeString = format(currentTime, 'HH:mm');
      const appointment = appointments.find(
        (a) =>
          format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
          (a.time === timeString || a.timeSlot === timeString)
      );

      slots.push({
        time: timeString,
        isAvailable: !appointment,
        appointmentId: appointment?.id,
      });

      currentTime = addMinutes(currentTime, 30); // 30-minute slots
    }

    setTimeSlots(slots);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B5C9E]" />
      </div>
    );
  }

  if (!daySchedule) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">No schedule set</h3>
          <p className="mt-1 text-sm text-gray-500">
            Set up the schedule for {format(date, 'EEEE')}s
          </p>
          <button
            onClick={() =>
              onScheduleUpdate({
                id: '',
                doctorId: '',
                dayOfWeek,
                startTime: '09:00',
                endTime: '17:00',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#8B5C9E] rounded-lg hover:bg-[#7B4C8E]"
          >
            Set up schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(date, 'EEEE, MMMM d')}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {daySchedule.startTime} - {daySchedule.endTime}
            </div>
            <button
              onClick={() =>
                onScheduleUpdate({
                  ...daySchedule,
                  isActive: !daySchedule.isActive,
                })
              }
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                daySchedule.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {daySchedule.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4">
        {timeSlots.map((slot) => (
          <div
            key={slot.time}
            className={`p-3 rounded-lg border ${
              slot.isAvailable
                ? 'border-gray-200 bg-gray-50'
                : 'border-[#8B5C9E] bg-[#8B5C9E]/5'
            }`}
          >
            <div className="text-sm font-medium text-gray-900">{slot.time}</div>
            <div className="text-xs text-gray-500">
              {slot.isAvailable ? 'Available' : 'Booked'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 