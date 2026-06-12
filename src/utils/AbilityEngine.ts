import type { CardEffect, EffectType } from '../types';

type AbilityFactory = (description: string) => CardEffect[];

const unsupportedAbility: AbilityFactory = () => [];

/**
 * Registry canônico: somente IDs atuais de cards.ts.
 * Sem fallback heurístico. Sem aliases legados.
 */
const SpecialAbilities: Record<string, AbilityFactory> = {
    '4': () => [{
        trigger: 'onActivate',
        type: 'returnToHand',
        target: 'any',
        value: 1,
        description: 'Manipulação quântica: selecionar uma carta para reposicionamento canônico',
        requiresTarget: true
    }],
    '5': unsupportedAbility,
    '10': unsupportedAbility,
    '11': () => [
        {
            trigger: 'onActivate',
            type: 'summon',
            target: 'self',
            value: 1,
            description: 'Invocar Lacaio (500/500)'
        },
        {
            trigger: 'onActivate',
            type: 'mindControl',
            target: 'enemy',
            value: 1,
            duration: 2,
            description: 'Controlar oponente (2 turnos)'
        }
    ],
    '13': () => [{
        trigger: 'onActivate',
        type: 'revealHand',
        target: 'opponent',
        value: 1,
        description: 'Revelar mão do oponente'
    }],
    '14': unsupportedAbility,
    '15': unsupportedAbility,
    '17': () => [{
        trigger: 'passive',
        type: 'buffAtk',
        target: 'self',
        value: 1000,
        description: 'Passiva: ganha força com mortes de aliados'
    }],
    '18': () => [{
        trigger: 'onActivate',
        type: 'buffAtk',
        target: 'self',
        value: 2,
        operation: 'multiply',
        duration: 3,
        description: 'Dobrar ATK próprio por 3 turnos',
        requiresTarget: false
    }],
    '26': () => [{
        trigger: 'onActivate',
        type: 'destroy',
        target: 'enemy',
        value: 0,
        description: 'Kamehameha: eliminar 1 oponente',
        requiresTarget: true
    }],
    '33': () => [{
        trigger: 'onActivate',
        type: 'buffAtk',
        target: 'enemy',
        value: 2,
        operation: 'multiply',
        duration: 3,
        description: 'Forma Black: dobra os pontos por 3 turnos e contra-ataca',
        requiresTarget: true
    }],
    '34': () => [{
        trigger: 'onActivate',
        type: 'destroy',
        target: 'enemy',
        value: 0,
        description: 'Soco Avassalador: destruir alvo nao Divino',
        requiresTarget: true
    }],
    '36': () => [{
        trigger: 'onActivate',
        type: 'destroy',
        target: 'enemy',
        value: 1,
        duration: 2,
        description: 'Tempestade: eliminar 1 oponente',
        requiresTarget: true
    }],
    '51': () => [{
        trigger: 'onActivate',
        type: 'silence',
        target: 'enemy',
        value: 0,
        duration: 2,
        description: 'Campo magnetico: paralisa 2 adversarios por 2 turnos',
        requiresTarget: true
    }],
    '90': () => [{
        trigger: 'onActivate',
        type: 'damage',
        target: 'enemy',
        value: 1200,
        duration: 3,
        description: 'AT Extra: dano manual de 1200 por 3 turnos',
        requiresTarget: true
    }],
    '93': () => [{
        trigger: 'onActivate',
        type: 'summon',
        target: 'self',
        value: 1,
        description: 'Roubar 1 carta do cemiterio inimigo com 1 sacrificio',
        requiresTarget: false
    }],
    '95': () => [{
        trigger: 'onActivate',
        type: 'silence',
        target: 'enemy',
        value: 0,
        duration: 2,
        description: 'Absorver AT de 2 oponentes e anular efeitos por 2 turnos',
        requiresTarget: true
    }],
    '133': () => [{
        trigger: 'onPlay',
        type: 'buffAtk',
        target: 'self',
        value: 0,
        description: 'Transformação: pode atacar 2 vezes por turno',
        requiresTarget: false
    }],
    '136': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'enemy',
        value: 0,
        description: 'Karma: selecione um alvo para absorver sua defesa',
        requiresTarget: true
    }],
    '137': () => [{
        trigger: 'onActivate',
        type: 'buffAtk',
        target: 'self',
        value: 0,
        description: 'Porta da Fera: realiza 3 ataques neste turno',
        requiresTarget: false
    }],
    '144': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'self',
        value: 0,
        description: 'Encolhe para esquivar do próximo ataque',
        requiresTarget: false
    }],
    '161': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'allies',
        value: 50,
        description: 'Tecnologia Wakanda: +50% DEF para aliados'
    }],
    '162': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'any',
        requiresTarget: true,
        value: 500,
        description: 'Proteção Elástica: protege aliado e ganha DEF'
    }],
    '163': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'self',
        value: 0,
        description: 'Campo de Força: protege aliados contra até 3 ataques',
        requiresTarget: false
    }],
    '189': () => [
        {
            trigger: 'onActivate',
            type: 'buffAtk',
            target: 'self',
            value: 1.5,
            operation: 'multiply',
            duration: 2,
            description: 'ATK aumenta em 50% por 2 turnos',
            requiresTarget: false
        }
    ],
    '190': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'self',
        value: 400,
        operation: 'add',
        description: 'Ao ativar: concede +400 DEF',
        requiresTarget: false
    }],
    '191': unsupportedAbility,
    '192': unsupportedAbility,
    '211': () => [
        {
            trigger: 'onActivate',
            type: 'buffAtk',
            target: 'self',
            value: 3,
            operation: 'multiply',
            duration: 3,
            description: 'Triplica ATK por 3 turnos',
            requiresTarget: false
        },
        {
            trigger: 'onActivate',
            type: 'buffDef',
            target: 'self',
            value: 0.5,
            operation: 'multiply',
            duration: 3,
            description: 'Reduz DEF à metade por 3 turnos',
            requiresTarget: false
        }
    ],
    '212': unsupportedAbility,
    '213': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'self',
        value: 400,
        operation: 'add',
        duration: 2,
        description: 'Aumenta a própria DEF em 400 por 2 turnos',
        requiresTarget: false
    }],
    '214': () => [{
        trigger: 'onActivate',
        type: 'damage',
        target: 'opponent',
        value: 500,
        description: 'Lança dano de 500 no inimigo',
        requiresTarget: true
    }]
};

export const parseAbilityToEffects = (description: string, cardId: string): CardEffect[] => {
    if (!description || description.trim().length === 0) return [];
    if (description.toLowerCase().includes('não possui habilidade')) return [];

    return SpecialAbilities[cardId]?.(description) ?? [];
};

export const requiresTargetSelection = (effect: CardEffect): boolean => {
    if (effect.requiresTarget !== undefined) {
        return effect.requiresTarget;
    }

    const autoActivationTypes: EffectType[] = ['revealHand', 'draw', 'skipTurn', 'healHero'];
    if (autoActivationTypes.includes(effect.type)) return false;

    if (effect.target === 'self' && (effect.type === 'buffAtk' || effect.type === 'buffDef')) return false;
    if (effect.type === 'summon' && effect.target === 'self') return false;

    return true;
};

export const isOffensiveEffect = (effect: CardEffect): boolean => {
    const offensiveTypes: EffectType[] = ['damage', 'destroy', 'mindControl', 'summon', 'revealHand', 'skipTurn'];
    return offensiveTypes.includes(effect.type);
};
