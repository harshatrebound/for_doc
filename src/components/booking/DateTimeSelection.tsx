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
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ time: string; label: string; period: 'morning' | 'afternoon' | 'evening' }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (!formData.doctor?.id || dataFetched) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const start = format(dates[0], 'yyyy-MM-dd');
        const end = format(dates[dates.length - 1], 'yyyy-MM-dd');

        // Safe access to formData.doctor using non-null assertion
        // since we've already checked for formData.doctor?.id above
        const doctorId = formData.doctor!.id;

        const [scheduleResponse, specialDatesResponse] = await Promise.all([
          fetch(`/api/schedules?doctorId=${doctorId}`),
          fetch(`/api/special-dates?doctorId=${doctorId}&start=${start}&end=${end}`)
        ]);

        // For test doctors, generate default schedules if none exist
        const isTestDoctor = doctorId === 'dr-sameer' || doctorId === 'other-doctors';

        if (!scheduleResponse.ok && !isTestDoctor) {
          throw new Error('Failed to fetch schedule data');
        }

        if (!specialDatesResponse.ok && !isTestDoctor) {
          throw new Error('Failed to fetch special dates data');
        }

        let scheduleData = [];
        let specialDatesData = [];
        
        try {
          scheduleData = await scheduleResponse.json();
        } catch (e) {
          console.warn('Could not parse schedule response, using defaults');
          // If this is a test doctor, create default schedules
          if (isTestDoctor) {
            scheduleData = [1, 2, 3, 4, 5].map(day => ({
              id: `default-${day}`,
              doctorId,
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '17:00',
              isActive: true,
              slotDuration: 15,
              bufferTime: 5
            }));
          }
        }

        try {
          specialDatesData = await specialDatesResponse.json();
        } catch (e) {
          console.warn('Could not parse special dates response, using empty array');
          specialDatesData = [];
        }

        if (!Array.isArray(scheduleData) && !isTestDoctor) {
          throw new Error('Invalid schedule data format');
        }

        setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
        setSpecialDates(specialDatesData || []);
        setDataFetched(true);
      } catch (err) {
        setError('Could not load doctor\'s schedule. Please try again.');
        console.error('Error fetching schedule:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData.doctor, dates, dataFetched]);

  // Generate time slots based on selected date, schedule, and special dates
  useEffect(() => {
    if (!formData.selectedDate) return;

    const dayOfWeek = getDay(formData.selectedDate);
    const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
    const specialDate = specialDates.find(sd => 
      sd.date && formData.selectedDate && isSameDay(new Date(sd.date), formData.selectedDate)
    );

    // For test doctors, generate default time slots if schedule not found
    const isTestDoctor = formData.doctor?.id === 'dr-sameer' || formData.doctor?.id === 'other-doctors';
    
    // If it's a holiday or no schedule (and not a test doctor), return empty slots
    if (specialDate?.type === 'HOLIDAY' || (!daySchedule?.isActive && !isTestDoctor)) {
      setTimeSlots([]);
      return;
    }

    const slots: { time: string; label: string; period: 'morning' | 'afternoon' | 'evening' }[] = [];
    
    // Create a default schedule for test doctors if needed
    const defaultSchedule = {
      startTime: '09:00',
      endTime: '17:00', 
      slotDuration: 15,
      bufferTime: 5,
      breakStart: '13:00',
      breakEnd: '14:00'
    };

    if (formData.selectedDate) {
      // Use actual schedule if available, or default for test doctors
      const scheduleToUse = (daySchedule && daySchedule.isActive) ? daySchedule : 
                           (isTestDoctor ? defaultSchedule : null);
      
      if (scheduleToUse) {
        const startTime = parse(scheduleToUse.startTime, 'HH:mm', formData.selectedDate);
        const endTime = parse(scheduleToUse.endTime, 'HH:mm', formData.selectedDate);
        let currentTime = startTime;

        // Function to check if a time falls within any break period
        const isBreakTime = (time: Date) => {
          // Check regular break time
          if (scheduleToUse.breakStart && scheduleToUse.breakEnd && formData.selectedDate) {
            const breakStart = parse(scheduleToUse.breakStart, 'HH:mm', formData.selectedDate);
            const breakEnd = parse(scheduleToUse.breakEnd, 'HH:mm', formData.selectedDate);
            if (time >= breakStart && time < breakEnd) return true;
          }

          // Check special break time
          if (specialDate?.type === 'BREAK' && specialDate.breakStart && specialDate.breakEnd && formData.selectedDate) {
            const specialBreakStart = parse(specialDate.breakStart, 'HH:mm', formData.selectedDate);
            const specialBreakEnd = parse(specialDate.breakEnd, 'HH:mm', formData.selectedDate);
            if (time >= specialBreakStart && time < specialBreakEnd) return true;
          }

          return false;
        };

        // Determine time period (morning, afternoon, evening)
        const getTimePeriod = (hour: number): 'morning' | 'afternoon' | 'evening' => {
          if (hour < 12) return 'morning';
          if (hour < 17) return 'afternoon';
          return 'evening';
        };

        while (currentTime <= endTime) {
          if (!isBreakTime(currentTime)) {
            const timeString = format(currentTime, 'HH:mm');
            const hour = currentTime.getHours();
            const minutes = currentTime.getMinutes();
            const period = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            const label = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
            slots.push({ 
              time: timeString, 
              label,
              period: getTimePeriod(hour)
            });
          }
          currentTime = addMinutes(currentTime, scheduleToUse.slotDuration + scheduleToUse.bufferTime);
        }
      }
    }

    setTimeSlots(slots);
  }, [formData.selectedDate, schedule, specialDates]);

  // Custom scrollbar for date selection
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Calculate scroll amount based on mobile or desktop
      const scrollAmount = direction === 'left' ? -200 : 200;
      
      // Get visible items to determine precise scrolling
      const dateItems = scrollRef.current.querySelectorAll('button');
      
      if (dateItems.length > 0) {
        const containerWidth = scrollRef.current.offsetWidth;
        const itemWidth = dateItems[0].offsetWidth + 8; // Include margin
        
        // Calculate items per view for precise scrolling
        const itemsPerView = Math.floor(containerWidth / itemWidth);
        const scrollBy = direction === 'left' ? -itemWidth * itemsPerView : itemWidth * itemsPerView;
        
        // Add smooth scrolling with better touch feedback
        scrollRef.current.scrollBy({ 
          left: scrollBy, 
          behavior: 'smooth' 
        });
      } else {
        // Fallback to default scrolling
        scrollRef.current.scrollBy({ 
          left: scrollAmount, 
          behavior: 'smooth' 
        });
      }
      
      // Add haptic feedback on mobile if available
      if (isMobile && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
    }
  };

  const dateScrollIntoView = (date: Date) => {
    if (!scrollRef.current) return;
    
    const dateItems = scrollRef.current.querySelectorAll('button');
    const targetDate = date.getDate().toString();
    
    // Find the button with matching date
    for (let i = 0; i < dateItems.length; i++) {
      if (dateItems[i].textContent?.includes(targetDate)) {
        dateItems[i].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
        break;
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    // Add haptic feedback on mobile if available
    if (isMobile && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
    
    onChange({ selectedDate: date, selectedTime: '' });
    
    // Ensure the selected date is centered in view
    dateScrollIntoView(date);
  };

  const handleTimeSelect = (time: string) => {
    // Add haptic feedback on mobile if available
    if (isMobile && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
    
    onChange({ selectedTime: time });
    onSubmit();
  };

  const isDateSelectable = (date: Date) => {
    const normalizedDate = setMinutes(setHours(date, 0), 0);
    const normalizedToday = setMinutes(setHours(startOfToday(), 0), 0);
    
    // Don't allow dates in the past
    if (!isAfter(normalizedDate, normalizedToday) && !isSameDay(normalizedDate, normalizedToday)) {
      return false;
    }
    
    // For test doctors with special IDs, allow all dates
    if (formData.doctor?.id === 'dr-sameer' || formData.doctor?.id === 'other-doctors') {
      return true;
    }
    
    // Check if it's a holiday
    const specialDate = specialDates.find(sd => 
      sd.date && isSameDay(new Date(sd.date), normalizedDate)
    );
    if (specialDate?.type === 'HOLIDAY') return false;

    // Get the correct day of week (0-6, where 0 is Sunday)
    const dayOfWeek = getDay(normalizedDate);
    const daySchedule = schedule.find(s => s.dayOfWeek === dayOfWeek);
    return daySchedule?.isActive ?? false;
  };

  // Loading skeleton for better UX
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-16 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        <div>
          <div className="h-7 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Date selection skeleton */}
        <div className="mt-6 mb-8">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="flex space-x-3 overflow-x-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Time slot skeleton */}
        <div className="mt-6">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 sm:py-12">
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
          Try again
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
            {dates.map((date) => {
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
                            ${formData.selectedTime === time
                              ? 'time-slot-selected'
                              : 'time-slot-unselected'
                            }
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
                            ${formData.selectedTime === time
                              ? 'time-slot-selected'
                              : 'time-slot-unselected'
                            }
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
                            ${formData.selectedTime === time
                              ? 'time-slot-selected'
                              : 'time-slot-unselected'
                            }
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
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 sm:py-12 border border-gray-200 rounded-xl bg-gray-50"
            >
              <div className="flex flex-col items-center">
                <Calendar className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-gray-700 font-medium text-base sm:text-lg">No available slots for this date</p>
                <p className="text-gray-500 mt-1 max-w-xs mx-auto text-sm">
                  Please select another date or check back later for availability
                </p>
                
                {/* Quick navigation buttons for better UX */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => scroll('left')}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:border-[#8B5C9E]/30 hover:bg-[#F9F5FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/20"
                  >
                    Previous dates
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:border-[#8B5C9E]/30 hover:bg-[#F9F5FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/20"
                  >
                    Next dates
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <style jsx global>{`
        /* Custom scrollbar for date selection */
        .date-scroller {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch; /* Improved iOS scrolling */
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          padding: 0.5rem 0;
          margin: -0.5rem 0;
          /* Prevent overscroll behavior */
          overscroll-behavior-x: contain;
          /* Promote to GPU layer for smoother scrolling on mobile */
          transform: translateZ(0);
          will-change: scroll-position;
        }
        
        .date-scroller::-webkit-scrollbar {
          display: none;
        }
        
        .date-scroller > button {
          scroll-snap-align: center;
          scroll-snap-stop: always;
          flex: 0 0 auto;
        }
        
        /* Better touch feedback */
        @media (hover: none) {
          .date-scroller > button:active {
            transform: scale(0.97);
          }
          
          /* Improve scroll performance on touch devices */
          .date-scroller {
            touch-action: pan-x;
            -webkit-user-select: none;
            user-select: none;
          }
        }
        
        /* Date scroller fade edges for UX cue */
        .date-scroller-container {
          position: relative;
          overflow: hidden;
        }
        
        .date-scroller-fade-left,
        .date-scroller-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 8vw;
          pointer-events: none;
          z-index: 10;
        }
        
        .date-scroller-fade-left {
          left: 0;
          background: linear-gradient(to right, rgba(255,255,255,1) 20%, rgba(255,255,255,0) 100%);
        }
        
        .date-scroller-fade-right {
          right: 0;
          background: linear-gradient(to left, rgba(255,255,255,1) 20%, rgba(255,255,255,0) 100%);
        }
        
        /* Time slot section styling */
        .time-slot-section {
          margin-bottom: 1.5rem;
          padding: 0.5rem 0;
        }
        
        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          min-height: 5rem; /* Ensure grid has minimum height to be scrollable */
        }
        
        @media (min-width: 640px) {
          .time-slots-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
          }
        }
        
        @media (min-width: 768px) {
          .time-slots-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
        }
        
        .time-slot-button {
          position: relative;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 300ms;
          touch-action: manipulation;
          /* Improve touch area */
          min-height: 48px;
        }
        
        .time-slot-selected {
          background-image: linear-gradient(to right, rgb(139, 92, 158), rgb(122, 75, 141));
          color: white;
          font-weight: 500;
          box-shadow: 0 4px 6px -1px rgba(139, 92, 158, 0.2);
        }
        
        .time-slot-unselected {
          border: 1px solid rgb(229, 231, 235);
          color: rgb(31, 41, 55);
        }
        
        .time-slot-unselected:hover {
          border-color: rgba(139, 92, 158, 0.3);
          background-color: rgb(249, 245, 255);
        }
        
        /* Active state for touch screens */
        @media (hover: none) {
          .time-slot-button:active {
            transform: scale(0.97);
          }
        }
      `}</style>
    </div>
  );
};

export default DateTimeSelection;
