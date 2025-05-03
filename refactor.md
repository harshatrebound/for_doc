
Okay, let's take a step back and devise a solid plan to refactor the booking modal system. The goal is to improve robustness, maintainability, data flow efficiency, and address the issues we've encountered (like the fetching problems and potential loops).

Here’s the proposed plan, breaking it down into logical phases:

**Core Principles:**

1.  **Clear Separation of Concerns:** UI components should focus on rendering and user interaction, while data fetching and complex logic reside in dedicated hooks or API handlers.
2.  **Efficient Data Fetching:** Fetch data only when needed. Avoid redundant calls. Provide clear loading states.
3.  **Robust State Management:** Use React Context effectively for shared *booking* state, but avoid triggering unnecessary re-renders. Local component state or dedicated hooks manage transient UI or fetched data states.
4.  **Centralized Availability Logic:** Have a single source of truth for determining which dates are disabled and which time slots are available.

---

**Refactoring Plan:**

**Phase 1: Enhance Backend Availability Logic**

*   **Goal:** Create a more comprehensive backend endpoint to provide both disabled dates and available time slots efficiently.
*   **Action 1.1:** Modify the existing `/api/available-slots` route handler (`src/app/api/available-slots/route.ts`).
    *   It should *always* require `doctorId`.
    *   Make the `date` query parameter *optional*.
    *   **If `date` is NOT provided:**
        *   Query `DoctorSchedule` to find the general working days for the `doctorId`.
        *   Query `SpecialDate` for *all* relevant entries (global `doctorId IS NULL` OR specific `doctorId`).
        *   Calculate a list of `disabledDates` (past dates, non-working days based on schedule, global block dates, doctor-specific block dates).
        *   Return a JSON response like: `{ disabledDates: ["YYYY-MM-DD", ...], slots: null }`.
    *   **If `date` IS provided:**
        *   Perform the *exact* same checks as above to ensure the *specific* date isn't disabled (schedule, global block, doctor block). If it is, return `{ disabledDates: null, slots: [] }`.
        *   If the date is valid, proceed with the *existing* logic: query existing appointments, calculate slots based on schedule/breaks/buffer, and return `{ disabledDates: null, slots: ["HH:mm", ...] }`.
*   **Benefit:** The frontend can make one call to get disabled dates initially, and then subsequent calls for specific dates to get slots, reducing complexity in the frontend fetching logic. The backend becomes the single source of truth for availability rules.

**Phase 2: Create a Dedicated Availability Hook**

*   **Goal:** Encapsulate all frontend logic related to fetching and managing availability data for a selected doctor.
*   **Action 2.1:** Create a new hook: `src/hooks/useDoctorAvailability.ts`.
    *   Input: `doctorId: string | null`.
    *   Internal State: Manages `disabledDates: string[]`, `availableSlots: string[]`, `isLoadingDates: boolean`, `isLoadingSlots: boolean`, `error: Error | null`.
    *   `useEffect` (dependency: `doctorId`):
        *   If `doctorId` is null, reset all states.
        *   If `doctorId` is valid, set `isLoadingDates` to true.
        *   Call the enhanced `/api/available-slots?doctorId=...` endpoint (without the `date` parameter).
        *   On success, store the fetched `disabledDates`, set `isLoadingDates` to false.
        *   On error, set `error`, set `isLoadingDates` to false.
    *   Provides a Function: `fetchTimeSlots(date: Date)`:
        *   Takes a specific date.
        *   Sets `isLoadingSlots` to true.
        *   Calls the enhanced `/api/available-slots?doctorId=...&date=YYYY-MM-DD`.
        *   On success, stores the fetched `slots`.
        *   On error, sets `error`.
        *   Finally, sets `isLoadingSlots` to false.
    *   Return Value: `{ disabledDates, availableSlots, fetchTimeSlots, isLoadingDates, isLoadingSlots, error }`.
*   **Action 2.2:** Remove the old `useTimeSlots` hook (`src/hooks/useTimeSlots.ts`).
*   **Benefit:** Consolidates all availability fetching logic, separates it from UI components, provides clear loading/error states for both initial date disabling and subsequent slot fetching. Fixes the previous hook issues.

**Phase 3: Refactor `DateTimeSelection.tsx`**

*   **Goal:** Simplify the component to primarily handle UI and interactions, relying on the new hook for data.
*   **Action 3.1:** Remove all internal `useState` and `useEffect` calls related to fetching schedules, global blocked dates, and doctor blocked dates.
*   **Action 3.2:** Get the `doctorId` from the `useBookingForm` context state.
*   **Action 3.3:** Call the new `useDoctorAvailability(doctorId)` hook.
*   **Action 3.4:** Use `disabledDates` from the hook to configure the `ShadcnCalendar`'s `disabled` prop. Handle the `isLoadingDates` state with a loader.
*   **Action 3.5:** In the `ShadcnCalendar`'s `onSelect` handler:
    *   If a valid, non-disabled date is selected:
        *   Call `dispatch({ type: 'SET_DATE', payload: date })` to update the main booking context.
        *   Call the `fetchTimeSlots(date)` function from the `useDoctorAvailability` hook.
        *   Open the time selection sheet (`setShowTimeSheet(true)`).
*   **Action 3.6:** Use `availableSlots`, `isLoadingSlots`, and `error` from the hook to render the time selection UI (inside the `MobileSheet`).
*   **Action 3.7:** Keep the `handleTimeSelect` function to `dispatch({ type: 'SET_TIME', payload: time })`.
*   **Benefit:** `DateTimeSelection` becomes much cleaner, focused on presentation and interaction orchestration. Availability logic is fully delegated.

**Phase 4: Review Context and Other Components**

*   **Goal:** Ensure the `BookingFormContext` is clean and other steps integrate correctly.
*   **Action 4.1:** Verify `BookingFormContext` (`src/contexts/BookingFormContext.tsx`) only contains essential shared state for the *final booking* (selected doctor object, selected date object, selected time string, patient details, step, submitting flag, maybe a top-level error). Remove any state that should be local or managed by the availability hook.
*   **Action 4.2:** Ensure `DoctorSelection.tsx` correctly fetches doctors (if it does) and dispatches `SET_DOCTOR`.
*   **Action 4.3:** Ensure `PatientDetails.tsx`, `Summary.tsx`, and `ThankYou.tsx` use the context state correctly.
*   **Action 4.4:** Ensure the parent `BookingModal.tsx` correctly manages the dialog lifecycle and step transitions based on context.
*   **Benefit:** Maintains a clean separation of state and ensures smooth integration between steps.

**Phase 5: Testing and Cleanup**

*   **Goal:** Verify functionality and remove old code/logs.
*   **Action 5.1:** Thoroughly test all scenarios:
    *   Selecting different doctors.
    *   Selecting dates (check disabled dates are correct - past, non-scheduled, global blocks, doctor blocks).
    *   Selecting times (check slots are correct, considering breaks, buffer, existing appointments).
    *   Submitting the booking.
    *   Handling errors during any fetch operation.
    *   Closing and reopening the modal (state reset).
*   **Action 5.2:** Remove all the debug `console.log` statements we added previously.
*   **Action 5.3:** Remove the old `useTimeSlots.ts` file.
*   **Benefit:** A clean, functional, and robust booking modal.

---

This plan addresses the scattered data fetching, the problematic hook dependencies, and centralizes the availability logic. It should result in a more reliable and maintainable booking modal experience.
