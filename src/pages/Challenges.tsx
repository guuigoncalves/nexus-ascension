import React from 'react';
import { Clock } from 'lucide-react';

interface ChallengesProps {
    onBack?: () => void;
}

export const Challenges: React.FC<ChallengesProps> = () => {
    return (
        <div className="min-h-screen w-full bg-[#030305] pt-10 px-12 overflow-y-auto custom-scrollbar relative">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 z-0 bg-black opacity-20 pointer-events-none mix-blend-overlay" />

            <div className="max-w-6xl mx-auto pb-12 relative z-10">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">EVENTOS ESPECIAIS</h2>
                        <div className="h-1 w-20 bg-red-600 rounded-full" />
                    </div>
                </div>

                {/* Event Cards Grid (Fix overlap, grid-cols-2 compact) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: 'Invasão Kree', desc: 'Derrote 5 generais Kree na Arena para desbloquear recompensas cósmicas.', rewards: '1200 OURO + 50 GEMAS', deadline: '2d 14h', color: 'blue', tag: 'ESPECIAL' },
                        { title: 'Caçada Hydra', desc: 'Vença 3 partidas sem perder nenhuma unidade para ganhar itens exclusivos.', rewards: 'PACOTE VILÕES ELITE', deadline: '5d 08h', color: 'red', tag: 'COMBATE' },
                        { title: 'Poder Supremo', desc: 'Alcance o topo do ranking semanal para recompensas lendárias.', rewards: 'AVATAR SUPREMO', deadline: '12h 45m', color: 'purple', tag: 'LENDÁRIO' },
                        { title: 'Treino Stark', desc: 'Vença 10 partidas no Modo Laboratório com o mesmo deck.', rewards: '500 OURO', deadline: 'PERMANENTE', color: 'yellow', tag: 'TREINO' }
                    ].map((event, i) => (
                        <div
                            key={i}
                            className="bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col group relative overflow-hidden transition-all hover:bg-white/[0.05] hover:border-white/10"
                        >
                            {/* Background Glow */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${event.color}-500/10 blur-[60px] rounded-full group-hover:bg-${event.color}-500/20 transition-all duration-700`} />

                            <div className="flex items-center justify-between mb-6">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded bg-${event.color}-500/20 text-${event.color}-400 border border-${event.color}-500/30 uppercase tracking-tighter`}>{event.tag}</span>
                                <div className="text-white/10 flex items-center gap-1.5 shrink-0">
                                    <Clock size={12} />
                                    <span className="text-[9px] font-bold">{event.deadline}</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-3 group-hover:text-yellow-400 transition-colors">
                                {event.title}
                            </h3>
                            <p className="text-white/40 text-[10px] leading-relaxed mb-6 max-w-xs">
                                {event.desc}
                            </p>

                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">RECOMPENSA</span>
                                    <span className={`text-[11px] font-black text-white italic`}>{event.rewards}</span>
                                </div>
                                <button className={`bg-${event.color}-500 text-white font-black px-5 py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg`}>
                                    PARTICIPAR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
