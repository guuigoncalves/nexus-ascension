import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Card, CardEffect, EffectType } from '../types';
import { useGame } from './GameContext';
import { useCards } from './CardContext';
import { getSacrificeCost } from '../utils/cardUtils';
import { parseAbilityToEffects } from '../utils/AbilityEngine';

interface Unit extends Card {
    currentHealth: number;
    currentAttack: number;
    canAttack: boolean;
    isFaceDown?: boolean;
    isTaunt?: boolean;
    isSilenced?: boolean;
    counters?: { [key: string]: number };
}

interface BattleState {
    turn: number;
    phase: 'strategy' | 'battle';
    currentPlayer: 'player' | 'opponent';
    playerHealth: number;
    opponentHealth: number;
    playerHand: Card[];
    playerDeck: Card[];
    opponentHandCount: number;
    playerBoard: (Unit | null)[]; // 3 Front, 2 Back
    opponentBoard: (Unit | null)[]; // 3 Front, 2 Back
    playerGraveyard: Card[];
    opponentGraveyard: Card[];
    playerBanished: Card[];
    opponentBanished: Card[];
    playerLog: string[];
    opponentLog: string[];
    gameStatus: 'playing' | 'victory' | 'defeat';
    hasPlayedWarriorThisTurn: boolean;
    cardsPlayedThisTurn: string[];
    needsSacrifice: { cardId: string; required: number } | null;
    pendingMaintenance: string[];
    unitsUsedAbilityThisTurn: string[]; // Phase 5.5: Single use rule
    visualEffects: {
        id: string;
        type: EffectType;
        targetId?: string;
        sourceId?: string;
        value: number;
    }[];
    toasts: { id: string, message: string, type: 'info' | 'warning' | 'error' }[];
    canDrawCard: boolean; // New flag for manual draw phase
    divineSlots: {
        player: (Unit | null)[];
        opponent: (Unit | null)[];
    };
    drawTimerActive: boolean;
    drawTimeRemaining: number;
    turnTimer: number;
    opponentNextTurnSkipped: boolean;
    playerNextTurnSkipped: boolean;
    opponentHandRevealed: boolean;
    opponentBattlePhaseSkipped: boolean;
    playerBattlePhaseSkipped: boolean;
    pendingSearch: { filter: (card: Card) => boolean; count: number; callback: (selected: Card[]) => void } | null;
    selectedHandCardId: string | null;
    // Core Engine Phase 5 States
    responseChain: {
        active: boolean;
        timer: number;
        answeringPlayer: 'player' | 'opponent' | null;
        pendingAction: (() => void) | null;
    };
    pendingEffectPlay: {
        card: Card;
        message: string;
    } | null;
    targetSelectionMode: {
        active: boolean;
        effect: CardEffect;
        source: Unit;
        validTargets: string[]; // IDs
    } | null;
    isLabMode: boolean;
}

interface BattleContextType extends BattleState {
    selectedUnit: string | null;
    playerDeck: Card[];
    selectUnit: (unitId: string | null) => void;
    nextPhase: () => void;
    endTurn: () => void;
    playCard: (card: Card, slotIndex?: number, playFaceDown?: boolean, forcePlay?: boolean) => void;
    undoPlayCard: (unitId: string) => void;
    sacrificeCard: (cardId: string, fromHand: boolean) => void;
    attackUnit: (attackerId: string, targetId: string) => void;
    attackHero: (attackerId: string) => void;
    resolveMaintenance: (unitId: string, sacrificeId?: string) => void;
    clearVisualEffect: (id: string) => void;
    manualDraw: () => void;
    confirmSacrifice: (sacrificeIds: string[]) => void;
    cancelSacrifice: () => void;
    addToast: (message: string, type?: 'info' | 'warning' | 'error') => void;
    removeToast: (id: string) => void;
    getUnitWithAuras: (unit: Unit, board: (Unit | null)[]) => Unit;
    startSearch: (filter: (card: Card) => boolean, count: number, callback: (selected: Card[]) => void) => void;
    resolveSearch: (selectedIds: string[]) => void;
    cancelSearch: () => void;
    selectHandCard: (cardId: string | null) => void;
    // Phase 5 Exports
    startChain: (action: () => void) => void;
    answerChain: () => void;
    cancelChainResponse: () => void;
    setPendingEffectPlay: (payload: { card: Card, message: string } | null) => void;
    selectTarget: (targetId: string) => void;
    cancelTargetSelection: () => void;
    targetSelectionMode: { active: boolean; effect: CardEffect; source: Unit; validTargets: string[] } | null;
    activateAbility: (cardId: string) => void;
    addCardToHand: (cardId: string) => void;
    labClearHand: () => void;
    labSetBoard: (index: number, cardId: string, isPlayer: boolean) => void;
    labClearBoard: (isPlayer: boolean) => void;
    toggleLabMode: () => void;
}

const BattleContext = createContext<BattleContextType | undefined>(undefined);


