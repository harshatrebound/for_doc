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