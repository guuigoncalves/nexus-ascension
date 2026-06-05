import React, { useMemo } from 'react';
import { Clock, ShoppingBag, Sparkles, Gem } from 'lucide-react';
import { useCards } from '../contexts/CardContext';
import { useGame } from '../contexts/GameContext';
import { ARENAS } from '../constants/arenas';

interface ShopProps {
    onBack?: () => void;
}

export const Shop: React.FC<ShopProps> = () => {
    const { cards } = useCards();
    const { profile } = useGame();

    const handleBuy = (item: string) => {
        alert(`🛒 Compra Iniciada: ${item}`);
    };

    // Obter arena atual baseada em troféus
    const currentArena = useMemo(() => {
        return [...ARENAS].reverse().find(a => (profile?.trophies || 0) >= a.trophies) || ARENAS[0];
    }, [profile?.trophies]);

    // Cartas "Isca" (Pool da Arena) - Selecionar UMA aleatória para as próximas 24h
    const featuredBait = useMemo(() => {
        if (!currentArena.poolIds.length) return null;

        // Semente baseada na data atual (YYYY-MM-DD)
        const dateSeed = new Date().toISOString().slice(0, 10);
        let hash = 0;
        for (let i = 0; i < dateSeed.length; i++) {
            hash = ((hash << 5) - hash) + dateSeed.charCodeAt(i);
            hash |= 0;
        }

        const index = Math.abs(hash) % currentArena.poolIds.length;
        const cardId = currentArena.poolIds[index];
        return cards.find(c => c.id === cardId);
    }, [currentArena, cards]);

    // Preparar as 8 cartas diárias com dados reais e preços variados
    const dailyOffers = useMemo(() => {
        return cards.slice(0, 8).map((card, i) => ({
            ...card,
            shopPrice: [500, 1200, 800, 2500, 1000, 1800, 3000, 600][i] || 1000
        }));
    }, [cards]);

    return (
        <div className="h-full w-full bg-[#0a1016]/40 text-white overflow-y-auto px-6 py-8 custom-scrollbar relative font-sans">
            <div className="max-w-5xl mx-auto space-y-12 pb-24">

                {/* HERO SECTION: ARENA PACK (SHRUNK) */}
                <section className="relative w-full h-64 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-black border-2 border-indigo-500/20 shadow-2xl group/hero">
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-[url('/arena_bg.png')] bg-cover bg-center opacity-[0.05] group-hover/hero:opacity-[0.08] transition-opacity duration-700 pointer-events-none" />

                    <div className="flex h-full items-center px-10 gap-12 relative z-10">
                        {/* Pack Info */}
                        <div className="flex-1 space-y-3">
                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-inner">
                                <Sparkles size={10} className="text-indigo-400" />
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] italic">Destaque de Arena</span>
                            </div>

                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-2xl">
                                Pack {currentArena.name}
                            </h2>

                            <p className="text-white/30 text-[10px] max-w-sm font-medium leading-relaxed italic border-l-2 border-indigo-500/20 pl-3">
                                "{currentArena.motivationalPhrase}"
                            </p>

                            <div className="flex items-center gap-4 pt-2">
                                <button
                                    onClick={() => handleBuy(`Arena Pack: ${currentArena.name}`)}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic rounded-xl border border-indigo-400/20 shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all active:scale-95 flex items-center gap-2 text-sm"
                                >
                                    <ShoppingBag size={16} />
                                    500 Gemas
                                </button>
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    24h RESTANTES
                                </div>
                            </div>
                        </div>

                        {/* Featured Bait Card Display */}
                        {featuredBait && (
                            <div className="relative flex items-center justify-center p-5 bg-black/40 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl scale-90 hover:scale-95 transition-transform duration-500 group/bait-container">
                                <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl opacity-0 group-hover/bait-container:opacity-100 transition-opacity" />

                                <div className="relative group/bait shrink-0">
                                    <div className="relative w-28 aspect-[3/4] bg-zinc-900 rounded-xl border border-indigo-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                                        <img src={featuredBait.image} className="w-full h-full object-cover group-hover/bait:scale-110 transition-transform duration-700" alt={featuredBait.name} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 bg-indigo-500 text-white p-1.5 rounded-xl shadow-2xl border-2 border-[#16213e] z-20 rotate-12 group-hover/bait:rotate-0 transition-transform">
                                        <Sparkles size={12} fill="white" />
                                    </div>
                                </div>

                                <div className="flex flex-col ml-6 w-36">
                                    <span className="text-[9px] font-black text-indigo-400/80 uppercase tracking-widest mb-1 italic">Destaque</span>
                                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-1 leading-none drop-shadow-md truncate">{featuredBait.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter italic shadow-sm">Chance Especial</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* 1. CARTAS DIÁRIAS */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 text-white/90">
                            Ofertas Diárias
                        </h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                            <Clock size={12} className="text-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Renova em 24h</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                        {dailyOffers.map((card) => (
                            <div key={card.id} className="bg-white/5 rounded-xl p-2 flex flex-col items-center border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer group scale-100 hover:scale-105" onClick={() => handleBuy(card.name)}>
                                <div className="w-full aspect-[3/4] bg-black/40 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden ring-1 ring-white/10 group-hover:ring-yellow-500/30 transition-all">
                                    {card.image ? (
                                        <img src={card.image} alt={card.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <span className="text-white/10 font-bold uppercase text-[8px] text-center px-1">Img</span>
                                    )}
                                </div>
                                <h3 className="font-black uppercase italic text-[8px] mb-1 truncate w-full text-center group-hover:text-yellow-400 transition-colors uppercase tracking-tight">{card.name}</h3>
                                <div className="flex items-center gap-1 mt-1 bg-black/40 px-2 rounded-full border border-white/5 group-hover:border-yellow-500/20">
                                    <span className="text-yellow-500 font-black text-[9px] tabular-nums">{card.shopPrice}</span>
                                    <span className="text-[6px] font-bold text-white/20 uppercase">Ouro</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. PACOTES ESPECIAIS (MATCHING HERO LAYOUT) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white/90">Pacotes Especiais</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { name: 'Vilões de Elite', price: '250', desc: 'Garanta vilões épicos com habilidades de controle.', color: 'from-red-600/20 to-black', border: 'border-red-500/30', iconColor: 'text-red-500' },
                            { name: 'Poder Elemental', price: '300', desc: 'Desperte o poder da natureza no seu deck.', color: 'from-cyan-600/20 to-black', border: 'border-cyan-500/30', iconColor: 'text-cyan-500' },
                        ].map((pack, i) => (
                            <div key={i} className={`relative h-44 rounded-[1.5rem] overflow-hidden bg-gradient-to-br ${pack.color} border ${pack.border} shadow-xl group/pack cursor-pointer hover:scale-[1.02] transition-all`} onClick={() => handleBuy(`Pack ${pack.name}`)}>
                                <div className="relative h-full flex items-center px-8 gap-6 z-10">
                                    <div className="w-16 h-24 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center text-[8px] font-black uppercase text-white/20 group-hover/pack:text-white/40 transition-colors group-hover/pack:scale-105 transition-transform duration-500">
                                        Pack
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-black italic uppercase leading-none text-white">{pack.name}</h3>
                                        <p className="text-[9px] text-white/40 font-medium leading-relaxed max-w-[180px]">{pack.desc}</p>
                                        <div className="pt-2">
                                            <button className="px-5 py-1.5 bg-white/5 hover:bg-white/10 text-white font-black uppercase italic rounded-lg border border-white/10 transition-all text-[10px] flex items-center gap-2">
                                                <Gem size={12} className={pack.iconColor} />
                                                {pack.price} Gemas
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. COMPRA DE RECURSOS */}
                <section className="space-y-12">
                    {/* Linha de Gemas */}
                    <div>
                        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-cyan-500/30" />
                            ADQUIRIR GEMAS
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { amount: '100', price: 'R$ 4,90', color: 'cyan' },
                                { amount: '500', price: 'R$ 19,90', color: 'cyan' },
                                { amount: '1200', price: 'R$ 39,90', color: 'cyan' },
                                { amount: '2500', price: 'R$ 79,90', color: 'indigo' },
                                { amount: '6500', price: 'R$ 189,90', color: 'purple' },
                            ].map((offer, i) => (
                                <div key={i} className="bg-white/[0.03] rounded-2xl p-5 flex flex-col items-center border border-white/5 hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all cursor-pointer group relative overflow-hidden" onClick={() => handleBuy(`${offer.amount} Gemas`)}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                                    <Gem size={28} className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <div className="flex flex-col items-center z-10 text-center">
                                        <span className="text-xl font-black text-white leading-none mb-1">{offer.amount}</span>
                                        <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">Gemas</span>
                                    </div>
                                    <div className="mt-4 w-full text-center py-2 bg-black/40 rounded-xl text-[10px] font-black text-white/50 border border-white/5 group-hover:text-white transition-colors relative z-10">
                                        {offer.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Linha de Ouro */}
                    <div>
                        <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-yellow-500/30" />
                            CONVERTER OURO
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { amount: '1.000', price: '50 💎', icon: '🪙' },
                                { amount: '5.000', price: '200 💎', icon: '🪙' },
                                { amount: '15.000', price: '500 💎', icon: '💰' },
                                { amount: '50.000', price: '1.500 💎', icon: '💰' },
                                { amount: '120.000', price: '3.000 💎', icon: '🏦' },
                            ].map((offer, i) => (
                                <div key={i} className="bg-white/[0.03] rounded-2xl p-5 flex flex-col items-center border border-white/5 hover:bg-white/[0.08] hover:border-yellow-500/30 transition-all cursor-pointer group relative overflow-hidden" onClick={() => handleBuy(`${offer.amount} Ouro`)}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                                    <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{offer.icon}</div>
                                    <div className="flex flex-col items-center z-10 text-center">
                                        <span className="text-xl font-black text-white leading-none mb-1">{offer.amount}</span>
                                        <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest">Ouro</span>
                                    </div>
                                    <div className="mt-4 w-full text-center py-2 bg-yellow-500/10 rounded-xl text-[10px] font-black text-yellow-500/70 border border-yellow-500/20 group-hover:bg-yellow-500/20 group-hover:text-yellow-400 transition-all relative z-10">
                                        {offer.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
