import React from 'react';
import { Crown, Users } from 'lucide-react';

interface TeamSlotProps {
    slot: number;
    player: {
        nome: string;
        avatar: string;
        ready: boolean;
        leader?: boolean;
    } | null;
    onInvite?: () => void;
    onKick?: () => void;
}

export const TeamSlot: React.FC<TeamSlotProps> = ({ player, onInvite, onKick }) => {
    // Estado vazio - slot livre
    if (!player) {
        return (
            <div
                onClick={onInvite}
                className="w-full aspect-[3/4] bg-black/40 border border-white/10 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group relative overflow-hidden backdrop-blur-sm"
            >
                {/* Linhas de mira decorativas */}
                <div className="absolute top-4 left-4 w-4 h-[1px] bg-white/20" />
                <div className="absolute top-4 left-4 w-[1px] h-4 bg-white/20" />
                <div className="absolute bottom-4 right-4 w-4 h-[1px] bg-white/20" />
                <div className="absolute bottom-4 right-4 w-[1px] h-4 bg-white/20" />

                <Users size={32} className="text-white/20 group-hover:text-white/80 transition-colors" />
                <span className="text-[10px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em] transition-colors">
                    Convidar Agente
                </span>
            </div>
        );
    }

    // Estado ocupado
    return (
        <div className="w-full aspect-[3/4] bg-black border border-white/20 relative group overflow-hidden">
            {/* Imagem de Fundo Full */}
            <div className="absolute inset-0 z-0">
                <img
                    src={player.avatar}
                    alt={player.nome}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-[0.7] group-hover:brightness-100 grayscale-[0.3] group-hover:grayscale-0"
                />
                {/* Gradiente Overlay para texto legível */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* Badge de Líder */}
            {player.leader && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-yellow-600/90 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest clip-path-polygon" style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)' }}>
                    <Crown size={12} /> Líder
                </div>
            )}

            {/* Status Ready Top Right */}
            <div className={`absolute top-4 right-4 z-20 px-3 py-1 border backdrop-blur-md text-[9px] font-black uppercase tracking-widest ${player.ready
                ? 'border-green-500 text-green-400 bg-green-950/50'
                : 'border-red-500 text-red-500 bg-red-950/50'
                }`}>
                {player.ready ? 'PRONTO' : 'AGUARDANDO'}
            </div>

            {/* Info Footer */}
            <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 drop-shadow-md">
                    {player.nome.split('#')[0]}
                </h3>
                <p className="text-xs font-mono text-gray-400 tracking-wider">
                    OPERATIVO #{player.nome.split('#')[1] || '000'}
                </p>

                {/* Ações (Kick) - Aparecem no hover */}
                {!player.leader && onKick && (
                    <button
                        onClick={onKick}
                        className="mt-4 w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                        Dispensar Agente
                    </button>
                )}
            </div>
        </div>
    );
};

