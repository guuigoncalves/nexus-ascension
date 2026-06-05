import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattle } from '../../contexts/BattleContext';
import { CardVisual } from '../CardVisual';
import { getAuraColor } from '../../constants/rarityColors';

interface BattleSlotProps {
    unit: any;
    index: number;
    isPlayer: boolean;
    isSelected: boolean;
    canAttack: boolean;
    canBeTargeted: boolean;
    onSelect: () => void;
    onAttack: () => void;
}

export const BattleSlot: React.FC<BattleSlotProps> = ({
    unit,
    isPlayer,
    isSelected,
    canAttack,
    canBeTargeted,
    onSelect,
    onAttack
}) => {
    const { playerBoard, opponentBoard, getUnitWithAuras, targetSelectionMode } = useBattle();
    const effectiveUnit = unit ? getUnitWithAuras(unit, isPlayer ? playerBoard : opponentBoard) : null;

    const auraColor = unit ? getAuraColor(unit.rarity) : 'transparent';

    const [prevHealth, setPrevHealth] = useState(unit?.currentHealth);
    const [damage, setDamage] = useState<number | null>(null);

    useEffect(() => {
        if (unit && prevHealth !== undefined && unit.currentHealth < prevHealth) {
            const dmg = prevHealth - unit.currentHealth;
            setDamage(dmg);
            setTimeout(() => setDamage(null), 1000);
        }
        setPrevHealth(unit?.currentHealth);
    }, [unit?.currentHealth]);

    return (
        <div
            onClick={() => {
                if (isPlayer) {
                    onSelect();
                } else if (!isPlayer && targetSelectionMode?.active) {
                    onSelect();
                } else if (!isPlayer && canBeTargeted) {
                    onAttack();
                }
            }}
            className={`aspect-[2/3] border-2 rounded-lg transition-all relative overflow-hidden ${unit
                ? isSelected
                    ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_25px_rgba(234,179,8,0.4)] ring-2 ring-yellow-400/50'
                    : canBeTargeted
                        ? 'border-red-500 bg-red-500/10 cursor-crosshair animate-pulse'
                        : canAttack
                            ? 'border-cyan-400 bg-cyan-400/10 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : ''
                : 'border-cyan-500/10 bg-black/20 hover:border-cyan-400/30'
                }`}
            style={{
                boxShadow: unit ? `0 0 25px ${auraColor}66, inset 0 0 15px ${auraColor}44` : undefined,
                borderColor: unit ? auraColor : undefined
            }}
        >
            {/* Slot Rune/Marking (When empty) - Matching the image's circular/linear runes */}
            {!unit && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-10 h-10 border border-cyan-400 rounded-full flex items-center justify-center">
                        <div className="w-6 h-[1px] bg-cyan-400 rotate-45"></div>
                        <div className="w-6 h-[1px] bg-cyan-400 -rotate-45"></div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {unit && (
                    <motion.div
                        key={unit.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, filter: 'grayscale(100%)' }}
                        className="absolute inset-0"
                    >
                        {/* Card Visuals (Face-Up or Face-Down) */}
                        <CardVisual
                            card={unit}
                            isFaceDown={unit.isFaceDown}
                            isSelected={isSelected}
                            effectiveStats={effectiveUnit ? { currentAttack: effectiveUnit.currentAttack, currentHealth: effectiveUnit.currentHealth } : undefined}
                            showName={true}
                            className="w-full h-full border-0 shadow-none bg-transparent"
                        />

                        {/* Ability Indicator */}
                        {unit && !unit.isFaceDown && (unit.ability || unit.effect) && (
                            <div className="absolute top-1 left-1 z-10">
                                <span className="text-cyan-400 text-xs drop-shadow-[0_0_2px_rgba(34,211,238,0.8)] filter brightness-125">⚡</span>
                            </div>
                        )}
                        {/* Ready indicator */}
                        {canAttack && !isSelected && (
                            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50 z-10"></div>
                        )}

                        {/* Selection border */}
                        {isSelected && (
                            <div className="absolute inset-0 border-2 border-yellow-400 rounded-sm animate-pulse z-10"></div>
                        )}

                        {/* Target indicator */}
                        {canBeTargeted && (
                            <div className="absolute inset-0 border-2 border-red-400 rounded-sm animate-pulse z-10"></div>
                        )}

                        {/* Damage Number */}
                        <AnimatePresence>
                            {damage !== null && (
                                <motion.div
                                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                                    animate={{ y: -20, opacity: 0, scale: 1.5 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                                >
                                    <span className="text-red-500 font-black text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                        -{damage}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
