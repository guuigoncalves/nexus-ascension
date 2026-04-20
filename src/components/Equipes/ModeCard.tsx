import React from 'react';
import { Swords, GamepadIcon, Users, Trophy } from 'lucide-react';

interface ModeCardProps {
    id: string;
    icon: 'sword' | 'gamepad' | 'users' | 'trophy';
    titulo: string;
    badge: {
        texto: string;
        tipo: 'competitivo' | 'diversao' | 'embreve';
    };
    descricao: string[];
    recompensas: string;
    botao: {
        texto: string;
        ativo: boolean;
        onClick: () => void;
    };
    requisito?: string;
}

export const ModeCard: React.FC<ModeCardProps> = ({
    icon,
    titulo,
    badge,
    descricao,
    recompensas,
    botao,
    requisito,
}) => {
    const icons = {
        sword: Swords,
        gamepad: GamepadIcon,
        users: Users,
        trophy: Trophy,
    };

    const Icon = icons[icon];

    const badgeStyles = {
        competitivo: 'bg-red-900/20 text-red-500 border-red-900/30',
        diversao: 'bg-blue-900/20 text-blue-500 border-blue-900/30',
        embreve: 'bg-gray-800/30 text-gray-500 border-gray-700/30',
    };

    return (
        <div
            className={`relative group bg-[#111] border border-white/5 hover:border-white/20 p-5 transition-all duration-300 ${botao.ativo
                ? 'cursor-pointer'
                : 'opacity-50'
                }`}
        >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-black border border-white/10 text-white/80 group-hover:text-white group-hover:border-white/30 transition-colors">
                    <Icon size={20} />
                </div>
                <span
                    className={`text-[9px] font-black uppercase px-2 py-1 border ${badgeStyles[badge.tipo]
                        } tracking-wider`}
                >
                    {badge.texto}
                </span>
            </div>

            {/* Info */}
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">{titulo}</h3>

            <ul className="mb-4 space-y-1.5">
                {descricao.map((item, index) => (
                    <li key={index} className="text-xs text-gray-500 flex items-center gap-2 font-mono">
                        <div className="w-1 h-1 bg-gray-600 rounded-full" />
                        {item}
                    </li>
                ))}
            </ul>

            {/* Recompensas Minimalista */}
            <div className="mb-4 pt-3 border-t border-white/5">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Rewards</p>
                <p className="text-xs text-yellow-600 font-bold">{recompensas}</p>
            </div>

            {/* Requisito */}
            {requisito && (
                <div className="mb-3 flex items-center justify-center gap-2 text-[9px] text-red-500 font-bold uppercase tracking-widest border border-red-900/20 bg-red-900/10 py-1.5">
                    <span>⚠️ {requisito}</span>
                </div>
            )}

            {/* Botão */}
            <button
                onClick={botao.onClick}
                disabled={!botao.ativo}
                className={`w-full py-3 font-bold text-xs uppercase tracking-[0.2em] transition-all border ${botao.ativo
                    ? 'bg-white text-black border-white hover:bg-gray-200'
                    : 'bg-transparent text-gray-600 border-gray-800 cursor-not-allowed'
                    }`}
            >
                {botao.texto}
            </button>
        </div>
    );
};
