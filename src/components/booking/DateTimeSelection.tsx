'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay, isAfter, startOfToday, isWeekend, parse, addMinutes, setHours, setMinutes, getDay, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, Calendar, Sun, Cloud, Moon } from 'lucide-react';
import type { SpecialDate } from '@/types/schedule';
import type { DateTimeSelectionProps } from '@/types/booking';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useBookingForm } from '@/contexts/BookingFormContext';
import { MobileSheet } from '@/components/ui/MobileSheet';
import { cn } from '@/lib/utils';

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

interface TimeSlot {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  label: string;
}

const categorizeTimes = (slots: string[]): TimeSlot[] => {
  return slots.map(time => {
    const [hours] = time.split(':');
    const hour = parseInt(hours, 10);
    let period: 'morning' | 'afternoon' | 'evening';
    
    if (hour < 12) {
      period = 'morning';
    } else if (hour < 17) {
      period = 'afternoon';
    } else {
      period = 'evening';
    }

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const label = `${hour12}:${time.split(':')[1]} ${ampm}`;

    return { time, period, label };
  });
};

const DateTimeSelection = ({ onBack }: Omit<DateTimeSelectionProps, 'formData' | 'onChange' | 'onSubmit'>) => {
  const { state, dispatch } = useBookingForm();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const specialDatesRef = useRef<SpecialDate[]>([]);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);

  const { slots, isLoading, error } = useTimeSlots({
    doctorId: state.doctor?.id || '',
    date: state.selectedDate,
    onError: (error) => {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { field: 'timeSlots', message: error.message } 
      });
    }
  });

  // Fetch doctor's schedule
  useEffect(() => {
    const doctorId = state.doctor?.id;
    if (!doctorId) return;

    const fetchSchedule = async () => {
      try {
        const response = await fetch(`/api/doctor-schedule/${doctorId}`);
        if (!response.ok) throw new Error('Failed to fetch schedule');
        const data = await response.json();
        setSchedule(data.schedule || []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setSchedule([]);
      }
    };

    fetchSchedule();
  }, [state.doctor?.id]);

  // Safe methods to access and set specialDates
  const setSpecialDates = (data: any) => {
    try {
      if (data === null || data === undefined) {
        specialDatesRef.current = [];
      } else if (Array.isArray(data)) {
        specialDatesRef.current = data;
      } else if (typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        specialDatesRef.current = data.data;
      } else {
        console.warn('Non-array data provided to setSpecialDates:', data);
        specialDatesRef.current = [];
      }
    } catch (err) {
      console.error('Error setting specialDates:', err);
      specialDatesRef.current = [];
    }
  };

  const findSpecialDate = (predicate: (item: SpecialDate) => boolean): SpecialDate | undefined => {
    try {
      if (!Array.isArray(specialDatesRef.current)) {
        console.warn('specialDatesRef.current is not an array:', specialDatesRef.current);
        return undefined;
      }
      return specialDatesRef.current.find(predicate);
    } catch (err) {
      console.error('Error finding in specialDates:', err);
      return undefined;
    }
  };

  const isDateSelectable = (date: Date): boolean => {
    if (isAfter(startOfToday(), date)) return false;
    if (isWeekend(date)) return false;

    const specialDate = findSpecialDate(sd => 
      Boolean(sd.date) && isSameDay(new Date(sd.date), date)
    );
    
    if (specialDate?.type === 'HOLIDAY') return false;

    const dayOfWeek = getDay(date);
    const isTestDoctor = Boolean(state.doctor?.id === 'dr-sameer' || state.doctor?.id === 'other-doctors');
    
    return isTestDoctor || Boolean(schedule.find(s => s.dayOfWeek === dayOfWeek)?.isActive);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const dates = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  const handleDateSelect = (date: Date) => {
    dispatch({ type: 'SET_DATE', payload: date });
    setShowTimeSheet(true);
  };

  const handleTimeSelect = (time: string) => {
    dispatch({ type: 'SET_TIME', payload: time });
    setShowTimeSheet(false);
  };

  const categorizedSlots = categorizeTimes(slots);

  useEffect(() => {
    // Generate next 14 days
    const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));
    setVisibleDates(dates);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#8B5C9E] animate-spin" />
        <p className="mt-4 text-gray-600">Loading schedule...</p>
      </div>
    );
  }

  const TimeSlotSection = ({ title, icon, slots }: { 
    title: string; 
    icon: React.ReactNode; 
    slots: TimeSlot[];
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        {icon}
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {slots.map(({ time, label }) => (
          <button
            key={time}
            onClick={() => handleTimeSelect(time)}
            className={cn(
              'p-3 rounded-xl text-sm font-medium transition-all duration-200',
              'hover:bg-primary/5 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
              state.selectedTime === time
                ? 'bg-primary text-white shadow-lg hover:bg-primary/90'
                : 'bg-gray-50 text-gray-700 hover:text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 rounded-md hover:bg-primary/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Select Date & Time
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Choose your preferred appointment slot
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Date</h3>
          <div className="flex items-center space-x-2">
            <motion.button 
              onClick={() => scroll('left')} 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-full hover:bg-[#8B5C9E]/10 text-gray-600 hover:text-[#8B5C9E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/30"
              aria-label="Previous dates"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button 
              onClick={() => scroll('right')} 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-full hover:bg-[#8B5C9E]/10 text-gray-600 hover:text-[#8B5C9E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/30"
              aria-label="Next dates"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="date-scroller-container">
          <motion.div
            ref={scrollRef}
            className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 date-scroller"
          >
            {visibleDates.map((date: Date) => {
              const isSelected = state.selectedDate && isSameDay(date, state.selectedDate);
              const selectable = isDateSelectable(date);
              const dayOfMonth = format(date, 'd');
              const dayOfWeek = format(date, 'EEE');
              const isToday = isSameDay(date, startOfToday());

              return (
                <motion.button
                  key={date.toISOString()}
                  whileHover={selectable ? { scale: 1.05, y: -2 } : {}}
                  whileTap={selectable ? { scale: 0.95 } : {}}
                  disabled={!selectable}
                  onClick={() => selectable && handleDateSelect(date)}
                  className={cn(
                    'min-w-[4.5rem] sm:min-w-[5rem] h-20 sm:h-24 rounded-xl flex flex-col items-center justify-center',
                    'transition-all duration-300 touch-manipulation',
                    isSelected
                      ? 'bg-gradient-to-br from-[#8B5C9E] to-[#6B4A7E] text-white shadow-lg'
                      : selectable
                        ? 'border border-gray-200 hover:border-[#8B5C9E] bg-white hover:bg-[#F9F5FF]'
                        : 'border border-gray-200 bg-gray-50 opacity-60'
                  )}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                    {dayOfWeek}
                  </span>
                  <span className={`text-xl sm:text-2xl font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {dayOfMonth}
                  </span>
                  {isToday && (
                    <span className={`text-xs font-medium mt-1 ${
                      isSelected 
                        ? 'bg-white/20 text-white px-2 py-0.5 rounded-full' 
                        : 'bg-[#8B5C9E]/10 text-[#8B5C9E] px-2 py-0.5 rounded-full'
                    }`}>
                      Today
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
          
          {/* Fade indicators for better UX */}
          <div className="date-scroller-fade-left"></div>
          <div className="date-scroller-fade-right"></div>
        </div>
      </div>

      {/* Selected Date & Time Display */}
      {state.selectedDate && (
        <div 
          onClick={() => setShowTimeSheet(true)}
          className={cn(
            'p-4 bg-gray-50 rounded-xl cursor-pointer transition-colors',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
        >
          <p className="text-sm text-gray-600">
            Selected: {format(state.selectedDate, 'EEEE, MMMM d, yyyy')}
            {state.selectedTime && ` at ${state.selectedTime}`}
          </p>
        </div>
      )}

      {/* Time Selection Sheet */}
      <MobileSheet
        isOpen={showTimeSheet}
        onClose={() => setShowTimeSheet(false)}
        title={`Select Time - ${state.selectedDate ? format(state.selectedDate, 'MMMM d, yyyy') : ''}`}
      >
        <div className="space-y-6 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error.message || 'Failed to load time slots'}
            </div>
          ) : categorizedSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available time slots for this date
            </div>
          ) : (
            <div className="space-y-6">
              {/* Morning Slots */}
              {categorizedSlots.some(slot => slot.period === 'morning') && (
                <TimeSlotSection
                  title="Morning"
                  icon={<Sun className="w-5 h-5 text-amber-500" />}
                  slots={categorizedSlots.filter(slot => slot.period === 'morning')}
                />
              )}

              {/* Afternoon Slots */}
              {categorizedSlots.some(slot => slot.period === 'afternoon') && (
                <TimeSlotSection
                  title="Afternoon"
                  icon={<Cloud className="w-5 h-5 text-blue-500" />}
                  slots={categorizedSlots.filter(slot => slot.period === 'afternoon')}
                />
              )}

              {/* Evening Slots */}
              {categorizedSlots.some(slot => slot.period === 'evening') && (
                <TimeSlotSection
                  title="Evening"
                  icon={<Moon className="w-5 h-5 text-indigo-500" />}
                  slots={categorizedSlots.filter(slot => slot.period === 'evening')}
                />
              )}
            </div>
          )}
        </div>
      </MobileSheet>
    </div>
  );
};

export default DateTimeSelection;