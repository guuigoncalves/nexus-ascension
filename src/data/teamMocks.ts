// Mock data for Teams page
export interface Friend {
    id: number;
    nome: string;
    avatar: string;
    online: boolean;
    nivel: number;
    rank: string;
}

export interface Clan {
    id: number;
    tag: string;
    nome: string;
    emblema: string;
    nivel: number;
    membrosOnline: number;
    totalMembros: number;
}

export interface RankingPlayer {
    posicao: number;
    nome: string;
    avatar: string;
    elo: number;
}

export interface Invite {
    id: number;
    remetente: {
        nome: string;
        avatar: string;
    };
    modo: string;
    tempo: string;
}

export interface Match {
    id: number;
    resultado: 'vitoria' | 'derrota';
    modo: string;
    arena: string;
    aliado: string;
    oponentes: string[];
    eloChange: number;
    duracao: string;
    tempo: string;
}

export const MOCK_FRIENDS: Friend[] = [
    { id: 1, nome: 'ShadowKakarot#9001', nivel: 42, rank: 'Mestre', online: true, avatar: '/avatars/dark_goku.png' },
    { id: 2, nome: 'PrinceVegeta#666', nivel: 40, rank: 'Diamante', online: true, avatar: '/avatars/dark_vegeta.png' },
    { id: 3, nome: 'LordFrieza#0001', nivel: 38, rank: 'Platina', online: false, avatar: '/avatars/dark_frieza.png' },
    { id: 4, nome: 'CellGames#777', nivel: 35, rank: 'Ouro', online: false, avatar: '/avatars/dark_goku.png' }, // Reusing for diversity
    { id: 5, nome: 'MajinBuu#123', nivel: 30, rank: 'Prata', online: true, avatar: '/avatars/dark_vegeta.png' },
];

export const MOCK_CLANS: Clan[] = [
    { id: 1, tag: "DRK", nome: "Dark Knights", emblema: "🛡️", nivel: 15, membrosOnline: 12, totalMembros: 50 },
    { id: 2, tag: "PHX", nome: "Phoenix Rising", emblema: "🔥", nivel: 12, membrosOnline: 8, totalMembros: 45 },
    { id: 3, tag: "ICE", nome: "Ice Warriors", emblema: "❄️", nivel: 18, membrosOnline: 15, totalMembros: 50 },
    { id: 4, tag: "THR", nome: "Thunder Legion", emblema: "⚡", nivel: 10, membrosOnline: 5, totalMembros: 30 },
    { id: 5, tag: "DRG", nome: "Dragon Empire", emblema: "🐉", nivel: 20, membrosOnline: 20, totalMembros: 50 },
];

// Membros da Equipe (Mock)
export interface TeamMember {
    slot: number;
    player: {
        nome: string;
        avatar: string;
        ready: boolean;
        leader?: boolean;
    } | null;
}

export const MOCK_MY_TEAM: TeamMember[] = [
    { slot: 1, player: { nome: 'Você', avatar: '/avatars/dark_goku.png', ready: true, leader: true } },
    { slot: 2, player: { nome: 'PrinceVegeta#666', avatar: '/avatars/dark_vegeta.png', ready: true, leader: false } },
    { slot: 3, player: null }, // Slot vazio
    { slot: 4, player: null }, // Slot vazio
];

export const MOCK_RANKING: RankingPlayer[] = [
    { posicao: 1, nome: "ProPlayer#0001", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top1", elo: 3850 },
    { posicao: 2, nome: "EliteGamer#9999", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top2", elo: 3720 },
    { posicao: 3, nome: "MegaMind#4242", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top3", elo: 3680 },
    { posicao: 4, nome: "TacticalKing#7777", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top4", elo: 3540 },
    { posicao: 5, nome: "StrategyMaster#1111", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top5", elo: 3420 },
    { posicao: 6, nome: "ChessMaster#3333", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top6", elo: 3310 },
    { posicao: 7, nome: "CombatLegend#8888", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top7", elo: 3250 },
    { posicao: 8, nome: "ArenaChamp#2222", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top8", elo: 3180 },
    { posicao: 9, nome: "DuelExpert#6666", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top9", elo: 3120 },
    { posicao: 10, nome: "BattleSage#5555", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=top10", elo: 3050 },
];

export const MOCK_INVITES: Invite[] = [
    {
        id: 1,
        remetente: { nome: "DarkKnight#4521", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1" },
        modo: "2v2 Ranked",
        tempo: "há 5 minutos"
    },
    {
        id: 2,
        remetente: { nome: "FireLord#2341", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3" },
        modo: "2v2 Casual",
        tempo: "há 12 minutos"
    },
];

export const MOCK_LAST_MATCH: Match = {
    id: 1,
    resultado: 'vitoria',
    modo: '2v2 Ranked',
    arena: 'Arena Titã',
    aliado: 'DarkKnight#4521',
    oponentes: ['ShadowMage#7832', 'IceQueen#9876'],
    eloChange: 25,
    duracao: '12:34',
    tempo: 'há 15 minutos'
};

export interface GuildMember {
    id: number;
    nome: string;
    role: string;
    status: 'online' | 'offline' | 'in-game';
    contribution: number;
    avatar: string;
}

export const MOCK_GUILD_MEMBERS: GuildMember[] = [
    { id: 1, nome: 'AlphaLeader', role: 'Líder', status: 'online', contribution: 15400, avatar: '/avatars/dark_goku.png' },
    { id: 2, nome: 'ShadowKakarot', role: 'Oficial', status: 'in-game', contribution: 8900, avatar: '/avatars/dark_frieza.png' },
    { id: 3, nome: 'PrinceVegeta', role: 'Vice-Líder', status: 'online', contribution: 12500, avatar: '/avatars/dark_vegeta.png' },
    { id: 4, nome: 'PiccoloStrategist', role: 'Membro', status: 'offline', contribution: 5600, avatar: '/avatars/luffy.jpg' },
    { id: 5, nome: 'GohanBeast', role: 'Membro', status: 'in-game', contribution: 7200, avatar: '/avatars/naruto.jpg' },
    { id: 6, nome: 'BulmaTech', role: 'Membro', status: 'online', contribution: 4500, avatar: '/avatars/harry.jpg' },
];
