import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../../types';

interface MaintenanceOverlayProps {
    unit: Card;
    playerBoard: (Card | null)[];
    onPay: (sacrificeId: string) => void;
    onSkip: () => void;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
    unit,
    playerBoard,
    onPay,
    onSkip
}) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Filter out the unit itself from sacrifice options
    const availableSacrifices = playerBoard.filter(c => c && c.id !== unit.id);

    const handleConfirm = () => {
        if (selectedId) {
            onPay(selectedId);
        }
    };

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                {/* Minimal backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-md bg-slate-900 border border-yellow-500/50 rounded-xl p-4 shadow-xl relative overflow-hidden"
                >
                    {/* Background Detail */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <h2 className="text-base font-bold text-yellow-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <span>⚡</span> Manutenção
                    </h2>

                    <div className="flex gap-3 items-center">
                        {/* Unit Preview - Compact */}
                        <div className="w-16 aspect-[2/3] rounded-md overflow-hidden border border-yellow-500/30 relative shadow-md shrink-0">
                            <img src={unit.image} alt={unit.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/80 text-[8px] text-center text-white py-0.5 truncate px-1">{unit.name}</div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            {!isSelecting ? (
                                <>
                                    <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                                        Requer <strong className="text-white">1 sacrifício</strong> para continuar em campo.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onSkip}
                                            className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 font-bold py-1.5 rounded-lg text-xs transition-all"
                                        >
                                            Sacrificar Deusa
                                        </button>
                                        <button
                                            onClick={() => setIsSelecting(true)}
                                            disabled={availableSacrifices.length === 0}
                                            className={`flex-1 font-bold py-1.5 rounded-lg text-xs transition-all shadow-md ${availableSacrifices.length > 0
                                                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            Pagar Custo
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <h3 className="text-[10px] font-bold text-blue-400 uppercase">Oferenda:</h3>
                                        <button
                                            onClick={() => { setIsSelecting(false); setSelectedId(null); }}
                                            className="text-[10px] text-gray-500 hover:text-white"
                                        >
                                            Voltar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-5 gap-1.5 mb-3 max-h-[100px] overflow-y-auto pr-1">
                                        {availableSacrifices.map((card) => {
                                            if (!card) return null;
                                            const isSelected = selectedId === card.id;
                                            return (
                                                <div
                                                    key={`sac-${card.id}`}
                                                    onClick={() => setSelectedId(card.id)}
                                                    className={`relative aspect-[3/4] rounded-sm cursor-pointer transition-all overflow-hidden border ${isSelected
                                                        ? 'border-yellow-500 scale-95 opacity-80'
                                                        : 'border-gray-800 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                                                            <span className="text-base">✨</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={handleConfirm}
                                        disabled={!selectedId}
                                        className={`w-full font-bold py-1.5 rounded-lg text-xs transition-all ${selectedId
                                            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md'
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        Invocação Sagrada
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
