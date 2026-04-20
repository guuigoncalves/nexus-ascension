import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../types';
import { CardComponent } from './CardComponent';
import { X } from 'lucide-react';

interface PackOpenModalProps {
    isOpen: boolean;
    cards: Card[];
    bonusGrana: number;
    onClose: () => void;
}

export const PackOpenModal: React.FC<PackOpenModalProps> = ({ isOpen, cards, bonusGrana, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-auto border-2 border-yellow-500/50 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-yellow-500">Pack Aberto!</h2>
                                <p className="text-gray-400">Você ganhou {cards.length} cartas + {bonusGrana} 💰</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-700 rounded-full transition"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {cards.map((card, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50, rotateY: 180 }}
                                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <CardComponent card={card} scale={0.8} />
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-6 w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            Continuar
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
