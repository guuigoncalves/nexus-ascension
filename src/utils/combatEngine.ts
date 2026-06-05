export interface CombatStats {
    attack: number;
    defense: number;
}

export interface CombatResult {
    attackerDies: boolean;
    defenderDies: boolean;
    damageToPlayer: number;
    newDefenderDef: number;
}

export const resolveCombat = (
    attacker: CombatStats | number,
    defender: CombatStats | number,
    defenderOwnerHp: number
): CombatResult => {
    console.log('=== MOTOR CANONICO: RESOLVE COMBAT ===', { attacker, defender });

    const attackerAttack = Math.max(0, typeof attacker === 'number' ? attacker : attacker.attack);
    const defenderDefense = Math.max(0, typeof defender === 'number' ? defender : defender.defense);

    if (attackerAttack > defenderDefense) {
        return {
            attackerDies: false,
            defenderDies: true,
            damageToPlayer: Math.max(0, attackerAttack - defenderDefense),
            newDefenderDef: 0
        };
    }

    if (attackerAttack < defenderDefense) {
        return {
            attackerDies: true,
            defenderDies: false,
            damageToPlayer: 0,
            newDefenderDef: Math.max(0, defenderDefense - attackerAttack)
        };
    }

    return {
        attackerDies: true,
        defenderDies: true,
        damageToPlayer: 0,
        newDefenderDef: 0
    };
};
