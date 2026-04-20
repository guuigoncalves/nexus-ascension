import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Card } from '../types';
import { initialCards as INITIAL_CARDS } from '../data/cards';

interface CardContextData {
    cards: Card[];
    mode: 'DEV' | 'PROD';
    setMode: (mode: 'DEV' | 'PROD') => void;
    updateCard: (id: string, updates: Partial<Card>) => void;
    resetChanges: () => void;
    getCard: (id: string) => Card | undefined;
}

const CardContext = createContext<CardContextData>({} as CardContextData);

export const CardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<'DEV' | 'PROD'>('DEV');
    const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);

    // Initialize state from LocalStorage on mount
    useEffect(() => {
        // Critical Fix: Force clear overrides to match new database structure
        localStorage.removeItem('dev_cards_overrides');

        const storedMode = localStorage.getItem('app_env_mode');
        if (storedMode === 'DEV' || storedMode === 'PROD') {
            setMode(storedMode);
        }

        loadCards(storedMode === 'DEV' ? 'DEV' : 'PROD');
    }, []);

    // Reload cards when mode changes
    useEffect(() => {
        localStorage.setItem('app_env_mode', mode);
        loadCards(mode);
    }, [mode]);

    const loadCards = (currentMode: string) => {
        if (currentMode === 'PROD') {
            setCards([...INITIAL_CARDS]);
        } else {
            // DEV Mode: Merge with overrides
            try {
                const overrides = JSON.parse(localStorage.getItem('dev_cards_overrides') || '{}');
                const mergedCards = INITIAL_CARDS.map(card => {
                    if (overrides[card.id]) {
                        return { ...card, ...overrides[card.id] };
                    }
                    return card;
                });

                // Add new cards created in DEV (if implemented later)
                // const newCards = ...

                setCards(mergedCards);
            } catch (error) {
                console.error('Failed to load dev overrides:', error);
                setCards([...INITIAL_CARDS]);
            }
        }
    };

    const updateCard = (id: string, updates: Partial<Card>) => {
        if (mode !== 'DEV') {
            console.warn('Cannot edit cards in PROD mode');
            return;
        }

        const overrides = JSON.parse(localStorage.getItem('dev_cards_overrides') || '{}');

        // Accumulate updates
        const currentOverride = overrides[id] || {};
        overrides[id] = { ...currentOverride, ...updates };

        localStorage.setItem('dev_cards_overrides', JSON.stringify(overrides));
        loadCards('DEV');
    };

    const resetChanges = () => {
        if (window.confirm('Tem certeza que deseja descartar todas as alterações locais?')) {
            localStorage.removeItem('dev_cards_overrides');
            loadCards('DEV');
        }
    };

    const getCard = (id: string) => {
        return cards.find(c => c.id === id);
    };

    return (
        <CardContext.Provider value={{ cards, mode, setMode, updateCard, resetChanges, getCard }}>
            {children}
        </CardContext.Provider>
    );
};

export const useCards = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('useCards must be used within a CardProvider');
    }
    return context;
};
