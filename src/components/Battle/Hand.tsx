import React from 'react';
import { motion } from 'framer-motion';
import { useBattle } from '../../contexts/BattleContext';
import { CardVisual } from '../CardVisual';

import type { Card } from '../../types';

interface HandProps {
    disabledCardPredicate?: (card: Card) => boolean;
}

export const Hand: React.FC<HandProps> = ({ disabledCardPredicate }) => {
    const { playerHand, currentPlayer, phase, selectedHandCardId, selectHandCard } = useBattle();



    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end justify-center gap-[-4rem] h-48 w-full max-w-4xl z-20 pointer-events-none">
            {playerHand.map((card, index) => {
                const isDisabledByTutorial = disabledCardPredicate ? disabledCardPredicate(card) : false;
                const canPlay = currentPlayer === 'player' && phase === 'strategy' && !isDisabledByTutorial;
                const isSelected = selectedHandCardId === card.id;

                // Calculate rotation and position for fan effect
                const totalCards = playerHand.length;
                const rotation = (index - (totalCards - 1) / 2) * 5;
                const yOffset = Math.abs(index - (totalCards - 1) / 2) * 10;

                return (
                    <motion.div
                        key={card.id}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{
                            y: isSelected ? -70 : yOffset,
                            rotate: isSelected ? 0 : rotation,
                            scale: isSelected ? 1.3 : 1,
                            zIndex: isSelected ? 100 : index,
                            opacity: 1,
                            filter: isDisabledByTutorial ? 'grayscale(1) brightness(0.5)' : 'none'
                        }}
                        whileHover={{
                            y: isSelected ? -80 : -50,
                            rotate: 0,
                            scale: isSelected ? 1.35 : 1.2,
                            zIndex: 100,
                            transition: { duration: 0.2 }
                        }}
                        onClick={() => {
                            if (isDisabledByTutorial) return;

                            if (isSelected) {
                                selectHandCard(null);
                            } else {
                                selectHandCard(card.id);
                            }
                        }}
                        className={`pointer-events-auto cursor-pointer ${canPlay ? '' : 'cursor-not-allowed'}`}
                        style={{ marginLeft: index === 0 ? 0 : '-1rem' }}
                    >
                        <CardVisual
                            card={card}
                            size="hand"
                            isSelected={isSelected}
                            className="bg-transparent"
                        />
                        {isSelected && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-bounce z-50">
                                SELECIONADA
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div >
    );
};
