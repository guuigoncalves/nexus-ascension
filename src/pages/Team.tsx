import React, { useState } from 'react';
import { SocialPanel } from '../components/Equipes/SocialPanel';
import { TeamSlot } from '../components/Equipes/TeamSlot';
import { ModeCard } from '../components/Equipes/ModeCard';
import { ChatPanel } from '../components/Equipes/ChatPanel';
import { MOCK_MY_TEAM, MOCK_GUILD_MEMBERS, MOCK_CLANS } from '../data/teamMocks';
import type { TeamMember } from '../data/teamMocks';
import { MessageCircle, Menu, X, ChevronDown, Shield, Crown, Users, LogOut, Settings, Search, Plus, Radio } from 'lucide-react';

interface TeamProps {
    onBack?: () => void;
}

export const Team: React.FC<TeamProps> = () => {

    // Estados dos painéis (Drawer logic)
    const [showSocialPanel, setShowSocialPanel] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showModeMenu, setShowModeMenu] = useState(false);

    // Estado da equipe: usando MOCK_MY_TEAM atualizado
    const [myTeam, setMyTeam] = useState<TeamMember[]>(MOCK_MY_TEAM);

    // Guild State
    const [isInGuild, setIsInGuild] = useState(true);

    const handleLeaveGuild = () => {
        if (window.confirm("CONFIRMAÇÃO DE SAÍDA: Ao deixar a guilda, você perderá pontos de contribuição acumulados. Deseja prosseguir?")) {
            setIsInGuild(false);
        }
    };

    const handleJoinGuild = (guildName: string) => {
        // Mock join
        console.log(`Joined ${guildName}`);
        setIsInGuild(true);
    };



    const teamReadyCount = myTeam.filter((m) => m.player?.ready).length;
    const isTeamReady = teamReadyCount >= 2;

    const handleInvite = (slot: number) => {
        console.log('Abrir modal de convite para slot:', slot);
    };

    const handleKick = (slot: number) => {
        console.log('Remover jogador do slot:', slot);
        setMyTeam((prev) =>
            prev.map((member) => (member.slot === slot ? { ...member, player: null } : member))
        );
        console.log(`Expulsar do slot ${slot}`);
        // Logica de kick aqui
    };

    const handleBattle = () => {
        console.log("Iniciando batalha...");
    };



    return (
        <div className="h-full w-full bg-transparent text-gray-200 flex overflow-hidden relative font-sans">
            {/* Ambient Overlay */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* --- PAINEL SOCIAL (ESQUERDA - DRAWER) --- */}
            <div className={`absolute top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out flex ${showSocialPanel ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Painel Content */}
                <div className="h-full relative flex">
                    <SocialPanel />
                </div>
                {/* Exclusive Side Strip for Close Button */}
                <div className="w-12 h-full flex items-start justify-center pt-2">
                    <button
                        onClick={() => setShowSocialPanel(false)}
                        className="p-2 text-white/50 hover:text-white bg-black/50 hover:bg-red-500/80 rounded-lg backdrop-blur-sm border border-white/10 transition-all shadow-lg"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* --- CONTEÚDO CENTRAL --- */}
            <div className="flex-1 overflow-y-auto px-6 pt-0 relative z-10 w-full h-full flex flex-col items-center">

                {/* HEADER (Sticky/Relative) */}
                <div className="w-full mt-6 mb-8 flex items-center justify-between border-b-2 border-white/5 pb-4 relative z-[60]">

                    {/* Left Side: Menu + Title */}
                    <div className="flex items-center gap-6">
                        {/* Botão Menu Switch (Menu / X) */}
                        <button
                            onClick={() => setShowSocialPanel(!showSocialPanel)}
                            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all rounded-lg active:scale-95 z-[70]"
                        >
                            {showSocialPanel ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
                        </button>

                        {/* Título: ESQUADRÃO (Grande/Branco) */}
                        <div className="flex items-center">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                                ESQUADRÃO
                            </h2>
                        </div>
                    </div>

                    {/* Right Side: Chat */}
                    <button
                        onClick={() => setShowChat(true)}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                        title="Abrir Chat de Equipe"
                    >
                        <MessageCircle size={24} className={showChat ? "text-white" : ""} />
                    </button>
                </div>



                {/* SLOTS (Compactos) */}
                <div className="flex justify-center w-full mb-auto z-10 pointer-events-none"> {/* pointer-events-none wrapper to let clicks pass if needed, but inner div needs auto */}
                    <div className="grid grid-cols-4 gap-4 w-full max-w-4xl pointer-events-auto">
                        {myTeam.map((member) => (
                            <div key={member.slot} className="w-full aspect-[3/4] transform hover:scale-[1.02] transition-transform duration-300">
                                <TeamSlot
                                    slot={member.slot}
                                    player={member.player}
                                    onInvite={() => handleInvite(member.slot)}
                                    onKick={() => handleKick(member.slot)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* GUILDA BANNER (Conditional: In Guild vs No Guild) */}
                <div className="w-full max-w-5xl mt-12 mb-8 relative z-10 font-sans">

                    {isInGuild ? (
                        /* --- VIEW: IN GUILD --- */
                        <div className="relative overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-md rounded-t-3xl p-8 group transition-all animate-in fade-in slide-in-from-bottom-4">
                            {/* Top Bar Label */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-600/20 px-6 py-1 rounded-b-lg border-b border-yellow-600/30">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">Central da Guilda</span>
                            </div>

                            {/* Top Section: Overview */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4 border-b border-white/5 pb-6">
                                {/* Left: Identity */}
                                <div className="flex items-center gap-6">
                                    <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-500/30 rounded-2xl flex items-center justify-center text-yellow-600 shadow-2xl group-hover:border-yellow-500/50 transition-colors">
                                        <Crown size={48} className="drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                                        <div className="absolute -bottom-3 px-3 py-1 bg-black border border-yellow-500/30 rounded-full text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                                            LVL 5
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg leading-none">
                                            ALPHA LEGION
                                        </h2>
                                        <p className="text-sm font-mono text-white/40 uppercase tracking-widest mt-1">
                                            [ALP] • Domínio: <span className="text-green-500">Setor 7</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Center: Stats */}
                                <div className="flex items-center gap-8 border-x border-white/5 px-8 h-16">
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Membros</p>
                                        <p className="text-2xl font-mono text-white">{MOCK_GUILD_MEMBERS.length}<span className="text-xs text-gray-600">/50</span></p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Reputação</p>
                                        <p className="text-2xl font-mono text-yellow-500">9.8k</p>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-3">
                                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-white/50 transition-all" title="Configurações">
                                        <Settings size={18} />
                                    </button>
                                    <button
                                        onClick={handleLeaveGuild}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-400 text-red-500/50 transition-all"
                                        title="Sair da Guilda"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                    <button className="px-6 py-3 bg-yellow-600/10 border border-yellow-600/30 hover:bg-yellow-600 hover:text-white transition-all text-xs font-bold text-yellow-500 uppercase tracking-widest ml-2">
                                        QG da Guilda
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Section: Members List (Detailed) */}
                            <div className="mt-6">
                                <h3 className="text-xs font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={12} />
                                    Membros Ativos
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {MOCK_GUILD_MEMBERS.slice(0, 9).map((member) => (
                                        <div key={member.id} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 transition-colors group/member">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden relative">
                                                {/* Placeholder Avatar */}
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-white/20">
                                                    {member.nome.substring(0, 2).toUpperCase()}
                                                </div>
                                                {/* Status Dot */}
                                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${member.status === 'online' ? 'bg-green-500' :
                                                    member.status === 'in-game' ? 'bg-blue-500' : 'bg-gray-500'
                                                    }`}></div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-white truncate group-hover/member:text-yellow-400 transition-colors">
                                                        {member.nome}
                                                    </h4>
                                                    {member.role === 'Líder' && <Crown size={12} className="text-yellow-500" />}
                                                    {member.role === 'Vice-Líder' && <Shield size={12} className="text-gray-400" />}
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] uppercase tracking-wide mt-0.5">
                                                    <span className={`font-bold ${member.role === 'Líder' ? 'text-yellow-600' :
                                                        member.role === 'Vice-Líder' || member.role === 'Oficial' ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                        {member.role}
                                                    </span>
                                                    <span className="text-white/20">
                                                        CP: {member.contribution.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- VIEW: NO GUILD (FREELANCER) --- */
                        <div className="relative overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-md rounded-t-3xl p-8 group transition-all animate-in fade-in slide-in-from-bottom-4">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 p-3 text-white/5">
                                <Radio size={128} className="opacity-20 animate-pulse" />
                            </div>

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Sem Vínculo</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter w-full">
                                            AGENTE LIVRE
                                        </h2>
                                        <p className="text-sm text-gray-400 mt-2 max-w-lg">
                                            Você não está afiliado a nenhuma facção. Mercenários não recebem bônus de território, mas podem aceitar contratos independentes. Junte-se a uma guilda para desbloquear conquistas de domínio.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleJoinGuild("Nova Guilda")}
                                            className="px-6 py-3 bg-[#111] border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Criar Guilda
                                        </button>
                                        <button className="px-6 py-3 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                            <Search size={14} />
                                            Buscar
                                        </button>
                                    </div>
                                </div>

                                {/* Suggested Guilds List */}
                                <div className="mt-8">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">
                                        RECOMENDAÇÕES DE RECRUTAMENTO
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {MOCK_CLANS.slice(0, 4).map((clan) => (
                                            <div key={clan.id} className="group/card relative bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 p-4 transition-all overflow-hidden cursor-pointer" onClick={() => handleJoinGuild(clan.nome)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-3xl filter grayscale group-hover/card:grayscale-0 transition-all">{clan.emblema}</span>
                                                        <div>
                                                            <h4 className="font-bold text-white group-hover/card:text-yellow-400 transition-colors uppercase">{clan.nome}</h4>
                                                            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                                                                <span className="text-white/30">[{clan.tag}]</span>
                                                                <span>LVL {clan.nivel}</span>
                                                                <span className="flex items-center gap-1"><Users size={10} /> {clan.membrosOnline}/{clan.totalMembros}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover/card:opacity-100 transform translate-x-4 group-hover/card:translate-x-0 transition-all">
                                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest border border-yellow-500/30 px-3 py-1 rounded-sm">Juntar-se</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CHAT PANEL (DIREITA - DRAWER) --- */}
            <div className={`absolute top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out flex ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Exclusive Side Strip for Close Button */}
                <div className="w-12 h-full flex items-start justify-center pt-2">
                    <button
                        onClick={() => setShowChat(false)}
                        className="p-2 text-white/50 hover:text-white bg-black/50 hover:bg-red-500/80 rounded-lg backdrop-blur-sm border border-white/10 transition-all shadow-lg"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Painel Content */}
                <div className="h-full relative flex">
                    <ChatPanel onClose={() => setShowChat(false)} />
                </div>
            </div>

        </div>
    );
};
