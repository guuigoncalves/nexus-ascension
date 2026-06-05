import React from 'react';
import type { Card } from '../types';

interface CardProps {
    card: Card;
    onClick?: () => void;
    scale?: number;
    isFaceDown?: boolean;
}

export const CardComponent: React.FC<CardProps> = ({ card, onClick, scale = 1, isFaceDown = false }) => {
    const getBorderColor = (rarity: string) => {
        if (isFaceDown) return 'border-slate-700';
        switch (rarity) {
            case 'Recruta': return 'border-gray-400';
            case 'Soldado': return 'border-blue-500';
            case 'Elite': return 'border-purple-500';
            case 'Lendário': return 'border-yellow-500';
            case 'Titã': return 'border-red-600';
            case 'Supremo': return 'border-white animate-pulse';
            default: return 'border-gray-400';
        }
    };

    if (isFaceDown) {
        return (
            <div
                onClick={onClick}
                className={`
                    relative w-48 h-72 bg-slate-900 rounded-xl border-4 ${getBorderColor('')} 
                    shadow-2xl transform transition-transform hover:scale-105 cursor-pointer flex flex-col
                    overflow-hidden
                `}
                style={{ transform: `scale(${scale})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
                    <div className="w-32 h-48 border-2 border-white/5 rounded-lg flex items-center justify-center bg-slate-900/50">
                        <span className="text-4xl opacity-20 filter grayscale">🎴</span>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`
        relative w-48 h-72 bg-gray-800 rounded-lg border-4 ${getBorderColor(card.rarity)} 
        shadow-lg transform transition-transform hover:scale-105 cursor-pointer flex flex-col
        overflow-hidden
      `}
            style={{ transform: `scale(${scale})` }}
        >
            {/* Cabeçalho */}
            <div className="bg-gray-900 p-2 flex justify-between items-center border-b border-gray-700">
                <span className="text-xs font-bold text-white truncate">{card.name}</span>
                <span className="text-[10px] text-gray-400">{card.universe}</span>
            </div>

            {/* Imagem */}
            <div className="flex-1 bg-black relative">
                <img
                    src={card?.image || '/cards/placeholder.png'}
                    alt={card?.name || 'Card'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/cards/placeholder.png';
                    }}
                />
                <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs">
                    {card?.rarity === 'Destruidor' ? '⚛️' : card?.rarity === 'Supremo' ? 'Ω' : '⚔️'}
                </div>
            </div>

            {/* Status */}
            <div className="bg-gray-900 p-2 border-t border-gray-700">
                <div className="flex justify-between mb-1">
                    {card.atk !== undefined && <span className="text-red-400 font-bold text-sm">ATK {card.atk}</span>}
                    {card.def !== undefined && <span className="text-blue-400 font-bold text-sm">DEF {card.def}</span>}
                </div>
                <p className="text-[10px] text-gray-300 line-clamp-2 leading-tight">
                    {card.ability || card.description}
                </p>
            </div>
        </div>
    );
};
