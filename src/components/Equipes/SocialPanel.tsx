import React, { useState } from 'react';
import { Search, UserPlus, Users, Globe, Mail, Medal, Shield, Settings, LogOut } from 'lucide-react';
import { MOCK_FRIENDS, MOCK_CLANS, MOCK_RANKING, MOCK_INVITES } from '../../data/teamMocks';
import type { Friend, Clan, RankingPlayer, Invite } from '../../data/teamMocks';

type TabType = 'amigos' | 'global' | 'convites';

export const SocialPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('amigos');
    const [searchTerm, setSearchTerm] = useState('');
    const [collapsed, setCollapsed] = useState({ online: false, offline: true, invites: false });

    const toggleSection = (section: 'online' | 'offline' | 'invites') => {
        setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const onlineFriends = MOCK_FRIENDS.filter((f) => f.online);
    const offlineFriends = MOCK_FRIENDS.filter((f) => !f.online);

    return (
        <div className="w-80 h-full bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col font-sans transition-all">
            {/* Header Area */}
            <div className="flex flex-col border-b border-white/5 bg-black/40 pt-4 pb-2">
                {/* Top Row: Title + Actions */}
                <div className="px-4 pb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none flex items-center gap-2">
                            Amigos
                            <span className="text-gray-600 font-mono text-[10px] bg-black/30 px-1 py-0.5 rounded">{MOCK_FRIENDS.length}</span>
                        </h3>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => console.log('Adicionar')}
                            className="w-7 h-7 flex items-center justify-center rounded bg-[#111] hover:bg-[#222] border border-white/5 hover:border-white/20 transition-all text-gray-500 hover:text-white"
                            title="Adicionar Amigo"
                        >
                            <UserPlus size={14} />
                        </button>
                        <button
                            onClick={() => console.log('Configurações')}
                            className="w-7 h-7 flex items-center justify-center rounded bg-[#111] hover:bg-[#222] border border-white/5 hover:border-white/20 transition-all text-gray-500 hover:text-white"
                            title="Configurações"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Search Bar (Full Width) */}
                <div className="px-3">
                    <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="BUSCAR ALIADO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 text-[10px] text-white placeholder:text-gray-700 outline-none focus:border-white/30 transition-all uppercase font-mono rounded-md"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area (Scrollable List) */}
            <div className="flex-1 overflow-y-auto bg-transparent p-4 space-y-4">

                {/* 1. Ativos (Collapsible) */}
                <div>
                    <button
                        onClick={() => toggleSection('online')}
                        className="w-full text-left text-[9px] font-black text-green-700 uppercase tracking-widest mb-2 flex items-center justify-between hover:text-green-600 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-700 rounded-full animate-pulse"></div>
                            Ativos ({onlineFriends.length})
                        </span>
                        <span>{collapsed.online ? '+' : '−'}</span>
                    </button>
                    {!collapsed.online && (
                        <div className="space-y-1 pl-1 border-l border-green-900/10 ml-1">
                            {onlineFriends.map((friend) => (
                                <FriendItem key={friend.id} friend={friend} />
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Offline (Collapsible) */}
                <div>
                    <button
                        onClick={() => toggleSection('offline')}
                        className="w-full text-left text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 flex items-center justify-between hover:text-gray-500 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                            Offline ({offlineFriends.length})
                        </span>
                        <span>{collapsed.offline ? '+' : '−'}</span>
                    </button>
                    {!collapsed.offline && (
                        <div className="space-y-1 pl-1 border-l border-white/5 ml-1 opacity-60">
                            {offlineFriends.map((friend) => (
                                <FriendItem key={friend.id} friend={friend} />
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Convites (Collapsible - Now at Bottom) */}
                {MOCK_INVITES.length > 0 && (
                    <div>
                        <button
                            onClick={() => toggleSection('invites')}
                            className="w-full text-left text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center justify-between hover:text-blue-400 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                Convites pendentes ({MOCK_INVITES.length})
                            </span>
                            <span>{collapsed.invites ? '+' : '−'}</span>
                        </button>
                        {!collapsed.invites && (
                            <div className="space-y-2 pl-1 border-l border-blue-900/10 ml-1">
                                {MOCK_INVITES.map((invite) => (
                                    <InviteItem key={invite.id} invite={invite} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>


        </div>
    );
};

// Sub-componentes
const FriendItem: React.FC<{ friend: Friend }> = ({ friend }) => (
    <div className="flex items-center gap-3 p-2 bg-transparent hover:bg-[#111] transition-all group cursor-pointer border border-transparent hover:border-white/5 rounded-md">
        <div className="relative">
            <div className="w-8 h-8 bg-black border border-white/20 p-0.5">
                <img src={friend.avatar} alt={friend.nome} className="w-full h-full object-cover grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
            </div>
            {friend.online && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-black" />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-300 group-hover:text-white truncate transition-colors">{friend.nome.split('#')[0]}</p>
            <p className="text-[9px] text-gray-700 font-mono">RANK {friend.rank}</p>
        </div>
        <button
            onClick={() => console.log('Convidando:', friend.id)}
            className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white text-black text-[9px] font-black uppercase tracking-wider transform translate-x-2 group-hover:translate-x-0 transition-all"
        >
            Invite
        </button>
    </div>
);

const ClanItem: React.FC<{ clan: Clan }> = ({ clan }) => (
    <div className="p-3 bg-[#0e0e0e] border border-white/5 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 flex items-center justify-center bg-black border border-white/10 text-lg">
                {clan.emblema}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-300 truncate">
                    <span className="text-yellow-700 mr-1">[{clan.tag}]</span>
                    {clan.nome}
                </p>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">
                    {clan.membrosOnline}/{clan.totalMembros} operatives
                </p>
            </div>
        </div>
        <button
            onClick={() => console.log('Solicitar entrada:', clan.id)}
            className="w-full py-1.5 bg-[#1a1a1a] hover:bg-white hover:text-black border border-white/10 text-[9px] font-bold text-gray-500 transition-all uppercase tracking-widest"
        >
            Alistar-se
        </button>
    </div>
);

const RankingItem: React.FC<{ player: RankingPlayer }> = ({ player }) => {
    const getRankStyle = (pos: number) => {
        if (pos === 1) return 'text-yellow-500';
        if (pos === 2) return 'text-gray-400';
        if (pos === 3) return 'text-orange-700';
        return 'text-gray-700';
    };

    return (
        <div className="flex items-center gap-3 p-2 border-b border-white/5 last:border-0">
            <div className={`w-4 text-center font-black text-xs ${getRankStyle(player.posicao)}`}>
                {player.posicao}
            </div>
            <img src={player.avatar} alt={player.nome} className="w-6 h-6 grayscale opacity-60" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 truncate">{player.nome}</p>
            </div>
            <span className="text-[10px] font-mono text-gray-600">{player.elo}</span>
        </div>
    );
};

const InviteItem: React.FC<{ invite: Invite }> = ({ invite }) => (
    <div className="flex items-center gap-3 p-2 bg-[#0e0e0e]/50 hover:bg-[#111] transition-all border border-blue-900/30 hover:border-blue-500/50 rounded-md group">
        <div className="relative">
            <div className="w-8 h-8 bg-black border border-blue-500/30 p-0.5">
                <img src={invite.remetente.avatar} alt="Sender" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
            </div>
            {/* Blue dot for invite */}
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 border border-black animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-300 group-hover:text-white truncate transition-colors">{invite.remetente.nome}</p>
            <p className="text-[9px] text-blue-400/80 font-mono uppercase tracking-tight">{invite.modo}</p>
        </div>
        <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-black border border-green-500/50 rounded transition-all" title="Aceitar">
                <span className="text-[10px]">✓</span>
            </button>
            <button className="w-6 h-6 flex items-center justify-center bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 rounded transition-all" title="Recusar">
                <span className="text-[10px]">✕</span>
            </button>
        </div>
    </div>
);
