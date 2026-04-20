# AGENTS.md — NEXUS ASCENSION
**Para uso exclusivo do Codex App e Codex CLI.**
**Leia este arquivo antes de qualquer ação. Confirme leitura no seu primeiro retorno.**

> Nome anterior do projeto: JC Card Wars (JCCW).

---

Você é o executor do projeto Nexus Ascension. Suas ações são guiadas pelas seguintes diretrizes:

1. REFERÊNCIA OBRIGATÓRIA: Leia ARQUITETURA.md antes de qualquer alteração e confirme que entendeu. Se não encontrar o arquivo, interrompa e avise.

2. IDENTIDADE DE CARTAS: NUNCA usar nome como identificador. SEMPRE o ID numérico como string (`card.id`). Exemplo: `if (card.id === '136')`, nunca `if (card.name === 'Boruto')`.

3. VALORES DE CARTAS: NUNCA hardcodar ATK ou DEF. Todo valor vem de `src/data/cards.ts → initialCards`. Usar: `initialCards.find(c => c.id === id)` ou `useCards().getCard(id)`.

4. IDs SÃO SAGRADOS: NUNCA alterar IDs existentes em `cards.ts`. NUNCA permitir que o campo `id` seja editável no CardEditor.

5. EDIÇÕES CIRÚRGICAS: Toda modificação usa str_replace com o trecho exato. NUNCA propor reescrita de arquivo inteiro. `BattleContext.tsx` (~81KB) e `TestLab.tsx` (~192KB) são especialmente críticos — usar /review antes de commit neles.

6. ESTADO REACT: SEMPRE spread operator em mutações. Nunca mutar objetos diretamente.
   - ✅ `setBoard(prev => prev.map(u => u?.id === id ? { ...u, atk: u.atk + 500 } : u))`
   - ❌ `unit.atk += 500`

7. ORDEM DE IMPLEMENTAÇÃO: NUNCA implementar habilidade na Arena (Battle.tsx) sem TestLab aprovado primeiro.

8. LOTES: NUNCA mais de 5–8 cartas por lote. Testar cada carta antes de avançar.

9. FIREBASE: NUNCA usar Firebase Management API (cota excedida). Não inicializar Firebase em arquivos novos.

10. BUGS CONHECIDOS — NÃO REPLICAR:
    - `localStorage.clear()` no corpo de componentes → perda de dados (AUD-001)
    - `parseAbilityToEffects()` sem `card.id` → Arena inventa efeitos (AUD-005)
    - Consumir uso de HB antes de confirmar execução (AUD-012)
    - `deck` como `number[]` ou `parseInt(c.id)` → quebra IDs alfanuméricos (AUD-003)

11. TIPOS CANÔNICOS: Usar apenas EffectType e EffectTrigger de `src/types/index.ts`.
    Não usar: `complexBuff`, `stealCard`, `weakenAll`, `immunity`, `condDestroy`, `halveAndKill`.

12. MODELOS DE IA: Arquivos > ~500 linhas precisam de Claude Sonnet no mínimo.
    NUNCA usar Gemini Flash em BattleContext.tsx ou TestLab.tsx — causa regressões.

13. BUILD: Após cada modificação, confirmar que `npm run build` passa sem erros.

14. LOGS: Nunca editar ou importar: `tsc_errors.txt`, `vite_log.txt`, `vite_status.txt` ou qualquer log.

15. IMAGENS: Upload apenas via `server.cjs` local. Nomenclatura: `{ID}.png` em `public/cards/originais/`.

16. TAREFAS COMPLEXAS: Se afetar mais de 3 arquivos ou lógica de estado global, avisar antes e propor abordagem incremental.

17. SEGURANÇA: Nunca remover validações de path em server.cjs. Nunca expandir CORS. Endpoint de upload é local.

18. REVIEW: Usar `/review` antes de commit em BattleContext.tsx, TestLab.tsx ou AbilityEngine.ts.

19. MOTOR DE COMBATE: A partir do Sprint 4, usar sempre `src/utils/combatEngine.ts → resolveCombat()`. Nunca reimplementar ATK vs DEF inline.

20. CARTAS NÃO CRIADAS: NUNCA implementar HBs para cartas marcadas como "Carta não criada ainda". São DLC fora do escopo atual.
