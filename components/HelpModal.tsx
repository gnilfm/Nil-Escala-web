import React, { useState } from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FAQ_ITEMS = [
    {
        question: "Como configuro minha escala?",
        answer: "Vá em Configurações > Editar Turno. Defina a 'Data Inicial' como o PRIMEIRO dia de trabalho do seu ciclo atual. O app calculará o resto automaticamente."
    },
    {
        question: "Como funcionam as anotações?",
        answer: "Toque em qualquer dia no calendário para abrir os detalhes. Digite sua anotação e clique em salvar. Um marcador azul aparecerá no dia."
    },
    {
        question: "Posso ter mais de um turno?",
        answer: "Sim! Nas configurações, clique em 'Adicionar Turno' para gerenciar escalas de múltiplos funcionários ou setores simultaneamente."
    },
    {
        question: "O app funciona sem internet?",
        answer: "Sim. O Nil Escala é um PWA (Progressive Web App). Após o primeiro acesso, ele funciona offline e salva seus dados no próprio dispositivo."
    },
    {
        question: "Como faço backup dos meus dados?",
        answer: "Nas configurações, use a opção 'Fazer Backup' para baixar um arquivo. Para recuperar, use a opção 'Restaurar Backup' e selecione o arquivo baixado anteriormente."
    }
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    if (!isOpen) return null;

    const toggleIndex = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] transform transition-all scale-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-title"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <h2 id="help-title" className="text-lg font-bold text-slate-800 dark:text-white">Ajuda & FAQ</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        aria-label="Fechar ajuda"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-4 space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Encontre respostas para as dúvidas mais comuns sobre o uso do aplicativo.
                    </p>

                    {FAQ_ITEMS.map((item, index) => (
                        <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleIndex(index)}
                                className="w-full flex justify-between items-center p-3 text-left bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                                aria-expanded={openIndex === index}
                            >
                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.question}</span>
                                <svg
                                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-3 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 leading-relaxed">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Ainda precisa de ajuda?</p>
                        <a
                            href="mailto:suporte@nilescala.app"
                            className="text-xs text-blue-600 dark:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                        >
                            Entre em contato com o suporte
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};