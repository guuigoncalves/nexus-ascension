import React, { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialCards as INITIAL_CARDS } from '../data/cards';

interface PlayerProfile {
    name: string;
    avatar: number;
    level: number;
    xp: number;
    maxXp: number;
    trophies: number;
    ownedCards: string[];
    tutorialsSeen: string[];
    dailyOfferId?: string;
    dailyOfferExpiry?: number;
    currency: {
        grana: number;
        gems: number;
    };
}

interface PackSlot {
    id: number;
    isOpening: boolean;
    isReady: boolean;
    timeRemaining: number;
}

interface GameState {
    profile: PlayerProfile;
    deck: string[];
    packSlots: PackSlot[];
    updateProfile: (profile: Partial<PlayerProfile>) => void;
    updateDeck: (deck: string[]) => void;
    updatePackSlots: (slots: PackSlot[]) => void;
    labClearHand: () => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useLocalStorage<PlayerProfile>('jc-profile', {
        name: 'Vinha',
        avatar: 0,
        level: 12,
        xp: 650,
        maxXp: 1000,
        trophies: 420,
        ownedCards: [],
        tutorialsSeen: [],
        currency: {
            grana: 1000,
            gems: 50
        }
    });

    const [deck, setDeck] = useLocalStorage<string[]>('jc-deck', INITIAL_CARDS.slice(0, 8).map(card => card.id));

    const [packSlots, setPackSlots] = useLocalStorage<PackSlot[]>('jc-pack-slots', [
        { id: 1, isOpening: false, isReady: false, timeRemaining: 0 },
        { id: 2, isOpening: false, isReady: false, timeRemaining: 0 },
        { id: 3, isOpening: false, isReady: false, timeRemaining: 0 },
        { id: 4, isOpening: false, isReady: false, timeRemaining: 0 },
        { id: 5, isOpening: false, isReady: false, timeRemaining: 0 },
    ]);

    const updateProfile = (updates: Partial<PlayerProfile>) => {
        setProfile({ ...profile, ...updates });
    };

    const updateDeck = (newDeck: string[]) => {
        setDeck(newDeck);
    };

    const updatePackSlots = (slots: PackSlot[]) => {
        setPackSlots(slots);
    };

    return (
        <GameContext.Provider
            value={{
                profile,
                deck,
                packSlots,
                updateProfile,
                updateDeck,
                updatePackSlots,
                labClearHand: () => { },
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
};
