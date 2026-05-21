import { Employee, DayType, Holiday } from './types';

// Helper to format date as YYYY-MM-DD using LOCAL time, not UTC
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Check if a date matches a holiday
export const getHolidayName = (date: Date, holidays: Holiday[]): string | undefined => {
  const dateKey = formatDateKey(date); // YYYY-MM-DD
  const monthDay = dateKey.substring(5); // MM-DD

  const holiday = holidays.find(h => h.date === dateKey || h.date === monthDay);
  return holiday?.name;
};

// Core Logic: Determine shift status
export const getShiftStatus = (targetDate: Date, employee: Employee): DayType => {
  const startDate = parseDateKey(employee.startDate);

  // Reset time parts for accurate day diff ensuring we compare local dates at midnight
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const oneDay = 24 * 60 * 60 * 1000;
  // Calculate difference in milliseconds and round to handle potential DST shifts
  const diffDays = Math.round((target.getTime() - start.getTime()) / oneDay);

  const cycleLength = employee.pattern.daysOn + employee.pattern.daysOff;

  // Python-style modulo for negative numbers handling (if start date is in future relative to target)
  let dayInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength;

  return dayInCycle < employee.pattern.daysOn ? DayType.WORK : DayType.OFF;
};

// Generate calendar days for a specific month view (including padding)
export const generateCalendarDays = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const days: Date[] = [];

  // Add padding days from previous month
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  for (let i = startDayOfWeek; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  // Add actual days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add padding days for next month to complete the grid (optional, but good for alignment)
  const remainingSlots = 42 - days.length; // 6 rows * 7 cols
  for (let i = 1; i <= remainingSlots; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

// Native Haptic Feedback
export const triggerHaptic = () => {
  // Check if browser supports vibration
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    // Small vibration for UI feedback (10ms)
    navigator.vibrate(10);
  }
};