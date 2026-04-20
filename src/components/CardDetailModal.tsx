import React from 'react';
import { X, Shield, Swords, Zap, Layers, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../types';

interface CardDetailModalProps {
    card: Card;
    onClose: () => void;
    isLocked?: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, isLocked }) => {
    // Helper para cores baseadas na raridade (Estilo Neon/Glow)
    const getRarityTheme = (rarity: string) => {
        const themes: Record<string, { color: string; bg: string; border: string; glow: string }> = {
            // Níveis Baixos
            'Soldado': { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', glow: 'shadow-gray-500/50' },
            'Paladino': { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30', glow: 'shadow-amber-600/50' },
            'Gladiador': { color: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/30', glow: 'shadow-slate-400/50' },
            'Veterano': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/50' },

            // Níveis Médios
            'Elite': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-blue-500/50' },
            'Titã': { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/50' },

            // Níveis Altos
            'Lendário': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-purple-500/50' },
            'Destruidor': { color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', glow: 'shadow-pink-500/50' },

            // Top Tier
            'Supremo': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-red-500/50' },
            'Fusão': { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-orange-500/50' },
            'Zeta': { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', glow: 'shadow-fuchsia-500/50' },

            // Especiais
            'Efeito': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/50' },
            'Divino': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/50' },

            default: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', glow: 'shadow-gray-500/50' }
        };
        return themes[rarity] || themes.default;
    };

    const theme = getRarityTheme(card.rarity);
    // Regra explícita: Se for raridade 'Efeito', remove stats visualmente independente de valores
    const hasStats = card.rarity !== 'Efeito' && (card.atk !== undefined || card.def !== undefined);

    // Ajuste de layout dinâmico para quando não tem stats (ocupa mais espaço)
    const descriptionClass = hasStats
        ? "space-y-1.5 flex-1 min-h-[80px] flex flex-col"
        : "space-y-2 flex-1 min-h-[150px] flex flex-col mt-4"; // Mais margem e altura mínima se for Efeito

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`relative w-full max-w-3xl bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[85vh]`}
                >
                    {/* Background Ambient Glow (Optional subtle tint) */}
                    <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px] pointer-events-none ${theme.bg.replace('/10', '/30')}`} />
                    <div className={`absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px] pointer-events-none ${theme.bg.replace('/10', '/30')}`} />

                    {/* CLOSE BUTTON */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-50 p-1.5 bg-black/50 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-colors backdrop-blur-sm border border-white/5"
                    >
                        <X size={18} />
                    </button>

                    {/* LEFT: VISUAL (Image & Flavor) - Compact */}
                    <div className="w-full md:w-[280px] shrink-0 relative bg-black/40 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-white/5 overflow-hidden group">
                        {/* Dynamic Background Image (Blurred) */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                            style={{ backgroundImage: `url(${card.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />

                        {/* Main Card Image - FIT exactly to image size */}
                        <motion.div
                            className={`relative w-auto h-auto rounded-lg shadow-2xl z-10 transform group-hover:scale-[1.02] transition-transform duration-500`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className={`absolute -inset-1 rounded-lg blur opacity-40 ${theme.bg.replace('/10', '')}`} />
                            <img
                                src={card.image || `https://placehold.co/300x400/gray/white?text=${card.id}`}
                                alt={card.name}
                                className={`block max-h-[350px] w-auto object-contain rounded-lg border-2 border-white/10 relative z-20 ${isLocked ? 'grayscale brightness-50' : ''}`}
                                onError={(e) => (e.target as HTMLImageElement).src = `https://placehold.co/300x400/gray/white?text=${card.id}`}
                            />

                            {/* Locked Overlay */}
                            {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center z-30">
                                    <div className="bg-red-600/90 text-white px-4 py-1 text-[10px] uppercase font-black tracking-[0.3em] border border-red-400 rotate-12 shadow-lg backdrop-blur-sm">
                                        Bloqueado
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* RIGHT: DATA (Tech Specs) - Compact */}
                    <div className="flex-1 p-5 relative flex flex-col gap-4 overflow-y-auto md:overflow-hidden custom-scrollbar">

                        {/* HEADER: Name & Badges */}
                        <div className="space-y-1">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <motion.h2
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none truncate"
                                        title={card.name}
                                    >
                                        {card.name}
                                    </motion.h2>
                                    <div className={`text-[10px] font-mono font-bold mt-1.5 uppercase tracking-widest flex items-center gap-1.5 ${theme.color}`}>
                                        <Layers size={12} />
                                        {card.universe}
                                    </div>
                                </div>
                                <div className={`shrink-0 px-3 py-1 rounded border-l-4 font-mono text-xs font-black uppercase tracking-wider backdrop-blur-sm bg-white/5 shadow-lg ${theme.color} ${theme.border}`}>
                                    {card.rarity}
                                </div>
                            </div>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent my-1" />

                        {/* STATS GRID - Conditional Rendering */}
                        {hasStats && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative group overflow-hidden bg-white/[0.03] border border-white/5 rounded-md p-2.5 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <Swords size={20} className="text-red-500" />
                                    </div>
                                    <div className="text-[8px] text-gray-500 font-mono uppercase tracking-widest mb-0.5">Ataque</div>
                                    <div className="text-xl font-black text-white group-hover:text-red-400 transition-colors tabular-nums leading-none">
                                        {card.atk || 0}
                                    </div>
                                </div>

                                <div className="relative group overflow-hidden bg-white/[0.03] border border-white/5 rounded-md p-2.5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
                                    <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <Shield size={20} className="text-cyan-500" />
                                    </div>
                                    <div className="text-[8px] text-gray-500 font-mono uppercase tracking-widest mb-0.5">Defesa</div>
                                    <div className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors tabular-nums leading-none">
                                        {card.def || 0}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* COST */}
                        {card.cost !== undefined && (
                            <div className="absolute top-5 right-5 flex items-center gap-2 pointer-events-none opacity-50">
                                <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-[10px] font-bold border border-yellow-500/30">
                                    {card.cost}
                                </div>
                            </div>
                        )}

                        {/* ABILITY / DESCRIPTION - FLEXIBLE HEIGHT */}
                        <div className={descriptionClass}>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                <Info size={10} />
                                Habilidade
                            </div>
                            <div className={`flex-1 relative p-3 rounded-md border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden`}>
                                <div className={`absolute top-0 left-0 w-0.5 h-full ${theme.bg.replace('/10', '')}`} />
                                <div className="relative z-10 h-full overflow-y-auto pr-1 custom-scrollbar">
                                    {card.description || card.ability ? (
                                        <p className={`text-gray-300 font-light leading-relaxed italic ${(card.description || card.ability || '').length > 200 ? 'text-xs' : (card.description || card.ability || '').length > 100 ? 'text-sm' : 'text-base'}`}>
                                            "{card.description || card.ability}"
                                        </p>
                                    ) : (
                                        <p className="text-gray-600 italic text-sm">Sem descrição.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* EFFECTS (Compact) */}
                        {card.effects && card.effects.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-white/5 shrink-0">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                    <Star size={10} />
                                    Efeito
                                </div>
                                <div className="grid gap-1.5 max-h-[60px] overflow-y-auto custom-scrollbar">
                                    {card.effects.map((effect, idx) => (
                                        <div key={idx} className="flex gap-2 items-start bg-black/40 p-1.5 rounded border border-white/5">
                                            <div className="text-[8px] bg-white/10 text-white px-1.5 py-0.5 rounded uppercase font-bold whitespace-nowrap">{effect.type}</div>
                                            <p className="text-[9px] text-gray-400 leading-tight">{effect.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer ID */}
                        <div className="mt-auto pt-1 flex justify-end opacity-20 shrink-0">
                            <span className="font-mono text-[8px] uppercase">ID: {card.id}</span>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
