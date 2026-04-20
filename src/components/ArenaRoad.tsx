import React, { useRef, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Gem, Gift, Star, Trophy, ChevronUp, ChevronDown, Swords, Lock } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { ARENAS } from '../constants/arenas';
import { initialCards } from '../data/cards';
import { CardDetailModal } from './CardDetailModal';

// IDs of all cards that are special offers/baits
const ALL_BAITS = ARENAS.flatMap(a => a.offers.map(o => o.cardId));

interface RoadNode {
    id: string;
    type: 'arena' | 'reward';
    name?: string;
    trophies: number;
    arenaData?: any;
    rewardType?: 'gold' | 'gems' | 'pack' | 'card';
    amount?: number | string;
    indexInRoad: number;
}

interface ArenaRoadProps {
    onBattle?: () => void;
}

export const ArenaRoad: React.FC<ArenaRoadProps> = ({ onBattle }) => {
    const { profile } = useGame();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [expandedArenaId, setExpandedArenaId] = useState<number | null>(null);
    const [detailCard, setDetailCard] = useState<any>(null);

    // Generate the full road with intermediate rewards
    const fullRoad = useMemo(() => {
        const nodes: RoadNode[] = [];
        let globalIndex = 0;

        for (let i = 0; i < ARENAS.length; i++) {
            const currentArena = ARENAS[i];

            // Add Arena Node
            nodes.push({
                id: `arena-${currentArena.id}`,
                type: 'arena',
                name: currentArena.name,
                trophies: currentArena.trophies,
                arenaData: currentArena,
                indexInRoad: globalIndex++
            });

            // Add intermediate rewards before the next arena (if it exists)
            if (i < ARENAS.length - 1) {
                const nextArena = ARENAS[i + 1];
                const trophyGap = nextArena.trophies - currentArena.trophies;
                const rewardStep = trophyGap / 6; // 5 rewards in between

                const rewardPool: ('gold' | 'gems' | 'gold' | 'pack' | 'card')[] = ['gold', 'gems', 'gold', 'pack', 'card'];


                for (let j = 1; j <= 5; j++) {
                    // Update intermediate rewards to use specific packs
                    const rType = rewardPool[j - 1];
                    let amount: any = rType === 'gold' ? (100 * (i + 1) * j) : (rType === 'gems' ? 10 : 1);

                    // Special Pack names
                    if (rType === 'pack') {
                        const tiers = ['Bronze', 'Prata', 'Ouro', 'Rubi', 'Diamante', 'Fusão'];
                        amount = `Pack de ${tiers[i % tiers.length]}`;
                    }

                    nodes.push({
                        id: `reward-${currentArena.id}-${j}`,
                        type: 'reward',
                        trophies: Math.floor(currentArena.trophies + (rewardStep * j)),
                        rewardType: rType as any,
                        amount: amount,
                        indexInRoad: globalIndex++
                    });
                }
            }
        }
        return nodes;
    }, []);

    // Prevent window-level scrolling when map is open
    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Auto-scroll to current progression - Locked to container to prevent window shifting
    useEffect(() => {
        if (scrollContainerRef.current) {
            const currentIdx = fullRoad.findIndex(node => profile.trophies < node.trophies);
            const targetIdx = currentIdx === -1 ? fullRoad.length - 1 : Math.max(0, currentIdx - 1);

            setTimeout(() => {
                const container = scrollContainerRef.current;
                const nodeElements = container?.querySelectorAll('.road-node');
                const targetElement = nodeElements?.[targetIdx] as HTMLElement;

                if (container && targetElement) {
                    // Manual scroll calculation to avoid browser-level scrollIntoView issues
                    const targetTop = targetElement.offsetTop;
                    const containerHeight = container.offsetHeight;
                    const elementHeight = targetElement.offsetHeight;

                    // Center the element in the container
                    container.scrollTo({
                        top: targetTop - (containerHeight / 2) + (elementHeight / 2),
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [fullRoad, profile.trophies]);

    const getRewardIcon = (type?: string, size: number = 20) => {
        switch (type) {
            case 'gold': return <Coins className="text-yellow-400" size={size} />;
            case 'gems': return <Gem className="text-cyan-400" size={size} />;
            case 'pack': return <Gift className="text-purple-400" size={size} />;
            case 'card': return <Star className="text-orange-400" size={size} />;
            default: return <Gift size={size} />;
        }
    };

    const getRewardUnit = (type?: string, amount?: number | string) => {
        const val = Number(amount);
        switch (type) {
            case 'gold': return 'Ouro';
            case 'gems': return val > 1 ? 'Gemas' : 'Gema';
            case 'pack':
                return ''; // Amount now contains the full name like "Pack de Ouro"
            case 'card': return 'Carta';
            default: return '';
        }
    };

    return (
        <>
            <div className="h-full w-full relative flex flex-col items-center select-none overflow-hidden font-sans">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0.1, y: Math.random() * 1000 - 500, x: Math.random() * 2000 - 1000 }}
                            animate={{ opacity: [0.1, 0.4, 0.1], y: ['-20%', '120%'] }}
                            transition={{ duration: Math.random() * 15 + 15, repeat: Infinity, ease: "linear" }}
                            className="absolute w-1 h-1 bg-white rounded-full blur-sm"
                        />
                    ))}
                </div>

                {/* Ranked Mode Button - Unlocks at Arena 7 */}
                {(() => {
                    const currentArena = [...ARENAS].reverse().find(a => profile.trophies >= a.trophies) || ARENAS[0];
                    const isRankedUnlocked = currentArena.id >= 7;

                    return (
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={isRankedUnlocked ? onBattle : undefined}
                            disabled={!isRankedUnlocked}
                            className={`absolute top-6 right-6 z-50 px-6 py-3 rounded-xl font-black flex items-center gap-3 shadow-2xl border-2 transition-all ${isRankedUnlocked
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 border-yellow-400 hover:from-red-500 hover:to-orange-500 hover:scale-105 cursor-pointer'
                                : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            {isRankedUnlocked ? (
                                <>
                                    <Swords size={20} className="text-white" />
                                    <span className="text-white">MODO RANKEADA</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={20} className="text-gray-500" />
                                    <span className="text-gray-400">RANKEADA (Arena 7)</span>
                                </>
                            )}
                        </motion.button>
                    );
                })()}

                <div
                    ref={scrollContainerRef}
                    className="w-full h-full overflow-y-auto no-scrollbar pt-32 pb-4 px-4 flex flex-col-reverse items-center relative z-10"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* Central Energy Core */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-cyan-600/5 via-blue-500/10 to-transparent -translate-x-1/2 pointer-events-none z-0">
                        <div className="absolute inset-0 w-[1px] left-1/2 -translate-x-1/2 bg-cyan-400/20 shadow-[0_0_10px_rgba(6,182,212,0.3)]"></div>
                    </div>

                    {fullRoad.map((node) => {
                        const isUnlocked = profile.trophies >= node.trophies;

                        // Determine if this is the CURRENT arena (player's trophies are within this arena's range)
                        let isCurrentArena = false;
                        if (node.type === 'arena') {
                            const arenaIndex = ARENAS.findIndex(a => a.id === node.arenaData.id);
                            const nextArena = ARENAS[arenaIndex + 1];

                            isCurrentArena = profile.trophies >= node.arenaData.trophies &&
                                (!nextArena || profile.trophies < nextArena.trophies);
                        }

                        if (node.type === 'arena') {
                            const arenaPacks = ['Bronze', 'Prata', 'Ouro', 'Rubi', 'Diamante', 'Fusão'];
                            const packTier = arenaPacks[(node.arenaData.id - 1) % arenaPacks.length];
                            const arenaRewards = [
                                { type: 'gold', amount: 500 * node.arenaData.id },
                                { type: 'pack', amount: `Pack de ${packTier}` },
                                { type: 'gems', amount: 50 }
                            ];

                            return (
                                <div key={node.id} className="road-node relative w-full flex flex-col items-center py-24 z-10">
                                    {/* Energy Highlight */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2">
                                        {isUnlocked && <div className="h-full w-full bg-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.4)]" />}
                                    </div>

                                    {/* Massive Arena Icon - Increased Size & No Animation */}
                                    <div
                                        className="relative z-10 flex flex-col items-center"
                                    >
                                        {/* Motivational Phrase for Locked Arenas */}
                                        {!isUnlocked && node.arenaData.motivationalPhrase && (
                                            <div className="absolute -top-24 z-20 flex flex-col items-center gap-1 whitespace-nowrap px-6 py-3 bg-black/80 rounded-2xl backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Arena Bloqueada</span>
                                                <span className="text-sm font-black text-white italic tracking-wider drop-shadow-md">
                                                    "{node.arenaData.motivationalPhrase}"
                                                </span>
                                            </div>
                                        )}

                                        <div className={`relative w-80 h-80 md:w-[520px] md:h-[520px] flex items-center justify-center pointer-events-auto transition-all duration-500 ${isUnlocked ? '' : 'filter grayscale-[0.2] contrast-[1.1] brightness-[0.8]'}`}>
                                            <AnimatePresence>
                                                {isUnlocked && (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                                        transition={{ duration: 5, repeat: Infinity }}
                                                        className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full"
                                                    />
                                                )}
                                            </AnimatePresence>

                                            <img
                                                src={`/arenas/${node.arenaData.file}_icon.png`}
                                                alt={node.name}
                                                className="w-full h-full object-contain filter drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)] cursor-pointer active:scale-95 transition-transform"
                                                onClick={onBattle}
                                            />
                                        </div>

                                        {/* Central Info Below Icon - Overlapping Spacing */}
                                        <div className="-mt-24 md:-mt-32 flex flex-col items-center pointer-events-none group/info z-20">

                                            <span className={`text-[11px] font-black uppercase tracking-[0.5em] mb-1 ${isCurrentArena ? 'text-cyan-400' : isUnlocked ? 'text-green-400' : 'text-white/60'}`}>
                                                {isCurrentArena ? 'ARENA ATUAL' : `ARENA ${node.arenaData.id}`}
                                            </span>

                                            <div className="relative flex flex-col items-center">
                                                <h2 className="text-xl md:text-3xl font-black uppercase text-white tracking-[0.1em] drop-shadow-[0_2px_10px_rgba(0,0,0,1)] leading-none">
                                                    {node.name}
                                                </h2>

                                                <div className={`mt-3 flex items-center gap-2 ${isUnlocked ? 'text-yellow-400' : 'text-white/60'}`}>
                                                    <Trophy size={18} className="fill-current" />
                                                    <span className="text-lg font-black tabular-nums tracking-widest drop-shadow-lg">{node.trophies} CONQUISTAS</span>
                                                </div>
                                            </div>

                                            {/* Rewards - Clean Layout Above Cards */}
                                            <div className="mt-6 flex items-center gap-6">
                                                {arenaRewards.map((reward, rid) => (
                                                    <div key={rid} className="flex flex-col items-center group/reward relative">
                                                        <div className="relative">
                                                            {getRewardIcon(reward.type, 24)}
                                                            <div className="absolute inset-0 bg-white/20 blur-lg rounded-full opacity-0 group-hover/reward:opacity-100 transition-opacity" />
                                                        </div>
                                                        <span className="text-xs font-black mt-1 text-white drop-shadow-md">
                                                            {reward.amount}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Unlocked Cards Display - Clean Grid Below */}
                                            {node.arenaData.poolIds && (
                                                <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-2xl px-4">
                                                    <div className="flex bg-gradient-to-r from-transparent via-white/10 to-transparent h-[1px] w-full max-w-xs mb-2 opacity-30" />

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-cyan-400 drop-shadow-md">
                                                            Cartas Desbloqueadas
                                                        </span>
                                                        {(() => {
                                                            const currentArenaIdx = ARENAS.findIndex(a => a.id === node.arenaData.id);
                                                            const prevArenasRarities = ARENAS.slice(0, currentArenaIdx).flatMap(a => a.unlockedRarities);

                                                            const additionalCards = initialCards.filter(c =>
                                                                node.arenaData.unlockedRarities.includes(c.rarity) &&
                                                                !prevArenasRarities.includes(c.rarity) &&
                                                                !node.arenaData.poolIds.includes(c.id) &&
                                                                !ALL_BAITS.includes(c.id)
                                                            );

                                                            if (additionalCards.length === 0) return null;

                                                            const isExpanded = expandedArenaId === node.arenaData.id;

                                                            return (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setExpandedArenaId(isExpanded ? null : node.arenaData.id);
                                                                    }}
                                                                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/30 transition-colors pointer-events-auto"
                                                                >
                                                                    <span className="text-[8px] font-bold text-cyan-300 uppercase tracking-wider">
                                                                        {isExpanded ? 'Ver Menos' : 'Ver Mais'}
                                                                    </span>
                                                                    {isExpanded ? <ChevronUp size={10} className="text-cyan-300" /> : <ChevronDown size={10} className="text-cyan-300" />}
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>

                                                    <div className="flex flex-col items-center gap-4">
                                                        {/* Main Highlight Pool */}
                                                        <div className="flex flex-wrap justify-center gap-4">
                                                            {node.arenaData.poolIds.map((cardId: string, idx: number) => {
                                                                const cardRef = initialCards.find(c => c.id === cardId);
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (cardRef) setDetailCard(cardRef);
                                                                        }}
                                                                        className="w-14 h-20 md:w-16 md:h-24 rounded border border-white/10 bg-gray-900/50 shadow-lg relative group/card pointer-events-auto transform hover:-translate-y-1 transition-transform cursor-pointer"
                                                                    >
                                                                        <img
                                                                            src={`/cards/${cardId}.png`}
                                                                            className={`w-full h-full object-cover rounded-[3px] ${isUnlocked ? '' : 'filter grayscale-[0.85] contrast-[1.25] brightness-[0.7]'}`}
                                                                            alt=""
                                                                        />
                                                                        {/* Card Name Overlay - On top of image */}
                                                                        <div className="absolute inset-0 flex items-end justify-center pb-1 bg-gradient-to-t from-black/90 via-transparent to-transparent">
                                                                            <span className="text-[6px] font-bold text-white uppercase tracking-wider text-center px-1 leading-tight line-clamp-2">
                                                                                {cardRef?.name || '???'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Expanded Additional Cards */}
                                                        <AnimatePresence>
                                                            {expandedArenaId === node.arenaData.id && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden w-full flex justify-center"
                                                                >
                                                                    <div className="flex flex-wrap justify-center gap-2 pt-2 p-2 max-w-lg">
                                                                        {(() => {
                                                                            const currentArenaIdx = ARENAS.findIndex(a => a.id === node.arenaData.id);
                                                                            const prevArenasRarities = ARENAS.slice(0, currentArenaIdx).flatMap(a => a.unlockedRarities);

                                                                            return initialCards
                                                                                .filter(c =>
                                                                                    node.arenaData.unlockedRarities.includes(c.rarity) &&
                                                                                    !prevArenasRarities.includes(c.rarity) &&
                                                                                    !node.arenaData.poolIds.includes(c.id) &&
                                                                                    !ALL_BAITS.includes(c.id)
                                                                                )
                                                                                .map((card, idx) => (
                                                                                    <div
                                                                                        key={`extra-${idx}`}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setDetailCard(card);
                                                                                        }}
                                                                                        className="w-10 h-14 rounded border border-white/5 bg-gray-900/50 relative pointer-events-auto cursor-pointer hover:border-cyan-500/50 transition-colors"
                                                                                    >
                                                                                        <img
                                                                                            src={`/cards/${card.id}.png`}
                                                                                            className={`w-full h-full object-cover rounded-[2px] ${isUnlocked ? '' : 'filter grayscale-[0.9]'}`}
                                                                                            alt=""
                                                                                        />
                                                                                    </div>
                                                                                ));
                                                                        })()}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            // Reward Node - Central Hologram
                            return (
                                <div key={node.id} className="road-node relative w-full flex flex-col items-center py-6 z-10">
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2">
                                        {isUnlocked && <div className="h-full w-full bg-cyan-400/10 shadow-[0_0_8px_rgba(6,182,212,0.2)]" />}
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={`relative flex flex-col items-center ${!isUnlocked && 'opacity-30 grayscale filter'}`}
                                    >
                                        <div className={`relative w-16 h-16 flex items-center justify-center rounded-full border-2 transition-all ${isUnlocked ? 'bg-black/60 border-cyan-500/30' : 'bg-black/20 border-white/5'
                                            }`}>
                                            <div className="scale-110">
                                                {getRewardIcon(node.rewardType, 22)}
                                            </div>
                                        </div>

                                        {/* Full Desc Label */}
                                        <div className="mt-2 flex flex-col items-center">
                                            <span className="text-[10px] font-black text-white px-3 py-1 bg-black/40 rounded-full backdrop-blur-md border border-white/5">
                                                {node.amount} {getRewardUnit(node.rewardType, node.amount)}
                                            </span>
                                            <span className={`text-[8px] uppercase mt-1 font-bold italic ${isUnlocked ? 'text-white/40' : 'text-white/20'}`}>
                                                {node.trophies} Conquistas
                                            </span>
                                        </div>

                                        {isUnlocked && (
                                            <motion.div
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full -z-10"
                                            />
                                        )}
                                    </motion.div>
                                </div>
                            );
                        }
                    })}
                </div>

                {/* HUD (Top) - Redesigned & Smaller */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-50">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-black/80 backdrop-blur-xl rounded-full pl-1.5 pr-4 py-1.5 border border-white/10 flex items-center gap-3 shadow-xl"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border border-yellow-200/50">
                            <Trophy className="text-black" size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-yellow-500/80 font-black uppercase tracking-widest leading-none mb-0.5">Conquistas</span>
                            <span className="text-base font-black text-white tabular-nums leading-none tracking-tight">{profile.trophies}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-black/80 backdrop-blur-xl rounded-full px-4 py-2 border border-cyan-500/20 flex items-center gap-2.5 shadow-xl"
                    >
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_cyan]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-200">
                            {profile.trophies >= 2200 ? 'RANKEADA' : 'WORLD TOUR'}
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Card Detail Modal */}
            {detailCard && (
                <CardDetailModal
                    card={detailCard}
                    onClose={() => setDetailCard(null)}
                    isLocked={(() => {
                        if (!profile) return false;
                        const unlockArena = ARENAS.find(a => a.unlockedRarities.includes(detailCard.rarity));
                        return unlockArena ? profile.trophies < unlockArena.trophies : false;
                    })()}
                />
            )}
        </>);
};
