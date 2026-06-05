import type { Card } from '../types';

export const getSacrificeCost = (card: Card): number => {
    // v3.0 Rules: Recruit-Titan=0, Legendary=1, Destroyer=2, Supreme=0 (maintenance separate)
    if (card.rarity === 'Lendário') return 1;
    if (card.rarity === 'Destruidor') return 2;
    return 0; // Supremo, Titã, Elite, etc = 0
};

export const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'Comum': return 'from-gray-600 to-gray-800';
        case 'Rara': return 'from-blue-600 to-blue-800';
        case 'Épica': return 'from-purple-600 to-purple-800';
        case 'Lendária': return 'from-yellow-500 to-yellow-700';
        case 'Mítica': return 'from-red-600 to-red-800';
        case 'Divina': return 'from-cyan-400 to-blue-600';
        default: return 'from-gray-600 to-gray-800';
    }
};
