import React from 'react';
import type { Pack } from '../types';
import { Package } from 'lucide-react';

interface PackSlotProps {
    pack?: Pack;
    remainingTime?: number;
    formatTime?: (ms: number) => string;
    onOpen?: () => void;
    onBuy?: () => void;
    onUnlock?: () => void;
}

export const PackSlot: React.FC<PackSlotProps> = ({
    pack,
    remainingTime = 0,
    formatTime = (ms) => `${ms}ms`,
    onOpen,
    onBuy,
    onUnlock
}) => {
    const getTierColor = (tier?: string) => {
        switch (tier) {
            case 'Cobre': return 'text-orange-600';
            case 'Bronze': return 'text-orange-800';
            case 'Ferro': return 'text-gray-400';
            case 'Prata': return 'text-gray-300';
            case 'Ouro': return 'text-yellow-500';
            case 'Diamante': return 'text-cyan-400';
            default: return 'text-gray-400';
        }
    };

    const isReady = pack && remainingTime === 0;

    if (!pack) {
        return (
            <div
                onClick={onBuy}
                className="h-24 bg-gray-800 rounded-lg border border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition group"
            >
                <Package className="text-gray-400 group-hover:text-gray-300" />
                <span className="text-[10px] mt-1 text-gray-500 group-hover:text-gray-400">Comprar</span>
            </div>
        );
    }

    return (
        <div
            className={`h-24 bg-gray-800 rounded-lg border-2 flex flex-col items-center justify-center transition relative ${isReady
                ? 'border-green-500 cursor-pointer hover:bg-gray-700 animate-pulse'
                : 'border-gray-600'
                }`}
        >
            <div onClick={isReady ? onOpen : undefined} className="flex flex-col items-center justify-center flex-1 w-full">
                <Package className={getTierColor(pack.tier)} size={28} />
                <span className="text-[10px] mt-1 font-bold">{pack.tier}</span>
                {!isReady && (
                    <span className="text-[9px] text-yellow-400">{formatTime(remainingTime)}</span>
                )}
                {isReady && (
                    <span className="text-[9px] text-green-400 font-bold">ABRIR!</span>
                )}
            </div>
            {!isReady && onUnlock && (
                <button
                    onClick={onUnlock}
                    className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white text-[8px] px-1 py-0.5 rounded"
                >
                    💎 Abrir
                </button>
            )}
        </div>
    );
};
