import React, { useState, useEffect } from 'react';
import { Employee, ShiftPattern, DayType } from '../types';
import { DEFAULT_PATTERNS, MONTHS } from '../constants';
import { generateCalendarDays, getShiftStatus, triggerHaptic, formatDateKey } from '../utils';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onExportPDF: () => void;
  onExportAnnualPDF: () => void;
  onBackup?: () => void;
  onRestore?: () => void;
  installPrompt?: any;
  onInstall?: () => void;
  currentDate?: Date;
  onTutorialAction?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  // New Props
  fontSize: 'small' | 'normal' | 'large';
  setFontSize: (size: 'small' | 'normal' | 'large') => void;
  onOpenHelp: () => void;
  onOpenFeedback: () => void;
  onRestartTutorial: () => void;
}

const COLOR_PALETTES = [
  // Blues
  { work: '#1d4ed8', off: '#93c5fd' },
  { work: '#0369a1', off: '#7dd3fc' },
  { work: '#1e40af', off: '#a5b4fc' },

  // Greens/Teals
  { work: '#047857', off: '#6ee7b7' },
  { work: '#0f766e', off: '#5eead4' },
  { work: '#4d7c0f', off: '#bef264' },

  // Purples/Pinks
  { work: '#6d28d9', off: '#c4b5fd' },
  { work: '#a21caf', off: '#f0abfc' },
  { work: '#be185d', off: '#f9a8d4' },

  // Warm
  { work: '#b45309', off: '#fcd34d' },
  { work: '#c2410c', off: '#fdba74' },
  { work: '#b91c1c', off: '#fca5a5' },
  { work: '#9f1239', off: '#fda4af' },

  // Grays/Neutrals
  { work: '#334155', off: '#cbd5e1' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  employees,
  setEmployees,
  darkMode,
  toggleDarkMode,
  onExportPDF,
  onExportAnnualPDF,
  installPrompt,
  onInstall,
  currentDate = new Date(),
  onTutorialAction,
  showToast,
  fontSize,
  setFontSize,
  onOpenHelp,
  onOpenFeedback,
  onRestartTutorial
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');

  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const [empName, setEmpName] = useState('');
  const [empStart, setEmpStart] = useState(formatDateKey(new Date()));
  const [selectedPatternName, setSelectedPatternName] = useState('6x4');
  const [workColor, setWorkColor] = useState('#1d4ed8');
  const [offColor, setOffColor] = useState('#93c5fd');
  const [empTextColor, setEmpTextColor] = useState('#0818fd');

  const [customDaysOn, setCustomDaysOn] = useState<number>(5);
  const [customDaysOff, setCustomDaysOff] = useState<number>(2);

  const resetForm = () => {
    setEmpName('');
    setEmpStart(formatDateKey(new Date()));
    setSelectedPatternName('6x4');
    setCustomDaysOn(5);
    setCustomDaysOff(2);
    setWorkColor('#1d4ed8');
    setOffColor('#93c5fd');
    setEmpTextColor('#0818fd');
    setDeleteConfirmationId(null);
  };

  useEffect(() => {
    if (isOpen) {
      setViewMode('list');
      setEditingId(null);
      setDeleteConfirmationId(null);
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editingId) {
      resetForm();
    }
  }, [editingId]);

  const startEditing = (emp: Employee) => {
    setEditingId(emp.id);
    setEmpName(emp.name);
    setEmpStart(emp.startDate);
    setWorkColor(emp.colorWork);
    setOffColor(emp.colorOff);
    setEmpTextColor(emp.textColor || '#0818fd');

    const isStandard = DEFAULT_PATTERNS.some(p => p.name === emp.pattern.name);

    if (isStandard) {
      setSelectedPatternName(emp.pattern.name);
    } else {
      setSelectedPatternName('Custom');
      setCustomDaysOn(emp.pattern.daysOn);
      setCustomDaysOff(emp.pattern.daysOff);
    }
  };

  const handleSave = () => {
    triggerHaptic();
    let pattern: ShiftPattern;

    if (selectedPatternName === 'Custom') {
      pattern = {
        name: `${customDaysOn}x${customDaysOff}`,
        daysOn: Number(customDaysOn),
        daysOff: Number(customDaysOff)
      };
    } else {
      pattern = DEFAULT_PATTERNS.find(p => p.name === selectedPatternName) || DEFAULT_PATTERNS[0];
    }

    if (editingId) {
      setEmployees(prev => prev.map(emp => {
        if (String(emp.id) === String(editingId)) {
          return {
            ...emp,
            name: empName,
            startDate: empStart,
            pattern: pattern,
            colorWork: workColor,
            colorOff: offColor,
            textColor: empTextColor
          };
        }
        return emp;
      }));
      setEditingId(null);
      showToast('Turno atualizado!', 'success');
    } else {
      const newEmp: Employee = {
        id: Date.now().toString(),
        name: empName || `Func. ${employees.length + 1}`,
        startDate: empStart,
        pattern: pattern,
        colorWork: workColor,
        colorOff: offColor,
        textColor: empTextColor
      };
      setEmployees(prev => [...prev, newEmp]);
      resetForm();
      showToast('Novo turno criado!', 'success');
    }
    if (onTutorialAction) onTutorialAction();
  };

  const requestDelete = (targetId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic();
    setDeleteConfirmationId(targetId);
  };

  const cancelDelete = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDeleteConfirmationId(null);
  }

  const confirmDelete = (targetId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic();

    setEmployees(currentEmployees =>
      currentEmployees.filter(emp => String(emp.id) !== String(targetId))
    );

    setDeleteConfirmationId(null);
    if (editingId && String(editingId) === String(targetId)) {
      setEditingId(null);
      setViewMode('list');
    }
    showToast('Turno removido.', 'info');
  };

  const applyPalette = (palette: { work: string, off: string }) => {
    setWorkColor(palette.work);
    setOffColor(palette.off);
  };

  const handleAddNewClick = () => {
    triggerHaptic();
    if (onTutorialAction) {
      onTutorialAction();
    }

    setEditingId(null);
    resetForm();
    setViewMode('form');
  };

  const handleEditClick = (emp: Employee) => {
    startEditing(emp);
    setViewMode('form');
  };

  const handleNativeShare = async () => {
    triggerHaptic();
    const shareData = {
      title: 'Nil Escala',
      text: 'Gerencie sua escala de trabalho 6x4 de forma simples e moderna.',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        console.log('User cancelled share or failed:', error);
      }
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      showToast('Link copiado para a área de transferência!', 'success');
    } catch (err) {
      showToast('Erro ao copiar o link.', 'error');
    }
  };

  const getEmployeeStats = (emp: Employee) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = generateCalendarDays(year, month);

    let work = 0;
    let off = 0;

    days.forEach(day => {
      if (day.getMonth() === month) {
        const status = getShiftStatus(day, emp);
        if (status === DayType.WORK) work++;
        else off++;
      }
    });
    return { work, off };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto animate-slide-left transition-colors flex flex-col pt-safe-4 pl-4 pr-4 pb-safe-4">
        <div className="flex justify-between items-center mb-2 border-b dark:border-slate-700 pb-2 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {viewMode === 'list' ? 'Configurações' : (editingId ? 'Editar Turno' : 'Novo Turno')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {/* View Mode: List */}
          {viewMode === 'list' && (
            <>
              <div>
                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Funcionários Ativos</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">Estatísticas de {MONTHS[currentDate.getMonth()]}</span>
                </div>

                {/* Lista de Funcionários */}
                <div id="settings-list-container" className="space-y-2">
                  {employees.map(emp => {
                    const isConfirmingDelete = deleteConfirmationId === emp.id;
                    const stats = getEmployeeStats(emp);

                    if (isConfirmingDelete) {
                      return (
                        <div key={emp.id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex flex-col gap-2 animate-fade-in">
                          <p className="text-xs font-bold text-red-800 dark:text-red-200 text-center">
                            Excluir {emp.name}?
                          </p>
                          <div className="flex gap-2 justify-center">
                            <button
                              type="button"
                              onClick={(e) => cancelDelete(e)}
                              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-gray-300"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => confirmDelete(emp.id, e)}
                              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded font-bold shadow hover:bg-red-700"
                            >
                              Sim, Excluir
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors relative"
                      >
                        <div
                          className="flex-1 flex items-center gap-3 cursor-pointer overflow-hidden"
                          onClick={() => handleEditClick(emp)}
                        >
                          <div className="w-8 h-8 rounded-full flex overflow-hidden border border-gray-300 dark:border-slate-600 shrink-0">
                            <div className="w-1/2 h-full" style={{ background: emp.colorWork }}></div>
                            <div className="w-1/2 h-full" style={{ background: emp.colorOff }}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between w-full pr-2">
                              <p className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate" style={{ color: emp.textColor }}>{emp.name}</p>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700/50 px-1.5 rounded ml-2 whitespace-nowrap">{emp.pattern.name}</span>
                            </div>

                            <div className="flex items-center gap-3 mt-1 text-[10px]">
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: emp.colorWork }}></span>
                                <span className="font-medium">{stats.work} Dias</span>
                              </span>
                              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-500">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: emp.colorOff }}></span>
                                <span>{stats.off} Folgas</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-1 pl-2 border-l border-gray-200 dark:border-slate-700 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditClick(emp);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => requestDelete(emp.id, e)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {employees.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-xs">Nenhum turno configurado.</p>
                  )}
                </div>
              </div>

              {/* ID Crítico para o Tutorial - Passo 9 - Container Específico para garantir foco */}
              <div className="pt-2">
                <button
                  id="btn-add-new-shift-step-9-unique"
                  type="button"
                  onClick={handleAddNewClick}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 font-medium hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Adicionar Turno
                </button>
              </div>

              <div id="settings-tools" className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Ferramentas</h3>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onExportPDF}
                    className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2 font-medium text-sm active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Exportar PDF (Mês Atual)
                  </button>
                  <button
                    type="button"
                    onClick={onExportAnnualPDF}
                    className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2 font-medium text-sm active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Relatório Anual (A4)
                  </button>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center gap-2 font-medium text-sm active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Compartilhar App
                  </button>
                  <button
                    type="button"
                    onClick={onRestartTutorial}
                    className="w-full py-2.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-lg border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors flex items-center justify-center gap-2 font-medium text-sm active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    Ver Tutorial
                  </button>
                </div>
              </div>

              {/* Suporte e Feedback (Movido para antes das configurações visuais) */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Ajuda e Suporte</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onOpenHelp}
                    className="py-3 px-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex flex-col items-center gap-1 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <span className="text-xs font-bold">FAQ</span>
                  </button>
                  <button
                    onClick={onOpenFeedback}
                    className="py-3 px-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors flex flex-col items-center gap-1 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    <span className="text-xs font-bold">Avaliar</span>
                  </button>
                </div>
              </div>

              {/* Grupo Visual: Aparência e Acessibilidade Agrupados para o Tutorial */}
              <div id="settings-appearance-group" className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Acessibilidade e Aparência</h3>
                  <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mb-3">
                    <button
                      onClick={() => setFontSize('small')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${fontSize === 'small' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${fontSize === 'normal' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`flex-1 py-1.5 text-base font-bold rounded-md transition-all ${fontSize === 'large' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      A+
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${darkMode ? 'bg-slate-700 text-yellow-300' : 'bg-blue-100 text-blue-600'}`}>
                        {darkMode ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Modo Escuro</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { triggerHaptic(); toggleDarkMode(); }}
                      className={`w-10 h-5 rounded-full transition-colors relative ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${darkMode ? 'left-6' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* View Mode: Form */}
          {viewMode === 'form' && (
            <div className="p-5 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 space-y-5 animate-fade-in flex-1 overflow-y-auto">

              {/* Name Input & Text Color */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Nome</label>
                  <input
                    id="form-name"
                    type="text"
                    value={empName}
                    onChange={e => setEmpName(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Turno A"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Cor Texto</label>
                  <div className="relative overflow-hidden w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 shadow-sm">
                    <input
                      type="color"
                      value={empTextColor}
                      onChange={e => setEmpTextColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer"
                      title="Cor do texto"
                    />
                  </div>
                </div>
              </div>

              {/* Start Date Input */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Início da Escala</label>
                <input
                  id="form-start"
                  type="date"
                  value={empStart}
                  onChange={e => setEmpStart(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
              </div>

              {/* Pattern Selection */}
              <div id="form-pattern">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Tipo de Escala</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {DEFAULT_PATTERNS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { triggerHaptic(); setSelectedPatternName(p.name); }}
                      className={`px-1 py-2.5 text-xs rounded-lg border transition-all ${selectedPatternName === p.name
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]'
                          : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                        }`}
                    >
                      {p.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { triggerHaptic(); setSelectedPatternName('Custom'); }}
                    className={`px-1 py-2.5 text-xs rounded-lg border transition-all ${selectedPatternName === 'Custom'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]'
                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                      }`}
                  >
                    Personal.
                  </button>
                </div>

                {selectedPatternName === 'Custom' && (
                  <div className="flex gap-4 p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 animate-fade-in mt-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Trab.</label>
                      <input
                        type="number"
                        min="1"
                        value={customDaysOn}
                        onChange={e => setCustomDaysOn(Number(e.target.value))}
                        className="w-full p-2 text-center text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Folga</label>
                      <input
                        type="number"
                        min="1"
                        value={customDaysOff}
                        onChange={e => setCustomDaysOff(Number(e.target.value))}
                        className="w-full p-2 text-center text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Colors */}
              <div id="form-colors">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Cores</label>

                {/* Presets */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {COLOR_PALETTES.map((pal, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPalette(pal)}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm hover:scale-110 transition-transform ring-1 ring-gray-200 dark:ring-gray-700"
                      title="Usar esta paleta"
                    >
                      <div className="h-full w-1/2 float-left" style={{ background: pal.work }}></div>
                      <div className="h-full w-1/2 float-left" style={{ background: pal.off }}></div>
                    </button>
                  ))}
                </div>

                {/* Custom Pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-700 p-2 rounded-lg border border-gray-300 dark:border-slate-600">
                    <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 dark:border-gray-500 relative">
                      <input type="color" value={workColor} onChange={e => setWorkColor(e.target.value)} className="absolute -top-2 -left-2 w-14 h-14 border-none cursor-pointer p-0" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-bold uppercase">Trabalho</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-700 p-2 rounded-lg border border-gray-300 dark:border-slate-600">
                    <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 dark:border-gray-500 relative">
                      <input type="color" value={offColor} onChange={e => setOffColor(e.target.value)} className="absolute -top-2 -left-2 w-14 h-14 border-none cursor-pointer p-0" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-bold uppercase">Folga</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-blue-200 dark:border-slate-600 mt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    id="form-save"
                    type="button"
                    onClick={() => { handleSave(); onClose(); }}
                    className="flex-1 py-3 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {viewMode === 'list' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex flex-col items-center gap-2">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
              Copyright © 2025 Nil Meneses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};