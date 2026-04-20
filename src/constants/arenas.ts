export interface SpecialOffer {
    id: string; // Card ID reference or unique offer ID
    cardId: string;
    cost: number;
    currency: 'gems' | 'money';
    title: string;
    description: string;
}

export interface ArenaConfig {
    id: number;
    name: string;
    file: string;
    variants: number;
    trophies: number;
    unlockedRarities: string[]; // Rarity names
    poolIds: string[]; // IDs of cards to show in UI (Highlights)
    offers: SpecialOffer[]; // Shop Offers
    motivationalPhrase: string;
}

export const ARENAS: ArenaConfig[] = [
    {
        id: 1,
        name: "Dojo de Treino",
        file: "arena1",
        variants: 1,
        trophies: 0,
        unlockedRarities: ['Recruta', 'Soldado', 'Paladino'],
        poolIds: ['160', '174', '189', '172', '173'], // Capitão, Mestre Kami, Asa Noturna, Kuririn, Tenshinhan
        offers: [],
        motivationalPhrase: "O treinamento é a chave da mestria!"
    },
    {
        id: 2,
        name: "Beco de Gotham",
        file: "arena2",
        variants: 1,
        trophies: 300,
        unlockedRarities: ['Gladiador', 'Efeito'],
        poolIds: ['133', '131', '132', '144', '145'], // Goten, Zoro, Trunks, Homem Formiga, Vespa
        offers: [
            { id: 'offer-a2-1', cardId: '1040', cost: 10, currency: 'money', title: 'O Cavaleiro das Trevas', description: 'Batman Zeta 1' },
            { id: 'offer-a2-2', cardId: '136', cost: 500, currency: 'gems', title: 'Karma', description: 'Boruto Uzumaki.' },
            { id: 'offer-a2-3', cardId: '139', cost: 2000, currency: 'money', title: 'Amigão da Vizinhança', description: 'Homem-Aranha.' }
        ],
        motivationalPhrase: "A noite é mais escura antes do amanhecer!"
    },
    {
        id: 3,
        name: "Vila Oculta",
        file: "arena3",
        variants: 1,
        trophies: 600,
        unlockedRarities: ['Veterano', 'Efeito'],
        poolIds: ['111', '126', '127', '128', '129'], // Gaara, Homem de Ferro, Pantera Negra, Wolverine, Venom
        offers: [
            { id: 'offer-a3-1', cardId: '113', cost: 15, currency: 'money', title: 'Ninja Copiador', description: 'Kakashi Hatake' },
            { id: 'offer-a3-2', cardId: '112', cost: 800, currency: 'gems', title: 'Sannin Lendário', description: 'Orochimaru.' },
            { id: 'offer-a3-3', cardId: '98', cost: 3500, currency: 'money', title: 'Gênio Uchiha', description: 'Itachi Uchiha.' }
        ],
        motivationalPhrase: "Acredite! Seu caminho ninja começa agora!"
    },
    {
        id: 4,
        name: "Mar do Pirata",
        file: "arena4",
        variants: 1,
        trophies: 1000,
        unlockedRarities: ['Elite', 'Efeito'],
        poolIds: ['61', '62', '95', '94', '93'], // A17, A18, Ravena, Loki, Hela
        offers: [
            { id: 'offer-a4-1', cardId: '96', cost: 20, currency: 'money', title: 'Líder Mutante', description: 'Professor X.' },
            { id: 'offer-a4-2', cardId: '97', cost: 1000, currency: 'gems', title: 'Fantasma de Esparta', description: 'Kratos.' },
            { id: 'offer-a4-3', cardId: '86', cost: 5000, currency: 'money', title: 'Guerreiro da Libertação', description: 'Luffy Gear 5.' }
        ],
        motivationalPhrase: "Rumo ao One Piece! O rei dos piratas espera!"
    },
    {
        id: 5,
        name: "Cidade Tech",
        file: "arena5",
        variants: 1,
        trophies: 1400,
        unlockedRarities: ['Elite', 'Efeito'],
        poolIds: ['59', '60', '92', '91', '90'], // Goku Black, Piccolo Orange, Visão, Sinestro, Lanterna Verde
        offers: [
            { id: 'offer-a5-1', cardId: '76', cost: 25, currency: 'money', title: 'Sétimo Hokage', description: 'Naruto Uzumaki.' },
            { id: 'offer-a5-2', cardId: '77', cost: 1200, currency: 'gems', title: 'Vingador Uchiha', description: 'Sasuke Uchiha.' },
            { id: 'offer-a5-3', cardId: '47', cost: 8000, currency: 'money', title: 'Mago Supremo', description: 'Dr. Estranho.' }
        ],
        motivationalPhrase: "Tecnologia e poder em harmonia!"
    },
    {
        id: 6,
        name: "Invasão Alien",
        file: "arena6",
        variants: 1,
        trophies: 1800,
        unlockedRarities: ['Titã'],
        poolIds: ['54', '55', '89', '88', '87'], // Zamasu, Moro, Ciborgue, Aquaman, Mulher Maravilha
        offers: [
            { id: 'offer-a6-1', cardId: '58', cost: 30, currency: 'money', title: 'Demônio Rosa', description: 'Majin Boo.' },
            { id: 'offer-a6-2', cardId: '44', cost: 1500, currency: 'gems', title: 'Velocista Escarlate', description: 'Flash.' },
            { id: 'offer-a6-3', cardId: '36', cost: 12000, currency: 'money', title: 'Deus do Trovão', description: 'Thor.' }
        ],
        motivationalPhrase: "Invoque o dragão e mude o destino!"
    },
    {
        id: 7,
        name: "Templo Olimpo",
        file: "arena7",
        variants: 1,
        trophies: 2200,
        unlockedRarities: ['Lendário'],
        poolIds: ['31', '33', '34', '35', '37'], // Jiren, Freeza, Saitama, Gohan Beast, Thanos
        offers: [
            { id: 'offer-a7-1', cardId: '29', cost: 40, currency: 'money', title: 'Poder de Shazam', description: 'Shazam.' },
            { id: 'offer-a7-2', cardId: '26', cost: 2000, currency: 'gems', title: 'Instinto Superior', description: 'Goku.' },
            { id: 'offer-a7-3', cardId: '25', cost: 20000, currency: 'money', title: 'Homem de Aço', description: 'Superman Prime.' }
        ],
        motivationalPhrase: "Torne-se digno do poder dos deuses!"
    },
    {
        id: 8,
        name: "Terra Devastada",
        file: "arena8",
        variants: 1,
        trophies: 2600,
        unlockedRarities: ['Destruidor'],
        poolIds: ['10', '13', '15', '18', '20'], // Galactus, Odin, Jean Grey, Sentry, Apocalypse
        offers: [
            { id: 'offer-a8-1', cardId: '19', cost: 50, currency: 'money', title: 'Incrível Hulk', description: 'Hulk Esmaga!' },
            { id: 'offer-a8-2', cardId: '17', cost: 3000, currency: 'gems', title: 'Lendário Super Saiyajin', description: 'Broly.' },
            { id: 'offer-a8-3', cardId: '11', cost: 35000, currency: 'money', title: 'Lorde de Apokolips', description: 'Darkseid.' }
        ],
        motivationalPhrase: "Um mundo novo surge das cinzas!"
    },
    {
        id: 9,
        name: "Dimensão Sombria",
        file: "arena9",
        variants: 1,
        trophies: 3000,
        unlockedRarities: ['Zeta', 'Fusão'],
        poolIds: ['53', '1049', '4', '1050', '1053'], // Feiticeira, Manopla, Manhattan, Gotenks, Zamasu Fundido
        offers: [
            { id: 'offer-a9-1', cardId: '1052', cost: 150000, currency: 'money', title: 'Fusão Suprema', description: 'Vegetto.' },
            { id: 'offer-a9-2', cardId: '1033', cost: 5000, currency: 'gems', title: 'Esferas do Dragão', description: '3 Esferas (Kit).' },
            { id: 'offer-a9-3', cardId: '1046', cost: 25000, currency: 'money', title: 'Soul Stone', description: 'Joia da Alma.' }
        ],
        motivationalPhrase: "Encare o abismo e ele olhará de volta!"
    },
    {
        id: 10,
        name: "Verso Cósmico",
        file: "arena10",
        variants: 1,
        trophies: 4000,
        unlockedRarities: ['Supremo'],
        poolIds: ['5', '1039', '1051', '1048', '1047'], // Whis, Esfera 7, Gogeta, Power Stone, Time Stone
        offers: [
            { id: 'offer-a10-1', cardId: '14', cost: 100, currency: 'money', title: 'Rei do Olimpo', description: 'Zeus.' },
            { id: 'offer-a10-2', cardId: '6', cost: 10000, currency: 'gems', title: 'Deus da Destruição', description: 'Beerus.' },
            { id: 'offer-a10-3', cardId: '1040', cost: 150000, currency: 'money', title: 'O Morcego', description: 'Parte do Batman.' }
        ],
        motivationalPhrase: "O cosmos é o seu verdadeiro campo de batalha!"
    }
];
