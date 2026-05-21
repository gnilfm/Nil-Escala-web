export interface ShiftPattern {
  name: string;
  daysOn: number;
  daysOff: number;
}

export interface Employee {
  id: string;
  name: string;
  startDate: string; // ISO Date String YYYY-MM-DD representing the START of a work cycle
  pattern: ShiftPattern;
  colorWork: string;
  colorOff: string;
  textColor?: string; // Color of the text in the calendar
}

export interface Note {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
}

export interface Holiday {
  date: string; // MM-DD (recurring) or YYYY-MM-DD (fixed)
  name: string;
}

export enum DayType {
  WORK = 'WORK',
  OFF = 'OFF'
}

export interface DayStatus {
  date: Date;
  employees: {
    employeeId: string;
    type: DayType;
  }[];
  isToday: boolean;
  holiday?: string;
  note?: string;
}