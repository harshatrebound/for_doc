import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface UseTimeSlotsOptions {
  doctorId: string;
  date: Date | null;
  onError?: (error: Error) => void;
}

interface CacheEntry {
  slots: string[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const slotsCache = new Map<string, CacheEntry>();

export const useTimeSlots = ({ doctorId, date, onError }: UseTimeSlotsOptions) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cacheKey = `${doctorId}-${format(date, 'yyyy-MM-dd')}`;
        const cached = slotsCache.get(cacheKey);

        // Check cache
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setSlots(cached.slots);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `/api/available-slots?doctorId=${encodeURIComponent(doctorId)}&date=${format(date, 'yyyy-MM-dd')}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();
        
        // Update cache
        slotsCache.set(cacheKey, {
          slots: data.slots,
          timestamp: Date.now()
        });

        setSlots(data.slots);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch slots');
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, date, onError]);

  return {
    slots,
    isLoading,
    error,
    refetch: () => {
      // Clear cache and refetch
      if (doctorId && date) {
        const cacheKey = `${doctorId}-${format(date, 'yyyy-MM-dd')}`;
        slotsCache.delete(cacheKey);
      }
    }
  };
}; 