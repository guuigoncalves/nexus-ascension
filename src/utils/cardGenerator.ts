import type { Card, PackTier, Rarity } from '../types';
import { initialCards } from '../data/cards';
import { PACK_CONFIGS } from '../types';
import { ARENAS } from '../constants/arenas';

const RARITY_WEIGHTS: Partial<Record<Rarity, number>> = {
    'Elite': 20,
    'Veterano': 15,
    'Gladiador': 15,
    'Paladino': 10,
    'Soldado': 20, // Increased common weight
    'Recruta': 20, // Increased common weight
    'Titã': 5,
    'Lendário': 4,
    'Destruidor': 3,
    'Supremo': 1, // Reduced for balance
    'Efeito': 5,
    'Zeta': 0.5,
    'Fusão': 0.5
};

export const getUnlockedRaritiesForArena = (maxArenaId: number): Rarity[] => {
    let allowed: Rarity[] = ['Recruta', 'Soldado', 'Efeito']; // Base allowed

    // Iterate up to current arena to accumulate allowed rarities
    for (const arena of ARENAS) {
        if (arena.id <= maxArenaId) {
            arena.unlockedRarities.forEach(r => {
                if (!allowed.includes(r as Rarity)) {
                    allowed.push(r as Rarity);
                }
            });
        }
    }
    return allowed;
};

export const generateRandomCards = (tier: PackTier, maxArenaId: number = 10): Card[] => {
    const config = PACK_CONFIGS[tier];
    const cards: Card[] = [];
    const allowedRarities = getUnlockedRaritiesForArena(maxArenaId);

    // Filter cards by allowed rarities
    const validCards = initialCards.filter(c => allowedRarities.includes(c.rarity));

    for (let i = 0; i < config.cardCount; i++) {
        // Gera um número aleatório baseado nos pesos
        // Filter weights to only include allowed rarities
        const validWeights: Partial<Record<Rarity, number>> = {};
        let totalWeight = 0;

        for (const [r, w] of Object.entries(RARITY_WEIGHTS)) {
            if (allowedRarities.includes(r as Rarity)) {
                validWeights[r as Rarity] = w;
                totalWeight += (w || 0);
            }
        }

        let random = Math.random() * totalWeight;
        let selectedRarity: Rarity = allowedRarities[0] || 'Soldado'; // Default fallback

        for (const [rarity, weight] of Object.entries(validWeights)) {
            random -= (weight || 0);
            if (random <= 0) {
                selectedRarity = rarity as Rarity;
                break;
            }
        }

        // Filtra cartas da raridade selecionada do pool validCards
        const availableCards = validCards.filter(c => c.rarity === selectedRarity);

        // Se não houver cartas dessa raridade (raro, mas possível com filtros), pega qualquer válida
        if (availableCards.length === 0) {
            const allWithImage = validCards.filter(c => c.image && !c.image.includes('placehold.co'));
            const pool = allWithImage.length > 0 ? allWithImage : validCards;

            if (pool.length > 0) {
                const randomCard = pool[Math.floor(Math.random() * pool.length)];
                cards.push(randomCard);
            }
        } else {
            // Prioriza cartas com imagem válida
            const withImage = availableCards.filter(c => c.image && !c.image.includes('placehold.co') && !c.image.includes('No+Image'));

            // Se tiver opções com imagem, usa elas. Se não, usa todas disponíveis da raridade.
            const pool = withImage.length > 0 ? withImage : availableCards;

            const randomCard = pool[Math.floor(Math.random() * pool.length)];
            cards.push(randomCard);
        }
    }

    return cards;
};
