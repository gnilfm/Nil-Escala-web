import React, { useState, useEffect, useMemo } from 'react';
import { generateCalendarDays, getHolidayName, getShiftStatus, formatDateKey, triggerHaptic } from './utils';
import { MONTHS, WEEKDAYS, HOLIDAYS, DEFAULT_PATTERNS } from './constants';
import { Employee, Note, DayStatus, DayType } from './types';
import { DayCell } from './components/DayCell';
import { InfoModal } from './components/InfoModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SummaryModal } from './components/SummaryModal';
import { HelpModal } from './components/HelpModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Onboarding, ONBOARDING_STEPS } from './components/Onboarding';

const App: React.FC = () => {
  // State: Date Navigation
  const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the month being viewed
  const [today] = useState(new Date()); // Tracks strict "today"

  // State: Data
  const [notes, setNotes] = useState<Note[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // State: UI
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // New States: Help & Feedback & Accessibility
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('escala_font_size') as 'small' | 'normal' | 'large') || 'normal';
    }
    return 'normal';
  });

  // State: Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // State: Onboarding
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // State: Summary Modals (Footer)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryType, setSummaryType] = useState<'notes' | 'holidays'>('notes');
  const [summaryItems, setSummaryItems] = useState<any[]>([]);

  // State: PWA Install
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // State: Touch (Swipe)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // State: Theme
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Font Size Effect (Accessibility)
  useEffect(() => {
    localStorage.setItem('escala_font_size', fontSize);
    // Apply font size scale to root element to affect all rem values (Tailwind)
    const root = document.documentElement;
    if (fontSize === 'small') {
      root.style.fontSize = '14px'; // 87.5%
    } else if (fontSize === 'large') {
      root.style.fontSize = '18px'; // 112.5%
    } else {
      root.style.fontSize = '16px'; // 100%
    }
  }, [fontSize]);

  // PWA Install Event Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('Instalação do app disponível (beforeinstallprompt fired)');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    triggerHaptic();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      setDeferredPrompt(null);
    });
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize Data
  useEffect(() => {
    const savedEmps = localStorage.getItem('escala_employees');
    const savedNotes = localStorage.getItem('escala_notes');

    // Check Tutorial Status
    const tutorialDone = localStorage.getItem('escala_tutorial_completed');
    if (!tutorialDone) {
      setTimeout(() => setShowTutorial(true), 800);
    }

    if (savedEmps) {
      setEmployees(JSON.parse(savedEmps));
    } else {
      // Use current year dynamically for the default employee
      const currentYear = new Date().getFullYear();
      setEmployees([
        {
          id: '1',
          name: 'Func. 1',
          startDate: `${currentYear}-01-01`,
          pattern: DEFAULT_PATTERNS[0],
          colorWork: '#1d4ed8',
          colorOff: '#93c5fd',
          textColor: '#0818fd'
        },
      ]);
    }

    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('escala_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('escala_notes', JSON.stringify(notes));
  }, [notes]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('escala_tutorial_completed', 'true');
    setTutorialStep(0);
  };

  // Handler para avançar tutorial se necessário
  const handleNextTutorialStep = () => {
    if (showTutorial) {
      // Se for o último passo, finaliza o tutorial
      if (tutorialStep === ONBOARDING_STEPS.length - 1) {
        handleTutorialComplete();
      } else {
        setTutorialStep(prev => prev + 1);
      }
    }
  };

  // Handler para reiniciar o tutorial manualmente
  const handleRestartTutorial = () => {
    triggerHaptic();
    setIsSettingsOpen(false); // Fecha o drawer para começar da tela principal
    setTutorialStep(0);
    setShowTutorial(true);
  };

  // Intercepta a abertura de Settings para avançar o tutorial se estiver no passo correto
  const handleOpenSettings = () => {
    triggerHaptic();
    setIsSettingsOpen(true);
    // Se estiver no passo "Acesse as Configurações" (ID btn-settings), avança
    const currentStep = ONBOARDING_STEPS[tutorialStep];
    if (showTutorial && currentStep?.targetId === 'btn-settings') {
      handleNextTutorialStep();
    }
  };

  // Derived State: Calendar Grid
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Navigation Handlers
  const prevMonth = () => {
    triggerHaptic();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    triggerHaptic();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevYear = () => {
    triggerHaptic();
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  };

  const nextYear = () => {
    triggerHaptic();
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  };

  // Footer Actions
  const handleGoToToday = () => {
    triggerHaptic();
    setCurrentDate(new Date());
  };

  const handleShowNotes = () => {
    triggerHaptic();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    const monthNotes = notes
      .filter(n => n.date.startsWith(monthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(n => {
        const [y, m, d] = n.date.split('-');
        return {
          id: n.id,
          dateStr: `${d}/${m}`,
          title: n.content,
          description: ''
        };
      });

    setSummaryType('notes');
    setSummaryItems(monthNotes);
    setIsSummaryOpen(true);
  };

  const handleShowHolidays = () => {
    triggerHaptic();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthStr = String(month).padStart(2, '0');

    const monthHolidays = HOLIDAYS
      .filter(h => {
        if (h.date.length === 5) {
          return h.date.startsWith(monthStr);
        }
        return h.date.startsWith(`${year}-${monthStr}`);
      })
      .map((h, index) => {
        const parts = h.date.split('-');
        const day = parts.length === 2 ? parts[1] : parts[2];

        return {
          id: `h-${index}`,
          dateStr: `${day}/${monthStr}`,
          title: h.name,
          description: 'Feriado Nacional'
        };
      })
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    setSummaryType('holidays');
    setSummaryItems(monthHolidays);
    setIsSummaryOpen(true);
  };

  // PDF Export Handlers (mantidos)
  const handleExportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default;

    const doc = new jsPDF();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = MONTHS[month];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    doc.setFontSize(16);
    doc.text(`Escala de Trabalho - ${monthName} ${year}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);

    const head = [['Data', 'Dia', ...employees.map(e => e.name)]];
    const body = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toLocaleDateString('pt-BR');
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const rowData = [dateStr, dayOfWeek];
      employees.forEach(emp => {
        const status = getShiftStatus(date, emp);
        rowData.push(status === DayType.WORK ? 'Trabalho' : 'Folga');
      });
      body.push(rowData);
    }

    autoTable(doc, {
      head: head,
      body: body,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 134, 198] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didParseCell: function (data: any) {
        if (data.section === 'body' && data.column.index >= 2) {
          const text = data.cell.raw;
          if (text === 'Folga') {
            data.cell.styles.textColor = [0, 150, 0];
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'Trabalho') {
            data.cell.styles.textColor = [50, 50, 50];
          }
        }
      }
    });
    doc.save(`escala_${monthName.toLowerCase()}_${year}.pdf`);
    showToast('PDF Mensal gerado com sucesso!', 'success');
  };

  const handleExportAnnualPDF = async () => {
    if (employees.length === 0) return;
    const activeEmployees = employees.slice(0, 4);
    const { jsPDF } = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default;

    const doc = new jsPDF('p', 'mm', 'a4');
    const year = currentDate.getFullYear();

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.setFont(undefined, 'bold');
    doc.text(`Relatório Anual ${year}`, 105, 12, { align: 'center' });

    doc.setFontSize(10);
    let totalLegendWidth = 0;
    const nameGap = 8;

    activeEmployees.forEach((emp, i) => {
      const width = doc.getTextWidth(emp.name);
      totalLegendWidth += width;
      if (i < activeEmployees.length - 1) totalLegendWidth += nameGap;
    });

    let currentX = 105 - (totalLegendWidth / 2);
    const legendY = 17;

    activeEmployees.forEach((emp, i) => {
      const rgb = hexToRgb(emp.colorWork);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text(emp.name, currentX, legendY);
      currentX += doc.getTextWidth(emp.name) + nameGap;
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont(undefined, 'normal');
    doc.text('Nil Escala App', 105, 290, { align: 'center' });

    const startX = 7;
    const startY = 22;
    const colWidth = 63;
    const rowHeight = 65;
    const gapX = 3;

    for (let m = 0; m < 12; m++) {
      const colIndex = m % 3;
      const rowIndex = Math.floor(m / 3);
      const currentX = startX + (colIndex * (colWidth + gapX));
      const currentY = startY + (rowIndex * rowHeight);

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0);
      doc.text(MONTHS[m], currentX + (colWidth / 2), currentY - 2, { align: 'center' });

      const allDays = generateCalendarDays(year, m);
      const bodyData: any[][] = [];
      let weekRow: any[] = [];

      allDays.forEach((day) => {
        weekRow.push({ content: '', dayObj: day, isCurrentMonth: day.getMonth() === m });
        if (weekRow.length === 7) {
          bodyData.push(weekRow);
          weekRow = [];
        }
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: currentX },
        tableWidth: colWidth,
        head: [['D', 'S', 'T', 'Q', 'Q', 'S', 'S']],
        body: bodyData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 0, halign: 'center', valign: 'middle', lineWidth: 0.2, lineColor: [0, 0, 0], minCellHeight: 8 },
        headStyles: { fillColor: [240, 240, 240], textColor: [80, 80, 80], fontStyle: 'bold', lineWidth: 0.2, lineColor: [0, 0, 0], halign: 'center' },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.cell.raw && data.cell.raw.isCurrentMonth) {
            const dayObj = data.cell.raw.dayObj as Date;
            const stripeHeight = data.cell.height / activeEmployees.length;
            activeEmployees.forEach((emp, i) => {
              const status = getShiftStatus(dayObj, emp);
              const color = status === DayType.WORK ? emp.colorWork : emp.colorOff;
              const rgb = hexToRgb(color);
              doc.setFillColor(rgb.r, rgb.g, rgb.b);
              doc.rect(data.cell.x, data.cell.y + (i * stripeHeight), data.cell.width, stripeHeight, 'F');
            });
            const dayNum = String(dayObj.getDate());
            doc.setFontSize(8);
            doc.setFont(undefined, 'bold');
            const textX = data.cell.x + data.cell.width / 2;
            const textY = data.cell.y + data.cell.height / 2 + 1.5;
            doc.setTextColor(0, 0, 0);
            doc.text(dayNum, textX + 0.3, textY + 0.3, { align: 'center' });
            doc.setTextColor(255, 255, 255);
            doc.text(dayNum, textX, textY, { align: 'center' });
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
          } else if (data.section === 'body' && data.cell.raw && !data.cell.raw.isCurrentMonth) {
            const dayNum = String(data.cell.raw.dayObj.getDate());
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(200, 200, 200);
            doc.text(dayNum, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
          }
        }
      });
    }
    doc.save(`relatorio_anual_${year}.pdf`);
    showToast('Relatório Anual gerado com sucesso!', 'success');
  };

  const handleBackup = () => {
    const data = { employees, notes, version: 1, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_escala_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Backup salvo no dispositivo!', 'success');
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          if (data.employees && Array.isArray(data.employees)) setEmployees(data.employees);
          if (data.notes && Array.isArray(data.notes)) setNotes(data.notes);
          showToast('Backup restaurado com sucesso!', 'success');
        } catch (error) {
          showToast('Erro ao ler o arquivo de backup.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };


  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextMonth();
    if (isRightSwipe) prevMonth();
  };

  const handleDayClick = (day: Date) => {
    triggerHaptic();
    const dateKey = formatDateKey(day);
    const holiday = getHolidayName(day, HOLIDAYS);
    const note = notes.find(n => n.date === dateKey)?.content;
    const statusList = employees.map(emp => ({
      employeeId: emp.id,
      type: getShiftStatus(day, emp)
    }));
    setSelectedDay({
      date: day,
      employees: statusList,
      isToday: formatDateKey(today) === dateKey,
      holiday,
      note
    });
    setIsModalOpen(true);
  };

  const saveNote = (dateKey: string, content: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.date !== dateKey);
      return [...filtered, { id: Date.now().toString(), date: dateKey, content }];
    });
    showToast('Anotação salva!', 'success');
  };

  const deleteNote = (dateKey: string) => {
    setNotes(prev => prev.filter(n => n.date !== dateKey));
    showToast('Anotação removida.', 'info');
  };

  const handleSubmitFeedback = (text: string, rating: number) => {
    // Simulate API call
    console.log('Feedback:', text, rating);
    showToast('Obrigado pelo seu feedback!', 'success');
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center transition-colors duration-200 overflow-hidden text-sm">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-safe z-[60] mt-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-fade-in transition-all ${toast.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800' :
            toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800' :
              'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800'
          }`}>
          {toast.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          {toast.type === 'error' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
          <span className="font-semibold text-xs">{toast.message}</span>
        </div>
      )}

      {/* Onboarding Tutorial - Agora Controlado */}
      <Onboarding
        isOpen={showTutorial}
        stepIndex={tutorialStep}
        setStepIndex={setTutorialStep}
        onComplete={handleTutorialComplete}
      />

      {/* Header with Safe Area Top Padding */}
      <header className="w-full bg-white dark:bg-slate-800 shadow-sm shrink-0 z-30 transition-colors relative pt-safe-3 pb-3">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">

          {/* Left: Menu Button */}
          <button
            id="btn-settings"
            onClick={handleOpenSettings}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95"
            title="Configurações"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Center: Title */}
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight leading-none">
              Nil <span className="text-blue-600 dark:text-blue-400">Escala</span>
            </h1>
          </div>

          {/* Right: Year Navigation */}
          <div id="header-nav" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button onClick={prevYear} className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-white px-1">
              {currentDate.getFullYear()}
            </span>
            <button onClick={nextYear} className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="flex-1 w-full max-w-md px-4 py-2 flex flex-col min-h-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* Month Navigation & Stats Component */}
        <div className="flex items-center justify-between py-3 shrink-0 mb-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm active:scale-95 bg-white/50 dark:bg-slate-800/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col items-center justify-center gap-0.5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize tracking-wide leading-tight">
              {MONTHS[currentDate.getMonth()]}
            </h2>
          </div>

          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm active:scale-95 bg-white/50 dark:bg-slate-800/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2 shrink-0 bg-white/50 dark:bg-slate-800/50 rounded-lg py-1.5">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className={`text-center font-bold text-xs ${i === 0 || i === 6 ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div id="calendar-grid" className="flex-1 grid grid-cols-7 grid-rows-6 gap-1.5 min-h-0 pb-1">
          {calendarDays.map((day, idx) => {
            const dateKey = formatDateKey(day);
            const isToday = formatDateKey(today) === dateKey;
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const holiday = getHolidayName(day, HOLIDAYS);
            const note = notes.find(n => n.date === dateKey)?.content;

            const statusList = employees.map(emp => ({
              employeeId: emp.id,
              type: getShiftStatus(day, emp)
            }));

            return (
              <DayCell
                key={dateKey + idx}
                date={day}
                statusList={statusList}
                employees={employees}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
                holiday={holiday}
                note={note}
                onClick={() => handleDayClick(day)}
              />
            );
          })}
        </div>
      </main>

      {/* Footer with Safe Area Bottom Padding */}
      <footer id="footer-actions" className="w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pt-3 px-6 pb-safe-3 shrink-0 z-20 transition-colors shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300">

          <button
            onClick={handleGoToToday}
            className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform p-1 w-16"
          >
            <div className="w-6 h-6 rounded-full border border-blue-300 bg-transparent flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors">
              <span className="text-blue-600 dark:text-blue-400 font-bold">{today.getDate()}</span>
            </div>
            <span>Hoje</span>
          </button>

          <button
            onClick={handleShowNotes}
            className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform p-1 w-16"
          >
            <div className="w-6 h-6 rounded border border-blue-600 bg-transparent flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <span>Anotações</span>
          </button>

          <button
            onClick={handleShowHolidays}
            className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform p-1 w-16"
          >
            <div className="w-6 h-6 rounded border border-red-400 bg-transparent flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Feriados</span>
          </button>

        </div>
      </footer>

      {/* Modals */}
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDay?.date || null}
        holiday={selectedDay?.holiday}
        note={selectedDay?.note}
        onSaveNote={saveNote}
        onDeleteNote={deleteNote}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        title={summaryType === 'notes' ? `Anotações de ${MONTHS[currentDate.getMonth()]}` : `Feriados de ${MONTHS[currentDate.getMonth()]}`}
        type={summaryType}
        items={summaryItems}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleSubmitFeedback}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        employees={employees}
        setEmployees={setEmployees}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        onExportPDF={handleExportPDF}
        onExportAnnualPDF={handleExportAnnualPDF}
        onBackup={handleBackup}
        onRestore={handleRestore}
        installPrompt={deferredPrompt}
        onInstall={handleInstallClick}
        currentDate={currentDate}
        onTutorialAction={handleNextTutorialStep}
        showToast={showToast}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onRestartTutorial={handleRestartTutorial}
      />

    </div>
  );
};

export default App;