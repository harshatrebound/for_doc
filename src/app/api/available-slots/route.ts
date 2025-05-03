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

const DEFAULT_CHECK_RANGE_DAYS = 60; // Check availability for the next 60 days

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const dateParam = searchParams.get('date'); // Make date optional

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // --- Scenario 1: Date parameter IS NOT provided - Return disabled dates ---
    if (!dateParam) {
      console.log(`[Available Slots API] No date provided for doctor ${doctorId}. Calculating disabled dates.`);
      
      // 1. Get Doctor's active working days
      const doctorSchedules = await prisma.doctorSchedule.findMany({
        where: { doctorId: doctorId, isActive: true },
        select: { dayOfWeek: true },
      });
      const workingDays = new Set(doctorSchedules.map((s: { dayOfWeek: number }) => s.dayOfWeek));
      console.log(`[Available Slots API] Doctor working days (0=Sun):`, Array.from(workingDays));

      // 2. Get all relevant Special Dates (global and doctor-specific)
      const specialDates = await prisma.specialDate.findMany({
        where: {
          OR: [
            { doctorId: null },
            { doctorId: doctorId }
          ]
        }
      });
      // Define type for SpecialDate object expected from Prisma
      type SpecialDateFromPrisma = { id: string; date: Date; name: string; type: string; reason: string | null; doctorId: string | null; createdAt: Date; updatedAt: Date; };
      const blockedDateStrings = new Set(
        specialDates.map((d: SpecialDateFromPrisma) => { // Add type for d
          try {
            // Ensure date is treated as UTC before formatting
            const utcDate = new Date(d.date.getUTCFullYear(), d.date.getUTCMonth(), d.date.getUTCDate());
            return format(utcDate, 'yyyy-MM-dd');
          } catch (e) {
            console.error("[Available Slots API] Error formatting special date:", d.date, e);
            return null;
          }
        }).filter((d: string | null): d is string => d !== null)
      );
      console.log(`[Available Slots API] Blocked date strings (SpecialDate):`, Array.from(blockedDateStrings));

      // 3. Calculate disabled dates within a range
      const disabledDates: string[] = [];
      const today = startOfToday();
      const rangeEnd = addDays(today, DEFAULT_CHECK_RANGE_DAYS);

      for (let day = today; isBefore(day, rangeEnd); day = addDays(day, 1)) {
        const dayOfWeek = getDay(day); // date-fns getDay() is 0=Sun
        const dateString = format(day, 'yyyy-MM-dd');
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
          // console.log(`[Available Slots API] Disabling date ${dateString}: ${reason}`);
          disabledDates.push(dateString);
        }
      }
      
      // Also include past dates implicitly by not checking them on frontend, 
      // but frontend needs the explicit list of *future* disabled dates.

      console.log(`[Available Slots API] Calculated future disabled dates:`, disabledDates);
      return NextResponse.json({ disabledDates, slots: null });
    }

    // --- Scenario 2: Date parameter IS provided - Return slots for that specific date ---
    else {
      console.log(`[Available Slots API] Date ${dateParam} provided for doctor ${doctorId}. Checking specific date availability.`);
      let selectedDateStart: Date;
      try {
        // Fix: Use UTC date creation to avoid timezone shifting
        const [year, month, day] = dateParam.split('-').map(Number);
        
        // Create a UTC midnight date to ensure consistent day handling
        selectedDateStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        
        if (!isValid(selectedDateStart)) throw new Error('Invalid date format');
        console.log(`[Available Slots API] Parsed date using UTC: ${dateParam} → ${selectedDateStart.toISOString()}`);
      } catch (e) {
         return NextResponse.json({ error: 'Invalid date parameter format. Use YYYY-MM-DD.' }, { status: 400 });
      }
      
      // Create selectedDateEnd as UTC end of day
      const selectedDateEnd = new Date(selectedDateStart);
      selectedDateEnd.setUTCHours(23, 59, 59, 999);
      
      const dateStringForCheck = format(selectedDateStart, 'yyyy-MM-dd'); // For logging/sets
      console.log(`[Available Slots API] Date range for check: ${selectedDateStart.toISOString()} to ${selectedDateEnd.toISOString()}`);

      // --- Re-check if the SPECIFIC date is disabled ---
      
      // Check 1: Is it in the past?
      if (isBefore(selectedDateStart, startOfToday())) {
        console.log(`[Available Slots API] Date ${dateStringForCheck} is in the past.`);
        return NextResponse.json({ disabledDates: null, slots: [] }); 
      }

      // Check 2: Is it a non-working day for the doctor?
      const dayOfWeek = getDay(selectedDateStart);
      const schedule = await prisma.doctorSchedule.findFirst({
        where: {
          doctorId: doctorId,
          dayOfWeek: dayOfWeek,
          isActive: true,
        },
      });
      if (!schedule) {
        console.log(`[Available Slots API] No active schedule found for doctor ${doctorId} on date ${dateStringForCheck} (Day ${dayOfWeek}).`);
        return NextResponse.json({ disabledDates: null, slots: [] });
      }

      // Check 3: Is it blocked by a SpecialDate (global or specific)?
      // Fix: Use UTC date range for Prisma query
      const specialDateOrBlock = await prisma.specialDate.findFirst({
        where: {
          date: {
             gte: selectedDateStart, // UTC midnight start of selected day
             lt: selectedDateEnd     // UTC midnight end of selected day
          },
          OR: [
            { doctorId: null },
            { doctorId: doctorId }
          ]
        }
      });
      
      if (specialDateOrBlock) {
        // Log the actual date from the database for debugging
        console.log(`[Available Slots API] Found blocking SpecialDate:`, {
          id: specialDateOrBlock.id,
          date: specialDateOrBlock.date.toISOString(),
          name: specialDateOrBlock.name,
          type: specialDateOrBlock.type,
          doctorId: specialDateOrBlock.doctorId
        });
        
        const reason = specialDateOrBlock.doctorId 
                       ? `Doctor unavailable: ${specialDateOrBlock.reason || specialDateOrBlock.name}`
                       : `Clinic unavailable: ${specialDateOrBlock.name} (${specialDateOrBlock.type})`;
        console.log(`[Available Slots API] Block found via SpecialDate: ${reason} on ${dateStringForCheck}`);
        return NextResponse.json({ disabledDates: null, slots: [] }); 
      }

      console.log(`[Available Slots API] Date ${dateStringForCheck} is valid. Proceeding to generate slots.`);
      // --- End Specific Date Disable Check ---

      // --- Generate Slots (Existing Logic, adapted) ---
      console.log("[Available Slots API] Using schedule object:", schedule);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId: doctorId,
          // Ensure we use the exact same UTC date
          date: selectedDateStart, 
        },
        select: { time: true }, // Only select the time
      });
      // Define type for Appointment object fragment expected from Prisma
      type AppointmentTimeFragment = { time: string | null };
      // Filter out null/empty times just in case
      const bookedTimes = new Set(existingAppointments.map((apt: AppointmentTimeFragment) => apt.time).filter(Boolean));
      console.log(`[Available Slots API] Booked times for ${dateStringForCheck}:`, Array.from(bookedTimes));

      const slots: string[] = [];
      const slotDuration = schedule.slotDuration;
      const bufferTime = schedule.bufferTime; // Already included in DoctorSchedule model
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const [breakStartH, breakStartM] = (schedule.breakStart || '').split(':').map(Number);
      const [breakEndH, breakEndM] = (schedule.breakEnd || '').split(':').map(Number);

      // ADD DEBUG LOGS HERE
      console.log("[Available Slots API] Slot Generation Params:", { startH, startM, endH, endM, slotDuration, bufferTime });

      // Fix: Use setUTCHours to avoid timezone shifting
      let currentTime = new Date(selectedDateStart);
      currentTime.setUTCHours(startH, startM, 0, 0);
      
      const endTime = new Date(selectedDateStart);
      endTime.setUTCHours(endH, endM, 0, 0);
      
      // ADD DEBUG LOGS HERE
      console.log("[Available Slots API] Loop Start/End Times (UTC):", {
        initialCurrentTime: currentTime.toISOString(),
        loopEndTime: endTime.toISOString()
      });
      
      // Handle break times properly in UTC
      const breakStartTime = schedule.breakStart ? (() => {
        const t = new Date(selectedDateStart);
        t.setUTCHours(breakStartH, breakStartM, 0, 0);
        return t;
      })() : null;
      
      const breakEndTime = schedule.breakEnd ? (() => {
        const t = new Date(selectedDateStart);
        t.setUTCHours(breakEndH, breakEndM, 0, 0);
        return t;
      })() : null;

      // Total minutes for each slot cycle (work + buffer)
      const totalSlotTime = slotDuration + bufferTime; 
      const now = new Date(); // Get current time for past check

      while (isBefore(currentTime, endTime)) {
        // Replace date-fns format with direct UTC formatting
        // const timeStr = format(currentTime, 'HH:mm'); 
        const utcHours = String(currentTime.getUTCHours()).padStart(2, '0');
        const utcMinutes = String(currentTime.getUTCMinutes()).padStart(2, '0');
        const timeStr = `${utcHours}:${utcMinutes}`;
        console.log(`[Available Slots API] Loop Iteration: Checking timeStr = ${timeStr} (UTC)`);
        let isAvailable = true;
        let skipReason = '';

        // Check 1: Is the start time of the slot in the past (if date is today)?
        if (isToday(selectedDateStart) && isBefore(currentTime, now)) {
           isAvailable = false;
           skipReason = 'Slot is in the past';
        }
        // Check 2: Is it during break time? 
        // A slot is unavailable if it *starts* during the break.
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
          // console.log(`[Available Slots API] Skipping slot ${timeStr}: ${skipReason}`);
        }

        // Move to the start of the next potential slot
        currentTime = addMinutes(currentTime, totalSlotTime); 
      }

      console.log(`[Available Slots API] Generated ${slots.length} slots for ${dateStringForCheck}`);
      if (slots.length === 0) {
        console.log(`[Available Slots API] WARNING: No slots generated! Schedule:`, schedule);
      }
      return NextResponse.json({ disabledDates: null, slots });
    }

  } catch (error) {
    console.error('[Available Slots API] Error:', error);
    // Avoid exposing internal error details unless necessary
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
} 