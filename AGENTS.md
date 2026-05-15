# AGENTS.md — NEXUS ASCENSION
**Para uso exclusivo do Codex App e Codex CLI.**
**Leia este arquivo antes de qualquer acao. Confirme leitura no seu primeiro retorno.**
**Data: 09/05/2026**

> Nome anterior: JC Card Wars (JCCW).

---

Voce e o executor do projeto Nexus Ascension. Suas acoes sao guiadas pelas seguintes diretrizes:

1. REFERENCIA OBRIGATORIA: Leia ARQUITETURA.md antes de qualquer alteracao. Se nao encontrar, interrompa e avise.

2. IDENTIDADE DE CARTAS: NUNCA usar nome como identificador. SEMPRE o ID numerico como string (card.id). Correto: if (card.id === '136'). Errado: if (card.name === 'Boruto').

3. VALORES DE CARTAS: NUNCA hardcodar AT ou DF. Todo valor vem de src/data/cards.ts via initialCards. Usar: initialCards.find(c => c.id === id) ou useCards().getCard(id).

4. IDS SAO SAGRADOS: NUNCA alterar IDs existentes em cards.ts. NUNCA permitir que o campo id seja editavel no CardEditor.

5. EDICOES CIRURGICAS: Toda modificacao usa str_replace com o trecho exato. NUNCA reescrever arquivo inteiro. BattleContext.tsx (~81KB) e TestLab.tsx (~200KB) sao criticos — usar /review antes de commit neles.

6. ESTADO REACT: SEMPRE spread operator em mutacoes. Nunca mutar objetos diretamente.
   Correto: setBoard(prev => prev.map(u => u?.id === id ? { ...u, atk: u.atk + 500 } : u))
   Errado: unit.atk += 500

7. ORDEM DE IMPLEMENTACAO: NUNCA implementar habilidade na Arena (Battle.tsx) sem TestLab aprovado primeiro.

8. LOTES: NUNCA mais de 5-8 cartas por lote. Testar cada carta antes de avancar.

9. FIREBASE: NUNCA usar Firebase Management API (cota excedida). Nao inicializar Firebase em arquivos novos.

10. BUGS CONHECIDOS - NAO REPLICAR:
    - localStorage.clear() no corpo de componentes — CORRIGIDO
    - parseAbilityToEffects() sem card.id — Arena inventa efeitos
    - Consumir uso de HB antes de confirmar execucao — CORRIGIDO
    - deck como number[] ou parseInt(c.id) — CORRIGIDO
    - Buffs alterando initialCards diretamente — CORRIGIDO
    - Multiplas flags de estado no onClick — CORRIGIDO (usar interactionMode)
    - ReferenceError em runtime que passa no build — sempre testar no browser
    - opponentBoard mutando incorretamente e duplicando cartas — usar spread operator
    - TARGET_SELECT nao fechando apos callback — sempre chamar setInteractionMode IDLE ao final
    - Escudo de imunidade bloqueando recuo do atacante fraco — atacante deve morrer normalmente mesmo com isImmune no defensor
    - Cooldown de habilidade nao decrementando por turno — sempre decrementar em nextTurn
    - AT extra engatilhando automatico quando deveria ser ativacao manual — verificar tipo da HB

11. TIPOS CANONICOS: Usar apenas EffectType e EffectTrigger de src/types/index.ts.
    Nao usar: complexBuff, stealCard, weakenAll, immunity, condDestroy, halveAndKill.

12. MODELOS DE IA: Arquivos > ~500 linhas precisam de Claude Sonnet no minimo.
    NUNCA usar Gemini 3 Flash em BattleContext.tsx ou TestLab.tsx.

13. BUILD E TESTE: Apos cada modificacao: (1) npm run build deve passar, (2) testar no browser. Build passando nao garante ausencia de erros de runtime. O /goal tem criterio de parada "build verde", nao "funcionalidade correta". Sempre validar no browser apos ciclo autonomo.

14. LOGS: Nunca editar ou importar: tsc_errors.txt, vite_log.txt, vite_status.txt.

15. IMAGENS: Upload apenas via server.cjs local. Nomenclatura: {ID}.png em public/cards/originais/.

16. TAREFAS COMPLEXAS: Se afetar mais de 3 arquivos ou logica de estado global, avisar antes.

17. SEGURANCA: Nunca remover validacoes de path em server.cjs. Nunca expandir CORS.

18. REVIEW: Usar /review antes de commit em BattleContext.tsx, TestLab.tsx ou AbilityEngine.ts.

19. MOTOR DE COMBATE: Usar sempre src/utils/combatEngine.ts via resolveCombat().
    Ordem obrigatoria no executeAttack:
    1. Interceptadores isReady em aliados (carta 163)
    2. Esquiva isReady do defensor (carta 144)
    3. resolveCombat(atk, def)

20. CARTAS NAO CRIADAS: NUNCA implementar HBs para cartas com "Carta nao criada ainda". Sao DLC.

21. ENCODING: PROIBIDO acentos, emojis ou caracteres nao-ASCII em arquivos de dev (TestLab.tsx). ASCII puro apenas.

22. INTERACAO DE CLIQUES: NUNCA criar multiplas flags concorrentes para controlar cliques.
    SEMPRE usar interactionMode:
    type InteractionMode =
      | { type: 'IDLE' }
      | { type: 'SELECTING_ATTACK_TARGET'; attackerId: string; attackerBoard: string }
      | { type: 'SELECTING_ABILITY_TARGET'; sourceId: string; abilityCallback: (id: string) => void }
    Usar setInteractionMode SELECTING_ABILITY_TARGET para TARGET_SELECT.
    Sempre limpar com setInteractionMode({ type: 'IDLE' }) apos o callback.

23. HABILIDADES DE CARTAS: NUNCA inventar ou assumir HBs baseado no nome do personagem.
    O texto oficial esta no GESTAO.md secao 7.
    Se o ID nao estiver no CSV ou tiver "nao criada ainda" — PARAR e avisar.

24. SETUP DINAMICO: NUNCA usar IDs ou nomes hardcoded no botao Setup.
    Sempre usar initialCards.find(c => c.id === 'ID') para buscar dados.

25. TARGET_SELECT - REGRA DE LIMPEZA: Todo callback de SELECTING_ABILITY_TARGET
    DEVE chamar setInteractionMode({ type: 'IDLE' }) ao final.
    Nunca deixar o estado de selecao aberto apos execucao do efeito.

26. TEXTOS DE HB: NUNCA reescrever strings de texto de habilidades durante refatoracoes de UI ou layout.
    Os textos exibidos no jogo devem ser identicos ao texto oficial do GESTAO.md secao 7.
    Se uma refatoracao tocar em strings de HB, sinalizar antes de executar.

27. IMUNIDADE VS RECUO: isImmune protege contra dano direto mas NAO protege o atacante de morrer
    quando seu ATK e menor que a DEF do defensor. O resolveCombat deve sempre processar
    a morte do atacante independente de flags de imunidade no defensor.

28. ATIVACAO MANUAL VS AUTOMATICA: Verificar no texto oficial da HB se o efeito e manual
    (requer clique do jogador a cada turno) ou automatico (dispara sozinho).
    Nao assumir — consultar GESTAO.md secao 7.
