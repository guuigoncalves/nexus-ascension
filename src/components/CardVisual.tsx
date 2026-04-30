import React from 'react';
import type { Card } from '../types';
import { getAuraColor, getSupremeGlow } from '../constants/rarityColors';

interface CardVisualProps {
    card: Card | any;
    size?: 'sm' | 'md' | 'lg' | 'hand' | 'fluid';
    isSelected?: boolean;
    isFaceDown?: boolean;
    effectiveStats?: { currentAttack: number; currentHealth: number };
    className?: string;
    showName?: boolean;
}

export const CardVisual: React.FC<CardVisualProps> = ({
    card,
    size = 'md',
    isFaceDown = false,
    effectiveStats,
    className = "",
    showName = true
}) => {
    if (!card) return null;
    const auraColor = getAuraColor(card?.rarity);

    // Proportional scaling based on size
    const sizeClasses = {
        sm: 'w-20 h-28',
        md: 'w-24 h-36',
        lg: 'w-32 h-44',
        hand: 'w-32 h-44',
        fluid: 'w-full h-full'
    };

    if (isFaceDown) {
        return (
            <div className={`${sizeClasses[size]} rounded-xl overflow-hidden relative ${className}`}>
                <img
                    src="/cards/capa1.png"
                    alt="Card Back"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        );
    }

    const displayAtk = String(effectiveStats ? effectiveStats.currentAttack : (card.atk || 0));
    const displayDef = String(effectiveStats ? effectiveStats.currentHealth : (card.def || 0));

    const isDamaged = effectiveStats && card.def && effectiveStats.currentHealth < card.def;
    const isBuffedAtk = effectiveStats && card.atk && effectiveStats.currentAttack > card.atk;
    const isBuffedDef = effectiveStats && card.def && effectiveStats.currentHealth > card.def;

    return (
        <div
            className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gray-950 relative transition-all duration-300 group ${className}`}
            style={{
                boxShadow: card.rarity === 'Supremo'
                    ? `0 0 25px ${getSupremeGlow()}`
                    : `0 0 20px ${auraColor}66`,
                border: `1px solid ${auraColor}44` // Adicionando borda sutil com a cor da raridade
            }}
        >
            {/* Full Art Image */}
            <img
                src={card.image}
                alt={card.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Top Name Overlay - Positioned at Top */}
            {showName && (
                <div className="absolute top-2 inset-x-0 text-center px-2 z-20 pointer-events-none">
                    <span className="text-white/60 font-black text-[8px] uppercase tracking-tight drop-shadow-lg truncate block leading-none">
                        {card.name.replace(/\s*\(.*?\)\s*/g, '').trim()}
                    </span>
                </div>
            )}

            {/* Top Gradient Overlay (for name readability) */}
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>

            {/* Bottom Gradient Overlay (Stronger for text readability) */}
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>

            {/* Card Content Overlay - High Density Layout */}
            <div className="absolute inset-0 flex flex-col justify-end p-2 pb-1.5 pointer-events-none">
                {/* 1. Rarity Level */}
                <div className="w-full text-center">
                    <span className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">
                        {card.rarity}
                    </span>
                </div>

                {/* 3. Neutral Stats Row */}
                {card.rarity !== 'Efeito' && card.rarity !== 'Zeta' && (
                    <div className="flex justify-center items-end gap-1 w-full mb-0.5">
                        <div className="flex-1 flex flex-col items-center gap-[1px]">
                            <span className="text-[5px] font-black text-white/50 uppercase leading-none tracking-wider">AT</span>
                            <div className="w-full bg-black/80 backdrop-blur-sm rounded-sm border border-white/10 flex items-center justify-center h-[16px] shadow-lg">
                                <span className={`${isBuffedAtk ? 'text-yellow-300' : 'text-white'} font-mono tabular-nums font-bold text-[8px] leading-none`}>
                                    {displayAtk}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-[1px]">
                            <span className="text-[5px] font-black text-white/50 uppercase leading-none tracking-wider">DF</span>
                            <div className="w-full bg-black/80 backdrop-blur-sm rounded-sm border border-white/10 flex items-center justify-center h-[16px] shadow-lg">
                                <span className={`${isDamaged ? 'text-red-400' : (isBuffedDef ? 'text-yellow-300' : 'text-white')} font-mono tabular-nums font-bold text-[8px] leading-none`}>
                                    {displayDef}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Integrated Ability Text (HB Style) */}
                <div className="w-full px-0.5">
                    <div className="max-h-[32px] overflow-hidden">
                        <p className="text-[7px] text-white/70 leading-[1.1] font-medium text-center line-clamp-3 italic opacity-90">
                            {card.ability || card.description || ""}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
