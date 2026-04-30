import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Clock, FastForward } from 'lucide-react';
import { Header } from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Deck } from './Deck';
import { Team } from './Team';
import { Shop } from './Shop';
import { ArenaRoad } from '../components/ArenaRoad';
import { ARENAS } from '../constants/arenas';
import { ProfileMenu } from '../components/ProfileMenu';
import { useGame } from '../contexts/GameContext';
import { useCards } from '../contexts/CardContext';
import { PageTransition } from '../components/PageTransition';
import { PackOpeningModal } from '../components/PackOpeningModal';
import { usePacks } from '../hooks/usePacks';
import type { Pack, Card } from '../types';
import { generatePackContent } from '../utils/gachaLogic';
import { TutorialOverlay } from '../components/TutorialOverlay';
import type { TutorialStep } from '../components/TutorialOverlay';
import { TUTORIALS } from '../constants/tutorials';
import { ShenlongModal } from '../components/ShenlongModal';
import { Eventos } from './Eventos';

// ... (rest of imports)

// Helper Component for Header Nav Buttons removed

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { profile, deck, updateDeck, updateProfile } = useGame();
    const { cards } = useCards();
    const [currentTab, setCurrentTab] = useState<'home' | 'deck' | 'equipes' | 'eventos' | 'loja' | 'arenas'>('home');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showDeckWarning, setShowDeckWarning] = useState(false);
    const [showArenas, setShowArenas] = useState(false);

    // Tutorial State
    const [activeTutorialSteps, setActiveTutorialSteps] = useState<TutorialStep[] | null>(null);
    const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);

    // Shenron State
    const [showShenron, setShowShenron] = useState(false);

    // Check for Tutorials
    useEffect(() => {
        if (!profile) return;
        const seen = new Set(profile.tutorialsSeen || []);

        const checkAndTrigger = (id: string, condition: boolean) => {
            if (condition && !seen.has(id)) {
                setActiveTutorialId(id);
                setActiveTutorialSteps(TUTORIALS[id]);
                return true;
            }
            return false;
        };

        // Priority check (lower arenas first)
        // Ensure TUTORIALS[id] exists before triggering
        if (TUTORIALS['ARENA_2_EFFECTS'] && checkAndTrigger('ARENA_2_EFFECTS', profile.trophies >= 300)) return;
        if (TUTORIALS['ARENA_4_SACRIFICE'] && checkAndTrigger('ARENA_4_SACRIFICE', profile.trophies >= 1000)) return;
        if (TUTORIALS['ARENA_7_RANKED'] && checkAndTrigger('ARENA_7_RANKED', profile.trophies >= 2500)) return;
        if (TUTORIALS['ARENA_9_ZETAS'] && checkAndTrigger('ARENA_9_ZETAS', profile.trophies >= 4000)) return;

    }, [profile.trophies, profile.tutorialsSeen]);

    const handleTutorialComplete = () => {
        if (activeTutorialId) {
            const newSeen = [...(profile.tutorialsSeen || []), activeTutorialId];
            updateProfile({ tutorialsSeen: newSeen });
            setActiveTutorialSteps(null);
            setActiveTutorialId(null);
        }
    };

    const handleTutorialAction = (actionId: string) => {
        if (actionId === 'SUMMON_SHENRON') {
            setShowShenron(true);
            // Optionally close tutorial immediately or wait?
            // If we keep tutorial open behind, it's weird.
            // Let's mark tutorial as complete since user took action
            handleTutorialComplete();
        }
    };

    const handleShenronWish = (wish: string) => {
        console.log("Shenron Wish Granted:", wish);
        // Implement wish logic here if needed (e.g., unlocking cards)
        if (wish === 'Unlock All') {
            // Demo Logic
            const allIds = cards.map(c => c.id);
            updateProfile({ ownedCards: allIds });
        }
    };

    const handleBattleClick = () => {
        // Find highest unlocked arena
        // Start from highest ID (reverse)
        const currentArena = [...ARENAS].reverse().find(a => profile.trophies >= a.trophies) || ARENAS[0];

        if (deck.length === 40) {
            navigate('/battle', {
                state: {
                    arenaId: currentArena.id,
                    file: currentArena.file,
                    variants: currentArena.variants
                }
            });
        } else {
            setShowDeckWarning(true);
        }
    };

    const handleAutoFillAndBattle = () => {
        const currentArena = [...ARENAS].reverse().find(a => profile.trophies >= a.trophies) || ARENAS[0];
        const needed = 40 - deck.length;
        if (needed <= 0) {
            navigate('/battle', {
                state: {
                    arenaId: currentArena.id,
                    file: currentArena.file,
                    variants: currentArena.variants
                }
            });
            return;
        }
        const availableCardIds = cards.map(card => card.id).filter(cardId => !deck.includes(cardId));
        for (let i = availableCardIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableCardIds[i], availableCardIds[j]] = [availableCardIds[j], availableCardIds[i]];
        }
        const picked = availableCardIds.slice(0, needed);
        const newDeck = [...deck, ...picked];
        updateDeck(newDeck);
        setShowDeckWarning(false);
        navigate('/battle');
    };


    // Pack opening state
    const { packs: _packs, openPack: _openPack, getRemainingTime: _getRemainingTime, formatTime: _formatTime, unlockInstantly: _unlockInstantly } = usePacks();
    const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
    const [openedCards, setOpenedCards] = useState<Card[]>([]);
    const [skipAnimation, setSkipAnimation] = useState(false);

    // Hold to skip state
    const [showSkipButton, setShowSkipButton] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);


    // Pack opening handlers
    const handleOpenPack = (pack: Pack, skip: boolean = false) => {
        // Calculate max arena for drops
        const currentArena = [...ARENAS].reverse().find(a => profile.trophies >= a.trophies) || ARENAS[0];

        // Generate cards using Smart Drops Logic
        const newCards = generatePackContent(pack.tier, currentArena.id, profile.ownedCards || []);

        // Persist to Inventory
        const currentOwned = new Set(profile.ownedCards || []);
        newCards.forEach(c => currentOwned.add(c.id));

        updateProfile({
            ownedCards: Array.from(currentOwned)
        });

        setSelectedPack(pack);
        setOpenedCards(newCards);
        setSkipAnimation(skip);
        setShowSkipButton(false); // Reset UI state
    };



    // Test pack for demonstration
    const testPack: Pack = {
        id: 'test-pack-1',
        tier: 'Bronze',
        unlockTime: Date.now(),
        isUnlocking: false
    };

    const renderContent = () => {
        switch (currentTab) {
            case 'deck':
                return <PageTransition><Deck /></PageTransition>;
            case 'equipes':
                return <PageTransition><Team onBack={() => setCurrentTab('home')} /></PageTransition>;
            case 'eventos':
                return <PageTransition><Eventos onBack={() => setCurrentTab('home')} /></PageTransition>;
            // case 'arenas': // Removed legacy component reference
            //    return <Arenas />;
            case 'loja':
                return <PageTransition><Shop onBack={() => setCurrentTab('home')} /></PageTransition>;
            default:
                return (
                    <PageTransition className="flex h-full w-full">
                        {/* Left Sidebar - Info Cards - Hidden when Arenas are shown */}
                        <AnimatePresence>
                            {!showArenas && (
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -100, opacity: 0 }}
                                    className="w-64 p-3 space-y-3 overflow-y-auto no-scrollbar z-10"
                                >

                                    {/* Item 1 - Nova Conquista */}
                                    <motion.div
                                        className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 hover:border-yellow-500/50 transition cursor-pointer group h-44 flex flex-col justify-between relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-yellow-500 tracking-wider uppercase">Nova Conquista</span>
                                                <span className="text-xl font-black italic text-white">INICIADA!</span>
                                            </div>
                                            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/50">
                                                <span className="text-lg">🎖️</span>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="text-xs text-gray-300 mb-2">
                                                Suba de ranking e ganhe recompensas exclusivas.
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <img src="/cards/1051.png" alt="Guerreiro" className="w-12 h-12 rounded-lg object-cover border border-yellow-500/30" />
                                                <div className="flex-1">
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold">Recompensa</div>
                                                    <div className="text-xs font-bold text-yellow-400">Carta Exclusiva</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Item 2 - Evento de Fim de Semana */}
                                    <motion.div
                                        className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 backdrop-blur-sm rounded-xl overflow-hidden border border-cyan-500/30 h-24 relative group cursor-pointer"
                                    >
                                        <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition duration-700">
                                            <img src="/cards/capa3.png" alt="Pack" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent p-3 flex flex-col justify-center">
                                            <div className="text-[9px] font-bold text-cyan-400 mb-1">EVENTO ESPECIAL</div>
                                            <div className="text-sm font-black italic text-white leading-tight">FIM DE<br />SEMANA</div>
                                            <div className="mt-2 text-[9px] bg-red-600 text-white px-2 py-0.5 rounded w-fit font-bold animate-pulse">
                                                2x Moedas
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Item 3 - Atualização */}
                                    <motion.div
                                        className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50 flex items-center gap-3 cursor-pointer hover:bg-gray-800/60 transition"
                                    >
                                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl border border-gray-700">
                                            ⚙️
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-0.5">Conquistas Atuais</div>
                                            <div className="text-xs font-bold text-green-400">Novas Mecânicas</div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Center - Character OR Arena Road */}
                        <div className="flex-1 flex flex-col items-center justify-center relative z-0 h-full overflow-hidden">
                            <AnimatePresence mode="wait">
                                {showArenas ? (
                                    <motion.div
                                        key="arena-road"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="w-full h-full"
                                    >
                                        <ArenaRoad onBattle={handleBattleClick} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="character"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: 0.3 }}
                                        className="w-full h-full flex items-end justify-center pointer-events-none pb-0"
                                    >
                                        <img
                                            src="/character.png"
                                            alt="Character"
                                            className="h-[85%] w-auto object-contain drop-shadow-2xl"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Sidebar - Pack Slots - Hidden when Arenas are shown */}
                        <AnimatePresence>
                            {!showArenas && (
                                <motion.div
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 100, opacity: 0 }}
                                    className="w-80 p-4 space-y-3 overflow-y-auto no-scrollbar z-10"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Pack Slot 1 - Opening */}
                                        <motion.div
                                            className="relative rounded-xl transition cursor-pointer h-48 group"
                                        >
                                            {/* Pack Visual - Using capa3.png */}
                                            <div className="absolute inset-0 rounded-xl shadow-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 border border-white/10">
                                                <img
                                                    src="/cards/capa3.png"
                                                    alt="Pack Opening"
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Metallic Shine Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/20 pointer-events-none"></div>

                                                {/* Timer Overlay */}
                                                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                                                    <div className="bg-black/80 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 border border-white/10 shadow-lg">
                                                        <Clock size={10} className="text-blue-400" />
                                                        <span className="text-[10px] font-bold text-white tabular-nums">2:15:30</span>
                                                        <div className="w-12 bg-gray-700 rounded-full h-1">
                                                            <div className="bg-blue-500 h-1 rounded-full" style={{ width: '65%' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Pack Slot 2 - Ready */}
                                        <motion.div
                                            onClick={() => handleOpenPack(testPack)}
                                            className="relative rounded-xl transition cursor-pointer h-48 group"
                                        >
                                            {/* Pack Visual - Using capa3.png */}
                                            <div className="absolute inset-0 rounded-xl shadow-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 border border-white/10 animate-pulse">
                                                <img
                                                    src="/cards/capa3.png"
                                                    alt="Pack Ready"
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Metallic Shine Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/20 pointer-events-none"></div>
                                                {/* Ready Overlay with Hold-to-Skip */}
                                                <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center justify-end h-24 pointer-events-none">
                                                    {/* Skip Button (Appears on Hold) */}
                                                    <AnimatePresence>
                                                        {showSkipButton && (
                                                            <motion.button
                                                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenPack(testPack, true);
                                                                }}
                                                                className="mb-2 bg-gray-700 text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-lg border border-gray-500 pointer-events-auto flex items-center gap-1 hover:bg-gray-600 transition z-20"
                                                            >
                                                                <FastForward size={12} />
                                                                PULAR
                                                            </motion.button>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Open Button */}
                                                    <motion.button
                                                        className="bg-green-500 text-black px-4 py-1.5 rounded-full font-black text-xs shadow-lg border-2 border-green-300 pointer-events-auto relative z-10 active:scale-95 transition-transform"
                                                        onMouseDown={() => {
                                                            const timer = setTimeout(() => setShowSkipButton(true), 500);
                                                            setLongPressTimer(timer);
                                                        }}
                                                        onMouseUp={() => {
                                                            if (longPressTimer) clearTimeout(longPressTimer);
                                                            if (!showSkipButton) {
                                                                handleOpenPack(testPack, false);
                                                            }
                                                            if (showSkipButton) {
                                                                setTimeout(() => setShowSkipButton(false), 2000);
                                                            }
                                                        }}
                                                        onMouseLeave={() => {
                                                            if (longPressTimer) clearTimeout(longPressTimer);
                                                            if (showSkipButton) setTimeout(() => setShowSkipButton(false), 2000);
                                                        }}
                                                    >
                                                        ABRIR AGORA
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Empty Slots */}
                                        {[1, 2].map((_, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-gray-800 border-dashed hover:border-gray-600 transition cursor-pointer h-44 flex flex-col items-center justify-center group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-2 group-hover:bg-gray-700 transition">
                                                    <Lock size={20} className="text-gray-600 group-hover:text-gray-400" />
                                                </div>
                                                <div className="text-[10px] text-gray-600 font-bold uppercase">Vazio</div>
                                                <div className="mt-4 text-[9px] text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                                                    + Batalha
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </PageTransition>
                );
        }
    };

    return (
        <div className="h-screen w-screen text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">
            {/* Global Background */}
            <div className={`absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center transition-all duration-1000 ${showArenas ? 'blur-md scale-110' : ''}`}></div>

            {/* Overlay for readability */}
            <div className={`absolute inset-0 transition-colors duration-1000 pointer-events-none ${showArenas ? 'bg-black/60' : 'bg-black/20'}`}></div>

            {/* Top Navigation Bar - Always Visible */}
            <Header
                currentTab={currentTab}
                onTabChange={(tab: string) => setCurrentTab(tab as any)}
                onOpenProfile={() => setShowProfileMenu(true)}
            />

            {/* Main Content Area */}
            <div className={`relative z-10 flex w-full h-full pt-16`}>
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>

            {/* Battle Button - Bottom Right (Only on Home and NOT in Arenas) */}
            {currentTab === 'home' && !showArenas && (
                <div className="absolute bottom-6 right-6 z-40">
                    <div className="flex items-center gap-3">
                        {/* Arena Switch Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowArenas(!showArenas)}
                            className="w-20 h-20 flex items-center justify-center transition-all"
                        >
                            <img
                                src="/arena_button.png"
                                alt="Toggle Arenas"
                                className={`w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all ${showArenas ? 'brightness-125' : 'brightness-90 hover:brightness-100'}`}
                            />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBattleClick}
                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-black text-lg transition shadow-2xl border-2 border-orange-400/50 flex items-center gap-2"
                        >
                            <span className="text-xl">⚔️</span>
                            BATALHAR
                        </motion.button>
                    </div>

                    {/* Deck Warning Badge */}
                    <AnimatePresence>
                        {deck.length !== 40 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 cursor-pointer hover:bg-red-600 transition"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentTab('deck');
                                }}
                                title={`Deck incompleto: ${deck.length}/40 cartas`}
                            >
                                <span>⚠️</span>
                                <span>{deck.length}/40</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Floating Deck Warning Popup */}
                    <AnimatePresence>
                        {showDeckWarning && (
                            <>
                                <div
                                    className="fixed inset-0 z-[45]"
                                    onClick={() => setShowDeckWarning(false)}
                                />
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 10 }}
                                    className="absolute bottom-full right-0 mb-2 w-56 bg-gradient-to-br from-gray-900 to-black border-2 border-red-500/60 rounded-xl p-3 shadow-2xl z-50"
                                >
                                    <div className="flex flex-col gap-2.5">
                                        <div className="text-center">
                                            <div className="text-red-400 font-black text-xs mb-1">
                                                ⚠️ DECK INCOMPLETO
                                            </div>
                                            <div className="text-gray-400 text-[10px]">
                                                {deck.length}/40 cartas
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAutoFillAndBattle}
                                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] transition shadow-lg flex flex-col items-center justify-center gap-0.5"
                                            >
                                                <span className="text-sm">🎲</span>
                                                <span>Completar</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowDeckWarning(false);
                                                    setCurrentTab('deck');
                                                }}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] transition shadow-lg flex flex-col items-center justify-center gap-0.5"
                                            >
                                                <span className="text-sm">🎴</span>
                                                <span>Editar</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Floating Close Map Button (Alternative if Home buttons are hidden) */}
            {showArenas && (
                <div className="absolute bottom-6 right-6 z-50">
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowArenas(false)}
                        className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold border border-white/20 shadow-2xl flex items-center gap-2"
                    >
                        <span>⬅️</span>
                        VOLTAR
                    </motion.button>
                </div>
            )}

            {/* Profile Menu Modal */}
            <AnimatePresence>
                {showProfileMenu && <ProfileMenu onClose={() => setShowProfileMenu(false)} />}
            </AnimatePresence>

            {/* Pack Opening Modal */}
            {selectedPack && openedCards.length > 0 && (
                <PackOpeningModal
                    pack={selectedPack}
                    cards={openedCards}
                    onClose={() => {
                        setSelectedPack(null);
                        setOpenedCards([]);
                        setSkipAnimation(false);
                    }}

                    skipAnimation={skipAnimation}
                />
            )}

            {/* Tutorial Overlay */}
            <AnimatePresence>
                {activeTutorialSteps && (
                    <TutorialOverlay
                        steps={activeTutorialSteps}
                        onComplete={handleTutorialComplete}
                        onSkip={handleTutorialComplete}
                        onAction={handleTutorialAction}
                    />
                )}
            </AnimatePresence>

            {/* Shenlong Modal */}
            <AnimatePresence>
                {showShenron && (
                    <ShenlongModal
                        onClose={() => setShowShenron(false)}
                        onWish={handleShenronWish}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}


