'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay, isAfter, startOfToday, isWeekend, parse, addMinutes, setHours, setMinutes, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import type { SpecialDate } from '@/types/schedule';
import type { DateTimeSelectionProps } from '@/types/booking';

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

const DateTimeSelection = ({ formData, onChange, onSubmit, onBack }: DateTimeSelectionProps) => {
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ time: string; label: string; period: 'morning' | 'afternoon' | 'evening' }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const specialDatesRef = useRef<SpecialDate[]>([]);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
    // Check if it's a past date
    if (isAfter(startOfToday(), date)) {
      return false;
    }

    // Check if it's a weekend
    if (isWeekend(date)) {
      return false;
    }

    // Check if it's a holiday in special dates
    const specialDate = findSpecialDate(sd => 
      Boolean(sd.date) && isSameDay(new Date(sd.date), date)
    );
    
    if (specialDate?.type === 'HOLIDAY') {
      return false;
    }

    // Check if there's a schedule for this day
    const dayOfWeek = getDay(date);
    const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);

    // For test doctors, always return true
    const isTestDoctor = Boolean(formData.doctor?.id === 'dr-sameer' || formData.doctor?.id === 'other-doctors');
    if (isTestDoctor) {
      return true;
    }

    // Return true only if there's an active schedule for this day
    return Boolean(daySchedule?.isActive);
  };

  // Add scroll function with proper typing
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // Add dates array generation
  const dates = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 14 }, (_, i) => addDays(today, i));
  }, []);

  // Add date selection handler
  const handleDateSelect = (date: Date) => {
    onChange({ 
      selectedDate: date,
      selectedTime: '' 
    });
  };

  // Add time selection handler
  const handleTimeSelect = (time: string) => {
    onChange({ selectedTime: time });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#8B5C9E] animate-spin" />
        <p className="mt-4 text-gray-600">Loading schedule...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Schedule</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-[#8B5C9E] hover:bg-[#7A4B8D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5C9E]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#8B5C9E] hover:text-[#6B4A7E] rounded-md hover:bg-[#8B5C9E]/5 transition-colors"
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
            {dates.map((date: Date) => {
              const isSelected = formData.selectedDate && isSameDay(date, formData.selectedDate);
              const selectable = isDateSelectable(date);
              const dayOfMonth = format(date, 'd');
              const dayOfWeek = format(date, 'EEE');
              const isToday = isSameDay(date, startOfToday());

              return (
                <motion.button
                  key={dayOfMonth}
                  whileHover={selectable ? { scale: 1.05, y: -2 } : {}}
                  whileTap={selectable ? { scale: 0.95 } : {}}
                  disabled={!selectable}
                  onClick={() => selectable && handleDateSelect(date)}
                  className={`
                    min-w-[4.5rem] sm:min-w-[5rem] h-20 sm:h-24 rounded-xl flex flex-col items-center justify-center
                    transition-all duration-300 touch-manipulation
                    ${isSelected
                      ? 'bg-gradient-to-br from-[#8B5C9E] to-[#6B4A7E] text-white shadow-lg'
                      : selectable
                        ? 'border border-gray-200 hover:border-[#8B5C9E] bg-white hover:bg-[#F9F5FF]'
                        : 'border border-gray-200 bg-gray-50 opacity-60'
                    }
                  `}
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

      {/* Time Selection */}
      {formData.selectedDate && (
        <div className="space-y-5">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Time</h3>
          
          {timeSlots.length > 0 ? (
            <div className="space-y-5">
              {/* Morning slots */}
              {timeSlots.some(slot => slot.period === 'morning') && (
                <div className="time-slot-section">
                  <h4 className="flex items-center text-sm font-medium text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    Morning
                  </h4>
                  <div className="time-slots-grid">
                    {timeSlots
                      .filter(slot => slot.period === 'morning')
                      .map(({ time, label }) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleTimeSelect(time)}
                          className={`
                            time-slot-button
                            ${formData.selectedTime === time ?
                              'time-slot-selected' : 
                              'time-slot-unselected'}
                          `}
                        >
                          <span className="text-sm sm:text-base">{label}</span>
                        </motion.button>
                      ))}
                  </div>
                </div>
              )}

              {/* Afternoon slots */}
              {timeSlots.some(slot => slot.period === 'afternoon') && (
                <div className="time-slot-section">
                  <h4 className="flex items-center text-sm font-medium text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12A6 6 0 0010 4z" clipRule="evenodd" />
                    </svg>
                    Afternoon
                  </h4>
                  <div className="time-slots-grid">
                    {timeSlots
                      .filter(slot => slot.period === 'afternoon')
                      .map(({ time, label }) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleTimeSelect(time)}
                          className={`
                            time-slot-button
                            ${formData.selectedTime === time ?
                              'time-slot-selected' : 
                              'time-slot-unselected'}
                          `}
                        >
                          <span className="text-sm sm:text-base">{label}</span>
                        </motion.button>
                      ))}
                  </div>
                </div>
              )}

              {/* Evening slots */}
              {timeSlots.some(slot => slot.period === 'evening') && (
                <div className="time-slot-section">
                  <h4 className="flex items-center text-sm font-medium text-gray-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    Evening
                  </h4>
                  <div className="time-slots-grid">
                    {timeSlots
                      .filter(slot => slot.period === 'evening')
                      .map(({ time, label }) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleTimeSelect(time)}
                          className={`
                            time-slot-button
                            ${formData.selectedTime === time ?
                              'time-slot-selected' : 
                              'time-slot-unselected'}
                          `}
                        >
                          <span className="text-sm sm:text-base">{label}</span>
                        </motion.button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-600">No available slots for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;