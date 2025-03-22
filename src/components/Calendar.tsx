'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '@/types/schedule';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';

interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  appointments: Appointment[];
}

export function Calendar({ value, onChange, appointments }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(value));

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((appointment) =>
      isSameDay(new Date(appointment.date), date)
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mt-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mt-2">
          {days.map((day, dayIdx) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isSelected = isSameDay(value, day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toString()}
                onClick={() => onChange(day)}
                className={`
                  relative p-2 w-full aspect-square flex flex-col items-center justify-center
                  hover:bg-gray-100 rounded-lg transition-colors
                  ${!isCurrentMonth && 'text-gray-400'}
                  ${isSelected && 'bg-[#8B5C9E] text-white hover:bg-[#7B4C8E]'}
                `}
              >
                <time
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={`text-sm ${
                    isSelected ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {format(day, 'd')}
                </time>
                {dayAppointments.length > 0 && (
                  <div
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#8B5C9E]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments for selected date */}
      <div className="border-t border-gray-200">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900">
            Appointments for {format(value, 'MMMM d, yyyy')}
          </h3>
          <div className="mt-2 space-y-1">
            {getAppointmentsForDay(value).length === 0 ? (
              <p className="text-sm text-gray-500">No appointments scheduled</p>
            ) : (
              getAppointmentsForDay(value).map((appointment) => (
                <div
                  key={appointment.id}
                  className="text-sm p-2 rounded-lg bg-gray-50"
                >
                  <div className="font-medium text-gray-900">
                    {appointment.patientName || 'Unnamed Patient'}
                  </div>
                  <div className="text-gray-500">
                    {appointment.time || appointment.timeSlot}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 