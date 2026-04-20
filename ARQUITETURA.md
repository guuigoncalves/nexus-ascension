# ARQUITETURA — NEXUS ASCENSION
**Versão:** 3.2 | **Data:** 18/04/2026
**Arquivo do repositório. Leitura obrigatória para qualquer IDE antes de modificar o projeto.**
**Confirme leitura no seu primeiro retorno.**

> Nome anterior do projeto: JC Card Wars (JCCW) — preservado para rastreabilidade histórica.

---

## 1. STACK E AMBIENTE

| Campo | Valor |
|-------|-------|
| **Máquina** | Dell OptiPlex 3060, 8GB RAM, Zorin OS |
| **Node** | v20.20.0 / npm 10.8.2 |
| **React** | 19.2.0 |
| **Vite** | 7.2.4 |
| **TypeScript** | 5.9.3 |
| **Tailwind CSS** | 4.1.17 |
| **Firebase** | 12.6.0 (auth + RTDB — Management API PROIBIDA) |
| **framer-motion** | 12.29.2 |
| **react-router-dom** | 7.9.6 |
| **lucide-react** | 0.555.0 |
| **express + cors + multer** | server.cjs |

**Dev:** `http://localhost:5174/` | **Deploy:** Vercel

---

## 2. REGRAS DE OURO (NUNCA VIOLAR)

| # | Regra |
|---|-------|
| R1 | NUNCA usar nome da carta como identificador. SEMPRE ID numérico como string. |
| R2 | NUNCA hardcodar ATK/DEF. Sempre buscar de `initialCards` em `src/data/cards.ts`. |
| R3 | NUNCA criar habilidades para cartas "não criadas ainda". São DLC. |
| R4 | NUNCA implementar na Arena sem testar no TestLab primeiro. |
| R5 | NUNCA usar Firebase Management API (cota excedida). |
| R6 | SEMPRE spread operator em mutações de estado. Nunca mutar diretamente. |
| R7 | NUNCA mais de 5–8 cartas por lote. |
| R8 | Toda edição: str_replace cirúrgico. Nunca reescrever arquivo inteiro. |
| R9 | IDs são sagrados. Nunca alterar IDs em cards.ts. |
| R10 | NUNCA abrir Windsurf + Cursor ao mesmo tempo (8GB RAM). |
| R11 | Arquivos > ~500 linhas precisam de Claude Sonnet no mínimo (nunca Gemini Flash). |

---

## 3. ARQUITETURA MODULAR — DIREÇÃO DO PROJETO

O projeto está sendo refatorado em 3 camadas:

```
Camada 1 — Motor puro (sem React, sem UI)
src/engine/                         ← destino futuro após Sprint 3–4
  combatEngine.ts   → criado no Sprint 4 em src/utils/combatEngine.ts
  abilityEngine.ts  → corrigido no Sprint 3 em src/utils/AbilityEngine.ts

Camada 2 — Estado (React, sem UI)
src/contexts/BattleContext.tsx      → orquestra o motor

Camada 3 — Interface (só renderiza)
src/pages/TestLab.tsx
src/pages/Battle.tsx
```

**Cada HB escrita uma vez → usada igual em Lab e Arena.**
**Troca para personagens originais no futuro = só muda cards.ts.**

---

## 4. MAPA DE ARQUIVOS

### Raiz
```
cartas jc cw oficial.csv    → Referência de design. NÃO é parsed em runtime.
HISTORY.md                  → Registro cartas validadas (⚠️ desatualizado)
CHANGELOG.md                → Histórico de mudanças
tsc_errors.txt              → Erros TypeScript
server.cjs                  → Upload imagens local (⚠️ endpoint inseguro)
ARQUITETURA.md              → Este arquivo
AGENTS.md                   → Regras para Codex App
.gemini_ignore              → Exclusões do Antigravity
```

### src/utils/
```
AbilityEngine.ts    → const SpecialAbilities (registry) + parseAbilityToEffects()
                      ⚠️ IDs 1, 3, 4 stale/errados
                      ⚠️ Fallback heurístico — desabilitado no Sprint 3.3
AbilityParser.ts    → Stub sem uso real
cardUtils.ts        → getSacrificeCost()
combatEngine.ts     → Motor canônico (criado no Sprint 4)
deckValidator.ts    → ⚠️ Valida só tamanho — adicionar unicidade no Sprint 2
gachaLogic.ts       → Lógica de pacotes
```

### src/contexts/
```
BattleContext.tsx   → Estado central (~81.5KB). str_replace SEMPRE.
                      HP: 8000 (canônico)
                      ⚠️ localStorage.clear() linha 130–131 (P0 — corrigir Sprint 1)
                      ⚠️ activateAbility consome uso antes de validar (1769–1773)
                      ⚠️ confirmSacrifice não dispara onPlay (1322–1387)
                      ⚠️ IA usa lógica divergente (611–641)
CardContext.tsx     → useCards() → { cards, getCard(id), updateCard, mode }
GameContext.tsx     → ⚠️ deck é number[] | ⚠️ chaves localStorage sem namespace
```

