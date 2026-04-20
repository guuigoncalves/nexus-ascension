import React from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../../types';

interface Unit extends Card {
    currentHealth: number;
    currentAttack: number;
    canAttack: boolean;
}

interface DivineSlotProps {
    unit: Unit | null;
    isPlayer: boolean;
    position: 'left' | 'right';
    onClick?: () => void;
}

export const DivineSlot: React.FC<DivineSlotProps> = ({ unit, isPlayer, onClick }) => {
    if (!unit) return null;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            onClick={onClick}
            className={`
                relative w-24 h-32 rounded-lg overflow-hidden cursor-pointer
                border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]
                bg-gradient-to-br from-purple-900/40 to-indigo-900/40
                hover:scale-105 transition-transform
                ${isPlayer ? 'hover:border-purple-300' : ''}
            `}
        >
            {/* Card Image */}
            <img
                src={unit.image}
                alt={unit.name}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Divine Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-purple-500/20 pointer-events-none" />

            {/* Card Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10 flex flex-col justify-end p-1.5 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent">
                {/* Name */}
                <div className="w-full text-center mb-1">
                    <span className="text-white font-black text-[9px] uppercase tracking-wide drop-shadow-[0_2px_3px_rgba(0,0,0,1)] truncate block leading-tight">
                        {unit.name}
                    </span>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between items-center gap-1">
                    <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded px-1 py-0.5 border border-purple-500/30">
                        <span className="text-[10px]">⚔️</span>
                        <span className="text-purple-300 font-black text-[10px]">{unit.currentAttack}</span>
                    </div>
                    <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded px-1 py-0.5 border border-purple-500/30">
                        <span className="text-purple-300 font-black text-[10px]">{unit.currentHealth}</span>
                        <span className="text-[10px]">🛡️</span>
                    </div>
                </div>
            </div>

            {/* Rarity Indicator (Replaces the large one) */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-10 pointer-events-none">
                <div className="bg-purple-600/90 backdrop-blur-[2px] px-2 py-0.5 rounded-b-lg border-b border-x border-purple-400/50 shadow-lg">
                    <span className="text-[8px] font-black text-white tracking-widest uppercase">
                        {unit.rarity}
                    </span>
                </div>
            </div>

            {/* Ready Indicator */}
            {unit.canAttack && isPlayer && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            )}
        </motion.div>
    );
};
