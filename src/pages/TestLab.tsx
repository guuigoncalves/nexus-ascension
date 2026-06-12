import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../contexts/CardContext';
import { initialCards } from '../data/cards';
import { ArrowLeft, ArrowRight, RotateCcw, RotateCw, Copy, Play, Swords, ChevronDown, ChevronUp, Search, Check, Dices, Trash2, X, Ghost } from 'lucide-react';
import { parseAbilityToEffects, requiresTargetSelection, isOffensiveEffect } from '../utils/AbilityEngine';
import { resolveCombat } from '../utils/combatEngine';

interface TestUnit {
    id: string;
    card: any;
    currentHealth: number;
    currentAttack: number;
    isSilenced?: boolean;
    turnTimer?: number;
    maxTimer?: number;
    originalOwner?: 'player' | 'enemy';
    controlledBy?: string;
    diesOnTimerEnd?: boolean; // Sentry auto-destruição
    buffType?: string; // Para rastrear tipo de buff (ex: 'sentryDouble', 'complexBuff')
    statusEffect?: string; // Label visual do efeito (ex: 'Sobrecarga')
    effectTurns?: number; // Contador visual de turnos do efeito
    statusText?: string; // Texto customizado do status (ex: '⚡ 3T', '⏳ 2T')
    originalAttack?: number; // ATK original (para reverter buffs)
    originalHealth?: number; // DEF original (para reverter buffs)
    originalDef?: number; // DEF original (Iron Man)
    namiDebuff?: number; // Valor do debuff temporário da Nami (ex: -200)
    namiDebuffSource?: string; // ID da Nami que aplicou o debuff
    isImmune?: boolean; // Imunidade a ataques (Asa Noturna)
    immunityTurns?: number; // Turnos restantes de imunidade
    weakenDebuff?: number; // Debuff de ATK (Caveira Vermelha)
    weakenDebuffSource?: string; // ID da fonte do debuff
    isReady?: boolean; // Estado de prontidão para habilidades (Caveira Vermelha)
    hasRevived?: boolean; // Marca se já renasceu (Groot)
    shieldLayers?: number; // Camadas de escudo (Groot Escudo Vivo)
    illusionCounters?: number; // Contadores de Ilusão (Mysterio)
    blockCounters?: number; // Contadores de Bloqueio/Reflexão (Capitão América)
    charges?: number; // Cargas genéricas (Mr. Fantastic)
    buffValue?: number; // Valor numérico do buff para reversão exata (Shuri)
    guardingTargetId?: string; // ID do alvo protegido (Homem Elástico)
    attacksThisTurn?: number; // Goten (Attacks per turn)
    maxAttacks?: number; // Goten
    remainingAttacks?: number;
    abilityCharges?: number;
    abilityCooldown?: number;
    isFaceDown?: boolean;
    customState?: any;
    isStunned?: boolean; // Spider-Man Stun
    stunTurns?: number; // Spider-Man Stun Duration
    hasAttacked?: boolean;
    isIntangible?: boolean;
    counters?: { [key: string]: number };
}




type TestSlot = TestUnit | null;

interface HistoryState {
    playerBoard: TestSlot[];
    enemyBoard: TestSlot[];
    playerHand: any[];
}

