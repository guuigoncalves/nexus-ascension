export type Universe = 'Marvel' | 'DC' | 'Dragon Ball' | 'Naruto' | 'One Piece' | 'Outros' | 'One Punch Man' | 'God of War' | '—' | 'Marvel/DC' | 'Bleach' | 'Avatar' | 'Attack on Titan' | 'Jujutsu Kaisen' | 'Demon Slayer' | 'Fullmetal Alchemist' | 'Original/Geral';

export type Rarity = 'Supremo' | 'Destruidor' | 'Lendário' | 'Titã' | 'Elite' | 'Veterano' | 'Gladiador' | 'Paladino' | 'Soldado' | 'Recruta' | 'Efeito' | 'Zeta' | 'Fusão';

export const EFFECT_TRIGGERS = ['onPlay', 'onAttack', 'onDeath', 'passive', 'onActivate'] as const;
export type EffectTrigger = typeof EFFECT_TRIGGERS[number];

export const EFFECT_TYPES = ['buffAtk', 'buffDef', 'damage', 'heal', 'draw', 'summon', 'revealHand', 'skipTurn', 'skipBattlePhase', 'healHero', 'search', 'invertStats', 'copyAtk', 'destroy', 'banish', 'returnToHand', 'discard', 'buffAtkScaling', 'silence', 'mindControl'] as const;
export type EffectType = typeof EFFECT_TYPES[number];

export const EFFECT_TARGETS = ['self', 'enemy', 'allies', 'opponent', 'any'] as const;
export type EffectTarget = typeof EFFECT_TARGETS[number];

export const EFFECT_CONDITIONS = ['handSize', 'graveyardSize', 'opponentFieldSize'] as const;
export type EffectCondition = typeof EFFECT_CONDITIONS[number];

export const EFFECT_OPERATIONS = ['add', 'multiply', 'set'] as const;
export type EffectOperation = typeof EFFECT_OPERATIONS[number];

export interface CardEffect {
    trigger: EffectTrigger;
    type: EffectType;
    value: number;
    target?: EffectTarget;
    description?: string;
    scalingFactor?: number;
    condition?: EffectCondition;
    duration?: number;
    operation?: EffectOperation;
    requiresTarget?: boolean; // Se false, executa automaticamente sem pedir alvo
}

export interface Card {
    id: string;
    cardId?: string;
    name: string;
    universe: Universe;
    rarity: Rarity;
    atk?: number; // Opcional pois cartas de Efeito não têm ATK
    def?: number; // Opcional pois cartas de Efeito e Divinos não têm DEF
    image: string;
    isVillain?: boolean;
    description?: string;
    ability?: string;
    effects?: CardEffect[];
    cost?: number; // Custo de sacrifício ou mana (se houver)
}

export interface Player {
    id: string;
    name: string;
    hp: number;
    deck: Card[];
    hand: Card[];
    field: (Card | null)[]; // 10 slots
    graveyard: Card[];
    currency: {
        grana: number;
        gems: number;
    };
}

export type PackTier = 'Cobre' | 'Bronze' | 'Ferro' | 'Prata' | 'Ouro' | 'Diamante';

export interface Pack {
    id: string;
    tier: PackTier;
    unlockTime: number; // timestamp quando ficará disponível
    isUnlocking: boolean;
}

export interface PackConfig {
    tier: PackTier;
    cost: number;
    cardCount: number;
    bonusGrana: number;
    unlockDuration: number; // em milissegundos
}

export const PACK_CONFIGS: Record<PackTier, PackConfig> = {
    'Cobre': { tier: 'Cobre', cost: 200, cardCount: 3, bonusGrana: 50, unlockDuration: 3600000 }, // 1h
    'Bronze': { tier: 'Bronze', cost: 300, cardCount: 5, bonusGrana: 100, unlockDuration: 7200000 }, // 2h
    'Ferro': { tier: 'Ferro', cost: 500, cardCount: 8, bonusGrana: 200, unlockDuration: 14400000 }, // 4h
    'Prata': { tier: 'Prata', cost: 1000, cardCount: 12, bonusGrana: 400, unlockDuration: 28800000 }, // 8h
    'Ouro': { tier: 'Ouro', cost: 2000, cardCount: 20, bonusGrana: 1000, unlockDuration: 43200000 }, // 12h
    'Diamante': { tier: 'Diamante', cost: 5000, cardCount: 40, bonusGrana: 3000, unlockDuration: 86400000 } // 24h
};

