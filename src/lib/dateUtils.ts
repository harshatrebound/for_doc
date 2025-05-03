// Create a new utility file for consistent date handling

// Format a Date object to YYYY-MM-DD string, preserving the actual day regardless of timezone
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse a YYYY-MM-DD string to a Date at midnight local time
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

// Check if a date should be disabled (for calendar date picking)
export function isDateDisabled(
  date: Date, 
  globalBlockedDates: string[], 
  doctorBlockedDates: string[]
): boolean {
  const dateString = formatLocalDate(date);
  const today = new Date();
  const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return (
    isPast || 
    globalBlockedDates.includes(dateString) || 
    doctorBlockedDates.includes(dateString)
  );
}

// IST timezone offset in minutes
export const IST_OFFSET_MINUTES = 330; // UTC+5:30 = 5*60 + 30 = 330 minutes

/**
 * Converts a UTC date to IST (Indian Standard Time)
 */
export function convertToIST(date: Date): Date {
  const utcDate = new Date(date);
  const istDate = new Date(utcDate.getTime() + IST_OFFSET_MINUTES * 60000);
  return istDate;
}

/**
 * Converts an IST date to UTC
 */
export function convertToUTC(istDate: Date): Date {
  const utcDate = new Date(istDate.getTime() - IST_OFFSET_MINUTES * 60000);
  return utcDate;
}

/**
 * Formats a date in YYYY-MM-DD format in IST timezone
 */
export function formatISTDate(date: Date): string {
  const istDate = convertToIST(date);
  return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}`;
}

/**
 * Compares two dates based on their calendar day in IST timezone
 * regardless of their time components
 */
export function isSameDayInIST(date1: Date, date2: Date): boolean {
  const ist1 = convertToIST(date1);
  const ist2 = convertToIST(date2);
  
  return (
    ist1.getFullYear() === ist2.getFullYear() &&
    ist1.getMonth() === ist2.getMonth() &&
    ist1.getDate() === ist2.getDate()
  );
} 