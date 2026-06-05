import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCards } from '../contexts/CardContext';
import { useNavigate } from 'react-router-dom';
import { getAuraColor } from '../constants/rarityColors';
import type { Card, Universe, Rarity } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Extract available universes from cards data
const getAvailableUniverses = (cards: Card[]): Universe[] => {
    const universes = [...new Set(cards.map(c => c.universe))].filter(u => u && u !== '—');
    return ['—', ...universes.sort()] as Universe[];
};

// --- Sub-component: Editable Card (v4 - Ability Toggle) ---
const EditableCard = React.memo(({ card, onUpdate, availableUniverses }: { card: Card; onUpdate: (id: string, diff: Partial<Card>) => void; availableUniverses: Universe[] }) => {
    const [localCard, setLocalCard] = useState(card);
    const [showAbility, setShowAbility] = useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => { setLocalCard(card); }, [card]);

    // Click outside handler to close ability panel
    useEffect(() => {
        if (!showAbility) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setShowAbility(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAbility]);

    const handleChange = (field: keyof Card, value: any) => {
        setLocalCard(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: keyof Card) => {
        if (localCard[field] !== card[field]) {
            onUpdate(card.id, { [field]: localCard[field] });
        }
    };

    const auraColor = getAuraColor(localCard.rarity);

    return (
        <div
            ref={cardRef}
            className="relative aspect-[2/3] rounded-xl overflow-hidden border transition-all group hover:z-50 hover:scale-105"
            style={{
                borderColor: auraColor,
                borderWidth: '2px',
                boxShadow: `0 0 20px ${auraColor}88, 0 0 40px ${auraColor}44`
            }}
        >
            {/* Background / Image Layer */}
            <div className="absolute inset-0 bg-gray-900 pointer-events-none">
                <img
                    src={localCard.image || 'https://placehold.co/300x450?text=No+Image'}
                    alt={localCard.name}
                    className="w-full h-full object-cover opacity-90 transition-opacity"
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/300x450?text=Error'}
                />
                {/* Dark Gradient Overlay for readability */}
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/90 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
            </div>

            {/* Interactive Layer (Inputs) */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 z-10">

                {/* Header: [ID] - [Universe] - [Rarity] */}
                <div className="flex justify-between items-start gap-1">
                    {/* Editable ID - Narrower */}
                    <input
                        type="text"
                        value={localCard.id}
                        readOnly
                        className="w-8 bg-black/60 text-[9px] font-mono text-white/80 border border-white/10 rounded px-0.5 outline-none hover:bg-black/80 cursor-text backdrop-blur-sm"
                        placeholder="ID"
                    />

                    {/* Universe Dropdown */}
                    <select
                        className="flex-1 bg-black/60 text-[9px] text-white border border-white/10 rounded px-1 outline-none appearance-none hover:bg-black/80 cursor-pointer backdrop-blur-sm text-center"
                        value={localCard.universe}
                        onChange={(e) => {
                            handleChange('universe', e.target.value);
                            onUpdate(card.id, { universe: e.target.value as Universe });
                        }}
                    >
                        {availableUniverses.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>

                    {/* Rarity Dropdown */}
                    <select
                        value={localCard.rarity}
                        onChange={(e) => {
                            handleChange('rarity', e.target.value);
                            onUpdate(card.id, { rarity: e.target.value as Rarity });
                        }}
                        className="flex-1 bg-black/60 text-[9px] text-center uppercase outline-none font-bold backdrop-blur-sm rounded border border-white/10"
                        style={{ color: auraColor }}
                    >
                        {['Supremo', 'Destruidor', 'Lendário', 'Titã', 'Elite', 'Veterano', 'Gladiador', 'Paladino', 'Soldado', 'Recruta', 'Efeito', 'Zeta', 'Fusão'].map(r => (
                            <option key={r} value={r} className="bg-gray-900 text-white">{r}</option>
                        ))}
                    </select>
                </div>

                {/* Footer: Name & Stats (Classic Layout with Ability Toggle) */}
                <div className="flex flex-col gap-1 mt-auto relative">
                    {/* Name Row with HB Button for Efeito/Zeta */}
                    <div className="relative flex items-center gap-1">
                        <input
                            value={localCard.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            className={`flex-1 bg-transparent text-center font-black uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-b border-transparent focus:border-white/30 outline-none placeholder-white/30 ${(localCard.rarity === 'Efeito' || localCard.rarity === 'Zeta') && localCard.name.length > 15
                                ? 'text-[10px]'
                                : 'text-xs'
                                } text-white`}
                            placeholder="NOME DA CARTA"
                        />
                        {/* HB Button inline for Efeito/Zeta */}
                        {(localCard.rarity === 'Efeito' || localCard.rarity === 'Zeta') && (
                            <button
                                onClick={() => setShowAbility(!showAbility)}
                                className="w-5 h-5 flex-shrink-0 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white flex items-center justify-center text-[10px] shadow-lg backdrop-blur transition-all"
                                title={showAbility ? "Ocultar Habilidade" : "Mostrar Habilidade"}
                            >
                                {showAbility ? '×' : '⚡'}
                            </button>
                        )}
                    </div>

                    {/* Ability Panel (Slides up from bottom) */}
                    <AnimatePresence>
                        {showAbility && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="absolute bottom-full left-0 right-0 mb-1 bg-black/80 backdrop-blur-md rounded border border-white/20 p-2 max-h-32 overflow-y-auto"
                            >
                                <textarea
                                    value={localCard.description || ''}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    onBlur={() => handleBlur('description')}
                                    className="w-full h-24 bg-transparent text-[9px] text-white/90 resize-none outline-none"
                                    placeholder="Habilidade/Descrição..."
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ATK / DEF Row (for warriors) with Ability Button */}
                    {localCard.rarity !== 'Efeito' && localCard.rarity !== 'Zeta' && (
                        <div className="flex justify-between items-center px-1 pb-1">
                            {/* ATK - No icon, full width text */}
                            <div className="flex-1 bg-black/70 backdrop-blur-md rounded px-2 py-0.5 border border-red-500/40 shadow-lg">
                                <input
                                    type="number"
                                    value={localCard.atk || 0}
                                    onChange={(e) => handleChange('atk', Number(e.target.value))}
                                    onBlur={() => handleBlur('atk')}
                                    className="w-full bg-transparent text-center font-black text-xs text-red-400 outline-none appearance-none"
                                />
                            </div>

                            {/* Ability Toggle Button */}
                            <button
                                onClick={() => setShowAbility(!showAbility)}
                                className="w-6 h-6 mx-1 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white flex items-center justify-center text-xs shadow-lg backdrop-blur transition-all flex-shrink-0"
                                title={showAbility ? "Ocultar Habilidade" : "Mostrar Habilidade"}
                            >
                                {showAbility ? '×' : '⚡'}
                            </button>

                            {/* DEF - No icon, full width text */}
                            <div className="flex-1 bg-black/70 backdrop-blur-md rounded px-2 py-0.5 border border-blue-500/40 shadow-lg">
                                <input
                                    type="number"
                                    value={localCard.def || 0}
                                    onChange={(e) => handleChange('def', Number(e.target.value))}
                                    onBlur={() => handleBlur('def')}
                                    className="w-full bg-transparent text-center font-black text-xs text-blue-400 outline-none appearance-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
});


// --- Main Page ---
export const CardEditor: React.FC = () => {
    const { cards, updateCard } = useCards();
    const navigate = useNavigate();

    // Dynamic Universe List (only from existing cards)
    const availableUniverses = useMemo(() => getAvailableUniverses(cards), [cards]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUniverse, setFilterUniverse] = useState<Universe | ''>('');
    const [filterRarity, setFilterRarity] = useState<Rarity | ''>('');
    const [smartFilter, setSmartFilter] = useState<'none' | 'no_image' | 'no_text' | 'zero_stats'>('none');
    const [sortOption, setSortOption] = useState('rarity_desc');

    // Filtering Logic
    const filteredCards = useMemo(() => {
        let result = cards.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.includes(searchTerm);
            const matchesUniverse = filterUniverse ? c.universe === filterUniverse : true;
            const matchesRarity = filterRarity ? c.rarity === filterRarity : true;

            // Smart Filter Check
            let matchesSmart = true;
            if (smartFilter === 'no_image') matchesSmart = !c.image || c.image === '';
            if (smartFilter === 'no_text') matchesSmart = !c.description || c.description.trim().length === 0;
            if (smartFilter === 'zero_stats') matchesSmart = (c.atk || 0) === 0 && (c.def || 0) === 0 && !['Efeito', 'Zeta', 'Fusão'].includes(c.rarity);

            return matchesSearch && matchesUniverse && matchesRarity && matchesSmart;
        });

        // Sorting
        return result.sort((a, b) => {
            const rarityOrder = {
                'Supremo': 1, 'Destruidor': 2, 'Lendário': 3, 'Titã': 4, 'Elite': 5,
                'Veterano': 6, 'Gladiador': 7, 'Paladino': 8, 'Soldado': 9, 'Recruta': 10,
                'Efeito': 11, 'Zeta': 12, 'Fusão': 13
            };

            switch (sortOption) {
                case 'name_asc': return a.name.localeCompare(b.name);
                case 'name_desc': return b.name.localeCompare(a.name);
                case 'atk_desc': return (b.atk || 0) - (a.atk || 0);
                case 'atk_asc': return (a.atk || 0) - (b.atk || 0);
                case 'rarity_asc': return (rarityOrder[a.rarity as keyof typeof rarityOrder] || 99) - (rarityOrder[b.rarity as keyof typeof rarityOrder] || 99);
                case 'rarity_desc': return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 99) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 99);
                default: return 0;
            }
        });
    }, [cards, searchTerm, filterUniverse, filterRarity, smartFilter, sortOption]);

    const handleCardUpdate = useCallback((id: string, form: Partial<Card>) => {
        updateCard(id, form);
    }, [updateCard]);

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Compact Toolbar (Sticky) */}
            <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 shadow-xl">
                <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">

                    {/* Title & Count */}
                    <div className="flex items-center gap-3 shrink-0">
                        <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hidden md:block">
                            Editor
                        </h1>
                        <span className="px-2 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400 border border-gray-700">
                            {filteredCards.length}
                        </span>
                    </div>

                    {/* Compact Filters Row */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Search */}
                        <div className="relative group w-32 md:w-48">
                            <input
                                type="text"
                                placeholder="Busca..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-md py-1 px-2 text-xs focus:border-blue-500 outline-none transition-all focus:w-full"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Universe (Dynamic List) */}
                        <select
                            className="bg-gray-800 border border-gray-700 rounded-md py-1 px-2 text-xs outline-none hover:bg-gray-750"
                            value={filterUniverse}
                            onChange={e => setFilterUniverse(e.target.value as Universe)}
                        >
                            <option value="">🌎 Todos Universos</option>
                            {availableUniverses.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>

                        {/* Rarity */}
                        <select
                            className="bg-gray-800 border border-gray-700 rounded-md py-1 px-2 text-xs outline-none hover:bg-gray-750"
                            value={filterRarity}
                            onChange={e => setFilterRarity(e.target.value as Rarity)}
                        >
                            <option value="">💎 Todas Raridades</option>
                            {['Supremo', 'Destruidor', 'Lendário', 'Titã', 'Elite', 'Veterano', 'Gladiador', 'Paladino', 'Soldado', 'Recruta', 'Efeito', 'Zeta', 'Fusão'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>

                        {/* Unified Smart Filter ("Cartas sem...") */}
                        <select
                            className={`border rounded-md py-1 px-2 text-xs outline-none transition-colors ${smartFilter !== 'none' ? 'bg-amber-900 border-amber-600 text-amber-100' : 'bg-gray-800 border-gray-700 hover:bg-gray-750'}`}
                            value={smartFilter}
                            onChange={e => setSmartFilter(e.target.value as any)}
                        >
                            <option value="none">⚠️ Cartas sem...</option>
                            <option value="no_image">📷 ...Imagem</option>
                            <option value="no_text">📝 ...Texto / Habilidade</option>
                            <option value="zero_stats">📊 ...Status (Zero)</option>
                        </select>

                        {/* Sort */}
                        <select
                            className="bg-gray-800 border border-gray-700 rounded-md py-1 px-2 text-xs outline-none hover:bg-gray-750"
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value)}
                        >
                            <option value="rarity_desc">⬇️ Raridade</option>
                            <option value="rarity_asc">⬆️ Raridade</option>
                            <option value="atk_desc">⚔️ Maior ATK</option>
                            <option value="atk_asc">⚔️ Menor ATK</option>
                            <option value="name_asc">🅰️ Nome</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => navigate('/test-lab')}
                        className="bg-purple-900/50 hover:bg-purple-600 text-purple-200 hover:text-white px-3 py-1 rounded text-xs font-bold transition-all border border-purple-800"
                    >
                        🧪 Laboratório
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white px-3 py-1 rounded text-xs font-bold transition-all border border-red-800"
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-950/50">
                <div className="max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-20">
                    {filteredCards.map(card => (
                        <EditableCard key={card.id} card={card} onUpdate={handleCardUpdate} availableUniverses={availableUniverses} />
                    ))}
                </div>

                {filteredCards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-600 opacity-50">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="text-sm font-mono">Nenhuma carta encontrada com estes filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
