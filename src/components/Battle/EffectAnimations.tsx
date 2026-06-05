import React, { useEffect } from 'react';
import { useBattle } from '../../contexts/BattleContext';
import { motion, AnimatePresence } from 'framer-motion';

export const EffectAnimations: React.FC = () => {
    const { visualEffects, clearVisualEffect } = useBattle();

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {visualEffects.map((effect) => (
                    <EffectItem key={effect.id} effect={effect} onComplete={() => clearVisualEffect(effect.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const EffectItem: React.FC<{ effect: any, onComplete: () => void }> = ({ effect, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 1500);
        return () => clearTimeout(timer);
    }, [effect, onComplete]);

    // Determine position based on target/source? 
    // Ideally we would know coordinates, but for now we center or put it on top/bottom based on "player" vs "opponent".
    // Since we don't have exact coordinates of DOM elements, we will just flash general indicators or floating text in center if unknown.
    // Improving: BattleContext could pass target slot index, and we map slots to % positions.

    // For now: Simple implementation - Center screen alert style for big effects, or generalized floating text.

    let color = 'text-white';
    let text = '';
    let icon = '';

    switch (effect.type) {
        case 'damage':
            color = 'text-red-500';
            text = `-${effect.value}`;
            icon = '💥';
            break;
        case 'heal':
            color = 'text-green-500';
            text = `+${effect.value}`;
            icon = '💚';
            break;
        case 'buffAtk':
            color = 'text-yellow-400';
            text = `+${effect.value} ATK`;
            icon = '⚔️';
            break;
        case 'buffDef':
            color = 'text-blue-400';
            text = `+${effect.value} DEF`;
            icon = '🛡️';
            break;
        case 'draw':
            color = 'text-purple-400';
            text = `Draw ${effect.value}`;
            icon = '🎴';
            break;
    }

    // Determine basic positioning logic
    // If targetId is 'opponent-hero', top center.
    // If targetId is 'player-hero', bottom center.
    // If targetId matches a unit, we don't know WHERE that unit is easily without more state. 
    // We will randomize slightly around center for now to avoid overlap, or use a list.

    const isOpponentTarget = effect.targetId === 'opponent-hero' || effect.targetId?.includes('opp');
    const isPlayerTarget = effect.targetId === 'player-hero' || (!isOpponentTarget && effect.targetId);

    const initialY = isOpponentTarget ? '20%' : (isPlayerTarget ? '80%' : '50%');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, y: initialY, x: '-50%' }}
            animate={{ opacity: 1, scale: 1.5, y: isOpponentTarget ? '15%' : (isPlayerTarget ? '75%' : '40%') }}
            exit={{ opacity: 0, scale: 0.8, y: isOpponentTarget ? '10%' : (isPlayerTarget ? '70%' : '30%') }}
            className={`absolute left-1/2 transform -translate-x-1/2 font-bold text-4xl shadow-black drop-shadow-md ${color} flex items-center gap-2`}
        >
            <span>{icon}</span>
            <span>{text}</span>
        </motion.div>
    );
};