export const BattleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { deck } = useGame();
    const { cards } = useCards();

    // Critical Fix: Clear dev overrides to prevent editor lock
    localStorage.clear();

    const [state, setState] = useState<BattleState>({
        turn: 1,
        phase: 'strategy',
        currentPlayer: 'player',
        playerHealth: 8000,
        opponentHealth: 8000,
        playerHand: [],
        playerDeck: [],
        opponentHandCount: 5,
        playerBoard: Array(12).fill(null),
        opponentBoard: Array(12).fill(null),
        playerGraveyard: [],
        opponentGraveyard: [],
        playerBanished: [],
        opponentBanished: [],
        playerLog: [],
        opponentLog: [],
        gameStatus: 'playing',
        isLabMode: false,
        hasPlayedWarriorThisTurn: false,
        cardsPlayedThisTurn: [] as string[],
        unitsUsedAbilityThisTurn: [] as string[],
        needsSacrifice: null,
        pendingMaintenance: [] as string[],
        visualEffects: [],
        toasts: [] as { id: string, message: string, type: 'info' | 'warning' | 'error' }[],
        canDrawCard: false,
        divineSlots: {
            player: [null, null],
            opponent: [null, null]
        },
        drawTimerActive: false,
        drawTimeRemaining: 5,
        turnTimer: 30,
        opponentNextTurnSkipped: false,
        playerNextTurnSkipped: false,
        opponentHandRevealed: false,
        opponentBattlePhaseSkipped: false,
        playerBattlePhaseSkipped: false,
        pendingSearch: null,
        selectedHandCardId: null,
        responseChain: {
            active: false,
            timer: 0,
            answeringPlayer: null,
            pendingAction: null
        },
        pendingEffectPlay: null,
        targetSelectionMode: null
    });

    // ... (rest of code)


    // --- Core Engine Phase 5: Zeta System (Hand Watcher) ---
    const checkZetaCombos = () => {
        if (state.playerHand.length === 0) return;

        const handIds = state.playerHand.map(c => c.id);
        const shenlongIds = ['1033', '1034', '1035', '1036', '1037', '1038', '1039'];
        const batmanIds = ['1040', '1041', '1042'];

        // Check Shenlong
        const hasAllShenlong = shenlongIds.every(id => handIds.includes(id));
        if (hasAllShenlong) {
            const newHand = state.playerHand.filter(c => !shenlongIds.includes(c.id));
            const token = cards.find(c => c.id === 'TOK_SHENLONG');
            if (token) {
                setState(prev => ({
                    ...prev,
                    playerHand: [...newHand, token],
                    toasts: [...prev.toasts, { id: `shen-${Date.now()}`, message: 'AS ESFERAS SE REUNIRAM! Shenlong invocado!', type: 'info' }]
                }));
            }
            return;
        }

        // Check Batman Z
        const hasAllBatman = batmanIds.every(id => handIds.includes(id));
        if (hasAllBatman) {
            const newHand = state.playerHand.filter(c => !batmanIds.includes(c.id));
            const token = cards.find(c => c.id === 'TOK_BATMAN_Z');
            if (token) {
                setState(prev => ({
                    ...prev,
                    playerHand: [...newHand, token],
                    toasts: [...prev.toasts, { id: `bat-${Date.now()}`, message: 'O CAVALEIRO DAS TREVAS SURGIU! Batman Z formado!', type: 'info' }]
                }));
            }
        }
    };

    useEffect(() => {
        checkZetaCombos();
    }, [state.playerHand, cards]);

    // --- Cheat Listener ---
    useEffect(() => {
        const handleCheat = (e: any) => {
            if (e.detail) {
                addCardToHand(e.detail);
            }
        };
        window.addEventListener('cheat:addCard', handleCheat);
        return () => window.removeEventListener('cheat:addCard', handleCheat);
    }, [cards]); // addCardToHand defined in scope

    // --- Core Engine Phase 5: Chain System ---
    useEffect(() => {
        let interval: any;
        if (state.responseChain.active && state.responseChain.timer > 0) {
            interval = setInterval(() => {
                setState(prev => {
                    const newTimer = prev.responseChain.timer - 1;
                    if (newTimer <= 0) {
                        // Timeout Logic
                        return handleChainTimeout(prev);
                    }
                    return {
                        ...prev,
                        responseChain: { ...prev.responseChain, timer: newTimer }
                    };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.responseChain.active, state.responseChain.timer]);

    const handleChainTimeout = (prevState: BattleState): BattleState => {
        // Penalty if skipping? Requirements say penalty if answered and timed out OR cancel.
        // If timer runs out naturally without clicking Answer, it's just a "Pass".
        // BUT if answeringPlayer is set, they promised to answer.

        const wasAnswering = prevState.responseChain.answeringPlayer === 'opponent'; // Assuming AI/Opponent view

        if (wasAnswering) {
            // Apply Penalty
            const penalty = 500;
            const newHp = Math.max(0, prevState.opponentHealth - penalty); // Simplifying: apply to opponent
            // Execute pending action
            if (prevState.responseChain.pendingAction) {
                prevState.responseChain.pendingAction();
            }
            return {
                ...prevState,
                opponentHealth: newHp,
                toasts: [...prevState.toasts, { id: 'chain-penalty', message: 'Tempo esgotado! -500 HP de penalidade.', type: 'warning' }],
                responseChain: { active: false, timer: 0, answeringPlayer: null, pendingAction: null }
            };
        }

        // Just execute pending action (Pass)
        if (prevState.responseChain.pendingAction) {
            prevState.responseChain.pendingAction();
        }
        return {
            ...prevState,
            responseChain: { active: false, timer: 0, answeringPlayer: null, pendingAction: null }
        };
    };

    const startChain = (action: () => void) => {
        setState(prev => ({
            ...prev,
            responseChain: {
                active: true,
                timer: 5, // 5 seconds initial window
                answeringPlayer: null,
                pendingAction: action
            }
        }));
    };

    const answerChain = () => {
        setState(prev => ({
            ...prev,
            responseChain: {
                ...prev.responseChain,
                timer: 30, // Extend to 30s
                answeringPlayer: prev.currentPlayer === 'player' ? 'opponent' : 'player'
            }
        }));
    };

    const cancelChainResponse = () => {
        setState(prev => {
            // Penalty logic same as timeout
            const penalty = 500;
            const newHp = Math.max(0, prev.opponentHealth - penalty);

            // Execute original action immediately
            if (prev.responseChain.pendingAction) {
                prev.responseChain.pendingAction();
            }

            return {
                ...prev,
                opponentHealth: newHp,
                toasts: [...prev.toasts, { id: 'chain-cancel', message: 'Resposta cancelada! -500 HP de penalidade.', type: 'warning' }],
                responseChain: { active: false, timer: 0, answeringPlayer: null, pendingAction: null }
            };
        });
    };

    const shrinkBoardIfNeeded = (board: (Unit | null)[]): (Unit | null)[] => {
        let newBoard = [...board];
        // Minimum size is 12. We shrink 2 by 2 (1 front, 1 back).
        while (newBoard.length > 12) {
            const half = newBoard.length / 2;
            const lastFrontIndex = half - 1;
            const lastBackIndex = newBoard.length - 1;

            if (newBoard[lastFrontIndex] === null && newBoard[lastBackIndex] === null) {
                // Remove both
                newBoard.splice(lastBackIndex, 1);
                newBoard.splice(lastFrontIndex, 1);
            } else {
                break;
            }
        }
        return newBoard;
    };

    const getUnitWithAuras = (unit: Unit, board: (Unit | null)[]): Unit => {
        let modifiedUnit = { ...unit };
        board.forEach(u => {
            if (u && u.effects) {
                u.effects.forEach(effect => {
                    if (effect.trigger === 'passive') {
                        if (effect.target === 'allies' && u.id !== unit.id) {
                            if (effect.type === 'buffDef') modifiedUnit.currentHealth += effect.value;
                            if (effect.type === 'buffAtk') modifiedUnit.currentAttack += effect.value;
                        }
                    }
                });
            }
        });
        return modifiedUnit;
    };

    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

    // Lock to prevent AI from executing multiple times or looping
    const isProcessingAI = React.useRef(false);

    useEffect(() => {
        if (cards.length === 0) return;

        // Create unique instances of each card (no duplicates)
        const uniqueDeck = deck.map(index => {
            const card = cards[index];
            if (!card) return null;
            return { ...card, id: `${card.id}-${Math.random().toString(36).substr(2, 9)}` };
        }).filter((c): c is Card => c !== null);

        // Shuffle
        const shuffledDeck = [...uniqueDeck].sort(() => Math.random() - 0.5);
        setState(prev => ({ ...prev, playerDeck: shuffledDeck }));
    }, [deck, cards]);

    useEffect(() => {
        if (state.playerDeck.length > 0 && state.playerHand.length === 0) {
            drawCards(5, 'player');
        }
    }, [state.playerDeck]);

    const selectUnit = (unitId: string | null) => {
        setSelectedUnit(unitId);
    };

    const selectHandCard = (cardId: string | null) => {
        setState(prev => ({ ...prev, selectedHandCardId: cardId }));
    };

    const drawCards = (count: number, player: 'player' | 'opponent') => {
        if (player === 'player') {
            setState(prev => {
                const cardsToDraw = Math.min(count, prev.playerDeck.length);
                const drawnCards = prev.playerDeck.slice(0, cardsToDraw);
                const remainingDeck = prev.playerDeck.slice(cardsToDraw);

                // GAME OVER RULE: Deck Out
                if (prev.playerDeck.length === 0 && count > 0) {
                    return {
                        ...prev,
                        gameStatus: 'defeat',
                        playerDeck: [], // Clear deck logic
                        playerLog: ['Derrota: Deck vazio!', ...prev.playerLog].slice(0, 20)
                    };
                }

                return {
                    ...prev,
                    playerHand: [...prev.playerHand, ...drawnCards],
                    playerDeck: remainingDeck,
                    canDrawCard: false // Turn off flag
                };
            });
        } else {
            setState(prev => ({
                ...prev,
                opponentHandCount: Math.min(prev.opponentHandCount + count, 10),
                canDrawCard: false // Turn off flag
            }));
        }
    };

    useEffect(() => {
        if (state.currentPlayer === 'opponent' && state.gameStatus === 'playing') {
            const aiTurnTimeout = setTimeout(() => {
                performAITurn();
            }, 1500);

            return () => clearTimeout(aiTurnTimeout);
        }
    }, [state.currentPlayer, state.gameStatus, state.phase]);

    // EFEITO DO TIMER (SUBSTITUIR O ATUAL - LÓGICA RÍGIDA)
    useEffect(() => {
        if (state.gameStatus !== 'playing') return;

        const timerInterval = setInterval(() => {
            setState(prev => {
                if (prev.responseChain.active) return prev; // PAUSE TIMER DURING CHAIN

                if (prev.turnTimer > 0) {
                    return { ...prev, turnTimer: prev.turnTimer - 1 };
                } else {
                    // O TEMPO ACABOU: FLUXO RÍGIDO
                    if (prev.phase === 'strategy') {
                        // Strategy/Draw Phase -> Force BATTLE
                        // Note: prev.phase is 'strategy'. In my logic Draw is a flag inside strategy, but user said:
                        // "if (gamePhase === 'DRAW' || gamePhase === 'STRATEGY')"
                        // I will map this to my state:
                        return { ...prev, phase: 'battle', turnTimer: 30, canDrawCard: false };
                    } else if (prev.phase === 'battle') {
                        // FIM DO TURNO - FORÇAR TROCA
                        // Cannot call endTurn() inside reducer easily without side effects or complexity.
                        // But user provided logic: "setCurrentTurn...", "setGamePhase...".
                        // This implies I should do it here or trigger it.
                        // Since I am inside setState(prev => ...), I can return the NEW STATE directly.

                        const isPlayerTurn = prev.currentPlayer === 'player';
                        const nextPlayer = isPlayerTurn ? 'opponent' : 'player';
                        const nextTurn = isPlayerTurn ? prev.turn + 1 : prev.turn;

                        // Reset Board Logic Inline (simulating endTurn)
                        const newState: BattleState = {
                            ...prev,
                            currentPlayer: nextPlayer,
                            turn: nextTurn,
                            phase: 'strategy',
                            turnTimer: 30, // Tempo de Compra
                            canDrawCard: true,

                            // Reset Board Status
                            playerBoard: isPlayerTurn ? prev.playerBoard : prev.playerBoard.map(u => u ? { ...u, canAttack: true } : null),
                            opponentBoard: !isPlayerTurn ? prev.opponentBoard : prev.opponentBoard.map(u => u ? { ...u, canAttack: true } : null),

                            hasPlayedWarriorThisTurn: false,
                            cardsPlayedThisTurn: [],
                            // Divine Maintenance Check (only for Player)
                            pendingMaintenance: nextPlayer === 'player'
                                ? prev.playerBoard.filter(u => u && u.rarity === 'Supremo').map(u => u!.id)
                                : [],
                        };

                        return newState;
                    }
                    return prev;
                }
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [state.gameStatus]); // Dependências reduzidas para evitar re-runs desnecessários com o timer interno

    // Reset timer when turn or phase changes
    useEffect(() => {
        setState(prev => ({ ...prev, turnTimer: 30 }));
    }, [state.turn, state.phase]);

    const performAITurn = () => {
        // STRICT GUARD:
        // 1. If AI is already running (ref lock), STOP.
        // 2. If it's not strictly opponent's turn, STOP.
        if (isProcessingAI.current || state.currentPlayer !== 'opponent') return;

        isProcessingAI.current = true;

        setState(prev => {
            let newState = { ...prev };
            // Mark as played to prevent loops (redundant but safe)
            newState.hasPlayedWarriorThisTurn = true;

            // SIMPLIFIED AI TURN LOGIC

            // 1. Check if we can play a card (Hand > 0, Board has space)
            const hasSpace = prev.opponentBoard.some(slot => slot === null);

            if (prev.opponentHandCount > 0 && hasSpace) {
                let randomCard: Card;

                // Pick a valid card from DB
                if (cards && cards.length > 0) {
                    const randomIndex = Math.floor(Math.random() * cards.length);
                    const baseCard = cards[randomIndex];
                    // Ensure fresh ID and fallback image
                    randomCard = {
                        ...baseCard,
                        id: `opp-${Date.now()}-${Math.random()}`,
                        image: baseCard.image || 'https://via.placeholder.com/150'
                    };
                } else {
                    // Emergency fallback to prevent crash
                    randomCard = {
                        id: `opp-fallback-${Date.now()}`,
                        name: 'Minion',
                        universe: 'Outros',
                        rarity: 'Elite',
                        atk: 1000,
                        def: 1000,
                        image: 'https://via.placeholder.com/150',
                        cost: 1
                    };
                }

                // Find appropriate slot for AI card
                const isSupport = randomCard.rarity === 'Efeito' || randomCard.rarity === 'Zeta';
                let emptySlotIndex = -1;

                if (isSupport) {
                    // Back row (indices 6-11 in a 12-slot board)
                    const backSlots = Array.from({ length: newState.opponentBoard.length / 2 }, (_, i) => i + newState.opponentBoard.length / 2);
                    emptySlotIndex = backSlots.find(idx => newState.opponentBoard[idx] === null) ?? -1;
                } else {
                    // Warriors can go anywhere, but prefer front row (0-5)
                    const frontSlots = Array.from({ length: newState.opponentBoard.length / 2 }, (_, i) => i);
                    emptySlotIndex = frontSlots.find(idx => newState.opponentBoard[idx] === null) ?? -1;

                    if (emptySlotIndex === -1) {
                        // If front is full, try back
                        const backSlots = Array.from({ length: newState.opponentBoard.length / 2 }, (_, i) => i + newState.opponentBoard.length / 2);
                        emptySlotIndex = backSlots.find(idx => newState.opponentBoard[idx] === null) ?? -1;
                    }
                }

                if (emptySlotIndex !== -1) {
                    // Create Unit
                    const newUnit: Unit = {
                        ...randomCard,
                        currentHealth: randomCard.def || 1000,
                        currentAttack: randomCard.atk || 1000,
                        canAttack: false,
                        isTaunt: false,
                        isFaceDown: Math.random() > 0.7 // AI occasionally plays face-down
                    };

                    const newBoard = [...newState.opponentBoard];
                    newBoard[emptySlotIndex] = newUnit;
                    newState.opponentBoard = newBoard;
                    newState.opponentHandCount = Math.max(0, newState.opponentHandCount - 1);
                }
            }


            // 2. AI Attack Logic
            newState.opponentBoard.forEach((unit, unitIndex) => {
                if (unit && unit.canAttack) {
                    // Find valid targets
                    const validTargets = newState.playerBoard
                        .map((u, i) => u ? { ...u, originalIndex: i } : null)
                        .filter(u => u !== null) as (Unit & { originalIndex: number })[];

                    if (validTargets.length > 0 && Math.random() > 0.3) {
                        // Attack Random Unit
                        const target = validTargets[Math.floor(Math.random() * validTargets.length)];

                        // 2.1 COMBAT RULES (Unified with Player)
                        let attackerDies = false;
                        let targetDies = false;
                        let defenderNewDef = target.currentHealth;

                        if (unit.currentAttack < target.currentHealth) {
                            attackerDies = true;
                            defenderNewDef = target.currentHealth - unit.currentAttack;
                        } else {
                            targetDies = (target.currentHealth - unit.currentAttack) <= 0;
                            attackerDies = (unit.currentHealth - target.currentHealth) <= 0;
                            defenderNewDef = target.currentHealth - unit.currentAttack;
                        }

                        // Damage Player Unit (Permanent DEF loss and Reveal)
                        newState.playerBoard = newState.playerBoard.map((u, i) => {
                            if (!u) return null;
                            if (i === target.originalIndex) {
                                if (targetDies) return null;
                                return { ...u, currentHealth: defenderNewDef, isFaceDown: false };
                            }
                            return u;
                        });

                        // Damage Opponent Unit (Recoil)
                        newState.opponentBoard = newState.opponentBoard.map((u, i) => {
                            if (!u) return null;
                            if (i === unitIndex) {
                                if (attackerDies) return null;
                                return { ...u, currentHealth: u.currentHealth - target.currentAttack, canAttack: false };
                            }
                            return u;
                        });

                        const aiLogEntry = `${unit.name} atacou ${target.name} causando ${unit.currentAttack} de dano!`;
                        newState.playerLog = [aiLogEntry, ...newState.playerLog].slice(0, 20);

                    } else {
                        // Attack Hero
                        newState.playerHealth = Math.max(0, newState.playerHealth - unit.currentAttack);

                        const heroLogEntry = `${unit.name} atacou você diretamente causando ${unit.currentAttack} de dano!`;
                        newState.playerLog = [heroLogEntry, ...newState.playerLog].slice(0, 20);

                        // Mark as attacked
                        newState.opponentBoard = newState.opponentBoard.map((u, i) => {
                            if (i === unitIndex && u) return { ...u, canAttack: false };
                            return u;
                        });
                    }
                }
            });

            if (newState.playerHealth <= 0) {
                newState.gameStatus = 'defeat';
            }

            return newState;
        });

        // Always end turn after AI loop
        setTimeout(() => endTurn(), 1500);
    };

    const nextPhase = () => {
        if (state.phase === 'strategy') {
            const skipBattle = state.currentPlayer === 'player' ? state.playerBattlePhaseSkipped : state.opponentBattlePhaseSkipped;
            if (skipBattle) {
                addToast('Fase de Batalha pulada!', 'warning');
                setState(prev => ({
                    ...prev,
                    opponentBattlePhaseSkipped: prev.currentPlayer === 'opponent' ? false : prev.opponentBattlePhaseSkipped,
                    playerBattlePhaseSkipped: prev.currentPlayer === 'player' ? false : prev.playerBattlePhaseSkipped
                }));
                endTurn();
            } else {
                setState(prev => ({ ...prev, phase: 'battle' }));
            }
        } else {
            endTurn();
        }
    };

    const endTurn = () => {
        setSelectedUnit(null);
        setState(prev => {
            let isPlayerTurn = prev.currentPlayer === 'player';
            let nextPlayer = isPlayerTurn ? 'opponent' : 'player' as 'player' | 'opponent';

            // Check if next player is skipped
            const isNextSkipped = nextPlayer === 'player' ? prev.playerNextTurnSkipped : prev.opponentNextTurnSkipped;

            if (isNextSkipped) {
                addToast(`Turno de ${nextPlayer === 'player' ? 'Jogador' : 'Oponente'} pulado!`, 'warning');
                // Stay as current player, but reset phase
                return {
                    ...prev,
                    phase: 'strategy',
                    turnTimer: 30,
                    playerNextTurnSkipped: nextPlayer === 'player' ? false : prev.playerNextTurnSkipped,
                    opponentNextTurnSkipped: nextPlayer === 'opponent' ? false : prev.opponentNextTurnSkipped,
                    // Reset attacker canAttack for current player again? 
                    // No, usually skipping a turn means the OTHER player plays twice.
                    // So we increment turn if it was player -> opponent skipped -> back to player (turn count might stay or inc)
                };
            }

            const nextTurn = isPlayerTurn ? prev.turn + 1 : prev.turn;

            const newState: BattleState = {
                ...prev,
                turn: nextTurn,
                phase: 'strategy',
                currentPlayer: nextPlayer,
                turnTimer: 30, // 30s
                canDrawCard: true, // Always start with draw phase active

                // Reset Board Status
                // Reset Board Status and Increment Counters
                playerBoard: prev.playerBoard.map(u => {
                    if (!u) return null;
                    let updated = { ...u };

                    if (nextPlayer === 'player') {
                        updated.canAttack = true; // Start of player turn
                        updated.isSilenced = false; // Turn-based reset
                        // Turn-based logic
                        if (updated.name === 'Hulk') {
                            const turns = (updated.counters?.turns || 0) + 1;
                            if (turns >= 3) {
                                updated.name = 'Bruce Banner';
                                updated.currentAttack = 100;
                                updated.currentHealth = 100;
                                updated.description = 'Hulk se acalmou.';
                            }
                            updated.counters = { ...updated.counters, turns };
                        }
                    }

                    return updated;
                }),
                opponentBoard: prev.opponentBoard.map(u => {
                    if (!u) return null;
                    let updated = { ...u };

                    if (nextPlayer === 'opponent') {
                        updated.canAttack = true; // Start of opponent turn
                        updated.isSilenced = false; // Turn-based reset
                        // AI turn counters could be added here
                    }

                    return updated;
                }),

                divineSlots: {
                    player: prev.divineSlots.player.map(u => u ? { ...u, isSilenced: nextPlayer === 'player' ? false : u.isSilenced, canAttack: nextPlayer === 'player' ? true : u.canAttack } : null),
                    opponent: prev.divineSlots.opponent.map(u => u ? { ...u, isSilenced: nextPlayer === 'opponent' ? false : u.isSilenced, canAttack: nextPlayer === 'opponent' ? true : u.canAttack } : null),
                },

                hasPlayedWarriorThisTurn: false,
                cardsPlayedThisTurn: [],
                unitsUsedAbilityThisTurn: [],

                // Divine Maintenance Check (only for Player)
                pendingMaintenance: nextPlayer === 'player'
                    ? prev.playerBoard.filter(u => u && u.rarity === 'Supremo').map(u => u!.id)
                    : [],
            };

            return newState;
        });

        // Release AI Lock
        isProcessingAI.current = false;
    };


    // Auto-Draw Logic & Opponent Draw
    useEffect(() => {
        if (!state.canDrawCard) return;

        let drawTimeout: ReturnType<typeof setTimeout>; // Corrected type for drawTimeout

        if (state.currentPlayer === 'opponent') {
            // Opponent draws automatically after delay
            drawTimeout = setTimeout(() => {
                drawCards(1, 'opponent');
            }, 500);
        } else if (state.currentPlayer === 'player') {
            // Player gets 1 second to draw manually
            drawTimeout = setTimeout(() => {
                drawCards(1, 'player');
            }, 1000);
        }

        return () => clearTimeout(drawTimeout);
    }, [state.canDrawCard, state.currentPlayer]);

    // Manual Draw Function
    const manualDraw = () => {
        if (state.currentPlayer === 'player' && state.canDrawCard) {
            drawCards(1, 'player');
        }
    };

    const undoPlayCard = (unitId: string) => {
        setState(prev => {
            if (prev.phase !== 'strategy') return prev;
            if (!prev.cardsPlayedThisTurn.includes(unitId)) return prev;

            const unit = prev.playerBoard.find(u => u?.id === unitId);
            if (!unit) return prev;

            addToast('Jogada desfeita', 'info');

            const cardToReturn: Card = {
                id: unit.id,
                name: unit.name,
                universe: unit.universe,
                rarity: unit.rarity,
                atk: unit.atk,
                def: unit.def,
                image: unit.image,
                description: unit.description,
                ability: unit.ability,
                effects: unit.effects,
                cost: unit.cost
            };


            const newCardsPlayed = prev.cardsPlayedThisTurn.filter(id => id !== unitId);

            return {
                ...prev,
                playerBoard: prev.playerBoard.map(u => u?.id === unitId ? null : u),
                playerHand: [...prev.playerHand, cardToReturn],
                cardsPlayedThisTurn: newCardsPlayed,
                // If we undo the last card played, we reset the limit (simplified assumption)
                hasPlayedWarriorThisTurn: newCardsPlayed.length > 0
            };
        });
    };

    const executeEffect = (effect: CardEffect, source: Unit, targetId?: string) => {
        // Target Logic: If target needed but not provided, enter selection mode
        if (!targetId && (effect.target === 'enemy' || effect.target === 'any' || (effect.type === 'destroy' || effect.type === 'banish' || effect.type === 'returnToHand'))) {
            // Check if there ARE valid targets
            const opponentUnits = [...state.opponentBoard, ...state.divineSlots.opponent].filter(u => u !== null).map(u => u!.id);
            // If strictly enemy targeting
            if (opponentUnits.length === 0 && effect.target !== 'any') {
                addToast('Sem alvos válidos!', 'warning');
                return;
            }

            setState(prev => ({
                ...prev,
                targetSelectionMode: {
                    active: true,
                    effect: effect,
                    source: source,
                    validTargets: effect.target === 'any' ? [...opponentUnits, ...prev.playerBoard.filter(u => u).map(u => u!.id)] : opponentUnits
                }
            }));
            addToast('Selecione um alvo', 'info');
            return;
        }

        if (targetId) {
            addToast(`${source.name} usou ${effect.description || 'Habilidade'} em ${targetId}!`, 'info');
        } else {
            addToast(`${source.name} usou ${effect.description || 'Habilidade'}!`, 'info');
        }

        // --- SILENCE CHECK ---
        if (source.isSilenced) {
            addToast('A habilidade falhou! Esta unidade está anulada.', 'warning');
            return;
        }

        setState(prev => {
            let newState = { ...prev };

            // Determine targets based on effect.target
            let targets: Unit[] = [];

            if (effect.target === 'self') {
                targets = newState.playerBoard.filter((u): u is Unit => !!u && u.id === source.id);
            } else if (effect.target === 'enemy' || effect.target === 'opponent') { // Consolidated enemy unit targeting
                if (targetId) {
                    targets = newState.opponentBoard.filter((u): u is Unit => !!u && u.id === targetId);
                    // Also check divine slots? Assuming yes for now if ID matches
                    if (targets.length === 0) targets = newState.divineSlots.opponent.filter((u): u is Unit => !!u && u.id === targetId);
                } else if (effect.target === 'opponent' && effect.type === 'damage') {
                    // Direct damage to hero is usually specific type, but if target='opponent' and type='damage' it might be hero?
                    // Old logic: effect.target === 'opponent' -> Hero.
                    // New logic: explicit targets.
                    // Let's keep specific hero check logic separate or use target='opponent' exclusively for hero.
                }
            } else if (effect.target === 'allies') {
                targets = newState.playerBoard.filter((u): u is Unit => !!u && u.id !== source.id);
            }

            // Logic for Hero Targeting (Legacy support or new specific type)
            if (effect.target === 'opponent' && !targetId && effect.type !== 'destroy' && effect.type !== 'banish') {
                // Assume Hero if not targeting a unit for control
                if (effect.type === 'damage') {
                    newState.opponentHealth = Math.max(0, newState.opponentHealth - effect.value);
                    addToast(`${source.name} causou ${effect.value} de dano ao Herói!`, 'info');
                    return newState;
                }
            }

            // --- ABILITY PARSER V1 ---

            // 1. Control Effects (Destroy/Banish/Return)
            if (effect.type === 'destroy' || effect.type === 'banish' || effect.type === 'returnToHand') {
                if (targets.length > 0) {
                    targets.forEach(t => {
                        const isOpponent = newState.opponentBoard.some(u => u?.id === t.id) || newState.divineSlots.opponent.some(u => u?.id === t.id);
                        const board = isOpponent ? newState.opponentBoard : newState.playerBoard;
                        const divine = isOpponent ? newState.divineSlots.opponent : newState.divineSlots.player;
                        const graveyard = isOpponent ? newState.opponentGraveyard : newState.playerGraveyard;
                        const banished = isOpponent ? newState.opponentBanished : newState.playerBanished;
                        const hand = isOpponent ? [] : newState.playerHand; // Opponent hand not tracked fully yet

                        // Remove from Board
                        if (isOpponent) {
                            newState.opponentBoard = board.map(u => u?.id === t.id ? null : u);
                            newState.divineSlots.opponent = divine.map(u => u?.id === t.id ? null : u);
                        } else {
                            newState.playerBoard = board.map(u => u?.id === t.id ? null : u);
                            newState.divineSlots.player = divine.map(u => u?.id === t.id ? null : u);
                        }

                        // Add to Destination
                        if (effect.type === 'destroy') {
                            graveyard.push(t);
                            addToast(`${t.name} foi destruído!`, 'warning');
                        } else if (effect.type === 'banish') {
                            banished.push(t);
                            addToast(`${t.name} foi banido!`, 'warning');
                        } else if (effect.type === 'returnToHand') {
                            if (!isOpponent) hand.push(t); // Return to player hand
                            else newState.opponentHandCount++; // Return to AI hand (abstract)
                            addToast(`${t.name} voltou para a mão!`, 'info');
                        }
                    });
                    return newState;
                }
            }

            // 2. Buffs/Debuffs
            targets.forEach(targetUnit => {
                const targetIsPlayer = newState.playerBoard.some(u => u?.id === targetUnit.id) || newState.divineSlots.player.some(u => u?.id === targetUnit.id);
                // Helper to update specific unit
                const updateUnit = (u: Unit | null) => {
                    if (!u || u.id !== targetUnit.id) return u;
                    let val = effect.value;

                    // Scaling Logic
                    if (effect.type === 'buffAtkScaling' && effect.scalingFactor) {
                        if (effect.condition === 'handSize') val = (targetIsPlayer ? newState.playerHand.length : newState.opponentHandCount) * effect.scalingFactor;
                        else if (effect.condition === 'graveyardSize') val = (targetIsPlayer ? newState.playerGraveyard.length : newState.opponentGraveyard.length) * effect.scalingFactor;
                    }

                    if (effect.type === 'buffAtk' || effect.type === 'buffAtkScaling') return { ...u, currentAttack: u.currentAttack + val };
                    if (effect.type === 'buffDef') return { ...u, currentHealth: u.currentHealth + val }; // Using currentHealth as Def broadly? Or maxHealth? currentHealth usually.
                    if (effect.type === 'damage') return { ...u, currentHealth: u.currentHealth - val };
                    if (effect.type === 'heal') return { ...u, currentHealth: u.currentHealth + val };
                    if (effect.type === 'invertStats') return { ...u, currentAttack: u.currentHealth, currentHealth: u.currentAttack };
                    return u;
                };

                // Apply update
                newState.playerBoard = newState.playerBoard.map(updateUnit);
                newState.opponentBoard = newState.opponentBoard.map(updateUnit);
                newState.divineSlots.player = newState.divineSlots.player.map(updateUnit);
                newState.divineSlots.opponent = newState.divineSlots.opponent.map(updateUnit);
            });

            // 3. Global/Player Effects (Draw, HealHero, etc) -> Existing logic works mostly, just ensure scaling types don't break it.
            // ... (keeping existing logic below for fallback)

            // Special non-target or state effects
            if (effect.type === 'healHero') {
                if (source.id.includes('opp')) {
                    newState.opponentHealth = Math.min(8000, newState.opponentHealth + effect.value);
                } else {
                    newState.playerHealth = Math.min(8000, newState.playerHealth + effect.value);
                }
                addToast(`${source.name} curou o Herói em ${effect.value}!`, 'info');
            } else if (effect.type === 'revealHand') {
                newState.opponentHandRevealed = true;
                addToast(`${source.name} revelou a mão do oponente!`, 'info');
            } else if (effect.type === 'skipTurn') {
                if (source.id.includes('opp')) {
                    newState.playerNextTurnSkipped = true;
                } else {
                    newState.opponentNextTurnSkipped = true;
                }
                addToast(`${source.name} paralisou o oponente!`, 'warning');
            } else if (effect.type === 'skipBattlePhase') {
                if (source.id.includes('opp')) {
                    newState.playerBattlePhaseSkipped = true;
                } else {
                    newState.opponentBattlePhaseSkipped = true;
                }
                addToast(`${source.name} distraiu o oponente!`, 'warning');
            } else if (effect.type === 'search') {
                const searchFilter = (c: Card) => c.rarity !== 'Efeito' && c.rarity !== 'Zeta';
                newState.pendingSearch = {
                    filter: searchFilter,
                    count: effect.value,
                    callback: (selected) => {
                        addToast(`Você buscou: ${selected.map(s => s.name).join(', ')}`, 'info');
                    }
                };
            } else if (effect.type === 'invertStats') {
                newState.playerBoard = newState.playerBoard.map(u =>
                    u && u.id === targetId ? { ...u, currentAttack: u.currentHealth, currentHealth: u.currentAttack } : u
                );
                newState.opponentBoard = newState.opponentBoard.map(u =>
                    u && u.id === targetId ? { ...u, currentAttack: u.currentHealth, currentHealth: u.currentAttack } : u
                );
                addToast('Status invertidos!', 'info');
            } else if (effect.type === 'copyAtk') {
                const enemy = newState.opponentBoard.find(u => u?.id === targetId);
                if (enemy) {
                    newState.playerBoard = newState.playerBoard.map(u =>
                        u && u.rarity !== 'Efeito' ? { ...u, currentAttack: enemy.currentAttack } : u
                    );
                    addToast(`Ataque copiado de ${enemy.name}!`, 'info');
                }
            } else if (effect.type === 'draw') {
                if (source.id.includes('opp') === false) { // Player
                    const cardsToDraw = Math.min(effect.value, newState.playerDeck.length);
                    const drawnCards = newState.playerDeck.slice(0, cardsToDraw);
                    newState.playerHand = [...newState.playerHand, ...drawnCards];
                    newState.playerDeck = newState.playerDeck.slice(cardsToDraw);
                    addToast(`${source.name} comprou ${cardsToDraw} carta(s)!`, 'info');
                } else {
                    newState.opponentHandCount += effect.value; // Simplification for AI
                    addToast(`Oponente comprou ${effect.value} carta(s)!`, 'info');
                }
            } else if (effect.type === 'summon') {
                // Simplified Summon: Add to hand if full, or generic visual
                addToast(`${source.name} invocou reforços! (Lógica simplificada)`, 'info');
                // For now, treat as draw specific units or token generation if needed.
            } else if (effect.type === 'silence') {
                // Add silenced marker (visual/logic)
                const targetIds = targets.map(t => t.id);
                newState.playerBoard = newState.playerBoard.map(u => u && targetIds.includes(u.id) ? { ...u, isSilenced: true } : u);
                newState.opponentBoard = newState.opponentBoard.map(u => u && targetIds.includes(u.id) ? { ...u, isSilenced: true } : u);
                newState.divineSlots.player = newState.divineSlots.player.map(u => u && targetIds.includes(u.id) ? { ...u, isSilenced: true } : u);
                newState.divineSlots.opponent = newState.divineSlots.opponent.map(u => u && targetIds.includes(u.id) ? { ...u, isSilenced: true } : u);

                targets.forEach(t => {
                    addToast(`${t.name} teve seus efeitos anulados!`, 'warning');
                });
            }

            // Add Visual Effects
            const newVisualEffects = [...newState.visualEffects];
            targets.forEach(t => {
                newVisualEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: effect.type,
                    targetId: t.id,
                    sourceId: source.id,
                    value: effect.value
                });
            });

            // If target passed but not in board (Hero damage), add it too?
            if (effect.target === 'opponent' && effect.type === 'damage') {
                newVisualEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'damage', // or effect.type
                    targetId: 'opponent-hero',
                    sourceId: source.id,
                    value: effect.value
                });
            }

            return { ...newState, visualEffects: newVisualEffects };
        });

        // Handle side-effects outside setState if possible, or needing complex state updates
        if (effect.type === 'draw') {
            drawCards(effect.value, 'player');
        }
        if (effect.type === 'heal' && effect.target === 'self' && !targetId) {
            // Heal Hero logic if target is ambiguously self-hero vs self-unit
            // Usually target='self' on a Unit means the Unit.
            // If we want to heal Hero, target should be 'player' (not in types currently, assuming 'self' context)
        }
    };

    const clearVisualEffect = (id: string) => {
        setState(prev => ({
            ...prev,
            visualEffects: prev.visualEffects.filter(e => e.id !== id)
        }));
    };

    const playCard = (card: Card, slotIndex?: number, playFaceDown: boolean = false, forcePlay: boolean = false) => {
        if (state.phase !== 'strategy') return;

        setState(prev => {
            // CORE ENGINE 5: EFFECT CARD INTERCEPTION
            const isEffectCard = card.rarity === 'Efeito' || card.rarity === 'Zeta';
            if (!forcePlay && isEffectCard && !playFaceDown && Number(card.id) >= 1000 && Number(card.id) <= 1025) {
                return {
                    ...prev,
                    pendingEffectPlay: {
                        card: card,
                        message: 'Escolha como jogar esta carta:'
                    }
                };
            }

            // Check if Divine card
            if (card.rarity === 'Supremo') {
                // Find empty divine slot
                const emptyDivineIndex = prev.divineSlots.player.findIndex(slot => slot === null);

                if (emptyDivineIndex === -1) {
                    addToast('Limite de 2 cartas Divinas atingido!', 'warning');
                    return prev;
                }

                // Create Divine unit
                const newDivineUnit: Unit = {
                    ...card,
                    currentHealth: card.def || 1,
                    currentAttack: card.atk || 0,
                    canAttack: true,
                };

                const newDivineSlots = [...prev.divineSlots.player];
                newDivineSlots[emptyDivineIndex] = newDivineUnit;

                addToast(`${card.name} invocado no Slot Divino!`, 'info');

                return {
                    ...prev,
                    playerHand: prev.playerHand.filter(c => c.id !== card.id),
                    divineSlots: {
                        ...prev.divineSlots,
                        player: newDivineSlots
                    },
                    hasPlayedWarriorThisTurn: true,
                    cardsPlayedThisTurn: [...prev.cardsPlayedThisTurn, newDivineUnit.id]
                };
            }

            // Normal card logic (non-Divine)
            // Find target slot
            const isSupport = card.rarity === 'Efeito' || card.rarity === 'Zeta';
            let targetIndex = slotIndex;

            if (targetIndex === undefined) {
                // Auto-find first empty slot based on type
                const boardSize = prev.playerBoard.length;
                const half = boardSize / 2;

                if (isSupport) {
                    // Try back row slots (half to boardSize-1)
                    targetIndex = Array.from({ length: half }, (_, i) => i + half).find(idx => prev.playerBoard[idx] === null) ?? -1;
                } else {
                    // Warriors can go anywhere, but prefer front row (0 to half-1)
                    targetIndex = Array.from({ length: half }, (_, i) => i).find(idx => prev.playerBoard[idx] === null) ?? -1;
                    if (targetIndex === -1) {
                        // If front is full, try back
                        targetIndex = Array.from({ length: half }, (_, i) => i + half).find(idx => prev.playerBoard[idx] === null) ?? -1;
                    }
                }

                // If STILL -1 and board < 20, we will expand below
            }

            const boardSize = prev.playerBoard.length;
            const half = boardSize / 2;

            // Expansion logic: If no index found or all full, expand if < 20
            if ((targetIndex === -1 || prev.playerBoard.every(s => s !== null)) && boardSize < 20) {
                const newSize = boardSize + 2;
                const expandedBoardPlayer = [...prev.playerBoard];
                const expandedBoardOpponent = [...prev.opponentBoard];

                // Add 1 front slot and 1 back slot
                // To keep index consistent (half front, half back), we insert at the middle and the end
                expandedBoardPlayer.splice(half, 0, null); // Add to front row
                expandedBoardPlayer.push(null); // Add to back row

                expandedBoardOpponent.splice(half, 0, null);
                expandedBoardOpponent.push(null);

                addToast('Campo expandido!', 'info');

                // Recalculate targetIndex after expansion if it was -1
                if (targetIndex === -1) {
                    if (isSupport) {
                        targetIndex = newSize - 1; // Last slot (new back)
                    } else {
                        targetIndex = half; // Middle slot (new front)
                    }
                }

                // Update state with expanded boards BEFORE continuing
                prev.playerBoard = expandedBoardPlayer;
                prev.opponentBoard = expandedBoardOpponent;
            }

            if (targetIndex === -1 || targetIndex >= prev.playerBoard.length) {
                addToast('Não há slots disponíveis!', 'warning');
                return prev;
            }
            if (prev.playerBoard[targetIndex]) return prev; // Slot occupied

            // Row restriction: Warriors (Anywhere), Support (Back only)
            const currentHalf = prev.playerBoard.length / 2;
            if (isSupport && targetIndex < currentHalf) {
                addToast('Suportes só podem ser jogados na Retaguarda!', 'warning');
                return prev;
            }



            const isUnit = !isSupport;

            // 1. Warrior Limit Check
            if (isUnit && prev.hasPlayedWarriorThisTurn) {
                addToast('Apenas 1 carta de personagem por turno!', 'warning');
                return prev;
            }

            // 2. Sacrifice Check
            const sacrificeCost = getSacrificeCost(card);
            if (sacrificeCost > 0) {
                return {
                    ...prev,
                    needsSacrifice: { cardId: card.id, required: sacrificeCost }
                };
            }

            // 3. Normal Play (No Sacrifice)
            const newUnit: Unit = {
                ...card,
                currentHealth: card.def || 1, // Effect cards have 0 def usually
                currentAttack: card.atk || 0,
                canAttack: !playFaceDown && isUnit, // Effects usually can't attack unless transformed
                isFaceDown: playFaceDown,
            };

            const newBoard = [...prev.playerBoard];
            newBoard[targetIndex] = newUnit;

            // CHAIN SYSTEM TRIGGER
            // If playing an effect/ability, start chain?
            // "Sempre que uma ação for iniciada (Ataque ou Ativação de Efeito)"
            // Playing a card is an action. Especially Effect cards if activated.
            // If "Set Face Down", maybe no chain? Assuming yes for now if not FaceDown.

            // const shouldTriggerChain = !playFaceDown && (card.rarity === 'Efeito' || card.rarity === 'Zeta' || card.effects?.some(e => e.trigger === 'onPlay'));
            // Logic moved to a side effect or handled by caller? 
            // Ideally we trigger state change here.

            // IMPORTANT: We can't call startChain (setState) inside setState.
            // We need to trigger it via side effect or returning a flag/queue.
            // For simplicity, we assume the UI/Component calling playCard handles the chain visualization 
            // OR we add a pendingChain to state.
            // Let's rely on `cardsPlayedThisTurn` change to trigger a "Response Opportunity" if we want to be reactive,
            // but user wants a specific "WaitingResponse" state.

            // Simplification: We will start the chain timer via a separate effect or immediate callback.
            // Since we can't do it here easily without complex state merge, we will do it in `playCard` wrapper.

            return {
                ...prev,
                playerHand: prev.playerHand.filter(c => c.id !== card.id),
                playerBoard: newBoard,
                hasPlayedWarriorThisTurn: isUnit ? true : prev.hasPlayedWarriorThisTurn,
                cardsPlayedThisTurn: [...prev.cardsPlayedThisTurn, newUnit.id]
            };
        });

        // Post-SetState Logic for Chain
        // We need to check if we should start a chain.
        // We do it slightly delayed to ensure state updated? No, just fire it.
        // Post-SetState Logic for Chain
        // Automatic chain trigger removed to allow explicit control via UI and Actions (Attack/Activate)
        // const isAction = ...

        // Trigger onPlay effects ONLY if card was played immediately (no sacrifice)
        // For sacrifice, effects are triggered in verifySacrifice
        const sacrificeCost = getSacrificeCost(card);
        if (sacrificeCost === 0) {
            setTimeout(() => {
                if (card.effects) {
                    card.effects.forEach(effect => {
                        if (effect.trigger === 'onPlay') {
                            const sourceUnit = { ...card, currentHealth: card.def || 0, currentAttack: card.atk || 0, canAttack: false } as Unit;
                            executeEffect(effect, sourceUnit);
                        }
                    });
                }
            }, 100);
        }
    };

    const confirmSacrifice = (sacrificeIds: string[]) => {
        setState(prev => {
            if (!prev.needsSacrifice) return prev;

            const cardToPlay = prev.playerHand.find(c => c.id === prev.needsSacrifice!.cardId);
            if (!cardToPlay) return { ...prev, needsSacrifice: null };

            // Verify cost
            if (sacrificeIds.length !== prev.needsSacrifice.required) return prev;

            // Find Slot (Recalculate first empty slot AFTER sacrifices are removed? 
            // Logic: Sacrifices might free up validity. But normally we play into EMPTY slot.
            // Safest: Remove sacrifices first, then find slot.

            let newPlayerBoard = [...prev.playerBoard];
            let newPlayerGraveyard = [...prev.playerGraveyard];
            let newPlayerHand = [...prev.playerHand]; // Will update later

            // Process Sacrifices
            sacrificeIds.forEach(id => {
                // Try to find in board
                const boardIndex = newPlayerBoard.findIndex(u => u?.id === id);
                if (boardIndex !== -1) {
                    const unit = newPlayerBoard[boardIndex]!;
                    newPlayerBoard[boardIndex] = null;
                    newPlayerGraveyard.push({ ...unit } as Card); // Approximate conversion
                } else {
                    // Try hand
                    const handIndex = newPlayerHand.findIndex(c => c.id === id);
                    if (handIndex !== -1) {
                        const card = newPlayerHand[handIndex];
                        newPlayerHand = newPlayerHand.filter(c => c.id !== id);
                        newPlayerGraveyard.push(card);
                    }
                }
            });

            // Find slot for Main Card
            const targetIndex = newPlayerBoard.findIndex(slot => slot === null);
            if (targetIndex === -1) {
                // Board Full despite sacrifice? (Unlikely unless sacrifice was from hand only)
                return { ...prev, needsSacrifice: null }; // Cancel play
            }

            // Play Card
            const newUnit: Unit = {
                ...cardToPlay,
                currentHealth: cardToPlay.def || 1,
                currentAttack: cardToPlay.atk || 0,
                canAttack: true,
            };

            newPlayerBoard[targetIndex] = newUnit;
            newPlayerHand = newPlayerHand.filter(c => c.id !== cardToPlay.id);


            return {
                ...prev,
                playerHand: newPlayerHand,
                playerBoard: newPlayerBoard,
                playerGraveyard: newPlayerGraveyard,
                needsSacrifice: null,
                hasPlayedWarriorThisTurn: true, // Assuming high level is Warrior/Unit
                cardsPlayedThisTurn: [...prev.cardsPlayedThisTurn, newUnit.id]
            };
        });
    };

    const attackUnit = (attackerId: string, targetId: string) => {
        if (state.phase !== 'battle') return;
        if (state.turn === 1 && state.currentPlayer === 'player') {
            addToast('Ataques indisponveis no primeiro turno!', 'warning');
            return;
        }

        // Get attacker to check onAttack effects
        const attacker = state.playerBoard.find(u => u?.id === attackerId);
        if (attacker && attacker.effects) {
            attacker.effects.forEach(effect => {
                if (effect.trigger === 'onAttack') {
                    executeEffect(effect, attacker);
                }
            });
        }

        // Apply Chain for Attack
        startChain(() => {
            setState(prev => {
                // Find attacker (Re-fetch to be safe inside closure, though IDs are stable)
                let attacker = prev.playerBoard.find(u => u?.id === attackerId);
                if (!attacker) {
                    attacker = prev.divineSlots.player.find(u => u?.id === attackerId) || undefined;
                }

                // Find target
                let target = prev.opponentBoard.find(u => u?.id === targetId);
                if (!target) {
                    target = prev.divineSlots.opponent.find(u => u?.id === targetId) || undefined;
                }

                if (!attacker || !target || !attacker.canAttack) return prev; // Re-validate inside chain execution

                // Apply Auras for calculation
                const effectiveAttacker = getUnitWithAuras(attacker, prev.playerBoard);
                const effectiveTarget = getUnitWithAuras(target, prev.opponentBoard);

                // Divine Rule
                if (target.rarity === 'Supremo' && attacker.rarity !== 'Supremo') {
                    addToast('Apenas unidades Divinas podem atacar Divinos!', 'warning');
                    return prev;
                }

                // Ghost Rule
                if (target.rarity === 'Efeito' || target.rarity === 'Zeta') {
                    addToast('Cartas de Efeito são intangíveis e não podem ser atacadas!', 'warning');
                    return prev;
                }


                addToast(`${attacker!.name} atacou ${target!.name}!`, 'info');

                // NEW COMBAT ENGINE LOGIC
                let attackerDies = false;
                let targetDies = false;
                let defenderNewDef = effectiveTarget.currentHealth;
                let damageToOpponent = 0;

                const AT = effectiveAttacker.currentAttack;
                const DF = effectiveTarget.currentHealth;

                if (AT === DF) {
                    // DRAW: Nobody dies, nobody takes damage.
                    addToast('Empate! Ninguém sofreu dano.', 'info');
                } else if (AT > DF) {
                    // VICTORY: Target dies. Opponent takes Trample Damage (AT - DF).
                    targetDies = true;
                    damageToOpponent = AT - DF;
                    addToast(`Vitória Esmagadora! ${target!.name} destruído e ${damageToOpponent} de dano no oponente!`, 'info');
                } else if (AT < DF) {
                    // LOSS: Attacker dies. Persistent Damage on Defender (Wear Down).
                    attackerDies = true;
                    defenderNewDef = Math.max(0, DF - AT);
                    addToast(`Defesa Impenetrável! ${attacker!.name} morreu, mas causou ${AT} de desgaste em ${target!.name}.`, 'warning');
                }

                // Update Board State
                const newPlayerBoard = prev.playerBoard.map(u => {
                    if (!u) return null;
                    if (u.id === attackerId) {
                        if (attackerDies) return null; // Destroyed
                        return { ...u, canAttack: false }; // Survived but used attack
                    }
                    return u;
                });

                const newOpponentBoard = prev.opponentBoard.map(u => {
                    if (!u) return null;
                    if (u.id === targetId) {
                        if (targetDies) return null; // Destroyed
                        // Persistent Damage + Reveal
                        return {
                            ...u,
                            currentHealth: defenderNewDef,
                            isFaceDown: false
                        };
                    }
                    return u;
                });

                // Update Divine Slots
                const newPlayerDivineSlots = prev.divineSlots.player.map(u => {
                    if (!u) return null;
                    if (u.id === attackerId) {
                        if (attackerDies) return null;
                        return { ...u, canAttack: false };
                    }
                    return u;
                });

                const newOpponentDivineSlots = prev.divineSlots.opponent.map(u => {
                    if (!u) return null;
                    if (u.id === targetId) {
                        if (targetDies) return null;
                        return {
                            ...u,
                            currentHealth: defenderNewDef,
                            isFaceDown: false
                        };
                    }
                    return u;
                });

                const newLogEntry = `${attacker!.name} atacou ${target!.name} (AT:${AT} vs DF:${DF})`;

                return {
                    ...prev,
                    playerBoard: shrinkBoardIfNeeded(newPlayerBoard),
                    opponentBoard: shrinkBoardIfNeeded(newOpponentBoard),
                    divineSlots: {
                        player: newPlayerDivineSlots,
                        opponent: newOpponentDivineSlots
                    },
                    opponentHealth: Math.max(0, prev.opponentHealth - damageToOpponent),
                    opponentLog: [newLogEntry, ...prev.opponentLog].slice(0, 20)
                };
            });
            console.log("Attack Resolved (Chain Completed)");
        });
        setSelectedUnit(null);
    };
    const attackHero = (attackerId: string) => {
        if (state.phase !== 'battle') return;
        if (state.turn === 1 && state.currentPlayer === 'player') {
            addToast('Ataques indisponveis no primeiro turno!', 'warning');
            return;
        }

        // OnAttack effects
        const attacker = state.playerBoard.find(u => u?.id === attackerId);
        if (attacker && attacker.effects) {
            attacker.effects.forEach(effect => {
                if (effect.trigger === 'onAttack') {
                    executeEffect(effect, attacker);
                }
            });
        }

        startChain(() => {
            setState(prev => {
                const attacker = prev.playerBoard.find(u => u?.id === attackerId);
                // Recheck blockers inside chain just in case state changed (unlikely in sync play but good practice)
                const hasBlockers = prev.opponentBoard.some(u => u && u.rarity !== 'Efeito' && u.rarity !== 'Zeta');

                if (!attacker || !attacker.canAttack || hasBlockers) {
                    // Logic to handle invalid state if visual feedback already happened?
                    // Just return prev if invalid now. Use toast if needed.
                    if (hasBlockers && !prev.opponentBoard.some(u => u && u.rarity !== 'Efeito' && u.rarity !== 'Zeta')) {
                        // Double check boolean logic. hasBlockers is TRUE if blockers exist.
                    }
                    return prev;
                }

                addToast(`${attacker.name} atacou o Oponente!`, 'info');

                const newOpponentHealth = prev.opponentHealth - attacker.currentAttack;

                const newLogEntry = `${attacker.name} atacou o oponente diretamente causando ${attacker.currentAttack} de dano!`;

                const newPlayerBoard = prev.playerBoard.map(u =>
                    (u?.id === attackerId) ? { ...u, canAttack: false } : u
                );

                return {
                    ...prev,
                    opponentHealth: Math.max(0, newOpponentHealth),
                    playerBoard: newPlayerBoard,
                    opponentLog: [newLogEntry, ...prev.opponentLog].slice(0, 20),
                    gameStatus: newOpponentHealth <= 0 ? 'victory' as const : prev.gameStatus,
                };
            });
        });
        setSelectedUnit(null);
    };

    const sacrificeCard = (cardId: string, fromHand: boolean) => {
        setState(prev => {
            let cardToSacrifice: Card | undefined;

            if (fromHand) {
                cardToSacrifice = prev.playerHand.find(c => c.id === cardId);
                if (!cardToSacrifice) return prev;

                return {
                    ...prev,
                    playerHand: prev.playerHand.filter(c => c.id !== cardId),
                    playerGraveyard: [...prev.playerGraveyard, cardToSacrifice]
                };
            } else {
                const unit = prev.playerBoard.find(u => u?.id === cardId);
                if (!unit) return prev;

                // Convert unit back to card for graveyard
                cardToSacrifice = {
                    id: unit.id,
                    name: unit.name,
                    universe: unit.universe,
                    rarity: unit.rarity,
                    atk: unit.atk,
                    def: unit.def,
                    image: unit.image,
                    description: unit.description,
                    ability: unit.ability,
                    effects: unit.effects,
                    cost: unit.cost
                };

                // Remove from board (set slot to null)
                const newPlayerBoard = prev.playerBoard.map(u => u?.id === cardId ? null : u);

                return {
                    ...prev,
                    playerBoard: shrinkBoardIfNeeded(newPlayerBoard),
                    playerGraveyard: [...prev.playerGraveyard, cardToSacrifice]
                };
            }
        });
    };



    const resolveMaintenance = (unitId: string, sacrificeId?: string) => {
        setState(prev => {
            const newPending = prev.pendingMaintenance.filter(id => id !== unitId);
            let newPlayerBoard = [...prev.playerBoard];
            let newDivineSlots = [...prev.divineSlots.player];
            let newGraveyard = [...prev.playerGraveyard];

            if (sacrificeId) {
                // Remove sacrifice from regular board
                const sacrificeIndex = newPlayerBoard.findIndex(u => u?.id === sacrificeId);
                if (sacrificeIndex !== -1) {
                    const sacrifice = newPlayerBoard[sacrificeIndex]!;
                    newPlayerBoard[sacrificeIndex] = null;
                    newGraveyard.push({ ...sacrifice });
                }
            } else {
                // Kill the Divine unit if not paid
                const divineIndex = newDivineSlots.findIndex(u => u?.id === unitId);
                if (divineIndex !== -1) {
                    const unit = newDivineSlots[divineIndex]!;
                    newDivineSlots[divineIndex] = null;
                    newGraveyard.push({ ...unit });
                }
            }

            return {
                ...prev,
                pendingMaintenance: newPending,
                playerBoard: shrinkBoardIfNeeded(newPlayerBoard),
                divineSlots: { ...prev.divineSlots, player: newDivineSlots },
                playerGraveyard: newGraveyard
            };
        });
    };

    const cancelSacrifice = () => {
        setState(prev => ({ ...prev, needsSacrifice: null }));
    };

    const startSearch = (filter: (card: Card) => boolean, count: number, callback: (selected: Card[]) => void) => {
        setState(prev => ({
            ...prev,
            pendingSearch: { filter, count, callback }
        }));
    };

    const resolveSearch = (selectedIds: string[]) => {
        setState(prev => {
            if (!prev.pendingSearch) return prev;
            const selectedCards = prev.playerDeck.filter(c => selectedIds.includes(c.id));

            // Execute callback
            prev.pendingSearch.callback(selectedCards);

            // Update hand and deck
            const newHand = [...prev.playerHand, ...selectedCards];
            const newDeck = prev.playerDeck.filter(c => !selectedIds.includes(c.id));

            return {
                ...prev,
                playerHand: newHand,
                playerDeck: newDeck,
                pendingSearch: null
            };
        });
    };

    const cancelSearch = () => {
        setState(prev => ({ ...prev, pendingSearch: null }));
    };

    const addToast = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setState(prev => ({
            ...prev,
            toasts: [...prev.toasts, { id, message, type }]
        }));

        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id: string) => {
        setState(prev => ({
            ...prev,
            toasts: prev.toasts.filter(t => t.id !== id)
        }));
    };

    const cancelTargetSelection = () => {
        setState(prev => ({ ...prev, targetSelectionMode: null }));
        addToast('Seleção cancelada.', 'info');
    };

    const selectTarget = (targetId: string) => {
        if (!state.targetSelectionMode || !state.targetSelectionMode.active) return;

        const { effect, source, validTargets } = state.targetSelectionMode;

        if (!validTargets.includes(targetId)) {
            addToast('Alvo inválido!', 'warning');
            return;
        }

        // Close selection mode first to avoid loops
        setState(prev => ({ ...prev, targetSelectionMode: null }));

        // NOW start Chain Timer if aggressive (User Protocol: Target -> Timer -> Execute)
        const isAggressive = ['destroy', 'banish', 'damage', 'discard', 'returnToHand'].includes(effect.type)
            || (effect.target === 'enemy' || effect.target === 'opponent');

        if (isAggressive) {
            startChain(() => {
                executeEffect(effect, source, targetId);
            });
        } else {
            executeEffect(effect, source, targetId);
        }
    };

    const activateAbility = (cardId: string) => {
        const unit = state.playerBoard.find(u => u?.id === cardId) || state.divineSlots.player.find(u => u?.id === cardId);
        if (!unit) {
            addToast('Unidade não encontrada!', 'error');
            return;
        }

        if (unit.isSilenced) {
            addToast('Esta unidade está com as habilidades anuladas!', 'warning');
            return;
        }

        // Check Single Use Per Turn Rule
        if (state.unitsUsedAbilityThisTurn.includes(cardId)) {
            addToast('Esta unidade já usou sua habilidade neste turno!', 'warning');
            return;
        }

        // Register usage (optimistic, or we can move this to after successful execution)
        setState(prev => ({
            ...prev,
            unitsUsedAbilityThisTurn: [...prev.unitsUsedAbilityThisTurn, cardId]
        }));

        // CSV ENGINE INTEGRATION: Parse active ability
        let effects = unit.effects || [];

        // If no explicit 'onActivate' effect found, try parsing the description
        const explicitActive = effects.find(e => e.trigger === 'onActivate');
        if (!explicitActive && unit.description) {
            const parsed = parseAbilityToEffects(unit.description);
            effects = [...effects, ...parsed];
        }

        const effect = effects.find(e => e.trigger === 'onActivate');
        if (!effect) {
            addToast('Esta carta não possui habilidade ativa identificada!', 'warning');
            return;
        }

        // Check if target selection is needed FIRST
        const needsTarget = (effect.target === 'enemy' || effect.target === 'opponent' || effect.target === 'any')
            || ['destroy', 'banish', 'returnToHand'].includes(effect.type);

        if (needsTarget) {
            executeEffect(effect, unit);
            return;
        }

        const isAggressive = ['destroy', 'banish', 'damage', 'discard', 'returnToHand'].includes(effect.type)
            || (effect.target === 'enemy' || effect.target === 'opponent');

        if (isAggressive) {
            startChain(() => {
                executeEffect(effect, unit);
            });
        } else {
            executeEffect(effect, unit);
        }
    };

    const addCardToHand = (cardId: string) => {
        const card = cards.find(c => c.id === cardId);
        if (card) {
            setState(prev => ({
                ...prev,
                playerHand: [...prev.playerHand, card],
                toasts: [...prev.toasts, {
                    id: `cheat-${Date.now()}`,
                    message: `Cheat: ${card.name} adicionado à mão!`,
                    type: 'info'
                }]
            }));
        }
    };

    const labClearHand = () => setState(prev => ({ ...prev, playerHand: [] }));
    const labSetBoard = (index: number, cardId: string, isPlayer: boolean) => {
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
        const unit: Unit = {
            ...card,
            currentHealth: card.def || 1000,
            currentAttack: card.atk || 1000,
            canAttack: true
        };
        setState(prev => {
            const board = isPlayer ? [...prev.playerBoard] : [...prev.opponentBoard];
            board[index] = unit;
            return isPlayer ? { ...prev, playerBoard: board } : { ...prev, opponentBoard: board };
        });
    };
    const labClearBoard = (isPlayer: boolean) => {
        setState(prev => {
            const board = Array(prev.playerBoard.length).fill(null);
            return isPlayer ? { ...prev, playerBoard: board } : { ...prev, opponentBoard: board };
        });
    };
    const toggleLabMode = () => setState(prev => ({ ...prev, isLabMode: !prev.isLabMode }));

    const contextValue = {
        ...state,
        selectedUnit,
        selectUnit,
        nextPhase,
        endTurn,
        playCard,
        undoPlayCard,
        sacrificeCard,
        attackUnit,
        attackHero,
        resolveMaintenance,
        clearVisualEffect,
        manualDraw,
        confirmSacrifice,
        cancelSacrifice,
        addToast,
        removeToast,
        getUnitWithAuras,
        startSearch,
        resolveSearch,
        cancelSearch,
        selectHandCard,
        selectedHandCardId: state.selectedHandCardId,
        // Phase 5 Exports
        responseChain: state.responseChain,
        pendingEffectPlay: state.pendingEffectPlay,
        startChain,
        answerChain,
        cancelChainResponse,
        setPendingEffectPlay: (payload: { card: Card, message: string } | null) => setState(prev => ({ ...prev, pendingEffectPlay: payload })),
        // Phase 6 Exports
        targetSelectionMode: state.targetSelectionMode,
        selectTarget,
        cancelTargetSelection,
        activateAbility,
        addCardToHand,
        labClearHand,
        labSetBoard,
        labClearBoard,
        toggleLabMode,
        isLabMode: state.isLabMode
    };

    return (
        <BattleContext.Provider value={contextValue}>
            {children}
        </BattleContext.Provider>
    );
};

export const useBattle = () => {
    const context = useContext(BattleContext);
    if (context === undefined) throw new Error('useBattle must be used within a BattleProvider');
    return context;
};
