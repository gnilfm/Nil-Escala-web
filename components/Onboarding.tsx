import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

interface Step {
    targetId?: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'center'; // Simplificado para lógica principal
    waitForAction?: boolean;
}

interface OnboardingProps {
    isOpen: boolean;
    stepIndex: number;
    setStepIndex: (index: number) => void;
    onComplete: () => void;
}

export const ONBOARDING_STEPS: Step[] = [
    // --- Tela Principal ---
    {
        title: "Bem-vindo ao Nil Escala!",
        content: "Seu novo gerenciador de escalas 6x4 e muito mais. Vamos fazer um tour rápido?",
        position: 'bottom'
    },
    {
        targetId: 'header-nav',
        title: "Navegação",
        content: "Alterne rapidamente entre anos e meses para planejar suas folgas futuras.",
        position: 'bottom'
    },
    {
        targetId: 'calendar-grid',
        title: "Grade Interativa",
        content: "Toque em qualquer dia para ver detalhes, feriados ou adicionar anotações.",
        position: 'center'
    },
    {
        targetId: 'footer-actions',
        title: "Resumos Rápidos",
        content: "Acesse rapidamente o dia de hoje, anotações e lista de feriados.",
        position: 'top'
    },
    {
        targetId: 'btn-settings',
        title: "Acesse as Configurações",
        content: "Clique no botão de menu para acessar as configurações e gerenciar turnos.",
        position: 'bottom',
        waitForAction: true
    },

    // --- Dentro do Settings Drawer ---
    {
        targetId: 'settings-list-container',
        title: "Gerenciamento de Turnos",
        content: "Aqui você visualiza seus funcionários. Edite ou exclua clicando nos ícones.",
        position: 'bottom'
    },
    {
        targetId: 'settings-tools',
        title: "Ferramentas",
        content: "Exporte sua escala em PDF, gere relatórios anuais ou compartilhe o app.",
        position: 'top'
    },
    {
        targetId: 'settings-appearance-group',
        title: "Aparência e Acessibilidade",
        content: "Alterne para o modo escuro ou ajuste o tamanho da fonte para melhor leitura.",
        position: 'top'
    },
    {
        targetId: 'btn-add-new-shift-step-9-unique',
        title: "Criar Novo Turno",
        content: "Vamos criar uma escala? Clique aqui no botão '+ Adicionar Turno' para prosseguir.",
        position: 'top',
        waitForAction: true
    },

    // --- Formulário ---
    {
        targetId: 'form-name',
        title: "Identificação",
        content: "Dê um nome para o funcionário ou para o grupo da escala (ex: Turno A).",
        position: 'bottom'
    },
    {
        targetId: 'form-start',
        title: "Data Inicial",
        content: "Escolha o PRIMEIRO dia de trabalho do ciclo. O app calculará o resto.",
        position: 'bottom'
    },
    {
        targetId: 'form-pattern',
        title: "Padrão de Escala",
        content: "Escolha 6x4, 12x36, 5x2 ou crie um padrão personalizado.",
        position: 'top'
    },
    {
        targetId: 'form-colors',
        title: "Personalização",
        content: "Defina cores para dias de trabalho e folga para facilitar a visualização.",
        position: 'top'
    },
    {
        targetId: 'form-save',
        title: "Finalizar",
        content: "Tudo pronto! Clique em Salvar para gerar sua escala na grade.",
        position: 'top',
        waitForAction: true
    }
];

