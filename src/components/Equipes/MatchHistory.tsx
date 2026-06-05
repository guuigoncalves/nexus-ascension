import React from 'react';
import { Video, RefreshCw, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { Match } from '../../data/teamMocks';

interface MatchHistoryProps {
    match: Match;
    onReplay?: () => void;
    onRematch?: () => void;
    onViewAll?: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
    match,
    onReplay,
    onRematch,
    onViewAll,
}) => {
    const isVitoria = match.resultado === 'vitoria';

    return (
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-900/10 to-blue-900/10 backdrop-blur-sm p-4">
            {/* Título */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white/80 uppercase tracking-wider">
                    Última Partida
                </h3>
                <span className="text-xs text-white/50 flex items-center gap-1">
                    <Clock size={12} />
                    {match.tempo}
                </span>
            </div>

            {/* Badge de Resultado */}
            <div className="mb-4">
                <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-black text-sm uppercase ${isVitoria
                            ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-2 border-red-500/30'
                        }`}
                >
                    {isVitoria ? '✅ VITÓRIA' : '❌ DERROTA'}
                </div>
            </div>

            {/* Informações da Partida */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Modo</p>
                    <p className="text-xs text-white font-bold">{match.modo}</p>
                </div>
                <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Arena</p>
                    <p className="text-xs text-white font-bold">{match.arena}</p>
                </div>
                <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Duração</p>
                    <p className="text-xs text-white font-bold">{match.duracao}</p>
                </div>
                <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold mb-1">ELO</p>
                    <p
                        className={`text-xs font-black flex items-center gap-1 ${match.eloChange > 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                    >
                        {match.eloChange > 0 ? (
                            <TrendingUp size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                        {match.eloChange > 0 ? '+' : ''}
                        {match.eloChange}
                    </p>
                </div>
            </div>

            {/* Equipes */}
            <div className="mb-4 p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs text-blue-400 font-bold">Você + {match.aliado}</span>
                </div>
                <div className="text-center text-[10px] text-white/40 uppercase font-bold mb-2">
                    VS
                </div>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-red-400 font-bold">
                        {match.oponentes.join(' + ')}
                    </span>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
                <button
                    onClick={onReplay}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 transition-all text-xs font-bold"
                >
                    <Video size={14} />
                    Replay
                </button>
                <button
                    onClick={onRematch}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 transition-all text-xs font-bold"
                >
                    <RefreshCw size={14} />
                    Revanche
                </button>
            </div>

            {/* Botão Ver Histórico Completo */}
            {onViewAll && (
                <button
                    onClick={onViewAll}
                    className="w-full mt-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/90 transition-all text-xs font-bold uppercase tracking-wider"
                >
                    Ver Histórico Completo
                </button>
            )}
        </div>
    );
};
