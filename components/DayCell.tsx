import React from 'react';
import { DayType, Employee } from '../types';

interface DayCellProps {
  date: Date;
  statusList: { employeeId: string; type: DayType }[];
  employees: Employee[];
  isToday: boolean;
  holiday?: string;
  note?: string;
  isCurrentMonth: boolean;
  onClick: () => void;
}

// Optimization: Use React.memo to prevent re-renders of all 42 cells when parent state changes
// but the cell content remains effectively the same.
export const DayCell = React.memo<DayCellProps>(({
  date,
  statusList,
  employees,
  isToday,
  holiday,
  note,
  isCurrentMonth,
  onClick
}) => {
  // If not current month, render faded
  const opacityClass = isCurrentMonth ? 'opacity-100' : 'opacity-30';

  // Dynamic border classes
  let borderClass = 'border border-transparent'; // default
  if (holiday) borderClass = 'border-2 border-red-400';
  else if (note) borderClass = 'border-2 border-blue-500';

  // Construct Accessible Label
  const dateLabel = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' });
  const holidayLabel = holiday ? `Feriado: ${holiday}.` : '';
  const noteLabel = note ? 'Contém anotação.' : '';

  // Create a status description for all employees
  const statusLabel = employees.map(emp => {
    const status = statusList.find(s => s.employeeId === emp.id)?.type;
    const typeStr = status === DayType.WORK ? 'Trabalho' : 'Folga';
    return `${emp.name}: ${typeStr}`;
  }).join('. ');

  const ariaLabel = `${dateLabel}. ${holidayLabel} ${noteLabel} ${statusLabel}`;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative h-full flex flex-col rounded-lg overflow-hidden shadow-sm transition-transform active:scale-95 cursor-pointer ${borderClass} ${opacityClass} bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
    >
      {/* Date Number - Centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <span
          className={`
            text-lg font-bold flex items-center justify-center w-8 h-8 rounded-full transition-all
            ${isToday
              ? 'bg-white/20 dark:bg-slate-700/20 text-blue-900 dark:text-blue-300 shadow-sm ring-1 ring-blue-300 backdrop-blur-sm'
              : 'text-slate-900 dark:text-white drop-shadow-[0_0_4px_rgba(255,255,255,1)] dark:drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.5)]'
            }
          `}
        >
          {date.getDate()}
        </span>
      </div>

      {/* Employee Slices */}
      <div className="flex-1 w-full h-full flex flex-col z-10">
        {employees.map((emp, index) => {
          const status = statusList.find(s => s.employeeId === emp.id)?.type;
          // Default colors if not found (shouldn't happen)
          const bgColor = status === DayType.WORK ? emp.colorWork : emp.colorOff;

          // Determine text color: Use custom if available, else auto logic
          const defaultTextColor = status === DayType.WORK ? 'text-white/90' : 'text-slate-600 dark:text-slate-800';
          const customStyle = {
            backgroundColor: bgColor,
            color: emp.textColor ? emp.textColor : undefined
          };

          return (
            <div
              key={emp.id}
              style={customStyle}
              className={`flex-1 flex items-start pt-0.5 justify-start pl-1 ${!emp.textColor ? defaultTextColor : ''} text-[9px] font-bold leading-none`}
            >
              {employees.length > 1 ? (
                <span className="truncate drop-shadow-sm opacity-80">{emp.name.split(' ')[0]}</span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Note indicator icon if note exists */}
      {note && (
        <div className="absolute bottom-0.5 right-0.5 text-blue-600 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M5.337 21.718a6.707 6.707 0 01-.533-.074.75.75 0 01-.442-1.223l5.225-5.225a.75.75 0 011.061 1.06l-5.225 5.225a.75.75 0 01-.086.238zm16.945-16.944c-3.298-3.296-8.636-3.295-11.934 0l-8.96 8.963a.208.208 0 00-.061.146v.61l-.001.002a.208.208 0 00.063.151l5.59 5.59a.208.208 0 00.151.063h.001l.61.001a.208.208 0 00.147-.061l8.96-8.964c3.298-3.299 3.298-8.637 0-11.935zm-2.122 2.122c2.125 2.125 2.125 5.57 0 7.695l-.75-.75a.75.75 0 00-1.06 1.06l.75.75-8.11 8.11-4.528-4.529 8.109-8.11.75.75a.75.75 0 001.06-1.06l-.75-.75c2.125-2.125 5.57-2.125 7.694 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Custom comparison for performance
  return (
    prev.date.getTime() === next.date.getTime() &&
    prev.isToday === next.isToday &&
    prev.isCurrentMonth === next.isCurrentMonth &&
    prev.holiday === next.holiday &&
    prev.note === next.note &&
    // Shallow compare status list (length and types usually sufficient for this view)
    prev.statusList.length === next.statusList.length &&
    prev.statusList.every((s, i) => s.type === next.statusList[i].type && s.employeeId === next.statusList[i].employeeId) &&
    // Check for employee color changes
    prev.employees === next.employees
  );
});