import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  parse, 
  format, 
  addMinutes, 
  isBefore, 
  isAfter, 
  setHours, 
  setMinutes, 
  isToday, 
  startOfToday, 
  startOfDay, 
  endOfDay,
  addDays,
  getDay,
  isValid
} from 'date-fns';
import { convertToIST, formatISTDate, isSameDayInIST } from '@/lib/dateUtils';

const DEFAULT_CHECK_RANGE_DAYS = 30;

// Helper utility to check IST midnight transitions
function getISTDateRange(date: Date) {
  // Convert to IST for consistent date handling
  const istDate = convertToIST(date);
  
  // Create a date at midnight IST on the specified date
  const midnightIST = new Date(
    istDate.getFullYear(),
    istDate.getMonth(),
    istDate.getDate(),
    0, 0, 0, 0
  );
  
  // Get UTC equivalents for database queries (convert back to UTC)
  const startUTC = new Date(midnightIST.getTime() - 5.5 * 60 * 60 * 1000); // 5.5 hours earlier
  const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
  
  return { startUTC, endUTC, istDate };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const doctorIdParam = url.searchParams.get('doctorId');
    const dateParam = url.searchParams.get('date');

    const doctorId = doctorIdParam;

    if (!doctorId) {
      return NextResponse.json({ disabledDates: null, error: 'Doctor ID is required' }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { name: true }
    });

    if (!doctor) {
      return NextResponse.json({ disabledDates: null, error: 'Doctor not found' }, { status: 404 });
    }

    // --- General Disable Calculations ---
    // 1. Get working days for the doctor
    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: doctorId
      },
      select: {
        dayOfWeek: true,
        isActive: true
      }
    });

    // Create a Set of active working days
    const workingDays = new Set(
      schedules
        .filter(s => s.isActive)
        .map(s => s.dayOfWeek)
    );
    console.log(`[Available Slots API] Doctor works on days:`, Array.from(workingDays));

    // 2. Get blocked dates from SpecialDate
    const specialDates = await prisma.specialDate.findMany({
      where: {
        OR: [
          { doctorId: null }, // Global blocks
          { doctorId: doctorId } // Doctor-specific blocks
        ],
        type: {
          in: ['BLOCKED', 'UNAVAILABLE']
        }
      },
      select: {
        date: true,
        type: true,
        doctorId: true
      }
    });

    const blockedDateStrings = new Set(
      specialDates.map((d) => {
        try {
          // Format the date in IST timezone
          return formatISTDate(d.date);
        } catch (e) {
          console.error("[Available Slots API] Error formatting special date:", d.date, e);
          return null;
        }
      }).filter((d): d is string => d !== null)
    );
    console.log(`[Available Slots API] Blocked date strings (SpecialDate) in IST:`, Array.from(blockedDateStrings));

    // 3. Calculate disabled dates within a range
    const disabledDates: string[] = [];
    const today = startOfToday();
    const rangeEnd = addDays(today, DEFAULT_CHECK_RANGE_DAYS);

    for (let day = today; isBefore(day, rangeEnd); day = addDays(day, 1)) {
      const dayOfWeek = getDay(day); // date-fns getDay() is 0=Sun
      const dateString = formatISTDate(day);
      let isDisabled = false;
      let reason = '';

      // Check 1: Is it a non-working day?
      if (!workingDays.has(dayOfWeek)) {
        isDisabled = true;
        reason = 'Non-working day';
      }
      // Check 2: Is it a globally or specifically blocked date?
      else if (blockedDateStrings.has(dateString)) {
        isDisabled = true;
        reason = 'Blocked (Special Date)';
      }

      if (isDisabled) {
        disabledDates.push(dateString);
      }
    }
      
    console.log(`[Available Slots API] Calculated future disabled dates in IST:`, disabledDates);

    // Return just the general data if no date is specified
    if (!dateParam) {
      return NextResponse.json({ 
        disabledDates,
        doctorName: doctor.name,
        workingDays: Array.from(workingDays),
      });
    }

    // --- Specific Date Processing ---
    // Parse the specific date for slot generation
    const selectedDate = new Date(dateParam);
    
    // For date debugging
    const { startUTC, endUTC, istDate } = getISTDateRange(selectedDate);
    console.log(`[Available Slots API] Request for specific date: ${dateParam}`, {
      originalDate: selectedDate,
      istDate: istDate,
      dateInIST: formatISTDate(selectedDate),
      selectedDateStart: startUTC.toISOString(),
      selectedDateEnd: endUTC.toISOString()
    });

    // Extract the dateString for checking (formatted in IST timezone)
    const dateStringForCheck = formatISTDate(selectedDate);

    // Check 1: Is this a generally disabled date?
    if (disabledDates.includes(dateStringForCheck)) {
      console.log(`[Available Slots API] Date ${dateStringForCheck} is generally disabled.`);
      return NextResponse.json({ disabledDates, slots: [] });
    }

    // Check 2: Doctor's schedule active on this day?
    const dayOfWeek = selectedDate.getDay(); // 0-6, Sun-Sat
    
    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: doctorId,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
    });
    if (!schedule) {
      console.log(`[Available Slots API] No active schedule found for doctor ${doctorId} on date ${dateStringForCheck} (IST) (Day ${dayOfWeek}).`);
      return NextResponse.json({ 
        disabledDates, 
        slots: [],
        error: `Doctor is not available on ${format(istDate, 'EEEE')}s (IST)` 
      });
    }

    // Check 3: Is it blocked by a SpecialDate (global or specific)?
    // Use IST date range for Prisma query
    const specialDateOrBlock = await prisma.specialDate.findFirst({
      where: {
        date: {
           gte: startUTC, // UTC midnight start of selected day in IST
           lt: endUTC     // UTC midnight end of selected day in IST
        },
        OR: [
          { doctorId: null },
          { doctorId: doctorId }
        ]
      }
    });
      
    if (specialDateOrBlock) {
      // Convert the date to IST for logging
      const blockDateIST = convertToIST(specialDateOrBlock.date);
      
      // Log the actual date from the database for debugging
      console.log(`[Available Slots API] Found blocking SpecialDate:`, {
        id: specialDateOrBlock.id,
        date: specialDateOrBlock.date.toISOString(),
        dateInIST: blockDateIST.toISOString(),
        name: specialDateOrBlock.name,
        type: specialDateOrBlock.type,
        doctorId: specialDateOrBlock.doctorId
      });
        
      const reason = specialDateOrBlock.doctorId 
                    ? `Doctor unavailable: ${specialDateOrBlock.reason || specialDateOrBlock.name}`
                    : `Clinic unavailable: ${specialDateOrBlock.name} (${specialDateOrBlock.type})`;
      console.log(`[Available Slots API] Block found via SpecialDate: ${reason} on ${dateStringForCheck}`);
      return NextResponse.json({ disabledDates, slots: [] }); 
    }

    console.log(`[Available Slots API] Date ${dateStringForCheck} is valid. Proceeding to generate slots.`);
    
    // --- Generate Slots ---
    console.log("[Available Slots API] Using schedule object:", schedule);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      },
      select: { 
        date: true, 
        time: true 
      }
    });
    
    // Filter for appointments on the requested date using IST comparison
    const sameDataAppointments = existingAppointments.filter(apt => {
      return isSameDayInIST(new Date(apt.date), selectedDate);
    });
    
    // Get set of booked times
    const bookedTimes = new Set(sameDataAppointments.map(apt => apt.time).filter(Boolean));
    console.log(`[Available Slots API] Booked times for ${dateStringForCheck}:`, Array.from(bookedTimes));

    const slots: string[] = [];
    const slotDuration = schedule.slotDuration;
    const bufferTime = schedule.bufferTime; 
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const [breakStartH, breakStartM] = (schedule.breakStart || '').split(':').map(Number);
    const [breakEndH, breakEndM] = (schedule.breakEnd || '').split(':').map(Number);

    console.log("[Available Slots API] Slot Generation Params:", { 
      startH, startM, endH, endM, slotDuration, bufferTime 
    });

    // Create date objects for the selected day
    let currentTime = new Date(selectedDate);
    currentTime.setHours(startH, startM, 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(endH, endM, 0, 0);
    
    console.log("[Available Slots API] Loop Start/End Times:", {
      initialCurrentTime: currentTime.toISOString(),
      loopEndTime: endTime.toISOString()
    });
    
    // Handle break times
    const breakStartTime = schedule.breakStart ? (() => {
      const t = new Date(selectedDate);
      t.setHours(breakStartH, breakStartM, 0, 0);
      return t;
    })() : null;
    
    const breakEndTime = schedule.breakEnd ? (() => {
      const t = new Date(selectedDate);
      t.setHours(breakEndH, breakEndM, 0, 0);
      return t;
    })() : null;

    // Total minutes for each slot cycle (work + buffer)
    const totalSlotTime = slotDuration + bufferTime; 
    const now = new Date(); // Get current time for past check

    while (isBefore(currentTime, endTime)) {
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      console.log(`[Available Slots API] Loop Iteration: Checking timeStr = ${timeStr}`);
      let isAvailable = true;
      let skipReason = '';

      // Check 1: Is the start time of the slot in the past (if date is today)?
      if (isToday(selectedDate) && isBefore(currentTime, now)) {
          isAvailable = false;
          skipReason = 'Slot is in the past';
      }
      // Check 2: Is it during break time? 
      else if (breakStartTime && breakEndTime && 
                isAfter(currentTime, breakStartTime) && 
                isBefore(currentTime, breakEndTime)) {
          isAvailable = false;
          skipReason = 'Starts during break';
      }
      // Check 3: Is this exact time slot already booked?
      else if (bookedTimes.has(timeStr)) {
          isAvailable = false;
          skipReason = 'Already booked';
      }

      if (isAvailable) {
        slots.push(timeStr);
      } else {
        console.log(`[Available Slots API] Skipping slot ${timeStr}: ${skipReason}`);
      }

      // Move to the start of the next potential slot
      currentTime = addMinutes(currentTime, totalSlotTime); 
    }

    console.log(`[Available Slots API] Generated ${slots.length} slots for ${dateStringForCheck}`);
    if (slots.length === 0) {
      console.log(`[Available Slots API] WARNING: No slots generated! Schedule:`, schedule);
    }
    
    return NextResponse.json({ disabledDates, slots });

  } catch (error) {
    console.error('[Available Slots API] Error:', error);
    // Avoid exposing internal error details unless necessary
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
} 