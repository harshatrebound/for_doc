'use client';

import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { format, startOfDay, isBefore, isToday, isAfter, parse, getHours, getMinutes, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, Sun, Cloud, Moon } from 'lucide-react';
import { fetchSpecialDates, fetchDoctorSchedule } from '@/app/actions/admin';
import type { DateTimeSelectionProps, Doctor, DoctorSchedule, SpecialDate } from '@/types/booking';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useBookingForm } from '@/contexts/BookingFormContext';
import { MobileSheet } from '@/components/ui/MobileSheet';
import { cn } from '@/lib/utils';
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import type { DayPickerSingleProps } from 'react-day-picker';
import { toast } from 'react-hot-toast';

interface TimeSlotDisplay {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  label: string;
}

const categorizeTimes = (slots: string[]): TimeSlotDisplay[] => {
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
  const { doctor, selectedDate } = state;
  const doctorId = doctor?.id;

  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [globalBlockedDates, setGlobalBlockedDates] = useState<string[]>([]);
  const [doctorBlockedDates, setDoctorBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    if (!doctor) {
       console.warn("[DateTimeSelection] No doctor selected for this step!");
    }
  }, [doctor]);

  useEffect(() => {
    const loadAvailabilityData = async () => {
      if (!doctorId) { 
        console.log('[DateTimeSelection] No doctorId, skipping data fetch.');
        setSchedule([]);
        setDoctorBlockedDates([]);
        setGlobalBlockedDates([]);
        setIsLoadingData(false);
        return;
      }
      
      console.log(`[DateTimeSelection] Fetching data for doctorId: ${doctorId}`);
      setIsLoadingData(true);
      try {
        const [scheduleResult, globalDatesResult, doctorDatesResult] = await Promise.all([
          fetchDoctorSchedule(doctorId),
          fetchSpecialDates(),
          fetchSpecialDates(doctorId)
        ]);

        if (scheduleResult.success && scheduleResult.data) {
          setSchedule(scheduleResult.data);
          console.log('[DateTimeSelection] Fetched schedule:', scheduleResult.data);
                } else {
          console.error("Failed to fetch schedule:", scheduleResult.error);
          setSchedule([]);
        }

        if (globalDatesResult.success && globalDatesResult.data) {
           const blocked = globalDatesResult.data
            .filter((d: SpecialDate) => d.type === 'BLOCKED' || d.type === 'UNAVAILABLE')
            .map((d: SpecialDate) => format(new Date(d.date), 'yyyy-MM-dd'))
            .filter((d): d is string => d !== null);
          setGlobalBlockedDates(blocked);
          console.log('[DateTimeSelection] Processed global blocked dates:', blocked);
        } else {
          console.error("Failed to fetch global special dates:", globalDatesResult.error);
          setGlobalBlockedDates([]);
        }

        if (doctorDatesResult.success && doctorDatesResult.data) {
           const blocked = doctorDatesResult.data
             .filter((d: SpecialDate) => d.type === 'BLOCKED' || d.type === 'UNAVAILABLE')
             .map((d: SpecialDate) => format(new Date(d.date), 'yyyy-MM-dd'))
             .filter((d): d is string => d !== null);
          setDoctorBlockedDates(blocked);
           console.log(`[DateTimeSelection] Processed blocked dates for doctor ${doctorId}:`, blocked);
        } else {
          console.error(`Failed to fetch special dates for doctor ${doctorId}:`, doctorDatesResult.error);
          setDoctorBlockedDates([]);
        }

      } catch (error) {
        console.error("[DateTimeSelection] Error fetching availability data:", error);
        setSchedule([]);
        setGlobalBlockedDates([]);
        setDoctorBlockedDates([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAvailabilityData();
  }, [doctorId]);

  const isDateDisabled = useCallback((date: Date): boolean => {
    const today = startOfDay(new Date());
    const dateToCheck = startOfDay(date);

    if (isBefore(dateToCheck, today)) {
      return true;
    }

    const dayOfWeek = dateToCheck.getDay();
    const isWorkingDay = schedule.some(s => s.dayOfWeek === dayOfWeek && s.isActive);
    if (!isWorkingDay) {
        return true;
    }

    const dateString = format(dateToCheck, 'yyyy-MM-dd');
    const isGlobalBlock = globalBlockedDates.includes(dateString);
    if (isGlobalBlock) {
        return true;
    }

    const isDoctorBlock = doctorBlockedDates.includes(dateString);
    if (isDoctorBlock) {
        return true;
    }
    
    return false;
  }, [schedule, globalBlockedDates, doctorBlockedDates]);

  const handleTimeSlotError = useCallback((error: Error) => {
    dispatch({
      type: 'SET_ERROR',
      payload: { field: 'timeSlots', message: error.message }
    });
  }, [dispatch]);

  const { slots, isLoading: isLoadingSlots, error: timeSlotError, refetch } = useTimeSlots({
    doctorId: doctorId || '',
    date: selectedDate,
    onError: handleTimeSlotError,
  });
    
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;

    if (isDateDisabled(date)) {
        console.warn("[handleDateSelect] Attempted to select a disabled date:", date);
        return;
    }

    const normalizedDate = startOfDay(date);
    console.log(`[handleDateSelect] Selected date: ${format(normalizedDate, 'yyyy-MM-dd')}`);
    dispatch({ type: 'SET_DATE', payload: normalizedDate });
    setShowTimeSheet(true);
  }, [dispatch, isDateDisabled]);

  const handleTimeSelect = (time: string) => {
    dispatch({ type: 'SET_TIME', payload: time });
    setShowTimeSheet(false);
  };

  const categorizedSlots = useMemo(() => {
    if (!slots) return [];

    let displayableSlots = slots;

    if (selectedDate && isToday(selectedDate)) {
      const now = new Date();
      displayableSlots = slots.filter(slot => {
        const [hourStr, minuteStr] = slot.split(':');
        const slotHour = parseInt(hourStr, 10);
        const slotMinute = parseInt(minuteStr, 10);
        
        // Create a date object for the slot on the selected (today's) date
        const slotDateTime = setMinutes(setHours(startOfDay(selectedDate), slotHour), slotMinute);
        
        return isAfter(slotDateTime, now);
      });
    }
    
    return categorizeTimes(displayableSlots);
  }, [slots, selectedDate]);

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#8B5C9E] animate-spin" />
        <p className="mt-4 text-gray-600">Loading doctor's availability...</p>
      </div>
    );
  }

  const TimeSlotSection = ({ title, icon, slots: timeSlots }: {
    title: string; 
    icon: ReactNode;
    slots: TimeSlotDisplay[];
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        {icon}
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
         {timeSlots.map(({ time, label }) => (
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
            {doctor ? `For ${doctor.name}` : 'Choose your preferred appointment slot'}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Date</h3>
        <ShadcnCalendar
          mode="single"
            selected={selectedDate ?? undefined}
            onSelect={handleDateSelect}
          disabled={isDateDisabled}
          className="rounded-md border p-0 mx-auto w-full max-w-md shadow-sm bg-white"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-gray-700",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              "text-gray-600 hover:text-[#8B5C9E]"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex justify-around",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2 justify-around",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#8B5C9E]/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
              "hover:bg-[#8B5C9E]/10 rounded-md",
                  "transition-colors duration-150",
                  "disabled:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            ),
            day_selected: "bg-[#8B5C9E] text-white hover:bg-[#8B5C9E] hover:text-white focus:bg-[#8B5C9E] focus:text-white",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </div>

       {selectedDate && (
        <div 
           onClick={() => !isLoadingSlots && slots && slots.length > 0 && setShowTimeSheet(true)}
          className={cn(
             'p-4 bg-gray-50 rounded-xl transition-colors',
             slots && slots.length > 0 ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default',
             'focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
        >
          <p className="text-sm text-gray-600">
             Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')} <span className="text-xs bg-gray-100 px-1 rounded">IST</span>
             {state.selectedTime ? ` at ${state.selectedTime}` : (slots && slots.length === 0 && !isLoadingSlots) ? ' - No slots available' : ''}
          </p>
        </div>
      )}

      <MobileSheet
        isOpen={showTimeSheet}
        onClose={() => setShowTimeSheet(false)}
         title={`Select Time - ${selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''} (IST)`}
      >
        <div className="space-y-6 p-4">
          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
           ) : timeSlotError ? (
            <div className="text-center py-8 text-red-500">
               {timeSlotError.message || 'Failed to load time slots'}
            </div>
          ) : categorizedSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available time slots for this date
            </div>
          ) : (
            <div className="space-y-6">
              {categorizedSlots.some(slot => slot.period === 'morning') && (
                <TimeSlotSection
                  title="Morning"
                  icon={<Sun className="w-5 h-5 text-amber-500" />}
                  slots={categorizedSlots.filter(slot => slot.period === 'morning')}
                />
              )}
              {categorizedSlots.some(slot => slot.period === 'afternoon') && (
                <TimeSlotSection
                  title="Afternoon"
                  icon={<Cloud className="w-5 h-5 text-blue-500" />}
                  slots={categorizedSlots.filter(slot => slot.period === 'afternoon')}
                />
              )}
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