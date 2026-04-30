# AGENTS.md — NEXUS ASCENSION
**Para uso exclusivo do Codex App e Codex CLI.**
**Leia este arquivo antes de qualquer acao. Confirme leitura no seu primeiro retorno.**

> Nome anterior do projeto: JC Card Wars (JCCW).

---

Voce e o executor do projeto Nexus Ascension. Suas acoes sao guiadas pelas seguintes diretrizes:

1. REFERENCIA OBRIGATORIA: Leia ARQUITETURA.md antes de qualquer alteracao e confirme que entendeu. Se nao encontrar o arquivo, interrompa e avise.

2. IDENTIDADE DE CARTAS: NUNCA usar nome como identificador. SEMPRE o ID numerico como string (card.id). Exemplo: if (card.id === '136'), nunca if (card.name === 'Boruto').

3. VALORES DE CARTAS: NUNCA hardcodar ATK ou DEF. Todo valor vem de src/data/cards.ts → initialCards. Usar: initialCards.find(c => c.id === id) ou useCards().getCard(id).

4. IDs SAO SAGRADOS: NUNCA alterar IDs existentes em cards.ts. NUNCA permitir que o campo id seja editavel no CardEditor.

5. EDICOES CIRURGICAS: Toda modificacao usa str_replace com o trecho exato. NUNCA propor reescrita de arquivo inteiro. BattleContext.tsx (~81KB) e TestLab.tsx (~192KB) sao especialmente criticos — usar /review antes de commit neles.

6. ESTADO REACT: SEMPRE spread operator em mutacoes. Nunca mutar objetos diretamente.
   Correto: setBoard(prev => prev.map(u => u?.id === id ? { ...u, atk: u.atk + 500 } : u))
   Errado: unit.atk += 500

7. ORDEM DE IMPLEMENTACAO: NUNCA implementar habilidade na Arena (Battle.tsx) sem TestLab aprovado primeiro.

8. LOTES: NUNCA mais de 5–8 cartas por lote. Testar cada carta antes de avancar.

9. FIREBASE: NUNCA usar Firebase Management API (cota excedida). Nao inicializar Firebase em arquivos novos.

10. BUGS CONHECIDOS — NAO REPLICAR:
    - localStorage.clear() no corpo de componentes — CORRIGIDO
    - parseAbilityToEffects() sem card.id — Arena inventa efeitos
    - Consumir uso de HB antes de confirmar execucao — CORRIGIDO
    - deck como number[] ou parseInt(c.id) — CORRIGIDO
    - Buffs alterando initialCards diretamente — CORRIGIDO
    - Multiplas flags de estado no onClick disputando prioridade — CORRIGIDO (interactionMode)
    - ReferenceError em runtime que passa no build mas trava React silenciosamente:
      sempre testar no browser apos o build, nao apenas verificar se build passa.

11. TIPOS CANONICOS: Usar apenas EffectType e EffectTrigger de src/types/index.ts.
    Nao usar: complexBuff, stealCard, weakenAll, immunity, condDestroy, halveAndKill.

12. MODELOS DE IA: Arquivos > ~500 linhas precisam de Claude Sonnet no minimo.
    NUNCA usar Gemini Flash em BattleContext.tsx ou TestLab.tsx.

13. BUILD: Apos cada modificacao, confirmar que npm run build passa E testar no browser.

14. LOGS: Nunca editar ou importar: tsc_errors.txt, vite_log.txt, vite_status.txt.

15. IMAGENS: Upload apenas via server.cjs local. Nomenclatura: {ID}.png em public/cards/originais/.

16. TAREFAS COMPLEXAS: Se afetar mais de 3 arquivos ou logica de estado global, avisar antes.

17. SEGURANCA: Nunca remover validacoes de path em server.cjs. Nunca expandir CORS.

18. REVIEW: Usar /review antes de commit em BattleContext.tsx, TestLab.tsx ou AbilityEngine.ts.

19. MOTOR DE COMBATE: Usar sempre src/utils/combatEngine.ts → resolveCombat().
    Ordem obrigatoria no executeAttack:
    1. Interceptadores isReady em aliados (carta 163)
    2. Esquiva isReady do defensor (carta 144)
    3. resolveCombat(atk, def)

20. CARTAS NAO CRIADAS: NUNCA implementar HBs para cartas "Carta nao criada ainda". Sao DLC.

21. ENCODING: PROIBIDO acentos, emojis ou caracteres nao-ASCII em arquivos de dev.
    ASCII puro apenas. Codex corrompe encoding gerando Mojibake que quebra JSX.

22. INTERACAO DE CLIQUES: NUNCA criar multiplas flags concorrentes para controlar cliques.
    SEMPRE usar interactionMode com tipo unico:
    type InteractionMode =
      | { type: 'IDLE' }
      | { type: 'SELECTING_ATTACK_TARGET'; attackerId: string; attackerBoard: string }
      | { type: 'SELECTING_ABILITY_TARGET'; sourceId: string; abilityCallback: (id: string) => void }
    TARGET_SELECT usa setInteractionMode SELECTING_ABILITY_TARGET (nao forceTargetSelect separado).
