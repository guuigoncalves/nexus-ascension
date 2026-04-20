

export const getDeckSizeLimit = (trophies: number): number => {
    // Arena 1 starts at 0 trophies.
    // Arena 2 starts at 300.
    // Arena 4 starts at 1000.

    // Check against Arena 4 threshold (1000 trophies)
    if (trophies >= 1000) return 40;

    // Check against Arena 2 threshold (300 trophies)
    if (trophies >= 300) return 30;

    // Default (Arena 1)
    return 20;
};

export interface DeckValidationResult {
    isValid: boolean;
    reason?: string;
    currentSize: number;
    requiredSize: number;
}

export const validateDeck = (deckIndices: number[], trophies: number): DeckValidationResult => {
    const limit = getDeckSizeLimit(trophies);
    const currentSize = deckIndices.length;

    if (currentSize !== limit) {
        return {
            isValid: false,
            reason: `O deck deve ter exatamente ${limit} cartas para sua Arena atual.`,
            currentSize,
            requiredSize: limit
        };
    }

    return {
        isValid: true,
        currentSize,
        requiredSize: limit
    };
};