### src/pages/
```
TestLab.tsx   → AMBIENTE DE DEV (~192.8KB). str_replace SEMPRE.
               ⚠️ Motor divergente (atacante nunca morre)
               ⚠️ executeEffect não filtra por trigger
Battle.tsx    → Arena real. 12 slots. Timer 30s.
Deck.tsx      → ⚠️ parseInt(c.id)
CardEditor.tsx → ⚠️ id editável — deve ser readonly
```

### src/data/
```
cards.ts  → FONTE DE VERDADE. 178 cartas únicas.
            3 blocos effects estruturados (linhas 33, 92, 171).
            IDs alfanuméricos: TOK_BATMAN_Z, TOK_SHENLONG.
            NUNCA alterar IDs existentes.
```

### src/types/index.ts
```typescript
EffectTrigger → 'onPlay'|'onAttack'|'onDeath'|'passive'|'onActivate'
EffectType → 'buffAtk'|'buffDef'|'damage'|'heal'|'draw'|'summon'|'revealHand'|
             'skipTurn'|'skipBattlePhase'|'healHero'|'search'|'invertStats'|
             'copyAtk'|'destroy'|'banish'|'returnToHand'|'discard'|
             'buffAtkScaling'|'silence'|'mindControl'
// NÃO usar: complexBuff, stealCard, weakenAll, immunity, condDestroy, halveAndKill
```

### public/
```
cards/originais/  → {ID}.png (⚠️ doc antiga dizia "cards/oficial" — errado)
arenas/           → arena1_bg.jpg … arena10_bg.jpg
Audio temas/      → 24 músicas .m4a
```

---

## 5. SISTEMA DE COMBATE — CÂNONE

```
ATK > DEF → só defensor morre. Excesso = dano ao HP (trample).
ATK < DEF → só atacante morre. DEF defensor -= ATK recebido.
ATK = DEF → empate. Ninguém morre.
Efeito/Zeta → não podem ser atacadas.
Supremas → só atacadas por outras Supremas.
isStunned → não pode atacar nem usar HB.
```

**Motor canônico:** `src/utils/combatEngine.ts → resolveCombat()` (Sprint 4)
**⚠️ Arena IA e TestLab divergem até Sprint 4.**

---

## 6. PADRÕES OBRIGATÓRIOS

### Spread operator
```typescript
// ✅
setBoard(prev => prev.map(u => u?.id === id ? { ...u, atk: u.atk + 500 } : u))
// ❌
unit.atk += 500
```

### Buscar ATK/DEF
```typescript
// ✅
const card = initialCards.find(c => c.id === '136')
// ❌
const atk = 3000
```

### Efeitos temporários
```typescript
unit.originalAtk = unit.currentAtk  // salvar antes de modificar
unit.effectTurns = 2                 // nextTurn() decrementa
```

### isReady (glow roxo)
```typescript
unit.isReady = true   // ativar
unit.isReady = false  // remover IMEDIATAMENTE após disparar
```

---

## 7. FLUXO DE HABILIDADE

### TestLab
```
Botão USAR EFEITO → executeEffect(targetBoard, targetIndex, source)
  → parseAbilityToEffects(description, id) — com ID
  → effects.forEach (⚠️ sem filtrar trigger)
```

### Arena (após Sprint 3.4)
```
activateAbility(cardId)
  → valida silêncio e uso
  → parseAbilityToEffects(unit.description, unit.card.id) ← com ID após fix
  → executa efeito
```

---

## 8. CAMPOS DO MODELO UNIT

### Arena
```typescript
{ id, card, currentHealth, currentAttack, canAttack,
  isFaceDown, isTaunt, isSilenced, counters }
```

### TestLab (estendido)
```typescript
{ ...arena,
  effectTurns, originalAtk, originalHealth,
  isReady, charges, shieldLayers, illusionCounters,
  maxAttacks, remainingAttacks, attacksThisTurn }
```

**⚠️ Ao portar HBs para Arena: verificar se os campos necessários existem.**

---

## 9. IDs NO REGISTRY

```
Mapeados: 1, 3, 4, 11, 13, 14, 15, 17, 18, 161, 162, 189–192, 211–214
⚠️ IDs 1, 3, 4 stale — corrigir no Sprint 3.2

Só no TestLab: 131–133, 136–139, 144–146, 159–160, 163–165, 193–195
```

---

## 10. O QUE NUNCA TOCAR

```
src/data/cards.ts        → Só adicionar. NUNCA alterar IDs existentes.
HISTORY.md               → Só adicionar linhas, nunca remover.
cartas jc cw oficial.csv → Não é parsed em runtime.
tsc_errors.txt / logs    → Nunca editar ou importar.
public/cards/            → Upload via server.cjs apenas.
Cartas "não criadas"     → DLC — não implementar.
CardEditor.tsx campo id  → Deve permanecer readonly.
```

---

## 11. WORKFLOW CORRETO

```
1. Implementar no registry (AbilityEngine.ts) ou bloco em TestLab.tsx
2. Testar no TestLab — log, cenários de borda
3. Aprovado → marcar no HISTORY.md
4. Migrar para Arena após aprovação no TestLab
5. npm run build — deve passar antes de declarar concluído
```

---

_Nexus Ascension (ex-JC Card Wars) — 18/04/2026 | v3.2_
