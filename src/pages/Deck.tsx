import React, { useState, useMemo, useEffect } from 'react';
import { Lock, Trash2, Shuffle, BarChart3, PieChart, Zap, AlertCircle, CheckCircle, Star, TrendingUp, Grid3x3, List, Search, X, ArrowRightLeft, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useCards } from '../contexts/CardContext';
import { ARENAS } from '../constants/arenas';
import { getDeckSizeLimit } from '../utils/deckValidator';
import { CardDetailModal } from '../components/CardDetailModal';
import { CardVisual } from '../components/CardVisual';

// --- DATA CONSTANTS ---
const RARITIES = ['Soldado', 'Paladino', 'Gladiador', 'Veterano', 'Elite', 'Titã', 'Lendário', 'Destruidor', 'Supremo', 'Fusão', 'Zeta', 'Efeito'];
const UNIVERSES = ['Marvel', 'DC', 'Dragon Ball', 'Naruto', 'One Piece', 'God of War', 'One Punch Man'];

// --- SUB-COMPONENTS ---

interface DeckSlotProps {
    index: number;
    cardId: number | null;
    card: any;
    onDrop: (index: number, cardId: number) => void;
    onClick: (card: any) => void;
    onRemove: (index: number) => void;
    viewMode?: 'grid' | 'list';
}

const DeckSlot: React.FC<DeckSlotProps> = ({ index, cardId, card, onDrop, onClick, onRemove, viewMode = 'grid' }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedCardId = parseInt(e.dataTransfer.getData('cardId'));
        if (droppedCardId) {
            onDrop(index, droppedCardId);
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('source', 'deck');
        e.dataTransfer.setData('index', index.toString());
        e.dataTransfer.setData('cardId', cardId?.toString() || '');
    };

    if (viewMode === 'list') {
        if (!card) return null; // Hide empty slots in list view to look cleaner, or render empty row? Let's hide for now or render placeholder.
        // Actually, user wants "list... one below the other". Empty slots might break the flow if hidden or take space. Let's render them as empty placeholders if needed, but deck usually has content. Let's render card if exists.

        return (
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggable={!!card}
                onDragStart={handleDragStart}
                onClick={() => card && onClick(card)}
                className={`w-full flex items-center justify-between py-1.5 px-2 border-b border-white/5 hover:bg-white/5 transition-colors group relative ${!card ? 'opacity-20' : ''}`}
            >
                {card ? (
                    <>
                        {/* Name */}
                        <div className="flex-1 min-w-0 font-mono text-[10px] text-gray-300 truncate group-hover:text-white transition-colors">
                            <span className="text-gray-600 mr-2">[{index + 1}]</span> {card.name.toUpperCase()}
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-[9px] font-mono mr-8">
                            <span className="text-gray-500 w-[60px] text-right">{card.rarity}</span>
                            <span className="text-red-400 w-[30px] text-right font-bold">{card.atk}</span>
                            <span className="text-cyan-400 w-[30px] text-right font-bold">{card.def}</span>
                            <span className="text-white w-[200px] text-right truncate italic opacity-70 text-[8px]" title={card.description}>{card.description || '-'}</span>
                        </div>

                        {/* Remove Button (Hover) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(index);
                            }}
                            className="absolute right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-[10px] text-gray-700 font-mono w-full">
                        <span className="text-gray-800 mr-2">[{index + 1}]</span> <span>ESPAÇO VAZIO</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="aspect-[3/4] relative group"
        >
            {card ? (
                <>
                    <div
                        draggable
                        onDragStart={handleDragStart}
                        onClick={() => onClick(card)}
                        className="w-full h-full cursor-grab active:cursor-grabbing hover:scale-[1.05] transition-all duration-200 relative z-10"
                    >
                        <CardVisual card={card} size="fluid" />
                    </div>
                    {isHovered && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(index);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center z-20 shadow-lg border-2 border-black"
                        >
                            <Trash2 size={12} className="text-white" />
                        </motion.button>
                    )}
                </>
            ) : (
                <div className="w-full h-full rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center hover:border-white/20 hover:bg-white/[0.05] transition-all">
                    <span className="text-xs font-black text-white/20 mb-1">{index + 1}</span>
                    <span className="text-[8px] text-white/10 uppercase tracking-wider">Vazio</span>
                </div>
            )}
        </div>
    );
};

interface CollectionCardProps {
    card: any;
    isLocked: boolean;
    onClick: (card: any) => void;
    onDragStart: (e: React.DragEvent, card: any) => void;
}

interface CollectionCardPropsExtended extends CollectionCardProps {
    viewMode?: 'grid' | 'list';
}

const CollectionCard: React.FC<CollectionCardPropsExtended> = ({ card, isLocked, onClick, onDragStart, viewMode = 'grid' }) => {
    if (viewMode === 'list') {
        // LIST VIEW - Compact row (NO IMAGE)
        // LIST VIEW - Minimalist Row (Requested: "lista com linhas finas, apenas com nome raridade at e df")
        return (
            <div
                draggable={!isLocked}
                onDragStart={(e) => onDragStart(e, card)}
                onClick={() => onClick(card)}
                className={`
                    w-full flex items-center justify-between py-1.5 px-2 border-b border-white/5 hover:bg-white/5 transition-colors group
                    ${isLocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {/* Name */}
                <div className="flex-1 min-w-0 font-mono text-[10px] text-gray-300 truncate group-hover:text-white transition-colors">
                    {card.name.toUpperCase()}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-[9px] font-mono">
                    <span className="text-gray-500 w-[60px] text-right">{card.rarity}</span>
                    <span className="text-red-400 w-[30px] text-right font-bold">{card.atk}</span>
                    <span className="text-cyan-400 w-[30px] text-right font-bold">{card.def}</span>
                    <span className="text-white w-[200px] text-right truncate italic opacity-70 text-[8px]" title={card.description}>{card.description || '-'}</span>
                </div>
            </div>
        );
    }

    // GRID VIEW - Original card visual
    return (
        <div
            draggable={!isLocked}
            onDragStart={(e) => onDragStart(e, card)}
            onClick={() => onClick(card)}
            className={`
                aspect-[3/4] relative rounded-lg transition-all duration-200 group
                ${isLocked
                    ? 'opacity-50 grayscale cursor-not-allowed'
                    : 'cursor-grab active:cursor-grabbing hover:scale-[1.05] hover:z-10 hover:shadow-2xl'
                }
            `}
        >
            <CardVisual card={card} size="fluid" />

            {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px] z-20 rounded-xl border border-white/5">
                    <Lock size={12} className="text-red-500 mb-0.5" />
                    <span className="text-[6px] font-black text-red-500 uppercase tracking-wider">Bloqueado</span>
                </div>
            )}
        </div>
    );
};

