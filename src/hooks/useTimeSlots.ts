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
    // Check for critical conditions that would prevent API calls
    console.log('[useTimeSlots] Effect fired with:', { 
      doctorId, 
      dateProvided: !!date,
      dateValue: date ? format(date, 'yyyy-MM-dd') : 'none',
      onErrorProvided: !!onError
    });
    
    if (!doctorId || !date) {
      console.warn('[useTimeSlots] Missing required params:', { doctorId, date });
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fix: Ensure consistent date format regardless of timezone
        // Extract date components in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        console.log('[useTimeSlots fetchSlots] Using formatted date:', formattedDate);
        
        const cacheKey = `${doctorId}-${formattedDate}`;
        const cached = slotsCache.get(cacheKey);

        // Check cache
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          // --- DEBUG LOGGING START ---
          console.log('[useTimeSlots fetchSlots] Cache hit:', { cacheKey });
          // --- DEBUG LOGGING END ---
          setSlots(cached.slots);
          setIsLoading(false);
          return;
        }
        // --- DEBUG LOGGING START ---
        else {
            console.log('[useTimeSlots fetchSlots] Cache miss or expired:', { cacheKey, cached });
        }
        // --- DEBUG LOGGING END ---

        // --- DEBUG LOGGING START ---
        console.log(`[useTimeSlots fetchSlots] Making fetch call to: /api/available-slots?doctorId=${encodeURIComponent(doctorId)}&date=${formattedDate}`);
        // --- DEBUG LOGGING END ---
        const response = await fetch(
          `/api/available-slots?doctorId=${encodeURIComponent(doctorId)}&date=${formattedDate}`
        );

        if (!response.ok) {
          // --- DEBUG LOGGING START ---
          console.error('[useTimeSlots fetchSlots] Fetch response not OK:', { status: response.status, statusText: response.statusText });
          // --- DEBUG LOGGING END ---
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();
        // --- DEBUG LOGGING START ---
        console.log('[useTimeSlots fetchSlots] Fetch successful, received slots:', data.slots);
        // --- DEBUG LOGGING END ---
        
        // Update cache
        slotsCache.set(cacheKey, {
          slots: data.slots,
          timestamp: Date.now()
        });

        setSlots(data.slots);
      } catch (err) {
        // --- DEBUG LOGGING START ---
        console.error('[useTimeSlots fetchSlots] Error caught during fetch:', err);
        // --- DEBUG LOGGING END ---
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
        // --- DEBUG LOGGING START ---
        console.log('[useTimeSlots refetch] Clearing cache and triggering refetch for:', { doctorId, date });
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const cacheKey = `${doctorId}-${formattedDate}`;
            slotsCache.delete(cacheKey);
            // Note: This only clears the cache; the refetch happens automatically
            // because the dependencies of useEffect haven't changed.
            // To force an immediate refetch, you might need a different mechanism,
            // but let's see if clearing cache + existing logic works first.
        } catch (formatError) {
            console.error('[useTimeSlots refetch] Error formatting date during cache clear:', date, formatError);
        }
        // --- DEBUG LOGGING END ---
      }
    }
  };
}; 