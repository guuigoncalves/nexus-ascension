import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../../types';

interface SearchOverlayProps {
    isOpen: boolean;
    filter: (card: Card) => boolean;
    deck: Card[];
    count: number;
    onResolve: (selectedIds: string[]) => void;
    onCancel: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
    isOpen,
    filter,
    deck,
    count,
    onResolve,
    onCancel
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    if (!isOpen) return null;

    const availableCards = deck.filter(filter);

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            if (selectedIds.length < count) {
                setSelectedIds(prev => [...prev, id]);
            }
        }
    };

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-[100] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                    onClick={onCancel}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.2)] z-10 pointer-events-auto max-h-[80vh] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Busca no Deck</h2>
                            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Selecione {count} {count > 1 ? 'cartas' : 'carta'}</p>
                        </div>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-lg">
                            <span className="text-cyan-400 font-black text-xl">{selectedIds.length} / {count}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-4 gap-4 mb-6">
                        {availableCards.map(card => {
                            const isSelected = selectedIds.includes(card.id);
                            return (
                                <motion.div
                                    key={card.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleSelect(card.id)}
                                    className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-slate-700 hover:border-slate-500'
                                        }`}
                                >
                                    <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                    <div className="absolute bottom-2 inset-x-2 text-center">
                                        <span className="text-[8px] font-black text-white uppercase truncate block leading-tight">{card.name}</span>
                                        <span className="text-[6px] font-bold text-cyan-400 uppercase tracking-widest">{card.rarity}</span>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20 backdrop-blur-[2px]">
                                            <div className="bg-cyan-500 text-white rounded-full p-2 shadow-lg scale-125">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                        {availableCards.length === 0 && (
                            <div className="col-span-4 py-20 text-center">
                                <span className="text-slate-500 italic">Nenhuma carta compatível encontrada no deck.</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2.5 rounded-xl font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => onResolve(selectedIds)}
                            disabled={selectedIds.length !== count && availableCards.length >= count}
                            className={`px-10 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg border-b-4 ${(selectedIds.length === count || availableCards.length < count)
                                    ? 'bg-cyan-600 border-cyan-800 text-white hover:bg-cyan-500 hover:-translate-y-0.5 active:translate-y-0 active:border-b-0'
                                    : 'bg-slate-800 border-slate-900 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            Confirmar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
