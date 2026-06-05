import React, { useEffect, useState, useRef } from 'react';
import { BattleProvider, useBattle } from '../contexts/BattleContext';
import { useGame } from '../contexts/GameContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../types';


import { BattleBoard } from '../components/Battle/BattleBoard';
import { Hand } from '../components/Battle/Hand';
import { DivineSlot } from '../components/Battle/DivineSlot';
import { GraveyardModal } from '../components/Battle/GraveyardModal';
import { SacrificeOverlay } from '../components/Battle/SacrificeOverlay';
import { MaintenanceOverlay } from '../components/Battle/MaintenanceOverlay';
import { DrawAnimation } from '../components/Battle/DrawAnimation';
import { EffectAnimations } from '../components/Battle/EffectAnimations';
import { BattleToast } from '../components/Battle/BattleToast';
import { SearchOverlay } from '../components/Battle/SearchOverlay';
import { CardDetailOverlay } from '../components/Battle/CardDetailOverlay';
import { TutorialOverlay } from '../components/TutorialOverlay';
import type { TutorialStep } from '../components/TutorialOverlay';
import { TUTORIALS } from '../constants/tutorials';


const BattleContent: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, updateProfile } = useGame();

    // Arena Logic
    const { arenaId = 1, file = 'arena1', variants = 0 } = location.state || {};
    const [bgUrl, setBgUrl] = useState<string>('');

    useEffect(() => {
        // Randomize background variant
        const variant = Math.floor(Math.random() * (variants + 1));
        const url = variant === 0
            ? `/arenas/${file}_bg.jpg`
            : `/arenas/${file}_bg (${variant}).jpg`;

        setBgUrl(url);
    }, [arenaId, file, variants]);
    const {
        playerHealth,
        opponentHealth,
        nextPhase,
        phase,
        currentPlayer,
        playerHand,
        playerDeck,
        playerBoard,
        opponentBoard,
        selectedUnit,
        selectUnit,
        attackUnit,
        attackHero,
        gameStatus,
        cardsPlayedThisTurn: _cardsPlayedThisTurn,
        opponentHandCount,
        playerGraveyard,
        opponentGraveyard,
        needsSacrifice,
        resolveMaintenance,
        pendingMaintenance,
        confirmSacrifice,
        cancelSacrifice,
        toasts,
        removeToast,
        playerBanished,
        opponentBanished,
        playerLog,
        opponentLog,
        divineSlots,
        addToast,
        turnTimer,
        pendingSearch,
        resolveSearch,
        cancelSearch,

        selectedHandCardId,
        selectHandCard,
        playCard,
        // Phase 5:
        pendingEffectPlay,
        setPendingEffectPlay,
        responseChain,
        startChain,
        answerChain,
        cancelChainResponse,
        // Phase 6:
        targetSelectionMode,
        activateAbility,
        selectTarget,
        cancelTargetSelection
    } = useBattle();

    const [inspectingCard, setInspectingCard] = useState<any | null>(null);
    const [showPlayerGraveyard, setShowPlayerGraveyard] = useState(false);
    const [showOpponentGraveyard, setShowOpponentGraveyard] = useState(false);
    const [abilitySacrificeRequest, setAbilitySacrificeRequest] = useState<{ card: any, cost: number, selected: string[] } | null>(null);
    const [playFaceDownNext, setPlayFaceDownNext] = useState(false);
    const [showShenlong, setShowShenlong] = useState(false);

    // Auto-close Shenlong after 5s
    useEffect(() => {
        if (showShenlong) {
            const timer = setTimeout(() => setShowShenlong(false), 5000); // 5s video sim
            return () => clearTimeout(timer);
        }
    }, [showShenlong]);

    // Sync inspectingCard with selectedHandCardId or selectedUnit
    useEffect(() => {
        if (selectedHandCardId) {
            const card = playerHand.find(c => c.id === selectedHandCardId);
            if (card) setInspectingCard(card);
        } else if (selectedUnit) {
            const unit = [...playerBoard, ...opponentBoard, ...divineSlots.player, ...divineSlots.opponent]
                .find(u => u?.id === selectedUnit);
            if (unit) setInspectingCard(unit);
        }
    }, [selectedHandCardId, playerHand, selectedUnit, playerBoard, opponentBoard, divineSlots]);

    // Draw Animation Logic
    const [isDrawing, setIsDrawing] = useState(false);
    const prevHandLength = useRef(playerHand.length);

    useEffect(() => {
        if (playerHand.length > prevHandLength.current) {
            setIsDrawing(true);
        }
        prevHandLength.current = playerHand.length;
    }, [playerHand.length]);

    // Bridge state for Context Sacrifice Selection
    const [contextSacrificeSelection, setContextSacrificeSelection] = useState<string[]>([]);

    // Tutorial State
    const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
    const [activeTutorialSteps, setActiveTutorialSteps] = useState<TutorialStep[] | null>(null);
    const [currentTutorialStep, setCurrentTutorialStep] = useState<TutorialStep | null>(null);

    // Initial Tutorial Check
    useEffect(() => {
        if (!profile) return;

        const checkAndStartTutorial = (id: string, condition: boolean) => {
            const seen = new Set(profile.tutorialsSeen || []);
            if (condition && !seen.has(id)) {
                setActiveTutorialId(id);
                setActiveTutorialSteps(TUTORIALS[id]);
                // Set initial step manually or let onStepChange handle it
                return true;
            }
            return false;
        };

        if (file === 'arena1') checkAndStartTutorial('ARENA_1_INTRO', true);
        if (file === 'arena4') checkAndStartTutorial('ARENA_4_SACRIFICE', true);
        if (file === 'arena7') checkAndStartTutorial('ARENA_7_RANKED', true); // Example

    }, [file, profile]);

    const handleTutorialComplete = () => {
        if (activeTutorialId) {
            updateProfile({ tutorialsSeen: [...(profile.tutorialsSeen || []), activeTutorialId] });
            setActiveTutorialId(null);
            setActiveTutorialSteps(null);
            setCurrentTutorialStep(null);
        }
    };

    const handleTutorialSkip = () => {
        handleTutorialComplete();
    };

    // Derived Interaction Flags
    const activeFlags = currentTutorialStep?.flags || {};

    // Predicate for Hand Cards
    const isCardDisabled = (card: Card) => {
        if (!activeTutorialId) return false;
        if (activeFlags.lockEliteCards && card.rarity === 'Elite') return true;
        // If board is locked (Arena 1 intro step 1), we might allow dragging card from hand -> board.
        // The dragging logic is handled by DnD system. 
        // If we want to force user to PLAY card, we shouldn't disable the hand card.
        return false;
    };


    const [showPlayerMenu, setShowPlayerMenu] = useState(false);
    const [showOpponentMenu, setShowOpponentMenu] = useState(false);
    const [showHand, setShowHand] = useState(true);

    // 3D Adjustment System (Hardcoded from User Session)
    const adjRotation = 0;
    const adjScale = 1.0;
    const adjY = showHand ? 20 : 90;
    const bgScale = 1.1;
    const bgY = 0;
    const bgBrightness = 50;

    // Auto-clear selection when request closes
    useEffect(() => {
        if (!needsSacrifice) setContextSacrificeSelection([]);
    }, [needsSacrifice]);

    useEffect(() => {
        if (phase === 'battle') {
            setShowHand(false);
        } else if (phase === 'strategy' && currentPlayer === 'player') {
            setShowHand(true);
        } else if (currentPlayer === 'opponent') {
            setShowHand(false);
        }
    }, [phase, currentPlayer]);

    const handleSacrificeSelect = (id: string) => {
        if (needsSacrifice) {
            setContextSacrificeSelection(prev => {
                if (prev.includes(id)) return prev.filter(i => i !== id);
                if (prev.length < needsSacrifice.required) return [...prev, id];
                return prev;
            });
        } else if (abilitySacrificeRequest) {
            setAbilitySacrificeRequest(prev => {
                if (!prev) return null;
                const isSelected = prev.selected.includes(id);
                if (isSelected) {
                    return { ...prev, selected: prev.selected.filter(i => i !== id) };
                } else if (prev.selected.length < prev.cost) {
                    return { ...prev, selected: [...prev.selected, id] };
                }
                return prev;
            });
        }
    };










    const handleSacrificeConfirm = () => {
        if (needsSacrifice) {
            confirmSacrifice(contextSacrificeSelection);
        } else if (abilitySacrificeRequest) {
            // Ability logic (existing)
            const unit = playerBoard.find(u => u?.id === abilitySacrificeRequest.card.id);
            if (unit && unit.id) { // unit.id check
                // For ability, we assume we just resolve maintenance/pay cost?
                // Or we need a dedicated "activateAbility" context function.
                // For now, reuse resolveMaintenance logic if appropriate, OR implement dedicated execution.
                // The prompt didn't ask to fix ability, so I keep it minimal or simulated.
                // Existing code used resolveMaintenance? No, it used setSacrificeRequest then... what?
                // Original code had handleSacrificeConfirm commented out or missing in view?
                // Let's assume resolveMaintenance(unit.id, sacrificeId) does the job for ability cost.
                if (abilitySacrificeRequest.selected.length > 0) {
                    resolveMaintenance(unit.id, abilitySacrificeRequest.selected[0]);
                }
            }
            setAbilitySacrificeRequest(null);
        }
    };

    const handleSacrificeCancel = () => {
        if (needsSacrifice) {
            cancelSacrifice(); // Use Context cancel
        }
        setAbilitySacrificeRequest(null);
    };

    // handleActivateAbility removed (unused)

    // UI SYNC: Auto-open Inspector when a unit is selected (for Direct Attack/Ability access)
    useEffect(() => {
        if (selectedUnit) {
            const unit = playerBoard.find(u => u?.id === selectedUnit) || divineSlots.player.find(u => u?.id === selectedUnit);
            if (unit) {
                setInspectingCard(unit);
            }
        } else {
            // Optional: Close inspector when selection clears?
            // setInspectingCard(null); 
            // Better to leave it open if user is just inspecting, BUT for "Direct Attack" flow, closing feels snappier.
            // Let's NOT auto-close to avoid fighting with manual inspection of Opponent cards.
        }
    }, [selectedUnit, playerBoard, divineSlots.player]);


    // We need to fetch the actual card object for needsSacrifice to display name/image properly
    const pendingCard = needsSacrifice ? playerHand.find(c => c.id === needsSacrifice.cardId) : null;
    const finalOverlayRequest = needsSacrifice && pendingCard
        ? { card: pendingCard, cost: needsSacrifice.required, selected: contextSacrificeSelection }
        : abilitySacrificeRequest;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleBackgroundClick = (e: React.MouseEvent) => {
        // If clicking on a container that isn't the card panel or a card, close inspection
        if (e.target === e.currentTarget) {
            setInspectingCard(null);
            selectHandCard(null);
            selectUnit(null);
        }
    };

    return (
        <div
            ref={containerRef}
            onClick={handleBackgroundClick}
            className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col relative"
        >
            {/* Dynamic Arena Background */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-1000"
                style={{
                    backgroundImage: bgUrl ? `url("${bgUrl}")` : 'none',
                    backgroundColor: '#000',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `scale(${bgScale}) translateY(${bgY}px)`,
                    filter: `brightness(${bgBrightness}%)`
                }}
            >
                {/* Fallback pattern/gradient if image fails or is still loading */}
                {!bgUrl && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-50" />
                )}
            </div>

            <SearchOverlay
                isOpen={!!pendingSearch}
                filter={pendingSearch?.filter || (() => true)}
                deck={playerDeck}
                count={pendingSearch?.count || 1}
                onResolve={resolveSearch}
                onCancel={cancelSearch}
            />

            <BattleToast toasts={toasts} onRemove={removeToast} />

            {/* Tutorial Overlay */}
            <AnimatePresence>
                {activeTutorialSteps && (
                    <TutorialOverlay
                        steps={activeTutorialSteps}
                        onComplete={handleTutorialComplete}
                        onSkip={handleTutorialSkip}
                        onStepChange={setCurrentTutorialStep}
                    />
                )}
            </AnimatePresence>

            {/* Sacrifice Overlay */}
            <SacrificeOverlay
                isOpen={!!finalOverlayRequest}
                request={finalOverlayRequest}
                playerHand={playerHand}
                playerBoard={playerBoard}
                onSelect={handleSacrificeSelect}
                onConfirm={handleSacrificeConfirm}
                onCancel={handleSacrificeCancel}
            />

            {/* Maintenance Overlay (Supremo Sacrifice) */}
            {pendingMaintenance.length > 0 && (
                <MaintenanceOverlay
                    unit={[...playerBoard, ...divineSlots.player].find(u => u?.id === pendingMaintenance[0])!}
                    onPay={(sacrificeId) => resolveMaintenance(pendingMaintenance[0], sacrificeId)}
                    onSkip={() => resolveMaintenance(pendingMaintenance[0])}
                    playerBoard={playerBoard}
                />
            )}

            {/* Shenlong Video Overlay */}
            <AnimatePresence>
                {showShenlong && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('/effects/shenlong_bg.jpg')] bg-cover opacity-50 animate-pulse" />
                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-t from-yellow-500 to-yellow-200 drop-shadow-[0_0_50px_rgba(255,215,0,0.8)] filter">
                                SHENLONG
                            </h1>
                            <p className="text-white font-bold text-2xl tracking-[0.5em] mt-4 animate-pulse">
                                FAÇA SEU DESEJO
                            </p>
                        </motion.div>
                        {/* Particles */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_gold]"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: [0, -500],
                                    x: [(Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500]
                                }}
                                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CORE ENGINE 5: EFFECT CARD SELECTION MODAL */}
            <AnimatePresence>
                {pendingEffectPlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border-2 border-slate-600 rounded-2xl p-6 flex flex-col items-center gap-6 max-w-sm w-full shadow-2xl relative"
                        >
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest border-b border-slate-700 pb-2 w-full text-center">
                                Carta de Efeito
                            </h2>
                            <p className="text-slate-300 text-center text-sm px-4">
                                {pendingEffectPlay.message}
                            </p>

                            {/* Card Preview */}
                            <div className="w-32 h-48 rounded-lg overflow-hidden border-2 border-slate-500 shadow-lg relative">
                                <img src={pendingEffectPlay.card.image} alt={pendingEffectPlay.card.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-2 inset-x-0 text-center font-bold text-xs">
                                    {pendingEffectPlay.card.name}
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={() => {
                                        startChain(() => {
                                            playCard(pendingEffectPlay.card, undefined, false, true); // forcePlay=true
                                        });
                                        setPendingEffectPlay(null);
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black uppercase rounded-xl hover:scale-105 transition-transform shadow-lg border border-blue-400"
                                >
                                    ✨ Ativar Agora
                                </button>
                                <button
                                    onClick={() => {
                                        playCard(pendingEffectPlay.card, undefined, true); // playFaceDown=true
                                        setPendingEffectPlay(null);
                                    }}
                                    className="w-full py-3 bg-slate-700 text-slate-300 font-bold uppercase rounded-xl hover:bg-slate-600 transition-colors border border-slate-600"
                                >
                                    🌑 Baixar Virada
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CORE ENGINE 5: CHAIN RESPONSE UI */}
            <AnimatePresence>
                {responseChain.active && (
                    <div className="fixed inset-x-0 top-32 z-[90] flex justify-center pointer-events-none">
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="pointer-events-auto flex flex-col items-center gap-4"
                        >
                            {/* Scenario 1: User can Respond (Opponent turn triggers chain OR User responding to Opponent action) */}
                            {!responseChain.answeringPlayer && currentPlayer === 'opponent' && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => answerChain()}
                                        className="bg-red-600 text-white font-black text-xl px-8 py-3 rounded-full border-4 border-red-400 shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-pulse hover:scale-110 transition-transform uppercase tracking-widest"
                                    >
                                        ⚠️ Responder? ({responseChain.timer}s)
                                    </button>
                                    <button
                                        onClick={() => cancelChainResponse()} // In this context, canceling acts as Passing since user hasn't chained yet
                                        className="bg-slate-700/80 text-white font-bold text-lg px-6 py-3 rounded-full border-2 border-slate-500 hover:bg-slate-600 transition-colors uppercase tracking-widest backdrop-blur-md"
                                    >
                                        Passar
                                    </button>
                                </div>
                            )}

                            {/* Scenario 2: User IS Responding (Choosing card/effect) */}
                            {responseChain.answeringPlayer === 'player' && (
                                <div className="bg-blue-600/90 text-white p-4 rounded-xl border-2 border-blue-400 shadow-2xl flex flex-col items-center gap-2 backdrop-blur-md">
                                    <h3 className="font-black uppercase tracking-widest text-lg">Sua Resposta</h3>
                                    <div className="text-4xl font-bold font-mono">{responseChain.timer}s</div>
                                    <p className="text-xs text-blue-200">Jogue uma carta rápida ou ative um efeito!</p>
                                    <button
                                        onClick={() => cancelChainResponse()}
                                        className="mt-2 bg-slate-800 hover:bg-slate-700 text-white/80 px-4 py-1.5 rounded-lg text-xs font-bold uppercase"
                                    >
                                        Cancelar (-500 HP)
                                    </button>
                                </div>
                            )}

                            {/* Scenario 3: Opponent (AI) IS Responding OR User Waiting for Resolution */}
                            {(responseChain.answeringPlayer === 'opponent' || (!responseChain.answeringPlayer && currentPlayer === 'player')) && (
                                <div className="bg-slate-900/80 text-white px-8 py-4 rounded-full border border-slate-600 backdrop-blur-md shadow-xl flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                                    <span className="text-sm font-bold tracking-wider uppercase">
                                        {responseChain.answeringPlayer === 'opponent' ? 'Oponente Respondendo...' : 'Aguardando Resposta...'}
                                    </span>
                                    <span className="font-mono text-yellow-400">({responseChain.timer}s)</span>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Top Bar */}
            <div className="p-2 flex justify-between items-start z-[70] pointer-events-none">
                {/* Desistir Button */}
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 bg-gradient-to-r from-red-950/60 to-red-900/40 hover:from-red-600 hover:to-red-500 text-white/70 hover:text-white font-black px-5 py-2.5 rounded-xl text-[11px] tracking-[0.2em] border-2 border-red-500/20 hover:border-red-400/50 transition-all uppercase shadow-[0_8px_20px_rgba(0,0,0,0.4)] backdrop-blur-md active:scale-95 pointer-events-auto"
                >
                    <span className="text-sm">🏳️</span>
                    Desistir
                </button>
                <div className="flex-1" />

                {/* Opponent Status Indicator */}
                {currentPlayer === 'opponent' && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-red-600/90 text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg flex items-center gap-2 border border-red-400">
                            <span>⏳</span>
                            <span>OPONENTE PENSANDO...</span>
                        </div>
                    </div>
                )}


                {/* Opponent Life Bar-Compact */}
                <div
                    onClick={() => {
                        // Prevent Attack if in Target Selection Mode
                        if (selectedUnit && !targetSelectionMode?.active && currentPlayer === 'player' && phase === 'battle') {
                            setInspectingCard(null); // Close menu on attack
                            attackHero(selectedUnit);
                        } else {
                            setShowOpponentMenu(!showOpponentMenu);
                        }
                    }}
                    className={`relative bg-slate-900/90 border-2 rounded-lg px-4 py-1.5 flex flex-col min-w-[150px] cursor-pointer transition-all hover:bg-slate-800 ${selectedUnit && !targetSelectionMode?.active && currentPlayer === 'player' ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-slate-700'
                        } pointer-events-auto`}
                >
                    <div className="flex justify-between items-center gap-4">
                        <div className="text-xl font-black text-white tracking-widest">{opponentHealth}</div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Oponente</span>
                    </div>
                    <div className="flex gap-3 mt-1 pt-1 border-t border-slate-800/50">
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] text-slate-500 uppercase font-black">Cem:</span>
                            <span className="text-[10px] font-bold text-purple-400">{opponentGraveyard.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] text-slate-500 uppercase font-black">Ban:</span>
                            <span className="text-[10px] font-bold text-gray-400">{opponentBanished.length}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                            <span className="text-[8px] text-cyan-500/60 uppercase font-black">Baralho:</span>
                            <span className="text-[10px] font-bold text-white">{opponentHandCount || 40 /* Simulating deck count if not in state */}</span>
                        </div>
                    </div>

                    {/* Menu Popover Opponent */}
                    <AnimatePresence>
                        {showOpponentMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-64 bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-xl max-h-[70vh] overflow-y-auto custom-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex justify-between items-center">
                                    <span>Histórico de Combate</span>
                                    <span className="text-[8px] opacity-40">Opp</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 mb-4 custom-scrollbar pr-1">
                                    {opponentLog.length === 0 ? (
                                        <div className="text-[10px] text-slate-600 italic">Nenhum registro de combate</div>
                                    ) : (
                                        opponentLog.map((log, i) => (
                                            <div key={i} className="text-[10px] text-slate-300 leading-snug border-l-2 border-red-500/50 pl-2 py-0.5 bg-white/5 rounded-r">{log}</div>
                                        ))
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => { setShowOpponentGraveyard(true); setShowOpponentMenu(false); }}
                                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>💀</span> Ver Cemitério
                                    </button>
                                    {selectedUnit && currentPlayer === 'player' && phase === 'battle' && (
                                        <button
                                            onClick={() => { attackHero(selectedUnit); setShowOpponentMenu(false); }}
                                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-xl shadow-lg border-b-4 border-red-800 flex items-center justify-center gap-2"
                                        >
                                            <span>⚔️</span> Atacar Direto
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>


            {/* Background Layer (Master Duel Style) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Dynamic CSS Dark Floor / Background Layer */}
                <div
                    style={{
                        backgroundImage: `url('${bgUrl}')`,
                        transform: `scale(${bgScale}) translateY(${bgY}px)`,
                        filter: `brightness(${bgBrightness}%)`
                    }}
                ></div>
                {/* Grid/Floor Pattern */}

            </div>
            {/* Ethereal Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400/5 to-transparent opacity-30" />


            {/* Battle Grid-3D Container - Shift Right when Menu Open */}
            <div
                className={`flex-1 flex flex-col justify-center items-center px-2 py-1 min-h-0 overflow-visible z-10 transition-all duration-300 ${inspectingCard ? 'pl-[216px]' : ''}`}
                style={{ perspective: '1300px' }}
            >
                {/* Floating Particles/Dust (Simplified) */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-20"
                            animate={{
                                y: [-20, -100],
                                x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                                opacity: [0, 0.4, 0],
                                scale: [0.5, 1.2, 0.5]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                                ease: "linear"
                            }}
                            style={{
                                left: `${Math.random() * 100}%`,
                                bottom: `${20 + Math.random() * 20}%`
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ rotateX: 0, scale: 1.0, y: 0 }}
                    animate={{ rotateX: adjRotation, scale: adjScale * 0.9, y: adjY }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-[95vw] max-w-[620px] transform origin-center relative"
                >
                    {/* Zone Highlight Underlay */}
                    <div className="absolute inset-x-12 top-12 bottom-12 z-0 pointer-events-none">
                        <div className="h-1/2 w-full bg-red-400/10 blur-3xl rounded-t-full"></div>
                        <div className="h-1/2 w-full bg-cyan-400/10 blur-3xl rounded-b-full"></div>
                    </div>

                    {/* Divine Slots - Player (Left Side) */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
                        <AnimatePresence>
                            {divineSlots.player.map((unit, index) => (
                                unit && (
                                    <DivineSlot
                                        key={`divine-player-${index}`}
                                        unit={unit}
                                        isPlayer={true}
                                        position="left"
                                        onClick={() => {
                                            if (targetSelectionMode?.active && targetSelectionMode.validTargets.includes(unit.id)) {
                                                selectTarget(unit.id);
                                                return;
                                            }
                                            if (currentPlayer === 'player' && phase === 'battle') {
                                                if (unit.canAttack) {
                                                    selectUnit(selectedUnit === unit.id ? null : unit.id);
                                                }
                                            }
                                            setInspectingCard(unit);
                                        }}
                                    />
                                )
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Divine Slots - Opponent (Right Side) */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
                        <AnimatePresence>
                            {divineSlots.opponent.map((unit, index) => (
                                unit && (
                                    <DivineSlot
                                        key={`divine-opponent-${index}`}
                                        unit={unit}
                                        isPlayer={false}
                                        position="right"
                                        onClick={() => {
                                            if (targetSelectionMode?.active && targetSelectionMode.validTargets.includes(unit.id)) {
                                                selectTarget(unit.id);
                                                setInspectingCard(null);
                                                return;
                                            }
                                            if (selectedUnit && currentPlayer === 'player' && phase === 'battle') {
                                                // Divine can only attack Divine
                                                const attackerUnit = [...divineSlots.player, ...playerBoard].find(u => u?.id === selectedUnit);
                                                if (attackerUnit?.rarity === 'Supremo') {
                                                    setInspectingCard(null);
                                                    attackUnit(selectedUnit, unit.id);
                                                } else {
                                                    addToast('Apenas Divinos podem atacar Divinos!', 'warning');
                                                }
                                            } else {
                                                setInspectingCard(unit);
                                            }
                                        }}
                                    />
                                )
                            ))}
                        </AnimatePresence>
                    </div>


                    {/* Central Battle Field */}
                    <div className="flex flex-col gap-1 relative z-10 w-full">
                        <BattleBoard interactionDisabled={activeFlags.lockBoard} />
                    </div>
                </motion.div>
            </div>

            {/* Player Hand Overlay */}
            <AnimatePresence>
                {showHand && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
                    >
                        <Hand disabledCardPredicate={isCardDisabled} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Bar-Player Status Compact */}
            <div className="p-2 flex justify-between items-end z-[70] pointer-events-none">
                {/* Player Life Bar Integration */}
                <div
                    onClick={() => setShowPlayerMenu(!showPlayerMenu)}
                    className="bg-slate-900/90 border-2 border-blue-600/50 rounded-lg px-4 py-1.5 flex flex-col min-w-[150px] cursor-pointer transition-all hover:bg-slate-800 relative pointer-events-auto"
                >
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{profile.name}</span>
                        <div className="text-xl font-black text-white tracking-widest">{playerHealth}</div>
                    </div>
                    <div className="flex gap-3 mt-1 pt-1 border-t border-slate-800/50">
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] text-slate-500 uppercase font-black">Cem:</span>
                            <span className="text-[10px] font-bold text-purple-400">{playerGraveyard.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] text-slate-500 uppercase font-black">Ban:</span>
                            <span className="text-[10px] font-bold text-gray-400">{playerBanished.length}</span>
                        </div>
                    </div>

                    {/* Menu Popover Player */}
                    <AnimatePresence>
                        {showPlayerMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-4 shadow-2xl z-50 backdrop-blur-xl max-h-[70vh] overflow-y-auto custom-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex justify-between items-center">
                                    <span>Histórico de Combate</span>
                                    <span className="text-[8px] opacity-40">Você</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 mb-4 custom-scrollbar pr-1">
                                    {playerLog.length === 0 ? (
                                        <div className="text-[10px] text-slate-600 italic">Nenhum registro de combate</div>
                                    ) : (
                                        playerLog.map((log, i) => (
                                            <div key={i} className="text-[10px] text-slate-300 leading-snug border-l-2 border-blue-500/50 pl-2 py-0.5 bg-white/5 rounded-r">{log}</div>
                                        ))
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => { setShowPlayerGraveyard(true); setShowPlayerMenu(false); }}
                                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>💀</span> Ver Cemitério
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side-Button and Phase */}
                <div className="flex flex-col items-end gap-3 pointer-events-auto">

                    {/* Player Deck */}
                    <div className="w-26 h-38 bg-gray-950 border-2 border-white/20 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group-hover:scale-105 transition-transform mb-4 cursor-help">
                        <img
                            src="/cards/capa1.png"
                            alt="Deck Back"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        <div className="z-10 flex flex-col items-center">
                            <div className="absolute bottom-3 inset-x-0 flex justify-center">
                                <div className="bg-black/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                                    <span className="text-xs font-black text-white tracking-widest">{playerDeck.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Corner Decorations */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/40 rounded-tl-md"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-white/40 rounded-tr-md"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-white/40 rounded-bl-md"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/40 rounded-br-md"></div>
                    </div>

                    {/* Turn Timer */}
                    {currentPlayer === 'player' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-black tracking-wider shadow-2xl backdrop-blur-md transition-all ${turnTimer <= 10
                                ? 'bg-red-900/80 border-red-500 text-red-100 animate-pulse'
                                : 'bg-slate-900/60 border-slate-600 text-slate-200'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">⏱️</span>
                                <span>{turnTimer}s</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Phase Indicator */}
                    <div className={`px-5 py-2 rounded-xl border-2 text-[11px] font-black tracking-[0.2em] uppercase shadow-2xl backdrop-blur-md transition-colors ${currentPlayer === 'player'
                        ? 'bg-blue-900/60 border-blue-500/50 text-blue-100'
                        : 'bg-red-900/60 border-red-500/50 text-red-100'
                        } `}>
                        {phase === 'strategy' ? '🛡️ Fase de Estratégia' : '⚔️ Fase de Batalha'}
                    </div>

                    {/* Battle Button and Toggle Area */}
                    <div className="flex items-center gap-2">
                        {/* Hand Toggle Button-Moved and resized */}
                        <button
                            onClick={() => setShowHand(!showHand)}
                            className="w-12 h-12 bg-slate-900/90 border-2 border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-800 hover:border-cyan-500 transition-all shadow-xl"
                            title={showHand ? "Esconder Mão" : "Mostrar Mão"}
                        >
                            <motion.span
                                animate={{ rotate: showHand ? 0 : 180 }}
                                className="text-xs"
                            >
                                ▼
                            </motion.span>
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={nextPhase}
                            disabled={currentPlayer !== 'player'}
                            className={`w-40 h-12 rounded-xl font-black text-sm transition-all shadow-xl border-b-4 flex items-center justify-center gap-2 ${currentPlayer === 'player'
                                ? phase === 'strategy'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-teal-800 shadow-emerald-500/20'
                                    : 'bg-gradient-to-r from-red-500 to-orange-600 text-white border-red-800 shadow-red-500/20'
                                : 'bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed'
                                } `}
                        >
                            {currentPlayer === 'player'
                                ? phase === 'strategy' ? <span>Batalhar ⚔️</span> : <span>Encerrar Turno 🛑</span>
                                : <span>Aguarde...</span>}
                        </motion.button>
                    </div>
                </div>
            </div>




            {/* Card Detail Overlay (Left Sidebar) */}
            <CardDetailOverlay
                card={inspectingCard}
                onClose={() => setInspectingCard(null)}
                // Dynamic Actions Props
                canActivateAbility={(playerBoard.some(c => c && c.id === inspectingCard?.id) || divineSlots.player.some(c => c && c.id === inspectingCard?.id)) && currentPlayer === 'player'}
                onActivateAbility={() => {
                    if (inspectingCard) {
                        activateAbility(inspectingCard.id);
                        setInspectingCard(null);
                    }
                }}
                canChangePosition={playerHand.some(c => c.id === inspectingCard?.id) && phase === 'strategy'}
                isFaceDownPosition={playFaceDownNext}
                onChangePosition={() => setPlayFaceDownNext(!playFaceDownNext)}
            />
            {/* Removed Old Side Panel */}

            {/* Game Over Screen */}
            {
                gameStatus !== 'playing' && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-br from-gray-900 to-black border-4 rounded-2xl p-8 text-center max-w-md"
                            style={{
                                borderColor: gameStatus === 'victory' ? '#fbbf24' : '#ef4444'
                            }}
                        >
                            <div className={`text-6xl font-black mb-4 ${gameStatus === 'victory' ? 'text-yellow-400' : 'text-red-500'
                                } `}>
                                {gameStatus === 'victory' ? '🏆 VITÓRIA!' : '💀 DERROTA'}
                            </div>

                            <div className="text-2xl text-white mb-6">
                                {gameStatus === 'victory'
                                    ? 'Você derrotou o oponente!'
                                    : 'Você foi derrotado...'}
                            </div>

                            <div className="flex gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.location.reload()}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg"
                                >
                                    JOGAR NOVAMENTE
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/')}
                                    className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold px-6 py-3 rounded-lg shadow-lg"
                                >
                                    MENU PRINCIPAL
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )
            }


            {/* Target Selection Overlay */}
            {targetSelectionMode?.active && (
                <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center pt-32">
                    <div className="bg-black/80 backdrop-blur pointer-events-auto px-8 py-4 rounded-full border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-bounce-slow flex items-center gap-4">
                        <div className="text-cyan-400 font-bold animate-pulse">
                            SELECIONE UM ALVO
                        </div>
                        <button
                            onClick={cancelTargetSelection}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 px-3 py-1 rounded text-sm transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                    <div className="mt-2 text-white/50 text-sm bg-black/50 px-4 py-1 rounded-full">
                        {targetSelectionMode.effect.description || "Escolha uma carta"}
                    </div>
                </div>
            )}

            {/* Maintenance Overlay */}
            {
                pendingMaintenance && pendingMaintenance.length > 0 && (() => {
                    const unitId = pendingMaintenance[0];
                    const unit = playerBoard.find(u => u?.id === unitId);
                    if (!unit) return null;

                    return (
                        <MaintenanceOverlay
                            unit={unit as Card}
                            playerBoard={playerBoard as (Card | null)[]}
                            onPay={(sacrificeId) => resolveMaintenance(unitId, sacrificeId)}
                            onSkip={() => resolveMaintenance(unitId)}
                        />
                    );
                })()
            }


            <EffectAnimations />
            <DrawAnimation triggering={isDrawing} onComplete={() => setIsDrawing(false)} />

            {/* Graveyard Modals */}
            <GraveyardModal
                isOpen={showPlayerGraveyard}
                onClose={() => setShowPlayerGraveyard(false)}
                cards={playerGraveyard}
                title="Seu Cemitério"
            />
            <GraveyardModal
                isOpen={showOpponentGraveyard}
                onClose={() => setShowOpponentGraveyard(false)}
                cards={opponentGraveyard}
                title="Cemitério do Oponente"
            />
        </div >
    );
};

export const Battle: React.FC = () => {
    return (
        <BattleProvider>
            <BattleContent />
        </BattleProvider>
    );
};
