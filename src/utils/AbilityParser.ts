
export const AbilityParser = {
    parse: (abilityText: string) => {
        // Stub implementation
        console.log("Parsing ability:", abilityText);
        return {
            type: 'generic',
            value: 0
        };
    },
    execute: (ability: any, _gameState: any) => {
        console.log("Executing ability", ability);
        // Stub execution
    }
};
