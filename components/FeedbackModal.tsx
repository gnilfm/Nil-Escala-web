import React, { useState } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (text: string, rating: number) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        // Simulating network delay
        setTimeout(() => {
            onSubmit(feedback, rating);
            setIsSubmitting(false);
            setFeedback('');
            setRating(0);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col transform transition-all scale-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-title"
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="feedback-title" className="text-lg font-bold text-slate-800 dark:text-white">Seu Feedback</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                        O que você está achando do Nil Escala? Sua opinião nos ajuda a melhorar.
                    </p>

                    {/* Star Rating */}
                    <div className="flex justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`w-10 h-10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full ${rating >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                aria-label={`Avaliar com ${star} estrelas`}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Conte-nos mais (opcional)..."
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <button
                        type="submit"
                        disabled={rating === 0 || isSubmitting}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                    ${rating === 0 || isSubmitting
                                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/30'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                            </>
                        ) : 'Enviar Avaliação'}
                    </button>
                </form>
            </div>
        </div>
    );
};