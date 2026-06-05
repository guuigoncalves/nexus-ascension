import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../../types';
import { getAuraColor } from '../../constants/rarityColors';

interface Unit extends Card {
    currentHealth: number;
    currentAttack: number;
    canAttack: boolean;
    isTaunt?: boolean;
}

interface UnitCardProps {
    unit: Unit;
    isPlayer: boolean;
    onClick?: () => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, isPlayer, onClick }) => {
    const auraColor = getAuraColor(unit.rarity);
    const canAttackBorder = unit.canAttack && isPlayer ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]' : '';

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                boxShadow: `0 0 15px ${auraColor}44, inset 0 0 10px ${auraColor}33`,
                borderColor: `${auraColor}66`
            }}
            className={`relative w-36 h-48 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${canAttackBorder}`}
        >
            {/* Card Image */}
            <div className="absolute inset-0">
                <img src={unit.image} alt={unit.name} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />
            </div>

            {/* Aura Glow Layer (Inner and Outer) */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-50"
                style={{
                    background: `radial-gradient(circle at center, transparent 60%, ${auraColor}22 100%)`,
                    boxShadow: `inset 0 0 20px ${auraColor}44`
                }}
            />

            {/* Name and Stats */}
            <div className="absolute bottom-0 inset-x-0 p-2 flex flex-col justify-end z-20 pointer-events-none">
                <div className="w-full text-center mb-1">
                    <span className="text-white font-black text-[10px] uppercase tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,1)] truncate block leading-tight">
                        {unit.name}
                    </span>
                </div>

                {(unit.rarity !== 'Efeito' && unit.rarity !== 'Zeta') && (
                    <div className="flex justify-between items-center gap-1">
                        <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 border border-red-500/30">
                            <span className="text-[8px]">⚔️</span>
                            <span className="text-red-400 font-black text-[10px]">{unit.currentAttack}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 border border-blue-500/30">
                            <span className="text-blue-400 font-black text-[10px]">{unit.currentHealth}</span>
                            <span className="text-[8px]">🛡️</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Taunt Indicator (Optional Visual) */}
            {unit.isTaunt && (
                <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-xl pointer-events-none animate-pulse"></div>
            )}

            {/* Sleep Zzz (if cannot attack) */}
            {!unit.canAttack && isPlayer && (
                <div className="absolute top-2 right-2 text-[10px] font-black text-gray-400 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg border border-white/10 shadow-lg z-30">
                    💤
                </div>
            )}
        </motion.div>
    );
};
