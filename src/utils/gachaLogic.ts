import type { PackTier, Card, Rarity } from '../types';
import { PACK_CONFIGS } from '../types';
import { initialCards } from '../data/cards';
import { ARENAS } from '../constants/arenas';

// Special IDs
const ID_BATMAN_1 = '1040';
const ID_BATMAN_2 = '1041';
const ID_BATMAN_3 = '1042';

const RARITY_WEIGHTS: Partial<Record<Rarity, number>> = {
    'Elite': 20,
    'Veterano': 15,
    'Gladiador': 15,
    'Paladino': 10,
    'Soldado': 20,
    'Recruta': 20,
    'Titã': 5,
    'Lendário': 4,
    'Destruidor': 3,
    'Supremo': 1,
    'Efeito': 5,
    'Zeta': 0.5,
    'Fusão': 0.5
};

// Helper to check if user has a card
const hasCard = (ownedCardIds: string[], cardId: string) => ownedCardIds.includes(cardId);

export const generatePackContent = (
    tier: PackTier,
    maxArenaId: number,
    ownedCardIds: string[]
): Card[] => {
    const config = PACK_CONFIGS[tier];
    const cards: Card[] = [];

    // 1. Build Base Pool (Strict Arena Lock)
    // Union of all poolIds from Arena 1 up to maxArenaId
    const allowedArenas = ARENAS.filter(a => a.id <= maxArenaId);

    // Create Set of valid IDs from the pool
    const validCardIds = new Set<string>();
    allowedArenas.forEach(a => {
        if (a.poolIds) {
            a.poolIds.forEach(id => validCardIds.add(id));
        }
    });

    // 2. Filter InitialCards by this allowlist
    let pool = initialCards.filter(c => validCardIds.has(c.id));

    // 3. Exodia/Batman Rules
    // Remove all Batman parts first to handle logic cleanly
    pool = pool.filter(c => ![ID_BATMAN_1, ID_BATMAN_2, ID_BATMAN_3].includes(c.id));

    // Logic:
    // - Batman 1 (1040): Never in packs (Offer/Bait only).
    // - Batman 2 (1041): Only if user HAS Batman 1 AND DOES NOT HAVE Batman 2 (Unique).
    // - Batman 3 (1042): Never in packs (Event only).

    const userHasBatman1 = hasCard(ownedCardIds, ID_BATMAN_1);
    const userHasBatman2 = hasCard(ownedCardIds, ID_BATMAN_2);

    if (userHasBatman1 && !userHasBatman2) {
        // Add Batman 2 to pool if it exists in data
        const batman2 = initialCards.find(c => c.id === ID_BATMAN_2);
        if (batman2) {
            pool.push(batman2);
        }
    }

    // If pool is empty (should not happen if config is correct), fallback to basics
    if (pool.length === 0) {
        console.warn('Gacha Pool is empty! Falling back to basic Recruta cards.');
        pool = initialCards.filter(c => c.rarity === 'Recruta');
    }

    // 4. Generate Cards based on Rarity Weights
    for (let i = 0; i < config.cardCount; i++) {
        // Calculate valid weights based on what rarities exist in our pool
        const poolRarities = new Set(pool.map(c => c.rarity));
        const validWeights: Partial<Record<Rarity, number>> = {};
        let totalWeight = 0;

        for (const [r, w] of Object.entries(RARITY_WEIGHTS)) {
            if (poolRarities.has(r as Rarity)) {
                // Ensure w is treated as number
                const weight = w || 0;
                validWeights[r as Rarity] = weight;
                totalWeight += weight;
            }
        }

        // Weighted Random Rarity Selection
        let random = Math.random() * totalWeight;
        let selectedRarity: Rarity | null = null;

        for (const [rarity, w] of Object.entries(validWeights)) {
            const weight = w || 0;
            random -= weight;
            if (random <= 0) {
                selectedRarity = rarity as Rarity;
                break;
            }
        }

        // Fallback if math fails slightly
        if (!selectedRarity && Object.keys(validWeights).length > 0) {
            selectedRarity = Object.keys(validWeights)[0] as Rarity;
        }

        if (selectedRarity) {
            // Pick random card of selected rarity from our filtered pool
            const rarityPool = pool.filter(c => c.rarity === selectedRarity);
            if (rarityPool.length > 0) {
                const randomCard = rarityPool[Math.floor(Math.random() * rarityPool.length)];
                cards.push(randomCard);
            } else {
                // Fallback if rarity pool is empty logic (should already be filtered but safety check)
                const fallbackCard = pool[Math.floor(Math.random() * pool.length)];
                cards.push(fallbackCard);
            }
        } else {
            // Absolute fallback
            const fallbackCard = pool[Math.floor(Math.random() * pool.length)];
            cards.push(fallbackCard);
        }
    }

    return cards;
};
