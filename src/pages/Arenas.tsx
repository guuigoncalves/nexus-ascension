import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Swords, Info, Trophy } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { ARENAS } from '../constants/arenas';

export const Arenas: React.FC = () => {
    const { profile } = useGame();
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current arena
    useEffect(() => {
        if (scrollContainerRef.current) {
            // Scroll logic can be improved to center current arena
            // For now, scroll to bottom (start) as before, or find active arena
        }
    }, []);

    const handlePlay = (arena: typeof ARENAS[0]) => {
        navigate('/battle', { state: { arenaId: arena.id, file: arena.file, variants: arena.variants } });
    };

    // Determine current mode name
    const currentArenaId = ARENAS.filter(a => profile.trophies >= a.trophies).pop()?.id || 1;
    const modeTitle = currentArenaId >= 7 ? "RANKEADA" : "WORLD TOUR";

    return (
        <div className="h-full w-full relative overflow-hidden flex flex-col items-center">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-black/80 z-0"></div>

            {/* Mode Title Header - Floats below TopBar */}
            <div className="absolute top-24 left-0 right-0 z-20 flex justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur border border-white/10 px-8 py-2 rounded-full shadow-2xl">
                    <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
                        {modeTitle}
                    </h1>
                </div>
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-auto custom-scrollbar pt-40 pb-20 px-4 flex flex-col-reverse items-center gap-6 relative z-10"
            >
                {/* Connection Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 -translate-x-1/2 opacity-30"></div>

                {ARENAS.map((arena, index) => {
                    const isUnlocked = profile.trophies >= arena.trophies;

                    return (
                        <motion.div
                            key={arena.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className={`relative w-full max-w-md group ${isUnlocked ? '' : 'grayscale opacity-60'}`}
                        >
                            {/* Arena Card */}
                            <div className={`relative h-32 rounded-2xl overflow-hidden border-2 shadow-xl transition-all duration-300 flex ${isUnlocked
                                ? 'border-yellow-500/20 bg-gray-900 group-hover:border-yellow-500/50'
                                : 'border-gray-800 bg-black'
                                }`}>

                                {/* Info Section */}
                                <div className="flex-1 p-4 flex flex-col z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className={`font-black uppercase text-lg italic leading-none mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                                {arena.name}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-black/40 px-2 py-0.5 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-1 border border-white/5">
                                                    <Trophy size={10} />
                                                    {arena.trophies}+
                                                </div>
                                                {arena.variants > 1 && (
                                                    <span className="text-[9px] text-gray-500 uppercase font-bold">{arena.variants} Var.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unlocked Rarities Tooltip Trigger */}
                                        <div className="relative group/tooltip">
                                            <div className="bg-white/5 p-1.5 rounded-full hover:bg-white/10 cursor-help transition">
                                                <Info size={14} className={isUnlocked ? "text-cyan-400" : "text-gray-600"} />
                                            </div>
                                            {/* Tooltip Content */}
                                            <div className="absolute right-0 top-8 w-48 bg-black/95 border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition pointer-events-none z-50">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Desbloqueios:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {arena.unlockedRarities.map(r => (
                                                        <span key={r} className="text-[9px] bg-gray-800 px-1.5 py-0.5 rounded text-white border border-gray-700">{r}</span>
                                                    ))}
                                                    {arena.unlockedRarities.length === 0 && <span className="text-[9px] text-gray-600">Nenhum</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex justify-between items-end">
                                        {isUnlocked ? (
                                            <button
                                                onClick={() => handlePlay(arena)}
                                                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-5 py-2 rounded-xl font-black text-xs uppercase shadow-lg shadow-orange-900/20 active:scale-95 transition-all flex items-center gap-2 border border-white/20"
                                            >
                                                <Swords size={14} /> BATALHAR
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-500 font-bold text-xs uppercase bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                                                <Lock size={12} /> Bloqueado
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Map/Image Preview */}
                                <div className="w-32 h-full relative overflow-hidden mask-gradient-left">
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900 z-10 w-10"></div>
                                    <img
                                        src={`/arenas/arena${arena.id}_icon.png`}
                                        alt={arena.name}
                                        className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-700"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/150/000000/FFFFFF?text=Arena';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ID Marker */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center font-black text-xs text-gray-500 z-20 group-hover:border-yellow-500 group-hover:text-yellow-500 transition-colors shadow-xl">
                                {arena.id}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
