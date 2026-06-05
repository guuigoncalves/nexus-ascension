import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Settings, LogOut, User, Edit2, Zap, Shield, Crown, RefreshCcw, LogIn, Chrome, Facebook, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import React, { useState } from 'react';

interface ProfileMenuProps {
    onClose: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose }) => {
    const { profile, updateProfile } = useGame();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'avatars' | 'settings'>('overview');

    const avatarOptions = [
        { id: 1, image: '/avatars/ai_art.jpg', label: 'Avatar AI' },
        { id: 2, image: '/avatars/dark_frieza.png', label: 'Dark Frieza' },
        { id: 3, image: '/avatars/dark_goku.png', label: 'Dark Goku' },
        { id: 4, image: '/avatars/dark_vegeta.png', label: 'Dark Vegeta' },
        { id: 5, image: '/avatars/harry (2).jpg', label: 'Harry V2' },
        { id: 6, image: '/avatars/harry.jpg', label: 'Harry' },
        { id: 7, image: '/avatars/kratos.jpg', label: 'Kratos' },
        { id: 8, image: '/avatars/leonardo.jpg', label: 'Leonardo' },
        { id: 9, image: '/avatars/luffy.jpg', label: 'Luffy' },
        { id: 10, image: '/avatars/naruto.jpg', label: 'Naruto' },
    ];

    const currentAvatarUrl = avatarOptions.find(opt => opt.id === profile.avatar)?.image || avatarOptions[0].image;

    // Tabs configuration
    const tabs = [
        { id: 'overview', icon: User, label: 'Visão Geral' },
        { id: 'avatars', icon: RefreshCcw, label: 'Avatares' },
        { id: 'settings', icon: Settings, label: 'Ajustes' },
        { id: 'login', icon: LogIn, label: 'Conta' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-3xl h-[520px] bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                {/* LEFT SIDEBAR navigation */}
                <div className="w-20 bg-white/[0.02] border-r border-white/5 flex flex-col items-center py-6 gap-6 z-10 backdrop-blur-sm">
                    {/* Logo/Brand Placeholder */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg mb-4">
                        <Crown size={20} className="text-white" />
                    </div>

                    {/* Nav Items */}
                    <div className="flex flex-col gap-4 w-full">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`relative w-full h-14 flex items-center justify-center transition-all group ${isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-r-full"
                                        />
                                    )}
                                    <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-auto">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 relative flex flex-col">
                    {/* Header Bar */}
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.01]">
                        <h2 className="text-xl font-black text-white italic tracking-wider">
                            {tabs.find(t => t.id === activeTab)?.label.toUpperCase()}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content Pad */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-0">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col md:flex-row gap-8"
                                >
                                    {/* Left Column: Avatar & Main Ident */}
                                    <div className="w-full md:w-1/3 flex flex-col items-center">
                                        <div className="relative group cursor-pointer" onClick={() => setActiveTab('avatars')}>
                                            <div className="w-48 h-48 rounded-full p-1 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                                                <div className="w-full h-full rounded-full bg-black p-1">
                                                    <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex justify-center">
                                                <div className="bg-black border border-cyan-500/50 px-4 py-1 rounded-full shadow-lg">
                                                    <span className="text-cyan-400 font-black text-xs tracking-widest uppercase">LVL {profile.level}</span>
                                                </div>
                                            </div>
                                            {/* Edit Overlay */}
                                            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                <Edit2 className="text-white" />
                                            </div>
                                        </div>

                                        <div className="mt-10 text-center space-y-1">
                                            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{profile.name}</h1>
                                        </div>

                                        <div className="mt-8 w-full bg-white/5 rounded-2xl p-4 border border-white/5">
                                            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                                                <span>Progresso XP</span>
                                                <span>{profile.xp}/{profile.maxXp}</span>
                                            </div>
                                            <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${(profile.xp / profile.maxXp) * 100}%` }}
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Stats Grid */}
                                    <div className="flex-1 grid grid-cols-2 gap-4 content-start">
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                                                    <Trophy size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Troféus</div>
                                                    <div className="text-2xl font-black text-white leading-none">{profile.trophies}</div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className="w-[70%] h-full bg-yellow-500" />
                                            </div>
                                            <div className="mt-2 text-[10px] text-yellow-500 font-bold text-right">Top 5% Global</div>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                                    <Star size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Coleção</div>
                                                    <div className="text-2xl font-black text-white leading-none">{profile.ownedCards.length}</div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className="w-[45%] h-full bg-cyan-500" />
                                            </div>
                                            <div className="mt-2 text-[10px] text-cyan-500 font-bold text-right">Iniciante</div>
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Partidas</div>
                                                    <div className="text-2xl font-black text-white leading-none">42</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-2">
                                                Vitórias: <span className="text-green-400 font-bold">28</span> • Derrotas: <span className="text-red-400 font-bold">14</span>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => { onClose(); navigate('/editor'); }}
                                            className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl p-6 hover:from-purple-900/40 hover:to-indigo-900/40 transition cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                            <div className="flex items-center gap-3 mb-2 relative z-10">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                                    <Edit2 size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Ferramenta</div>
                                                    <div className="text-lg font-black text-white leading-none">Editor de Cartas</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'avatars' && (
                                <motion.div
                                    key="avatars"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full"
                                >
                                    <div className="grid grid-cols-4 gap-4">
                                        {avatarOptions.map((opt) => (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                key={opt.id}
                                                onClick={() => updateProfile({ avatar: opt.id })}
                                                className={`
                                                    relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group
                                                    ${profile.avatar === opt.id ? 'border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'border-white/5 hover:border-white/20'}
                                                `}
                                            >
                                                <img src={opt.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt={opt.label} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                    <span className="text-white text-xs font-bold">{opt.label}</span>
                                                </div>
                                                {profile.avatar === opt.id && (
                                                    <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1 shadow-lg">
                                                        <Star size={12} className="text-black fill-black" />
                                                    </div>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col gap-4"
                                >
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Áudio</h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium">Música de Fundo</span>
                                                <div className="w-12 h-6 bg-cyan-600 rounded-full cursor-pointer relative shadow-inner">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium">Efeitos Sonoros</span>
                                                <div className="w-12 h-6 bg-cyan-600 rounded-full cursor-pointer relative shadow-inner">
                                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Conta</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                <span className="text-gray-300">Alterar Nome</span>
                                                <button
                                                    onClick={() => {
                                                        const newName = prompt('Novo nome de jogador:', profile.name);
                                                        if (newName) updateProfile({ name: newName });
                                                    }}
                                                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition"
                                                >
                                                    EDITAR
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'login' && (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col items-center justify-center relative"
                                >
                                    <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                                        {/* Glow Effect */}
                                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-cyan-500/30 transition duration-700" />

                                        <h3 className="text-center text-2xl font-black italic text-white mb-2">VINCULAR CONTA</h3>
                                        <p className="text-center text-xs text-gray-400 mb-8 max-w-[200px] mx-auto leading-relaxed">
                                            Salve seu progresso na nuvem e jogue em qualquer dispositivo.
                                        </p>

                                        <div className="space-y-3">
                                            <button className="w-full flex items-center justify-center gap-3 bg-white text-black h-12 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition-all relative overflow-hidden">
                                                <Chrome size={20} className="text-blue-500" />
                                                <span>Continuar com Google</span>
                                            </button>

                                            <button className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white h-12 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(24,119,242,0.5)] hover:bg-[#166fe5] hover:scale-[1.02] transition-all">
                                                <Facebook size={20} fill="currentColor" />
                                                <span>Facebook</span>
                                            </button>

                                            <button className="w-full flex items-center justify-center gap-3 bg-white/5 text-white border border-white/10 h-12 rounded-xl font-bold hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] transition-all group/mail">
                                                <Mail size={20} className="text-gray-400 group-hover/mail:text-white transition-colors" />
                                                <span>Entrar com Email</span>
                                            </button>
                                        </div>

                                        <div className="mt-8 flex items-center gap-4">
                                            <div className="h-px flex-1 bg-white/10" />
                                            <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Segurança</span>
                                            <div className="h-px flex-1 bg-white/10" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
