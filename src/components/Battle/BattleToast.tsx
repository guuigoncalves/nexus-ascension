import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Toast {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error';
}

interface BattleToastProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export const BattleToast: React.FC<BattleToastProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-20 left-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.8 }}
                        layout
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl backdrop-blur-md border-l-4 min-w-[300px] ${toast.type === 'error' ? 'bg-red-900/80 border-red-500 text-white' :
                            toast.type === 'warning' ? 'bg-yellow-900/80 border-yellow-500 text-yellow-100' :
                                'bg-blue-900/80 border-blue-500 text-blue-100'
                            }`}
                        onClick={() => onRemove(toast.id)}
                    >
                        <span className="text-xl">
                            {toast.type === 'error' ? '🚫' :
                                toast.type === 'warning' ? '⚠️' :
                                    'ℹ️'}
                        </span>
                        <div className="flex-1">
                            <p className="font-bold text-sm leading-tight drop-shadow-md">{toast.message}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
