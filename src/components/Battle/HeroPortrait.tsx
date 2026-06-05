import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface HeroPortraitProps {
    isPlayer: boolean;
    health: number;
    maxHealth?: number;
    mana: { current: number; max: number };
    name: string;
    avatar: string; // Emoji or image URL
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({
    isPlayer,
    health,
    mana,
    name,
    avatar
}) => {
    return (
        <div className={`relative flex flex-col items-center gap-2 ${isPlayer ? 'order-last' : 'order-first'}`}>
            {/* Hero Avatar */}
            <div className={`relative w-24 h-24 rounded-full border-4 ${isPlayer ? 'border-blue-500' : 'border-red-500'} shadow-lg overflow-hidden bg-gray-800`}>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    {avatar}
                </div>

                {/* Damage Flash Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }} // Trigger this on damage
                    className="absolute inset-0 bg-red-500/50"
                />
            </div>

            {/* Health Badge */}
            <div className="absolute -bottom-2 right-0 w-10 h-10 bg-red-600 rounded-full border-2 border-red-400 flex items-center justify-center text-white font-black shadow-lg z-10">
                {health}
            </div>

            {/* Mana Bar (Only for player usually, but good for opponent too) */}
            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full border border-blue-900/50 backdrop-blur-sm">
                <Zap size={14} className="text-blue-400 fill-blue-400" />
                <span className="text-sm font-bold text-white">
                    {mana.current}/{mana.max}
                </span>
            </div>

            {/* Name */}
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-black/40 px-2 rounded">
                {name}
            </div>
        </div>
    );
};
