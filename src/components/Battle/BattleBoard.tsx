import { BattleSlot } from './BattleSlot';
import { useBattle } from '../../contexts/BattleContext';
import React from 'react';

interface BattleBoardProps {
    interactionDisabled?: boolean;
}

export const BattleBoard: React.FC<BattleBoardProps> = ({ interactionDisabled }) => {
    const {
        playerBoard,
        opponentBoard,
        selectedUnit,
        selectUnit,
        attackUnit,
        currentPlayer,
        selectedHandCardId,
        playerHand,
        playCard,
        selectHandCard,
        targetSelectionMode,
        selectTarget
    } = useBattle();

    const handleSlotClick = (index: number, unit: any | null, isPlayer: boolean) => {
        // Validation for Target Selection Mode
        if (targetSelectionMode?.active) {
            if (unit && targetSelectionMode.validTargets.includes(unit.id)) {
                selectTarget(unit.id);
            }
            return;
        }

        if (isPlayer) {
            // Priority: Play Card from Hand
            if (selectedHandCardId) {
                const card = playerHand.find(c => c.id === selectedHandCardId);
                if (card) {
                    playCard(card, index); // We need to update playCard signature to accept index
                    selectHandCard(null); // Deselect after playing
                    return;
                }
            }

            // Fallback: Select Unit on Board (Blocked if interactionDisabled)
            if (unit && !interactionDisabled) {
                selectUnit(unit.id);
            }
        }
    };

    const renderBoard = (board: (any | null)[], isPlayer: boolean) => {
        const half = board.length / 2;
        const frontRow = board.slice(0, half);
        const backRow = board.slice(half);

        return (
            <div className={`flex flex-col gap-2 w-full max-w-5xl ${isPlayer ? '' : 'flex-col-reverse'}`}>
                {/* Front Row (Frente) */}
                <div className="flex justify-center gap-2 h-32">
                    {frontRow.map((unit, i) => {
                        const globalIndex = i;
                        const isTargetableSlot = isPlayer && !!selectedHandCardId && !unit;

                        return (
                            <div key={`front-${isPlayer ? 'p' : 'o'}-${i}`} className="min-w-[80px] w-20 flex-shrink-0 transition-all duration-300">
                                <BattleSlot
                                    unit={unit}
                                    index={globalIndex}
                                    isPlayer={isPlayer}
                                    isSelected={isPlayer && selectedUnit === unit?.id}
                                    canAttack={isPlayer && unit?.canAttack && currentPlayer === 'player'}
                                    canBeTargeted={(!isPlayer && !!selectedUnit) || isTargetableSlot || (!!targetSelectionMode?.active && !!unit && targetSelectionMode.validTargets.includes(unit.id))}
                                    onSelect={() => handleSlotClick(globalIndex, unit, isPlayer)}
                                    onAttack={() => selectedUnit && attackUnit(selectedUnit, unit?.id || '')}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Back Row (Retaguarda) */}
                <div className="flex justify-center gap-2 h-32">
                    {backRow.map((unit, i) => {
                        const globalIndex = i + half;
                        // Highlight empty slots when a card is selected
                        const isTargetableSlot = isPlayer && !!selectedHandCardId && !unit;

                        return (
                            <div key={`back-${isPlayer ? 'p' : 'o'}-${i}`} className="min-w-[80px] w-20 flex-shrink-0 transition-all duration-300">
                                <BattleSlot
                                    unit={unit}
                                    index={globalIndex}
                                    isPlayer={isPlayer}
                                    isSelected={isPlayer && selectedUnit === unit?.id}
                                    canAttack={isPlayer && unit?.canAttack && currentPlayer === 'player'}
                                    canBeTargeted={(!isPlayer && !!selectedUnit) || isTargetableSlot || (!!targetSelectionMode?.active && !!unit && targetSelectionMode.validTargets.includes(unit.id))} // Use variable
                                    onSelect={() => handleSlotClick(globalIndex, unit, isPlayer)}
                                    onAttack={() => selectedUnit && attackUnit(selectedUnit, unit?.id || `hero-${isPlayer ? 'player' : 'opponent'}`)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center gap-8 py-4 relative z-10 w-full overflow-x-auto min-h-[600px]">
            {/* Opponent's Board */}
            {renderBoard(opponentBoard, false)}

            {/* Divider */}
            <div className="w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.1)]"></div>

            {/* Player's Board */}
            {renderBoard(playerBoard, true)}
        </div>
    );
};
