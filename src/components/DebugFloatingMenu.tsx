import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trash2, Search, PlusCircle } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { initialCards } from '../data/cards';

export const DebugFloatingMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [cardIdInput, setCardIdInput] = useState('');
    const { profile, updateProfile } = useGame();

    const handleCheatAddCard = () => {
        if (!cardIdInput) return;

        const card = initialCards.find(c => c.id === cardIdInput);
        if (!card) {
            alert('❌ Card ID não encontrado!');
            return;
        }

        const isBattle = window.location.pathname.includes('/battle');

        if (isBattle) {
            const event = new CustomEvent('cheat:addCard', { detail: cardIdInput });
            window.dispatchEvent(event);
            setCardIdInput('');
        } else {
            const currentOwned = new Set(profile.ownedCards || []);
            currentOwned.add(cardIdInput);
            updateProfile({ ownedCards: Array.from(currentOwned) });
            alert(`✅ ${card.name} adicionado à coleção!`);
            setCardIdInput('');
        }
    };

    const handleResetAccount = () => {
        if (window.confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados salvos. Continuar?')) {
            localStorage.clear();
            alert('🗑️ Conta resetada. A página será recarregada.');
            window.location.reload();
        }
    };

    return (
        <>
            {/* Minimalist Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-[300] w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-full shadow-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-black/80 transition-all pointer-events-auto"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Magica ✨"
            >
                {isOpen ? <X size={20} /> : <Zap size={20} />}
            </motion.button>

            {/* Minimalist Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-16 right-4 z-[299] w-72 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                    >
                        {/* Compact Header */}
                        <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h2 className="text-[10px] font-black tracking-widest text-white/40 uppercase">MODO DEBUG</h2>
                            <div className="flex gap-2">
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold uppercase">Active</span>
                            </div>
                        </div>

                        <div className="p-3 space-y-4">
                            {/* Arena Section */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Ajuste de Arena (Troféus)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            value={profile.trophies}
                                            onChange={(e) => updateProfile({ trophies: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black/40 border border-white/5 rounded-lg pl-3 pr-3 py-1.5 text-xs text-indigo-400 font-black focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        />
                                    </div>
                                    <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20 flex items-center justify-center">
                                        🏆
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/5" />

                            {/* Cheat Section */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Cheat Menu (Add Card ID)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                                        <input
                                            type="text"
                                            value={cardIdInput}
                                            onChange={(e) => setCardIdInput(e.target.value)}
                                            placeholder="Ex: 1040"
                                            className="w-full bg-black/40 border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCheatAddCard}
                                        className="p-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition-colors border border-purple-500/20"
                                        title="Adicionar à Mão/Coleção"
                                    >
                                        <PlusCircle size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/5" />

                            {/* Quick Tools */}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleResetAccount}
                                    className="w-full flex items-center justify-center gap-2 p-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                        <Trash2 size={12} />
                                    </div>
                                    <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-tighter">Reset Account</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
