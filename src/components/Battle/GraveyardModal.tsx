import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../../types';
import { getRarityColor } from '../../utils/cardUtils';

interface GraveyardModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: Card[];
    title: string;
}

export const GraveyardModal: React.FC<GraveyardModalProps> = ({ isOpen, onClose, cards, title }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 border-2 border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-200">🪦 {title} ({cards.length})</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {cards.length === 0 ? (
                            <div className="h-40 flex items-center justify-center text-gray-500 italic">
                                O cemitério está vazio... por enquanto.
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {cards.map((card, index) => (
                                    <div key={`${card.id}-${index}`} className="relative aspect-[2/3] group">
                                        <div className={`absolute inset-0 rounded-lg border-2 ${getRarityColor(card.rarity)} opacity-75`}></div>
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] text-center truncate rounded-b-lg">
                                            {card.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
