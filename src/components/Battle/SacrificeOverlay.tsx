import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../../types';

interface SacrificeOverlayProps {
    isOpen: boolean;
    request: { card: Card, cost: number, selected: string[] } | null;
    playerHand: Card[];
    playerBoard: (Card | null)[];
    onSelect: (id: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const SacrificeOverlay: React.FC<SacrificeOverlayProps> = ({
    isOpen,
    request,
    playerHand,
    playerBoard,
    onSelect,
    onConfirm,
    onCancel
}) => {
    if (!isOpen || !request) return null;

    // Filter out the card being played from the hand options
    const availableHand = playerHand.filter(c => c.id !== request.card.id);
    const availableBoard = playerBoard.map((c) => ({ card: c })).filter(item => item.card !== null);

    return (
        <AnimatePresence>
            {/* Backdrop - lighter, not covering everything fully opaque */}
            <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
                {/* Background Dim - minimal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="w-full max-w-xl bg-slate-900/95 border border-purple-500/50 rounded-xl p-4 shadow-2xl relative z-[201] pointer-events-auto"
                >
                    {/* Header - Compact */}
                    <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <h2 className="text-base font-bold text-white uppercase tracking-wider">Sacrifício</h2>
                                <p className="text-gray-400 text-[10px]">Invoque {request.card.name} com <span className="text-yellow-400 font-bold">{request.cost}</span> cards</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] text-gray-500 uppercase font-bold">Custo</div>
                            <div className="text-xl font-black text-purple-400 leading-none">{request.selected.length} / {request.cost}</div>
                        </div>
                    </div>

                    <div className="flex gap-3 min-h-[180px] max-h-[300px] overflow-hidden">
                        {/* Board Section - Compact */}
                        <div className="flex-1 bg-black/20 rounded-lg p-2 border border-gray-800 flex flex-col">
                            <h3 className="text-[9px] font-bold text-blue-400 mb-1.5 uppercase flex items-center gap-1">
                                <span>🛡️</span> Campo
                            </h3>
                            <div className="grid grid-cols-4 gap-1.5 overflow-y-auto pr-1">
                                {availableBoard.map(({ card }) => {
                                    if (!card) return null;
                                    const isSelected = request.selected.includes(card.id);
                                    return (
                                        <div
                                            key={`board-${card.id}`}
                                            onClick={() => onSelect(card.id)}
                                            className={`relative aspect-[3/4] rounded-sm cursor-pointer transition-all overflow-hidden group ${isSelected
                                                ? 'ring-1 ring-purple-500 scale-95 opacity-50 grayscale'
                                                : 'hover:ring-1 hover:ring-blue-400 font-bold'
                                                }`}
                                        >
                                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />

                                            {/* Premium Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none z-10" />

                                            {/* Rarity Tag */}
                                            <div className="absolute top-0 inset-x-0 flex justify-center z-20 pointer-events-none">
                                                <div className="bg-black/70 backdrop-blur-[1px] px-1 py-0.5 rounded-b border-b border-x border-white/10">
                                                    <span className="text-[5px] font-black text-white tracking-tighter uppercase whitespace-nowrap">
                                                        {card.rarity}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Name and Stats */}
                                            <div className="absolute bottom-0 inset-x-0 p-1 flex flex-col justify-end z-20 pointer-events-none">
                                                <span className="text-white text-[6px] font-black uppercase truncate mb-0.5 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                                                    {card.name}
                                                </span>
                                                {card.rarity !== 'Efeito' && (
                                                    <div className="flex justify-between items-center px-0.5">
                                                        <div className="flex items-center gap-0.5 bg-black/60 rounded px-0.5 py-0.25 border border-red-500/20">
                                                            <span className="text-red-400 font-black text-[6px]">{card.atk || (card as any).currentAttack}</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 bg-black/60 rounded px-0.5 py-0.25 border border-blue-500/20">
                                                            <span className="text-blue-400 font-black text-[6px]">{card.def || (card as any).currentHealth}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-purple-900/50">
                                                    <span className="text-lg">💀</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {availableBoard.length === 0 && (
                                    <div className="col-span-4 text-center text-gray-600 text-[9px] italic py-6">Campo Vazio</div>
                                )}
                            </div>
                        </div>

                        {/* Hand Section - Compact */}
                        <div className="flex-1 bg-black/20 rounded-lg p-2 border border-gray-800 flex flex-col">
                            <h3 className="text-[9px] font-bold text-green-400 mb-1.5 uppercase flex items-center gap-1">
                                <span>✋</span> Mão
                            </h3>
                            <div className="grid grid-cols-4 gap-1.5 overflow-y-auto pr-1">
                                {availableHand.map((card) => {
                                    const isSelected = request.selected.includes(card.id);
                                    return (
                                        <div
                                            key={`hand-${card.id}`}
                                            onClick={() => onSelect(card.id)}
                                            className={`relative aspect-[3/4] rounded-sm cursor-pointer transition-all overflow-hidden group ${isSelected
                                                ? 'ring-1 ring-purple-500 scale-95 opacity-50 grayscale'
                                                : 'hover:ring-1 hover:ring-green-400 font-bold'
                                                }`}
                                        >
                                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />

                                            {/* Premium Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none z-10" />

                                            {/* Rarity Tag */}
                                            <div className="absolute top-0 inset-x-0 flex justify-center z-20 pointer-events-none">
                                                <div className="bg-black/70 backdrop-blur-[1px] px-1 py-0.5 rounded-b border-b border-x border-white/10">
                                                    <span className="text-[5px] font-black text-white tracking-tighter uppercase whitespace-nowrap">
                                                        {card.rarity}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Name and Stats */}
                                            <div className="absolute bottom-0 inset-x-0 p-1 flex flex-col justify-end z-20 pointer-events-none">
                                                <span className="text-white text-[6px] font-black uppercase truncate mb-0.5 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                                                    {card.name}
                                                </span>
                                                {card.rarity !== 'Efeito' && (
                                                    <div className="flex justify-between items-center px-0.5">
                                                        <div className="flex items-center gap-0.5 bg-black/60 rounded px-0.5 py-0.25 border border-red-500/20">
                                                            <span className="text-red-400 font-black text-[6px]">{card.atk}</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 bg-black/60 rounded px-0.5 py-0.25 border border-blue-500/20">
                                                            <span className="text-blue-400 font-black text-[6px]">{card.def}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-purple-900/50">
                                                    <span className="text-lg font-bold text-white">💀</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {availableHand.length === 0 && (
                                    <div className="col-span-4 text-center text-gray-600 text-[9px] italic py-6">Mão Vazia</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions - Compact */}
                    <div className="flex gap-2 justify-end mt-4">
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-white font-bold text-xs px-3 py-1.5 hover:bg-white/5 rounded-md transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={request.selected.length !== request.cost}
                            className={`font-bold py-1.5 px-6 rounded-md text-xs transition-all flex items-center gap-1.5 shadow-lg ${request.selected.length === request.cost
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <span>INVOCAR</span>
                            {request.selected.length === request.cost && <span>✨</span>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
