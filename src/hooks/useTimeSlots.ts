'use client';

import { useState, useEffect } from 'react';
import { formatISTDate } from '@/lib/dateUtils';

interface TimeSlotsProps {
  doctorId: string;
  date: Date | null;
  onError?: (error: Error) => void;
}

export function useTimeSlots({ doctorId, date, onError }: TimeSlotsProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSlots = async () => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format the date in IST timezone for consistent handling
      const dateStr = formatISTDate(date);
      console.log(`[useTimeSlots] Fetching slots for doctor ${doctorId} on date ${dateStr} (IST)`);
      
      const response = await fetch(`/api/available-slots?doctorId=${doctorId}&date=${date.toISOString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available time slots: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSlots(data.slots || []);
      console.log(`[useTimeSlots] Received ${data.slots?.length || 0} slots for ${dateStr} (IST)`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching time slots');
      console.error('[useTimeSlots] Error:', error);
      setError(error);
      setSlots([]);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [doctorId, date]);

  return {
    slots,
    isLoading,
    error,
    refetch: fetchSlots
  };
} 