import type { TutorialStep } from '../components/TutorialOverlay';

export const TUTORIALS: Record<string, TutorialStep[]> = {
    'ARENA_1_INTRO': [
        {
            id: 'intro_welcome',
            title: 'Arena 1: O Início',
            content: 'Bem-vindo à Arena 1! O primeiro passo é aprender a jogar. Arraste uma carta da sua mão para o campo de batalha para invocar uma unidade.',
            image: '/cards/tutorial_drag.png',
            flags: {
                lockBoard: true,
                allowedAction: 'play_card'
            }
        },
        {
            id: 'intro_combat',
            title: 'Combate',
            content: 'Unidades atacam o oponente diretamente se não houver defensores. Reduza a vida do oponente a zero para vencer!'
        }
    ],
    'ARENA_2_EFFECTS': [
        {
            id: 'effects_intro',
            title: 'Cartas de Efeito',
            content: 'Bem-vindo à Arena 2! Você desbloqueou as Cartas de Efeito. Elas podem virar o jogo instantaneamente!',
            image: '/cards/tutorial_effects.png'
        },
        {
            id: 'effects_usage',
            title: 'Como Usar',
            content: 'Cartas de Efeito não têm ataque ou defesa. Elas ativam uma habilidade especial quando jogadas e depois são descartadas.',
        }
    ],
    'ARENA_4_SACRIFICE': [
        {
            id: 'sacrifice_intro',
            title: 'Mecânica de Sacrifício',
            content: 'Na Arena 4, as coisas ficam sérias. Cartas Poderosas exigem sacrifício para serem invocadas.',
        },
        {
            id: 'sacrifice_how',
            title: 'Como Sacrificar',
            content: 'Cartas Elite (Raridade Superior) exigem 1 Sacrifício. Arraste uma carta do seu campo para o cemitério para completar o ritual.',
            flags: {
                lockEliteCards: true
            }
        }
    ],
    'ARENA_7_RANKED': [
        {
            id: 'ranked_intro',
            title: 'Modo Ranqueado',
            content: 'Você provou seu valor. O Modo Ranqueado agora está disponível! Enfrente os melhores jogadores e suba no ranking global.',
        }
    ],
    'ARENA_9_ZETAS': [
        {
            id: 'zetas_intro',
            title: 'Cartas Zeta & Exodia',
            content: 'Você alcançou as lendas. As cartas Zeta possuem poder inimaginável. Em busca do Exodia Proibido?',
        },
        {
            id: 'exodia_rules',
            title: 'Regras do Exodia',
            content: 'Reúna as 5 partes do Exodia para vencer instantaneamente. Mas cuidado, as peças são extremamente raras e só caem em ordens específicas!',
            actionLabel: 'INVOCAR SHENLONG',
            actionId: 'SUMMON_SHENLONG'
        }
    ]
};
