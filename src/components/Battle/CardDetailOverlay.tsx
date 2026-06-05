import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Sword, Zap, Skull } from 'lucide-react';

// import type { Card } from '../../types'; // Removed unused import to fix build

interface CardDetailOverlayProps {
    card: any;
    onClose: () => void;
    // Action Props
    // canAttackDirect removed per user request, logic moved to canActivateAbility
    canActivateAbility?: boolean;
    onActivateAbility?: () => void;

    canChangePosition?: boolean;
    isFaceDownPosition?: boolean; // If true, button says "Switch to Attack"
    onChangePosition?: () => void;

    canRevive?: boolean;
    onRevive?: () => void;
}

export const CardDetailOverlay: React.FC<CardDetailOverlayProps> = ({
    card,
    onClose,
    canActivateAbility, onActivateAbility,
    canChangePosition, isFaceDownPosition, onChangePosition,
    canRevive, onRevive
}) => {
    return (
        <AnimatePresence>
            {card && (
                <motion.div
                    initial={{ x: -260, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -260, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-[62px] bottom-[102px] left-2 w-52 bg-slate-950/98 backdrop-blur-2xl border border-white/10 z-[80] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col pointer-events-auto rounded-xl overflow-hidden"
                >
                    {/* Integrated Header/Image Container */}
                    <div className="relative w-full aspect-[4/5] bg-black shrink-0">
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />

                        {/* Overlay Gradient for Text */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        {/* Overlay Content: Name & Rarity */}
                        <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col items-center text-center">
                            <h2 className="text-sm font-black text-white uppercase tracking-tight leading-tight mb-0.5 drop-shadow-lg">
                                {card.name}
                            </h2>
                            <div className="flex items-center gap-1.5 justify-center">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${card.rarity === 'Supremo' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : 'border-white/20 text-white/60 bg-white/5'
                                    }`}>
                                    {card.rarity}
                                </span>
                            </div>
                        </div>

                        {/* Top Close Button (Floating) */}
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-white/20 flex items-center justify-center transition-colors text-white/50 hover:text-white border border-white/10"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Stats Pill Row - Floating style */}
                    {card.rarity !== 'Efeito' && card.rarity !== 'Zeta' && (
                        <div className="flex justify-center -mt-3 relative z-10 px-3">
                            <div className="flex gap-1.5 bg-slate-900 border border-white/10 rounded-full p-1 shadow-xl">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                                    <Sword size={10} className="text-red-500" />
                                    <span className="text-xs font-black text-red-500 leading-none">
                                        {card.atk || card.currentAttack || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                    <Shield size={10} className="text-blue-500" />
                                    <span className="text-xs font-black text-blue-500 leading-none">
                                        {card.def || card.currentHealth || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description - Clean Glassy Look */}
                    <div className="flex-1 flex flex-col p-3 min-h-0 bg-transparent">
                        <div className="flex-1 overflow-visible">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={10} className="text-cyan-400" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Habilidade</span>
                            </div>
                            <div className="text-[11px] text-slate-300 leading-normal font-medium italic custom-scrollbar overflow-y-auto max-h-32">
                                {card.ability || card.description || "Sem efeito especial."}
                            </div>

                            {/* Tribe/Type Badges */}
                            {(card.tribe || card.type) && (
                                <div className="flex flex-wrap gap-1 mt-4">
                                    {card.type && (
                                        <span className="text-[8px] text-white/30 uppercase font-bold italic border-l border-white/20 pl-2">
                                            {card.type}
                                        </span>
                                    )}
                                    {card.tribe && (
                                        <span className="text-[8px] text-white/30 uppercase font-bold italic border-l border-white/20 pl-2">
                                            {card.tribe}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions - Tight */}
                    <div className="p-3 border-t border-white/10 bg-slate-950 space-y-2">
                        {/* Position Toggle - Hide for Effect/Zeta */}
                        {canChangePosition && onChangePosition && card.rarity !== 'Efeito' && card.rarity !== 'Zeta' && (
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={onChangePosition}
                                    className={`py-2 rounded-lg font-black text-[10px] tracking-widest transition-all border ${!isFaceDownPosition
                                        ? 'bg-orange-600 text-white border-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                                        : 'bg-gray-800/80 text-gray-500 border-white/5 hover:bg-gray-700'
                                        }`}
                                >
                                    MODO ATAQUE
                                </button>
                                <button
                                    onClick={onChangePosition}
                                    className={`py-2 rounded-lg font-black text-[10px] tracking-widest transition-all border ${isFaceDownPosition
                                        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                        : 'bg-gray-800/80 text-gray-500 border-white/5 hover:bg-gray-700'
                                        }`}
                                >
                                    MODO DEFESA
                                </button>
                            </div>
                        )}

                        {canActivateAbility && onActivateAbility && (
                            <button
                                onClick={onActivateAbility}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2 rounded-lg text-white font-black text-[10px] uppercase tracking-wider shadow-lg border border-purple-400/30 flex items-center justify-center gap-2"
                            >
                                <Zap size={12} /> {card.cardId === '90' && (card.counters?.lanternTurns || 0) > 0 ? 'AT Extra' : card.rarity === 'Efeito' ? 'Efeito' : 'Habilidade'}
                            </button>
                        )}

                        {canRevive && onRevive && (
                            <button
                                onClick={onRevive}
                                className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-white font-black text-[10px] uppercase tracking-wider border border-slate-500 flex items-center justify-center gap-2"
                            >
                                <Skull size={12} /> Reviver
                            </button>
                        )}
                    </div>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
};
