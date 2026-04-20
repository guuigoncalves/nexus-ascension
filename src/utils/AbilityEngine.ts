import type { CardEffect } from '../types';

/**
 * Registry Pattern: Mapeamento explícito de habilidades por ID de carta
 * Remove qualquer atribuição automática/genérica de buffs
 */
const SpecialAbilities: Record<string, (description: string) => CardEffect[]> = {
    // ID 1: Dr. Manhattan - Manipulação Quântica
    '1': () => [{
        trigger: 'onActivate',
        type: 'invertStats',
        target: 'any',
        value: 0,
        description: 'Manipulação quântica: Inverter ATK/DEF'
    }],

    // ID 161: Shuri - Buff em Área
    '161': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'allies',
        value: 50, // Lógica customizada no TestLab (Percentual)
        description: 'Tecnologia Wakanda: +50% DEF para todos aliados (3T)'
    }],

    // ID 162: Homem Elástico - Proteção
    '162': () => [{
        trigger: 'onActivate',
        type: 'buffDef', // Placeholder, lógica real complexa no TestLab
        target: 'any', // Requer seleção de aliado
        requiresTarget: true,
        value: 500,
        description: 'Proteção Elástica: Protege aliado e ganha DEF'
    }],

    // ID 3: Whis - Reversão Temporal
    '3': () => [{
        trigger: 'onActivate',
        type: 'skipTurn',
        target: 'opponent',
        value: 1,
        description: 'Reverter o tempo'
    }],

    // ID 4: Galactus - Devorador de Mundos
    '4': () => [
        {
            trigger: 'onActivate',
            type: 'destroy',
            target: 'opponent',
            value: 0,
            description: 'Devorar todas as cartas'
        },
        {
            trigger: 'onActivate',
            type: 'healHero',
            target: 'self',
            value: 2000,
            description: 'Curar após devorar'
        }
    ],

    // ID 11: Darkseid - Invocação + Controle
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
            description: 'Controlar oponente (2 Turnos)'
        }
    ],

    // ID 13: Odin - Revelar Mão (Auto-Ativação)
    '13': () => [{
        trigger: 'onActivate',
        type: 'revealHand',
        target: 'opponent',
        value: 1,
        description: 'Revelar mão do oponente'
    }],

    // ID 14: Zeus - Raio Divino
    '14': (desc: string) => {
        const valueMatch = desc.match(/(\d+)/);
        return [{
            trigger: 'onActivate',
            type: 'damage',
            target: 'opponent',
            value: valueMatch ? parseInt(valueMatch[0]) : 3000,
            description: 'Raio divino'
        }];
    },

    // ID 15: Jean Grey - Fênix (Reviver)
    '15': () => [{
        trigger: 'onDeath',
        type: 'summon',
        target: 'self',
        value: 1,
        description: 'Reviver como Fênix'
    }],

    // ID 17: Broly - Passivo de Fúria (NÃO REQUER BOTÃO)
    '17': () => [{
        trigger: 'passive',
        type: 'buffAtk',
        target: 'self',
        value: 1000,
        description: 'Passiva: Ganha força com mortes de aliados'
    }],

    // ID 18: Sentry - Dobrar ATK Temporário (AUTO-EXECUÇÃO, SEM TARGET)
    '18': () => [{
        trigger: 'onActivate',
        type: 'buffAtk',
        target: 'self',
        value: 2,
        operation: 'multiply',
        duration: 3,
        description: 'Dobrar ATK próprio (3 Turnos, depois morre)',
        requiresTarget: false  // Executa automaticamente sem alvo
    }],

    // ID 211: Alerquina - Triplica ATK, mas reduz DEF pela metade por 3T
    '211': () => [{
        trigger: 'onActivate',
        type: 'complexBuff',
        target: 'self',
        value: { atkMultiplier: 3, defMultiplier: 0.5 },
        operation: 'multiply',
        duration: 3,
        description: 'Triplica seu AT, mas reduz sua DF pela metade, por 3T',
        requiresTarget: false
    }],

    // ID 212: Coringa - Rouba carta aleatória da mão do oponente
    '212': () => [{
        trigger: 'onActivate',
        type: 'stealCard',
        target: 'opponentHand',
        value: 1,
        description: 'Escolha uma carta da mão do oponente aleatoriamente para si',
        requiresTarget: false
    }],

    // ID 213: Nami - Aumenta própria DF em 400 E reduz 200 PTS (ATK+DEF) de todos adversários por 2T
    '213': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'self',
        value: 400,
        operation: 'add',
        duration: 2,
        description: 'Aumenta sua própria DF em 400 por 2T',
        requiresTarget: false
    }, {
        trigger: 'onActivate',
        type: 'weakenAll',  // Afeta ATK + DEF
        target: 'allOpponents',
        value: -200,
        duration: 2,
        description: 'Reduz 200 PTS (ATK+DEF) dos adversários por 2T',
        requiresTarget: false
    }],

    // ID 214: Usopp - Lança dano de 500 no inimigo
    '214': () => [{
        trigger: 'onActivate',
        type: 'damage',
        target: 'opponent',
        value: 500,
        description: 'Lança um AT extra de 500 no seu T',
        requiresTarget: true
    }],

    // --- SOLDADOS ---

    // ID 189: Asa Noturna - Imune a AT por 2T e ATK aumenta em 50%
    '189': () => [{
        trigger: 'onActivate',
        type: 'immunity',
        target: 'self',
        value: 1,  // Imune a ataques
        duration: 2,
        description: 'Imune a AT por 2T',
        requiresTarget: false
    }, {
        trigger: 'onActivate',
        type: 'buffAtk',
        target: 'self',
        value: 1.5,
        operation: 'multiply',
        duration: 2,
        description: 'ATK aumenta em 50% por 2T',
        requiresTarget: false
    }],

    // ID 190: Caveira Vermelha - Manual: Próxima kill ativa +400 DEF e -50% ATK nos demais por 2T
    '190': () => [{
        trigger: 'onActivate',
        type: 'buffDef',
        target: 'self',
        value: 400,
        operation: 'add',
        description: 'Ao ativar: Próximo inimigo eliminado concede +400 DEF permanente e reduz -50% ATK dos demais por 2T',
        requiresTarget: false
    }],

    // ID 191: Duende Verde - Destruir até 2 cartas adversárias com DF < 1000
    '191': () => [{
        trigger: 'onActivate',
        type: 'condDestroy',
        target: 'allOpponents',
        value: 1000,  // Threshold de DEF
        maxTargets: 2,
        description: 'Destruir até 2 cartas adversárias com DF < 1000',
        requiresTarget: false
    }],

    // ID 192: Rocket Raccoon - Reduz DF em 50%. Se < 600, elimina
    '192': () => [{
        trigger: 'onActivate',
        type: 'halveAndKill',
        target: 'allOpponents',
        value: 600,  // Threshold: < 600 é eliminado
        description: 'Reduz DF em 50%. Se < 600, elimina',
        requiresTarget: false
    }]
};

