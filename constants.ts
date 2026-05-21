import { Holiday, ShiftPattern } from './types';

export const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DEFAULT_PATTERNS: ShiftPattern[] = [
  { name: '6x4', daysOn: 6, daysOff: 4 },
  { name: '6x2', daysOn: 6, daysOff: 2 },
  { name: '6x1', daysOn: 6, daysOff: 1 },
  { name: '5x2', daysOn: 5, daysOff: 2 },
  { name: '5x1', daysOn: 5, daysOff: 1 },
  { name: '12x36', daysOn: 1, daysOff: 1 }, // Simplified logic for 12x36 (1 day on, 1 day off roughly for visual grid)
  { name: '4x2', daysOn: 4, daysOff: 2 },
];

// Brazilian Holidays (Fixed and Common)
export const HOLIDAYS: Holiday[] = [
  { date: '01-01', name: 'Confraternização Universal' },
  { date: '04-21', name: 'Tiradentes' },
  { date: '05-01', name: 'Dia do Trabalho' },
  { date: '09-07', name: 'Independência do Brasil' },
  { date: '10-12', name: 'Nossa Senhora Aparecida' },
  { date: '11-02', name: 'Finados' },
  { date: '11-15', name: 'Proclamação da República' },
  { date: '12-25', name: 'Natal' },
  // 2024/2025 Variable dates would ideally be calculated, hardcoding a few for demo
  { date: '2024-02-13', name: 'Carnaval' },
  { date: '2024-03-29', name: 'Sexta-feira Santa' },
  { date: '2024-11-20', name: 'Dia da Consciência Negra' },
  { date: '2025-03-04', name: 'Carnaval' },
  { date: '2025-04-18', name: 'Sexta-feira Santa' },
];