export const TestLab: React.FC = () => {
    const navigate = useNavigate();
    const { cards } = useCards();

    // State (10 slots: 2 fileiras de 5)
    const [playerBoard, setPlayerBoard] = useState<TestSlot[]>(Array(14).fill(null));
    const [enemyBoard, setEnemyBoard] = useState<TestSlot[]>(Array(14).fill(null));
    const [selectedSlot, setSelectedSlot] = useState<{ board: 'player' | 'enemy' | 'hand', index: number } | null>(null);
    const [selectedCard, setSelectedCard] = useState<{card: any, index: number, owner: 'player' | 'enemy'} | null>(null);
    const [attackMode, setAttackMode] = useState<{ attackerId: string, attackerBoard: 'player' | 'enemy' } | null>(null);
    const [effectMode, setEffectMode] = useState<{ sourceId: string, sourceBoard: 'player' | 'enemy', type?: string, targetsLeft?: number, damage?: number, customCallback?: (targetBoard: 'player' | 'enemy', targetIndex: number) => void } | null>(null);
    const [playerHand, setPlayerHand] = useState<any[]>(Array(8).fill(null)); // 10 slots de mão
    const [enemyHand, setEnemyHand] = useState<any[]>(Array(8).fill(null)); // 🆕 Mão do oponente
    const [playerHP, setPlayerHP] = useState(8000);
    const [enemyHP, setEnemyHP] = useState(8000);
    const [turnNumber, setTurnNumber] = useState(0);
    const [playerGraveyard, setPlayerGraveyard] = useState<any[]>([]); // 🪦 Cemitério P1
    const [enemyGraveyard, setEnemyGraveyard] = useState<any[]>([]); // 🪦 Cemitério P2
    const [eventLog, setEventLog] = useState<string[]>(['🧪 Oficina iniciada']);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy'>('player');
    const [notes, setNotes] = useState<string>('');
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [showRandomMenu, setShowRandomMenu] = useState(false);
    const [showSetupMenu, setShowSetupMenu] = useState(false);
    const [showCardSelector, setShowCardSelector] = useState(false);
    const [cardPopup, setCardPopup] = useState<{ unit: TestUnit, board: 'player' | 'enemy', index: number } | null>(null); // 🆕 Pop-up de efeito
    const [showCardList, setShowCardList] = useState(false); // 🆕 Overlay de lista de cartas
    const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'pending'>('all');
    const [universeFilter, setUniverseFilter] = useState('all');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [setupRotationIndex, setSetupRotationIndex] = useState(0);
    const [testedCards, setTestedCards] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('lab_tested_cards');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [draggedSlot, setDraggedSlot] = useState<{ board: 'player' | 'enemy' | 'hand', index: number } | null>(null);
    const [goblinTargetsDestroyed, setGoblinTargetsDestroyed] = useState(0); // 🎃 Contador de alvos do Duende Verde
    const [mysterioTargetsCountered, setMysterioTargetsCountered] = useState(0); // 🎭 Contador de alvos do Mysterio
    const [mysterioBlockPopup, setMysterioBlockPopup] = useState<{ attacker: TestUnit, onConfirm: () => void, onCancel: () => void } | null>(null); // 🎭 Popup customizado do Mysterio
    const [logsCollapsed, setLogsCollapsed] = useState(true); // 🆕 Estado de colapso dos logs (INICIA MINIMIZADO)
    const [reflectionMode, setReflectionMode] = useState<{ damage: number, sourceId: string, sourceBoard: 'player' | 'enemy' } | null>(null); // 🛡️ Modo de Reflexão do Capitão
    const [sideBarOnRight, setSideBarOnRight] = useState(true); // 🆕 Posicionamento da barra lateral
    // 🪦 GRAVEYARD SYSTEM
    const [showGraveyard, setShowGraveyard] = useState<'player' | 'enemy' | null>(null);
    const [overGrave, setOverGrave] = useState<'player' | 'enemy' | null>(null);
    const [graveyardSelectorMode, setGraveyardSelectorMode] = useState<{
        title: string;
        filter?: (card: any) => boolean; // 🆕 Filtro opcional
        onSelect: (card: any) => void;
    } | null>(null);
    const [interactionMode, setInteractionModeState] = useState<{ type: 'IDLE' } | { type: 'SELECTING_ABILITY_TARGET'; sourceId: string; abilityCallback: (id: string) => void }>({ type: 'IDLE' });
    const [lanternDefensePrompt, setLanternDefensePrompt] = useState<{ activeLanternId: string; targetBoard: 'player' | 'enemy'; targetIndex: number } | null>(null);
    const legacySetupIds = useMemo(() => ['28', '29', '35', '86', '87', '151'], []);
    const greenStatusIds = useMemo(() => new Set([
        '11', '13', '18', '25', '27', '28', '29', '31', '35', '36', '47', '51', '52', '53', '55', '56', '57', '59', '60', '86', '87', '91', '92', '94', '126', '127', '131', '132', '133', '136', '137', '138', '139', '144', '145', '146', '148', '150', '151', '152', '154', '157', '158', '159', '160', '161', '162', '163', '165', '172', '173', '175', '189', '190', '191', '192', '193', '194', '211', '212', '213', '214', 'TOK_SHENLONG'
    ]), []);
    const yellowStatusIds = useMemo(() => new Set(['63', '77', '164', '195']), []);



    // 🎯 HELPER: MIRA PRECISA GLADIADOR (V4.7)
    const forceTargetSelect = (originId: string, callback: (targetId: string) => void) => {
        const sourceBoard = playerBoard.some(u => u?.id === originId) ? 'player' : 'enemy';
        setEffectMode({
            sourceId: originId,
            sourceBoard: sourceBoard,
            type: 'custom_callback',
            customCallback: (targetBoard: 'player' | 'enemy', targetIndex: number) => {
                const boardState = targetBoard === 'player' ? playerBoard : enemyBoard;
                const target = boardState[targetIndex];
                if (target) callback(target.id);
            }
        });
        log(`🎯 Selecione um alvo para ${cards.find(c => c.id === originId)?.name || 'Efeito'}`);
    };

    const setInteractionMode = (mode: { type: 'IDLE' } | { type: 'SELECTING_ABILITY_TARGET'; sourceId: string; abilityCallback: (id: string) => void }) => {
        setInteractionModeState(mode);
        if (mode.type === 'IDLE') {
            setEffectMode(null);
            return;
        }
        const sourceBoard = playerBoard.some(u => u?.id === mode.sourceId || u?.card.id === mode.sourceId) ? 'player' : 'enemy';
        setEffectMode({
            sourceId: mode.sourceId,
            sourceBoard,
            type: 'custom_callback',
            customCallback: (targetBoard: 'player' | 'enemy', targetIndex: number) => {
                const boardState = targetBoard === 'player' ? playerBoard : enemyBoard;
                const target = boardState[targetIndex];
                if (target) mode.abilityCallback(target.id);
            }
        });
    };

    const toggleTested = (id: string) => {
        const newSet = new Set(testedCards);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setTestedCards(newSet);
        localStorage.setItem('lab_tested_cards', JSON.stringify(Array.from(newSet)));
    };

    // History System (Arena Undo/Redo)
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // 📋 CARTAS VALIDADAS (V4.0)
    const validatedCards = useMemo(() => [
        '11', '13', '18', '159', '160', '161', '162', // Paladinos + Iniciais
        '189', '190', '191', '192', '193', '194', '195', // Série Marvel
        '211', '212', '213', '214', // Outros
        '26', '33', '34', '76', '93', '95', '36', '51'
    ], []);

    const universeOptions = useMemo(() => Array.from(new Set(cards.map(c => c.universe).filter(Boolean))).sort(), [cards]);
    const rarityOptions = useMemo(() => Array.from(new Set(cards.map(c => c.rarity).filter(Boolean))).sort(), [cards]);
    const normalizeSearch = useCallback((value: string) => (
        value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    ), []);
    const getCardStatus = useCallback((id: string) => {
        if (greenStatusIds.has(id)) return 'green';
        if (yellowStatusIds.has(id)) return 'yellow';
        return 'red';
    }, [greenStatusIds, yellowStatusIds]);
    const getCardStatusClass = useCallback((id: string) => {
        const status = getCardStatus(id);
        if (status === 'green') return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
        if (status === 'yellow') return 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]';
        return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    }, [getCardStatus]);

    const inlineCardList = useMemo(() => {
        const query = normalizeSearch(searchQuery).trim();
        return cards.filter(card => {
            const okStatus = getCardStatus(card.id) === 'green' || testedCards.has(card.id) || validatedCards.includes(card.id);
            if (statusFilter === 'ok' && !okStatus) return false;
            if (statusFilter === 'pending' && okStatus) return false;
            if (universeFilter !== 'all' && card.universe !== universeFilter) return false;
            if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false;
            if (!query) return true;
            return normalizeSearch(card.name).includes(query) || card.id.includes(query);
        }).slice(0, 80);
    }, [cards, getCardStatus, normalizeSearch, rarityFilter, searchQuery, statusFilter, testedCards, universeFilter, validatedCards]);

    const playableInitialCards = useMemo(() => (
        initialCards.filter(c => c.atk && Number(c.atk) > 0 && c.def && Number(c.def) > 0)
    ), []);

    const getPlayableCard = useCallback((id: string) => (
        playableInitialCards.find(c => c.id === id) || cards.find(c => c.id === id && c.atk && Number(c.atk) > 0 && c.def && Number(c.def) > 0)
    ), [cards, playableInitialCards]);

    const getRandomPlayableCards = useCallback((count: number, excludedIds: string[] = []) => (
        [...playableInitialCards]
            .filter(c => !excludedIds.includes(c.id))
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
    ), [playableInitialCards]);

    const log = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setEventLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
    }, []);

    const saveHistory = useCallback((pBoard: TestSlot[], eBoard: TestSlot[], pHand: any[]) => {
        const newState = {
            playerBoard: [...pBoard],
            enemyBoard: [...eBoard],
            playerHand: [...pHand]
        };
        setHistory(prev => {
            const nextHistory = historyIndex === -1 ? [] : prev.slice(0, historyIndex + 1);
            return [...nextHistory, newState].slice(-50);
        });
        setHistoryIndex(prev => (historyIndex === -1 ? 0 : Math.min(prev + 1, 49)));
    }, [historyIndex]);

    // Initial state save
    useEffect(() => {
        if (historyIndex === -1) {
            saveHistory(playerBoard, enemyBoard, playerHand);
        }
    }, [saveHistory, playerBoard, enemyBoard, playerHand, historyIndex]);

    // 🚀 SETUP AUTOMÁTICO DO LABORATÓRIO
    useEffect(() => {
        // Executar apenas na montagem inicial (quando playerBoard está vazio)
        if (playerBoard.every(slot => slot === null) && cards.length > 0) {
            // Setup Player Board: Mysterio (195)
            // Mysterio DEF = 650
            // Carta 1: ATK 500 (menor que DEF)
            // Carta 2: ATK 650 (igual à DEF)
            // Carta 3: ATK 800 (maior que DEF)
            const newPlayerBoard = Array(14).fill(null);

            // Mysterio no slot 0
            const mysterio = cards.find(c => c.id === '195');
            if (mysterio) newPlayerBoard[0] = createUnit(mysterio);

            // Cartas de teste nos slots 1, 2, 3
            // Criar cartas customizadas para teste
            const testCards = [
                { ...cards[0], id: 'test1', name: 'Teste ATK 500', atk: 500, def: 700 },
                { ...cards[0], id: 'test2', name: 'Teste ATK 650', atk: 650, def: 700 },
                { ...cards[0], id: 'test3', name: 'Teste ATK 800', atk: 800, def: 700 }
            ];

            testCards.forEach((card, i) => {
                newPlayerBoard[i + 1] = createUnit(card);
            });
            newPlayerBoard.fill(null);
            ['145', '164', '165', '195', '127', '53', '150', '92', '47'].forEach((cardId, index) => {
                const card = cards.find(c => c.id === cardId) || initialCards.find(c => c.id === cardId);
                if (card) newPlayerBoard[index] = createUnit(card);
            });

            // Setup Enemy Board: Asa Noturna (189) + 4 cartas "fracas" (DEF < 1000)
            const asaNoturna = cards.find(c => c.id === '189');
            const weakCards = playableInitialCards.filter(c => (c.def || 0) < 1000).sort(() => Math.random() - 0.5).slice(0, 4);
            const newEnemyBoard = Array(14).fill(null);

            // Adicionar Asa Noturna no slot 0
            if (asaNoturna) newEnemyBoard[0] = createUnit(asaNoturna);

            // Adicionar cartas fracas nos slots seguintes
            weakCards.forEach((card, i) => {
                newEnemyBoard[i + 1] = createUnit(card);
            });




            // Setup Player Hand (4 cartas)
            const newPlayerHand = Array(8).fill(null);
            const randomCards = playableInitialCards
                .filter(c => !['213', '212', '211', '189', '190', '191', '192', '194'].includes(c.id))
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
            randomCards.forEach((card, i) => {
                newPlayerHand[i] = card;
            });
            newPlayerHand.fill(null);

            // Setup Enemy Hand (4 cartas)
            const newEnemyHand = Array(8).fill(null);
            const enemyRandomCards = playableInitialCards
                .filter(c => !['213', '212', '211', '189', '190', '191', '192', '194'].includes(c.id))
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
            enemyRandomCards.forEach((card, i) => {
                newEnemyHand[i] = card;
            });

            setPlayerBoard(newPlayerBoard);
            setEnemyBoard(newEnemyBoard);
            setPlayerHand(newPlayerHand);
            setEnemyHand(newEnemyHand);

            log('🧪 Laboratório configurado automaticamente!');
            log(`✅ Player: Nami, Coringa, Alerquina`);
            log(`✅ Enemy: 5 Soldados (Asa Noturna, Caveira, Duende, Rocket, Gavião)`);
            log(`✅ Hand: 4 cartas em cada mão`);
        }
    }, [cards, playableInitialCards]); // Executa quando cards carrega

    // 🐉 GATILHO AUTOMÁTICO SHENLONG
    useEffect(() => {
        // Contar Esferas no campo do jogador
        const esferasCount = playerBoard.filter(slot =>
            slot && slot.card.name.toLowerCase().includes('esfera')
        ).length;

        // Se tiver 7 Esferas, invocar Shenlong
        if (esferasCount >= 7) {
            const shenlongCard = cards.find(c => c.id === 'TOK_SHENLONG');

            if (shenlongCard) {
                // Remover as 7 Esferas
                const newBoard = playerBoard.map(slot =>
                    slot && slot.card.name.toLowerCase().includes('esfera') ? null : slot
                );

                // Encontrar primeiro slot vazio
                const emptySlotIndex = newBoard.findIndex(slot => slot === null);

                if (emptySlotIndex !== -1) {
                    // Invocar Shenlong
                    newBoard[emptySlotIndex] = createUnit(shenlongCard);
                    setPlayerBoard(newBoard);
                    saveHistory(newBoard, enemyBoard, playerHand);

                    log('🐉 ✨ AS 7 ESFERAS DO DRAGÃO FORAM REUNIDAS! SHENLONG FOI INVOCADO! ✨');
                    log('🔥 As Esferas desapareceram da arena...');
                }
            }
        }
    }, [playerBoard, cards, enemyBoard, playerHand, log, saveHistory]);


    const undo = () => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setPlayerBoard([...prevState.playerBoard]);
            setEnemyBoard([...prevState.enemyBoard]);
            setPlayerHand([...prevState.playerHand]);
            setHistoryIndex(prev => prev - 1);
            log('⏮️ Ação desfeita na arena');
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setPlayerBoard([...nextState.playerBoard]);
            setEnemyBoard([...nextState.enemyBoard]);
            setPlayerHand([...nextState.playerHand]);
            setHistoryIndex(prev => prev + 1);
            log('⏭️ Ação refeita na arena');
        }
    };

    const cleanText = useCallback((text: string): string => text ? text.replace(/\s*\(.*?\)/g, '').trim() : '', []);

    // 🔍 Fuzzy Search Helper
    const fuzzyMatch = useCallback((query: string, target: string): boolean => {
        query = normalizeSearch(query).replace(/\s+/g, '');
        target = normalizeSearch(target).replace(/\s+/g, '');

        let queryIndex = 0;
        for (let i = 0; i < target.length && queryIndex < query.length; i++) {
            if (target[i] === query[queryIndex]) {
                queryIndex++;
            }
        }
        return queryIndex === query.length;
    }, [normalizeSearch]);

    // Filtered Cards for Search
    // Filtered Cards for Search
    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = normalizeSearch(searchQuery).trim();

        // 🔍 BUSCA POR ESTATÍSTICAS (Formato: at500, df1000, pt500)

        // pt500 -> Busca ATK *OU* DEF igual a 500
        const matchPt = query.match(/^pt\s*(\d+)$/);
        if (matchPt) {
            const val = parseInt(matchPt[1]);
            return cards.filter(c => c.atk === val || c.def === val).slice(0, 10);
        }

        // at500 -> Busca ATK igual a 500
        const matchAt = query.match(/^at\s*(\d+)$/);
        if (matchAt) {
            const val = parseInt(matchAt[1]);
            return cards.filter(c => c.atk === val).slice(0, 10);
        }

        // df500 -> Busca DEF igual a 500
        const matchDf = query.match(/^df\s*(\d+)$/);
        if (matchDf) {
            const val = parseInt(matchDf[1]);
            return cards.filter(c => c.def === val).slice(0, 10);
        }

        // Manter busca por ID explícita (id:123 ou i:123)
        if (query.startsWith('id:') || query.startsWith('i:')) {
            const val = query.split(':')[1].trim();
            return cards.filter(c => c.id === val).slice(0, 5);
        }

        // Palavras-chave para filtrar APENAS Tokens/Totens (NÃO Zeta ou Efeito)
        const excludeKeywords = ['token', 'totem', 'lacaio', 'shenlong'];

        return cards.filter(c => {
            // Verificar se contém palavras excluídas no nome
            const nameMatch = normalizeSearch(c.name);

            const isExcluded = excludeKeywords.some(keyword =>
                nameMatch.includes(keyword)
            );

            if (isExcluded) return false;

            // Fuzzy search no nome ou busca exata no ID
            return fuzzyMatch(query, c.name) || c.id.toString().includes(query);
        }).slice(0, 5);
    }, [cards, searchQuery, fuzzyMatch, normalizeSearch]);

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [selectedSearchItem, setSelectedSearchItem] = useState<string | null>(null); // Controls which search item shows buttons

    const createUnit = (card: any): TestUnit => ({
        id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        card,
        currentHealth: card.def || 0,
        currentAttack: card.atk || 0,
        isSilenced: false,
        abilityCharges: card.id === '152' ? 2 : undefined
    });

    // --- DRAG & DROP HANDLERS (HTML5) ---
    const handleDragStart = (e: React.DragEvent, origin: 'ARENA' | 'HAND', index: number, boardType: 'player' | 'enemy' = 'player') => {
        if (attackMode || effectMode) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', JSON.stringify({ origin, index, boardType }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessário para permitir drop
    };

    const handleDrop = (e: React.DragEvent, targetBoard: 'player' | 'enemy' | 'hand', targetIndex: number) => {
        e.preventDefault();
        if (attackMode || effectMode) return; // IDLE only

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            
            if (data.origin === 'HAND') {
                const cardIndex = data.index;
                const sourceBoard = data.boardType as 'player' | 'enemy';
                const sourceIsPlayer = sourceBoard === 'player';
                const targetIsPlayer = targetBoard === 'player';
                const handArray = sourceIsPlayer ? playerHand : enemyHand;
                const card = handArray[cardIndex];
                if (!card) return;

                const boardArray = targetIsPlayer ? playerBoard : enemyBoard;
                const existingUnit = boardArray[targetIndex];

                const newHand = [...handArray];
                const newBoard = [...boardArray];

                // Swap: Hand recebe a carta do Board (ou null se for vazio)
                newHand[cardIndex] = existingUnit ? existingUnit.card : null;
                
                // Swap: Board recebe a carta da Hand convertida para Unit
                const newUnit: TestUnit = {
                    id: `${card.id}-${Date.now()}`,
                    card: card,
                    currentHealth: card.def || 0,
                    currentAttack: card.atk || 0,
                    abilityCharges: card.id === '152' ? 2 : undefined
                };
                newBoard[targetIndex] = newUnit;

                if (sourceIsPlayer) {
                    setPlayerHand(newHand);
                } else {
                    setEnemyHand(newHand);
                }

                if (targetIsPlayer) {
                    setPlayerBoard(newBoard);
                } else {
                    setEnemyBoard(newBoard);
                }
                log(`⬇️ Carta ${card.name} movida da mão para a arena (Swap).`);
            } else if (data.origin === 'ARENA') {
                const sourceIndex = data.index;
                const sourceBoard = data.boardType as 'player' | 'enemy';
                if (sourceBoard === targetBoard && sourceIndex === targetIndex) return;

                const sourceArray = sourceBoard === 'player' ? playerBoard : enemyBoard;
                const targetArray = targetBoard === 'player' ? playerBoard : enemyBoard;
                const sourceUnit = sourceArray[sourceIndex];
                if (!sourceUnit) return;

                if (sourceBoard === targetBoard) {
                    const newBoard = [...sourceArray];
                    const temp = newBoard[sourceIndex];
                    newBoard[sourceIndex] = newBoard[targetIndex];
                    newBoard[targetIndex] = temp;
                    if (targetBoard === 'player') setPlayerBoard(newBoard);
                    else setEnemyBoard(newBoard);
                } else {
                    const newSourceBoard = [...sourceArray];
                    const newTargetBoard = [...targetArray];
                    newSourceBoard[sourceIndex] = newTargetBoard[targetIndex];
                    newTargetBoard[targetIndex] = sourceUnit;
                    if (sourceBoard === 'player') setPlayerBoard(newSourceBoard);
                    else setEnemyBoard(newSourceBoard);
                    if (targetBoard === 'player') setPlayerBoard(newTargetBoard);
                    else setEnemyBoard(newTargetBoard);
                }
                
                log(`🔄 Slot ${sourceIndex} e ${targetIndex} trocados na arena.`);
            }
        } catch (err) {
            console.error("Erro no drop:", err);
        }
    };

    const handleHandDrop = (e: React.DragEvent, boardType: 'player' | 'enemy', targetIndex: number) => {
        e.preventDefault();
        if (attackMode || effectMode) return; // IDLE only

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.origin === 'ARENA') {
                const sourceIndex = data.index;
                const sourceBoard = data.boardType as 'player' | 'enemy';
                
                const sourceIsPlayer = sourceBoard === 'player';
                const targetIsPlayer = boardType === 'player';
                const boardArray = sourceIsPlayer ? playerBoard : enemyBoard;
                const unit = boardArray[sourceIndex];
                if (!unit) return;

                const handArray = targetIsPlayer ? playerHand : enemyHand;
                const existingCard = handArray[targetIndex];

                const newHand = [...handArray];
                const newBoard = [...boardArray];

                // Swap: Hand recebe a Unit do Board convertida para Carta
                newHand[targetIndex] = unit.card;

                // Swap: Board recebe a Carta da Hand convertida para Unit (ou null se vazio)
                if (existingCard) {
                    const newUnit: TestUnit = {
                        id: `${existingCard.id}-${Date.now()}`,
                        card: existingCard,
                        currentHealth: existingCard.def || 0,
                        currentAttack: existingCard.atk || 0,
                        abilityCharges: existingCard.id === '152' ? 2 : undefined
                    };
                    newBoard[sourceIndex] = newUnit;
                } else {
                    newBoard[sourceIndex] = null;
                }

                if (targetIsPlayer) {
                    setPlayerHand(newHand);
                } else {
                    setEnemyHand(newHand);
                }

                if (sourceIsPlayer) {
                    setPlayerBoard(newBoard);
                } else {
                    setEnemyBoard(newBoard);
                }
                log(`⬆️ Carta ${unit.card.name} retornou para a mão (Swap).`);
            } else if (data.origin === 'HAND') {
                const sourceIndex = data.index;
                const sourceBoard = data.boardType;
                if (sourceBoard === boardType && sourceIndex === targetIndex) return;

                const sourceHand = sourceBoard === 'player' ? playerHand : enemyHand;
                const targetHand = boardType === 'player' ? playerHand : enemyHand;
                if (sourceBoard === boardType) {
                    const newHand = [...sourceHand];
                    const temp = newHand[sourceIndex];
                    newHand[sourceIndex] = newHand[targetIndex];
                    newHand[targetIndex] = temp;
                    if (boardType === 'player') setPlayerHand(newHand);
                    else setEnemyHand(newHand);
                } else {
                    const newSourceHand = [...sourceHand];
                    const newTargetHand = [...targetHand];
                    newSourceHand[sourceIndex] = newTargetHand[targetIndex];
                    newTargetHand[targetIndex] = sourceHand[sourceIndex];
                    if (sourceBoard === 'player') setPlayerHand(newSourceHand);
                    else setEnemyHand(newSourceHand);
                    if (boardType === 'player') setPlayerHand(newTargetHand);
                    else setEnemyHand(newTargetHand);
                }
                
                log(`[SISTEMA] Slot da mao ${sourceIndex} e ${targetIndex} trocados.`);
            }
        } catch (err) {
            console.error("Erro no drop da mao:", err);
        }
    };

    const handleGraveDrop = (e: React.DragEvent, boardType: 'player' | 'enemy') => {
        e.preventDefault();
        if (attackMode || effectMode) return;

        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.origin === 'ARENA') {
                const sourceIndex = data.index;
                const sourceBoard = data.boardType as 'player' | 'enemy';
                const sourceArray = sourceBoard === 'player' ? playerBoard : enemyBoard;
                const unit = sourceArray[sourceIndex];
                if (!unit) return;

                const newBoard = [...sourceArray];
                newBoard[sourceIndex] = null;
                
                if (sourceBoard === 'player') setPlayerBoard(newBoard);
                else setEnemyBoard(newBoard);

                if (boardType === 'player') setPlayerGraveyard(prev => [...prev, unit.card]);
                else setEnemyGraveyard(prev => [...prev, unit.card]);

                log(`[CEMITERIO] ${unit.card.name} movido para o cemiterio (${boardType === 'player' ? 'P1' : 'P2'}).`);
            } else if (data.origin === 'HAND') {
                const sourceIndex = data.index;
                const sourceBoard = data.boardType as 'player' | 'enemy';
                const handArray = sourceBoard === 'player' ? playerHand : enemyHand;
                const card = handArray[sourceIndex];
                if (!card) return;

                const newHand = [...handArray];
                newHand[sourceIndex] = null;

                if (sourceBoard === 'player') setPlayerHand(newHand);
                else setEnemyHand(newHand);

                if (boardType === 'player') setPlayerGraveyard(prev => [...prev, card]);
                else setEnemyGraveyard(prev => [...prev, card]);

                log(`[CEMITERIO] ${card.name} descartado no cemiterio (${boardType === 'player' ? 'P1' : 'P2'}).`);
            }
        } catch (err) {
            console.error("Error in grave drop:", err);
        }
    };

    // --- UNIFIED DEATH HANDLER (Cleanup Universal) ---
    const handleCardDeath = (boardType: 'player' | 'enemy', index: number, source: 'removed' | 'battle' | 'timer' = 'removed') => {
        const isPlayer = boardType === 'player';
        const board = isPlayer ? playerBoard : enemyBoard;
        const card = board[index];

        if (!card) return;

        const newBoard = [...board];
        const cardName = card.card.name;
        const cardId = card.card.id;
        const cardOwner = boardType;

        // Log de destruição
        const symbol = source === 'battle' ? '⚔️' : source === 'timer' ? '⏱️' : '💀';
        log(`${symbol} ${cardName} destruído (${source}).`);

        // --- BROLY PASSIVE (ID 17) - Gatilho em Morte de Aliado ---
        // Verifique o campo do dono da carta morta. Se houver Broly, broly.ataque += 1000
        newBoard.forEach(u => {
            if (u && u.card.id === '17' && u.id !== card.id) {
                const oldAtk = u.currentAttack;
                u.currentAttack += 1000;
                u.card.atk = u.currentAttack; // Persistir mudança
                log(`💢 Broly enfurecido! +1000 ATK pela queda de um aliado (${oldAtk} → ${u.currentAttack}).`);
            }
        });

        // --- DARKSEID CLEANUP (ID 11) - Gatilho Imediato ---
        if (cardId === '11') {
            log(`🌑 Darkseid destruído! Limpando efeitos IMEDIATAMENTE...`);

            // 1. Remove todos os tokens de Lacaio (removeCardsByName)
            newBoard.forEach((u, i) => {
                if (u && u.card.name.includes('Lacaio') && u.card.name.includes('Darkseid')) {
                    newBoard[i] = null;
                    log(`👻 Lacaio de Darkseid removido do campo.`);
                }
            });

            // 2. Devolver cartas controladas (revertControlledCards)
            const opponentBoardStart = isPlayer ? enemyBoard : playerBoard;
            const setOpponentBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
            let opponentBoard = [...opponentBoardStart];
            let controlledFound = false;

            opponentBoard.forEach((u, i) => {
                if (u && u.controlledBy === card.id) {
                    // Encontrar slot vazio no board original da carta
                    const originalIsPlayer = u.originalOwner === 'player';
                    const returnBoardStart = originalIsPlayer ? playerBoard : enemyBoard;
                    const setReturnBoard = originalIsPlayer ? setPlayerBoard : setEnemyBoard;
                    let returnBoard = [...returnBoardStart];
                    const emptySlot = returnBoard.findIndex(s => s === null);

                    if (emptySlot !== -1) {
                        returnBoard[emptySlot] = {
                            ...u,
                            controlledBy: undefined,
                            originalOwner: undefined
                        };
                        opponentBoard[i] = null;
                        setReturnBoard(returnBoard);
                        log(`↩️ ${u.card.name} libertado do controle de Darkseid e devolvido!`);
                    } else {
                        opponentBoard[i] = null;
                        log(`⚠️ ${u.card.name} libertado mas sem espaço. Destruído.`);
                    }
                    controlledFound = true;
                }
            });

            if (controlledFound) {
                setOpponentBoard(opponentBoard);
            }
            if (controlledFound) {
                setOpponentBoard(opponentBoard);
            }
        }

        // --- CAVEIRA VERMELHA PASSIVA (ID 190) ---
        // Se a carta morta era do oponente e existe um Caveira Vermelha no campo do Jogador
        if (cardOwner === 'enemy') {
            const myBoard = isPlayer ? playerBoard : newBoard; // Se processando player, myBoard é playerBoard. 
            // Espera, handleCardDeath recebe boardType de quem morreu.
            // Se morreu 'enemy', então playerBoard é o campo do jogador.
            const playerField = isPlayer ? enemyBoard : playerBoard; // Invertido? 
            // boardType é onde a carta morreu.
            // Se boardType === 'enemy', morreu no oponente.
            // Devemos procurar no 'player'.

            // Vamos simplificar: Sempre procurar no board do Player se quem morreu foi 'enemy'
            if (boardType === 'enemy') {
                const caveiras = playerBoard.map((u, i) => ({ u, i })).filter(item => item.u?.card.id === '190');

                if (caveiras.length > 0) {
                    const newPlayerBoardState = [...playerBoard];
                    let buffapplied = false;

                    caveiras.forEach(({ u, i }) => {
                        if (newPlayerBoardState[i]) {
                            newPlayerBoardState[i] = {
                                ...newPlayerBoardState[i]!,
                                currentHealth: newPlayerBoardState[i]!.currentHealth + 400,
                                card: { ...newPlayerBoardState[i]!.card, def: newPlayerBoardState[i]!.currentHealth + 400 }
                            };
                            buffapplied = true;
                        }
                    });

                    if (buffapplied) {
                        setPlayerBoard(newPlayerBoardState);
                        log("💀 Caveira Vermelha absorveu a morte do inimigo! (+400 DEF)");
                    }
                }
            }
        }

        // --- CLEANUP UNIVERSAL ---
        // Adicionar ao cemitério antes de remover
        if (isPlayer) {
            setPlayerGraveyard(prev => [...prev, card.card]);
        } else {
            setEnemyGraveyard(prev => [...prev, card.card]);
        }

        // Remove a carta do campo
        newBoard[index] = null;

        // Atualizar estado IMEDIATAMENTE (força re-render)
        if (isPlayer) {
            setPlayerBoard(newBoard);
            saveHistory(newBoard, enemyBoard, playerHand);
        } else {
            setEnemyBoard(newBoard);
            saveHistory(playerBoard, newBoard, playerHand);
        }
    };


    // Compatibilidade: removeUnit chama handleCardDeath
    const removeUnit = (boardType: 'player' | 'enemy', index: number) => {
        handleCardDeath(boardType, index, 'removed');
    };

    const duplicateUnit = (boardType: 'player' | 'enemy', index: number) => {
        const board = boardType === 'player' ? playerBoard : enemyBoard;
        const unit = board[index];
        if (!unit) return;

        const newBoard = [...board];
        const emptyIndex = newBoard.findIndex((slot, i) => slot === null);
        
        if (emptyIndex !== -1) {
            newBoard[emptyIndex] = {
                ...createUnit(unit.card),
                currentHealth: unit.currentHealth,
                currentAttack: unit.currentAttack
            };
            if (boardType === 'player') setPlayerBoard(newBoard);
            else setEnemyBoard(newBoard);
            log(`[DUPLICAR] Unidade ${unit.card.name} duplicada para o slot ${emptyIndex}!`);
            saveHistory(boardType === 'player' ? newBoard : playerBoard, boardType === 'enemy' ? newBoard : enemyBoard, playerHand);
        } else {
            log('AVISO: Sem espaco na arena para duplicar!');
        }
    };

    const triggerIronManHb = useCallback((source: TestUnit) => {
        const isPlayer = playerBoard.some(u => u?.id === source.id);
        const myBoard = isPlayer ? playerBoard : enemyBoard;
        const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
        const sourceUnit = myBoard.find(u => u?.id === source.id);
        const damage = sourceUnit?.customState?.accumulatedDamage || 0;
        setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: '126', abilityCallback: (targetId) => {
            const opponentBoard = isPlayer ? enemyBoard : playerBoard;
            const setOpponentBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
            const targetIdx = opponentBoard.findIndex(u => u?.id === targetId);
            if (targetIdx === -1) return;
            const target = opponentBoard[targetIdx];
            if (!target) return;
            const nextHealth = target.currentHealth - damage;
            const updatedOpponentBoard = [...opponentBoard];
            updatedOpponentBoard[targetIdx] = nextHealth <= 0 ? null : {
                ...target,
                currentHealth: nextHealth,
                card: { ...target.card, def: nextHealth }
            };
            setOpponentBoard(updatedOpponentBoard);
            setMyBoard(currentBoard => currentBoard.map(unit => {
                if (unit?.id !== source.id) return unit;
                const { hasOmegaAttack, accumulatedDamage, ...nextCustomState } = unit.customState || {};
                return {
                    ...unit,
                    customState: nextCustomState,
                    statusText: unit.effectTurns && unit.effectTurns > 0 ? unit.statusText : undefined
                };
            }));
            log(`[IRON MAN] HB causou ${damage} de dano.`);
        } });
        setCardPopup(null);
    }, [playerBoard, enemyBoard, log]);




    const spawnToField = useCallback((isPlayer: boolean, forcedCardId?: string) => {
        const targetCardId = forcedCardId || selectedCardId;
        if (!targetCardId) return;
        const card = cards.find(c => c.id === targetCardId);
        if (!card) return;
        const board = isPlayer ? playerBoard : enemyBoard;
        const emptySlot = board.findIndex(slot => slot === null);
        if (emptySlot === -1) { log(`⚠️ Sem slots disponíveis (${isPlayer ? 'P1' : 'P2'})`); return; }

        const newUnit: TestUnit = {
            id: `${card.id}-${Date.now()}`,
            card,
            currentHealth: card.def || 0,
            currentAttack: card.atk || 0,
            abilityCharges: card.id === '152' ? 2 : undefined
        };

        const newBoard = [...board];
        newBoard[emptySlot] = newUnit;

        if (isPlayer) {
            setPlayerBoard(newBoard);
            saveHistory(newBoard, enemyBoard, playerHand);
        } else {
            setEnemyBoard(newBoard);
            saveHistory(playerBoard, newBoard, playerHand);
        }
        // log(`✅ Spawn: ${card.name} (${isPlayer ? 'P1' : 'P2'} S${emptySlot})`);
    }, [selectedCardId, cards, playerBoard, enemyBoard, playerHand, log, saveHistory]);

    const spawnDirect = useCallback((card: any) => {
        const tryPlayer = Math.random() > 0.5;
        const pIndex = playerBoard.findIndex(s => s === null);
        const eIndex = enemyBoard.findIndex(s => s === null);

        let usePlayer = tryPlayer;
        if (tryPlayer && pIndex === -1) usePlayer = false;
        if (!tryPlayer && eIndex === -1) usePlayer = true;

        if ((usePlayer && pIndex === -1) || (!usePlayer && eIndex === -1)) {
            log('⚠️ Arena Cheia');
            return;
        }

        const index = usePlayer ? pIndex : eIndex;
        const board = usePlayer ? playerBoard : enemyBoard;

        const newUnit: TestUnit = {
            id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            card,
            currentHealth: card.def || 0,
            currentAttack: card.atk || 0,
            abilityCharges: card.id === '152' ? 2 : undefined
        };

        const newBoard = [...board];
        newBoard[index] = newUnit;

        if (usePlayer) {
            setPlayerBoard(newBoard);
            saveHistory(newBoard, enemyBoard, playerHand);
        } else {
            setEnemyBoard(newBoard);
            saveHistory(playerBoard, newBoard, playerHand);
        }
        // log(`⚡ Spawn Rápido: ${card.name} (${usePlayer ? 'P1' : 'P2'})`);
    }, [playerBoard, enemyBoard, playerHand, log, saveHistory, legacySetupIds]);

    const spawnToHand = useCallback((forcedCardId?: string) => {
        const targetCardId = forcedCardId || selectedCardId;
        if (!targetCardId) return;
        const card = cards.find(c => c.id === targetCardId);
        if (!card) return;

        const emptySlot = playerHand.findIndex(s => s === null);
        if (emptySlot === -1) { log('⚠️ Mão cheia (10/10)'); return; }

        const newHand = [...playerHand];
        newHand[emptySlot] = card;
        setPlayerHand(newHand);
        saveHistory(playerBoard, enemyBoard, newHand);
        // log(`🃏 Carta adicionada à mão: ${card.name}`);
    }, [selectedCardId, cards, playerHand, playerBoard, enemyBoard, log, saveHistory]);

    const moveHandToArena = useCallback((handIndex: number, arenaIndex: number) => {
        const card = playerHand[handIndex];
        if (!card || playerBoard[arenaIndex] !== null) return;

        const newHand = [...playerHand];
        newHand[handIndex] = null;

        const newUnit: TestUnit = {
            id: `${card.id}-${Date.now()}`,
            card,
            currentHealth: card.def || 0,
            currentAttack: card.atk || 0,
            abilityCharges: card.id === '152' ? 2 : undefined
        };

        const newBoard = [...playerBoard];
        newBoard[arenaIndex] = newUnit;

        setPlayerHand(newHand);
        setPlayerBoard(newBoard);
        saveHistory(newBoard, enemyBoard, newHand);
        setSelectedSlot(null);
        setCardPopup(null); // Fechar popup
        log(`✅ ${card.name} colocado no campo (Slot ${arenaIndex})`); // Log detalhado
    }, [playerHand, playerBoard, enemyBoard, log, saveHistory]);

    const moveToArena = useCallback((selectedCard: {card: any, index: number, owner: 'player' | 'enemy'}, arenaIndex: number, board: 'player' | 'enemy') => {
        const isPlayer = board === 'player';
        const newHand = isPlayer ? [...playerHand] : [...enemyHand];
        newHand[selectedCard.index] = null;
        
        const newUnit: TestUnit = {
            id: `${selectedCard.card.id}-${Date.now()}`,
            card: selectedCard.card,
            currentHealth: selectedCard.card.def || 0,
            currentAttack: selectedCard.card.atk || 0,
            abilityCharges: selectedCard.card.id === '152' ? 2 : undefined
        };
        
        const newBoard = isPlayer ? [...playerBoard] : [...enemyBoard];
        newBoard[arenaIndex] = newUnit;
        
        if (isPlayer) {
            setPlayerHand(newHand);
            setPlayerBoard(newBoard);
        } else {
            setEnemyHand(newHand);
            setEnemyBoard(newBoard);
        }
        
        setSelectedCard(null);
    }, [playerHand, enemyHand, playerBoard, enemyBoard]);

    const handleReset = useCallback(() => {
        setPlayerBoard(Array(14).fill(null));
        setEnemyBoard(Array(14).fill(null));
        setPlayerHand(Array(8).fill(null));
        setEnemyHand(Array(8).fill(null));
        setEventLog(['🧪 Oficina resetada.']);
        setSelectedCard(null);
        setSelectedSlot(null);
        setAttackMode(null);
        setEffectMode(null);
        setCardPopup(null);
    }, []);

    const handleSetup = useCallback(() => {
        const newPBoard = Array(14).fill(null);
        const newPlayerHand = Array(8).fill(null);
        const setupIds = ['90', '49', '88', '89', '130', '50'];
        const setupCards = setupIds
            .map(id => initialCards.find(card => card.id === id))
            .filter((card): card is NonNullable<typeof card> => !!card);
        setupCards.forEach((card, index) => {
            if (!card) return;
            newPBoard[index] = createUnit(card);
        });

        setPlayerBoard(newPBoard);
        setPlayerHand(newPlayerHand);
        // setPlayerGraveyard(newPlayerGraveyard); // Preservado V4.8
        // setEnemyGraveyard(newEnemyGraveyard); // Preservado V4.8
        setSelectedCard(null);
        setSelectedSlot(null);
        setAttackMode(null);
        setEffectMode(null);
        setCurrentTurn('player');
        setShowSetupMenu(false);
        saveHistory(newPBoard, enemyBoard, newPlayerHand);
        log('[SETUP] Rodada atual carregada para o jogador.');
    }, [enemyBoard, log, saveHistory]);

    const handleNormalSetup = useCallback(() => {
        const playerSetupIds = ['90', '49', '88', '89', '130', '50'];
        const enemyRarityOrder = ['Supremo', 'Destruidor', 'Lendário', 'Titã', 'Elite', 'Veterano', 'Gladiador'];
        const newPlayerBoard = Array(14).fill(null);
        const newEnemyBoard = Array(14).fill(null);
        const emptyHand = Array(8).fill(null);

        playerSetupIds.forEach((id, index) => {
            const card = initialCards.find(c => c.id === id);
            if (card) {
                newPlayerBoard[index] = createUnit(card);
            }
        });

        enemyRarityOrder.forEach((rarity, rarityIndex) => {
            const rarityCards = initialCards.filter(card =>
                card.rarity === rarity &&
                card.atk &&
                Number(card.atk) > 0 &&
                card.def &&
                Number(card.def) > 0 &&
                !card.id.startsWith('TOK_')
            );
            const start = rarityCards.length > 0 ? (setupRotationIndex * 2) % rarityCards.length : 0;
            const rotatedCards = [...rarityCards.slice(start), ...rarityCards.slice(0, start)].slice(0, 2);
            rotatedCards.forEach((card, cardIndex) => {
                newEnemyBoard[(rarityIndex * 2) + cardIndex] = createUnit(card);
            });
        });

        setPlayerBoard(newPlayerBoard);
        setEnemyBoard(newEnemyBoard);
        setPlayerHand(emptyHand);
        setEnemyHand(emptyHand);
        setPlayerHP(8000);
        setEnemyHP(8000);
        setSelectedCard(null);
        setSelectedSlot(null);
        setAttackMode(null);
        setEffectMode(null);
        setInteractionModeState({ type: 'IDLE' });
        setCardPopup(null);
        setShowSetupMenu(false);
        setSetupRotationIndex(prev => prev + 1);
        saveHistory(newPlayerBoard, newEnemyBoard, emptyHand);
        log('[SETUP] Normal iniciado.');
    }, [log, saveHistory, setupRotationIndex]);

    // 🔄 SETUP DA ROTAÇÃO DO LABORATÓRIO
    const setupLabRotation = useCallback(() => {
        // IDs da rotação atual
        const PLAYER_HAND_IDS = ['189', '190', '191']; // Asa Noturna, Caveira, Duende Verde
        const ENEMY_FIELD_IDS = ['193', '194', '195', '11', '13', '18']; // Groot, Gavião, Mysterio + 3 alvos

        // Limpar tudo
        setPlayerBoard(Array(14).fill(null));
        setEnemyBoard(Array(14).fill(null));
        setPlayerHand(Array(8).fill(null));
        setEnemyHand(Array(8).fill(null));

        // Adicionar cartas à mão do jogador
        const newPlayerHand = Array(8).fill(null);
        PLAYER_HAND_IDS.forEach((cardId, idx) => {
            const card = cards.find(c => c.id === cardId);
            if (card) newPlayerHand[idx] = card;
        });
        setPlayerHand(newPlayerHand);

        // Adicionar cartas ao campo inimigo
        const newEnemyBoard = Array(14).fill(null);
        ENEMY_FIELD_IDS.forEach((cardId, idx) => {
            const card = cards.find(c => c.id === cardId);
            if (card) {
                newEnemyBoard[idx] = {
                    id: `${card.id}-${Date.now()}-${idx}`,
                    card,
                    currentAttack: card.atk || 0,
                    currentHealth: card.def || 1000,
                    abilityCharges: card.id === '152' ? 2 : undefined
                };
            }
        });
        setEnemyBoard(newEnemyBoard);

        log('🔄 Laboratório configurado: Asa Noturna, Caveira Vermelha, Soldados 187-188 prontos | Recrutas 202-206 no campo inimigo');
        saveHistory(Array(14).fill(null), newEnemyBoard, newPlayerHand);
    }, [cards, log, saveHistory]);

    // ⏳ PASSAR TURNO - Processar efeitos temporários
    const nextTurn = useCallback(() => {
        const processBoard = (board: TestSlot[], owner: 'player' | 'enemy'): TestSlot[] => {
            return board.map(unit => {
                if (!unit) return unit;

                let updated = { ...unit };
                if (legacySetupIds.includes(updated.card.id)) return updated;
                if (updated.card.id === '152') {
                    updated = {
                        ...updated,
                        remainingAttacks: undefined,
                        maxAttacks: undefined,
                        customState: {
                            ...(updated.customState || {}),
                            attacksThisTurn: 0
                        }
                    };
                }
                if (updated.customState?.cooldown && updated.customState.cooldown > 0) {
                    const nextCooldown = updated.customState.cooldown - 1;
                    updated.customState = {
                        ...(updated.customState || {}),
                        cooldown: nextCooldown
                    };
                    if (updated.card.id === '34') {
                        updated.statusText = nextCooldown > 0 ? `CD ${nextCooldown}T` : undefined;
                    }
                }
                if (updated.customState?.lanternAttackedThisTurn) {
                    updated.customState = {
                        ...(updated.customState || {}),
                        lanternAttackedThisTurn: false
                    };
                }
                if ((updated.counters?.dodge || 0) > 0) {
                    updated.counters = {
                        ...updated.counters,
                        dodge: Math.max(0, (updated.counters?.dodge || 0) - 1)
                    };
                }
                if (updated.abilityCooldown && updated.abilityCooldown > 0) {
                    updated = { ...updated, abilityCooldown: updated.abilityCooldown - 1 };
                }
                if (updated.card.id === '157' && updated.effectTurns && updated.effectTurns > 0) {
                    updated.remainingAttacks = 2;
                    updated.maxAttacks = 2;
                    updated.customState = {
                        ...(updated.customState || {}),
                        hasAttacked: false
                    };
                }

                // Decrementar contador de turnos de efeitos
                if (updated.effectTurns !== undefined && updated.effectTurns > 0) {
                    updated = { ...updated, effectTurns: updated.effectTurns - 1 };

                    // Se o efeito expirou
                    if (updated.effectTurns <= 0) {
                        // Reverter ATK
                        if (updated.originalAttack !== undefined && !updated.customState?.ravenaAbsorbed) {
                            updated.currentAttack = updated.originalAttack;
                            updated.originalAttack = undefined;
                        }

                        // Reverter DEF
                        if (updated.buffValue !== undefined) {
                            updated.currentHealth -= updated.buffValue;
                            updated.buffValue = undefined;
                        } else if (updated.originalHealth !== undefined) {
                            updated.currentHealth = updated.originalHealth;
                            updated.originalHealth = undefined;
                        }
                        if (updated.originalDef !== undefined) {
                            updated.currentHealth = updated.originalDef;
                            updated.originalDef = undefined;
                        }

                        // Sincronizar card stats
                        updated.card = { ...updated.card, atk: updated.currentAttack, def: updated.currentHealth };
                        if (updated.isSilenced) {
                            updated = { ...updated, isSilenced: false };
                        }
                        if (unit.card.id === '126') {
                            updated.customState = {
                                ...(updated.customState || {}),
                                hasOmegaAttack: true
                            };
                            updated.statusText = 'Omega Ready';
                        }
                        if (unit.card.id === '127') {
                            updated.customState = {
                                ...(updated.customState || {}),
                                ancestraisAtivos: false
                            };
                        }
                        if (unit.card.id === '157' && updated.customState?.oobActive) {
                            updated.currentHealth = Math.floor(updated.currentHealth * 0.5);
                            updated.card = { ...updated.card, def: updated.currentHealth };
                            updated.customState = {
                                ...(updated.customState || {}),
                                oobActive: false,
                                hasAttacked: false
                            };
                            updated.remainingAttacks = 1;
                            updated.maxAttacks = undefined;
                            log('[OOB] DEF reduzida em 50%.');
                        }

                        const nextCustomState = { ...(updated.customState || {}) };
                        if (unit.card.id === '26') {
                            nextCustomState.uiKamehamehaActive = false;
                            updated.isReady = false;
                            updated.isImmune = false;
                            updated.counters = { ...(updated.counters || {}), dodge: 0 };
                        }
                        if (unit.card.id === '33') {
                            nextCustomState.freezaStance = false;
                        }
                        if (unit.card.id === '76') {
                            updated.isImmune = false;
                        }
                        if (unit.card.id === '90') {
                            nextCustomState.lanternManual = false;
                            nextCustomState.lanternAttackedThisTurn = false;
                        }
                        if (unit.card.id === '93') {
                            nextCustomState.helaActive = false;
                            nextCustomState.helaStealUsed = false;
                            nextCustomState.helaAtkBonusPercent = 0;
                            const baseHela = initialCards.find(card => card.id === '93');
                            if (baseHela) {
                                updated.currentAttack = baseHela.atk || updated.currentAttack;
                            }
                        }
                        if (unit.card.id === '36') {
                            nextCustomState.thorManual = false;
                            nextCustomState.thorManualUsed = false;
                        }
                        if (unit.card.id === '95' && updated.customState?.ravenaAbsorptionTargets) {
                            nextCustomState.ravenaExpired = true;
                        }
                        if (unit.card.id === '36' && updated.customState?.thorAffectedIds) {
                            nextCustomState.thorExpired = true;
                        }
                        if (unit.card.id === '51' && updated.customState?.magnetoAffectedIds) {
                            nextCustomState.magnetoExpired = true;
                        }

                        // Reverter Status Bool
                        updated = {
                            ...updated,
                            isStunned: false,
                            isSilenced: false,
                            isIntangible: false,
                            isImmune: false,
                            customState: nextCustomState
                        };

                        // 🔻 DEBUFFS PERMANENTES (Pós-Efeito) - V4.7
                        if (unit.card.id === '137') { // Lee
                            updated.currentHealth = Math.floor((updated.originalHealth || unit.card.def || 1000) * 0.1);
                            updated.card.def = updated.currentHealth;
                            log('🌑 Rock Lee exausto! DEF reduzida a 10%.');
                        }
                        if (unit.card.id === '146') { // Coisa
                            updated.currentHealth = Math.floor((updated.originalHealth || unit.card.def || 1000) * 0.5);
                            updated.card.def = updated.currentHealth;
                            log('🌑 O Coisa exausto! DEF reduzida em 50%.');
                        }
                        if (unit.card.id === '144' && updated.statusEffect === 'ant_man_dodge') { // Formiga volta ao normal
                            updated.currentAttack *= 2;
                            updated.card.atk = updated.currentAttack;
                            log('🐜 Homem-Formiga cresceu! ATK Dobrado.');
                        }

                        if (unit.card.id !== '126') updated.statusText = undefined;
                        updated.statusEffect = undefined;

                        log(`⏲️ Efeito de ${unit.card.name} expirou.`);
                    } else {
                        if (updated.card.id === '157' && updated.effectTurns > 0) {
                            updated.remainingAttacks = 2;
                            updated.maxAttacks = 2;
                            updated.customState = {
                                ...(updated.customState || {}),
                                hasAttacked: false
                            };
                        }
                        // Atualizar texto do status
                        if (updated.statusText && updated.statusText.includes('T')) {
                            updated.statusText = updated.statusText.replace(/\d+T/, `${updated.effectTurns}T`);
                        }
                    }
                }

                // ↩️ Reset de ataques por turno (Goten, Rock Lee, etc.)
                (updated as any).attacksThisTurn = 0;
                updated = { ...updated, hasAttacked: false };
                if (updated.maxAttacks !== undefined) {
                    updated.maxAttacks = undefined; // Limpa multi-ataque ao virar turno
                }

                return updated;
            });
        };

        const nextTurnNumber = turnNumber + 1;
        let newPlayerBoard = processBoard(playerBoard, 'player');
        let newEnemyBoard = processBoard(enemyBoard, 'enemy');

        const restoreRavenaTargets = (ravenaBoard: TestSlot[], targetBoard: TestSlot[]): { ravenaBoard: TestSlot[]; targetBoard: TestSlot[] } => {
            let nextRavenaBoard = ravenaBoard;
            let nextTargetBoard = targetBoard;
            ravenaBoard.forEach(ravena => {
                if (ravena?.card.id !== '95' || !ravena.customState?.ravenaExpired) return;
                const storedTargets = ravena.customState.ravenaAbsorptionTargets || [];
                nextTargetBoard = nextTargetBoard.map(unit => {
                    const stored = storedTargets.find((target: any) => target.id === unit?.id);
                    if (!unit || !stored) return unit;
                    const { ravenaAbsorbed, ravenaSourceId, ...nextCustomState } = unit.customState || {};
                    return {
                        ...unit,
                        originalAttack: undefined,
                        currentAttack: Math.max(0, stored.remaining),
                        isSilenced: false,
                        card: { ...unit.card, atk: Math.max(0, stored.remaining) },
                        customState: nextCustomState
                    };
                });
                nextRavenaBoard = nextRavenaBoard.map(unit => {
                    if (unit?.id !== ravena.id) return unit;
                    const { ravenaAbsorptionTargets, ravenaExpired, ...nextCustomState } = unit.customState || {};
                    return { ...unit, customState: nextCustomState };
                });
                log('[RAVENA] AT restante devolvido aos alvos.');
            });
            return { ravenaBoard: nextRavenaBoard, targetBoard: nextTargetBoard };
        };

        const playerRavenaRestore = restoreRavenaTargets(newPlayerBoard, newEnemyBoard);
        newPlayerBoard = playerRavenaRestore.ravenaBoard;
        newEnemyBoard = playerRavenaRestore.targetBoard;
        const enemyRavenaRestore = restoreRavenaTargets(newEnemyBoard, newPlayerBoard);
        newEnemyBoard = enemyRavenaRestore.ravenaBoard;
        newPlayerBoard = enemyRavenaRestore.targetBoard;

        const cleanupExpiredLinkedTargets = (sourceBoard: TestSlot[], targetBoard: TestSlot[], sourceId: string, expiredKey: string, targetKey: string): { sourceBoard: TestSlot[]; targetBoard: TestSlot[] } => {
            let nextSourceBoard = sourceBoard;
            let nextTargetBoard = targetBoard;
            sourceBoard.forEach(source => {
                if (source?.card.id !== sourceId || !source.customState?.[expiredKey]) return;
                const affectedIds = source.customState[targetKey] || [];
                nextTargetBoard = nextTargetBoard.map(unit => {
                    if (!unit || !affectedIds.includes(unit.id)) return unit;
                    return {
                        ...unit,
                        isStunned: false,
                        isSilenced: false,
                        statusEffect: undefined,
                        statusText: undefined,
                        effectTurns: undefined
                    };
                });
                nextSourceBoard = nextSourceBoard.map(unit => {
                    if (unit?.id !== source.id) return unit;
                    const nextCustomState = { ...(unit.customState || {}) };
                    delete nextCustomState[expiredKey];
                    delete nextCustomState[targetKey];
                    return { ...unit, customState: nextCustomState };
                });
            });
            return { sourceBoard: nextSourceBoard, targetBoard: nextTargetBoard };
        };

        let linkedCleanup = cleanupExpiredLinkedTargets(newPlayerBoard, newEnemyBoard, '36', 'thorExpired', 'thorAffectedIds');
        newPlayerBoard = linkedCleanup.sourceBoard;
        newEnemyBoard = linkedCleanup.targetBoard;
        linkedCleanup = cleanupExpiredLinkedTargets(newEnemyBoard, newPlayerBoard, '36', 'thorExpired', 'thorAffectedIds');
        newEnemyBoard = linkedCleanup.sourceBoard;
        newPlayerBoard = linkedCleanup.targetBoard;
        linkedCleanup = cleanupExpiredLinkedTargets(newPlayerBoard, newEnemyBoard, '51', 'magnetoExpired', 'magnetoAffectedIds');
        newPlayerBoard = linkedCleanup.sourceBoard;
        newEnemyBoard = linkedCleanup.targetBoard;
        linkedCleanup = cleanupExpiredLinkedTargets(newEnemyBoard, newPlayerBoard, '51', 'magnetoExpired', 'magnetoAffectedIds');
        newEnemyBoard = linkedCleanup.sourceBoard;
        newPlayerBoard = linkedCleanup.targetBoard;

        if (nextTurnNumber % 3 === 0) {
            const revealFaceDown = (board: TestSlot[]): { board: TestSlot[]; revealed?: TestUnit } => {
                const candidates = board
                    .map((unit, index) => ({ unit, index }))
                    .filter(item => item.unit?.isFaceDown);
                if (candidates.length === 0) return { board };
                const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                const revealed = chosen.unit!;
                return {
                    board: board.map((unit, index) => index === chosen.index && unit ? { ...unit, isFaceDown: false } : unit),
                    revealed
                };
            };

            if (newPlayerBoard.some(unit => unit?.card.id === '138')) {
                const result = revealFaceDown(newEnemyBoard);
                newEnemyBoard = result.board;
                if (result.revealed) log(`[NEJI] Carta do oponente revelada: ${result.revealed.card.name}.`);
            }
            if (newEnemyBoard.some(unit => unit?.card.id === '138')) {
                const result = revealFaceDown(newPlayerBoard);
                newPlayerBoard = result.board;
                if (result.revealed) log(`[NEJI] Carta do oponente revelada: ${result.revealed.card.name}.`);
            }
        }

        const autoSource = [...newPlayerBoard, ...newEnemyBoard].find(unit =>
            unit?.customState?.autoDestroyTurns || unit?.customState?.delayedDamage
        );
        if (autoSource?.customState?.autoDestroyTurns) {
            const sourceIsPlayer = newPlayerBoard.some(unit => unit?.id === autoSource.id);
            setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: autoSource.id, abilityCallback: (targetId) => {
                const setter = sourceIsPlayer ? setEnemyBoard : setPlayerBoard;
                setter(prev => prev.map(unit => unit?.id === targetId ? null : unit));
                setInteractionMode({ type: 'IDLE' });
            }});
        } else if (autoSource?.customState?.delayedDamage) {
            const sourceIsPlayer = newPlayerBoard.some(unit => unit?.id === autoSource.id);
            setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: autoSource.id, abilityCallback: (targetId) => {
                const setter = sourceIsPlayer ? setEnemyBoard : setPlayerBoard;
                setter(prev => prev.map(unit => {
                    if (unit?.id !== targetId) return unit;
                    const nextHealth = unit.currentHealth - autoSource.customState.delayedDamage;
                    return nextHealth <= 0 ? null : { ...unit, currentHealth: nextHealth, card: { ...unit.card, def: nextHealth } };
                }));
                const sourceSetter = sourceIsPlayer ? setPlayerBoard : setEnemyBoard;
                sourceSetter(prev => prev.map(unit => unit?.id === autoSource.id ? { ...unit, customState: { ...(unit.customState || {}), delayedDamage: undefined } } : unit));
                setInteractionMode({ type: 'IDLE' });
            }});
        }

        setPlayerBoard(newPlayerBoard);
        setEnemyBoard(newEnemyBoard);
        setCurrentTurn(prev => prev === 'player' ? 'enemy' : 'player');
        setTurnNumber(nextTurnNumber);
        saveHistory(newPlayerBoard, newEnemyBoard, playerHand);

        log('⏳ Turno avançado. Efeitos temporários atualizados.');
    }, [playerBoard, enemyBoard, playerHand, log, saveHistory, turnNumber]);


    const executeAttack = useCallback((targetBoard: 'player' | 'enemy', targetIndex: number, lanternChoice?: 'counter' | 'defend' | 'none') => {
        if (!attackMode) return;
        const attackerBoard = attackMode.attackerBoard === 'player' ? playerBoard : enemyBoard;
        let attacker = attackerBoard.find(u => u?.id === attackMode.attackerId);
        const defenderBoard = targetBoard === 'player' ? playerBoard : enemyBoard;
        const defender = defenderBoard[targetIndex];

        if (!attacker || !defender) { setAttackMode(null); return; }
        if (attacker.hasAttacked) {
            log('[SISTEMA] Esta carta ja atacou neste turno.');
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }
        if (attacker.isStunned) {
            log(`[STUN] ${attacker.card.name} nao pode atacar.`);
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }
        if (defender.isIntangible) {
            log('[VISAO] Ataque anulado por intangibilidade.');
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }
        if (attacker.card.id === '92' && attacker.isIntangible) {
            const baseDefender = initialCards.find(c => c.id === defender.card.id);
            const baseDef = baseDefender?.def ?? defender.currentHealth;
            const nextHealth = baseDef - attacker.currentAttack;
            const newDefBoard = defenderBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
            newDefBoard[targetIndex] = nextHealth <= 0 ? null : {
                ...defender,
                currentHealth: nextHealth,
                card: { ...defender.card, def: nextHealth }
            };
            if (targetBoard === 'player') setPlayerBoard(newDefBoard); else setEnemyBoard(newDefBoard);
            const newAttBoard = attackerBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
            const aIdx = newAttBoard.findIndex(u => u?.id === attacker!.id);
            if (aIdx !== -1 && newAttBoard[aIdx]) {
                newAttBoard[aIdx] = {
                    ...newAttBoard[aIdx]!,
                    hasAttacked: true,
                    statusText: newAttBoard[aIdx]!.statusText,
                    statusEffect: newAttBoard[aIdx]!.statusEffect
                };
                if (attackMode.attackerBoard === 'player') setPlayerBoard(newAttBoard); else setEnemyBoard(newAttBoard);
            }
            log('[VISAO] Ataque intangivel aplicado contra DEF base.');
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }
        if (attackMode.attackerBoard === 'enemy' && defender.isStunned) {
            log('Oponente atordoado!');
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }
        if (attacker.card.id === '152' && (attacker.customState?.attacksThisTurn || 0) >= 2) {
            log('[GAMORA] Limite: 2 ataques por turno.');
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }
        if (defender.card.id === '138' && defender.isReady) {
            const baseAttacker = initialCards.find(c => c.id === attacker.card.id);
            const originalDamage = baseAttacker?.atk ?? attacker.currentAttack;
            const damage = Math.floor(originalDamage * 0.2);
            const reflectDamage = Math.floor(originalDamage * 0.4);
            const newDefBoard = defenderBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
            const dIdx = newDefBoard.findIndex(u => u?.id === defender.id);
            let survived = false;

            if (dIdx !== -1) {
                const neji = { ...newDefBoard[dIdx]! };
                const nextHealth = neji.currentHealth - damage;
                if (nextHealth > 0) {
                    survived = true;
                    newDefBoard[dIdx] = {
                        ...neji,
                        currentHealth: nextHealth,
                        isReady: false,
                        card: { ...neji.card, def: nextHealth },
                        statusText: undefined,
                        statusEffect: undefined
                    };
                } else {
                    newDefBoard[dIdx] = null;
                }
                if (targetBoard === 'player') setPlayerBoard(newDefBoard); else setEnemyBoard(newDefBoard);
            }

            if (survived) {
                const newAttBoard = attackerBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
                const aIdx = newAttBoard.findIndex(u => u?.id === attacker.id);
                const att = aIdx !== -1 ? newAttBoard[aIdx] : null;
                if (att) {
                    const nextHealth = att.currentHealth - reflectDamage;
                    newAttBoard[aIdx] = nextHealth <= 0 ? null : {
                        ...att,
                        currentHealth: nextHealth,
                        card: { ...att.card, def: nextHealth }
                    };
                    if (attackMode.attackerBoard === 'player') setPlayerBoard(newAttBoard); else setEnemyBoard(newAttBoard);
                }
            }

            log(`[NEJI] Dano recebido ${damage}; contra-ataque ${survived ? reflectDamage : 0}.`);
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }
        if (attacker.card.id === '157' && attacker.remainingAttacks !== undefined && attacker.remainingAttacks <= 0 && attacker.customState?.hasAttacked) {
            log('[OOB] Sem ataques restantes.');
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🛡️ REATIVE LOGICS (V4.7)

        // 👁️ NEJI (ID 138) - BYAKUGAN (Redução e Reflexão) - Só ativa se isReady
        if (defender.card.id === '138' && defender.isReady) {
            log(`👁️ Neji ativou Oito Trigramas!`);
            // Reduz Dano Recebido (80% Redução = 20% Dano)
            const damage = Math.floor(attacker.currentAttack * 0.2);

            // Aplica Dano Reduzido
            const newDefBoard = defenderBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
            const dIdx = newDefBoard.findIndex(u => u?.id === defender.id);
            let survived = false;

            if (dIdx !== -1) {
                const neji = { ...newDefBoard[dIdx]! };
                neji.currentHealth -= damage;
                neji.card.def = neji.currentHealth;
                log(`👁️ Neji defendeu! Sofreu apenas ${damage} de dano (Redução 80%).`);

                if (neji.currentHealth > 0) {
                    survived = true;
                    newDefBoard[dIdx] = neji;
                } else {
                    newDefBoard[dIdx] = null;
                    log(`☠️ Neji não resistiu.`);
                }
                if (targetBoard === 'player') setPlayerBoard(newDefBoard); else setEnemyBoard(newDefBoard);
            }

            // Reflete 40% do Dano Original se sobreviver
            if (survived) {
                const reflectDmg = Math.floor(attacker.currentAttack * 0.4);
                const newAttBoard = attackerBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
                const aIdx = newAttBoard.findIndex(u => u?.id === attacker.id);

                if (aIdx !== -1 && newAttBoard[aIdx]) {
                    const att = { ...newAttBoard[aIdx]! };
                    att.currentHealth -= reflectDmg;
                    att.card.def = att.currentHealth;

                    if (att.currentHealth <= 0) {
                        newAttBoard[aIdx] = null;
                        log(`☠️ ${att.card.name} caiu no contra-ataque de Neji! (-${reflectDmg})`);
                    } else {
                        newAttBoard[aIdx] = att;
                        log(`👁️ Neji contra-atacou! ${att.card.name} sofreu ${reflectDmg} de dano.`);
                    }

                    if (attackMode.attackerBoard === 'player') setPlayerBoard(newAttBoard); else setEnemyBoard(newAttBoard);
                }
            }

            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🐜 HOMEM-FORMIGA (ID 144) - ESQUIVA
        if (defender.statusEffect === 'ant_man_dodge') {
            log(`🐜 Homem-Formiga encolheu e desviou do ataque de ${attacker.card.name}!`);
            const newDefenderBoard = defenderBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
            // Remove isReady e statusEffect IMEDIATAMENTE após esquiva
            const u = { ...defender, statusEffect: undefined, statusText: undefined, isReady: false };
            newDefenderBoard[targetIndex] = u;
            if (targetBoard === 'player') setPlayerBoard(newDefenderBoard); else setEnemyBoard(newDefenderBoard);

            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🛡️ MULHER INVISÍVEL (ID 163) - PROTEÇÃO DE ALIADOS
        const invisibleProtector = defenderBoard.find(u => u?.card.id === '163' && u.charges && u.charges > 0);
        if (invisibleProtector && defender.id !== invisibleProtector.id) {
            log(`🛡️ Mulher Invisível desviou o ataque contra ${defender.card.name}!`);
            const newDefBoard = [...defenderBoard];
            const idx = newDefBoard.findIndex(u => u?.id === invisibleProtector.id);
            if (idx !== -1) {
                const inv = { ...newDefBoard[idx]! };
                inv.charges -= 1;
                inv.currentHealth += 300; // Ganha +300 DEF/HP
                inv.card.def = inv.currentHealth;
                inv.statusText = `🛡️ CAMPO (${inv.charges})`;
                newDefBoard[idx] = inv;

                if (targetBoard === 'player') setPlayerBoard(newDefBoard); else setEnemyBoard(newDefBoard);
            }
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🌀 WONG (ID 164) - PORTAL (Reflexão)
        const activeWong = defenderBoard.find(u => u?.card.id === '164' && u.charges && u.charges > 0);
        if (activeWong) {
            const originalDamage = attacker.currentAttack;
            const newDefBoard = [...defenderBoard];
            const wIdx = newDefBoard.findIndex(u => u?.id === activeWong.id);
            if (wIdx !== -1 && newDefBoard[wIdx]) {
                const wong = newDefBoard[wIdx]!;
                const nextCharges = (wong.charges || 0) - 1;
                newDefBoard[wIdx] = {
                    ...wong,
                    charges: nextCharges,
                    statusText: nextCharges > 0 ? `WONG (${nextCharges})` : undefined,
                    statusEffect: nextCharges > 0 ? 'guard' : undefined,
                    isReady: nextCharges > 0
                };
                if (targetBoard === 'player') setPlayerBoard(newDefBoard); else setEnemyBoard(newDefBoard);
            }

            const opponentBoardType = targetBoard === 'player' ? 'enemy' : 'player';
            setInteractionMode({
                type: 'SELECTING_ABILITY_TARGET',
                sourceId: activeWong.id,
                abilityCallback: (targetId) => {
                    const boardState = opponentBoardType === 'player' ? playerBoard : enemyBoard;
                    const setBoardState = opponentBoardType === 'player' ? setPlayerBoard : setEnemyBoard;
                    const tIdx = boardState.findIndex(u => u?.id === targetId);
                    const target = tIdx !== -1 ? boardState[tIdx] : null;
                    if (!target) return;
                    const nextHealth = target.currentHealth - originalDamage;
                    const updatedBoard = [...boardState];
                    updatedBoard[tIdx] = nextHealth <= 0 ? null : {
                        ...target,
                        currentHealth: nextHealth,
                        card: { ...target.card, def: nextHealth }
                    };
                    setBoardState(updatedBoard);
                    log(`[WONG] Dano redirecionado: ${originalDamage}.`);
                }
            });
            log('[WONG] Selecione um oponente para receber o dano redirecionado.');
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        const wongProtector = defenderBoard.find(u => u?.card.id === '164' && u.charges && u.charges > 0);
        if (wongProtector) { // Wong protege o board todo
            log(`🌀 Wong abriu um portal e redirecionou o ataque de ${attacker.card.name}!`);
            // Causa dano no ATACANTE (Reflexão)
            const newDefBoard = [...defenderBoard];
            const wIdx = newDefBoard.findIndex(u => u?.id === wongProtector.id);
            if (wIdx !== -1) {
                const w = { ...newDefBoard[wIdx]! };
                w.charges -= 1;
                w.statusText = `🛡️ ESCUDO (${w.charges})`;
                newDefBoard[wIdx] = w;
                if (targetBoard === 'player') setPlayerBoard(newDefBoard); else setEnemyBoard(newDefBoard);
            }

            // Dano no Atacante
            const newAttackerBoard = attackerBoard === playerBoard ? [...playerBoard] : [...enemyBoard];
            const aIdx = newAttackerBoard.findIndex(u => u?.id === attacker.id);
            if (aIdx !== -1 && newAttackerBoard[aIdx]) {
                const att = { ...newAttackerBoard[aIdx]! };
                att.currentHealth -= attacker.currentAttack; // Redireciona o dano do ataque
                if (att.currentHealth <= 0) {
                    newAttackerBoard[aIdx] = null;
                    log(`🌀 O ataque de ${att.card.name} voltou contra ele mesmo e o destruiu!`);
                } else {
                    newAttackerBoard[aIdx] = att;
                    log(`🌀 ${att.card.name} sofreu ${attacker.currentAttack} de dano pelo próprio ataque!`);
                }
                if (attackMode.attackerBoard === 'player') setPlayerBoard(newAttackerBoard); else setEnemyBoard(newAttackerBoard);
            }

            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🛡️ VERIFICAÇÃO DE ESCUDO VIVO (Groot) - INTERCEPTAÇÃO DE ATAQUES
        // Se o DEFENSOR tem camadas de escudo, absorve o ataque
        if (defender.shieldLayers && defender.shieldLayers > 0) {
            const newDefenderBoard = targetBoard === 'player' ? [...playerBoard] : [...enemyBoard];
            const setDefenderBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;

            const shieldedUnit = { ...defender };
            shieldedUnit.shieldLayers! -= 1;

            if (shieldedUnit.shieldLayers! <= 0) {
                // Escudo esgotado, remover Groot
                newDefenderBoard[targetIndex] = null;
                log(`🛡️ Escudo Vivo de Groot esgotou todas as camadas e desapareceu!`);
            } else {
                // Atualizar camadas restantes
                shieldedUnit.statusText = `🛡️ ESCUDO (${shieldedUnit.shieldLayers})`;
                newDefenderBoard[targetIndex] = shieldedUnit;
                log(`🛡️ Escudo Vivo de Groot absorveu o ataque! Camadas restantes: ${shieldedUnit.shieldLayers}`)
                    ;
            }

            setDefenderBoard(newDefenderBoard);
            saveHistory(targetBoard === 'player' ? newDefenderBoard : playerBoard, targetBoard === 'enemy' ? newDefenderBoard : enemyBoard, playerHand);
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🛡️ VERIFICAÇÃO DE ESCUDO VIVO (Groot) - PROTEÇÃO DE ALIADOS
        // Se há um Groot Escudo no mesmo board do defensor, ele intercepta o ataque
        const defenderBoardForShield = targetBoard === 'player' ? playerBoard : enemyBoard;
        const grootShield = defenderBoardForShield.find(u => u?.card.id === '193' && u.shieldLayers && u.shieldLayers > 0);

        if (grootShield && defender.id !== grootShield.id) {
            // Groot intercepta o ataque destinado ao aliado
            const newDefenderBoard = [...defenderBoardForShield];
            const setDefenderBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;
            const grootIndex = newDefenderBoard.findIndex(u => u?.id === grootShield.id);

            if (grootIndex !== -1 && newDefenderBoard[grootIndex]) {
                const updatedGroot = { ...newDefenderBoard[grootIndex]! };
                updatedGroot.shieldLayers! -= 1;

                if (updatedGroot.shieldLayers! <= 0) {
                    // Escudo esgotado, remover Groot
                    newDefenderBoard[grootIndex] = null;
                    log(`🛡️ Escudo Vivo de Groot interceptou o ataque contra ${defender.card.name} e esgotou todas as camadas!`);
                } else {
                    // Atualizar camadas restantes
                    updatedGroot.statusText = `🛡️ ESCUDO (${updatedGroot.shieldLayers})`;
                    newDefenderBoard[grootIndex] = updatedGroot;
                    log(`🛡️ Escudo Vivo de Groot interceptou o ataque contra ${defender.card.name}! Camadas restantes: ${updatedGroot.shieldLayers}`);
                }

                setDefenderBoard(newDefenderBoard);
                saveHistory(targetBoard === 'player' ? newDefenderBoard : playerBoard, targetBoard === 'enemy' ? newDefenderBoard : enemyBoard, playerHand);
                setAttackMode(null);
                setSelectedSlot(null);
                return;
            }
        }

        // 🎭 VERIFICAÇÃO DE ILUSÃO (Mysterio)
        // Se o defensor está no mesmo board que tem Mysterio com contadores, perguntar se quer bloquear
        const defenderBoardType = targetBoard;
        const defenderBoardArray = defenderBoardType === 'player' ? playerBoard : enemyBoard;
        const activeMysterio = defenderBoardArray.find(u => u?.card.id === '195' && u.charges && u.charges > 0);
        if (activeMysterio) {
            const newDefenderBoard = [...defenderBoardArray];
            const mysterioIndex = newDefenderBoard.findIndex(u => u?.id === activeMysterio.id);
            if (mysterioIndex !== -1 && newDefenderBoard[mysterioIndex]) {
                const mysterio = newDefenderBoard[mysterioIndex]!;
                const nextCharges = (mysterio.charges || 0) - 1;
                newDefenderBoard[mysterioIndex] = {
                    ...mysterio,
                    charges: nextCharges,
                    statusText: nextCharges > 0 ? `MYSTERIO (${nextCharges})` : undefined,
                    statusEffect: nextCharges > 0 ? 'illusion' : undefined,
                    isReady: nextCharges > 0
                };
                if (defenderBoardType === 'player') {
                    setPlayerBoard(newDefenderBoard);
                    saveHistory(newDefenderBoard, enemyBoard, playerHand);
                } else {
                    setEnemyBoard(newDefenderBoard);
                    saveHistory(playerBoard, newDefenderBoard, playerHand);
                }
                log(`[MYSTERIO] Ataque anulado. Cargas restantes: ${nextCharges}.`);
                setAttackMode(null);
                setSelectedSlot(null);
                return;
            }
        }

        const mysterioWithCounters = defenderBoardArray.find(u => u?.card.id === '195' && u.illusionCounters && u.illusionCounters > 0);

        if (mysterioWithCounters) {
            // Mostrar popup simples perguntando se quer bloquear
            const shouldBlock = window.confirm(`Deseja usar o efeito de Mysterio para bloquear este ataque?\n\n[OK] = SIM | [Cancelar] = NÃO`);

            if (shouldBlock) {
                // Consumir 1 contador
                const newDefenderBoard = [...defenderBoardArray];
                const mysterioIndex = newDefenderBoard.findIndex(u => u?.id === mysterioWithCounters.id);

                if (mysterioIndex !== -1 && newDefenderBoard[mysterioIndex]) {
                    const updatedMysterio = { ...newDefenderBoard[mysterioIndex]! };
                    updatedMysterio.illusionCounters! -= 1;

                    if (updatedMysterio.illusionCounters! <= 0) {
                        // Sem mais contadores
                        updatedMysterio.illusionCounters = undefined;
                        updatedMysterio.statusText = undefined;
                        updatedMysterio.statusEffect = undefined;
                        log(`🎭 Mysterio usou sua última Ilusão! Ataque de ${attacker.card.name} bloqueado!`);
                    } else {
                        // Atualizar contador
                        updatedMysterio.statusText = `✨ ILUSÃO (${updatedMysterio.illusionCounters})`;
                        log(`🎭 Mysterio bloqueou ataque de ${attacker.card.name}! Ilusões restantes: ${updatedMysterio.illusionCounters}`);
                    }

                    newDefenderBoard[mysterioIndex] = updatedMysterio;

                    if (defenderBoardType === 'player') {
                        setPlayerBoard(newDefenderBoard);
                        saveHistory(newDefenderBoard, enemyBoard, playerHand);
                    } else {
                        setEnemyBoard(newDefenderBoard);
                        saveHistory(playerBoard, newDefenderBoard, playerHand);
                    }

                    setAttackMode(null);
                    setSelectedSlot(null);
                    return;
                }
            }
        }

        // Imunidade bloqueia dano recebido, mas nao anula recuo do atacante fraco.
        const defenderBlocksCombat = defender.isImmune || defender.statusEffect === 'immune';
        if (defenderBlocksCombat) {
            if (attacker.currentAttack < defender.currentHealth) {
                const nextAttackerBoard = attackerBoard.map(unit => unit?.id === attacker.id ? null : unit);
                if (attackMode.attackerBoard === 'player') setPlayerBoard(nextAttackerBoard); else setEnemyBoard(nextAttackerBoard);
                if (attackMode.attackerBoard === 'player') setPlayerGraveyard(prev => [...prev, attacker.card]); else setEnemyGraveyard(prev => [...prev, attacker.card]);
                log(`[B-76] ${defender.card.name} esta imune ao dano, mas ${attacker.card.name} morreu no recuo.`);
                console.log('[B-76] Recuo processado contra defensor imune', { attackerId: attacker.card.id, defenderId: defender.card.id });
            } else {
                log(`[B-26] ${defender.card.name} esquivou do ataque de ${attacker.card.name}.`);
                console.log('[B-26] Imunidade real bloqueou ataque', { attackerId: attacker.card.id, defenderId: defender.card.id });
            }
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🧶 HOMEM ELÁSTICO (ID 162) - Interceptação
        // Verificar se há algum Homem Elástico protegendo o alvo (defender)
        const reedProtector = defenderBoardArray.find(u =>
            u?.card.id === '162' &&
            u.isReady
        );

        if (reedProtector) {
            // Reed Intercepta!
            const confirmIntercept = window.confirm(`🧶 Homem Elástico está protegendo ${defender.card.name}! Deseja interceptar o ataque? \n(Anula dano no aliado, Reed ganha +500 DEF e consome proteção)`);

            if (confirmIntercept) {
                // Ganha +500 DEF
                // Dano no alvo é 0
                // Consome prontidão
                const newDefBoard = [...defenderBoardArray];
                const reedIndex = newDefBoard.findIndex(u => u?.id === reedProtector.id);

                if (reedIndex !== -1 && newDefBoard[reedIndex]) {
                    const reed = { ...newDefBoard[reedIndex]! };
                    reed.currentHealth += 500;
                    reed.card = { ...reed.card, def: reed.currentHealth };
                    if (reed.charges === undefined) reed.charges = 1;
                    reed.charges--;
                    if (reed.charges > 0) {
                        reed.isReady = true;
                        reed.statusText = `🛡️ EM GUARDA (${reed.charges})`;
                    } else {
                        reed.isReady = false;
                        reed.statusText = undefined;
                        reed.statusEffect = undefined;
                    }
                    newDefBoard[reedIndex] = reed;

                    log(`🧶 Homem Elástico interceptou o ataque em ${defender.card.name}! Absorveu o dano e ganhou +500 DEF!`);

                    // Atualizar board defensor
                    if (defenderBoardType === 'player') setPlayerBoard(newDefBoard);
                    else setEnemyBoard(newDefBoard);

                    // Encerrar ataque (cancelado)
                    setAttackMode(null);
                    setSelectedSlot(null);
                    return;
                }
            }
        }

        // 🛡️ CAPITÃO AMÉRICA (ID 160) - Reflexão (Só se isReady)
        const capUnit = defenderBoardArray.find(u => u?.card.id === '160' && u.isReady); // Agora checa isReady
        if (capUnit) {
            // Verificar se o alvo é o próprio Cap ou Aliado
            // A lógica anterior já cobria "contra si ou aliados" pois capUnit está no mesmo board.
            const confirmReflect = window.confirm(`🛡️ Capitão América está em Posição de Defesa!\n\nDeseja refletir o ataque de ${attacker.card.name}?`);
            if (confirmReflect) {
                // Atualizar Cap (consumir isReady)
                const newDefBoard = [...defenderBoardArray];
                const capIndex = newDefBoard.findIndex(u => u?.id === capUnit.id);
                if (capIndex !== -1 && newDefBoard[capIndex]) {
                    const cap = { ...newDefBoard[capIndex]! };
                    if (cap.charges === undefined) cap.charges = 1;
                    cap.charges--;
                    if (cap.charges > 0) {
                        cap.isReady = true;
                        cap.statusText = `🛡️ PRONTO (${cap.charges})`;
                    } else {
                        cap.isReady = false;
                        cap.statusText = undefined;
                        cap.statusEffect = undefined;
                    }
                    newDefBoard[capIndex] = cap;

                    // Atualizar boards (consumo do isReady)
                    if (defenderBoardType === 'player') setPlayerBoard(newDefBoard);
                    else setEnemyBoard(newDefBoard);

                    // ATIVAR MODO DE REFLEXÃO (Seleção de Alvo)
                    log(`🛡️ Capitão América bloqueou o ataque! Selecione um inimigo para rebater ${attacker.currentAttack} de dano!`);
                    setReflectionMode({
                        damage: attacker.currentAttack,
                        sourceId: capUnit.id,
                        sourceBoard: defenderBoardType
                    });

                    setAttackMode(null);
                    setSelectedSlot(null);
                    return;
                }
            }
        }

        if (attacker.customState?.ultraEgoActive) {
            const nextDefBoard = targetBoard === 'player' ? [...playerBoard] : [...enemyBoard];
            nextDefBoard[targetIndex] = null;
            if (targetBoard === 'player') setPlayerBoard(nextDefBoard); else setEnemyBoard(nextDefBoard);
            setAttackMode(null);
            setSelectedSlot(null);
            log('[UE] Alvo eliminado independente de AT/DF.');
            return;
        }

        if (defender.customState?.freezaStance) {
            const wantsToCounter = window.confirm(`[FREEZA BLACK] Você foi atacado! Deseja usar o Contra-Ataque? Se cancelar, poderá usar no próximo ataque recebido.`);
            if (wantsToCounter) {
                const nextDefBoard = defenderBoardArray.map(unit => unit?.id === defender.id ? {
                    ...unit,
                    customState: {
                        ...(unit.customState || {}),
                        freezaStance: false
                    },
                    statusText: 'COUNTER'
                } : unit);
                if (targetBoard === 'player') setPlayerBoard(nextDefBoard); else setEnemyBoard(nextDefBoard);
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: defender.id, abilityCallback: (targetId) => {
                    const setCounterBoard = targetBoard === 'player' ? setEnemyBoard : setPlayerBoard;
                    const setFreezaBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;
                    setCounterBoard(prev => prev.map(unit => {
                        if (unit?.id !== targetId) return unit;
                        if (defender.currentAttack < unit.currentHealth) {
                            log(`[FREEZA] Oponente defendeu! Freeza morreu e causou ${defender.currentAttack} de dano.`);
                            setFreezaBoard(fPrev => fPrev.map(fUnit => fUnit?.id === defender.id ? null : fUnit));
                            const nextHealth = unit.currentHealth - defender.currentAttack;
                            return nextHealth <= 0 ? null : { ...unit, currentHealth: nextHealth, card: { ...unit.card, def: nextHealth } };
                        } else {
                            log(`[FREEZA] Contra-ataque mortal! Alvo destruído.`);
                            return null;
                        }
                    }));
                    setInteractionMode({ type: 'IDLE' });
                } });
                setAttackMode(null);
                setSelectedSlot(null);
                log('[FREEZA] Dano do ataque original ignorado. Selecione o alvo do contra-ataque.');
                return;
            } else {
                log('[FREEZA] Contra-ataque adiado. O ataque será recebido normalmente.');
            }
        }

        let lanternDamageReduction = 0;
        const activeLantern = defenderBoardArray.find(u =>
            u?.card.id === '90' &&
            u.effectTurns !== undefined &&
            u.effectTurns > 0 &&
            u.customState?.lanternManual &&
            !u.customState?.lanternAttackedThisTurn
        );
        if (activeLantern) {
            if (!lanternChoice) {
                const lanternIndex = defenderBoardArray.findIndex(unit => unit?.id === activeLantern.id);
                setLanternDefensePrompt({ activeLanternId: activeLantern.id, targetBoard, targetIndex });
                if (lanternIndex !== -1) setCardPopup({ unit: activeLantern, board: targetBoard, index: lanternIndex });
                setSelectedSlot(null);
                log('[LANTERNA VERDE] Escolha a resposta no card.');
                return;
            }
            setLanternDefensePrompt(null);
            if (lanternChoice === 'counter' || lanternChoice === 'defend') {
                const nextDefBoard = defenderBoardArray.map(unit => unit?.id === activeLantern.id ? {
                    ...unit,
                    customState: {
                        ...(unit.customState || {}),
                        lanternAttackedThisTurn: true
                    }
                } : unit);
                if (targetBoard === 'player') setPlayerBoard(nextDefBoard); else setEnemyBoard(nextDefBoard);
                if (lanternChoice === 'counter') {
                    const nextAttBoard = attackerBoard.map(unit => {
                        if (unit?.id !== attacker.id) return unit;
                        const nextHealth = unit.currentHealth - 1200;
                        return nextHealth <= 0 ? null : { ...unit, currentHealth: nextHealth, card: { ...unit.card, def: nextHealth } };
                    });
                    if (attackMode.attackerBoard === 'player') setPlayerBoard(nextAttBoard); else setEnemyBoard(nextAttBoard);
                    setAttackMode(null);
                    setSelectedSlot(null);
                    log('[LANTERNA VERDE] Contra-ataque manual causou 1200 e ignorou o dano.');
                    return;
                }
                lanternDamageReduction = 1200;
                log('[LANTERNA VERDE] Interceptacao manual reduziu 1200 do dano.');
            }
        }

        if (defender.customState?.hitStance && defender.customState?.hitCharges && defender.customState.hitCharges > 0) {
            const nextDefBoard = defenderBoardArray.map(unit => unit?.id === defender.id ? {
                ...unit,
                charges: Math.max(0, (unit.charges || 1) - 1),
                customState: {
                    ...(unit.customState || {}),
                    hitStance: false,
                    hitCharges: Math.max(0, unit.customState.hitCharges - 1)
                },
                statusText: unit.customState.hitCharges - 1 > 0 ? `HIT ${unit.customState.hitCharges - 1}` : undefined
            } : unit);
            const nextAttBoard = attackerBoard.map(unit => unit?.id === attacker.id ? {
                ...unit,
                isStunned: true,
                effectTurns: 1,
                statusText: 'STUN 1T'
            } : unit);
            if (targetBoard === 'player') setPlayerBoard(nextDefBoard); else setEnemyBoard(nextDefBoard);
            if (attackMode.attackerBoard === 'player') setPlayerBoard(nextAttBoard); else setEnemyBoard(nextAttBoard);
            setAttackMode(null);
            setSelectedSlot(null);
            log('[HIT] Ataque cancelado e atacante atordoado.');
            return;
        }

        if (defender.customState?.ultraEgoActive) {
            const nextAttBoard = attackerBoard.map(unit => unit?.id === attacker.id ? null : unit);
            if (attackMode.attackerBoard === 'player') setPlayerBoard(nextAttBoard); else setEnemyBoard(nextAttBoard);
            setAttackMode(null);
            setSelectedSlot(null);
            log('[UE] Dano cancelado e contra-ataque total.');
            return;
        }

        if (defender.customState?.moroReactive) {
            const nextDefBoard = defenderBoardArray.map(unit => unit?.id === defender.id ? {
                ...unit,
                currentHealth: unit.currentHealth + attacker.currentAttack,
                card: { ...unit.card, def: unit.currentHealth + attacker.currentAttack }
            } : unit);
            if (targetBoard === 'player') setPlayerBoard(nextDefBoard); else setEnemyBoard(nextDefBoard);
        }

        let attackerDamage = Math.max(0, attacker.currentAttack - lanternDamageReduction); // ATK do atacante
        if (defender.customState?.damageReduction) {
            attackerDamage = Math.floor(attackerDamage * defender.customState.damageReduction);
        }
        const defenderDefense = defender.currentHealth; // DEF do defensor (currentHealth = DEF)
        const combatResult = resolveCombat(attackerDamage, defenderDefense, 0);
        const isEqualCombat = attackerDamage === defenderDefense;
        const isDefenderKilled = isEqualCombat ? false : combatResult.defenderDies;
        // ✅ FIX V4.8: Atacante NUNCA morre em combate normal.
        // Apenas habilidades de Reflexo/Espinhos causam dano de volta (já tratadas acima com return).
        const isAttackerKilled = isEqualCombat ? false : combatResult.attackerDies;
        const nextDefenderHealth = isEqualCombat ? defenderDefense : combatResult.newDefenderDef;
        if (isAttackerKilled && attacker.card.id === '33') {
            console.log('[B-33] Freeza Black morreu ao atacar DEF maior', { attackerDamage, defenderDefense });
        }
        if (isAttackerKilled && defender.card.id === '76') {
            console.log('[B-76] Atacante morreu ao bater na DEF do Naruto', { attackerDamage, defenderDefense });
        }

        let newPBoard = [...playerBoard];
        let newEBoard = [...enemyBoard];
        if (attacker.card.id === '152') {
            const attackerBoardArr = attackMode.attackerBoard === 'player' ? [...newPBoard] : [...newEBoard];
            const attIdx = attackerBoardArr.findIndex(u => u?.id === attacker.id);
            if (attIdx !== -1 && attackerBoardArr[attIdx]) {
                const attUnit = { ...attackerBoardArr[attIdx]! };
                const attacksThisTurn = (attUnit.customState?.attacksThisTurn || 0) + 1;
                attackerBoardArr[attIdx] = {
                    ...attUnit,
                    remainingAttacks: attacksThisTurn >= 2 ? 0 : attUnit.remainingAttacks,
                    customState: {
                        ...(attUnit.customState || {}),
                        attacksThisTurn
                    }
                };
                if (attackMode.attackerBoard === 'player') newPBoard = attackerBoardArr; else newEBoard = attackerBoardArr;
            }
        }

        // Função auxiliar para processar morte e cemitério (incluindo Deadpool Modal)
        const processDeath = (unit: TestUnit, boardOwner: 'player' | 'enemy', slotIndex: number): TestUnit | null => {
            // Adicionar ao cemitério
            if (boardOwner === 'player') setPlayerGraveyard(prev => [...prev, unit.card]);
            else setEnemyGraveyard(prev => [...prev, unit.card]);

            // Lógica Deadpool (ID 159) - Reviver Aliado
            if (unit.card.id === '159' && boardOwner === 'player') {
                log(`💀 Deadpool foi derrotado! Abrindo cemitério para reviver...`);

                // Abrir Modal de Cemitério com Callback
                setShowGraveyard('player');
                setGraveyardSelectorMode({
                    title: 'DEADPOOL: ESCOLHA UMA CARTA PARA REVIVER (EXCETO DEADPOOL)',
                    filter: (c) => c.id !== '159', // 🚫 EXCLUIR PRÓPRIO DEADPOOL
                    onSelect: (card) => {
                        log(`💀 Deadpool reviveu ${card.name}! (+50% Stats)`);

                        const revivedUnit = createUnit(card);
                        revivedUnit.currentAttack = Math.floor(revivedUnit.currentAttack * 1.5);
                        revivedUnit.currentHealth = Math.floor(revivedUnit.currentHealth * 1.5);
                        revivedUnit.card.atk = revivedUnit.currentAttack;
                        revivedUnit.card.def = revivedUnit.currentHealth;
                        revivedUnit.statusText = '🧟 REVIVIDO';

                        // Inserir no board
                        setPlayerBoard(currentBoard => {
                            const updatedBoard = [...currentBoard];
                            // Tentar colocar no slot onde Deadpool morreu (slotIndex)
                            if (updatedBoard[slotIndex] === null) {
                                updatedBoard[slotIndex] = revivedUnit;
                            } else {
                                // Se ocupado (raro), procurar outro
                                const empty = updatedBoard.findIndex(s => s === null);
                                if (empty !== -1) updatedBoard[empty] = revivedUnit;
                            }
                            return updatedBoard;
                        });
                    }
                });
            }
            return null; // Morre normalmente
        };

        if (attackMode.attackerBoard === 'player') {
            // Atacante (Player)
            newPBoard = newPBoard.map((u, i) => (u?.id === attacker.id ? (isAttackerKilled ? processDeath(u, 'player', i) : u) : u));
            // Defensor (Enemy)
            newEBoard = newEBoard.map((u, i) => (i === targetIndex ? (isDefenderKilled ? processDeath(u!, 'enemy', i) : (u ? { ...u, currentHealth: nextDefenderHealth, card: { ...u.card, def: nextDefenderHealth } } : null)) : u));
        } else {
            // Atacante (Enemy)
            newEBoard = newEBoard.map((u, i) => (u?.id === attacker.id ? (isAttackerKilled ? processDeath(u, 'enemy', i) : u) : u));
            // Defensor (Player)
            newPBoard = newPBoard.map((u, i) => (i === targetIndex ? (isDefenderKilled ? processDeath(u!, 'player', i) : (u ? { ...u, currentHealth: nextDefenderHealth, card: { ...u.card, def: nextDefenderHealth } } : null)) : u));
        }
        if (!isDefenderKilled && defender.card.id === '95' && defender.customState?.ravenaAbsorptionTargets) {
            const damageTaken = Math.max(0, defender.currentHealth - nextDefenderHealth);
            if (damageTaken > 0) {
                const boardArr = targetBoard === 'player' ? newPBoard : newEBoard;
                const targetCount = defender.customState.ravenaAbsorptionTargets.length || 1;
                const baseLoss = Math.floor(damageTaken / targetCount);
                const remainder = damageTaken % targetCount;
                const nextBoard = boardArr.map(unit => {
                    if (unit?.id !== defender.id) return unit;
                    return {
                        ...unit,
                        customState: {
                            ...(unit.customState || {}),
                            ravenaAbsorptionTargets: unit.customState.ravenaAbsorptionTargets.map((target: any, index: number) => ({
                                ...target,
                                remaining: Math.max(0, target.remaining - baseLoss - (index < remainder ? 1 : 0))
                            }))
                        }
                    };
                });
                if (targetBoard === 'player') newPBoard = nextBoard; else newEBoard = nextBoard;
                log(`[RAVENA] Dano recebido reduziu a devolucao em ${damageTaken}.`);
            }
        }
        if (attacker.customState?.attackCostDef) {
            const boardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const nextBoard = boardArr.map(unit => {
                if (unit?.id !== attacker.id) return unit;
                const nextHealth = unit.currentHealth - attacker.customState.attackCostDef;
                return nextHealth <= 0 ? null : { ...unit, currentHealth: nextHealth, card: { ...unit.card, def: nextHealth } };
            });
            if (attackMode.attackerBoard === 'player') newPBoard = nextBoard; else newEBoard = nextBoard;
        }
        if (!isDefenderKilled && defender.customState?.wolverineSurvive) {
            const boardArr = targetBoard === 'player' ? newPBoard : newEBoard;
            const nextBoard = boardArr.map(unit => unit?.id === defender.id ? {
                ...unit,
                currentHealth: Math.floor(unit.currentHealth * 1.5),
                card: { ...unit.card, def: Math.floor(unit.currentHealth * 1.5) }
            } : unit);
            if (targetBoard === 'player') newPBoard = nextBoard; else newEBoard = nextBoard;
        }
        if (defender.customState?.counterOnDamage) {
            const boardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const nextBoard = boardArr.map(unit => {
                if (unit?.id !== attacker.id) return unit;
                const nextHealth = unit.currentHealth - defender.currentAttack;
                return nextHealth <= 0 ? null : { ...unit, currentHealth: nextHealth, card: { ...unit.card, def: nextHealth } };
            });
            if (attackMode.attackerBoard === 'player') newPBoard = nextBoard; else newEBoard = nextBoard;
        }
        if (defender.customState?.reflectPlus) {
            const reflectDamage = attackerDamage + defender.customState.reflectPlus;
            const boardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const nextBoard = boardArr.map(unit => {
                if (unit?.id !== attacker.id) return unit;
                const nextHealth = unit.currentHealth - reflectDamage;
                return nextHealth <= 0 ? null : { ...unit, currentHealth: nextHealth, card: { ...unit.card, def: nextHealth } };
            });
            if (attackMode.attackerBoard === 'player') newPBoard = nextBoard; else newEBoard = nextBoard;
        }
        if (isAttackerKilled) {
            if (attackMode.attackerBoard === 'player') {
                setPlayerBoard(prev => prev.map(u => u?.id === attacker.id ? null : u));
            } else {
                setEnemyBoard(prev => prev.map(u => u?.id === attacker.id ? null : u));
            }
        }

        if (isDefenderKilled && attacker.card.id === '126' && attacker.effectTurns && attacker.effectTurns > 0) {
            const attackerBoardArr = attackMode.attackerBoard === 'player' ? [...newPBoard] : [...newEBoard];
            const attIdx = attackerBoardArr.findIndex(u => u?.id === attacker.id);
            if (attIdx !== -1 && attackerBoardArr[attIdx]) {
                const attUnit = { ...attackerBoardArr[attIdx]! };
                const accumulatedDamage = (attUnit.customState?.accumulatedDamage || 0) + defenderDefense;
                attUnit.customState = {
                    ...(attUnit.customState || {}),
                    accumulatedDamage
                };
                attUnit.statusText = `Omega Dmg: ${accumulatedDamage}`;
                attackerBoardArr[attIdx] = attUnit;
                if (attackMode.attackerBoard === 'player') newPBoard = attackerBoardArr; else newEBoard = attackerBoardArr;
            }
        }

        // 💀 CAVEIRA VERMELHA (ID 190) - MANUAL COM isReady
        // Verifica se o ATACANTE é Caveira Vermelha com isReady ativo
        if (isDefenderKilled && attacker.card.id === '190' && attacker.isReady) {
            const attackerBoard = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const attackerIndex = attackerBoard.findIndex(u => u?.id === attacker.id);

            if (attackerIndex !== -1 && attackerBoard[attackerIndex]) {
                // Aplicar +400 DEF TEMPORÁRIO no Caveira (2 turnos)
                const caveira = { ...attackerBoard[attackerIndex]! };

                // Salvar DEF original se ainda não foi salvo
                if (caveira.originalHealth === undefined) {
                    caveira.originalHealth = caveira.currentHealth;
                }

                caveira.currentHealth += 400;
                caveira.card = { ...caveira.card, def: caveira.currentHealth };
                caveira.isReady = false; // Desativar o estado ready
                caveira.statusEffect = 'buffed';
                caveira.effectTurns = 2;
                caveira.statusText = '🛡️ +400 DEF (2T)';
                attackerBoard[attackerIndex] = caveira;

                // Debuff -50% ATK em TODOS os inimigos por 2T
                const enemyBoardToDebuff = attackMode.attackerBoard === 'player' ? newEBoard : newPBoard;
                const debuffedEnemies = enemyBoardToDebuff.map(u => {
                    if (!u) return u;
                    const debuffed = { ...u };
                    if (debuffed.originalAttack === undefined) debuffed.originalAttack = u.currentAttack;
                    debuffed.currentAttack = Math.floor(debuffed.currentAttack * 0.5);
                    debuffed.statusEffect = 'weakened';
                    debuffed.effectTurns = 2;
                    debuffed.statusText = '⬇️ -50% ATK (2T)';
                    return debuffed;
                });

                if (attackMode.attackerBoard === 'player') {
                    newPBoard = attackerBoard;
                    newEBoard = debuffedEnemies;
                } else {
                    newEBoard = attackerBoard;
                    newPBoard = debuffedEnemies;
                }

                log(`💀 Caveira Vermelha espalhou o caos no campo! +400 DEF por 2 turnos (${caveira.currentHealth}) e enfraqueceu todos os inimigos!`);
            }
        }

        // 🌳 PASSIVA GROOT (ID 193) - Escudo Vivo (3 camadas)
        // Verificar se Groot morreu neste ataque
        if (defender?.card.id === '193' && !defender.hasRevived && isDefenderKilled) {
            const grootShield = {
                ...defender,
                currentAttack: 0, // Escudo não ataca
                currentHealth: 1, // HP mínimo para existir
                hasRevived: true, // Marca para não reviver novamente
                shieldLayers: 3, // 3 camadas de proteção
                statusText: '🛡️ ESCUDO (3)',
                statusEffect: 'shield'
            };

            if (targetBoard === 'player') {
                newPBoard[targetIndex] = grootShield;
            } else {
                newEBoard[targetIndex] = grootShield;
            }

            log(`🌳 Groot se sacrificou para proteger os aliados! Escudo Vivo ativado (3 camadas)!`);
        }

        // 🐾 PANTERA NEGRA (ID 127) - Bonus por Morte
        if (isDefenderKilled && attacker.card.id === '127' && attacker.customState?.ancestraisAtivos) {
            const attackerBoardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const attIdx = attackerBoardArr.findIndex(u => u?.id === attacker.id);
            if (attIdx !== -1 && attackerBoardArr[attIdx]) {
                const attUnit = { ...attackerBoardArr[attIdx]! };
                attUnit.currentHealth += 500;
                attUnit.card = { ...attUnit.card, def: attUnit.currentHealth };
                attUnit.statusText = '+500 DEF (Ancestrais)';
                attackerBoardArr[attIdx] = attUnit;
                if (attackMode.attackerBoard === 'player') newPBoard = attackerBoardArr; else newEBoard = attackerBoardArr;
                log(`[PANTERA] Pantera Negra derrotou um oponente! +500 DEF permanente.`);
            }
        }

        if (isDefenderKilled && attacker.card.id === '93' && attacker.customState?.helaActive) {
            const attackerBoardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const attIdx = attackerBoardArr.findIndex(u => u?.id === attacker.id);
            if (attIdx !== -1 && attackerBoardArr[attIdx]) {
                const attUnit = { ...attackerBoardArr[attIdx]! };
                const baseHela = initialCards.find(card => card.id === attUnit.card.id);
                const nextBonus = Math.min(100, (attUnit.customState?.helaAtkBonusPercent || 0) + 10);
                const nextAttack = Math.floor((baseHela?.atk || attUnit.currentAttack) * (1 + nextBonus / 100));
                attackerBoardArr[attIdx] = {
                    ...attUnit,
                    currentAttack: nextAttack,
                    card: { ...attUnit.card, atk: nextAttack },
                    customState: {
                        ...(attUnit.customState || {}),
                        helaAtkBonusPercent: nextBonus
                    },
                    statusText: `HELA +${nextBonus}% AT`
                };
                if (attackMode.attackerBoard === 'player') newPBoard = attackerBoardArr; else newEBoard = attackerBoardArr;
                console.log('[B-93] Hela ganhou AT permanente ao derrotar inimigo', { nextAttack, nextBonus });
            }
        }

        // [GAMORA] (ID 152) - Bonus por Morte + 2o Ataque
        if (isDefenderKilled && attacker.card.id === '152') {
            const attackerBoardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const attIdx = attackerBoardArr.findIndex(u => u?.id === attacker.id);
            if (attIdx !== -1 && attackerBoardArr[attIdx]) {
                const attUnit = { ...attackerBoardArr[attIdx]! };
                if (attUnit.customState?.hbActive) {
                    const hasGamoraBuff = !!attUnit.customState?.hasGamoraBuff;
                    const currentAttack = hasGamoraBuff ? attUnit.currentAttack : Math.floor(attUnit.currentAttack * 1.5);
                    attackerBoardArr[attIdx] = {
                        ...attUnit,
                        currentAttack,
                        card: { ...attUnit.card, atk: currentAttack },
                        remainingAttacks: 1,
                        maxAttacks: 2,
                        customState: {
                            ...(attUnit.customState || {}),
                            hbActive: false,
                            hasGamoraBuff: true
                        },
                        statusText: 'Gamora Extra: 1'
                    };
                    if (attackMode.attackerBoard === 'player') newPBoard = attackerBoardArr; else newEBoard = attackerBoardArr;
                    log(`[GAMORA] Bonus ativado. +50% ATK e 1 ataque extra.`);
                }
            }
        }

        if (isDefenderKilled && attacker.card.id === '158') {
            const attackerBoardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const attIdx = attackerBoardArr.findIndex(u => u?.id === attacker.id);
            if (attIdx !== -1 && attackerBoardArr[attIdx]) {
                const attUnit = { ...attackerBoardArr[attIdx]! };
                if (attUnit.customState?.killmongerActive && attUnit.originalAttack !== undefined) {
                    const currentAttack = attUnit.originalAttack * 2;
                    attUnit.currentAttack = currentAttack;
                    attUnit.card = { ...attUnit.card, atk: currentAttack };
                    attUnit.customState = {
                        ...(attUnit.customState || {}),
                        killmongerActive: false
                    };
                    attUnit.originalAttack = undefined;
                    attUnit.statusText = 'Killmonger +100%';
                    attackerBoardArr[attIdx] = attUnit;
                    if (attackMode.attackerBoard === 'player') newPBoard = attackerBoardArr; else newEBoard = attackerBoardArr;
                    log(`[KILLMONGER] Bonus permanente aplicado.`);
                }
            }
        }

        // ⚡ GOTEN BONUS CHECK - +300 ATK apenas no 2o ataque do turno
        if (attacker.card.id === '133') {
            const attackerBoardArr = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
            const attIdx = attackerBoardArr.findIndex(u => u?.id === attacker.id);
            if (attIdx !== -1 && attackerBoardArr[attIdx]) {
                const attUnit = { ...attackerBoardArr[attIdx]! };
                const attacksThisTurn = (attUnit as any).attacksThisTurn || 0;
                if (attacksThisTurn >= 1) {
                    // 2º ataque ou mais: aplica +300
                    attUnit.currentAttack += 300;
                    attUnit.card = { ...attUnit.card, atk: attUnit.currentAttack };
                    attUnit.statusText = '⚡ POWER UP (+300)';
                    log(`⚡ Goten ficou mais forte no 2º ataque! (+300 ATK)`);
                }
                (attUnit as any).attacksThisTurn = attacksThisTurn + 1;
                attackerBoardArr[attIdx] = attUnit;
                if (attackMode.attackerBoard === 'player') newPBoard = attackerBoardArr; else newEBoard = attackerBoardArr;
            }
        }

        // 🥛 ROCK LEE (ID 137) - Multi-Ataque: Manter attackMode ativo se ainda tem ataques
        const attackerBoardFinal = attackMode.attackerBoard === 'player' ? newPBoard : newEBoard;
        const attackerFinalUnit = attackerBoardFinal.find(u => u?.id === attacker.id);
        const gainedExtraThisAttack = isDefenderKilled && attacker.card.id === '152' && !!attacker.customState?.hbActive;
        const attackBudget = attackerFinalUnit?.remainingAttacks !== undefined ? attackerFinalUnit.remainingAttacks : attackerFinalUnit?.maxAttacks;
        const remainingAttacks = gainedExtraThisAttack ? (attackerFinalUnit?.remainingAttacks || 0) : (attackBudget ? (attackBudget - 1) : 0);

        setPlayerBoard(newPBoard);
        setEnemyBoard(newEBoard);
        saveHistory(newPBoard, newEBoard, playerHand);

        log(`⚔️ ${attacker.card.name} atacou ${defender.card.name}`);

        if (remainingAttacks > 0 && attackerFinalUnit) {
            // Decrementar maxAttacks e manter attackMode ativo
            const updatedBoard = [...(attackMode.attackerBoard === 'player' ? newPBoard : newEBoard)];
            const uIdx = updatedBoard.findIndex(u => u?.id === attacker.id);
            if (uIdx !== -1 && updatedBoard[uIdx]) {
                const updatedUnit = { ...updatedBoard[uIdx]! };
                updatedUnit.maxAttacks = remainingAttacks;
                updatedUnit.remainingAttacks = remainingAttacks;
                updatedUnit.customState = {
                    ...(updatedUnit.customState || {}),
                    hasAttacked: true
                };
                updatedUnit.statusText = `🥛 ${remainingAttacks} ATAQUE(S) RESTANTE(S)`;
                updatedBoard[uIdx] = updatedUnit;
                if (attackMode.attackerBoard === 'player') setPlayerBoard(updatedBoard); else setEnemyBoard(updatedBoard);
            }
            log(`🥛 Rock Lee ainda tem ${remainingAttacks} ataque(s)! Selecione outro alvo.`);
            // Manter attackMode ativo para próximo ataque
            setSelectedSlot(null);
            // NÃO limpar attackMode
        } else {
            setAttackMode(null);
            setSelectedSlot(null);
            if (attackerFinalUnit?.remainingAttacks !== undefined) {
                const resetBoard = [...(attackMode.attackerBoard === 'player' ? newPBoard : newEBoard)];
                const resetIdx = resetBoard.findIndex(u => u?.id === attacker.id);
                if (resetIdx !== -1 && resetBoard[resetIdx]) {
                    resetBoard[resetIdx] = {
                        ...resetBoard[resetIdx]!,
                        remainingAttacks: 0,
                        maxAttacks: undefined
                    };
                    if (attackMode.attackerBoard === 'player') setPlayerBoard(resetBoard); else setEnemyBoard(resetBoard);
                }
            }
        }
    }, [attackMode, playerBoard, enemyBoard, playerHand, log, saveHistory, setPlayerGraveyard, setEnemyGraveyard, setShowGraveyard, setGraveyardSelectorMode, setPlayerBoard]);

    const executeEffect = useCallback((targetBoard: 'player' | 'enemy', targetIndex: number, directSource?: TestUnit) => {
        // ⚔️ ZORO MULTI-TARGET CHECK
        if (effectMode?.type === 'multi_target_damage') {
            const sourceBoard = effectMode.sourceBoard === 'player' ? playerBoard : enemyBoard;
            const sourceUnit = sourceBoard.find(u => u?.id === effectMode.sourceId);

            if (!sourceUnit) { setEffectMode(null); return; }

            // Evitar Friendly Fire se board for o mesmo
            if (effectMode.sourceBoard === targetBoard) {
                log(`⚠️ Não pode atacar aliados!`);
                return;
            }

            const targetBoardArray = targetBoard === 'player' ? playerBoard : enemyBoard;
            const setTargetBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;
            const targetUnit = targetBoardArray[targetIndex];

            if (targetUnit) {
                if (targetUnit.isIntangible) {
                    log('[VISAO] Efeito anulado por intangibilidade.');
                    return;
                }
                const newBoard = [...targetBoardArray];
                const damagedUnit = { ...targetUnit };
                const dmg = effectMode.damage || sourceUnit.currentAttack;
                const vespaDies = sourceUnit.card.id === '145' && dmg < targetUnit.currentHealth;

                damagedUnit.currentHealth -= dmg;
                damagedUnit.card = { ...damagedUnit.card, def: damagedUnit.currentHealth };

                // Processar morte simples (sem triggers complexos por enquanto)
                if (damagedUnit.currentHealth <= 0) {
                    newBoard[targetIndex] = null;
                    log(`⚔️ Zoro cortou ${damagedUnit.card.name}! (-${dmg}) [Destruído]`);
                } else {
                    newBoard[targetIndex] = damagedUnit;
                    log(`⚔️ Zoro cortou ${damagedUnit.card.name}! (-${dmg})`);
                }
                setTargetBoard(newBoard);

                if (vespaDies) {
                    const updatedSourceBoard = sourceBoard.map(unit => unit?.id === sourceUnit.id ? null : unit);
                    if (effectMode.sourceBoard === 'player') setPlayerBoard(updatedSourceBoard); else setEnemyBoard(updatedSourceBoard);
                    setEffectMode(null);
                    log('[VESPA] Vespa caiu ao atacar DEF maior. Combo interrompido.');
                    return;
                }

                const remaining = (effectMode.targetsLeft || 1) - 1;
                if (remaining > 0) {
                    setEffectMode({ ...effectMode, targetsLeft: remaining });
                    log(`⚔️ Selecione mais ${remaining} alvo(s)...`);
                } else {
                    if (sourceUnit.card.id === '145') {
                        const updatedSourceBoard = sourceBoard.map(unit => unit?.id === sourceUnit.id ? {
                            ...unit,
                            hasAttacked: true,
                            statusText: 'EXHAUSTED'
                        } : unit);
                        if (effectMode.sourceBoard === 'player') setPlayerBoard(updatedSourceBoard); else setEnemyBoard(updatedSourceBoard);
                        log('[VESPA] HB consumiu o ataque do turno.');
                    }
                    setEffectMode(null);
                    log(`⚔️ Combo de Zoro finalizado!`);
                }
            }
            return;
        }

        // 🌀 BORUTO BUFF ALLY CHECK
        if (effectMode?.type === 'estelar_destroy') {
            if (effectMode.sourceBoard === targetBoard) {
                log('[ESTELAR] Selecione um oponente.');
                return;
            }
            const targetBoardArray = targetBoard === 'player' ? playerBoard : enemyBoard;
            const setTargetBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;
            const setTargetGraveyard = targetBoard === 'player' ? setPlayerGraveyard : setEnemyGraveyard;
            const targetUnit = targetBoardArray[targetIndex];
            if (!targetUnit) return;
            if (targetUnit.isIntangible) {
                log('[VISAO] Efeito anulado por intangibilidade.');
                return;
            }
            const newBoard = targetBoardArray.map((unit, index) => index === targetIndex ? null : unit);
            setTargetBoard(newBoard);
            setTargetGraveyard(prev => [...prev, targetUnit.card]);
            const remaining = (effectMode.targetsLeft || 1) - 1;
            if (remaining > 0) {
                setEffectMode({ ...effectMode, targetsLeft: remaining });
                log(`[ESTELAR] Selecione mais ${remaining} oponente.`);
            } else {
                setEffectMode(null);
                log('[ESTELAR] Alvos eliminados.');
            }
            return;
        }

        if (effectMode?.type === 'buff_ally_atk') {
            // Evitar Buff em Inimigos
            if (effectMode.sourceBoard !== targetBoard) {
                log(`⚠️ Selecione um ALIADO!`);
                return;
            }

            const targetBoardArray = targetBoard === 'player' ? playerBoard : enemyBoard;
            const setTargetBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;
            const targetUnit = targetBoardArray[targetIndex];

            if (targetUnit) {
                const newBoard = [...targetBoardArray];
                const buffedUnit = { ...targetUnit };
                const bonus = effectMode.damage || 500;

                buffedUnit.currentAttack += bonus;
                buffedUnit.card.atk = buffedUnit.currentAttack;
                buffedUnit.statusText = `⚔️ +${bonus} ATK`;

                newBoard[targetIndex] = buffedUnit;
                setTargetBoard(newBoard);

                log(`🌀 Boruto concedeu +${bonus} ATK para ${buffedUnit.card.name}!`);
                setEffectMode(null);
            }
            return;
        }

        // Usar directSource se fornecido (auto-execução), caso contrário usar effectMode ou cardPopup
        let source: TestUnit | undefined = directSource;

        // Se não há directSource, tentar popover
        if (!source && cardPopup) {
            source = cardPopup.unit;
        }

        // Se ainda não há source, tentar effectMode
        if (!source && effectMode) {
            const sourceBoard = effectMode.sourceBoard === 'player' ? playerBoard : enemyBoard;
            source = sourceBoard.find(u => u?.id === effectMode.sourceId);
        }

        if (!source) {
            setEffectMode(null);
            return;
        }

        if (source.isSilenced) {
            log(`🔇 ${source.card.name} está silenciado e não pode usar efeitos!`);
            setEffectMode(null);
            setSelectedSlot(null);
            return;
        }

        // 🃏 CORINGA (ID 212) - Roubar carta da mão do oponente
        const isSourcePlayer = playerBoard.some(u => u?.id === source!.id);
        const sourceBoardState = isSourcePlayer ? playerBoard : enemyBoard;
        const opponentBoardState = isSourcePlayer ? enemyBoard : playerBoard;
        const setSourceBoardState = isSourcePlayer ? setPlayerBoard : setEnemyBoard;
        const setOpponentBoardState = isSourcePlayer ? setEnemyBoard : setPlayerBoard;
        if (opponentBoardState.some(unit => unit?.customState?.elmoNabuActive)) {
            log('Bloqueado por Nabu');
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }
        const updateSourceUnit = (updater: (unit: TestUnit) => TestUnit) => {
            setSourceBoardState(sourceBoardState.map(unit => unit?.id === source!.id ? updater(unit) : unit));
            setCardPopup(prev => prev?.unit.id === source!.id ? { ...prev, unit: updater(prev.unit) } : prev);
        };
        const removeOpponentById = (targetId: string) => {
            setOpponentBoardState(opponentBoardState.map(unit => unit?.id === targetId ? null : unit));
        };
        const damageOpponentById = (targetId: string, damage: number) => {
            setOpponentBoardState(opponentBoardState.map(unit => {
                if (!unit || unit.id !== targetId) return unit;
                const nextHealth = unit.currentHealth - damage;
                return nextHealth <= 0 ? null : {
                    ...unit,
                    currentHealth: nextHealth,
                    card: { ...unit.card, def: nextHealth }
                };
            }));
        };

        if (source.card.id === '212') {
            const newEnemyHand = [...enemyHand];
            const newPlayerHand = [...playerHand];

            // Encontrar cartas disponíveis na mão inimiga
            const enemyCards = newEnemyHand
                .map((card, idx) => ({ card, idx }))
                .filter(item => item.card !== null);

            if (enemyCards.length === 0) {
                log('⚠️ Coringa: Mão do oponente está vazia!');
                setEffectMode(null);
                if (cardPopup) setCardPopup(null);
                return;
            }

            // Escolher carta aleatória
            const randomChoice = enemyCards[Math.floor(Math.random() * enemyCards.length)];
            const stolenCard = randomChoice.card;
            const stolenIndex = randomChoice.idx;

            // Remover da mão inimiga
            newEnemyHand[stolenIndex] = null;

            // Adicionar na mão do jogador (primeiro slot vazio)
            const emptyPlayerSlot = newPlayerHand.findIndex(c => c === null);
            if (emptyPlayerSlot !== -1) {
                newPlayerHand[emptyPlayerSlot] = stolenCard;
            } else {
                log('⚠️ Sua mão está cheia! Carta descartada.');
            }

            // Atualizar estado
            setEnemyHand(newEnemyHand);
            setPlayerHand(newPlayerHand);

            log(`🃏 Coringa roubou: ${stolenCard.name} (ID ${stolenCard.id})!`);
            console.log('✅ Roubo completo:', { stolen: stolenCard.name, fromIndex: stolenIndex, toIndex: emptyPlayerSlot });

            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return; // Terminar execução para Coringa
        }

        // 🦇 ASA NOTURNA (ID 189) - Imune por 2T + ATK +50%
        if (source.card.id === '189') {
            const sourceBoard = playerBoard.includes(source as any) ? playerBoard : enemyBoard;
            const setSourceBoard = playerBoard.includes(source as any) ? setPlayerBoard : setEnemyBoard;
            const sourceIndex = sourceBoard.findIndex(u => u?.id === source.id);

            if (sourceIndex !== -1 && sourceBoard[sourceIndex]) {
                const newBoard = [...sourceBoard];
                const unit = { ...newBoard[sourceIndex]! };

                // Guardar ATK original para reversão
                if (!unit.originalAttack) {
                    unit.originalAttack = unit.currentAttack;
                }

                // Aumentar ATK em 50%
                unit.currentAttack = Math.floor(unit.originalAttack * 1.5);

                // Aplicar status de imunidade
                unit.statusEffect = 'immune';
                unit.effectTurns = 2;
                unit.statusText = '🛡️ IMUNE';

                newBoard[sourceIndex] = unit;
                setSourceBoard(newBoard);

                log(`🦇 Asa Noturna ativou: +50% ATK (${unit.currentAttack}) e IMUNIDADE por 2 turnos!`);
                saveHistory(playerBoard, enemyBoard, playerHand);
            }

            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🎃 DUENDE VERDE (ID 191) - Destruir ATÉ 2 alvos com DEF < 1000
        if (source.card.id === '191') {
            const targetBoardArray = targetBoard === 'player' ? playerBoard : enemyBoard;
            const setTargetBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;
            const target = targetBoardArray[targetIndex];

            // 🚫 BLOQUEIO DE FRIENDLY FIRE
            if (targetBoard === 'player') {
                log(`⚠️ Duende Verde não pode destruir aliados!`);
                // Não encerrar o modo effect
                return;
            }

            // Tentar destruir alvo
            if (target && target.currentHealth < 1000) {
                const newBoard = [...targetBoardArray];
                newBoard[targetIndex] = null;
                setTargetBoard(newBoard);

                const newCount = goblinTargetsDestroyed + 1;
                setGoblinTargetsDestroyed(newCount);

                log(`🎃 Duende Verde eliminou ${target.card.name} (DEF ${target.currentHealth} < 1000)! [${newCount}/2]`);

                // Se houver mais mortes a processar, chamar handleCardDeath (simulado)
                // handleCardDeath(targetBoard, targetIndex, 'battle'); // Não chamamos aqui para evitar conflito de estado, mas o ideal seria.

                saveHistory(playerBoard, enemyBoard, playerHand);

                // Se destruiu 2 alvos, encerrar modo
                if (newCount >= 2) {
                    log(`✅ Duende Verde completou sua habilidade (2/2 alvos destruídos).`);
                    setEffectMode(null);
                    setGoblinTargetsDestroyed(0);
                    if (cardPopup) setCardPopup(null);
                } else {
                    // Continuar no modo de seleção
                    log(`🎯 Selecione mais 1 alvo (DEF < 1000) ou clique em "CANCELAR SELEÇÃO".`);
                    // NÃO limpar effectMode
                }
                return;
            } else if (target) {
                log(`⚠️ Duende Verde: ${target.card.name} tem DEF muito alta (${target.currentHealth})!`);
                // Não encerrar o modo, permite tentar outro alvo
                return;
            }

            // Se clicou em slot vazio, ignorar
            return;
        }

        // 💀 CAVEIRA VERMELHA (ID 190) - ATIVAÇÃO MANUAL
        if (source.card.id === '190') {
            // Determinar qual board a carta está
            let sourceBoard: TestSlot[];
            let setSourceBoard: (board: TestSlot[]) => void;
            let boardType: 'player' | 'enemy';

            // Verificar se está no campo do jogador
            const playerIndex = playerBoard.findIndex(u => u?.id === source.id);
            if (playerIndex !== -1) {
                sourceBoard = playerBoard;
                setSourceBoard = setPlayerBoard;
                boardType = 'player';
            } else {
                // Está no campo inimigo
                sourceBoard = enemyBoard;
                setSourceBoard = setEnemyBoard;
                boardType = 'enemy';
            }

            const sourceIndex = sourceBoard.findIndex(u => u?.id === source.id);

            if (sourceIndex !== -1) {
                const newBoard = [...sourceBoard];
                const caveira = { ...newBoard[sourceIndex]! };
                caveira.isReady = true;
                caveira.statusText = '💥 PRONTO';
                newBoard[sourceIndex] = caveira;
                setSourceBoard(newBoard);

                log(`💀 Caveira Vermelha está pronto para o abate!`);

                // Salvar histórico
                if (boardType === 'player') {
                    saveHistory(newBoard, enemyBoard, playerHand);
                } else {
                    saveHistory(playerBoard, newBoard, playerHand);
                }
            }

            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🌳 GROOT (ID 193) - PASSIVA (não usa botão USAR EFEITO)
        // A passiva é ativada automaticamente quando morre (ver executeAttack)
        if (source.card.id === '193') {
            log(`⚠️ Groot tem habilidade PASSIVA. Renascerá automaticamente ao morrer (uma vez).`);
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🏹 GAVIÃO ARQUEIRO (ID 194) - Dano Fixo de 1500 (Ignora DEF/Escudo)
        if (source.card.id === '194') {
            const targetBoardArray = targetBoard === 'player' ? playerBoard : enemyBoard;
            const setTargetBoard = targetBoard === 'player' ? setPlayerBoard : setEnemyBoard;
            const target = targetBoardArray[targetIndex];

            if (target) {
                const newBoard = [...targetBoardArray];
                const damagedUnit = { ...target };

                // Dano fixo de 1500 direto no HP
                damagedUnit.currentHealth -= 1500;

                if (damagedUnit.currentHealth <= 0) {
                    newBoard[targetIndex] = null;
                    log(`🏹 Gavião Arqueiro disparou uma flecha certeira! ${target.card.name} foi eliminado com 1500 de dano! 💀`);
                } else {
                    damagedUnit.card = { ...damagedUnit.card, def: damagedUnit.currentHealth };
                    newBoard[targetIndex] = damagedUnit;
                    log(`🏹 Gavião Arqueiro disparou uma flecha certeira em ${target.card.name}! 1500 de dano causado! HP restante: ${damagedUnit.currentHealth}`);
                }

                setTargetBoard(newBoard);
                saveHistory(playerBoard, enemyBoard, playerHand);
            }

            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🎭 MYSTERIO (ID 195) - Ganhar 2 contadores de Ilusão
        if (source.card.id === '195') {
            // Determinar qual board a carta está
            let sourceBoard: TestSlot[];
            let setSourceBoard: (board: TestSlot[]) => void;
            let boardType: 'player' | 'enemy';

            // Verificar se está no campo do jogador
            const playerIndex = playerBoard.findIndex(u => u?.id === source.id);
            if (playerIndex !== -1) {
                sourceBoard = playerBoard;
                setSourceBoard = setPlayerBoard;
                boardType = 'player';
            } else {
                // Está no campo inimigo
                sourceBoard = enemyBoard;
                setSourceBoard = setEnemyBoard;
                boardType = 'enemy';
            }

            const sourceIndex = sourceBoard.findIndex(u => u?.id === source.id);

            if (sourceIndex !== -1) {
                const newBoard = [...sourceBoard];
                const mysterio = { ...newBoard[sourceIndex]! };

                // Adicionar 2 contadores de Ilusão
                mysterio.charges = 2;
                mysterio.illusionCounters = undefined;
                mysterio.isReady = true;
                mysterio.statusText = '✨ ILUSÃO (2)';
                mysterio.statusText = 'MYSTERIO (2)';
                mysterio.statusEffect = 'illusion';

                newBoard[sourceIndex] = mysterio;
                setSourceBoard(newBoard);

                log(`🎭 Mysterio ativou Ilusões! 2 contadores disponíveis para bloquear ataques.`);

                // Salvar histórico
                if (boardType === 'player') {
                    saveHistory(newBoard, enemyBoard, playerHand);
                } else {
                    saveHistory(playerBoard, newBoard, playerHand);
                }
            }

            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }


        // 🦝 ROCKET RACCOON (ID 192) - Reduz DEF de todos em 50%, destroi se DEF < 600
        if (source.card.id === '192') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetBoard = isPlayerSource ? enemyBoard : playerBoard;
            const setTargetBoard = isPlayerSource ? setEnemyBoard : setPlayerBoard;

            let newBoard = [...targetBoard];
            let destroyed = 0;

            newBoard = newBoard.map(unit => {
                if (!unit) return unit;

                // Reduzir DEF em 50%
                const newUnit = { ...unit };
                newUnit.currentHealth = Math.floor(newUnit.currentHealth * 0.5);
                newUnit.card = { ...newUnit.card, def: newUnit.currentHealth };

                // Destruir se DEF < 600
                if (newUnit.currentHealth < 600) {
                    destroyed++;
                    log(`💥 ${newUnit.card.name} destruído por Rocket Raccoon (DEF ${newUnit.currentHealth} < 600)!`);
                    return null;
                }

                return newUnit;
            });

            setTargetBoard(newBoard);
            log(`🦝 Rocket Raccoon reduziu DEF de todos em 50% e eliminou ${destroyed} carta(s)!`);
            saveHistory(playerBoard, enemyBoard, playerHand);

            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🛡️ CAPITÃO AMÉRICA (ID 160) - Ativar Postura Defensiva
        if (source.card.id === '160') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setTargetBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            const newBoard = [...targetBoard];
            const sourceIndex = newBoard.findIndex(u => u?.id === source.id);

            if (sourceIndex !== -1 && newBoard[sourceIndex]) {
                const cap = { ...newBoard[sourceIndex]! };
                cap.isReady = true;
                cap.statusText = '🛡️ PRONTO (2)';
                cap.statusEffect = 'guard'; // Brilho roxo/azul
                cap.charges = 2; // Cargas V4.2
                newBoard[sourceIndex] = cap;
                setTargetBoardFn(newBoard);
                log(`🛡️ Capitão América assumiu postura defensiva! (Refletirá o próximo ataque)`);
            }

            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🧪 SHURI (ID 161) - +50% DEF em Área (FIX)
        if (source.card.id === '161') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetAllowedBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setTargetBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            const newBoard = targetAllowedBoard.map(unit => {
                if (!unit) return null;
                const bonus = Math.floor(unit.currentHealth * 0.5);
                return {
                    ...unit,
                    currentHealth: unit.currentHealth + bonus,
                    card: { ...unit.card, def: unit.currentHealth + bonus },
                    statusText: '🛡️ DEF UP (3T)',
                    statusEffect: 'buff',
                    effectTurns: 3,
                    buffValue: bonus // Salvar valor exato para reversão
                };
            });

            setTargetBoardFn(newBoard);
            log(`🧪 Shuri fortaleceu todas as defesas aliadas em +50%!`);
            saveHistory(playerBoard, enemyBoard, playerHand);
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // ⚔️ ZORO (ID 131) - +500 ATK + 3 Alvos
        if (source.card.id === '131') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetAllowedBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setTargetBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            const newBoard = [...targetAllowedBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && newBoard[idx]) {
                const zoro = { ...newBoard[idx]! };
                if (zoro.originalAttack === undefined) zoro.originalAttack = zoro.currentAttack;
                zoro.currentAttack += 500;
                zoro.card = { ...zoro.card, atk: zoro.currentAttack };
                zoro.statusText = '⚔️ SANTORYU (2T)';
                zoro.effectTurns = 2;
                newBoard[idx] = zoro;
                setTargetBoardFn(newBoard);

                log(`⚔️ Zoro ativou Santoryu! +500 ATK.`);

                // MODO SELEÇÃO MULTIPLA
                setEffectMode({
                    sourceId: source.id,
                    sourceBoard: cardPopup!.board,
                    type: 'multi_target_damage',
                    targetsLeft: 3,
                    damage: zoro.currentAttack
                });
                log(`⚔️ Zoro: Selecione até 3 alvos inimigos!`);
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🕸️ HOMEM-ARANHA (ID 139) - Stun Global + Buff
        const block6Ids = ['25', '26', '27', '31', '33', '34', '36', '49', '50', '51', '52', '55', '56', '57', '59', '60', '63', '76', '77', '88', '89', '90', '91', '93', '94', '95', '128', '130'];
        if (block6Ids.includes(source.card.id)) {
            const id = source.card.id;
            const close = () => {};
            if (id === '25') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, currentAttack: unit.currentAttack * 2, isImmune: true, effectTurns: 3, statusText: 'PRIME 3T', customState: { ...(unit.customState || {}), bypassShields: true }, card: { ...unit.card, atk: unit.currentAttack * 2 } })); close(); return; }
            if (id === '26') {
                if (!source.customState?.uiKamehamehaActive) {
                    updateSourceUnit(unit => ({ ...unit, isReady: true, isImmune: true, statusEffect: 'immune', effectTurns: 3, statusText: 'UI 3T', counters: { ...(unit.counters || {}), dodge: 3 }, customState: { ...(unit.customState || {}), uiKamehamehaActive: true } }));
                    console.log('[B-26] Goku UI ativou imunidade real', { sourceId: source.card.id });
                    close(); return;
                }
                if (source.customState?.uiKamehamehaUsed) {
                    log('[GOKU UI] Kamehameha ja foi usado.');
                    close(); return;
                }
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => {
                    setOpponentBoardState(prev => prev.map(unit => unit?.id === targetId && !unit.isImmune && unit.statusEffect !== 'immune' ? null : unit));
                    updateSourceUnit(unit => ({ ...unit, customState: { ...(unit.customState || {}), uiKamehamehaUsed: true } }));
                    setInteractionMode({ type: 'IDLE' });
                } });
                close(); return;
            }
            if (id === '27') { updateSourceUnit(unit => ({ ...unit, effectTurns: 2, statusText: 'UE 2T', customState: { ...(unit.customState || {}), ultraEgoActive: true } })); close(); return; }
            if (id === '31') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, currentAttack: Math.floor(unit.currentAttack * 1.5), effectTurns: 3, statusText: 'JIREN 3T', customState: { ...(unit.customState || {}), damageReduction: 0.5 }, card: { ...unit.card, atk: Math.floor(unit.currentAttack * 1.5) } })); setOpponentBoardState(opponentBoardState.map(unit => unit ? { ...unit, isSilenced: true, effectTurns: 3, statusText: 'SILENCED' } : unit)); close(); return; }
            if (id === '33') {
                updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, originalHealth: unit.originalHealth ?? unit.currentHealth, currentAttack: unit.currentAttack * 2, currentHealth: unit.currentHealth * 2, effectTurns: 3, statusText: 'FREEZA STANCE', customState: { ...(unit.customState || {}), freezaStance: true }, card: { ...unit.card, atk: unit.currentAttack * 2, def: unit.currentHealth * 2 } })); close(); return;
            }
            if (id === '34') {
                if ((source.customState?.cooldown || 0) > 0) { log('[SAITAMA] Cooldown ativo.'); close(); return; }
                const selectSaitamaTarget = (targetId: string) => {
                    const target = opponentBoardState.find(unit => unit?.id === targetId);
                    const baseTarget = target ? initialCards.find(card => card.id === target.card.id) : undefined;
                    const targetAttack = Math.max(target?.currentAttack || 0, baseTarget?.atk || 0);
                    if (target && (target.card.rarity === 'Supremo' || targetAttack >= 3200)) {
                        log('[SAITAMA] Alvo Divino/Supremo bloqueado. Escolha outro alvo.');
                        return;
                    }
                    updateSourceUnit(unit => ({ ...unit, customState: { ...(unit.customState || {}), cooldown: 4 }, statusText: 'CD 4T' }));
                    removeOpponentById(targetId);
                    console.log('[B-34] Saitama eliminou alvo', { targetId });
                    setInteractionMode({ type: 'IDLE' });
                };
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectSaitamaTarget });
                close(); return;
            }
            if (id === '36') {
                if (!source.customState?.thorManual) {
                    updateSourceUnit(unit => ({ ...unit, effectTurns: 2, statusText: 'THOR 2T', customState: { ...(unit.customState || {}), thorManual: true, thorManualUsed: false } }));
                    setOpponentBoardState(prev => prev.map(unit => unit ? { ...unit, isSilenced: true, effectTurns: 2, statusText: 'SILENCED' } : unit));
                    close(); return;
                }
                if (source.customState?.thorManualUsed) {
                    log('[THOR] Eliminacao ja foi usada.');
                    close(); return;
                }
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => {
                    setOpponentBoardState(prev => prev.map(unit => unit?.id === targetId ? null : unit));
                    updateSourceUnit(unit => ({ ...unit, customState: { ...(unit.customState || {}), thorManualUsed: true } }));
                    console.log('[B-36] Thor eliminou 1 alvo', { targetId });
                    setInteractionMode({ type: 'IDLE' });
                } });
                close(); return;
            }
            if (id === '49') {
                const selectedTargets: string[] = [];
                let firstTargetAtk = 0;
                const selectMarvelTarget = (targetId: string) => {
                    const target = opponentBoardState.find(unit => unit?.id === targetId);
                    const targetLevel = target?.card.level ?? target?.card.stars;
                    if (!target || targetLevel === undefined || targetLevel > 7) {
                        log('Alvo invalido! Somente nivel/estrelas 7 ou inferior.');
                        setTimeout(() => setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectMarvelTarget }), 0);
                        return;
                    }
                    if (!selectedTargets.includes(targetId)) {
                        selectedTargets.push(targetId);
                        if (selectedTargets.length === 1) firstTargetAtk = target.currentAttack;
                    }
                    setOpponentBoardState(prev => prev.map(unit => unit?.id === targetId ? null : unit));
                    if (selectedTargets.length >= 3 || opponentBoardState.filter(u => {
                        const level = u?.card.level ?? u?.card.stars;
                        return u && level !== undefined && level <= 7 && !selectedTargets.includes(u.id);
                    }).length === 0) {
                        updateSourceUnit(unit => ({ ...unit, currentAttack: unit.currentAttack + firstTargetAtk, card: { ...unit.card, atk: unit.currentAttack + firstTargetAtk } }));
                        setInteractionMode({ type: 'IDLE' });
                        log(`[CAPITA] Explosao de Fotons! Eliminou alvos e ganhou +${firstTargetAtk} AT.`);
                    } else {
                        setTimeout(() => setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectMarvelTarget }), 0);
                        log(`[CAPITA] Selecione mais ${3 - selectedTargets.length} alvo(s) ou cancele.`);
                    }
                };
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectMarvelTarget });
                close(); return;
            }
            if (id === '50') {
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => {
                    const target = opponentBoardState.find(unit => unit?.id === targetId);
                    if (!target) { setInteractionMode({ type: 'IDLE' }); return; }
                    const subType = String(target.card.subType || '').toLowerCase();
                    const isMagicTarget = !!target.card.isMagic || !!target.card.isMagical || subType.includes('magico') || target.card.id === '169';
                    updateSourceUnit(unit => ({ ...unit, customState: { ...(unit.customState || {}), stolenAbilityCardId: target.card.id, stolenAbilityDescription: target.card.description } }));
                    setOpponentBoardState(prev => prev.map(unit => {
                        if (unit?.id !== targetId) return unit;
                        const nextAttack = isMagicTarget ? Math.floor(unit.currentAttack * 0.5) : unit.currentAttack;
                        const nextHealth = isMagicTarget ? Math.floor(unit.currentHealth * 0.5) : unit.currentHealth;
                        return { ...unit, currentAttack: nextAttack, currentHealth: nextHealth, isSilenced: true, customState: { ...(unit.customState || {}), hbDisabled: true }, statusText: isMagicTarget ? 'HB OFF / 50%' : 'HB OFF', card: { ...unit.card, atk: nextAttack, def: nextHealth } };
                    }));
                    setInteractionMode({ type: 'IDLE' });
                } });
                close(); return;
            }
            if (id === '51') {
                const cyberIds = ['89', '61', '62', '65'];
                setOpponentBoardState(prev => prev.map(unit => unit && cyberIds.includes(unit.card.id) ? null : unit));
                const selectedTargets: string[] = [];
                const selectMagnetoTarget = (targetId: string) => {
                    if (!selectedTargets.includes(targetId)) selectedTargets.push(targetId);
                    setOpponentBoardState(prev => prev.map(unit => unit && unit.id === targetId ? { ...unit, isStunned: true, effectTurns: 2, statusText: 'Magnetizado' } : unit));
                    console.log('[B-51] Magneto paralisou alvo imediatamente', { targetId });
                    if (selectedTargets.length >= 2) {
                        updateSourceUnit(unit => ({ ...unit, effectTurns: 2, statusText: 'MAGNETO 2T', customState: { ...(unit.customState || {}), magnetoAffectedIds: [...selectedTargets] } }));
                        setInteractionMode({ type: 'IDLE' });
                    } else {
                        setTimeout(() => setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectMagnetoTarget }), 0);
                            log('Magnetizado. Selecione mais 1 alvo.');
                    }
                };
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectMagnetoTarget });
                close(); return;
            }
            if (id === '52') {
                setSourceBoardState(sourceBoardState.map(unit => {
                    if (!unit) return unit;
                    if (unit.id === source!.id) {
                        return { ...unit, originalHealth: unit.originalHealth ?? unit.currentHealth, currentHealth: unit.currentHealth * 2, effectTurns: 3, statusText: 'NABU 3T', customState: { ...(unit.customState || {}), elmoNabuActive: true }, card: { ...unit.card, def: unit.currentHealth * 2 } };
                    } else {
                        return { ...unit, originalHealth: unit.originalHealth ?? unit.currentHealth, currentHealth: unit.currentHealth * 2, statusText: 'NABU', card: { ...unit.card, def: unit.currentHealth * 2 } };
                    }
                }));
                close(); return;
            }
            if (id === '55') { updateSourceUnit(unit => ({ ...unit, effectTurns: 3, statusText: 'MORO 3T', customState: { ...(unit.customState || {}), moroReactive: true } })); setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => { const target = opponentBoardState.find(unit => unit?.id === targetId); if (target) { updateSourceUnit(unit => ({ ...unit, currentAttack: unit.currentAttack + target.currentAttack, card: { ...unit.card, atk: unit.currentAttack + target.currentAttack } })); setOpponentBoardState(opponentBoardState.map(unit => unit?.id === targetId ? { ...unit, currentAttack: 0, card: { ...unit.card, atk: 0 } } : unit)); } setInteractionMode({ type: 'IDLE' }); } }); close(); return; }
            if (id === '56') {
                const charges = source.customState?.hitCharges ?? 2;
                if (charges <= 0) { log('[HIT] Sem cargas.'); close(); return; }
                updateSourceUnit(unit => ({ ...unit, isReady: true, charges, statusText: `HIT ${charges}`, customState: { ...(unit.customState || {}), hitCharges: charges, hitStance: true } }));
                close(); return;
            }
            if (id === '57') { updateSourceUnit(unit => ({ ...unit, isImmune: true, effectTurns: 3, statusText: 'TOPPO 3T' })); setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => { removeOpponentById(targetId); setInteractionMode({ type: 'IDLE' }); } }); close(); return; }
            if (id === '59') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, currentAttack: unit.currentAttack + 1000, effectTurns: 3, statusText: 'ROSE 3T', card: { ...unit.card, atk: unit.currentAttack + 1000 } })); setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => { damageOpponentById(targetId, 1500); setInteractionMode({ type: 'IDLE' }); } }); close(); return; }
            if (id === '60') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, currentAttack: Math.floor(unit.currentAttack * 1.5), statusText: 'ORANGE', customState: { ...(unit.customState || {}), damageReduction: 0.5, attackCostDef: 500 }, card: { ...unit.card, atk: Math.floor(unit.currentAttack * 1.5) } })); close(); return; }
            if (id === '63') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, currentAttack: Math.floor(unit.currentAttack * 1.5), effectTurns: 2, statusText: 'NEXT BLAST', customState: { ...(unit.customState || {}), delayedDamage: 1500 }, card: { ...unit.card, atk: Math.floor(unit.currentAttack * 1.5) } })); close(); return; }
            if (id === '76') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, currentAttack: Math.floor(unit.currentAttack * 1.5), isImmune: true, effectTurns: 3, statusText: 'NARUTO 3T', card: { ...unit.card, atk: Math.floor(unit.currentAttack * 1.5) } })); close(); return; }
            if (id === '77') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, originalHealth: unit.originalHealth ?? unit.currentHealth, currentAttack: 2500, currentHealth: 0, effectTurns: 3, statusText: 'SUSANOO 3T', customState: { ...(unit.customState || {}), reflectPlus: 900 }, card: { ...unit.card, atk: 2500, def: 0 } })); close(); return; }
            if (id === '88') { setOpponentBoardState(prev => prev.map(unit => unit && (unit.currentAttack <= 900 || unit.currentHealth <= 900) ? null : unit)); close(); return; }
            if (id === '89') {
                updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, originalHealth: unit.originalHealth ?? unit.currentHealth, currentAttack: Math.floor(unit.currentAttack * 1.5), currentHealth: Math.floor(unit.currentHealth * 1.5), effectTurns: 3, statusText: 'UPGRADE 3T', card: { ...unit.card, atk: Math.floor(unit.currentAttack * 1.5), def: Math.floor(unit.currentHealth * 1.5) } }));
                setOpponentBoardState(prev => prev.map(unit => {
                    if (!unit) return unit;
                    const subType = String(unit.card.subType || '').toLowerCase();
                    const isCybernetic = !!unit.card.isCyborg || !!unit.card.isCybernetic || subType.includes('cibernetico') || unit.card.id === '61' || unit.card.id === '62';
                    return isCybernetic ? { ...unit, isStunned: true, isSilenced: true, effectTurns: 3, statusText: 'CYBER OFF' } : unit;
                }));
                close(); return;
            }
            if (id === '90') {
                if (!source.customState?.lanternManual) {
                    updateSourceUnit(unit => ({ ...unit, effectTurns: 3, statusText: 'LANTERN MANUAL 3T', customState: { ...(unit.customState || {}), lanternManual: true } }));
                    console.log('[B-90] Lanterna Verde armado para AT manual', { sourceId: source.card.id });
                    close(); return;
                }
                if (source.customState?.lanternAttackedThisTurn) {
                    log('[LANTERNA VERDE] Ataque extra já foi usado neste turno!');
                    close(); return;
                }
                if (currentTurn !== 'player' && isSourcePlayer) {
                    log('[LANTERNA VERDE] Aguarde um ataque para escolher a defesa no card.');
                    close(); return;
                }
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => {
                    setOpponentBoardState(prev => prev.map(unit => {
                        if (unit?.id !== targetId) return unit;
                        const nextHealth = unit.currentHealth - 1200;
                        return nextHealth <= 0 ? null : { ...unit, currentHealth: nextHealth, card: { ...unit.card, def: nextHealth } };
                    }));
                    updateSourceUnit(unit => ({ ...unit, customState: { ...(unit.customState || {}), lanternAttackedThisTurn: true } }));
                    console.log('[B-90] Lanterna Verde disparou AT manual de 1200', { targetId });
                    setInteractionMode({ type: 'IDLE' });
                } });
                close(); return;
            }
            if (id === '130') {
                updateSourceUnit(unit => ({ ...unit, isImmune: true, effectTurns: 4, statusText: 'COSMI-ROD 4T' }));
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => {
                    removeOpponentById(targetId);
                    setInteractionMode({ type: 'IDLE' });
                } });
                close(); return;
            }
            if (id === '91') { setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => { const target = opponentBoardState.find(unit => unit?.id === targetId); if (target) { const absorb = Math.floor(target.currentHealth * 0.5); setOpponentBoardState(opponentBoardState.map(unit => unit?.id === targetId ? { ...unit, currentHealth: unit.currentHealth - absorb, isStunned: true, effectTurns: 2, statusText: 'STUN 2T', card: { ...unit.card, def: unit.currentHealth - absorb } } : unit)); updateSourceUnit(unit => ({ ...unit, currentHealth: unit.currentHealth + absorb, card: { ...unit.card, def: unit.currentHealth + absorb } })); } setInteractionMode({ type: 'IDLE' }); } }); close(); return; }
            if (id === '93') {
                if (!source.customState?.helaActive) {
                    const baseHela = initialCards.find(card => card.id === '93');
                    updateSourceUnit(unit => ({ ...unit, originalAttack: baseHela?.atk ?? unit.currentAttack, effectTurns: 3, statusText: 'HELA 3T', customState: { ...(unit.customState || {}), helaActive: true, helaStealUsed: false, helaAtkBonusPercent: 0 } }));
                    close(); return;
                }
                if (source.customState?.helaStealUsed) { log('[HELA] Roubo ja foi usado.'); close(); return; }
                const graveyard = isSourcePlayer ? enemyGraveyard : playerGraveyard;
                if (graveyard.length === 0) { log('[HELA] Cemiterio vazio.'); close(); return; }
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => {
                    const sacrificedIndex = sourceBoardState.findIndex(unit => unit?.id === targetId && unit.id !== source.id);
                    if (sacrificedIndex === -1) { setInteractionMode({ type: 'IDLE' }); return; }
                    setShowGraveyard(isSourcePlayer ? 'enemy' : 'player');
                    setGraveyardSelectorMode({
                        title: 'HELA: ROUBE 1 CARTA DO CEMITERIO INIMIGO',
                        onSelect: (card) => {
                            const revived = createUnit(card);
                            setSourceBoardState(prev => prev.map((unit, index) => {
                                if (index === sacrificedIndex) return revived;
                                if (unit?.id === source.id) {
                                    return { ...unit, customState: { ...(unit.customState || {}), helaActive: true, helaStealUsed: true }, statusText: 'HELA 3T' };
                                }
                                return unit;
                            }));
                            if (isSourcePlayer) setEnemyGraveyard(prev => prev.filter(graveCard => graveCard !== card));
                            else setPlayerGraveyard(prev => prev.filter(graveCard => graveCard !== card));
                            console.log('[B-93] Hela roubou carta do cemiterio inimigo', { revivedId: revived.card.id, sacrificeTargetId: targetId });
                        }
                    });
                    setInteractionMode({ type: 'IDLE' });
                } });
                close(); return;
            }
            if (id === '94') { setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => { const target = opponentBoardState.find(unit => unit?.id === targetId); if (target?.card.universe) setOpponentBoardState(opponentBoardState.map(unit => unit?.card.universe === target.card.universe ? null : unit)); setInteractionMode({ type: 'IDLE' }); } }); close(); return; }
            if (id === '95') {
                const selectedTargets: string[] = [];
                const selectRavenaTarget = (targetId: string) => {
                    if (!selectedTargets.includes(targetId)) selectedTargets.push(targetId);
                    if (selectedTargets.length >= 2) {
                        const targets = opponentBoardState.filter((unit): unit is TestUnit => !!unit && selectedTargets.includes(unit.id));
                        const bonus = targets.reduce((sum, unit) => sum + unit.currentAttack, 0);
                        const storedTargets = targets.map(unit => ({ id: unit.id, stolen: unit.currentAttack, remaining: unit.currentAttack }));
                        setOpponentBoardState(prev => prev.map(unit => unit && selectedTargets.includes(unit.id) ? {
                            ...unit,
                            originalAttack: unit.originalAttack ?? unit.currentAttack,
                            currentAttack: 0,
                            isSilenced: true,
                            effectTurns: 2,
                            statusText: 'AT ABSORVIDO',
                            customState: {
                                ...(unit.customState || {}),
                                ravenaAbsorbed: true,
                                ravenaSourceId: source.id
                            },
                            card: { ...unit.card, atk: 0 }
                        } : unit));
                        updateSourceUnit(unit => ({
                            ...unit,
                            originalHealth: unit.originalHealth ?? unit.currentHealth,
                            currentHealth: unit.currentHealth + bonus,
                            effectTurns: 2,
                            statusText: 'RAVENA 2T',
                            customState: {
                                ...(unit.customState || {}),
                                ravenaAbsorptionTargets: storedTargets
                            },
                            card: { ...unit.card, def: unit.currentHealth + bonus }
                        }));
                        console.log('[B-95] Ravena absorveu e subtraiu AT dos alvos', { selectedTargets, bonus });
                        setInteractionMode({ type: 'IDLE' });
                    } else {
                        setTimeout(() => setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectRavenaTarget }), 0);
                        log('[RAVENA] Selecione mais 1 alvo.');
                    }
                };
                setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: selectRavenaTarget });
                close(); return;
            }
            if (id === '128') { updateSourceUnit(unit => ({ ...unit, originalAttack: unit.originalAttack ?? unit.currentAttack, currentAttack: unit.currentAttack * 2, effectTurns: 2, statusText: 'WOLVERINE 2T', customState: { ...(unit.customState || {}), wolverineSurvive: true }, card: { ...unit.card, atk: unit.currentAttack * 2 } })); close(); return; }
        }

        if (source.card.id === '139') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetBoard = isPlayerSource ? enemyBoard : playerBoard;
            const setTargetBoardFn = isPlayerSource ? setEnemyBoard : setPlayerBoard;
            const myBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setMyBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            // Stun Inimigos
            const newTargetBoard = targetBoard.map(u => {
                if (!u) return null;
                return { ...u, isStunned: true, isSilenced: true, effectTurns: 3, statusText: 'STUN/SILENCE (3T)', statusEffect: 'stun' };
            });
            setTargetBoardFn(newTargetBoard);

            // Buff Self
            const myNewBoard = [...myBoard];
            const idx = myNewBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && myNewBoard[idx]) {
                const spidey = { ...myNewBoard[idx]! };
                if (spidey.originalAttack === undefined) spidey.originalAttack = spidey.currentAttack;
                spidey.currentAttack = Math.floor(spidey.currentAttack * 1.5);
                spidey.card = { ...spidey.card, atk: spidey.currentAttack };
                spidey.effectTurns = 3;
                myNewBoard[idx] = spidey;
                setMyBoardFn(myNewBoard);
            }

            log(`🕸️ Homem-Aranha prendeu todos os inimigos e ganhou +50% ATK!`);
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🧶 HOMEM ELÁSTICO (ID 162) - Ativar Postura
        if (source.card.id === '162') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setTargetBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            const newBoard = [...targetBoard];
            const sourceIndex = newBoard.findIndex(u => u?.id === source.id);

            if (sourceIndex !== -1 && newBoard[sourceIndex]) {
                const reed = { ...newBoard[sourceIndex]! };
                reed.isReady = true;
                reed.statusText = '🛡️ EM GUARDA (2)';
                reed.statusEffect = 'guard'; // Brilho
                reed.charges = 2; // Cargas V4.2
                // Não consome carga na ativação para permitir standby
                newBoard[sourceIndex] = reed;
                setTargetBoardFn(newBoard);
                log(`🧶 Homem Elástico entrou em Postura de Guarda!`);
                saveHistory(playerBoard, enemyBoard, playerHand);
            }
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // ⚡ GOTEN (ID 133) - 2 Ataques
        if (source.card.id === '133') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setTargetBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            const idx = targetBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && targetBoard[idx]) {
                const goten = { ...targetBoard[idx]! };
                goten.maxAttacks = 2;
                goten.statusText = '⚡ 2 ATAQUES';
                const newBoard = [...targetBoard];
                newBoard[idx] = goten;
                setTargetBoardFn(newBoard);
                log(`⚡ Goten se transformou! Pode atacar 2x neste turno.`);
            }
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }


        // 🌀 BORUTO (ID 136) - Karma Absorbão (V4.8)
        if (source.card.id === '136') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const tBoard = isPlayer ? enemyBoard : playerBoard;
            const setTBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;

            // Ativar modo de mira: aguardar clique no alvo
            setEffectMode({
                sourceId: source.id,
                sourceBoard: isPlayer ? 'player' : 'enemy',
                type: 'boruto_karma',
                customCallback: (tBoardKey: 'player' | 'enemy', tIdx: number) => {
                    const currentTBoard = tBoardKey === 'player' ? playerBoard : enemyBoard;
                    const setCurrentTBoard = tBoardKey === 'player' ? setPlayerBoard : setEnemyBoard;
                    const currentMyBoard = tBoardKey === 'player' ? enemyBoard : playerBoard;
                    const setCurrentMyBoard = tBoardKey === 'player' ? setEnemyBoard : setPlayerBoard;

                    const tUnit = currentTBoard[tIdx];
                    if (!tUnit) return;

                    if (tUnit.statusEffect === 'karma_mark') {
                        // T2: Destruir alvo + abrir mira para buff aliado
                        const newTBoard = [...currentTBoard];
                        newTBoard[tIdx] = null;
                        setCurrentTBoard(newTBoard);
                        log(`🌀 Boruto detonou o Karma! ${tUnit.card.name} destruído!`);

                        // Abrir mira para dar +500 ATK a um aliado
                        setEffectMode({
                            sourceId: source.id,
                            sourceBoard: isPlayer ? 'player' : 'enemy',
                            type: 'buff_ally_atk',
                            damage: 500
                        });
                        log(`🌀 Boruto: Selecione um ALIADO para receber +500 ATK!`);
                    } else {
                        // T1: Roubar ATK e DEF do alvo
                        const stolenAtk = tUnit.currentAttack;
                        const stolenDef = tUnit.currentHealth;

                        // Zerar o alvo
                        const newTBoard = [...currentTBoard];
                        const markedUnit = { ...tUnit };
                        markedUnit.currentAttack = 0;
                        markedUnit.card = { ...markedUnit.card, atk: 0 };
                        markedUnit.currentHealth = Math.max(1, Math.floor(stolenDef * 0.1)); // Deixa com 10% DEF
                        markedUnit.card = { ...markedUnit.card, def: markedUnit.currentHealth };
                        markedUnit.statusEffect = 'karma_mark';
                        markedUnit.statusText = '🌀 KARMA (ATK 0)';
                        markedUnit.effectTurns = 2;
                        newTBoard[tIdx] = markedUnit;
                        setCurrentTBoard(newTBoard);

                        // Boruto absorve os stats
                        const newMyBoard = [...currentMyBoard];
                        const bIdx = newMyBoard.findIndex(u => u?.id === source.id);
                        if (bIdx !== -1 && newMyBoard[bIdx]) {
                            const boruto = { ...newMyBoard[bIdx]! };
                            boruto.currentAttack += stolenAtk;
                            boruto.card = { ...boruto.card, atk: boruto.currentAttack };
                            boruto.currentHealth += Math.floor(stolenDef * 0.9);
                            boruto.card = { ...boruto.card, def: boruto.currentHealth };
                            boruto.statusText = `🌀 ABSORVEU (+${stolenAtk} ATK)`;
                            newMyBoard[bIdx] = boruto;
                            setCurrentMyBoard(newMyBoard);
                        }

                        log(`🌀 Boruto absorveu ${tUnit.card.name}! Roubou ${stolenAtk} ATK e ${Math.floor(stolenDef * 0.9)} DEF!`);
                        setEffectMode(null);
                    }
                }
            });
            log(`🌀 Boruto: Selecione o ALVO do Karma!`);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // [IRON MAN] (ID 126) - Forca Omega
        if (source.card.id === '126') {
            if (legacySetupIds.includes(source.card.id)) return;
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1) {
                const unit = newBoard[idx]!;
                if (unit.customState?.hasOmegaAttack) {
                    forceTargetSelect(source.id, (targetId) => {
                        const opponentBoard = isPlayer ? enemyBoard : playerBoard;
                        const setOpponentBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
                        const targetIdx = opponentBoard.findIndex(u => u?.id === targetId);
                        if (targetIdx === -1) return;

                        const damage = unit.customState?.accumulatedDamage || 0;
                        const updatedOpponentBoard = [...opponentBoard];
                        const target = updatedOpponentBoard[targetIdx];
                        if (!target) return;

                        const nextHealth = target.currentHealth - damage;
                        updatedOpponentBoard[targetIdx] = nextHealth <= 0 ? null : {
                            ...target,
                            currentHealth: nextHealth,
                            card: { ...target.card, def: nextHealth }
                        };
                        setOpponentBoard(updatedOpponentBoard);

                        setMyBoard(currentBoard => currentBoard.map(boardUnit => boardUnit?.id === source.id ? {
                            ...boardUnit,
                            customState: {
                                ...(boardUnit.customState || {}),
                                hasOmegaAttack: false,
                                accumulatedDamage: 0
                            },
                            statusText: undefined
                        } : boardUnit));
                        log(`[IRON MAN] Omega causou ${damage} de dano.`);
                    });
                    if (cardPopup) setCardPopup(null);
                    return;
                }
                const currentAttack = unit.currentAttack + 1000;
                const currentHealth = unit.currentHealth + 1000;
                const updatedUnit = {
                    ...unit,
                    originalAttack: unit.currentAttack,
                    originalHealth: unit.currentHealth,
                    originalDef: unit.currentHealth,
                    currentAttack,
                    currentHealth,
                    card: { ...unit.card, atk: currentAttack, def: currentHealth },
                    effectTurns: 3,
                    customState: {
                        ...(unit.customState || {}),
                        accumulatedDamage: 0,
                        hasOmegaAttack: false
                    },
                    statusText: 'Omega (3T)',
                    statusEffect: 'buff'
                };
                newBoard[idx] = updatedUnit;
                setMyBoard(newBoard);
                log(`[IRON MAN] Homem de Ferro ativou a Armadura Forca Omega! +1000 ATK/DEF.`);
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        // [PANTERA] (ID 127) - Ancestrais
        if (source.card.id === '127') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1) {
                const unit = newBoard[idx]!;
                const originalAttack = unit.originalAttack ?? unit.currentAttack;
                const currentAttack = originalAttack + 500;
                newBoard[idx] = {
                    ...unit,
                    originalAttack,
                    currentAttack,
                    card: { ...unit.card, atk: currentAttack },
                    effectTurns: 2,
                    statusText: 'ANCESTRAIS (2T)',
                    statusEffect: 'buff',
                    customState: {
                        ...(unit.customState || {}),
                        ancestraisAtivos: true
                    }
                };
                setMyBoard(newBoard);
                log(`[PANTERA] Pantera Negra conectou-se aos ancestrais! +500 ATK.`);
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '53') {
            const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);
            const playerCount = playerBoard.filter(Boolean).length;
            const enemyCount = enemyBoard.filter(Boolean).length;
            const movedPlayerCards = playerBoard.filter((unit): unit is TestUnit => !!unit).map(unit => unit.card);
            const movedEnemyCards = enemyBoard.filter((unit): unit is TestUnit => !!unit).map(unit => unit.card);
            const nextPlayerGraveyard = [...playerGraveyard, ...movedPlayerCards];
            const nextEnemyGraveyard = [...enemyGraveyard, ...movedEnemyCards];
            const playerRevives = shuffle(nextPlayerGraveyard).slice(0, playerCount);
            const enemyRevives = shuffle(nextEnemyGraveyard).slice(0, enemyCount);
            const nextPlayerBoard = Array(14).fill(null);
            const nextEnemyBoard = Array(14).fill(null);
            playerRevives.forEach((card, index) => {
                nextPlayerBoard[index] = createUnit(card);
            });
            enemyRevives.forEach((card, index) => {
                nextEnemyBoard[index] = createUnit(card);
            });
            setPlayerBoard(nextPlayerBoard);
            setEnemyBoard(nextEnemyBoard);
            setPlayerGraveyard(nextPlayerGraveyard.filter(card => !playerRevives.includes(card)));
            setEnemyGraveyard(nextEnemyGraveyard.filter(card => !enemyRevives.includes(card)));
            log('[WANDA] Realidade alternativa trocou arena e cemiterios.');
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '92') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = myBoard.map(unit => unit?.id === source.id ? {
                ...unit,
                isIntangible: true,
                effectTurns: 3,
                statusEffect: 'intangible',
                statusText: 'INTANGIBLE (3T)'
            } : unit);
            setMyBoard(newBoard);
            log('[VISAO] Intangivel por 3T.');
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '47') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const graveyard = isPlayer ? playerGraveyard : enemyGraveyard;
            const setGraveyard = isPlayer ? setPlayerGraveyard : setEnemyGraveyard;
            const newBoard = myBoard.map(unit => unit?.id === source.id ? {
                ...unit,
                originalHealth: unit.originalHealth ?? unit.currentHealth,
                currentHealth: unit.currentHealth + 1000,
                card: { ...unit.card, def: unit.currentHealth + 1000 },
                effectTurns: 3,
                statusEffect: 'agamotto',
                statusText: 'AGAMOTTO (3T)'
            } : unit);
            setMyBoard(newBoard);
            setShowGraveyard(isPlayer ? 'player' : 'enemy');
            setGraveyardSelectorMode({
                title: 'DR ESTRANHO: REVIVER 1 ALIADO',
                onSelect: (card) => {
                    const revivedUnit = createUnit(card);
                    setMyBoard(currentBoard => {
                        const empty = currentBoard.findIndex(slot => slot === null);
                        if (empty === -1) return currentBoard;
                        return currentBoard.map((slot, index) => index === empty ? revivedUnit : slot);
                    });
                    setGraveyard(graveyard.filter(graveCard => graveCard !== card));
                    log(`[STRANGE] ${card.name} reviveu.`);
                }
            });
            log('[STRANGE] Olho de Agamotto ativo.');
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // [ESTELAR] (ID 150) - Explosao de Energia (2 alvos)
        if (source.card.id === '150') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            setEffectMode({
                sourceId: source.id,
                sourceBoard: isPlayerSource ? 'player' : 'enemy',
                type: 'estelar_destroy',
                targetsLeft: 2
            });
            log(`[ESTELAR] Estelar: Selecione ate 2 oponentes para eliminar!`);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // [CICLOPE] (ID 154) - Raio Optico (3 alvos)
        // ⚔️ TRUNKS (ID 132) - Buff + Debuff
        if (source.card.id === '132') {
            forceTargetSelect(source.id, (targetId) => {
                // Buff Self
                const isPlayer = playerBoard.some(u => u?.id === source.id);
                const myBoard = isPlayer ? playerBoard : enemyBoard;
                const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;

                const myNew = [...myBoard];
                const sIdx = myNew.findIndex(u => u?.id === source.id);
                if (sIdx !== -1) {
                    myNew[sIdx]!.currentAttack += 400;
                    myNew[sIdx]!.currentHealth += 400;
                    // set duration?
                    setMyBoard(myNew);
                }

                // Debuff Target
                const tBoard = isPlayer ? enemyBoard : playerBoard;
                const setTBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
                const tNew = [...tBoard];
                const tIdx = tNew.findIndex(u => u?.id === targetId);
                if (tIdx !== -1 && tNew[tIdx]) {
                    tNew[tIdx]!.currentHealth = Math.floor(tNew[tIdx]!.currentHealth * 0.8); // -20%
                    tNew[tIdx]!.statusText = '🛡️ -20% DEF';
                    tNew[tIdx]!.effectTurns = 2;
                    setTBoard(tNew);
                }
                log(`⚔️ Trunks ativou Transformação!`);
            });
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🦵 ROCK LEE (ID 137) - 8 Portas
        if (source.card.id === '137') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1) {
                newBoard[idx]!.maxAttacks = 3;
                newBoard[idx]!.statusText = '🦵 3 ATAQUES (3T)';
                newBoard[idx]!.effectTurns = 3;
                setMyBoard(newBoard);
                log(`🦵 Rock Lee abriu as Portas! 3 Ataques por turno.`);
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🐜 FORMIGA (ID 144) - Esquiva
        if (source.card.id === '138') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && newBoard[idx]) {
                const neji = newBoard[idx]!;
                newBoard[idx] = {
                    ...neji,
                    isReady: true,
                    statusEffect: 'guard',
                    statusText: 'NEJI READY'
                };
                setMyBoard(newBoard);
                log('[NEJI] HB reativa armada.');
            }
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '144') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1) {
                newBoard[idx]!.isReady = true;
                newBoard[idx]!.statusEffect = 'ant_man_dodge';
                newBoard[idx]!.statusText = '🐜 PEQUENO (ESQUIVA)';
                newBoard[idx]!.effectTurns = 1;
                setMyBoard(newBoard);
                log(`🐜 Homem-Formiga encolheu!`);
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🐝 VESPA (ID 145) - Multi Target
        if (source.card.id === '145') {
            const baseVespa = initialCards.find(c => c.id === '145');
            const vespaDamage = baseVespa?.atk ?? source.currentAttack;
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            setEffectMode({
                sourceId: source.id,
                sourceBoard: isPlayerSource ? 'player' : 'enemy',
                type: 'multi_target_damage', // Reusing Zoro logic type if available or handling generic
                targetsLeft: 3,
                damage: vespaDamage
            });
            log(`🐝 Vespa: Selecione até 3 alvos!`);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🗿 COISA (ID 146) - Tripica ATK
        if (false) {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1) {
                const u = newBoard[idx]!;
                u.originalAttack = u.currentAttack;
                u.currentAttack *= 3;
                u.card.atk = u.currentAttack;
                u.effectTurns = 2;
                u.statusText = '🗿 FORÇA BRUTA (2T)';
                setMyBoard(newBoard);
                log(`🗿 O Coisa triplicou sua força!`);
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🕷️ VIÚVA NEGRA (ID 165) - Dano + Silence
        if (source.card.id === '165') {
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const setTBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
            const targetPool = isPlayer ? enemyBoard : playerBoard;
            if (!targetPool.some(unit => unit)) {
                log('[VIUVA NEGRA] Sem alvos oponentes.');
                setEffectMode(null);
                if (cardPopup) setCardPopup(null);
                return;
            }
            setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: source.id, abilityCallback: (targetId) => {
                let targetFound = false;
                const activeTargetBoard = isPlayer ? enemyBoard : playerBoard;
                const newT = activeTargetBoard.map(unit => {
                    if (!unit) return unit;
                    if (unit.id === targetId) targetFound = true;
                    const nextHealth = unit.id === targetId ? unit.currentHealth - 500 : unit.currentHealth;
                    if (nextHealth <= 0) return null;
                    return {
                        ...unit,
                        currentHealth: nextHealth,
                        isSilenced: true,
                        effectTurns: 2,
                        statusText: 'SILENCED',
                        card: { ...unit.card, def: nextHealth }
                    };
                });
                if (targetFound) {
                    setTBoard(newT);
                    log('[VIUVA NEGRA] Dano 500 aplicado e oponentes silenciados por 2T.');
                }
                setInteractionMode({ type: 'IDLE' });
            }});
            log('[VIUVA NEGRA] Selecione o alvo.');
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🛡️ MULHER INVISÍVEL (ID 163) - Campo de Força (3x)
        if (source.card.id === '163') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setMyBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && newBoard[idx]) {
                const inv = { ...newBoard[idx]! };
                inv.isReady = true;
                inv.charges = 3; // Ensure charges applied on activation too
                inv.statusText = '🛡️ CAMPO (3)';
                inv.statusEffect = 'guard';
                newBoard[idx] = inv;
                setMyBoardFn(newBoard);
                log(`🛡️ Mulher Invisível ativou Campo de Força! (3 Cargas)`);
            }
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🛡️ WONG (ID 164) - Escudo Místico (2x)
        if (source.card.id === '164') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setMyBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && newBoard[idx]) {
                const wong = { ...newBoard[idx]! };
                wong.isReady = true;
                wong.charges = 2;
                wong.statusText = '🛡️ ESCUDO (2)';
                wong.statusEffect = 'guard';
                newBoard[idx] = wong;
                setMyBoardFn(newBoard);
                log(`🛡️ Wong ativou Escudo Místico! (2 Cargas)`);
            }
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '152') {
            if (legacySetupIds.includes(source.card.id)) return;
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && newBoard[idx]) {
                const unit = { ...newBoard[idx]! };
                const abilityCharges = unit.abilityCharges ?? 2;
                if (abilityCharges <= 0) {
                    log('[GAMORA] Sem cargas.');
                    setEffectMode(null);
                    if (cardPopup) setCardPopup(null);
                    return;
                }
                newBoard[idx] = {
                    ...unit,
                    abilityCharges: abilityCharges - 1,
                    customState: {
                        ...(unit.customState || {}),
                        hbActive: true
                    },
                    statusText: 'HB Ativa'
                };
                setMyBoard(newBoard);
                log('Gamora: HB ativa (1)');
            }
            setEffectMode(null);
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '157') {
            if (legacySetupIds.includes(source.card.id)) return;
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && newBoard[idx]) {
                const unit = { ...newBoard[idx]! };
                const currentAttack = unit.currentAttack * 2;
                newBoard[idx] = {
                    ...unit,
                    originalAttack: unit.originalAttack ?? unit.currentAttack,
                    currentAttack,
                    card: { ...unit.card, atk: currentAttack },
                    effectTurns: 2,
                    remainingAttacks: 2,
                    maxAttacks: 2,
                    customState: {
                        ...(unit.customState || {}),
                        oobActive: true
                    },
                    statusText: 'Oob 2x ATK'
                };
                setMyBoard(newBoard);
                log('[OOB] ATK dobrado por 2 turnos.');
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '158') {
            if (legacySetupIds.includes(source.card.id)) return;
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const newBoard = [...myBoard];
            const idx = newBoard.findIndex(u => u?.id === source.id);
            if (idx !== -1 && newBoard[idx]) {
                const unit = { ...newBoard[idx]! };
                const originalAttack = unit.originalAttack ?? unit.currentAttack;
                const currentAttack = Math.floor(unit.currentAttack * 1.5);
                newBoard[idx] = {
                    ...unit,
                    originalAttack,
                    currentAttack,
                    card: { ...unit.card, atk: currentAttack },
                    customState: {
                        ...(unit.customState || {}),
                        killmongerActive: true
                    },
                    statusText: 'Killmonger Ativo'
                };
                setMyBoard(newBoard);
                log('[KILLMONGER] ATK aumentado ate abater um alvo.');
            }
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '172') {
            if (legacySetupIds.includes(source.card.id)) return;
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const sourceUnit = myBoard.find(u => u?.id === source.id);
            if ((sourceUnit?.customState?.cooldown || 0) > 0) {
                log('Habilidade em recarga!');
                setEffectMode(null);
                if (cardPopup) setCardPopup(null);
                return;
            }
            const handleKienzan = (targetId: string) => {
                const opponentBoard = isPlayer ? enemyBoard : playerBoard;
                const setOpponentBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
                const targetIdx = opponentBoard.findIndex(u => u?.id === targetId);
                if (targetIdx === -1) return;
                const updatedOpponentBoard = [...opponentBoard];
                const target = updatedOpponentBoard[targetIdx];
                if (!target) return;
                const nextHealth = target.currentHealth - 2500;
                updatedOpponentBoard[targetIdx] = nextHealth <= 0 ? null : {
                    ...target,
                    currentHealth: nextHealth,
                    card: { ...target.card, def: nextHealth }
                };
                setOpponentBoard(updatedOpponentBoard);
                setMyBoard(currentBoard => currentBoard.map(unit => unit?.id === source.id ? {
                    ...unit,
                    customState: {
                        ...(unit.customState || {}),
                        cooldown: 4
                    },
                    statusText: 'Cooldown 4'
                } : unit));
                log(`[KURIRIN] Kienzan atingiu ${target.card.name}.`);
                setInteractionMode({ type: 'IDLE' });
            };
            setInteractionMode({ type: 'SELECTING_ABILITY_TARGET', sourceId: '172', abilityCallback: (id) => handleKienzan(id) });
            console.log('Target Selection disparado', { sourceId: source.id, cardId: source.card.id });
            log('[KURIRIN] Selecione o alvo do Kienzan.');
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '173') {
            if (legacySetupIds.includes(source.card.id)) return;
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const opponentBoard = isPlayer ? enemyBoard : playerBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const setOpponentBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
            setMyBoard(myBoard.map(unit => unit?.id === source.id ? {
                ...unit,
                effectTurns: 2,
                statusText: 'Revelando (2T)'
            } : unit));
            setOpponentBoard(opponentBoard.map(unit => unit ? {
                ...unit,
                isFaceDown: false
            } : unit));
            setTimeout(() => setOpponentBoard(currentBoard => [...currentBoard]), 0);
            log('[TENSHINHAN] Cartas inimigas reveladas por 2 turnos.');
            if (cardPopup) setCardPopup(null);
            return;
        }

        if (source.card.id === '175') {
            if (legacySetupIds.includes(source.card.id)) return;
            const isPlayer = playerBoard.some(u => u?.id === source.id);
            const myBoard = isPlayer ? playerBoard : enemyBoard;
            const opponentBoard = isPlayer ? enemyBoard : playerBoard;
            const setMyBoard = isPlayer ? setPlayerBoard : setEnemyBoard;
            const setOpponentBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
            setMyBoard(myBoard.map(unit => unit ? {
                ...unit,
                currentHealth: unit.currentHealth + 400,
                card: { ...unit.card, def: unit.currentHealth + 400 }
            } : unit));
            setOpponentBoard(opponentBoard.map(unit => unit ? {
                ...unit,
                isStunned: true,
                effectTurns: 2,
                statusEffect: 'stunned',
                statusText: 'Stun (2T)'
            } : unit));
            log('[SAKURA] Aliados ganharam 400 DEF e oponentes foram atordoados.');
            if (cardPopup) setCardPopup(null);
            return;
        }

        const effects = parseAbilityToEffects(source.card.description || '', source.card.id);
        const sourceBoardName: 'player' | 'enemy' = isSourcePlayer ? 'player' : 'enemy';
        const needsEnemyTarget = effects.some(effect =>
            ['damage', 'destroy', 'silence', 'invertStats', 'returnToHand', 'mindControl'].includes(effect.type) &&
            effect.target !== 'self' &&
            effect.target !== 'allies'
        );
        if (!effectMode && targetBoard === sourceBoardName && needsEnemyTarget) {
            setEffectMode({ sourceId: source.id, sourceBoard: sourceBoardName });
            log(`[${source.card.id}] Selecione um alvo inimigo.`);
            return;
        }

        // 🚨 BYPASS PARA CARTA COM LÓGICA MANUAL (Paladinos V3.7)
        // Se a carta é manual (159, 160, 161, 162), permitimos continuar mesmo que o parse falhe.
        const manualIds = ['159', '160', '161', '162'];
        if (effects.length === 0 && !manualIds.includes(source.card.id)) {
            log(`[SISTEMA]: Habilidade do ID ${source.card.id} (${source.card.name}) ainda não implementada logicamente.`);
            console.warn(`[SISTEMA]: Habilidade do ID ${source.card.id} não mapeada.`);
            setEffectMode(null);
            setSelectedSlot(null);
            return;
        }

        // Log customizado para cartas de teste
        if (['212', '213', '214'].includes(source.card.id)) {
            const abilityText = effects[0]?.description || source.card.description || '';
            log(`[${source.card.id}] ${source.card.name} usou habilidade: ${abilityText}`);
        }

        let newPBoard = [...playerBoard];
        let newEBoard = [...enemyBoard];
        let newHand = [...playerHand];
        let pHP = playerHP;
        let eHP = enemyHP;
        const targetIsPlayerBoard = targetBoard === 'player';
        const targetIsEnemy = (targetBoard === 'enemy');

        const isGlobal = source.card.description?.toLowerCase().includes('todos') ||
            source.card.description?.toLowerCase().includes('todas') ||
            source.card.description?.toLowerCase().includes('chuva de raios');

        effects.forEach(effect => {
            const clickBoard = targetIsPlayerBoard ? newPBoard : newEBoard;

            // --- TARGET RESOLUTION ---
            let targets: { unit: TestUnit, index: number, board: (TestUnit | null)[] }[] = [];
            const unitEffectTypes = ['damage', 'destroy', 'buffAtk', 'buffDef', 'silence', 'invertStats', 'returnToHand', 'mindControl'];

            if (isGlobal && unitEffectTypes.includes(effect.type)) {
                clickBoard.forEach((u, i) => {
                    if (u) targets.push({ unit: u, index: i, board: clickBoard });
                });
                if (targets.length === 0) log(`⚠️ Efeito global sem alvos.`);
            } else {
                if (effect.target === 'self') {
                    // Procurar source em ambos os boards (suporta directSource)
                    let sBoard = newPBoard;
                    let sIdx = sBoard.findIndex(u => u?.id === source.id);
                    if (sIdx === -1) {
                        sBoard = newEBoard;
                        sIdx = sBoard.findIndex(u => u?.id === source.id);
                    }
                    if (sIdx !== -1 && sBoard[sIdx]) {
                        targets.push({ unit: sBoard[sIdx]!, index: sIdx, board: sBoard });
                    }
                } else if (effect.target === 'allies') {
                    // Para allies, verificar se targetBoard é o mesmo do source
                    const sourceInTarget = (targetBoard === 'player' ? newPBoard : newEBoard).findIndex(u => u?.id === source.id) !== -1;
                    if (sourceInTarget) {
                        const u = clickBoard[targetIndex];
                        if (u) targets.push({ unit: u, index: targetIndex, board: clickBoard });
                    } else {
                        if (unitEffectTypes.includes(effect.type)) log('⚠️ Alvo inválido. Efeito requer Aliado.');
                    }
                } else {
                    if (unitEffectTypes.includes(effect.type)) {
                        const u = clickBoard[targetIndex];
                        if (u) targets.push({ unit: u, index: targetIndex, board: clickBoard });
                    }
                }
            }

            // --- EXECUTE TARGET EFFECTS ---
            targets.forEach(({ unit: targetUnit, index: idx, board: tBoard }) => {
                const isSelf = targetUnit.id === source.id;
                const targetName = isSelf ? 'si mesmo' : targetUnit.card.name;

                if (effect.type === 'destroy') {
                    tBoard[idx] = null;
                    log(`💥 ${source.card.name} destruiu ${targetName} !`);
                } else if (effect.type === 'damage') {
                    const updatedUnit = { ...targetUnit };
                    updatedUnit.currentHealth -= effect.value;
                    updatedUnit.card = { ...updatedUnit.card, def: updatedUnit.currentHealth };

                    if (updatedUnit.currentHealth <= 0) {
                        tBoard[idx] = null;
                        log(`☠️ ${source.card.name} eliminou ${targetName} !(-${effect.value})`);
                    } else {
                        tBoard[idx] = updatedUnit;
                        log(`⚔️ ${source.card.name} causou ${effect.value} dano a ${targetName}.`);
                    }
                } else if (effect.type === 'buffAtk') {
                    const dur = effect.duration ? ` (${effect.duration} Turnos)` : '';

                    // IMUTABILIDADE: Criar cópia do objeto ANTES de modificar
                    const updatedUnit = { ...targetUnit };

                    if (effect.duration) {
                        updatedUnit.turnTimer = effect.duration;
                        updatedUnit.maxTimer = effect.duration;
                        updatedUnit.effectTurns = effect.duration; // Visual counter

                        // Sentry (ID 18): Auto-destruição ao fim do timer
                        if (source.card.id === '18' && effect.target === 'self') {
                            updatedUnit.diesOnTimerEnd = true;
                            updatedUnit.buffType = 'sentryDouble';
                            updatedUnit.statusEffect = 'Sobrecarga'; // Label visual
                            updatedUnit.statusText = `⚠️ SOBRECARGA (${effect.duration}T)`; // Texto customizado
                        }
                    }

                    if (effect.operation === 'multiply') {
                        const beforeATK = updatedUnit.currentAttack;

                        // MATEMÁTICA SIMPLES: ataque = ataque * 2
                        updatedUnit.currentAttack = updatedUnit.currentAttack * effect.value;
                        updatedUnit.card = { ...updatedUnit.card, atk: updatedUnit.currentAttack }; // Cópia imutável do card

                        // Log específico para Sentry
                        if (source.card.id === '18') {
                            log(`⚡ Sentry ativando! ${beforeATK} → ${updatedUnit.currentAttack}`);
                            console.log('🔍 SENTRY ATK UPDATE:', {
                                before: beforeATK,
                                after: updatedUnit.currentAttack,
                                cardAtk: updatedUnit.card.atk,
                                statusText: updatedUnit.statusText,
                                effectTurns: updatedUnit.effectTurns
                            });
                        }

                        log(`💪 ${source.card.name} DOBROU ATK de ${targetName}${dur}!`);
                    } else {
                        updatedUnit.currentAttack += effect.value;
                        updatedUnit.card = { ...updatedUnit.card, atk: updatedUnit.currentAttack }; // Cópia imutável do card
                        log(`💪 ${source.card.name} buffou ATK de ${targetName} (+${effect.value})${dur}.`);
                    }

                    // Substituir objeto no array (forçar re-render)
                    tBoard[idx] = updatedUnit;
                } else if (effect.type === 'buffDef') {
                    const dur = effect.duration ? ` (${effect.duration} Turnos)` : '';
                    const updatedUnit = { ...targetUnit };

                    // Salvar originalHealth para reversão (Nami)
                    if (effect.duration && source.card.id === '213' && targetUnit.id === source.id) {
                        updatedUnit.originalHealth = updatedUnit.currentHealth;
                    }

                    // Configurar duration visual se aplicável
                    if (effect.duration) {
                        updatedUnit.effectTurns = effect.duration;
                        updatedUnit.statusText = `⏳ ${effect.duration}T`;
                    }

                    if (effect.operation === 'multiply') {
                        updatedUnit.currentHealth *= effect.value;
                        updatedUnit.card = { ...updatedUnit.card, def: updatedUnit.currentHealth };
                        log(`🛡️ ${source.card.name} DOBROU DEF de ${targetName}${dur}!`);
                    } else {
                        const beforeDEF = updatedUnit.currentHealth;
                        updatedUnit.currentHealth += effect.value;
                        updatedUnit.card = { ...updatedUnit.card, def: updatedUnit.currentHealth };

                        if (effect.value < 0) {
                            log(`💔 ${source.card.name} reduziu DEF de ${targetName} (${effect.value})${dur}.`);
                        } else {
                            log(`🛡️ ${source.card.name} buffou DEF de ${targetName} (+${effect.value})${dur}.`);
                        }
                    }


                    // ⚠️ REGRA UNIVERSAL: DEF = 0 é MORTE
                    if (updatedUnit.currentHealth <= 0) {
                        tBoard[idx] = null;  // Destruir carta
                        log(`💀 ${targetName} foi destruído (DEF chegou a 0)!`);
                    } else {
                        tBoard[idx] = updatedUnit;
                    }
                } else if (effect.type === 'invertStats') {
                    const updatedUnit = { ...targetUnit };
                    const temp = updatedUnit.currentAttack;
                    updatedUnit.currentAttack = updatedUnit.currentHealth;
                    updatedUnit.currentHealth = temp;
                    updatedUnit.card = { ...updatedUnit.card, atk: updatedUnit.currentAttack, def: updatedUnit.currentHealth };
                    log(`🔄 ${source.card.name} inverteu status de ${targetName}.`);
                    tBoard[idx] = updatedUnit;
                } else if (effect.type === 'silence') {
                    const updatedUnit = { ...targetUnit, isSilenced: true };
                    log(`🔇 ${source.card.name} silenciou ${targetName}.`);
                    tBoard[idx] = updatedUnit;
                } else if (effect.type === 'complexBuff') {
                    // Alerquina: ATK*3, DEF/2 por 3T
                    const updatedUnit = { ...targetUnit };

                    // Salvar valores originais se ainda não tiver
                    if (!updatedUnit.originalAttack) {
                        updatedUnit.originalAttack = updatedUnit.currentAttack;
                        updatedUnit.originalHealth = updatedUnit.currentHealth;
                    }

                    // Aplicar multiplicadores
                    updatedUnit.currentAttack = Math.floor(updatedUnit.originalAttack * (effect.value.atkMultiplier || 1));
                    updatedUnit.currentHealth = Math.floor(updatedUnit.originalHealth * (effect.value.defMultiplier || 1));
                    updatedUnit.card = {
                        ...updatedUnit.card,
                        atk: updatedUnit.currentAttack,
                        def: updatedUnit.currentHealth
                    };

                    // Configurar duração visual
                    if (effect.duration) {
                        updatedUnit.effectTurns = effect.duration;
                        updatedUnit.statusText = `⚡ ${effect.duration}T`;
                        updatedUnit.buffType = 'complexBuff';
                    }

                    log(`⚡ ${source.card.name} ativou poder! ATK: ${updatedUnit.originalAttack} → ${updatedUnit.currentAttack}, DEF: ${updatedUnit.originalHealth} → ${updatedUnit.currentHealth}`);
                    tBoard[idx] = updatedUnit;
                } else if (effect.type === 'returnToHand') {
                    const isPlayerBoard = (tBoard === newPBoard);
                    if (isPlayerBoard) {
                        const handIdx = newHand.findIndex(s => s === null);
                        if (handIdx !== -1) {
                            newHand[handIdx] = targetUnit.card;
                            tBoard[idx] = null;
                            log(`↩️ ${targetName} voltou para a mão.`);
                        } else {
                            log(`⚠️ Mão cheia.Retorno falhou para ${targetName}.`);
                        }
                    } else {
                        tBoard[idx] = null;
                        log(`💨 ${targetName} removido do campo.`);
                    }
                } else if (effect.type === 'mindControl') {
                    const sourceIsPlayer = effectMode.sourceBoard === 'player';
                    const sBoard = sourceIsPlayer ? newPBoard : newEBoard;

                    if (tBoard !== sBoard) {
                        const myBoard = sBoard;
                        const emptySlot = myBoard.findIndex(s => s === null);
                        if (emptySlot !== -1) {
                            myBoard[emptySlot] = {
                                ...targetUnit,
                                controlledBy: source.id,
                                originalOwner: targetIsEnemy ? (sourceIsPlayer ? 'enemy' : 'player') : 'player'
                            };
                            tBoard[idx] = null;
                            const dur = effect.duration ? ` (Duração: ${effect.duration} Turnos)` : '';
                            log(`🧠 ${source.card.name} controlou ${targetName} !${dur} `);
                        } else {
                            log(`💥 Alvo destruído(Sem espaço para controle).`);
                            tBoard[idx] = null;
                        }
                    } else {
                        log(`⚠️ Não pode controlar aliado / si mesmo.`);
                    }
                }
            });

            // --- EXECUTE ONCE EFFECTS ---
            if (effect.type === 'draw') {
                let drawn = 0;
                for (let k = 0; k < effect.value; k++) {
                    const emptyHandSlot = newHand.findIndex(s => s === null);
                    if (emptyHandSlot !== -1) {
                        const rnd = cards[Math.floor(Math.random() * cards.length)];
                        newHand[emptyHandSlot] = rnd;
                        drawn++;
                    }
                }
                if (drawn > 0) log(`🃏 Comprou ${drawn} cartas.`);
            } else if (effect.type === 'summon') {
                const sourceIsPlayer = effectMode.sourceBoard === 'player';
                const myBoard = sourceIsPlayer ? newPBoard : newEBoard;
                const emptyIdx = myBoard.findIndex(s => s === null);
                if (emptyIdx !== -1) {
                    const tokenCard = {
                        id: `token - ${Date.now()} `,
                        name: `Lacaio(${source.card.name})`,
                        universe: source.card.universe,
                        rarity: 'Soldado',
                        image: source.card.image,
                        atk: 500,
                        def: 500,
                        description: 'Unidade Invocada.'
                    } as any;
                    myBoard[emptyIdx] = createUnit(tokenCard);
                    log(`✨ Invocou Lacaio.`);
                } else {
                    log(`⚠️ Invocar falhou(cheio).`);
                }
            } else if (effect.type === 'healHero') {
                if (effectMode.sourceBoard === 'player') pHP += effect.value;
                else eHP += effect.value;
                log(`💚 ${source.card.name} curou ${effect.value} HP do Herói.`);
            } else if (effect.type === 'revealHand') {
                log(`👁️ ${source.card.name} revelou a mão do oponente!(5s)`);
                setTimeout(() => {
                    log(`👁️ Efeito de ${source.card.name} (Revelar) expirou.`);
                }, 5000);
            } else if (effect.type === 'stealCard') {
                // Coringa: Roubar carta aleatória da mão do oponente
                const sourceIsPlayer = !effectMode || effectMode.sourceBoard === 'player' ||
                    newPBoard.findIndex(u => u?.id === source.id) !== -1;
                const opponentHand = sourceIsPlayer ? enemyHand : newHand;  // Não implementado ainda
                const myHand = sourceIsPlayer ? newHand : enemyHand;       // Não implementado ainda

                // IMPLEMENTAÇÃO REAL: Roubar carta da mão
                const nonNullCards = newHand.map((c, i) => c ? i : -1).filter(i => i !== -1);

                if (nonNullCards.length === 0) {
                    log(`⚠️ Oponente sem cartas para roubar!`);
                } else {
                    // Escolher índice aleatório
                    const randomIndex = nonNullCards[Math.floor(Math.random() * nonNullCards.length)];
                    const stolenCard = newHand[randomIndex];

                    log(`[${source.card.id}] ${source.card.name} roubou ${stolenCard?.name || 'uma carta'} do oponente!`);

                    // SPLICE: Remove da posição original
                    newHand[randomIndex] = null;

                    // PUSH: Mover para slot vazio
                    const emptySlot = newHand.findIndex((c, i) => c === null && i !== randomIndex);
                    if (emptySlot !== -1) {
                        newHand[emptySlot] = stolenCard;
                    }
                }
            } else if (effect.type === 'weakenAll' || effect.type === 'weakenAllDef') {
                // Nami: Reduzir ATK e DEF de todos adversários por 2T
                const sourceIsPlayer = newPBoard.findIndex(u => u?.id === source.id) !== -1;
                const targetBoard = sourceIsPlayer ? newEBoard : newPBoard;

                let affected = 0;
                targetBoard.forEach((u, i) => {
                    if (u) {
                        const updatedUnit = { ...u };

                        // Reduzir ATK E DEF
                        updatedUnit.currentAttack += effect.value;  // -200
                        updatedUnit.currentHealth += effect.value;  // -200
                        updatedUnit.card = {
                            ...updatedUnit.card,
                            atk: updatedUnit.currentAttack,
                            def: updatedUnit.currentHealth
                        };

                        // Rastrear debuff para reversão
                        updatedUnit.namiDebuff = effect.value;  // -200
                        updatedUnit.namiDebuffSource = source.id;

                        // Configurar duração visual
                        if (effect.duration) {
                            updatedUnit.effectTurns = effect.duration;
                            updatedUnit.statusText = `🔻 ${effect.duration}T`;
                        }

                        targetBoard[i] = updatedUnit;
                        affected++;
                    }
                });

                if (affected > 0) {
                    log(`🔻 ${source.card.name} reduziu ${affected} adversários (ATK${effect.value}, DEF${effect.value}) por ${effect.duration}T!`);
                }
            }
        });

        // Forçar re-render com spread operator (criar nova referência de array)
        setPlayerBoard([...newPBoard]);
        setEnemyBoard([...newEBoard]);
        setPlayerHand(newHand);
        setPlayerHP(pHP);
        setEnemyHP(eHP);
        saveHistory([...newPBoard], [...newEBoard], newHand);

        setEffectMode(null);
        setSelectedSlot(null);
    }, [effectMode, playerBoard, enemyBoard, log, playerHP, enemyHP, cards, enemyHand, playerHand, setEnemyHand, setPlayerHand, setPlayerBoard, setEnemyBoard, saveHistory, cardPopup, setCardPopup, setGoblinTargetsDestroyed, goblinTargetsDestroyed, legacySetupIds]);

    const resetPlayer = () => {
        const nextBoard = Array(14).fill(null);
        setPlayerBoard(nextBoard);
        saveHistory(nextBoard, enemyBoard, playerHand);
        log('🧹 Campo do Jogador limpo');
        setShowResetMenu(false);
    };
    const resetEnemy = () => {
        const nextBoard = Array(14).fill(null);
        setEnemyBoard(nextBoard);
        saveHistory(playerBoard, nextBoard, playerHand);
        log('🧹 Campo do Adversário limpo');
        setShowResetMenu(false);
    };
    const resetLogs = () => { setEventLog(['🧪 Log Resetado']); log('🧹 Histórico de Logs limpo'); setShowResetMenu(false); };
    const resetAll = () => {
        const empty = Array(14).fill(null);
        const emptyHand = Array(8).fill(null);
        setPlayerBoard(empty);
        setEnemyBoard(empty);
        setPlayerHand(emptyHand);
        setPlayerHP(8000);
        setEnemyHP(8000);
        setSelectedSlot(null);
        setAttackMode(null);
        setEventLog(['🧪 Oficina Reiniciada']);
        saveHistory(empty, empty, emptyHand);
        log('💥 Tudo foi resetado');
        setShowResetMenu(false);
    };

    const copyLog = () => {
        const fullLog = eventLog.join('\n');
        navigator.clipboard.writeText(fullLog);
        alert('📋 Log copiado para a área de transferência!');
    };

    const spawnRandom = (boardType: 'player' | 'enemy', index: number) => {
        const card = getRandomPlayableCards(1)[0];
        if (!card) return;
        const unit = createUnit(card);
        const isPlayer = boardType === 'player';
        const board = isPlayer ? playerBoard : enemyBoard;
        const newBoard = [...board];
        newBoard[index] = unit;

        if (isPlayer) {
            setPlayerBoard(newBoard);
            saveHistory(newBoard, enemyBoard, playerHand);
        } else {
            setEnemyBoard(newBoard);
            saveHistory(playerBoard, newBoard, playerHand);
        }
    };

    const fillArena = (isPlayer: boolean) => {
        const randomCards = getRandomPlayableCards(14);
        let randomIndex = 0;
        const board = isPlayer ? playerBoard : enemyBoard;
        const newBoard = board.map(slot => {
            if (slot) return slot;
            const card = randomCards[randomIndex++];
            if (!card) return null;
            return createUnit(card);
        });

        if (isPlayer) {
            setPlayerBoard(newBoard);
            saveHistory(newBoard, enemyBoard, playerHand);
        } else {
            setEnemyBoard(newBoard);
            saveHistory(playerBoard, newBoard, playerHand);
        }
        log(`🎲 Arena ${isPlayer ? 'P1' : 'P2'} preenchida aleatoriamente.`);
        setShowRandomMenu(false);
    };

    const renderSlot = (slot: any, index: number, board: 'player' | 'enemy' | 'hand', isUnit = true) => {
        const isSelected = selectedSlot?.board === board && selectedSlot?.index === index;
        const isAttackTarget = board !== 'hand' && attackMode !== null && attackMode.attackerBoard !== board;
        const isEffectTarget = board !== 'hand' && effectMode !== null;

        // Highlight compatible arena slots if a card in hand is selected
        const isMoveTarget = selectedSlot?.board === 'hand' && board === 'player' && slot === null;

        return (
            <div
                key={index}
                onClick={(e) => {
                    if (slot && board !== 'hand' && interactionMode.type === 'SELECTING_ABILITY_TARGET') {
                        interactionMode.abilityCallback((slot as TestUnit).id);
                        return;
                    }
                    if (slot === null && selectedCard && selectedCard.owner === board) {
                        moveToArena(selectedCard, index, board);
                        return;
                    }
                    if (isMoveTarget && selectedSlot) {
                        moveHandToArena(selectedSlot.index, index);
                    }
                    else if (effectMode && board !== 'hand') {
                        // 🎯 CUSTOM CALLBACK (V4.8) - recebe board + index diretamente
                        if (effectMode.customCallback) {
                            if (slot) {
                                effectMode.customCallback(board as 'player' | 'enemy', index);
                                // O callback decide se encerra ou abre novo modo
                            } else {
                                log('🚫 Selecione um alvo válido (unidade presente).');
                            }
                            return;
                        }

                        executeEffect(board, index, undefined);
                    }
                    else if (attackMode && slot && board !== 'hand' && attackMode.attackerBoard !== board) {
                        executeAttack(board, index);
                    }
                    // Clique para RELFEXÃO DO CAPITÃO AMÉRICA (V3.7)
                    else if (reflectionMode && slot && board !== reflectionMode.sourceBoard) {
                        const targetBoard = board === 'player' ? [...playerBoard] : [...enemyBoard];
                        const targetUnit = targetBoard[index] as TestUnit;
                        if (targetUnit) {
                            const dmg = reflectionMode.damage;
                            targetUnit.currentHealth -= dmg;
                            targetUnit.card.def = targetUnit.currentHealth;
                            log(`🛡️ Dano refletido atingiu ${targetUnit.card.name} (-${dmg})!`);

                            if (targetUnit.currentHealth <= 0) {
                                targetBoard[index] = null;
                                if (board === 'player') setPlayerGraveyard(prev => [...prev, targetUnit.card]);
                                else setEnemyGraveyard(prev => [...prev, targetUnit.card]);
                                log(`☠️ ${targetUnit.card.name} foi eliminado pelo reflexo!`);
                            } else {
                                targetBoard[index] = targetUnit;
                            }

                            if (board === 'player') setPlayerBoard(targetBoard);
                            else setEnemyBoard(targetBoard);

                            setReflectionMode(null);
                        }
                    }
                    // Clique em carta do campo: ATIVA MODO DE ATAQUE + MOSTRA HABILIDADE
                    else if (slot && board !== 'hand') {
                        if ((slot as TestUnit).isStunned) {
                            e.stopPropagation();
                            log(`🛑 ${(slot as TestUnit).card.name} esta Magnetizado! (Acao bloqueada)`);
                            // Permitir visualização APENAS
                            setSelectedSlot({ board: board, index: index });
                            setCardPopup({ unit: slot as TestUnit, board: board, index: index });
                            setAttackMode(null);
                            return;
                        }
                        const attacker = (board === 'player' ? playerBoard : enemyBoard)[index];
                        if (attacker) {
                            const unit = attacker as TestUnit;

                            // 🔄 TOGGLE: Se clicar na mesma carta selecionada, DESMARCAR
                            const isSameCardAttack = selectedSlot?.board === board &&
                                selectedSlot?.index === index &&
                                attackMode?.attackerId === unit.id;

                            const isSameCardEffect = effectMode?.sourceId === unit.id &&
                                effectMode?.sourceBoard === board;

                            if (isSameCardAttack || isSameCardEffect) {
                                // Cancelar seleção (ataque OU habilidade)
                                setSelectedSlot(null);
                                setAttackMode(null);
                                setEffectMode(null);
                                setCardPopup(null);
                                log(`🚫 ${unit.card.name} desmarcado. ${isSameCardEffect ? 'Habilidade cancelada.' : 'Ataque cancelado.'}`);
                                return;
                            }

                            // 🔍 DEBUG: Log completo da carta clicada
                            console.log("=== CARTA CLICADA ===");
                            console.log("Nome:", unit.card.name);
                            console.log("ID:", unit.card.id);
                            console.log("Descrição (Habilidade):", unit.card.description);
                            console.log("Tipo:", unit.card.type);
                            console.log("ATK:", unit.currentAttack, "| DEF:", unit.currentHealth);
                            console.log("Carta completa:", unit.card);
                            console.log("==================");

                            setSelectedSlot({ board, index });
                            setAttackMode({ attackerId: unit.id, attackerBoard: board });
                            setEffectMode(null);

                            // Mostrar habilidade na sidebar
                            setCardPopup({ unit, board, index });

                            console.log("✅ cardPopup setado:", {
                                nome: unit.card.name,
                                habilidade: unit.card.description || "SEM DESCRIÇÃO",
                                board,
                                index
                            });

                            log(`⚔️ ${unit.card.name} selecionado! Habilidade: ${unit.card.description?.substring(0, 50) || 'N/A'}...`);
                        }
                    }
                    // Clique em slot vazio: limpa seleção
                    else {
                        setSelectedSlot(null);
                        setAttackMode(null);
                        setEffectMode(null);
                        setSelectedCard(null);
                    }
                }}
                draggable={!!slot}
                onDragStart={(e) => handleDragStart(e, 'ARENA', index, board !== 'hand' ? board : 'player')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, board, index)}
                className={`
                    relative transition-all duration-300 w-[120px] h-[65px] rounded-xl border-2 cursor-pointer flex items-center justify-center overflow-hidden
                    ${(slot as TestUnit)?.isStunned ? 'opacity-50 grayscale' : ''}
                    ${isSelected ? 'border-cyan-500 bg-cyan-500/10' :
                        isMoveTarget ? 'border-yellow-500/50 bg-yellow-500/5 border-dashed animate-pulse' :
                            isEffectTarget ? 'border-purple-500/50 bg-purple-500/5 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.3)]' :
                                (effectMode?.sourceId === '136' && board === 'enemy' && slot) ? 'animate-pulse ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                                    isAttackTarget ? 'border-red-500/50 bg-red-500/5 animate-pulse' :
                                        slot?.isReady ? 'border-purple-500 bg-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse' :
                                            'border-white/5 bg-black/60 hover:bg-white/[0.05]'}
                `}
            >
                {slot ? (
                    <div className="flex flex-col items-center justify-center w-full px-2 relative group">
                        {board !== 'hand' && (
                            <div className="absolute top-0.5 right-0.5 z-50 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={(e) => { e.stopPropagation(); duplicateUnit(board, index); }}
                                    className="text-white/30 hover:text-blue-400 p-1 bg-black/50 rounded transition-all hover:scale-110"
                                    title="Duplicar Unidade"
                                >
                                    <Copy size={12} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeUnit(board, index); }}
                                    className="text-white/30 hover:text-red-500 p-1 bg-black/50 rounded transition-all hover:scale-110"
                                    title="Remover Unidade"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            </div>
                        )}

                        {/* Indicador de Status/Turnos */}
                        {isUnit && ((slot as TestUnit).statusText || ((slot as TestUnit).statusEffect && (slot as TestUnit).effectTurns && (slot as TestUnit).effectTurns! > 0)) && (
                            <div className="text-[8px] text-red-400 font-bold leading-none">
                                {(slot as TestUnit).statusText || `⚠️ ${(slot as TestUnit).statusEffect?.toUpperCase()} (${(slot as TestUnit).effectTurns}T)`}
                            </div>
                        )}
                        <span className="text-[9px] font-black text-white truncate w-full text-center uppercase italic translate-y-1 flex items-center justify-center gap-1">
                            {isUnit && (slot as TestUnit).isSilenced && <span title="Silenciado">🔇</span>}
                            {isUnit && (slot as TestUnit).controlledBy && <span title="Controlado">🧠</span>}
                            {isUnit && (slot as TestUnit).effectTurns !== undefined && (slot as TestUnit).effectTurns! > 0 && (
                                <span
                                    title={`${(slot as TestUnit).statusEffect || 'Efeito Ativo'}: ${(slot as TestUnit).effectTurns} turnos`}
                                    className="text-yellow-400 font-extrabold animate-pulse"
                                >
                                    ⏳{(slot as TestUnit).effectTurns}
                                </span>
                            )}
                            {isUnit && (slot as TestUnit).card.id === '17' && (board === 'player' ? enemyBoard : playerBoard).filter(c => c !== null).length >= 3 && <span title="Multi-Ataque Ativo" className="text-red-500 animate-pulse">⚔️x2</span>}
                            {cleanText(isUnit ? (slot as TestUnit).card.name : (slot as any).name)}
                        </span>
                        {isUnit && (slot as TestUnit).card.atk !== undefined && (
                            <div className="flex gap-3 text-[8px] font-black mt-2">
                                <span className="text-red-400">ATK {(slot as TestUnit).currentAttack}</span>
                                <span className="text-blue-400">DEF {(slot as TestUnit).currentHealth}</span>
                            </div>
                        )}
                        {!isUnit && (
                            <div className="text-[7px] text-white/30 font-bold uppercase mt-2">MÃO</div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1 group w-full h-full relative">
                        <div className="text-[8px] font-black text-white/5 uppercase italic absolute inset-0 flex items-center justify-center pointer-events-none">LIVRE</div>
                        {board !== 'hand' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); spawnRandom(board as 'player' | 'enemy', index); }}
                                className="z-10 bg-white/5 p-1.5 rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 transform active:scale-95"
                                title="Spawnar carta aleatória"
                            >
                                <Dices size={12} className="text-white/40 group-hover:text-white/80" />
                            </button>
                        )}
                    </div>
                )}
                {/* 🪦 GRAVEYARD MODAL */}
                {showGraveyard && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-widest uppercase">
                                        {graveyardSelectorMode?.title || (showGraveyard === 'player' ? 'Cemitério do Jogador' : 'Cemitério do Oponente')}
                                    </h3>
                                    <p className="text-xs text-white/40 font-mono mt-1">
                                        Total: {(showGraveyard === 'player' ? playerGraveyard : enemyGraveyard).length} cartas
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setShowGraveyard(null); setGraveyardSelectorMode(null); }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-4 sm:grid-cols-5 gap-3 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {(showGraveyard === 'player' ? playerGraveyard : enemyGraveyard).length === 0 ? (
                                    <div className="col-span-full h-32 flex items-center justify-center text-white/20 font-mono text-sm border-2 border-dashed border-white/5 rounded-xl">
                                        Cemitério Vazio
                                    </div>
                                ) : (
                                    (showGraveyard === 'player' ? playerGraveyard : enemyGraveyard)
                                        .filter(card => !graveyardSelectorMode?.filter || graveyardSelectorMode.filter(card)) // 🛡️ FILTRO
                                        .map((card, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    if (graveyardSelectorMode) {
                                                        graveyardSelectorMode.onSelect(card);
                                                        setShowGraveyard(null);
                                                        setGraveyardSelectorMode(null);
                                                    }
                                                }}
                                                className={`relative group cursor-pointer aspect-[2/3] bg-black/40 border ${graveyardSelectorMode ? 'border-purple-500/30 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/5 hover:border-white/20'} rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:z-10`}
                                            >
                                                <img src={card.image} className={`w-full h-full object-cover transition-all duration-300 ${graveyardSelectorMode ? 'opacity-80 group-hover:opacity-100 grayscale hover:grayscale-0' : 'opacity-60 group-hover:opacity-100'}`} alt={card.name} />

                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 pt-6 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-[9px] font-black text-white leading-tight mb-0.5 truncate">{card.name}</div>
                                                    <div className="flex justify-between items-center text-[8px] font-mono text-white/50">
                                                        <span className="text-red-400">⚔️ {card.atk}</span>
                                                        <span className="text-blue-400">🛡️ {card.def}</span>
                                                    </div>
                                                </div>

                                                {/* Badge de Seleção */}
                                                {graveyardSelectorMode && (
                                                    <div className="absolute top-2 right-2 bg-purple-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                                                        REVIVER
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                )}
                            </div>

                            {graveyardSelectorMode && (
                                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-3 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
                                    <span className="text-[10px] text-purple-300 font-bold tracking-wide">
                                        SELECIONE UMA CARTA PARA RESSUSCITAR
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => { setShowGraveyard(null); setGraveyardSelectorMode(null); }}
                                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-black text-white uppercase"
                            >
                                FECHAR
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`flex flex-row h-screen w-screen overflow-hidden bg-[#030305] text-white selection:bg-purple-500/30`}>
            <button
                onClick={() => navigate(-1)}
                className="fixed left-4 top-4 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 border border-zinc-700 text-white/70 hover:text-white transition-all shadow-lg hover:bg-zinc-700"
                title="Voltar"
            >
                <ArrowLeft size={18} />
            </button>
            {/* BATTLEFIELD (14 SLOTS: 2x7) */}
            <div className={`flex-1 h-screen flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_rgba(30,30,40,0.4)_0%,_transparent_70%)] relative ${sideBarOnRight ? 'order-1' : 'order-2'}`}>

                {/* MÃO OPONENTE (Horizontal Slim) */}
                <div className="w-full max-w-4xl px-8 flex justify-between items-center mb-2 gap-4">
                    <div className="relative group ml-8 shrink-0">
                        <button 
                            onClick={() => setShowGraveyard('enemy')} 
                            onDragOver={(e) => { handleDragOver(e); if (overGrave !== 'enemy') setOverGrave('enemy'); }}
                            onDragLeave={() => setOverGrave(null)}
                            onDrop={(e) => { handleGraveDrop(e, 'enemy'); setOverGrave(null); }}
                            className={`w-12 h-16 border border-dashed rounded flex flex-col items-center justify-center transition-all cursor-pointer relative ${overGrave === 'enemy' ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-105' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-500'}`}
                        >
                            <Ghost size={14} className={`${overGrave === 'enemy' ? 'text-red-400' : 'text-zinc-600'} mb-0.5`} />
                            <span className="text-[7px] font-mono font-black text-zinc-500 uppercase">GRAVE</span>
                            {enemyGraveyard.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-600/80 text-white text-[8px] font-black px-1 rounded-full shadow-lg border border-white/10">
                                    {enemyGraveyard.length}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="flex flex-row justify-center gap-1 w-full overflow-hidden">
                        {enemyHand.map((card, i) => (
                            <div
                                key={i}
                                onClick={() => card && setSelectedCard({ card, index: i, owner: 'enemy' })}
                                draggable={!!card}
                                onDragStart={(e) => handleDragStart(e, 'HAND', i, 'enemy')}
                                onDragOver={handleDragOver}
                                onDrop={(e) => { e.stopPropagation(); handleHandDrop(e, 'enemy', i); }}
                                className={`h-10 flex-1 min-w-0 max-w-[80px] shrink-0 rounded border flex items-center justify-center px-1 relative group cursor-pointer ${card ? (selectedCard?.owner === 'enemy' && selectedCard?.index === i ? 'bg-red-500/30 border-red-400 scale-105' : 'bg-red-500/10 border-red-500/30') : 'bg-white/5 border-white/10'}`}
                            >
                                {card ? (
                                    <>
                                        <span className="text-[8px] font-bold text-white/80 truncate px-1">{card.name}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); const newHand = [...enemyHand]; newHand[i] = null; setEnemyHand(newHand); if(selectedCard?.index === i && selectedCard?.owner === 'enemy') setSelectedCard(null); }}
                                            className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[10px] font-black"
                                        >
                                            [X]
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-[8px] text-white/10">---</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end whitespace-nowrap bg-black/40 px-4 py-2 rounded-lg border border-red-500/20">
                            <span className="text-[8px] font-black uppercase text-red-500/50">OPONENTE HP</span>
                            <span className="text-2xl font-black text-red-500 italic">{enemyHP}</span>
                        </div>
                    </div>
                </div>

                {/* P2 AREA */}
                <div className="flex flex-col items-center gap-4 mb-4 transition-all w-full">
                    <div className="grid grid-cols-7 justify-items-center gap-3 w-full max-w-5xl px-4">
                        {enemyBoard.map((slot, i) => renderSlot(slot, i, 'enemy'))}
                    </div>
                </div>

                <div className="w-full h-px bg-white/5 my-8 shadow-[0_0_20px_rgba(255,255,255,0.05)]" />

                {/* P1 AREA */}
                <div className="flex flex-col items-center gap-4 mt-4 transition-all w-full">
                    <div className="grid grid-cols-7 justify-items-center gap-3 w-full max-w-5xl px-4">
                        {playerBoard.map((slot, i) => renderSlot(slot, i, 'player'))}
                    </div>
                </div>

                {/* MINHA MÃO (Horizontal Slim) */}
                <div className="w-full max-w-4xl px-8 flex justify-between items-center mt-2 gap-4">
                    <div className="relative group shrink-0">
                        <button 
                            onClick={() => setShowGraveyard('player')} 
                            onDragOver={(e) => { handleDragOver(e); if (overGrave !== 'player') setOverGrave('player'); }}
                            onDragLeave={() => setOverGrave(null)}
                            onDrop={(e) => { handleGraveDrop(e, 'player'); setOverGrave(null); }}
                            className={`w-12 h-16 border border-dashed rounded flex flex-col items-center justify-center transition-all cursor-pointer relative ${overGrave === 'player' ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-500'}`}
                        >
                            <Ghost size={14} className={`${overGrave === 'player' ? 'text-blue-400' : 'text-zinc-600'} mb-0.5`} />
                            <span className="text-[7px] font-mono font-black text-zinc-500 uppercase">GRAVE</span>
                            {playerGraveyard.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-blue-600/80 text-white text-[8px] font-black px-1 rounded-full shadow-lg border border-white/10">
                                    {playerGraveyard.length}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="flex flex-row justify-center gap-1 w-full overflow-hidden">
                        {playerHand.map((card, i) => (
                            <div
                                key={i}
                                onClick={() => card && setSelectedCard({ card, index: i, owner: 'player' })}
                                draggable={!!card}
                                onDragStart={(e) => handleDragStart(e, 'HAND', i, 'player')}
                                onDragOver={handleDragOver}
                                onDrop={(e) => { e.stopPropagation(); handleHandDrop(e, 'player', i); }}
                                className={`h-10 flex-1 min-w-0 max-w-[80px] shrink-0 rounded border flex items-center justify-center px-1 relative group cursor-pointer ${card ? (selectedCard?.owner === 'player' && selectedCard?.index === i ? 'bg-blue-500/30 border-blue-400 scale-105' : 'bg-blue-500/10 border-blue-500/30') : 'bg-white/5 border-white/10'}`}
                            >
                                {card ? (
                                    <>
                                        <span className="text-[8px] font-bold text-white/80 truncate px-1">{card.name}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); const newHand = [...playerHand]; newHand[i] = null; setPlayerHand(newHand); if(selectedCard?.index === i && selectedCard?.owner === 'player') setSelectedCard(null); }}
                                            className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[10px] font-black"
                                        >
                                            [X]
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-[8px] text-white/10">---</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="ml-4 flex flex-col items-start whitespace-nowrap bg-black/40 px-4 py-2 rounded-lg border border-blue-500/20">
                            <span className="text-[8px] font-black uppercase text-blue-500/50">JOGADOR HP</span>
                            <span className="text-2xl font-black text-blue-500 italic">{playerHP}</span>
                        </div>
                    </div>
                </div>


                {
                    attackMode && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-600/20 border border-red-500/50 backdrop-blur-md px-6 py-3 rounded-full animate-bounce">
                            <span className="text-xs font-black text-red-400 uppercase italic tracking-tighter flex items-center gap-2">
                                <Swords size={14} /> MODO DE ATAQUE ATIVO: SELECIONE O ALVO
                            </span>
                        </div>
                    )
                }
                {
                    effectMode && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40px] z-50 bg-purple-600/20 border border-purple-500/50 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_0_20px_purple] flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <span className="text-xs font-black text-purple-400 uppercase italic tracking-tighter flex items-center gap-2 animate-pulse">
                                <Play size={14} /> MODO EFEITO: {goblinTargetsDestroyed > 0 ? `SELECIONE MAIS ${2 - goblinTargetsDestroyed} ALVO(S)` : 'SELECIONE O ALVO'}
                            </span>
                            <button
                                onClick={() => {
                                    setEffectMode(null);
                                    setGoblinTargetsDestroyed(0);
                                    log('🚫 Seleção cancelada.');
                                }}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px] font-bold uppercase px-3 py-1.5 rounded border border-red-500/30 transition-all hover:scale-105 active:scale-95"
                            >
                                CANCELAR
                            </button>
                        </div>
                    )
                }
                {
                    reflectionMode && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] z-50 bg-blue-600/20 border border-blue-500/50 backdrop-blur-md px-6 py-3 rounded-full animate-bounce shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                            <span className="text-xs font-black text-blue-400 uppercase italic tracking-tighter flex items-center gap-2">
                                <Swords size={14} /> REFLEXÃO DO CAPITÃO: SELECIONE UM ALVO INIMIGO!
                            </span>
                        </div>
                    )
                }
            </div>

            {/* SIDEBAR DIREITA: Busca + Painel Duplo */}
            <div className={`w-64 min-w-[256px] max-w-[256px] h-full overflow-hidden flex flex-col bg-black/80 border-white/5 z-40 backdrop-blur-2xl transition-all ${sideBarOnRight ? 'order-2 border-l' : 'order-1 border-r'}`}>
                
                {/* 🔍 BARRA DE PESQUISA SUPERIOR */}
                <div className="p-4 border-b border-white/5 flex flex-col gap-3">
                    {/* Elemento Busca + Voltar */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-lg pl-3 pr-12 py-2.5 text-xs text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-white/20"
                            />
                            <button onClick={() => setShowCardList(prev => !prev)} className="absolute right-2 top-2.5 text-white/35 hover:text-white transition-colors" title="Lista">
                                {showCardList ? <X size={12} /> : <Search size={12} />}
                            </button>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-8 top-2.5 text-white/30 hover:text-white transition-colors text-xs font-black"
                                >
                                    [X]
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Resultados de Busca (Limitado a 3) */}
                    {searchQuery && filteredCards.length > 0 && (
                        <div className="bg-zinc-950/95 border border-white/10 rounded-lg overflow-hidden shadow-xl">
                            {filteredCards.slice(0, 3).map(card => (
                                <div key={card.id} className="py-1.5 px-2 border-b border-white/5 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${getCardStatusClass(card.id)}`} />
                                        <div className="text-[10px] font-bold text-white truncate">{card.name}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setSelectedCardId(card.id); spawnToField(true, card.id); setSelectedSearchItem(null); setSearchQuery(''); }} className="flex-1 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[8px] rounded border border-blue-500/20">P1</button>
                                        <button onClick={() => { setSelectedCardId(card.id); spawnToField(false, card.id); setSelectedSearchItem(null); setSearchQuery(''); }} className="flex-1 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[8px] rounded border border-red-500/20">P2</button>
                                        <button onClick={() => { setSelectedCardId(card.id); spawnToHand(card.id); setSelectedSearchItem(null); setSearchQuery(''); }} className="flex-1 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[8px] rounded border border-purple-500/20">MÃO</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showCardList && (
                        <div className="w-full max-w-full max-h-[calc(100vh-150px)] overflow-y-auto overflow-x-hidden bg-zinc-950/95 border border-white/10 rounded-lg p-2 flex flex-col gap-2">
                            <div className="grid grid-cols-3 gap-1">
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'ok' | 'pending')} className="appearance-none text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white text-center cursor-pointer">
                                    <option value="all">Status</option>
                                    <option value="ok">OK</option>
                                    <option value="pending">Pendente</option>
                                </select>
                                <select value={universeFilter} onChange={(e) => setUniverseFilter(e.target.value)} className="appearance-none text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white text-center cursor-pointer">
                                    <option value="all">Universo</option>
                                    {universeOptions.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                                <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)} className="appearance-none text-[9px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white text-center cursor-pointer">
                                    <option value="all">Raridade</option>
                                    {rarityOptions.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                        <div className="w-full flex flex-col gap-0.5 overflow-y-auto pr-1">
                            {inlineCardList.map(card => (
                                <div key={card.id} className="py-0.5 px-1.5 border-b border-white/5 hover:bg-white/5 transition-all group flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${getCardStatusClass(card.id)}`} />
                                    <button
                                        onClick={() => { setSelectedCardId(card.id); setCardPopup({ unit: createUnit(card), board: 'player', index: 0 }); }}
                                        className="flex-1 text-left text-[10px] font-bold text-white/90 truncate"
                                    >
                                        {card.name}
                                    </button>
                                    <div className="flex items-center justify-end min-w-[70px]">
                                        <div className="flex gap-2 text-[9px] font-mono group-hover:hidden whitespace-nowrap opacity-60">
                                            <span className="text-red-400/80">A:{card.atk}</span>
                                            <span className="text-blue-400/80">D:{card.def}</span>
                                        </div>
                                        <div className="hidden group-hover:flex gap-1 shrink-0">
                                            <button onClick={() => { setSelectedCardId(card.id); spawnToHand(card.id); }} className="w-5 h-5 flex items-center justify-center bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded hover:bg-purple-500/30">M</button>
                                            <button onClick={() => { setSelectedCardId(card.id); spawnToField(true, card.id); }} className="w-5 h-5 flex items-center justify-center bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded hover:bg-blue-500/30">1</button>
                                            <button onClick={() => { setSelectedCardId(card.id); spawnToField(false, card.id); }} className="w-5 h-5 flex items-center justify-center bg-red-500/10 text-red-300 border border-red-500/20 rounded hover:bg-red-500/30">2</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </div>
                    )}

                    {!showCardList && (
                    <>
                    <div className={`grid grid-cols-3 gap-1.5 ${sideBarOnRight ? '' : '[direction:rtl]'}`}>
                        <button onClick={nextTurn} className="py-1.5 text-[9px] font-black uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 rounded transition-all [direction:ltr]">TURNO</button>
                        <button onClick={() => { setShowResetMenu(prev => !prev); setShowRandomMenu(false); setShowSetupMenu(false); }} className="py-1.5 text-[9px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded transition-all [direction:ltr]">RESET</button>
                        <button onClick={() => setSideBarOnRight(prev => !prev)} className="py-1.5 text-[9px] font-black uppercase bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 rounded transition-all [direction:ltr]">L/R</button>
                    </div>
                    {showResetMenu && (
                        <div className="grid grid-cols-3 gap-1">
                            <button onClick={resetEnemy} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-red-300">ADV</button>
                            <button onClick={resetPlayer} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-blue-300">MEU</button>
                            <button onClick={resetAll} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white/80">AMBOS</button>
                        </div>
                    )}
                    {showRandomMenu && (
                        <div className="grid grid-cols-3 gap-1">
                            <button onClick={() => fillArena(false)} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-red-300">ADV</button>
                            <button onClick={() => fillArena(true)} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-blue-300">MEU</button>
                            <button onClick={() => { fillArena(true); fillArena(false); setShowRandomMenu(false); }} className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-full text-white/80">AMBOS</button>
                        </div>
                    )}
                    <div className={`flex items-center gap-2 ${sideBarOnRight ? '' : '[direction:rtl]'}`}>
                        <button onClick={handleNormalSetup} className="flex-1 py-1.5 text-[9px] font-black uppercase bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 rounded transition-all [direction:ltr]">SETUP</button>
                        <button onClick={() => { setShowRandomMenu(prev => !prev); setShowResetMenu(false); setShowSetupMenu(false); }} className="flex-1 py-1.5 text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 rounded transition-all [direction:ltr]">ALEATÓRIO</button>
                        <button onClick={undo} disabled={historyIndex <= 0} title="Desfazer" className={`w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-xs border border-zinc-700 hover:bg-zinc-700 flex-none [direction:ltr] ${historyIndex > 0 ? 'opacity-100 text-zinc-300' : 'opacity-20 pointer-events-none text-zinc-500'}`}>
                            <RotateCcw size={10} />
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Refazer" className={`w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-xs border border-zinc-700 hover:bg-zinc-700 flex-none [direction:ltr] ${historyIndex < history.length - 1 ? 'opacity-100 text-zinc-300' : 'opacity-20 pointer-events-none text-zinc-500'}`}>
                            <RotateCw size={10} />
                        </button>
                    </div>
                    </>
                    )}
                </div>

                {/* 🔄 SWITCHER (Habilidades vs Log) */}
                {/* 📜 ÁREA DE CONTEÚDO (Overflow) */}
                <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3">
                        <div className="flex-[0.48] flex flex-col min-h-0 bg-black/20 rounded-lg border border-white/5 p-3">
                            {cardPopup ? (
                                <>
                                    <div className="text-[11px] font-bold text-white mb-3 text-center">{cardPopup.unit.card.name} (AT: {cardPopup.unit.currentAttack} DF: {cardPopup.unit.currentHealth})</div>
                                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                                        <p className="text-[11px] text-white/70 leading-relaxed">
                                            {cardPopup.unit.card.description || 'Sem habilidade especial'}
                                            {cardPopup.unit.card.id === '152' && cardPopup.unit.customState?.hbActive && (
                                                <span className="block mt-2 text-xs">HB Ativa</span>
                                            )}
                                            {cardPopup.unit.card.id === '152' && (
                                                <span className="block mt-2">Limite: 2 ataques por turno</span>
                                            )}
                                        </p>
                                    </div>
                                    {cardPopup.unit.card.id === '126' && cardPopup.unit.effectTurns !== undefined && cardPopup.unit.effectTurns > 0 && (
                                        <button
                                            onClick={() => triggerIronManHb(cardPopup.unit)}
                                            className="w-full mt-3 py-2 bg-orange-600/80 text-[9px] font-black text-white uppercase rounded-lg shadow-lg hover:bg-orange-500"
                                        >
                                            [HB]
                                        </button>
                                    )}
                                    {cardPopup.unit.card.id === '90' && lanternDefensePrompt?.activeLanternId === cardPopup.unit.id ? (
                                        <div className="mt-3 grid grid-cols-3 gap-1">
                                            <button onClick={() => executeAttack(lanternDefensePrompt.targetBoard, lanternDefensePrompt.targetIndex, 'counter')} className="py-2 bg-emerald-600/80 text-[8px] font-black text-white uppercase rounded-lg hover:bg-emerald-500">Ignorar e Atacar</button>
                                            <button onClick={() => executeAttack(lanternDefensePrompt.targetBoard, lanternDefensePrompt.targetIndex, 'defend')} className="py-2 bg-blue-600/80 text-[8px] font-black text-white uppercase rounded-lg hover:bg-blue-500">Defender</button>
                                            <button onClick={() => executeAttack(lanternDefensePrompt.targetBoard, lanternDefensePrompt.targetIndex, 'none')} className="py-2 bg-zinc-700/80 text-[8px] font-black text-white uppercase rounded-lg hover:bg-zinc-600">Nada</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => executeEffect(cardPopup.board, cardPopup.index, cardPopup.unit)}
                                            className="w-full mt-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-[9px] font-black text-white uppercase rounded-lg shadow-lg hover:shadow-purple-500/50"
                                        >
                                            {cardPopup.unit.card.id === '26' && (cardPopup.unit.counters?.dodge || 0) > 0 && !cardPopup.unit.customState?.uiKamehamehaUsed ? 'Kamehameha' : cardPopup.unit.card.id === '90' && cardPopup.unit.customState?.lanternManual ? 'Acao Construto' : cardPopup.unit.card.id === '93' && cardPopup.unit.customState?.helaActive && !cardPopup.unit.customState?.helaStealUsed ? 'Roubar Carta' : cardPopup.unit.card.id === '36' && cardPopup.unit.customState?.thorManual && !cardPopup.unit.customState?.thorManualUsed ? 'Eliminar Oponente' : 'USAR EFEITO'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                                    <div className="text-3xl mb-2">🃏</div>
                                    <div className="text-[9px] text-center">Nenhuma carta selecionada</div>
                                </div>
                            )}
                        </div>
                        <div className="flex-[0.52] min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 bg-black/20 rounded-lg border border-white/5 p-3" onDoubleClick={() => navigator.clipboard.writeText(eventLog.join('\n')).then(() => alert('Log copiado!'))}>
                            <div className="sticky top-0 z-10 bg-black/90 pb-2 mb-2 flex items-start justify-between gap-2 border-b border-white/10">
                                <div className="text-[9px] text-white/70 leading-relaxed flex-1">
                                    {eventLog[0]}
                                </div>
                                <button onClick={copyLog} className="flex-shrink-0 p-0" title="Copiar log">
                                    <Copy size={14} className="text-gray-400 hover:text-white cursor-pointer" />
                                </button>
                            </div>
                            {eventLog.slice(1).map((msg, i) => (
                                <div key={i} className="text-[9px] text-white/50 leading-relaxed mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                                    {msg}
                                </div>
                            ))}
                        </div>
                </div>
            </div>

            {/* 🆕 OVERLAY - Lista Completa */}
            {
                false && showCardList && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
                        onClick={() => setShowCardList(false)}
                    >
                        <div
                            className="bg-gray-900/95 backdrop-blur-md border border-purple-500/50 rounded-xl shadow-[0_0_40px_rgba(168,85,247,0.4)] max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header com Busca Integrada (V4.0) */}
                            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 border-b border-white/10 flex justify-between items-center gap-4">
                                <h2 className="text-lg font-black text-white uppercase tracking-wide shrink-0">
                                    📇 TODAS AS CARTAS ({cards.length})
                                </h2>

                                {/* 🔍 Barra de Busca */}
                                <div className="flex-1 relative max-w-md group">
                                    <input
                                        type="text"
                                        placeholder="Comece a digitar para filtrar..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/40 border border-white/20 rounded-full px-10 py-2 text-xs text-white focus:border-purple-500 focus:bg-black/60 focus:outline-none transition-all placeholder:text-white/20"
                                        autoFocus
                                    />
                                    <Search size={14} className="absolute left-3.5 top-2.5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-2.5 text-white/30 hover:text-white transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowCardList(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Lista de Cartas */}
                            <div className="p-6 overflow-y-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {cards
                                        .filter(c =>
                                            normalizeSearch(c.name).includes(normalizeSearch(searchQuery)) ||
                                            c.id.includes(normalizeSearch(searchQuery))
                                        )
                                        .map(card => {
                                            const isValidated = validatedCards.includes(card.id);
                                            const isTested = testedCards.has(card.id);

                                            return (
                                                <div
                                                    key={card.id}
                                                    className="bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-lg p-3 transition-all cursor-pointer group flex flex-col gap-2 relative overflow-hidden"
                                                >
                                                    {/* Header Card */}
                                                    <div
                                                        className="flex items-start gap-2"
                                                        onClick={() => {
                                                            setSelectedCardId(card.id);
                                                            setSearchQuery(card.name);
                                                            setCardPopup({ unit: createUnit(card), board: 'player', index: 0 }); // Show details
                                                        }}
                                                    >
                                                        {/* Checkbox Testado */}
                                                        <div
                                                            className={`w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors ${isTested ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white/50 bg-black'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleTested(card.id);
                                                            }}
                                                            title="Marcar como testado"
                                                        >
                                                            {isTested && <Check size={10} className="text-black stroke-[3]" />}
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-[9px] font-bold leading-tight flex items-center gap-1 ${isTested ? 'text-green-500 line-through' : 'text-white group-hover:text-purple-300'}`}>
                                                                {isValidated && <span className="bg-green-500 w-2 h-2 rounded-full inline-block mr-1" title="Validado" />}
                                                                {card.name}
                                                            </div>
                                                            <div className="text-[7px] text-white/30 mt-1 flex justify-between items-center">
                                                                <span>ID {card.id}</span>
                                                                <div className="flex gap-1.5 opacity-60">
                                                                    <span className="text-red-400 flex items-center gap-0.5">⚔️{card.atk}</span>
                                                                    <span className="text-blue-400 flex items-center gap-0.5">🛡️{card.def}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 🎮 Botões de Ação (V4.0) */}
                                                    <div className="grid grid-cols-3 gap-1 mt-1 pt-2 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCardId(card.id);
                                                                setSearchQuery(card.name);
                                                                spawnToHand(card.id);
                                                            }}
                                                            className="py-1.5 bg-purple-500/10 hover:bg-purple-500/30 border border-purple-500/20 rounded text-[7px] font-black uppercase text-purple-300 transition-all text-center hover:scale-105 active:scale-95"
                                                            title="Adicionar à Mão"
                                                        >
                                                            ✋ MÃO
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCardId(card.id);
                                                                setSearchQuery(card.name);
                                                                spawnToField(true, card.id); // P1
                                                            }}
                                                            className="py-1.5 bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 rounded text-[7px] font-black uppercase text-blue-300 transition-all text-center hover:scale-105 active:scale-95"
                                                            title="Adicionar ao P1"
                                                        >
                                                            🎯 P1
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedCardId(card.id);
                                                                setSearchQuery(card.name);
                                                                spawnToField(false, card.id); // P2
                                                            }}
                                                            className="py-1.5 bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 rounded text-[7px] font-black uppercase text-red-300 transition-all text-center hover:scale-105 active:scale-95"
                                                            title="Adicionar ao P2"
                                                        >
                                                            🎯 P2
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                {/* Empty State */}
                                {cards.filter(c => normalizeSearch(c.name).includes(normalizeSearch(searchQuery)) || c.id.includes(normalizeSearch(searchQuery))).length === 0 && (
                                    <div className="text-center py-12 text-white/20 text-sm font-mono border-2 border-dashed border-white/5 rounded-xl">
                                        Nenhuma carta encontrada para "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 🎭 POPUP CUSTOMIZADO DO MYSTERIO */}
            {
                mysterioBlockPopup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-2 border-purple-500/50 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.6)] p-6 max-w-sm animate-[scale-in_0.2s_ease-out]">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-2">🎭</div>
                                <h3 className="text-white font-black text-lg uppercase tracking-wide">Mysterio</h3>
                            </div>

                            {/* Mensagem */}
                            <p className="text-white/90 text-center mb-6 text-sm">
                                Deseja usar o efeito de <span className="text-purple-400 font-bold">Mysterio</span> para bloquear o ataque de <span className="text-red-400 font-bold">{mysterioBlockPopup.attacker.card.name}</span>?
                            </p>

                            {/* Botões */}
                            <div className="flex gap-3">
                                <button
                                    onClick={mysterioBlockPopup.onCancel}
                                    className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-500/30 rounded-lg font-bold uppercase text-sm text-white/70 hover:text-white transition-all"
                                >
                                    ❌ Não
                                </button>
                                <button
                                    onClick={mysterioBlockPopup.onConfirm}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-bold uppercase text-sm text-white shadow-lg hover:shadow-purple-500/50 transition-all"
                                >
                                    ✅ Sim
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

