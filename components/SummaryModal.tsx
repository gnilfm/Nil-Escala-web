import React from 'react';

interface SummaryItem {
  id: string;
  dateStr: string; // Ex: "25/12" ou "Dia 25"
  title: string;
  description?: string;
}

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'notes' | 'holidays';
  items: SummaryItem[];
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  items
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-safe-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh] transform transition-all scale-100">

        {/* Header */}
        <div className={`p-4 border-b ${type === 'notes' ? 'border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900' : 'border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900'} rounded-t-2xl flex justify-between items-center shrink-0`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${type === 'notes' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'}`}>
              {type === 'notes' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-sm">Nenhum item encontrado para este mês.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col items-center justify-center min-w-[3.5rem] bg-white dark:bg-slate-800 rounded-lg p-1.5 border border-slate-200 dark:border-slate-600 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{item.dateStr.split('/')[1] || 'DIA'}</span>
                  <span className={`text-lg font-bold ${type === 'notes' ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>
                    {item.dateStr.split('/')[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">{item.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};