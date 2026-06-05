import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Home, Layers, ShoppingBag, Calendar, Users, Coins, Gem, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export interface HeaderProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
    onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    currentTab,
    onTabChange,
    onOpenProfile
}) => {
    const { profile } = useGame();

    const navItems = [
        { id: 'deck', icon: Layers, label: 'DECK' },
        { id: 'equipes', icon: Users, label: 'EQUIPES' },
        { id: 'home', icon: Home, label: 'INÍCIO' },
        { id: 'loja', icon: ShoppingBag, label: 'LOJA' },
        { id: 'eventos', icon: Calendar, label: 'EVENTOS' },
    ];

    const getTabColor = (tab: string) => {
        switch (tab) {
            case 'home': return 'transparent';
            case 'loja': return 'rgba(10, 16, 22, 0.4)'; // Fundo da Loja
            case 'eventos': return 'rgba(10, 16, 22, 0.4)'; // Mesmo fundo da Loja
            case 'deck': return 'rgba(10, 16, 22, 0.4)';
            case 'equipes': return 'rgba(0, 0, 0, 0.4)';
            default: return 'rgba(0, 0, 0, 0.8)';
        }
    };

    const headerBg = getTabColor(currentTab);

    // Cálculos de Experiência
    const currentExp = profile?.xp || 0;
    const nextLevelExp = (profile?.level || 1) * 1000;
    const expProgress = (currentExp / nextLevelExp) * 100;

    return (
        <div
            className="fixed top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 transition-all duration-500 overflow-visible"
            style={{ backgroundColor: headerBg }}
        >
            {/* LEFT: TECH Profile Layout */}
            <div
                onClick={() => onOpenProfile?.()}
                className="flex items-center gap-3 cursor-pointer group pl-2 hover:bg-white/5 p-2 rounded-xl transition-colors border border-transparent hover:border-white/5"
            >
                {/* Tech Avatar Container */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* Animated Rings */}
                    <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-t-cyan-400 animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-1 rounded-full border border-purple-500/30 border-b-purple-400 animate-[spin_4s_linear_infinite_reverse]" />

                    {/* Avatar Image */}
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 z-10 group-hover:scale-105 transition-transform duration-300">
                        <img
                            src={
                                (() => {
                                    const avatars: Record<number, string> = {
                                        0: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                                        1: '/avatars/ai_art.jpg',
                                        2: '/avatars/dark_frieza.png',
                                        3: '/avatars/dark_goku.png',
                                        4: '/avatars/dark_vegeta.png',
                                        5: '/avatars/harry (2).jpg',
                                        6: '/avatars/harry.jpg',
                                        7: '/avatars/kratos.jpg',
                                        8: '/avatars/leonardo.jpg',
                                        9: '/avatars/luffy.jpg',
                                        10: '/avatars/naruto.jpg'
                                    };
                                    return avatars[profile?.avatar || 0] || avatars[0];
                                })()
                            }
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Level Badge - Tech Pill */}
                    <div className="absolute -bottom-1.5 z-20 bg-[#0a0a0a] border border-cyan-500/50 px-1.5 py-[1px] rounded flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        <span className="text-[7px] font-black text-cyan-400 tracking-tighter">LVL {profile?.level || 1}</span>
                    </div>
                </div>

                {/* Name & XP Tech Display */}
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white tracking-widest uppercase group-hover:text-cyan-400 transition-colors">
                            {profile?.name || 'PLAYER'}
                        </span>
                        <Zap size={10} className="text-cyan-400 fill-cyan-400 animate-pulse hidden group-hover:block" />
                    </div>

                    {/* XP Bar Integrated */}
                    <div className="flex flex-col w-24">
                        <div className="w-full h-1 bg-gray-800/80 rounded-full overflow-hidden border border-white/5 relative group-hover:border-cyan-500/30 transition-colors">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${expProgress}%` }}
                                className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]"
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-0.5 px-0.5">
                            <span className="text-[9px] font-mono font-bold text-gray-500 group-hover:text-cyan-300 transition-colors">
                                {currentExp} / {nextLevelExp} XP
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CENTER: Navigation */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10">
                {navItems.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                                flex flex-col items-center justify-center transition-all duration-300 transform outline-none group/btn
                                ${isActive ? 'text-yellow-400 scale-105' : 'text-white/40 hover:text-white/80'}
                            `}
                        >
                            <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[7px] font-black tracking-[0.2em] mt-1.5 transition-colors ${isActive ? 'text-yellow-400' : 'text-white/20 group-hover/btn:text-white/50'}`}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="activeTabGlow"
                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* RIGHT: Resources & Quick Links */}
            <div className="flex items-center gap-6 mr-12">
                {/* Quick Icons (Battle Pass & Ranking) */}
                <div className="flex items-center gap-4 mr-2">
                    <button
                        onClick={() => onTabChange('eventos')}
                        className="group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-yellow-500/10 active:scale-90"
                    >
                        <img
                            src="/icon_pass.png"
                            alt="Pass"
                            className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] group-hover:scale-110 transition-transform"
                        />
                        <span className="absolute -bottom-1 text-[5px] font-black text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">PASS</span>
                    </button>

                    <button
                        onClick={() => onTabChange('eventos')}
                        className="group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-cyan-500/10 active:scale-90"
                    >
                        <Trophy size={15} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform" />
                        <span className="absolute -bottom-1 text-[5px] font-black text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">RANKING</span>
                    </button>
                </div>

                {/* Coin Container */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer active:scale-95 transition-all">
                        <Coins size={14} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
                        <span className="text-sm font-black text-white tabular-nums tracking-tight">
                            {profile?.currency?.grana || 0}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 group cursor-pointer active:scale-95 transition-all">
                        <Gem size={14} className="text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
                        <span className="text-sm font-black text-white tabular-nums tracking-tight">
                            {profile?.currency?.gems || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
