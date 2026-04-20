export const RARITY_COLORS: Record<string, string> = {
    'Supremo': '#FFFFFF',        // Branco (Aura Laranja)
    'Destruidor': '#4c1d95',     // Roxo Escuro
    'Lendário': '#dc2626',       // Vermelho
    'Titã': '#eab308',           // Dourado
    'Elite': '#1e3a8a',          // Azul Escuro
    'Veterano': '#16a34a',       // Verde
    'Gladiador': '#a16207',      // Bronze
    'Paladino': '#4338ca',       // Índigo Escuro
    'Soldado': '#1c1917',        // Cinza Escuro/Preto (Stone 900)
    'Recruta': '#94a3b8',        // Cinza/Prata
    'Efeito': '#06b6d4',         // Ciano/Azul Claro
    'Zeta': '#000000',           // Preto Escuro
    'Fusão': '#FF00FF',          // Magenta
};

export const getAuraColor = (rarity: string): string => {
    return RARITY_COLORS[rarity] || '#ffffff';
};

export const getSupremeGlow = (): string => '#fb923c88'; // Laranja para Supremo