const TechSelect = ({ value, onChange, options, label, placeholder }: { value: string, onChange: (val: string) => void, options: string[], label: string, placeholder?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative h-full" style={{ width: '100px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full bg-white/5 hover:bg-white/10 text-[9px] font-mono text-gray-400 hover:text-white border border-white/5 rounded-md uppercase transition-all flex items-center justify-between px-2 clip-path-polygon"
            >
                <span className="truncate">{value === 'all' ? label : value}</span>
                <ChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Tech Corners (Button) */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/20 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/20 rounded-bl-sm pointer-events-none" />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 w-full mt-1 bg-[#0a0a0a]/90 border border-white/5 rounded-md overflow-hidden z-[60] shadow-xl flex flex-col gap-0.5 p-1 clip-path-polygon"
                    >
                        {/* Tech Corners (Dropdown) */}
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/20 rounded-tr-sm pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/20 rounded-bl-sm pointer-events-none" />

                        <button
                            onClick={() => { onChange('all'); setIsOpen(false); }}
                            className={`w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase transition-colors rounded-sm ${value === 'all' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                        >
                            {label}
                        </button>
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full text-left px-2 py-1.5 text-[9px] font-mono uppercase transition-colors rounded-sm ${value === opt ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const Deck: React.FC = () => {
    const { profile, deck: savedDeck, updateDeck } = useGame();
    const { cards } = useCards();

    const requiredDeckSize = getDeckSizeLimit(profile.trophies);

    // --- MULTI-DECK MANAGEMENT ---
    const [activeDeckIndex, setActiveDeckIndex] = useState(0);
    const [storedDecks, setStoredDecks] = useState<(number | null)[][]>(() => {
        try {
            const saved = localStorage.getItem('card_wars_stored_decks');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load stored decks", e);
        }
        // Initialize with default empty decks (5 slots)
        return Array(5).fill(null).map(() => Array(30).fill(null));
    });

    // Save storedDecks whenever it changes
    useEffect(() => {
        localStorage.setItem('card_wars_stored_decks', JSON.stringify(storedDecks));
    }, [storedDecks]);

    // Initialize deckSlots with the active stored deck slot (0 by default) or fallback to savedDeck from context if storage is empty
    const [deckSlots, setDeckSlots] = useState<(number | null)[]>(() => {
        const saved = localStorage.getItem('card_wars_stored_decks');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Return the first deck from storage, ensuring it respects current required size
            // Actually, useEffect below handles resizing, so just return raw data
            return parsed[0] || Array(30).fill(null);
        }
        // Fallback: use context deck
        const slots = Array(30).fill(null);
        if (Array.isArray(savedDeck)) {
            savedDeck.forEach((id, i) => { if (i < 30) slots[i] = id; });
        }
        return slots;
    });

    // Sync deckSlots changes to storedDecks[activeDeckIndex]
    useEffect(() => {
        setStoredDecks(prev => {
            const next = [...prev];
            if (JSON.stringify(next[activeDeckIndex]) !== JSON.stringify(deckSlots)) {
                next[activeDeckIndex] = deckSlots;
                return next;
            }
            return prev;
        });
    }, [deckSlots, activeDeckIndex]);

    const handleSwitchDeck = (index: number) => {
        if (index === activeDeckIndex) return;
        const newDeckContent = storedDecks[index] || Array(requiredDeckSize).fill(null);
        setDeckSlots(newDeckContent);
        setActiveDeckIndex(index);
    };

    const [filterRarity, setFilterRarity] = useState('all');
    const [filterUniverse, setFilterUniverse] = useState('all');
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showStats, setShowStats] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [centerView, setCenterView] = useState<'deck' | 'collection'>('deck');
    const [layoutReversed, setLayoutReversed] = useState(false);

    const currentArena = useMemo(() =>
        [...ARENAS].reverse().find(a => profile.trophies >= a.trophies) || ARENAS[0],
        [profile.trophies]
    );

    const allowedRarities = useMemo(() => {
        const allowed = new Set<string>();
        ARENAS.forEach(a => { if (a.id <= currentArena.id) a.unlockedRarities.forEach(r => allowed.add(r)); });
        return allowed;
    }, [currentArena.id]);

    const deckSet = useMemo(() => new Set(deckSlots.filter((id): id is number => id !== null)), [deckSlots]);

    // Deck Statistics
    const deckStats = useMemo(() => {
        const deckCards = deckSlots
            .filter((id): id is number => id !== null)
            .map(id => cards.find(c => parseInt(c.id) === id))
            .filter(Boolean);

        const rarityCount: Record<string, number> = {};
        const universeCount: Record<string, number> = {};

        deckCards.forEach(card => {
            rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
            universeCount[card.universe] = (universeCount[card.universe] || 0) + 1;
        });

        const totalCards = deckCards.length;
        const progress = (totalCards / requiredDeckSize) * 100;
        const isComplete = totalCards === requiredDeckSize;
        const duplicates = deckCards.length !== new Set(deckCards.map(c => c.id)).size;

        const totalAtk = deckCards.reduce((sum, c) => sum + (parseInt(c.atk) || 0), 0);
        const totalDef = deckCards.reduce((sum, c) => sum + (parseInt(c.def) || 0), 0);

        return {
            totalCards,
            progress,
            isComplete,
            duplicates,
            rarityDistribution: rarityCount,
            universeDistribution: universeCount,
            avgAttack: totalCards > 0 ? Math.round(totalAtk / totalCards) : 0,
            avgDefense: totalCards > 0 ? Math.round(totalDef / totalCards) : 0
        };
    }, [deckSlots, cards, requiredDeckSize]);

    const collection = useMemo(() => {
        const owned = new Set(profile.ownedCards || []);
        let filtered = cards.map(c => ({
            ...c,
            parsedId: parseInt(c.id),
            isAllowed: allowedRarities.has(c.rarity),
            isOwned: owned.has(c.id)
        }));

        if (filterRarity !== 'all') filtered = filtered.filter(c => c.rarity === filterRarity);
        if (filterUniverse !== 'all') filtered = filtered.filter(c => c.universe === filterUniverse);
        if (searchTerm) filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

        filtered = filtered.filter(c => !deckSet.has(c.parsedId));

        return {
            unlocked: filtered.filter(c => c.isAllowed),
            locked: filtered.filter(c => !c.isAllowed)
        };
    }, [cards, profile.ownedCards, allowedRarities, filterRarity, filterUniverse, deckSet, searchTerm]);

    // Updates & Auto-Save
    useEffect(() => {
        if (deckSlots.length !== requiredDeckSize) {
            setDeckSlots(prev => {
                const newSlots = Array(requiredDeckSize).fill(null);
                prev.forEach((id, i) => { if (i < requiredDeckSize) newSlots[i] = id; });
                return newSlots;
            });
        }
    }, [requiredDeckSize]);

    useEffect(() => {
        const validIds = deckSlots.filter((id): id is number => id !== null);
        if (JSON.stringify(validIds) !== JSON.stringify(savedDeck)) {
            const unique = Array.from(new Set(validIds));
            updateDeck(unique);
        }
    }, [deckSlots, savedDeck, updateDeck]);

    // --- ACTIONS ---

    const handleDeckSlotDrop = (slotIndex: number, cardId: number) => {
        const existingIndex = deckSlots.indexOf(cardId);
        setDeckSlots(prev => {
            const next = [...prev];
            if (existingIndex !== -1 && existingIndex !== slotIndex) {
                const targetCard = next[slotIndex];
                next[slotIndex] = cardId;
                next[existingIndex] = targetCard;
            } else {
                next[slotIndex] = cardId;
            }
            return next;
        });
    };

    const handleRemoveFromDeck = (index: number) => {
        setDeckSlots(prev => { const next = [...prev]; next[index] = null; return next; });
    };

    const handleCollectionDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const source = e.dataTransfer.getData('source');
        if (source === 'deck') {
            const index = parseInt(e.dataTransfer.getData('index'));
            handleRemoveFromDeck(index);
        }
    };

    const handleClearDeck = () => {
        if (window.confirm('Limpar todo o deck? Esta ação não pode ser desfeita.')) {
            setDeckSlots(Array(requiredDeckSize).fill(null));
        }
    };

    const handleRandomizeDeck = () => {
        const pool = cards
            .filter(c => allowedRarities.has(c.rarity))
            .map(c => parseInt(c.id));

        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const newDeck = shuffled.slice(0, requiredDeckSize);

        const finalDeck = Array(requiredDeckSize).fill(null).map((_, i) => newDeck[i] || null);
        setDeckSlots(finalDeck);
    };

    return (
        <div className="h-full w-full bg-[#0a1016]/40 text-gray-300 flex flex-col font-sans relative overflow-hidden select-none">

            {/* --- HEADER --- */}
            <header className="flex-none z-20 bg-transparent border-b border-white/5 shadow-2xl relative">
                <div className="h-12 px-6 flex items-center justify-between relative">

                    {/* --- LEFT: ALWAYS VISIBLE CONTROLS (Stats Toggle + Counter) --- */}
                    {/* z-50 ensures these stay above the stats overlay */}
                    <div className="flex items-center gap-4 z-50 relative">
                        {/* 1. Stats Toggle Button */}
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className={`p-2 border transition-all rounded-lg ${showStats ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                            title="Estatísticas do Deck"
                        >
                            <BarChart3 size={14} />
                        </button>

                        {/* 2. Completeness Counter */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                            <CheckCircle size={10} className={deckStats.isComplete ? 'text-green-400' : 'text-gray-500'} />
                            <span className={`font-mono text-[10px] font-bold ${deckStats.isComplete ? 'text-green-400' : 'text-gray-400'}`}>
                                {deckStats.totalCards}/{requiredDeckSize}
                            </span>
                        </div>

                        {/* 3. Actions & Slots (HIDDEN WHEN STATS OPEN) */}
                        {!showStats && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center gap-4"
                            >
                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleRandomizeDeck}
                                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all rounded-lg group"
                                        title="Preencher"
                                    >
                                        <Shuffle size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                    </button>

                                    <button
                                        onClick={handleClearDeck}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all rounded-lg"
                                        title="Limpar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Deck Slots (5) - Tech Style */}
                                <div className="flex items-center gap-1.5 ml-2">
                                    {/* 5 Slots Selector */}
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <button
                                            key={i}
                                            onClick={() => handleSwitchDeck(i)}
                                            className={`
                                                relative w-8 h-8 flex items-center justify-center rounded-md font-mono text-xs font-bold transition-all duration-300 clip-path-polygon
                                                ${i === activeDeckIndex
                                                    ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] scale-110 z-10'
                                                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'
                                                }
                                            `}
                                        >
                                            {/* Tech Corners */}
                                            <div className={`absolute top-0 right-0 w-1.5 h-1.5 border-t border-r rounded-tr-sm transition-colors ${i === activeDeckIndex ? 'border-cyan-400/50' : 'border-white/20'}`} />
                                            <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l rounded-bl-sm transition-colors ${i === activeDeckIndex ? 'border-cyan-400/50' : 'border-white/20'}`} />
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* --- CENTER & RIGHT (HIDDEN WHEN STATS OPEN) --- */}
                    {!showStats && (
                        <>
                            {/* CENTER: Arena Name */}
                            {/* CENTER: Arena Name (HUD Style) */}
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none"
                            >
                                <div className="flex items-center gap-2 mb-0.5 opacity-60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                    <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-[0.3em] whitespace-nowrap">Arena Atual</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                </div>

                                <div className="relative px-6 py-1">
                                    {/* Tech Brackets */}
                                    <div className="absolute top-0 left-0 w-2 h-full border-l-2 border-white/10" />
                                    <div className="absolute top-0 right-0 w-2 h-full border-r-2 border-white/10" />

                                    <span className="text-sm font-black text-white italic uppercase tracking-widest drop-shadow-md">
                                        {currentArena.name}
                                    </span>
                                </div>
                            </motion.div>

                            {/* RIGHT: Collection + Search + Filters + View Toggle */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center gap-2 relative h-10"
                            >
                                <AnimatePresence mode="wait">
                                    {!searchExpanded ? (
                                        <>
                                            <button
                                                onClick={() => setLayoutReversed(!layoutReversed)}
                                                className="relative w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-gray-500 hover:text-cyan-400 border border-white/5 transition-all duration-300 clip-path-polygon mr-2 group"
                                                title="Inverter Layout"
                                            >
                                                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/20 rounded-tr-sm group-hover:border-cyan-400/50 transition-colors" />
                                                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/20 rounded-bl-sm group-hover:border-cyan-400/50 transition-colors" />
                                                <ArrowRightLeft size={14} className={layoutReversed ? 'text-cyan-400' : ''} />
                                            </button>

                                            {/* Filters (Tech Style) - Custom Components for True Transparency */}
                                            <div className="flex gap-2 mr-2 h-8">
                                                <TechSelect
                                                    label="Raridade"
                                                    value={filterRarity}
                                                    onChange={setFilterRarity}
                                                    options={RARITIES}
                                                />
                                                <TechSelect
                                                    label="Universo"
                                                    value={filterUniverse}
                                                    onChange={setFilterUniverse}
                                                    options={UNIVERSES}
                                                />
                                            </div>

                                            {/* View Toggles (Tech Style) */}
                                            <div className="flex gap-1 mr-2">
                                                {[
                                                    { mode: 'grid', icon: Grid3x3, label: 'Grade' },
                                                    { mode: 'list', icon: List, label: 'Lista' }
                                                ].map((item) => (
                                                    <button
                                                        key={item.mode}
                                                        onClick={() => setViewMode(item.mode as any)}
                                                        className={`
                                                            relative w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300 clip-path-polygon group
                                                            ${viewMode === item.mode
                                                                ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'
                                                            }
                                                        `}
                                                        title={item.label}
                                                    >
                                                        <div className={`absolute top-0 right-0 w-1.5 h-1.5 border-t border-r rounded-tr-sm transition-colors ${viewMode === item.mode ? 'border-cyan-400/50' : 'border-white/20'}`} />
                                                        <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l rounded-bl-sm transition-colors ${viewMode === item.mode ? 'border-cyan-400/50' : 'border-white/20'}`} />
                                                        <item.icon size={12} />
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Search Button (Tech Style) */}
                                            <button
                                                onClick={() => setSearchExpanded(true)}
                                                className="relative w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white border border-white/5 transition-all duration-300 clip-path-polygon group"
                                            >
                                                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/20 rounded-tr-sm group-hover:border-white/40 transition-colors" />
                                                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/20 rounded-bl-sm group-hover:border-white/40 transition-colors" />
                                                <Search size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 280, opacity: 1 }}
                                            className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg px-3 h-8 clip-path-polygon relative"
                                        >
                                            {/* Tech styling for expanded search */}
                                            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/20 rounded-tr-sm" />
                                            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/20 rounded-bl-sm" />

                                            <Search size={12} className="text-cyan-500 flex-shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="ACESSO AO BANCO DE DADOS..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="flex-1 bg-transparent text-[10px] uppercase font-mono text-cyan-100 placeholder:text-cyan-900/50 outline-none min-w-0 tracking-widest"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => { setSearchExpanded(false); setSearchTerm(''); }}
                                                className="p-1 hover:bg-white/10 rounded transition-all flex-shrink-0 text-cyan-500/50 hover:text-cyan-400"
                                            >
                                                <X size={12} />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </>
                    )}

                    {/* --- STATS OVERLAY (COVERS EVERYTHING EXCEPT LEFT BUTTONS) --- */}
                    <AnimatePresence>
                        {showStats && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-x-0 inset-y-0 z-40 bg-transparent flex items-center pl-[180px] pr-6 border-b border-cyan-500/10"
                            >
                                <div className="flex-1 flex items-center justify-start gap-12">
                                    {/* Averages */}
                                    <div className="flex items-center gap-3">
                                        <Zap size={12} className="text-yellow-400" />
                                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Médias:</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] text-gray-400">ATK <span className="bg-red-500/20 text-red-200 px-1 rounded font-bold">{deckStats.avgAttack}</span></span>
                                            <span className="text-[9px] text-gray-400">DEF <span className="bg-blue-500/20 text-blue-200 px-1 rounded font-bold">{deckStats.avgDefense}</span></span>
                                        </div>
                                    </div>

                                    {/* Rarity */}
                                    <div className="flex items-center gap-3">
                                        <PieChart size={12} className="text-purple-400" />
                                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Raridade:</span>
                                        <div className="flex items-center gap-3">
                                            {Object.entries(deckStats.rarityDistribution).map(([rarity, count]) => (
                                                <span key={rarity} className="text-[9px] text-gray-400 flex items-center gap-1">
                                                    {rarity} <span className="bg-white/10 px-1 rounded text-white font-bold">{count}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Universes */}
                                    <div className="flex items-center gap-3">
                                        <BarChart3 size={12} className="text-cyan-400" />
                                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Universos:</span>
                                        <div className="flex items-center gap-3">
                                            {Object.entries(deckStats.universeDistribution).slice(0, 4).map(([universe, count]) => (
                                                <span key={universe} className="text-[9px] text-gray-400 flex items-center gap-1">
                                                    {universe} <span className="bg-white/10 px-1 rounded text-white font-bold">{count}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </header >



            {/* MAIN CONTENT */}
            {/* MAIN CONTENT SPLIT VIEW */}
            <div className="flex-1 flex overflow-hidden relative z-10">

                {/* LEFT PANEL (Sala A): Fixed 800px, Always 5 Cols */}
                {(() => {
                    const isDeckHere = !layoutReversed;
                    const gridCols = 5;

                    return (
                        <section
                            className="w-[800px] shrink-0 flex flex-col border-r border-white/10 bg-transparent overflow-hidden relative transition-all"
                            onDragOver={!isDeckHere ? (e) => e.preventDefault() : undefined}
                            onDrop={!isDeckHere ? handleCollectionDrop : undefined}
                        >
                            {/* Label da Sala A */}
                            <div className="absolute top-2 w-full flex justify-center z-20 pointer-events-none">
                                <div className="flex items-center gap-2 opacity-50">
                                    <div className={`w-1 h-1 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)] ${isDeckHere ? 'bg-cyan-500 shadow-cyan-500' : 'bg-purple-500 shadow-purple-500'}`} />
                                    <span className="text-[9px] uppercase font-medium tracking-[0.2em] text-white">
                                        {isDeckHere ? 'Deck' : 'Coleção'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {isDeckHere ? (
                                    // CONTEÚDO: DECK (5 Cols)
                                    <div className={`grid grid-cols-${gridCols} gap-4`}>
                                        {deckSlots.map((cardId, idx) => {
                                            const card = cardId ? cards.find(c => parseInt(c.id) === cardId) : null;
                                            return (
                                                <DeckSlot
                                                    key={idx}
                                                    index={idx}
                                                    cardId={cardId}
                                                    card={card}
                                                    onDrop={handleDeckSlotDrop}
                                                    onClick={(c) => setSelectedCard(c)}
                                                    onRemove={handleRemoveFromDeck}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // CONTEÚDO: COLEÇÃO (5 Cols)
                                    <div className="flex flex-col gap-8">
                                        <div className={`grid grid-cols-5 gap-4`}>
                                            {collection.unlocked.map(card => (
                                                <CollectionCard
                                                    key={card.id}
                                                    card={card}
                                                    isLocked={false}
                                                    onClick={setSelectedCard}
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('cardId', card.parsedId.toString());
                                                    }}
                                                    viewMode="grid"
                                                />
                                            ))}
                                        </div>
                                        {collection.locked.length > 0 && (
                                            <div className="pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Lock size={12} className="text-gray-600" />
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Bloqueadas</span>
                                                </div>
                                                <div className={`grid grid-cols-${gridCols} gap-4 opacity-40 grayscale`}>
                                                    {collection.locked.map(card => (
                                                        <CollectionCard
                                                            key={card.id}
                                                            card={card}
                                                            isLocked={true}
                                                            onClick={setSelectedCard}
                                                            onDragStart={() => { }}
                                                            viewMode="grid"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })()}

                {/* RIGHT PANEL (Sala B): Flexible, Always 4 Cols */}
                {(() => {
                    const isDeckHere = layoutReversed;
                    const gridCols = 4;

                    return (
                        <section
                            className="flex-1 flex flex-col bg-transparent relative transition-all"
                            onDragOver={!isDeckHere ? (e) => e.preventDefault() : undefined}
                            onDrop={!isDeckHere ? handleCollectionDrop : undefined}
                        >
                            {/* Label da Sala B */}
                            <div className="absolute top-2 w-full flex justify-center z-20 pointer-events-none">
                                <div className="flex items-center gap-2 opacity-50">
                                    <div className={`w-1 h-1 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)] ${isDeckHere ? 'bg-cyan-500 shadow-cyan-500' : 'bg-purple-500 shadow-purple-500'}`} />
                                    <span className="text-[9px] uppercase font-medium tracking-[0.2em] text-white">
                                        {isDeckHere ? 'Deck' : 'Coleção'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 pt-8">
                                {isDeckHere ? (
                                    // CONTEÚDO: DECK (Right Panel - Responsive Grid/List)
                                    <div className={`${viewMode === 'list' ? 'flex flex-col gap-0' : 'grid grid-cols-4 gap-4'}`}>
                                        {deckSlots.map((cardId, idx) => {
                                            const card = cardId ? cards.find(c => parseInt(c.id) === cardId) : null;
                                            return (
                                                <DeckSlot
                                                    key={idx}
                                                    index={idx}
                                                    cardId={cardId}
                                                    card={card}
                                                    onDrop={handleDeckSlotDrop}
                                                    onClick={(c) => setSelectedCard(c)}
                                                    onRemove={handleRemoveFromDeck}
                                                    viewMode={viewMode}
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // CONTEÚDO: COLEÇÃO (4 Cols)
                                    <div className="flex flex-col gap-8">
                                        <div className={`${viewMode === 'list' ? 'flex flex-col gap-0' : 'grid grid-cols-4 gap-4'}`}>
                                            {collection.unlocked.map(card => (
                                                <CollectionCard
                                                    key={card.id}
                                                    card={card}
                                                    isLocked={false}
                                                    onClick={setSelectedCard}
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('cardId', card.parsedId.toString());
                                                    }}
                                                    viewMode={viewMode}
                                                />
                                            ))}
                                        </div>
                                        {collection.locked.length > 0 && (
                                            <div className="pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Lock size={12} className="text-gray-600" />
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Bloqueadas</span>
                                                </div>
                                                <div className={`grid grid-cols-${gridCols} gap-4 opacity-40 grayscale`}>
                                                    {collection.locked.map(card => (
                                                        <CollectionCard
                                                            key={card.id}
                                                            card={card}
                                                            isLocked={true}
                                                            onClick={setSelectedCard}
                                                            onDragStart={() => { }}
                                                            viewMode={viewMode}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })()}

            </div>




            {/* MODAL */}
            <AnimatePresence>
                {selectedCard && (
                    <CardDetailModal
                        card={selectedCard}
                        onClose={() => setSelectedCard(null)}
                    />
                )}
            </AnimatePresence>
        </div >
    );
};