/**
 * Motor principal de parsing de habilidades
 */
export const parseAbilityToEffects = (description: string, cardId?: string): CardEffect[] => {
    if (!description || description.trim().length === 0) return [];

    // Verificar se a carta diz explicitamente que não tem habilidade
    if (description.toLowerCase().includes('não possui habilidade')) return [];

    // PRIORIDADE 1: Registry Pattern - Se o ID está mapeado, usar lógica específica
    if (cardId && SpecialAbilities[cardId]) {
        return SpecialAbilities[cardId](description);
    }

    // PRIORIDADE 2: Fallback para detecção por keywords (apenas casos genéricos não mapeados)
    const effects: CardEffect[] = [];
    const text = description.toLowerCase();

    // Helper parsers
    const durationMatch = text.match(/por\s(\d+)\sturnos/);
    const parsedDuration = durationMatch ? parseInt(durationMatch[1]) : undefined;

    const getTarget = (t: string): 'self' | 'enemy' | 'allies' | 'any' => {
        if (t.includes('aliado')) return 'allies';
        if (t.includes('inimigo') || t.includes('oponente')) return 'enemy';
        if (t.includes('seu') || t.includes('sua') || t.includes('si mesmo')) return 'self';
        return 'any';
    };

    // Detectar apenas efeitos básicos não mapeados
    // SUMMON (genérico)
    if (text.includes('invoca') || text.includes('invocar')) {
        effects.push({
            trigger: 'onActivate',
            type: 'summon',
            target: 'self',
            value: 1,
            description: 'Invocar carta'
        });
    }

    // DESTROY (genérico)
    if (text.includes('destruir') || text.includes('eliminar')) {
        effects.push({
            trigger: 'onActivate',
            type: 'destroy',
            target: 'opponent',
            value: 0,
            description: 'Destruir alvo'
        });
    }

    // DAMAGE (genérico)
    if (text.includes('dano') && !text.includes('raio')) {
        const valueMatch = text.match(/(\d+)/);
        effects.push({
            trigger: 'onActivate',
            type: 'damage',
            target: 'opponent',
            value: valueMatch ? parseInt(valueMatch[0]) : 1000,
            description: 'Causar dano'
        });
    }

    return effects;
};

// Helper: Verificar se efeito requer seleção de alvo
export const requiresTargetSelection = (effect: CardEffect): boolean => {
    // Se tem requiresTarget explícito, usar ele
    if (effect.requiresTarget !== undefined) {
        return effect.requiresTarget;
    }

    // Auto-Ativação (não requer alvo clicável)
    const autoActivationTypes = ['revealHand', 'draw', 'skipTurn', 'healHero'];
    if (autoActivationTypes.includes(effect.type)) return false;

    // Self-Target em buffs (não requer alvo externo)
    if (effect.target === 'self' && (effect.type === 'buffAtk' || effect.type === 'buffDef')) return false;

    // Summon geralmente não precisa de target (invoca no seu campo)
    if (effect.type === 'summon' && effect.target === 'self') return false;

    // Todos os outros requerem seleção (mindControl, destroy, damage, etc.)
    return true;
};

// Helper: Verificar se efeito é ofensivo (requer turno do jogador)
export const isOffensiveEffect = (effect: CardEffect): boolean => {
    const offensiveTypes = ['damage', 'destroy', 'mindControl', 'summon', 'revealHand', 'skipTurn'];
    return offensiveTypes.includes(effect.type);
};
