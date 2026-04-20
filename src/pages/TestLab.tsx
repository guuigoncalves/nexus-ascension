import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../contexts/CardContext';
import { ArrowLeft, ArrowRight, RotateCcw, Copy, Play, Swords, ChevronDown, ChevronUp, Search, Check, Dices, Trash2, X } from 'lucide-react';
import { parseAbilityToEffects, requiresTargetSelection, isOffensiveEffect } from '../utils/AbilityEngine';

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
    isStunned?: boolean; // Spider-Man Stun
    stunTurns?: number; // Spider-Man Stun Duration
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
    const [playerBoard, setPlayerBoard] = useState<TestSlot[]>(Array(10).fill(null));
    const [enemyBoard, setEnemyBoard] = useState<TestSlot[]>(Array(10).fill(null));
    const [selectedSlot, setSelectedSlot] = useState<{ board: 'player' | 'enemy' | 'hand', index: number } | null>(null);
    const [attackMode, setAttackMode] = useState<{ attackerId: string, attackerBoard: 'player' | 'enemy' } | null>(null);
    const [effectMode, setEffectMode] = useState<{ sourceId: string, sourceBoard: 'player' | 'enemy', type?: string, targetsLeft?: number, damage?: number, customCallback?: (targetBoard: 'player' | 'enemy', targetIndex: number) => void } | null>(null);
    const [playerHand, setPlayerHand] = useState<any[]>(Array(10).fill(null)); // 10 slots de mão
    const [enemyHand, setEnemyHand] = useState<any[]>(Array(10).fill(null)); // 🆕 Mão do oponente
    const [playerHP, setPlayerHP] = useState(8000);
    const [enemyHP, setEnemyHP] = useState(8000);
    const [playerGraveyard, setPlayerGraveyard] = useState<any[]>([]); // 🪦 Cemitério P1
    const [enemyGraveyard, setEnemyGraveyard] = useState<any[]>([]); // 🪦 Cemitério P2
    const [eventLog, setEventLog] = useState<string[]>(['🧪 Oficina iniciada']);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy'>('player');
    const [notes, setNotes] = useState<string>('');
    const [showResetMenu, setShowResetMenu] = useState(false);
    const [showCardSelector, setShowCardSelector] = useState(false);
    const [cardPopup, setCardPopup] = useState<{ unit: TestUnit, board: 'player' | 'enemy', index: number } | null>(null); // 🆕 Pop-up de efeito
    const [showCardList, setShowCardList] = useState(false); // 🆕 Overlay de lista de cartas
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

    // 🪦 GRAVEYARD SYSTEM
    const [showGraveyard, setShowGraveyard] = useState<'player' | 'enemy' | null>(null);
    const [graveyardSelectorMode, setGraveyardSelectorMode] = useState<{
        title: string;
        filter?: (card: any) => boolean; // 🆕 Filtro opcional
        onSelect: (card: any) => void;
    } | null>(null);



    // 🎯 HELPER: MIRA PRECISA GLADIADOR (V4.7)
    const forceTargetSelect = (originId: string, callback: (targetId: string) => void) => {
        const sourceBoard = playerBoard.some(u => u?.id === originId) ? 'player' : 'enemy';
        setEffectMode({
            sourceId: originId,
            sourceBoard: sourceBoard,
            type: 'custom_callback',
            customCallback: callback
        });
        log(`🎯 Selecione um alvo para ${cards.find(c => c.id === originId)?.name || 'Efeito'}`);
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
        '211', '212', '213', '214' // Outros
    ], []);

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
            const newPlayerBoard = Array(10).fill(null);

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

            // Setup Enemy Board: Asa Noturna (189) + 4 cartas "fracas" (DEF < 1000)
            const asaNoturna = cards.find(c => c.id === '189');
            const weakCards = cards.filter(c => (c.def || 0) < 1000).sort(() => Math.random() - 0.5).slice(0, 4);
            const newEnemyBoard = Array(10).fill(null);

            // Adicionar Asa Noturna no slot 0
            if (asaNoturna) newEnemyBoard[0] = createUnit(asaNoturna);

            // Adicionar cartas fracas nos slots seguintes
            weakCards.forEach((card, i) => {
                newEnemyBoard[i + 1] = createUnit(card);
            });




            // Setup Player Hand (4 cartas)
            const newPlayerHand = Array(10).fill(null);
            const randomCards = cards
                .filter(c => !['213', '212', '211', '189', '190', '191', '192', '194'].includes(c.id))
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);
            randomCards.forEach((card, i) => {
                newPlayerHand[i] = card;
            });

            // Setup Enemy Hand (4 cartas)
            const newEnemyHand = Array(10).fill(null);
            const enemyRandomCards = cards
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
    }, [cards]); // Executa quando cards carrega

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
        query = query.toLowerCase().replace(/\s+/g, '');
        target = target.toLowerCase().replace(/\s+/g, '');

        let queryIndex = 0;
        for (let i = 0; i < target.length && queryIndex < query.length; i++) {
            if (target[i] === query[queryIndex]) {
                queryIndex++;
            }
        }
        return queryIndex === query.length;
    }, []);

    // Filtered Cards for Search
    // Filtered Cards for Search
    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();

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
            const nameMatch = c.name.toLowerCase();

            const isExcluded = excludeKeywords.some(keyword =>
                nameMatch.includes(keyword)
            );

            if (isExcluded) return false;

            // Fuzzy search no nome ou busca exata no ID
            return fuzzyMatch(query, c.name) || c.id.toString().includes(query);
        }).slice(0, 5);
    }, [cards, searchQuery, fuzzyMatch]);

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [selectedSearchItem, setSelectedSearchItem] = useState<string | null>(null); // Controls which search item shows buttons

    const createUnit = (card: any): TestUnit => ({
        id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        card,
        currentHealth: card.def || 0,
        currentAttack: card.atk || 0,
        isSilenced: false
    });

    // --- DRAG & DROP HANDLERS ---
    const handleDragStart = (board: 'player' | 'enemy' | 'hand', index: number) => {
        setDraggedSlot({ board, index });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessário para permitir drop
    };

    const handleDrop = (targetBoard: 'player' | 'enemy' | 'hand', targetIndex: number) => {
        if (!draggedSlot) return;

        const sourceBoard = draggedSlot.board;
        const sourceIndex = draggedSlot.index;

        // Não fazer nada se soltar no mesmo slot
        if (sourceBoard === targetBoard && sourceIndex === targetIndex) {
            setDraggedSlot(null);
            return;
        }

        // Pegar arrays
        const getBoard = (type: 'player' | 'enemy' | 'hand') => {
            if (type === 'hand') return playerHand;
            return type === 'player' ? playerBoard : enemyBoard;
        };

        const sourceArr = [...getBoard(sourceBoard)];
        const targetArr = sourceBoard === targetBoard ? sourceArr : [...getBoard(targetBoard)];

        const draggedCard = sourceArr[sourceIndex];
        if (!draggedCard) {
            setDraggedSlot(null);
            return;
        }

        // Mover carta
        sourceArr[sourceIndex] = null;

        // Se destino tem carta, trocar posições
        if (targetArr[targetIndex]) {
            sourceArr[sourceIndex] = targetArr[targetIndex];
        }

        targetArr[targetIndex] = draggedCard;

        // Atualizar estados
        if (sourceBoard === 'hand') setPlayerHand(sourceArr);
        else if (sourceBoard === 'player') setPlayerBoard(sourceArr);
        else setEnemyBoard(sourceArr);

        if (targetBoard !== sourceBoard) {
            if (targetBoard === 'hand') setPlayerHand(targetArr);
            else if (targetBoard === 'player') setPlayerBoard(targetArr);
            else setEnemyBoard(targetArr);
        }

        log(`🔄 Carta movida de ${sourceBoard.toUpperCase()}[${sourceIndex}] para ${targetBoard.toUpperCase()}[${targetIndex}]`);
        setDraggedSlot(null);
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




    const spawnToField = useCallback((isPlayer: boolean) => {
        if (!selectedCardId) return;
        const card = cards.find(c => c.id === selectedCardId);
        if (!card) return;
        const board = isPlayer ? playerBoard : enemyBoard;
        const emptySlot = board.findIndex(slot => slot === null);
        if (emptySlot === -1) { log(`⚠️ Sem slots disponíveis (${isPlayer ? 'P1' : 'P2'})`); return; }

        const newUnit: TestUnit = {
            id: `${card.id}-${Date.now()}`,
            card,
            currentHealth: card.def || 0,
            currentAttack: card.atk || 0
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
            currentAttack: card.atk || 0
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
    }, [playerBoard, enemyBoard, playerHand, log, saveHistory]);

    const spawnToHand = useCallback(() => {
        if (!selectedCardId) return;
        const card = cards.find(c => c.id === selectedCardId);
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
            currentAttack: card.atk || 0
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

    // 🔄 SETUP DA ROTAÇÃO DO LABORATÓRIO
    const setupLabRotation = useCallback(() => {
        // IDs da rotação atual
        const PLAYER_HAND_IDS = ['189', '190', '191']; // Asa Noturna, Caveira, Duende Verde
        const ENEMY_FIELD_IDS = ['193', '194', '195', '11', '13', '18']; // Groot, Gavião, Mysterio + 3 alvos

        // Limpar tudo
        setPlayerBoard(Array(10).fill(null));
        setEnemyBoard(Array(10).fill(null));
        setPlayerHand(Array(10).fill(null));
        setEnemyHand(Array(10).fill(null));

        // Adicionar cartas à mão do jogador
        const newPlayerHand = Array(10).fill(null);
        PLAYER_HAND_IDS.forEach((cardId, idx) => {
            const card = cards.find(c => c.id === cardId);
            if (card) newPlayerHand[idx] = card;
        });
        setPlayerHand(newPlayerHand);

        // Adicionar cartas ao campo inimigo
        const newEnemyBoard = Array(10).fill(null);
        ENEMY_FIELD_IDS.forEach((cardId, idx) => {
            const card = cards.find(c => c.id === cardId);
            if (card) {
                newEnemyBoard[idx] = {
                    id: `${card.id}-${Date.now()}-${idx}`,
                    card,
                    currentAttack: card.atk || 0,
                    currentHealth: card.def || 1000
                };
            }
        });
        setEnemyBoard(newEnemyBoard);

        log('🔄 Laboratório configurado: Asa Noturna, Caveira Vermelha, Soldados 187-188 prontos | Recrutas 202-206 no campo inimigo');
        saveHistory(Array(10).fill(null), newEnemyBoard, newPlayerHand);
    }, [cards, log, saveHistory]);

    // ⏳ PASSAR TURNO - Processar efeitos temporários
    const nextTurn = useCallback(() => {
        const processBoard = (board: TestSlot[]): TestSlot[] => {
            return board.map(unit => {
                if (!unit) return unit;

                const updated = { ...unit };

                // Decrementar contador de turnos de efeitos
                if (updated.effectTurns !== undefined && updated.effectTurns > 0) {
                    updated.effectTurns -= 1;

                    // Se o efeito expirou
                    if (updated.effectTurns <= 0) {
                        // Reverter ATK
                        if (updated.originalAttack !== undefined) {
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

                        // Sincronizar card stats
                        updated.card.atk = updated.currentAttack;
                        updated.card.def = updated.currentHealth;

                        // Reverter Status Bool
                        updated.isStunned = false;

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

                        updated.statusText = undefined;
                        updated.statusEffect = undefined;

                        log(`⏲️ Efeito de ${unit.card.name} expirou.`);
                    } else {
                        // Atualizar texto do status
                        if (updated.statusText && updated.statusText.includes('T')) {
                            updated.statusText = updated.statusText.replace(/\d+T/, `${updated.effectTurns}T`);
                        }
                    }
                }

                // ↩️ Reset de ataques por turno (Goten, Rock Lee, etc.)
                (updated as any).attacksThisTurn = 0;
                if (updated.maxAttacks !== undefined) {
                    updated.maxAttacks = undefined; // Limpa multi-ataque ao virar turno
                }

                return updated;
            });
        };

        const newPlayerBoard = processBoard(playerBoard);
        const newEnemyBoard = processBoard(enemyBoard);

        setPlayerBoard(newPlayerBoard);
        setEnemyBoard(newEnemyBoard);
        saveHistory(newPlayerBoard, newEnemyBoard, playerHand);

        log('⏳ Turno avançado. Efeitos temporários atualizados.');
    }, [playerBoard, enemyBoard, playerHand, log, saveHistory]);


    const executeAttack = useCallback((targetBoard: 'player' | 'enemy', targetIndex: number) => {
        if (!attackMode) return;
        const attackerBoard = attackMode.attackerBoard === 'player' ? playerBoard : enemyBoard;
        const attacker = attackerBoard.find(u => u?.id === attackMode.attackerId);
        const defenderBoard = targetBoard === 'player' ? playerBoard : enemyBoard;
        const defender = defenderBoard[targetIndex];

        if (!attacker || !defender) { setAttackMode(null); return; }

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

        // 🛡️ VERIFICAÇÃO DE IMUNIDADE (Asa Noturna)
        // Se o DEFENSOR é imune, bloqueia o ataque
        if (defender.statusEffect === 'immune') {
            log(`🛡️ ${defender.card.name} está IMUNE! Ataque de ${attacker.card.name} bloqueado completamente.`);
            setAttackMode(null);
            setSelectedSlot(null);
            return;
        }

        // Se o ATACANTE é imune, ele não recebe dano de contra-ataque
        const attackerIsImmune = attacker.statusEffect === 'immune';

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

        const attackerDamage = attacker.currentAttack; // ATK do atacante
        const defenderDefense = defender.currentHealth; // DEF do defensor (currentHealth = DEF)
        const isDefenderKilled = attackerDamage >= defenderDefense;
        // ✅ FIX V4.8: Atacante NUNCA morre em combate normal.
        // Apenas habilidades de Reflexo/Espinhos causam dano de volta (já tratadas acima com return).
        const isAttackerKilled = false;

        let newPBoard = [...playerBoard];
        let newEBoard = [...enemyBoard];

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
            newEBoard = newEBoard.map((u, i) => (i === targetIndex ? (isDefenderKilled ? processDeath(u!, 'enemy', i) : (u ? { ...u, currentHealth: u.currentHealth - attackerDamage } : null)) : u));
        } else {
            // Atacante (Enemy)
            newEBoard = newEBoard.map((u, i) => (u?.id === attacker.id ? (isAttackerKilled ? processDeath(u, 'enemy', i) : u) : u));
            // Defensor (Player)
            newPBoard = newPBoard.map((u, i) => (i === targetIndex ? (isDefenderKilled ? processDeath(u!, 'player', i) : (u ? { ...u, currentHealth: u.currentHealth - attackerDamage } : null)) : u));
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

        // ⚡ GOTEN BONUS CHECK - +300 ATK apenas no 2º ataque do turno
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
        const remainingAttacks = attackerFinalUnit?.maxAttacks ? (attackerFinalUnit.maxAttacks - 1) : 0;

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
                const newBoard = [...targetBoardArray];
                const damagedUnit = { ...targetUnit };
                const dmg = effectMode.damage || sourceUnit.currentAttack;

                damagedUnit.currentHealth -= dmg;
                damagedUnit.card.def = damagedUnit.currentHealth;

                // Processar morte simples (sem triggers complexos por enquanto)
                if (damagedUnit.currentHealth <= 0) {
                    newBoard[targetIndex] = null;
                    log(`⚔️ Zoro cortou ${damagedUnit.card.name}! (-${dmg}) [Destruído]`);
                } else {
                    newBoard[targetIndex] = damagedUnit;
                    log(`⚔️ Zoro cortou ${damagedUnit.card.name}! (-${dmg})`);
                }
                setTargetBoard(newBoard);

                const remaining = (effectMode.targetsLeft || 1) - 1;
                if (remaining > 0) {
                    setEffectMode({ ...effectMode, targetsLeft: remaining });
                    log(`⚔️ Selecione mais ${remaining} alvo(s)...`);
                } else {
                    setEffectMode(null);
                    log(`⚔️ Combo de Zoro finalizado!`);
                }
            }
            return;
        }

        // 🌀 BORUTO BUFF ALLY CHECK
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
                mysterio.illusionCounters = 2;
                mysterio.statusText = '✨ ILUSÃO (2)';
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
        if (source.card.id === '139') {
            const isPlayerSource = playerBoard.some(u => u?.id === source.id);
            const targetBoard = isPlayerSource ? enemyBoard : playerBoard;
            const setTargetBoardFn = isPlayerSource ? setEnemyBoard : setPlayerBoard;
            const myBoard = isPlayerSource ? playerBoard : enemyBoard;
            const setMyBoardFn = isPlayerSource ? setPlayerBoard : setEnemyBoard;

            // Stun Inimigos
            const newTargetBoard = targetBoard.map(u => {
                if (!u) return null;
                return { ...u, isStunned: true, effectTurns: 3, statusText: '🕸️ PRESO (3T)', statusEffect: 'stun' };
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
            setEffectMode({
                sourceId: source.id,
                sourceBoard: cardPopup!.board,
                type: 'multi_target_damage', // Reusing Zoro logic type if available or handling generic
                targetsLeft: 3,
                damage: 300 // Low damage assumption
            });
            log(`🐝 Vespa: Selecione até 3 alvos!`);
            if (cardPopup) setCardPopup(null);
            return;
        }

        // 🗿 COISA (ID 146) - Tripica ATK
        if (source.card.id === '146') {
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
            forceTargetSelect(source.id, (targetId) => {
                const isPlayer = playerBoard.some(u => u?.id === source.id);
                const tBoard = isPlayer ? enemyBoard : playerBoard;
                const setTBoard = isPlayer ? setEnemyBoard : setPlayerBoard;
                const newT = [...tBoard];
                const tIdx = newT.findIndex(u => u?.id === targetId);
                if (tIdx !== -1) {
                    const u = newT[tIdx]!;
                    u.currentHealth -= 500;
                    u.isSilenced = true; // Add Silence if supported
                    u.statusText = '🔇 SILENCIADO';
                    u.effectTurns = 2;
                    setTBoard(newT);
                    log(`🕷️ Viúva Negra atingiu ${u.card.name}! (-500 HP + Silence)`);
                }
            });
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

        const effects = parseAbilityToEffects(source.card.description || '', source.card.id);

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
    }, [effectMode, playerBoard, enemyBoard, log, playerHP, enemyHP, cards, enemyHand, playerHand, setEnemyHand, setPlayerHand, setPlayerBoard, setEnemyBoard, saveHistory, cardPopup, setCardPopup, setGoblinTargetsDestroyed, goblinTargetsDestroyed]);

    const resetPlayer = () => {
        const nextBoard = Array(10).fill(null);
        setPlayerBoard(nextBoard);
        saveHistory(nextBoard, enemyBoard, playerHand);
        log('🧹 Campo do Jogador limpo');
        setShowResetMenu(false);
    };
    const resetEnemy = () => {
        const nextBoard = Array(10).fill(null);
        setEnemyBoard(nextBoard);
        saveHistory(playerBoard, nextBoard, playerHand);
        log('🧹 Campo do Adversário limpo');
        setShowResetMenu(false);
    };
    const resetLogs = () => { setEventLog(['🧪 Log Resetado']); log('🧹 Histórico de Logs limpo'); setShowResetMenu(false); };
    const resetAll = () => {
        const empty = Array(10).fill(null);
        const emptyHand = Array(10).fill(null);
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
        const card = cards[Math.floor(Math.random() * cards.length)];
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
        const board = isPlayer ? playerBoard : enemyBoard;
        const newBoard = board.map(slot => {
            if (slot) return slot;
            const card = cards[Math.floor(Math.random() * cards.length)];
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
                            log(`🛑 ${(slot as TestUnit).card.name} está preso na teia! (Ação bloqueada)`);
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
                    }
                }}
                draggable={!!slot}
                onDragStart={() => handleDragStart(board, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => { e.preventDefault(); handleDrop(board, index); }}
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
                            <button
                                onClick={(e) => { e.stopPropagation(); removeUnit(board, index); }}
                                className="absolute top-0.5 right-0.5 z-50 text-white/30 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-1.5 hover:scale-110 bg-black/50 rounded"
                                title="Remover Unidade"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        )}

                        {/* Indicador de Status/Turnos */}
                        {isUnit && ((slot as TestUnit).statusText || ((slot as TestUnit).statusEffect && (slot as TestUnit).effectTurns && (slot as TestUnit).effectTurns! > 0)) && (
                            <div className="absolute top-1 left-1 bg-red-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-20 animate-pulse shadow-lg border border-red-400">
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
                    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[9999] animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm">
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
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen w-screen overflow-hidden flex bg-[#030305] text-white selection:bg-purple-500/30">
            {/* SIDEBAR ESQUERDA */}
            <div className="w-[220px] h-screen bg-black/80 border-r border-white/5 flex flex-col p-4 z-40 backdrop-blur-2xl">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-white/50" title="Voltar Pagina"><ArrowLeft size={16} /></button>
                        <div className="w-px h-4 bg-white/10 mx-1 self-center" />
                        <button onClick={undo} disabled={historyIndex <= 0} className={`p - 2 rounded - lg transition - all ${historyIndex > 0 ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'text-white/10'} `} title="Desfazer Arena"><ArrowLeft size={16} strokeWidth={3} /></button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className={`p - 2 rounded - lg transition - all ${historyIndex < history.length - 1 ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'text-white/10'} `} title="Refazer Arena"><ArrowRight size={16} strokeWidth={3} /></button>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-purple-500 uppercase">OFICINA</span>
                </div>

                <div className="mb-6">
                    {/* Search Input com ícone ≡ DENTRO */}
                    <div className="relative mb-2">
                        <input
                            type="text"
                            placeholder="Nome ou ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded px-8 pr-9 py-2 text-[10px] text-white/70 outline-none focus:border-purple-500/30 transition-all"
                        />
                        <Search size={12} className="absolute left-2.5 top-2.5 text-white/20" />
                        <button
                            onClick={() => setShowCardList(!showCardList)}
                            className="absolute right-2 top-1.5 p-1 hover:bg-white/10 rounded transition-all text-purple-400 hover:text-purple-300 text-sm"
                            title="Lista completa de cartas"
                        >
                            ≡
                        </button>
                    </div>

                    {/* Results Dropdown (Busca) - V4.0 */}
                    {filteredCards.length > 0 && (
                        <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden mb-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                            {filteredCards.map(card => {
                                const isValidated = validatedCards.includes(card.id);
                                return (
                                    <div
                                        key={card.id}
                                        className="px-3 py-2 border-b border-white/5 hover:bg-white/5 transition-all"
                                    >
                                        {/* Nome e ID com Checkbox de Teste */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {/* Checkbox Testado */}
                                            <div
                                                className={`w-3 h-3 border rounded flex items-center justify-center shrink-0 transition-colors cursor-pointer ${testedCards.has(card.id) ? 'bg-green-500 border-green-500' : 'border-white/20 hover:border-white/50 bg-black'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTested(card.id);
                                                }}
                                                title="Marcar como testado"
                                            >
                                                {testedCards.has(card.id) && <Check size={8} className="text-black stroke-[3]" />}
                                            </div>

                                            <div className="flex-1 flex justify-between items-center min-w-0">
                                                <span className={`text-[9px] font-bold flex items-center gap-1 truncate ${testedCards.has(card.id) ? 'text-green-500 line-through' : 'text-white/90'}`}>
                                                    {card.name}
                                                    {isValidated && <span className="text-green-400 no-underline shrink-0" title="Validado">✅</span>}
                                                </span>
                                                <span className="text-[8px] text-white/20 shrink-0 ml-1">ID {card.id}</span>
                                            </div>
                                        </div>

                                        {/* Botões de Ação Sempre Visíveis (V4.0) */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedCardId(card.id);
                                                    setSearchQuery(card.name);
                                                    spawnToHand();
                                                }}
                                                className="flex-1 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[7px] font-black uppercase text-purple-400 hover:bg-purple-500/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                ✋ MÃO
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedCardId(card.id);
                                                    setSearchQuery(card.name);
                                                    spawnToField(true);
                                                }}
                                                className="flex-1 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-[7px] font-black uppercase text-blue-400 hover:bg-blue-500/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                🎯 P1
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedCardId(card.id);
                                                    setSearchQuery(card.name);
                                                    spawnToField(false);
                                                }}
                                                className="flex-1 py-1 bg-red-500/10 border border-red-500/30 rounded text-[7px] font-black uppercase text-red-400 hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                🎯 P2
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Compact Action Buttons - REMOVIDOS (Agora só no Overlay) */}
                    <div className="space-y-1.5 mt-4">
                        {/* Linha: TURNO, ALEATÓRIO, RESET */}
                        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                            <button onClick={nextTurn} className="py-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-[8px] font-black uppercase text-yellow-400 hover:bg-yellow-500/20 transition-all">⏳ TURNO</button>
                            <button
                                onClick={() => { fillArena(true); fillArena(false); }}
                                className="py-2 bg-gradient-to-r from-blue-500/10 to-red-500/10 border border-white/20 rounded text-[8px] font-black uppercase text-white/70 hover:from-blue-500/20 hover:to-red-500/20 transition-all"
                            >
                                🎲 RANDOM
                            </button>
                            <button onClick={() => setShowResetMenu(!showResetMenu)} className="py-2 bg-zinc-700/50 border border-white/10 rounded text-[8px] font-black uppercase text-zinc-400 hover:bg-zinc-600/50 transition-all">🔄 RESET</button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => setShowGraveyard('player')} className="py-2 bg-purple-900/40 border border-purple-500/30 rounded text-[8px] font-black uppercase text-purple-400 hover:bg-purple-800/50 transition-all">💀 P1 ({playerGraveyard.length})</button>
                            <button onClick={() => setShowGraveyard('enemy')} className="py-2 bg-red-900/40 border border-red-500/30 rounded text-[8px] font-black uppercase text-red-400 hover:bg-red-800/50 transition-all">💀 P2 ({enemyGraveyard.length})</button>
                        </div>
                    </div>

                    {/* Reset Menu Dropdown */}
                    {showResetMenu && (
                        <div className="mt-2 bg-black/90 border border-white/10 rounded-lg p-2 shadow-2xl space-y-1">
                            <button
                                onClick={() => { setupLabRotation(); setShowResetMenu(false); }}
                                className="w-full py-1.5 rounded bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 text-purple-300 text-[8px] font-black uppercase hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                            >
                                🔄 ROTAÇÃO LAB
                            </button>
                            <div className="border-t border-white/5 my-1"></div>
                            <button onClick={resetPlayer} className="w-full py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-black uppercase hover:bg-blue-500/20 transition-all">Limpar P1</button>
                            <button onClick={resetEnemy} className="w-full py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase hover:bg-red-500/20 transition-all">Limpar P2</button>
                            <button onClick={resetLogs} className="w-full py-1.5 rounded bg-zinc-500/10 border border-zinc-500/20 text-zinc-500 text-[8px] font-black uppercase hover:bg-zinc-500/20 transition-all">Limpar Log</button>
                            <button onClick={resetAll} className="w-full py-1.5 rounded bg-red-600/20 border border-red-500/40 text-red-400 text-[8px] font-black uppercase hover:bg-red-600/30 transition-all">Limpar TUDO</button>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <button
                        onClick={() => {
                            // Limpar Boards
                            const newPBoard = Array(10).fill(null);
                            const newEBoard = Array(10).fill(null);
                            const newHand = Array(10).fill(null);

                            // P1: Boruto + Novos Gladiadores + Paladinos (V4.7)
                            const p1Ids = ['136', '132', '133', '137', '138', '144', '145', '146', '163', '164', '165'];
                            p1Ids.forEach((id, index) => {
                                const card = cards.find(c => c.id === id);
                                if (card) {
                                    const unit = createUnit(card);
                                    if (id === '163') unit.charges = 3;
                                    if (id === '164') unit.charges = 2;

                                    if (index < 10) {
                                        newPBoard[index] = unit;
                                    } else {
                                        // Excedente -> Hand
                                        newHand[index - 10] = card;
                                    }
                                } else {
                                    // Fallback P1 (Force Sync)
                                    const baseCard = cards[0];
                                    if (baseCard && index < 10) {
                                        newPBoard[index] = createUnit({ ...baseCard, id: id, name: `FORCE ${id}`, atk: 1200, def: 1200 });
                                    }
                                }
                            });

                            // P2: Alvos (207, 208, 209)
                            const p2Ids = ['207', '208', '209'];
                            p2Ids.forEach((id, index) => {
                                const card = cards.find(c => c.id === id);
                                if (card) {
                                    newEBoard[index] = createUnit(card);
                                } else {
                                    // Fallback P2
                                    const baseCard = cards[0];
                                    if (baseCard) {
                                        newEBoard[index] = createUnit({ ...baseCard, id: id, name: `Alvo ${id}`, atk: 1000, def: 1000 });
                                    }
                                }
                            });

                            setPlayerBoard(newPBoard);
                            setEnemyBoard(newEBoard);
                            setPlayerHand(newHand);
                            setPlayerGraveyard([]);
                            setEnemyGraveyard([]);
                            log('🚀 SETUP GLADIADOR V4.5 INICIADO! (P1: Zoro, Boruto, Aranha... | P2: Alvos)');
                        }}
                        className="w-full py-3 mt-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-300 text-[10px] font-black uppercase hover:from-green-500/30 hover:to-emerald-500/30 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] rounded flex items-center justify-center gap-2 group"
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">🚀</span>
                        SETUP GLADIADOR
                    </button>
                </div>



                {/* LOG DE EVENTOS (Colapsável) */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 flex justify-between items-center">
                        <span>📜 LOG EVENTOS</span>
                        <button
                            onClick={() => setLogsCollapsed(!logsCollapsed)}
                            className="p-1 hover:bg-white/10 rounded transition-all"
                            title={logsCollapsed ? "Expandir" : "Minimizar"}
                        >
                            {logsCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                        </button>
                    </div>
                    {!logsCollapsed && (
                        <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {eventLog.map((msg, i) => (
                                <div key={i} className="text-[9px] text-white/40 leading-relaxed bg-white/[0.02] px-2 py-1 rounded border-l-2 border-purple-500/20">
                                    {msg}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div >

            {/* BATTLEFIELD (10 SLOTS: 2x5) */}
            < div className="flex-1 h-screen flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_rgba(30,30,40,0.4)_0%,_transparent_70%)] relative" >

                {/* P2 AREA */}
                < div className="flex flex-col items-center gap-4 mb-16 transition-all" >
                    <div className="flex items-center gap-4 text-white/20 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest">OPONENTE HP</span>
                        <span className="text-xl font-black text-red-500 italic">{enemyHP}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {enemyBoard.slice(0, 5).map((slot, i) => renderSlot(slot, i, 'enemy'))}
                        {enemyBoard.slice(5, 10).map((slot, i) => renderSlot(slot, i + 5, 'enemy'))}
                    </div>
                </div >

                <div className="w-full h-px bg-white/5 absolute top-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(255,255,255,0.05)]" />

                {/* P1 AREA */}
                <div className="flex flex-col items-center gap-4 mt-16 transition-all">
                    <div className="grid grid-cols-5 gap-3">
                        {playerBoard.slice(5, 10).map((slot, i) => renderSlot(slot, i + 5, 'player'))}
                        {playerBoard.slice(0, 5).map((slot, i) => renderSlot(slot, i, 'player'))}
                    </div>
                    <div className="flex items-center gap-4 text-white/20 mt-2">
                        <span className="text-[9px] font-black uppercase tracking-widest">JOGADOR HP</span>
                        <span className="text-xl font-black text-blue-500 italic">{playerHP}</span>
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
                                    if (cardPopup) setCardPopup(null);
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
            </div >

            {/* SIDEBAR DIREITA: Mãos + Habilidade */}
            < div className="w-[220px] h-screen bg-black/80 border-l border-white/5 flex flex-col z-40 backdrop-blur-2xl overflow-hidden" >
                {/* MINHA MÃO (4 slots - Grid 2x2) */}
                < div className="p-3 border-b border-white/5" >
                    <div className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 flex justify-between">
                        <span>🃏 MINHA MÃO</span>
                        <span className="text-white/30">{playerHand.filter(s => s !== null).length}/4</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {playerHand.slice(0, 4).map((card, i) => (
                            <div
                                key={i}
                                draggable={!!card}
                                onDragStart={(e) => {
                                    if (card) {
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('sourceBoard', 'playerHand');
                                        e.dataTransfer.setData('sourceIndex', i.toString());
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const sourceBoard = e.dataTransfer.getData('sourceBoard');
                                    const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'));

                                    if (sourceBoard === 'playerHand' && sourceIndex !== i) {
                                        const newHand = [...playerHand];
                                        const temp = newHand[i];
                                        newHand[i] = newHand[sourceIndex];
                                        newHand[sourceIndex] = temp;
                                        setPlayerHand(newHand);
                                        log(`🔄 Cartas trocadas de posição na mão`);
                                    }
                                }}
                                className={`h-12 rounded border transition-all relative group ${card
                                    ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 cursor-grab active:cursor-grabbing'
                                    : 'bg-white/5 border-white/10'
                                    } ${selectedSlot?.board === 'hand' && selectedSlot?.index === i ? 'ring-2 ring-purple-500' : ''}`}
                                onClick={(e) => {
                                    if (card && !(e.target as HTMLElement).classList.contains('remove-btn')) {
                                        // Selecionar carta da mão para colocar no campo
                                        setSelectedSlot({ board: 'hand', index: i });
                                        // Também mostrar habilidade
                                        setCardPopup({ unit: createUnit(card), board: 'player', index: i });
                                        log(`📋 ${card.name} selecionado. Clique em um slot vazio do campo para colocar.`);
                                    }
                                }}>
                                {card ? (
                                    <>
                                        <div className="p-2 h-full flex items-center justify-center">
                                            <div className="text-[9px] font-bold text-white/90 truncate text-center leading-tight">
                                                {card.name}
                                            </div>
                                        </div>
                                        {/* Botão X (aparece no hover) */}
                                        <button
                                            className="remove-btn absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newHand = [...playerHand];
                                                newHand[i] = null;
                                                setPlayerHand(newHand);
                                                if (cardPopup?.board === 'player' && cardPopup?.index === i) {
                                                    setCardPopup(null);
                                                }
                                                log(`🗑️ ${card.name} removido da mão`);
                                            }}
                                            title="Remover carta"
                                        >
                                            <X size={10} className="text-white stroke-[3]" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[8px] text-white/10">
                                        ---
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div >

                {/* MÃO OPONENTE (4 slots - Grid 2x2) */}
                < div className="p-3 border-b border-white/5" >
                    <div className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em] mb-2 flex justify-between">
                        <span>🎴 MÃO OPONENTE</span>
                        <span className="text-white/30">{enemyHand.filter(s => s !== null).length}/4</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {enemyHand.slice(0, 4).map((card, i) => (
                            <div
                                key={i}
                                draggable={!!card}
                                onDragStart={(e) => {
                                    if (card) {
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('sourceBoard', 'enemyHand');
                                        e.dataTransfer.setData('sourceIndex', i.toString());
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const sourceBoard = e.dataTransfer.getData('sourceBoard');
                                    const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'));

                                    if (sourceBoard === 'enemyHand' && sourceIndex !== i) {
                                        const newHand = [...enemyHand];
                                        const temp = newHand[i];
                                        newHand[i] = newHand[sourceIndex];
                                        newHand[sourceIndex] = temp;
                                        setEnemyHand(newHand);
                                        log(`🔄 Cartas trocadas de posição na mão do oponente`);
                                    }
                                }}
                                className={`h-12 rounded border transition-all relative group ${card
                                    ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 cursor-grab active:cursor-grabbing'
                                    : 'bg-white/5 border-white/10'
                                    }`}
                                onClick={(e) => {
                                    if (card && !(e.target as HTMLElement).classList.contains('remove-btn')) {
                                        setCardPopup({ unit: createUnit(card), board: 'enemy', index: i });
                                    }
                                }}
                            >
                                {card ? (
                                    <>
                                        <div className="p-2 h-full flex items-center justify-center">
                                            <div className="text-[9px] font-bold text-white/90 truncate text-center leading-tight">
                                                {card.name}
                                            </div>
                                        </div>
                                        {/* Botão X (aparece no hover) */}
                                        <button
                                            className="remove-btn absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newHand = [...enemyHand];
                                                newHand[i] = null;
                                                setEnemyHand(newHand);
                                                if (cardPopup?.board === 'enemy' && cardPopup?.index === i) {
                                                    setCardPopup(null);
                                                }
                                                log(`🗑️ ${card.name} removido da mão do oponente`);
                                            }}
                                            title="Remover carta"
                                        >
                                            <X size={10} className="text-white stroke-[3]" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[8px] text-white/10">
                                        ---
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div >

                {/* SEÇÃO DE HABILIDADE (Simplificada) */}
                < div className="flex-1 p-3 flex flex-col overflow-hidden" >
                    {(() => {
                        // 🔍 DEBUG: Log do estado do painel
                        console.log("🎨 RENDERIZANDO PAINEL:", {
                            temCardPopup: !!cardPopup,
                            nome: cardPopup?.unit.card.name || "N/A",
                            habilidade: cardPopup?.unit.card.description || "N/A",
                            board: cardPopup?.board || "N/A"
                        });

                        return cardPopup ? (
                            <>
                                <div className="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2">
                                    📜 HABILIDADE
                                </div>

                                {/* Nome da Carta (Discreto) */}
                                <div className="mb-3">
                                    <div className="text-[11px] font-bold text-white/60 uppercase text-center">
                                        {cardPopup.unit.card.name}
                                    </div>
                                </div>

                                {/* Texto da Habilidade */}
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 mb-3 overflow-y-auto">
                                    <p className="text-[11px] text-white/80 leading-relaxed">
                                        {cardPopup.unit.card.description || cardPopup.unit.card.habilidade || 'Sem habilidade especial'}
                                    </p>
                                    {/* 🔍 DEBUG: Mostra se está vazio */}
                                    {!cardPopup.unit.card.description && !cardPopup.unit.card.habilidade && (
                                        <p className="text-[9px] text-red-400 mt-2">
                                            ⚠️ DEBUG: Descrição vazia! ID: {cardPopup.unit.card.id}
                                        </p>
                                    )}
                                </div>

                                {/* Botão USAR EFEITO */}
                                <button
                                    disabled={!!(cardPopup.unit as any).isStunned && cardPopup.board === 'enemy'}
                                    onClick={() => {
                                        if (!cardPopup) return;

                                        const source = cardPopup.unit;

                                        console.log("🔘 BOTÃO USAR EFEITO CLICADO:", {
                                            carta: source.card.name,
                                            id: source.card.id,
                                            habilidade: source.card.description
                                        });

                                        // 🎯 LISTA DE CARTAS QUE REQUEREM SELEÇÃO DE ALVO
                                        // Apenas IDs nesta lista pedirão seleção manual de alvo
                                        const REQUIRES_TARGET = [
                                            '191',  // 🎃 Duende Verde (selecionar até 2 alvos para destruir)
                                            '136',  // 🌀 Boruto (Karma)
                                            '194',  // 🏹 Gavião Arqueiro (selecionar alvo para dano fixo)
                                            // '162',  // 🧶 Homem Elástico (auto-protect)
                                            // Adicione mais IDs aqui quando necessário
                                        ];

                                        const requiresTarget = REQUIRES_TARGET.includes(source.card.id);

                                        if (requiresTarget) {
                                            // ⚠️ EXCEÇÃO: Esta carta requer seleção de alvo
                                            console.log("🎯 Habilidade requer seleção de alvo");

                                            // Reset contador do Duende Verde
                                            if (source.card.id === '191') {
                                                setGoblinTargetsDestroyed(0);
                                            }

                                            setEffectMode({
                                                sourceId: source.id,
                                                sourceBoard: cardPopup.board
                                            });
                                            setAttackMode(null);
                                            log(`🎯 ${source.card.name}: Clique em um alvo para usar a habilidade.`);
                                        } else {
                                            // ✅ PADRÃO: Executar automaticamente (maioria das cartas)
                                            console.log("⚡ Habilidade auto-executável!");
                                            executeEffect(cardPopup.board, cardPopup.index, source);
                                        }
                                    }}
                                    className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 rounded-lg font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/50 ${(cardPopup.unit as any).isStunned && cardPopup.board === 'enemy' ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    <Play size={12} />
                                    USAR EFEITO
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center text-white/20 text-[9px]">
                                    <div className="text-3xl mb-2">🃏</div>
                                    <div>Clique em uma carta<br />para ver detalhes</div>
                                </div>
                            </div>
                        );
                    })()}
                </div >
            </div >

            {/* 🆕 OVERLAY - Lista Completa */}
            {
                showCardList && (
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
                                            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            c.id.includes(searchQuery)
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
                                                                {card.name}
                                                                {isValidated && <span className="text-green-400" title="Validado">✅</span>}
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
                                                                spawnToHand();
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
                                                                spawnToField(true); // P1
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
                                                                spawnToField(false); // P2
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
                                {cards.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.includes(searchQuery)).length === 0 && (
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

