import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
} from 'date-fns';

// Appointment type (should match your backend model)
interface Appointment {
  id: string;
  patientName: string | null;
  date: Date;
  time: string | null;
  status: string;
  doctorId: string;
  customerId: string | null;
  doctor: {
    name: string;
    speciality: string;
  };
}

interface AdminCalendarProps {
  appointments: Appointment[];
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  maxVisibleAppointments?: number;
}

const DEFAULT_MAX_VISIBLE = 4;
const BRAND_PURPLE = '#8B5C9E';

const AdminCalendar = ({
  appointments,
  onDayClick,
  onAppointmentClick,
  maxVisibleAppointments = DEFAULT_MAX_VISIBLE,
}: AdminCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [mobileWeekStart, setMobileWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const nextWeek = () => setMobileWeekStart(addWeeks(mobileWeekStart, 1));
  const previousWeek = () => setMobileWeekStart(subWeeks(mobileWeekStart, 1));

  const getAppointmentsForDay = (date: Date): Appointment[] => {
    return appointments.filter((appointment: Appointment) =>
      isSameDay(new Date(appointment.date), date)
    );
  };

  // Mobile: get days for the current week
  const mobileWeekEnd = addDays(mobileWeekStart, 6);
  const mobileWeekDays = eachDayOfInterval({
    start: mobileWeekStart,
    end: mobileWeekEnd
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Desktop: Month Grid */}
      <div className="hidden sm:block p-4">
        <div className="flex items-center justify-between mb-2">
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
          {days.map((day: Date) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const visibleAppointments = dayAppointments.slice(0, maxVisibleAppointments);
            const hiddenCount = dayAppointments.length - visibleAppointments.length;
            return (
              <div
                key={day.toString()}
                className={`relative p-2 w-full aspect-square flex flex-col items-start justify-start hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${!isCurrentMonth && 'text-gray-400'} ${isSameDay(day, new Date()) ? 'ring-2 ring-[#8B5C9E]' : ''}`}
                onClick={() => onDayClick(day)}
                style={{ boxShadow: isSameDay(day, new Date()) ? `0 0 0 2px ${BRAND_PURPLE}` : undefined }}
              >
                <time
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={`text-xs font-semibold mb-1 ${isSameDay(day, new Date()) ? 'text-[#8B5C9E]' : ''}`}
                >
                  {format(day, 'd')}
                </time>
                <div className="flex flex-col gap-0.5 w-full">
                  {visibleAppointments.map((appointment: Appointment) => (
                    <button
                      key={appointment.id}
                      className="w-full text-left truncate text-xs bg-[#F3E8FF] border border-[#E9D5FF] rounded px-1 py-0.5 mb-0.5 hover:bg-[#E9D5FF] shadow-sm"
                      onClick={e => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                      title={appointment.patientName || 'Appointment'}
                      style={{ color: '#4B006E' }}
                    >
                      <span className="font-medium">{appointment.patientName || 'Appointment'}</span>
                      {appointment.time && (
                        <span className="ml-1 text-[10px] text-gray-500">{appointment.time}</span>
                      )}
                    </button>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      className="text-xs text-[#8B5C9E] mt-1 underline hover:text-[#6D28D9] font-semibold"
                      onClick={e => {
                        e.stopPropagation();
                        onDayClick(day);
                      }}
                    >
                      +{hiddenCount} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile: Week List */}
      <div className="block sm:hidden p-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={previousWeek}
            className="p-2 rounded-full bg-[#F3E8FF] text-[#8B5C9E] hover:bg-[#E9D5FF]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold text-[#8B5C9E]">
            {format(mobileWeekStart, 'MMM d')} - {format(mobileWeekEnd, 'MMM d, yyyy')}
          </h2>
          <button
            onClick={nextWeek}
            className="p-2 rounded-full bg-[#F3E8FF] text-[#8B5C9E] hover:bg-[#E9D5FF]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {mobileWeekDays.map((day: Date) => {
            const dayAppointments = getAppointmentsForDay(day);
            const visibleAppointments = dayAppointments.slice(0, maxVisibleAppointments);
            const hiddenCount = dayAppointments.length - visibleAppointments.length;
            return (
              <div
                key={day.toString()}
                className={`rounded-lg shadow-sm bg-white p-3 flex flex-col border border-gray-100 ${isSameDay(day, new Date()) ? 'ring-2 ring-[#8B5C9E]' : ''}`}
                onClick={() => onDayClick(day)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-[#8B5C9E]' : 'text-gray-900'}`}>{format(day, 'EEE, MMM d')}</span>
                  {isSameDay(day, new Date()) && <span className="text-xs bg-[#8B5C9E] text-white rounded px-2 py-0.5 ml-2">Today</span>}
                </div>
                <div className="flex flex-col gap-1">
                  {visibleAppointments.length === 0 && (
                    <span className="text-xs text-gray-400">No appointments</span>
                  )}
                  {visibleAppointments.map((appointment: Appointment) => (
                    <button
                      key={appointment.id}
                      className="w-full text-left truncate text-xs bg-[#F3E8FF] border border-[#E9D5FF] rounded px-2 py-1 mb-0.5 hover:bg-[#E9D5FF] shadow-sm font-medium text-[#4B006E]"
                      onClick={e => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                      title={appointment.patientName || 'Appointment'}
                    >
                      {appointment.patientName || 'Appointment'}
                      {appointment.time && (
                        <span className="ml-2 text-[11px] text-gray-500">{appointment.time}</span>
                      )}
                    </button>
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      className="text-xs text-[#8B5C9E] mt-1 underline hover:text-[#6D28D9] font-semibold"
                      onClick={e => {
                        e.stopPropagation();
                        onDayClick(day);
                      }}
                    >
                      +{hiddenCount} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar; 