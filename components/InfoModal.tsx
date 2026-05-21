import React, { useState } from 'react';
import { formatDateKey } from '../utils';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  holiday?: string;
  note?: string;
  onSaveNote: (date: string, text: string) => void;
  onDeleteNote: (date: string) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  date,
  holiday,
  note,
  onSaveNote,
  onDeleteNote
}) => {
  const [noteText, setNoteText] = useState(note || '');
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    setNoteText(note || '');
    setIsEditing(false);
  }, [note, date]);

  if (!isOpen || !date) return null;

  const dateKey = formatDateKey(date);

  const handleSave = () => {
    onSaveNote(dateKey, noteText);
    setIsEditing(false);
    onClose();
  };
  
  const handleDelete = () => {
    onDeleteNote(dateKey);
    setNoteText('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
            {date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' })}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {holiday && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-md">
            <p className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">Feriado</p>
            <p className="text-lg text-red-800 dark:text-red-200 font-medium">{holiday}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anotações</label>
          
          {isEditing || !note ? (
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-700 h-32 resize-none"
              placeholder="Digite sua anotação aqui..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          ) : (
             <div 
               onClick={() => setIsEditing(true)}
               className="w-full p-4 border border-blue-200 dark:border-slate-600 bg-blue-50 dark:bg-slate-700/50 rounded-lg text-gray-700 dark:text-gray-300 h-32 overflow-y-auto cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
             >
               {note}
             </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
           {(note && !isEditing) ? (
             <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 font-medium"
                >
                  Editar
                </button>
                 <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 font-medium"
                >
                  Excluir
                </button>
             </>
           ) : (
              <button 
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30"
              >
                Salvar Anotação
              </button>
           )}
        </div>
      </div>
    </div>
  );
};