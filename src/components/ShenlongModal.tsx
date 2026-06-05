import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star } from 'lucide-react';

interface ShenlongModalProps {
    onClose: () => void;
    onWish: (wish: string) => void;
}

export const ShenlongModal: React.FC<ShenlongModalProps> = ({ onClose, onWish }) => {
    const [phase, setPhase] = useState<'summoning' | 'choosing' | 'granted'>('summoning');
    const [selectedWish, setSelectedWish] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPhase('choosing');
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const wishes = [
        { id: 'all_cards', title: 'Poder Ilimitado', desc: 'Desbloquear TODAS as cartas do jogo.', icon: '🎴' },
        { id: 'money', title: 'Riqueza Eterna', desc: 'Receber 1.000.000 de Grana.', icon: '💰' },
        { id: 'level', title: 'Mestre do Nível', desc: 'Subir instantaneamente para o Nível 50.', icon: '⬆️' }
    ];

    const handleWishSelection = (wish: typeof wishes[0]) => {
        setSelectedWish(wish.title);
        setPhase('granted');
        setTimeout(() => {
            onWish(wish.title);
            onClose();
        }, 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl overflow-hidden"
        >
            {/* Shenlong Background Visuals */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 via-transparent to-transparent" />
                <motion.div
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px]"
                />
            </div>

            <div className="relative w-full max-w-2xl bg-black/60 border border-green-500/30 rounded-3xl p-8 overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.2)]">
                {/* Header Particles */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-[0_0_20px_rgba(34,197,94,0.8)]" />

                <AnimatePresence mode="wait">
                    {phase === 'summoning' && (
                        <motion.div
                            key="summoning"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className="flex flex-col items-center text-center py-12"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="relative w-48 h-48 mb-8"
                            >
                                <div className="absolute inset-0 border-4 border-dashed border-green-500/30 rounded-full" />
                                <div className="absolute inset-4 border-2 border-green-400/20 rounded-full animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Star className="text-yellow-400 fill-yellow-400" size={60} />
                                </div>
                            </motion.div>
                            <h1 className="text-4xl font-black italic text-green-400 tracking-tighter mb-4">INVOCANDO SHENLONG...</h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aqueça seu espírito, o dragão está vindo.</p>
                        </motion.div>
                    )}

                    {phase === 'choosing' && (
                        <motion.div
                            key="choosing"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black italic text-white mb-2">QUUAL É O SEU DESEJO?</h2>
                                <p className="text-green-500 font-bold text-xs tracking-widest uppercase">EU POSSO REALIZAR QUALQUER COISA...</p>
                            </div>

                            <div className="grid gap-4">
                                {wishes.map((w) => (
                                    <motion.button
                                        key={w.id}
                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(34,197,94,0.1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleWishSelection(w)}
                                        className="w-full flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-all text-left group"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-black/40 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                                            {w.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xl font-black text-white group-hover:text-green-400 transition">{w.title}</div>
                                            <div className="text-sm text-gray-400 font-medium">{w.desc}</div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition">
                                            <Sparkles className="text-green-400" size={24} />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {phase === 'granted' && (
                        <motion.div
                            key="granted"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center text-center py-20"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0, 1]
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-24 h-24 bg-green-500 rounded-full blur-2xl mb-8"
                            />
                            <h2 className="text-5xl font-black italic text-white mb-4">DESEJO REALIZADO!</h2>
                            <p className="text-green-400 text-xl font-bold uppercase tracking-[0.2em]">{selectedWish}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {phase !== 'granted' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};
