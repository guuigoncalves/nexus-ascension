import React from 'react';
import {
    Users,

    Dices,
    Timer,
    Globe,
    Flame,
    Trophy,
    Play,
    Star,
    Swords,
    Sparkles,
    Gamepad2
} from 'lucide-react';

interface Evento {
    id: string;
    title: string;
    description: string;
    reward: string;
    icon: any;
    color: string;
    category: 'Competitivo' | 'Casual' | 'Especial';
}

const EVENTOS: Evento[] = [
    {
        id: 'duplas',
        title: "Duplas Mortais",
        description: "Batalha 2v2 épica com combos compartilhados.",
        reward: "+200 Ouro",
        icon: Users,
        color: "from-blue-600 to-indigo-900",
        category: 'Competitivo'
    },
    {
        id: 'efeitos',
        title: "Guerra de Efeitos",
        description: "Efeitos ativam duas vezes por turno.",
        reward: "+300 Ouro",
        icon: Flame,
        color: "from-orange-600 to-red-900",
        category: 'Competitivo'
    },
    {
        id: 'aleatorio',
        title: "Deck Aleatório",
        description: "Sua sorte é sua única estratégia.",
        reward: "+100 Ouro",
        icon: Dices,
        color: "from-purple-600 to-fuchsia-900",
        category: 'Casual'
    },
    {
        id: 'draft',
        title: "Draft Rápido",
        description: "Escolha seu deck em 60 segundos.",
        reward: "+50 Ouro",
        icon: Timer,
        color: "from-emerald-600 to-teal-900",
        category: 'Casual'
    },
    {
        id: 'lendarios',
        title: "Apenas Lendários",
        description: "Apenas cartas douradas são permitidas.",
        reward: "+15 Gemas",
        icon: Star,
        color: "from-yellow-500 to-amber-900",
        category: 'Especial'
    },
    {
        id: 'universo',
        title: "Universo Único",
        description: "Cartas de apenas um universo por deck.",
        reward: "+10 Gemas",
        icon: Globe,
        color: "from-cyan-600 to-blue-900",
        category: 'Especial'
    },
    // Modos de Equipe (Adicionados)
    {
        id: '2v2_ranked',
        title: "Operação Ranqueada",
        description: "Combate 2v2 tático. Suba o ELO do seu time.",
        reward: "Rank Points",
        icon: Swords,
        color: "from-red-600 to-red-950",
        category: 'Competitivo'
    },
    {
        id: '3v3_chaos',
        title: "Caos Total 3v3",
        description: "Triplo de mana, sem limites.",
        reward: "Apenas XP",
        icon: Gamepad2,
        color: "from-purple-600 to-indigo-900",
        category: 'Casual'
    },
    {
        id: 'faction_war',
        title: "Guerra de Guildas",
        description: "Batalha por território. Glória para a facção.",
        reward: "Espólio Lendário",
        icon: Trophy,
        color: "from-yellow-400 to-amber-800",
        category: 'Competitivo'
    },
];

interface EventosProps {
    onBack?: () => void;
}

export const Eventos: React.FC<EventosProps> = ({ onBack }) => {
    const categories = ['Competitivo', 'Casual', 'Especial'] as const;

    return (
        <div className="h-full w-full bg-[#0a1016]/40 text-white p-8 overflow-y-auto custom-scrollbar font-sans">
            <div className="max-w-7xl mx-auto space-y-16 pb-24">

                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
                        Eventos Disponíveis
                    </h1>
                    <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                        <Swords size={14} className="animate-pulse" />
                        Escolha seu desafio e conquiste as arenas
                    </div>
                </div>

                {/* Topics (Categories) */}
                {categories.map(cat => (
                    <section key={cat} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
                                {cat === 'Competitivo' && <Swords size={14} className="text-red-500" />}
                                {cat === 'Casual' && <Dices size={14} className="text-emerald-500" />}
                                {cat === 'Especial' && <Sparkles size={14} className="text-yellow-500" />}
                                {cat}
                            </h2>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {EVENTOS.filter(e => e.category === cat).map((evento) => (
                                <div
                                    key={evento.id}
                                    className={`group relative overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 cursor-pointer h-72`}
                                >
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${evento.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />

                                    {/* Decorative Icon Background */}
                                    <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 transform group-hover:scale-150 rotate-12">
                                        <evento.icon size={256} />
                                    </div>

                                    <div className="relative h-full p-8 flex flex-col justify-between z-10">
                                        <div className="space-y-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all duration-500">
                                                <evento.icon size={28} className="text-white" />
                                            </div>

                                            <div>
                                                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:translate-x-1 transition-transform">
                                                    {evento.title}
                                                </h3>
                                                <p className="text-white/40 text-xs font-medium leading-relaxed max-w-[200px]">
                                                    {evento.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Recompensa</span>
                                                <span className="text-sm font-black italic text-yellow-500">
                                                    {evento.reward}
                                                </span>
                                            </div>

                                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic text-xs hover:scale-110 active:scale-95 transition-all shadow-lg border border-indigo-400/20">
                                                <Play size={12} fill="white" />
                                                Jogar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hover Glow */}
                                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${evento.color} rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 -z-10`} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Rank Message Footer */}
                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">Rank de Eventos</h4>
                            <p className="text-sm font-bold text-white/60 italic">Seu progresso é recompensado. Suba para o Top Global.</p>
                        </div>
                    </div>
                    {onBack && <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Voltar ←</button>}
                </div>

            </div>
        </div>
    );
};
