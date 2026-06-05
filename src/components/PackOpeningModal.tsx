import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card, Pack } from '../types';
import { CardVisual } from './CardVisual';

interface PackOpeningModalProps {
    pack: Pack | null;
    cards: Card[];
    onClose: () => void;
    skipAnimation?: boolean;
}

type OpeningPhase = 'closed' | 'ready' | 'opening' | 'revealing' | 'complete';

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
    pack,
    cards,
    onClose,
    skipAnimation = false
}) => {
    // 1. Sort cards by rarity (Lowest to Highest)
    // Rarity Order: Efeito/Common -> Rare -> Epic -> Legendary -> Zeta -> Omega -> Divino
    const [sortedCards, setSortedCards] = useState<Card[]>([]);

    useEffect(() => {
        if (cards.length > 0) {
            const rarityOrder: { [key: string]: number } = {
                'Efeito': 1,
                'Recruta': 2,
                'Soldado': 3,
                'Paladino': 4,
                'Gladiador': 5,
                'Veterano': 6,
                'Elite': 7,
                'Titã': 8,
                'Lendário': 9,
                'Destruidor': 10,
                'Supremo': 11,
                'Zeta': 12,
                'Fusão': 13
            };

            const sorted = [...cards].sort((a, b) => {
                const rankA = rarityOrder[a.rarity] || 0;
                const rankB = rarityOrder[b.rarity] || 0;
                return rankA - rankB;
            });
            setSortedCards(sorted);
        }
    }, [cards]);

    const [phase, setPhase] = useState<OpeningPhase>(skipAnimation ? 'complete' : 'opening');
    const [revealedCount, setRevealedCount] = useState(skipAnimation ? cards.length : 0);

    // Track the card currently being presented in "one-by-one" mode
    // If revealedCount < cards.length, we show sortedCards[revealedCount] as the "New Card"
    const currentCard = sortedCards[revealedCount];
    const isFinished = revealedCount >= sortedCards.length;

    // Auto-advance opening → revealing
    useEffect(() => {
        if (phase === 'opening') {
            const timer = setTimeout(() => {
                setPhase('revealing');
            }, 800); // 0.8s explosion animation
            return () => clearTimeout(timer);
        }
    }, [phase]);

    const handleNextCard = () => {
        if (phase === 'revealing' && !isFinished) {
            setRevealedCount(prev => prev + 1);
        }
        if (phase === 'revealing' && revealedCount + 1 >= sortedCards.length) {
            setTimeout(() => setPhase('complete'), 500);
        }
    };

    const handleSkip = () => {
        setRevealedCount(sortedCards.length);
        setPhase('complete');
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'Supremo': return 'shadow-[0_0_50px_rgba(168,85,247,1)] ring-4 ring-purple-400';
            case 'Destruidor': return 'shadow-[0_0_40px_rgba(225,29,72,0.9)] ring-2 ring-red-500';
            case 'Zeta': return 'shadow-[0_0_35px_rgba(79,70,229,0.8)] ring-2 ring-blue-500';
            case 'Lendário': return 'shadow-[0_0_35px_rgba(148,0,211,0.8)] ring-2 ring-purple-600';
            default: return 'shadow-xl';
        }
    };



    if (!pack || sortedCards.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
                onClick={() => {
                    // Allow clicking backdrop to progress irrelevant of where you click
                    if (phase === 'revealing') {
                        handleNextCard();
                    }
                }}
            >
                <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden">

                    {/* Skip Button */}
                    {phase !== 'complete' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                            className="absolute top-8 right-8 text-gray-400 hover:text-white uppercase text-xs font-bold tracking-widest z-50"
                        >
                            Pular Animação
                        </button>
                    )}

                    {/* PHASE 1: OPENING PACK EXPLOSION */}
                    {phase === 'opening' && (
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{
                                scale: [1, 1.25, 0],
                                rotateZ: [0, 10, -10, 720],
                                opacity: [1, 1, 0]
                            }}
                            transition={{ duration: 1.5, ease: "backInOut" }}
                            className="relative w-64 h-96 flex items-center justify-center z-20"
                        >
                            {/* Card Back as Pack Front */}
                            <div className="absolute inset-0 bg-gray-900 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)] border-2 border-white/20 overflow-hidden">
                                <img
                                    src="/cards/capa1.png"
                                    className="w-full h-full object-cover"
                                    alt="Pack Front"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/10" />
                            </div>

                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="relative z-10 flex flex-col items-center gap-2"
                            >
                                <div className={`text-4xl font-black italic tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,1)] text-white uppercase`}>
                                    {pack.tier}
                                </div>
                                <div className="h-0.5 w-12 bg-white/50 rounded-full" />
                            </motion.div>

                            {/* Particles/Glow */}
                            <div className="absolute -inset-20 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
                        </motion.div>
                    )}

                    {/* PHASE 2: REVEALING ONE BY ONE */}
                    {phase === 'revealing' && currentCard && (
                        <div className="flex flex-col items-center justify-center h-full w-full z-10 py-12">
                            <motion.div
                                key={currentCard.id}
                                initial={{ scale: 0.1, y: 300, rotateY: 360, opacity: 0 }}
                                animate={{ scale: 1.5, y: 0, rotateY: 0, opacity: 1 }}
                                exit={{ scale: 2, opacity: 0, filter: "brightness(2) blur(10px)" }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    opacity: { duration: 0.3 }
                                }}
                                className="relative flex flex-col items-center"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextCard();
                                }}
                            >
                                {/* Fixed sizing to prevent compression */}
                                <div className="w-[180px] h-[260px] md:w-[240px] md:h-[340px] flex items-center justify-center">
                                    <CardVisual
                                        card={currentCard}
                                        size="md" // Reduced from lg
                                        className={`w-full h-full border-0 ${getRarityGlow(currentCard.rarity)}`}
                                        showName={true}
                                    />
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-center mt-12"
                                >
                                    <div className="text-gray-400 text-xs font-black tracking-[0.4em] uppercase mb-2">
                                        Clique para revelar
                                    </div>
                                    <div className="text-white text-lg font-black italic">
                                        {revealedCount + 1} de {sortedCards.length}
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    )}

                    {/* PHASE 3: COMPLETE SUMMARY */}
                    {phase === 'complete' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-6xl flex flex-col items-center"
                        >
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-8 uppercase tracking-wider drop-shadow-sm">
                                Pack Aberto!
                            </h2>

                            <div className="grid grid-cols-5 gap-4 w-full mb-8">
                                {sortedCards.map((card, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative group aspect-[3/4]"
                                    >
                                        <CardVisual
                                            card={card}
                                            size="md"
                                            className="w-full h-full border-0 bg-transparent shadow-none"
                                            showName={true}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className="bg-white text-black px-8 py-3 rounded-full font-black text-sm hover:scale-105 transition shadow-[0_0_30px_rgba(255,255,255,0.3)] uppercase tracking-widest"
                            >
                                Adicionar à Coleção
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
