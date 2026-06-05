import React, { useState, useMemo } from 'react';
import { useCards } from '../../contexts/CardContext';
import { useBattle } from '../../contexts/BattleContext';
import { Search, PlusCircle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageKey } from '../../hooks/useLocalStorage';

export const LaboratoryPanel: React.FC = () => {
    const labReportKey = getStorageKey('lab_report');
    const { cards } = useCards();
    const {
        isLabMode,
        toggleLabMode,
        labSetBoard,
        labClearBoard,
        labClearHand,
        addCardToHand,
        addToast
    } = useBattle();

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<{ index: number, isPlayer: boolean } | null>(null);
    const [reportText, setReportText] = useState(() => localStorage.getItem(labReportKey) || '');

    // Filter cards
    const filteredCards = useMemo(() => {
        return cards.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.includes(searchTerm)
        ).slice(0, 50); // Limit results
    }, [cards, searchTerm]);

    const handleReportChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setReportText(text);
        localStorage.setItem(labReportKey, text);
    };

    const handlePlaceCard = (cardId: string) => {
        if (!selectedSlot) {
            // If no slot selected, default to adding to hand
            addCardToHand(cardId);
            return;
        }
        labSetBoard(selectedSlot.index, cardId, selectedSlot.isPlayer);
        setSelectedSlot(null); // Reset selection after placement
    };

    // Slot Selector UI
    const SlotSelector = ({ isPlayer }: { isPlayer: boolean }) => (
        <div className="flex gap-1 justify-center my-2">
            {[0, 1, 2, 3, 4].map(i => (
                <button
                    key={i}
                    onClick={() => setSelectedSlot(prev => prev?.index === i && prev.isPlayer === isPlayer ? null : { index: i, isPlayer })}
                    className={`
                        w-8 h-8 rounded border flex items-center justify-center text-[10px] font-bold transition-all
                        ${selectedSlot?.index === i && selectedSlot?.isPlayer === isPlayer
                            ? 'bg-yellow-500 text-black border-yellow-400 scale-110'
                            : 'bg-black/40 border-white/10 text-white/30 hover:bg-white/10'}
                    `}
                >
                    {i}
                </button>
            ))}
        </div>
    );

    if (!isLabMode && !isOpen) {
        return (
            <button
                onClick={toggleLabMode}
                className="fixed bottom-20 right-4 z-[100] bg-purple-600/20 hover:bg-purple-600 border border-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-sm transition-all uppercase tracking-widest"
            >
                MODO TESTE 🧪
            </button>
        );
    }

    return (
        <>
            {/* Main Lab Toggle (Always visible in Lab Mode) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-20 right-4 z-[400] flex flex-col gap-2"
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-12 h-12 rounded-xl flex items-center justify-center border shadow-xl transition-all
                        ${isOpen ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900/90 border-white/20 text-purple-400'}
                    `}
                >
                    <span className="text-xl">🧪</span>
                </button>
            </motion.div>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed top-0 right-0 bottom-0 w-96 bg-slate-950/95 backdrop-blur-xl border-l border-white/10 z-[399] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-purple-900/20 flex items-center justify-between">
                            <div>
                                <h2 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                    <span className="text-purple-400">⚡</span> Laboratório
                                </h2>
                                <p className="text-[10px] text-white/40 mt-1">Sandbox Environment v1.0</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={toggleLabMode} className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/20 transition-colors" title="Sair do Modo Lab">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Controls Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                            {/* 1. Global Actions */}
                            <section className="space-y-3">
                                <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Controles Globais</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => labClearBoard(true)}
                                        className="p-2 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 text-red-300 text-[10px] flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={12} /> Limpar Player
                                    </button>
                                    <button
                                        onClick={() => labClearBoard(false)}
                                        className="p-2 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 text-red-300 text-[10px] flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={12} /> Limpar Enemy
                                    </button>
                                    <button
                                        onClick={labClearHand}
                                        className="col-span-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded hover:bg-orange-500/20 text-orange-300 text-[10px] flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={12} /> Esvaziar Mão
                                    </button>
                                </div>
                            </section>

                            <div className="h-px bg-white/5" />

                            {/* 2. Target Selector */}
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Alvo da Injeção</label>
                                    {selectedSlot && (
                                        <button onClick={() => setSelectedSlot(null)} className="text-[9px] text-white/40 hover:text-white">Cancelar</button>
                                    )}
                                </div>

                                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                                    <div className="text-[9px] text-center text-white/30 mb-1">CAMPO INIMIGO</div>
                                    <SlotSelector isPlayer={false} />
                                    <div className="h-px bg-white/5 my-2" />
                                    <SlotSelector isPlayer={true} />
                                    <div className="text-[9px] text-center text-white/30 mt-1">SEU CAMPO</div>
                                </div>
                                <p className="text-[9px] text-white/40 text-center italic">
                                    {selectedSlot
                                        ? `Selecionado: ${selectedSlot.isPlayer ? 'Player' : 'Enemy'} Slot ${selectedSlot.index}`
                                        : 'Nenhum slot selecionado (Adiciona à mão)'}
                                </p>
                            </section>

                            <div className="h-px bg-white/5" />

                            {/* 3. Card Manager */}
                            <section className="space-y-3 h-96 flex flex-col">
                                <label className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Injetor de Cartas</label>

                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="text"
                                        placeholder="Buscar carta (Nome/ID)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-green-500/50 outline-none"
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto bg-black/20 rounded-lg border border-white/5 custom-scrollbar">
                                    {filteredCards.map(card => (
                                        <div
                                            key={card.id}
                                            onClick={() => handlePlaceCard(card.id)}
                                            className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 group"
                                        >
                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-white/30">
                                                <img src={card.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-white truncate">{card.name}</span>
                                                    <span className="text-[9px] px-1 rounded bg-white/10 text-white/50">{card.id}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] text-yellow-500">ATK {card.atk || 0}</span>
                                                    <span className="text-[9px] text-blue-500">DEF {card.def || 0}</span>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-green-400">
                                                <PlusCircle size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="h-px bg-white/5" />

                            {/* 4. Test Report */}
                            <section className="space-y-3">
                                <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Relatório de Teste</label>
                                <textarea
                                    value={reportText}
                                    onChange={handleReportChange}
                                    placeholder="Descreva cenários, bugs ou observações..."
                                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white/80 focus:border-yellow-500/50 outline-none resize-none font-mono"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(reportText); addToast('Relatório copiado!', 'info'); }}
                                        className="text-[9px] text-white/40 hover:text-white underline"
                                    >
                                        Copiar para Clipboard
                                    </button>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
