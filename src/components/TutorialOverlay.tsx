import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    image?: string;
    actionLabel?: string;
    actionId?: string; // String identifier for parent to handle
    flags?: {
        lockBoard?: boolean;
        lockEliteCards?: boolean;
        allowedAction?: string;
    };
}

interface TutorialOverlayProps {
    steps: TutorialStep[];
    onComplete: () => void;
    onSkip: () => void;
    onAction?: (actionId: string) => void;
    onStepChange?: (step: TutorialStep) => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, onComplete, onSkip, onAction, onStepChange }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const currentStep = steps[currentStepIndex];

    React.useEffect(() => {
        if (onStepChange) {
            onStepChange(currentStep);
        }
    }, [currentStepIndex, onStepChange, currentStep]);

    const handleNext = () => {
        if (currentStep.actionId && onAction) {
            onAction(currentStep.actionId);
        }

        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-cyan-500/50 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(34,211,238,0.2)] relative"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-cyan-400 uppercase tracking-wider">{currentStep.title}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={onSkip}
                            className="text-xs text-gray-500 hover:text-white underline px-2 py-1"
                        >
                            Pular Tutorial
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-6 space-y-4">
                    {currentStep.image && (
                        <div className="rounded-xl overflow-hidden border border-gray-700 h-40">
                            <img src={currentStep.image} alt="Tutorial Visualization" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {currentStep.content}
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-1.5 mb-6">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStepIndex ? 'w-6 bg-cyan-400' : 'w-1.5 bg-gray-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                    <button
                        onClick={handleNext}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-cyan-500/20"
                    >
                        {/* Custom Action Label or Default */}
                        {currentStep.actionLabel || (currentStepIndex === steps.length - 1 ? 'ENTENDI' : 'PRÓXIMO')}
                        {currentStepIndex < steps.length - 1 && <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Character/Mascot (Optional styling element) */}
                <div className="absolute -bottom-10 -left-10 w-24 h-24 pointer-events-none opacity-50 overflow-hidden">
                    {/* Placeholder for mascot aspect */}
                </div>
            </motion.div>
        </div>
    );
};
