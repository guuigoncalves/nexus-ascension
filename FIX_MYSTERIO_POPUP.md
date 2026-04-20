# FIX MYSTERIO - INSTRUÇÕES MANUAIS

## Problema
Quando o jogador rejeita o escudo do Mysterio (clica em "Não"), o ataque não está sendo processado normalmente.

## Solução
Substituir o `window.confirm` pelo popup customizado que já foi criado.

## Localização
Arquivo: `src/pages/TestLab.tsx`
Linha: ~765

## Código Atual (REMOVER)
```typescript
const shouldBlock = window.confirm(`Deseja usar o efeito de Mysterio para bloquear este ataque?\n\n[OK] = SIM | [Cancelar] = NÃO`);

if (shouldBlock) {
    // ... todo o código de bloqueio ...
    return;
}
```

## Código Novo (ADICIONAR)
```typescript
// Mostrar popup customizado
setMysterioBlockPopup({
    attacker,
    onConfirm: () => {
        // Consumir 1 contador
        const newDefenderBoard = [...defenderBoardArray];
        const mysterioIndex = newDefenderBoard.findIndex(u => u?.id === mysterioWithCounters.id);
        
        if (mysterioIndex !== -1 && newDefenderBoard[mysterioIndex]) {
            const updatedMysterio = { ...newDefenderBoard[mysterioIndex]! };
            updatedMysterio.illusionCounters! -= 1;
            
            if (updatedMysterio.illusionCounters! <= 0) {
                updatedMysterio.illusionCounters = undefined;
                updatedMysterio.statusText = undefined;
                updatedMysterio.statusEffect = undefined;
                log(`🎭 Mysterio usou sua última Ilusão! Ataque de ${attacker.card.name} bloqueado!`);
            } else {
                updatedMysterio.statusText = `✨ ILUSÃO (${updatedMysterio.illusionCounters})`;
                log(`🎭 Mysterio bloqueou ataque de ${attacker.card.name}! Ilusões restantes: ${updatedMysterio.illusionCounters}`);
            }
            
            newDefenderBoard[mysterioIndex] = updatedMysterio;
            
            if (defenderBoardType === 'player') {
                setPlayerBoard(newDefenderBoard);
                saveHistory(newDefenderBoard, enemyBoard, playerHand);
            } else {
                setEnemyBoard(newDefenderBoard);
                saveHistory(playerBoard, newDefenderBoard, playerHand);
            }
            
            setAttackMode(null);
            setSelectedSlot(null);
            setMysterioBlockPopup(null);
        }
    },
    onCancel: () => {
        // Fechar popup e deixar o ataque continuar normalmente
        setMysterioBlockPopup(null);
        // NÃO fazer return aqui - deixar o código continuar
    }
});
return; // Pausar execução até decisão do popup
```

## Explicação
1. Quando clicar em "Sim" (onConfirm): Bloqueia o ataque e consome 1 contador
2. Quando clicar em "Não" (onCancel): Fecha o popup e o código continua normalmente, processando o ataque

## Resultado Esperado
- Se aceitar: Ataque bloqueado, contador reduz
- Se rejeitar: Ataque processa normalmente (atacante morre se ATK < DEF, defensor perde HP igual ao ATK)
