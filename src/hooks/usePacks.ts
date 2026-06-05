import { useState, useEffect } from 'react';
import type { Pack, PackTier, Card } from '../types';
import { PACK_CONFIGS } from '../types';
import { generatePackContent } from '../utils/gachaLogic';
import { useGame } from '../contexts/GameContext';
import { ARENAS } from '../constants/arenas';

export const usePacks = () => {
    const [packs, setPacks] = useState<Pack[]>([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const { profile, updateProfile } = useGame();

    // Atualiza o tempo a cada segundo para os timers
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const addPack = (tier: PackTier) => {
        const config = PACK_CONFIGS[tier];
        const newPack: Pack = {
            id: `pack-${Date.now()}`,
            tier,
            unlockTime: Date.now() + config.unlockDuration,
            isUnlocking: true
        };
        setPacks(prev => [...prev, newPack]);
    };

    const openPack = (packId: string): { cards: Card[], bonusGrana: number } | null => {
        const pack = packs.find(p => p.id === packId);
        if (!pack) return null;

        const config = PACK_CONFIGS[pack.tier];

        // Calculate max arena based on trophies
        const currentArena = [...ARENAS].reverse().find(a => profile.trophies >= a.trophies) || ARENAS[0];

        // Smart Drops Generation
        const cards = generatePackContent(pack.tier, currentArena.id, profile.ownedCards || []);

        // Persist new cards to profile (Inventory)
        const newOwnedIds = new Set(profile.ownedCards || []);
        cards.forEach(c => newOwnedIds.add(c.id));
        updateProfile({
            ownedCards: Array.from(newOwnedIds)
        });

        setPacks(prev => prev.filter(p => p.id !== packId));

        return {
            cards,
            bonusGrana: config.bonusGrana
        };
    };

    const getRemainingTime = (pack: Pack): number => {
        if (!pack.isUnlocking) return 0;
        const remaining = pack.unlockTime - currentTime;
        return Math.max(0, remaining);
    };

    const formatTime = (ms: number): string => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    const unlockInstantly = (packId: string) => {
        setPacks(prev => prev.map(p =>
            p.id === packId ? { ...p, unlockTime: Date.now(), isUnlocking: false } : p
        ));
    };

    return {
        packs,
        addPack,
        openPack,
        getRemainingTime,
        formatTime,
        unlockInstantly,
        currentTime
    };
};