export const Onboarding: React.FC<OnboardingProps> = ({
    isOpen,
    stepIndex,
    setStepIndex,
    onComplete
}) => {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<React.CSSProperties>({});
    const [arrowClass, setArrowClass] = useState<string>('hidden');

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    // Função central de posicionamento
    const updatePosition = () => {
        if (!isOpen) return;

        const step = ONBOARDING_STEPS[stepIndex];
        if (!step) return;

        // Se não tem target, centraliza na tela
        if (!step.targetId) {
            setRect(null);
            setTooltipPosition({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed',
                width: '90%',
                maxWidth: '400px',
                zIndex: 110
            });
            setArrowClass('hidden');
            return;
        }

        const element = document.getElementById(step.targetId);
        if (element) {
            // 1. Garante que o elemento está visível e centralizado no viewport
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

            // Pequeno delay para esperar o scroll terminar antes de calcular a posição final
            setTimeout(() => {
                const newRect = element.getBoundingClientRect();

                // Se o elemento estiver oculto (ex: gaveta fechada), não atualiza incorretamente
                if (newRect.width === 0 && newRect.height === 0) return;

                setRect(newRect);
                calculateSmartPosition(newRect, step.position);
            }, 400); // Delay ajustado para coincidir com transições CSS
        } else {
            // Fallback se elemento não existe
            setRect(null);
        }
    };

    const calculateSmartPosition = (targetRect: DOMRect, preferredPos: string = 'bottom') => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;
        const gap = 16;

        let style: React.CSSProperties = {
            position: 'fixed',
            zIndex: 110,
            maxWidth: '400px'
        };
        let arrow = 'hidden';

        // --- LÓGICA MOBILE (Smart Docking) ---
        // Em mobile, fixamos no topo ou fundo da tela para evitar sobrepor o elemento, 
        // independente da preferência, pois o espaço é escasso.
        if (isMobile) {
            style.width = 'calc(100% - 32px)'; // Full width com padding
            style.left = '16px'; // Centralizado horizontalmente com margem
            style.transform = 'none';

            const targetCenterY = targetRect.top + (targetRect.height / 2);
            const screenCenterY = viewportHeight / 2;

            // Se o elemento é muito grande (ocupa quase toda tela), centraliza o balão
            if (targetRect.height > viewportHeight * 0.7) {
                style.top = '50%';
                style.transform = 'translateY(-50%)';
                arrow = 'hidden';
            }
            // Se o elemento está na metade SUPERIOR, balão vai para o FUNDO
            else if (targetCenterY < screenCenterY) {
                style.bottom = '24px'; // Fixo no fundo
                style.top = 'auto';
                arrow = 'hidden'; // Sem seta em docking mode para limpar o visual
            }
            // Se o elemento está na metade INFERIOR, balão vai para o TOPO
            else {
                style.top = '24px'; // Fixo no topo
                style.bottom = 'auto';
                arrow = 'hidden';
            }
        }
        // --- LÓGICA DESKTOP (Floating) ---
        else {
            style.width = 'max-content';

            // Horizontal Center do Elemento
            const targetCenterX = targetRect.left + (targetRect.width / 2);
            style.left = `${targetCenterX}px`;
            style.transform = 'translateX(-50%)';

            // Decide Vertical: Top ou Bottom baseado em espaço
            const spaceAbove = targetRect.top;
            const spaceBelow = viewportHeight - targetRect.bottom;
            const tooltipHeightEstimate = 150; // Estimativa segura

            let finalPos = preferredPos;

            // Inverte se não couber
            if (preferredPos === 'top' && spaceAbove < tooltipHeightEstimate) finalPos = 'bottom';
            else if (preferredPos === 'bottom' && spaceBelow < tooltipHeightEstimate) finalPos = 'top';

            if (finalPos === 'top') {
                style.top = `${targetRect.top - gap}px`;
                style.transform = 'translate(-50%, -100%)';
                arrow = 'bottom-[-6px] left-1/2 -translate-x-1/2 rotate-45 border-b border-r border-white/20'; // Aponta para baixo
            } else if (finalPos === 'center') {
                style.top = `${targetRect.top + (targetRect.height / 2)}px`;
                style.transform = 'translate(-50%, -50%)';
                arrow = 'hidden';
            } else {
                // Default Bottom
                style.top = `${targetRect.bottom + gap}px`;
                style.transform = 'translate(-50%, 0)';
                arrow = 'top-[-6px] left-1/2 -translate-x-1/2 rotate-45 border-t border-l border-white/20'; // Aponta para cima
            }

            // Correção de borda lateral (não sair da tela no desktop)
            if (targetCenterX < 200) { // Muito a esquerda
                style.left = `${targetRect.left}px`;
                style.transform = finalPos === 'top' ? 'translate(0, -100%)' : 'none';
                // Ajustar seta seria complexo, ocultamos em edge case
                arrow = 'hidden';
            } else if (targetCenterX > viewportWidth - 200) { // Muito a direita
                style.left = 'auto';
                style.right = `${viewportWidth - targetRect.right}px`;
                style.transform = finalPos === 'top' ? 'translate(0, -100%)' : 'none';
                arrow = 'hidden';
            }
        }

        setTooltipPosition(style);
        setArrowClass(arrow);
    };

    // Reagir a mudanças de passo ou resize
    useLayoutEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [stepIndex, isOpen]);

    const handleNext = () => {
        if (stepIndex < ONBOARDING_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onComplete();
        }
    };

    const getOverlayPath = (r: DOMRect) => {
        if (!r) return '';
        const w = Math.max(window.innerWidth, 20000);
        const h = Math.max(window.innerHeight, 20000);
        const outer = `M -${w / 2} -${h / 2} h ${w} v ${h} h -${w} Z`;

        // Padding AUMENTADO para 8px para garantir que o clique passe com facilidade
        const pad = 8;
        const x = r.left - pad;
        const y = r.top - pad;
        const rw = r.width + (pad * 2);
        const rh = r.height + (pad * 2);

        const inner = `M ${x} ${y} h ${rw} v ${rh} h -${rw} Z`;
        return `${outer} ${inner}`;
    };

    if (!isOpen || !isVisible) return null;

    const currentStep = ONBOARDING_STEPS[stepIndex];
    if (!currentStep) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
            {/* SVG Mask Overlay */}
            {rect ? (
                // pointer-events-none no SVG pai deixa os eventos passarem
                <svg className="absolute inset-0 w-full h-full transition-all duration-300 ease-in-out pointer-events-none">
                    {/* pointer-events-auto na PATH captura os cliques na parte escura (fill), 
              mas o "buraco" (evenodd) é transparente a eventos, permitindo clicar no botão abaixo */}
                    <path
                        d={getOverlayPath(rect)}
                        fill="rgba(0,0,0,0.7)"
                        fillRule="evenodd"
                        className="pointer-events-auto"
                    />
                    <rect
                        x={rect.left - 8}
                        y={rect.top - 8}
                        width={rect.width + 16}
                        height={rect.height + 16}
                        rx="8"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        className="animate-pulse"
                    />
                </svg>
            ) : (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto" />
            )}

            {/* Tooltip Card - pointer-events-auto para permitir interação com o tooltip */}
            <div
                className="absolute bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col gap-3 transition-all duration-300 ease-out animate-fade-in border border-white/20 pointer-events-auto"
                style={tooltipPosition}
            >
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
                        {currentStep.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {stepIndex + 1} / {ONBOARDING_STEPS.length}
                    </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentStep.content}
                </p>

                <div className="flex justify-between items-center mt-3 pt-2">
                    <button
                        onClick={onComplete}
                        className="text-slate-500 dark:text-slate-400 text-sm font-medium px-2 py-2 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                        Pular
                    </button>

                    {!currentStep.waitForAction ? (
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {stepIndex === ONBOARDING_STEPS.length - 1 ? 'Concluir' : 'Próximo'}
                            {stepIndex !== ONBOARDING_STEPS.length - 1 && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            )}
                        </button>
                    ) : (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 animate-pulse bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                            Interaja para continuar
                        </span>
                    )}
                </div>

                {/* Arrow (Visible mainly on Desktop) */}
                <div
                    className={`absolute w-4 h-4 bg-white dark:bg-slate-800 transform ${arrowClass}`}
                />
            </div>
        </div>
    );
};