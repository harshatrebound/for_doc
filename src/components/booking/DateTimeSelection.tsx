'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay, isAfter, startOfToday, isWeekend, parse, addMinutes, setHours, setMinutes, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { SpecialDate } from '@/types/schedule';

interface DateTimeSelectionProps {
  selected: {
    date: Date | null;
    time: string;
  };
  doctorId: string;
  onSelect: (dateTime: { date: Date; time: string }) => void;
  onBack: () => void;
}

interface DoctorSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDuration: number;
  bufferTime: number;
  breakStart?: string;
  breakEnd?: string;
}

const DateTimeSelection = ({ selected, doctorId, onSelect, onBack }: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(selected.date);
  const [selectedTime, setSelectedTime] = useState<string>(selected.time);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ time: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => {
    const today = startOfToday();
    const daysToShow = 14;
    const dateArray = [];

    for (let i = 0; i < daysToShow; i++) {
      const date = addDays(today, i);
      // Normalize the date to start of day to avoid timezone issues
      const normalizedDate = setMinutes(setHours(date, 0), 0);
      dateArray.push(normalizedDate);
    }

    return dateArray;
  }, []);

  // Fetch doctor's schedule and special dates
  useEffect(() => {
    if (!doctorId || dataFetched) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const start = format(dates[0], 'yyyy-MM-dd');
        const end = format(dates[dates.length - 1], 'yyyy-MM-dd');

        const [scheduleResponse, specialDatesResponse] = await Promise.all([
          fetch(`/api/admin/schedules?doctorId=${doctorId}`),
          fetch(`/api/admin/special-dates?doctorId=${doctorId}&start=${start}&end=${end}`)
        ]);

        if (!scheduleResponse.ok || !specialDatesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [scheduleData, specialDatesData] = await Promise.all([
          scheduleResponse.json(),
          specialDatesResponse.json()
        ]);

        setSchedule(scheduleData);
        setSpecialDates(specialDatesData);
        setDataFetched(true);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [doctorId, dates, dataFetched]);

  // Generate time slots based on selected date, schedule, and special dates
  useEffect(() => {
    if (!selectedDate || !schedule.length) return;

    const dayOfWeek = getDay(selectedDate);
    const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
    const specialDate = specialDates.find(sd => 
      isSameDay(new Date(sd.date), selectedDate)
    );

    // If it's a holiday or no schedule, return empty slots
    if (specialDate?.type === 'HOLIDAY' || !daySchedule?.isActive) {
      setTimeSlots([]);
      return;
    }

    const slots: { time: string; label: string }[] = [];
    const startTime = parse(daySchedule.startTime, 'HH:mm', selectedDate);
    const endTime = parse(daySchedule.endTime, 'HH:mm', selectedDate);
    let currentTime = startTime;

    // Function to check if a time falls within any break period
    const isBreakTime = (time: Date) => {
      const timeString = format(time, 'HH:mm');
      
      // Check regular break time
      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const breakStart = parse(daySchedule.breakStart, 'HH:mm', selectedDate);
        const breakEnd = parse(daySchedule.breakEnd, 'HH:mm', selectedDate);
        if (time >= breakStart && time < breakEnd) return true;
      }

      // Check special break time
      if (specialDate?.type === 'BREAK' && specialDate.breakStart && specialDate.breakEnd) {
        const specialBreakStart = parse(specialDate.breakStart, 'HH:mm', selectedDate);
        const specialBreakEnd = parse(specialDate.breakEnd, 'HH:mm', selectedDate);
        if (time >= specialBreakStart && time < specialBreakEnd) return true;
      }

      return false;
    };

    while (currentTime <= endTime) {
      if (!isBreakTime(currentTime)) {
        const timeString = format(currentTime, 'HH:mm');
        const hour = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const label = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
        slots.push({ time: timeString, label });
      }
      currentTime = addMinutes(currentTime, daySchedule.slotDuration + daySchedule.bufferTime);
    }

    setTimeSlots(slots);
  }, [selectedDate, schedule, specialDates]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSelect({ date: selectedDate, time });
    }
  };

  const isDateSelectable = (date: Date) => {
    const normalizedDate = setMinutes(setHours(date, 0), 0);
    const normalizedToday = setMinutes(setHours(startOfToday(), 0), 0);
    
    if (!isAfter(normalizedDate, normalizedToday) && !isSameDay(normalizedDate, normalizedToday)) {
      return false;
    }
    
    // Check if it's a holiday
    const specialDate = specialDates.find(sd => 
      isSameDay(new Date(sd.date), normalizedDate)
    );
    if (specialDate?.type === 'HOLIDAY') return false;

    // Get the correct day of week (0-6, where 0 is Sunday)
    const dayOfWeek = getDay(normalizedDate);
    const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
    return daySchedule?.isActive ?? false;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Select Date & Time
        </h1>
        <p className="text-base text-gray-600">
          Choose your preferred appointment slot
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar"
        >
          {dates.map((date) => {
            const isSelectable = isDateSelectable(date);
            const isSelected = selectedDate && isSameDay(selectedDate, date);
            const isWeekendDay = isWeekend(date);
            const specialDate = specialDates.find(sd => isSameDay(new Date(sd.date), date));
            const dayName = format(date, 'EEE');

            return (
              <button
                key={date.toISOString()}
                onClick={() => isSelectable && handleDateSelect(date)}
                disabled={!isSelectable}
                className={`
                  relative flex-none w-20 py-3 rounded-xl text-center transition-all
                  ${isSelected
                    ? 'bg-gradient-to-br from-[#8B5C9E] to-[#6B4A7E] text-white shadow-md'
                    : isSelectable
                      ? isWeekendDay
                        ? 'bg-[#8B5C9E]/5 hover:bg-[#8B5C9E]/10 text-[#1a1a1a]'
                        : 'bg-white hover:bg-[#8B5C9E]/5 text-[#1a1a1a] border border-gray-200'
                      : specialDate?.type === 'HOLIDAY'
                        ? 'bg-red-50 text-red-700 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <p className="text-sm font-medium mb-1" aria-label={`Day of week: ${dayName}`}>
                  {dayName}
                </p>
                <p className="text-2xl font-bold leading-none mb-1">
                  {format(date, 'd')}
                </p>
                <p className="text-sm font-medium">
                  {format(date, 'MMM')}
                </p>
                {specialDate && (
                  <div className={`
                    absolute -top-1 -right-1 w-4 h-4 rounded-full
                    ${specialDate.type === 'HOLIDAY'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                    }
                  `}>
                    <span className="sr-only">
                      {specialDate.type === 'HOLIDAY' ? 'Holiday' : 'Break Time'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#1a1a1a]">Select Time</h2>
            {specialDates.find(sd => 
              isSameDay(new Date(sd.date), selectedDate) && sd.type === 'BREAK'
            ) && (
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Special Break Time
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#8B5C9E]" />
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto pr-2 hide-scrollbar">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map(({ time, label }) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`
                      py-2.5 rounded-xl text-center transition-all text-sm font-medium
                      ${selectedTime === time
                        ? 'bg-gradient-to-br from-[#8B5C9E] to-[#6B4A7E] text-white shadow-md'
                        : 'bg-white hover:bg-[#8B5C9E]/5 text-[#1a1a1a] border border-gray-200'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#666666] font-medium">
              {specialDates.find(sd => 
                isSameDay(new Date(sd.date), selectedDate) && sd.type === 'HOLIDAY'
              )
                ? 'This day is marked as a holiday'
                : 'No available time slots for this date'
              }
            </div>
          )}
        </motion.div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DateTimeSelection;
