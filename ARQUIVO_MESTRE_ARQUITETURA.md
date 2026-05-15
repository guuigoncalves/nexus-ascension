# ARQUIVO MESTRE DE ARQUITETURA — JC CARD WARS
**Versão:** 1.1 | **Gerado por:** Claude (claude.ai) | **Data:** 09/03/2026
**Leitura obrigatória antes de qualquer modificação no projeto.**

---

## ⚠️ REGRAS ABSOLUTAS (NUNCA VIOLAR)

| # | Regra |
|---|-------|
| R1 | NUNCA usar nome da carta como identificador. SEMPRE usar o ID numérico (`card.id`). |
| R2 | NUNCA hardcodar ATK/DEF. Todo valor vem de `src/data/cards.ts` → `initialCards`. O CSV é referência de design, mas a **fonte de verdade em runtime é `cards.ts`**. Para buscar: `useCards().getCard(id)` ou `initialCards.find(c => c.id === id)`. |
| R3 | NUNCA criar habilidades para cartas marcadas como "Carta não criada ainda" no CSV/cards.ts. |
| R4 | NUNCA implementar habilidades diretamente na Arena sem antes testar no TestLab. |
| R5 | NUNCA acessar a Firebase Management API (cota 333% excedida). Desenvolvimento 100% local. |
| R6 | SEMPRE usar spread operator para mutações de estado React. Nunca mutar objetos diretamente. |
| R7 | NUNCA implementar mais de 5–8 cartas por lote. |
| R8 | PROIBIDO cartas repetidas no deck. Apenas 1 cópia de cada carta por deck. |
| R9 | NUNCA abrir Windsurf + Cursor simultaneamente (máquina com 8GB RAM — trava). |
| R10 | Toda edição deve ser cirúrgica (str_replace). Nunca reescrever arquivos inteiros para mudar 1 linha. |

---

## 1. AMBIENTE E STACK

| Campo | Valor |
|-------|-------|
| **Máquina** | Dell OptiPlex 3060, 8GB RAM, Zorin OS |
| **Pasta do projeto** | `~/Documentos/Projetos IDEs/jc-card-wars` |
| **Servidor dev** | `http://localhost:5173/` (Vite) |
| **Deploy** | Vercel (`.vercel/project.json` presente) |
| **Node** | v20.20.0 |
| **npm** | 10.8.2 |

### Stack real (package.json confirmado)
- React **19.2.0**
- Vite **7.2.4**
- TypeScript **5.9.3**
- Tailwind CSS **4.1.17**
- Firebase **12.6.0**
- framer-motion 12.29.2
- react-router-dom 7.9.6
- lucide-react 0.555.0
- express 5.2.1 + cors + multer (`server.cjs`)

---

## 2. MAPA DE ARQUIVOS — ONDE ESTÁ CADA COISA

### Raiz do projeto
```
CARDS_MASTER_LIST.md        → Lista mestre de cartas do jogo
HISTORY.md                  → Registro oficial de cartas validadas (atualizar após cada aprovação)
CHANGELOG.md                → Histórico de mudanças
cartas jc cw oficial.csv    → FONTE DE VERDADE de todas as cartas (ATK, DEF, habilidade, raridade)
cartas jc cw oficial.pdf    → Versão PDF do banco de cartas
spreadsheet_data.json       → Dados da planilha de cartas
server.cjs                  → Servidor Express local (upload de imagens manual)
tsc_errors.txt              → Erros TypeScript pendentes (consultar antes de fazer build)
ARQUIVO_MESTRE_ARQUITETURA.md → ESTE ARQUIVO
```

### src/utils/ — Motor de lógica
```
AbilityEngine.ts    → SpecialAbilitiesRegistry (mapa ID→função) + parseAbilityToEffects()
                      Prioridade 1: Registry por ID. Prioridade 2: fallback por keywords.
                      Se ID não está no registry → botão HB desabilitado (cinza). NUNCA inventar lógica.

AbilityParser.ts    → Parser auxiliar de habilidades
cardUtils.ts        → getSacrificeCost() e utilitários de carta
cardGenerator.ts    → Geração de cartas
deckValidator.ts    → Validação de deck (regra: 1 cópia por carta)
gachaLogic.ts       → Lógica de pacotes/gacha
```

### src/contexts/ — Estado global
```
BattleContext.tsx   → Estado central do jogo (campo, mão, HP, turnos, efeitos, chain, targetSelection)
                      CUIDADO: arquivo longo (~1500 linhas). Editar com str_replace cirúrgico.
                      HP inicial: playerHealth/opponentHealth = 8000 (⚠️ Relatório Mestre diz 10.000 — divergência a resolver)
                      Boards: playerBoard / opponentBoard = Array(12).fill(null)
                      DivineSlots: divineSlots.player / divineSlots.opponent = [null, null]

AuthContext.tsx     → Autenticação Firebase
CardContext.tsx     → Carregamento e acesso às cartas. Fonte: initialCards de src/data/cards.ts.
                      Suporta modo DEV (com overrides localStorage) e PROD (dados puros).
                      Hook: useCards() → { cards, getCard(id), updateCard(id, updates), mode }
GameContext.tsx     → Estado global do jogo (deck selecionado, progressão)
```

### src/pages/ — Páginas principais
```
TestLab.tsx         → AMBIENTE DE DESENVOLVIMENTO. Drag livre, botão [X], setup rápido, log detalhado.
                      Usar para testar TODA habilidade antes da Arena.
                      Boards: 10 slots (2 fileiras de 5). HP: 8000 por padrão.
                      Tem: forceTargetSelect(), nextTurn(), handleCardDeath(), graveyard visual.
                      CUIDADO: arquivo muito longo (~2500 linhas). Editar sempre com str_replace.

Battle.tsx          → Arena real. 6 slots fixos por lado. HP real. Timer de fases. Sem botão [X].
Battle/             → Componentes da arena (BattleBoard, BattleSlot, Hand, UnitCard, etc.)

Home.tsx            → Tela inicial
Gallery.tsx         → Galeria de cartas
Deck.tsx            → Construtor de deck
Shop.tsx            → Loja (10% implementada)
Arenas.tsx          → Seleção de arenas
TestLab.tsx         → Laboratório de desenvolvimento
Login.tsx           → Autenticação
CardEditor.tsx      → Editor de cartas
```

### src/components/ — Componentes reutilizáveis
```
CardComponent.tsx       → Renderização padrão de carta
CardVisual.tsx          → Visual da carta (borda por raridade, glassmorphism)
CardDetailModal.tsx     → Modal de detalhes da carta
Battle/BattleBoard.tsx  → Tabuleiro de batalha
Battle/Hand.tsx         → Mão do jogador
Battle/UnitCard.tsx     → Carta no campo de batalha
Battle/DivineSlot.tsx   → Slot para cartas Supremas
Battle/GraveyardModal.tsx → Modal do cemitério
Battle/SacrificeOverlay.tsx → UI de seleção de sacrifício
Battle/SearchOverlay.tsx    → Busca de cartas
Equipes/                → Componentes de equipes/social (não iniciado)
```

### src/constants/
```
arenas.ts       → ARENAS[]: 10 arenas configuradas (id, name, trophies, unlockedRarities, poolIds, offers)
rarityColors.ts → Mapeamento raridade → cor (para bordas glassmorphism)
tutorials.ts    → Dados do tutorial
```

### src/types/index.ts — Tipos canônicos
```typescript
// Tipos principais confirmados:
Universe    → 'Marvel' | 'DC' | 'Dragon Ball' | 'Naruto' | 'One Piece' | 'Outros' | ...
Rarity      → 'Supremo' | 'Destruidor' | 'Lendário' | 'Titã' | 'Elite' | 'Veterano' |
              'Gladiador' | 'Paladino' | 'Soldado' | 'Recruta' | 'Efeito' | 'Zeta' | 'Fusão'
EffectTrigger → 'onPlay' | 'onAttack' | 'onDeath' | 'passive' | 'onActivate'
EffectType    → 'buffAtk' | 'buffDef' | 'damage' | 'heal' | 'draw' | 'summon' | 'revealHand' |
                'skipTurn' | 'skipBattlePhase' | 'healHero' | 'search' | 'invertStats' |
                'copyAtk' | 'destroy' | 'banish' | 'returnToHand' | 'discard' |
                'buffAtkScaling' | 'silence' | 'mindControl'

CardEffect { trigger, type, value, target?, description?, scalingFactor?, condition?,
             duration?, operation?, requiresTarget? }

Card { id, name, universe, rarity, atk?, def?, image, description?, ability?, effects?, cost? }
```

### src/services/
```
firebase.ts     → Configuração Firebase. NÃO usar Firebase Management API.
```

### src/hooks/
```
useLocalStorage.ts  → Hook para localStorage
usePacks.ts         → Lógica de pacotes/gacha
```

### src/data/
```
cards.ts            → FONTE DE VERDADE EM RUNTIME. Array estático `initialCards` com todas as
                      cartas do jogo (ATK, DEF, description, effects, image path).
                      ⚠️ Não é parse de CSV — dados são hardcoded aqui. CSV é só referência de design.
                      Inclui tokens especiais: TOK_SHENLONG, TOK_BATMAN_Z.
image_index.json    → Índice de imagens disponíveis
teamMocks.ts        → Dados mock para equipes
```

### public/
```
cards/              → Imagens das cartas. Nomenclatura OBRIGATÓRIA: {ID}.png (ex: 25.png)
oficial/            → 166 imagens PNG confirmadas (1.png … 166.png)
dev_cards/          → Cartas em desenvolvimento
arenas/             → Backgrounds das 10 arenas (arena1_bg.jpg … arena10_bg.jpg)
Audio temas/        → 24 músicas .m4a (Dragon Ball, Naruto, One Piece, Marvel, DC)
avatars/            → Avatares de perfil
```

---

## 3. ARQUITETURA DO MOTOR DE HABILIDADES

### Fluxo de execução de habilidade (BattleContext.tsx)
```
activateAbility(cardId)
  → busca unit no playerBoard ou divineSlots.player
  → verifica isSilenced e unitsUsedAbilityThisTurn
  → busca efeito 'onActivate' nos unit.effects
  → se não encontrar, chama parseAbilityToEffects(unit.description, unit.card.id)
  → decide: needsTarget? → executeEffect(effect, unit) → abre targetSelectionMode
  → isAggressive? → startChain(() => executeEffect(...)) : executeEffect(...)
```

### Fluxo no TestLab.tsx (diferente da Arena)
```
Clique na carta → cardPopup ativado → botão USAR EFEITO visível
  → executeEffect(targetBoard, targetIndex, source)
  → cada ID tem seu bloco if/switch isolado
  → IDs que precisam de alvo: setEffectMode({ sourceId, sourceBoard, type })
  → forceTargetSelect(originId, callback) → efetua callback com targetId
```

### SpecialAbilitiesRegistry (AbilityEngine.ts) — IDs mapeados
IDs atualmente no registry: `1, 3, 4, 11, 13, 14, 15, 17, 18, 161, 162, 189, 190, 191, 192, 211, 212, 213, 214`

IDs implementados APENAS no TestLab (não no BattleContext ainda):
`131, 132, 133, 136, 137, 138, 139, 144, 145, 146, 159, 160, 163, 164, 165, 193, 194, 195`

---

## 4. PADRÕES OBRIGATÓRIOS DE IMPLEMENTAÇÃO

### Estado React — spread operator sempre
```typescript
// ✅ CORRETO
setCards(prev => prev.map(c => c.id === id ? { ...c, atk: c.atk + 500 } : c))
setState(prev => ({ ...prev, playerHealth: prev.playerHealth - 500 }))

// ❌ ERRADO — React não detecta, tela não atualiza
card.atk += 500
state.playerHealth -= 500
```

### Efeitos temporários
```typescript
// Usar effectTurns no TestUnit / effectTurns no BattleContext
// nextTurn() no TestLab decrementa effectTurns de todos os units
// Quando effectTurns === 0: reverter para originalAttack / originalHealth
// Salvar original ANTES de aplicar buff:
unit.originalAttack = unit.currentAttack  // antes de dobrar/triplicar
unit.originalHealth = unit.currentHealth  // antes de buff de DEF
```

### Cleanup ao remover carta
```typescript
// TestLab: handleCardDeath(boardType, index, source) — handler universal
// Limpa: tokens vinculados, controle mental (Darkseid), buffs de área
// Adiciona ao cemitério antes de remover do board
// Dispara passivas de aliados (Broly +1000 ATK ao aliado morrer)
```

### isReady (Glow Roxo) — habilidades reativas
```typescript
unit.isReady = true        // ativa glow roxo na carta
unit.statusEffect = 'guard' | 'ant_man_dodge' | ...
// Gatilho: verificado em executeAttack() antes do combate normal
// Ao disparar: isReady = false (remover imediatamente após uso)
```

### Tipos de habilidade e como implementar
| Tipo | Como implementar |
|------|-----------------|
| AUTO_CAST | Executa direto em `executeEffect()` sem pedir alvo |
| TARGET_SELECT | `setEffectMode()` ou `forceTargetSelect()` → aguarda clique |
| PASSIVE | Verificação em `handleCardDeath()` ou `executeAttack()` |
| REACTIVE (isReady) | `unit.isReady = true` → verificado no início de `executeAttack()` |
| MULTI_ATTACK | `unit.maxAttacks = N` → `executeAttack()` mantém attackMode ativo se `maxAttacks > 0` |

---

## 5. DIFERENÇAS TESTLAB vs ARENA

| Característica | TestLab | Arena (Battle.tsx) |
|----------------|---------|-------------------|
| Slots | 10 (2x5) dinâmicos | 12 fixos (6 por lado) |
| Botão [X] | ✅ Sim (cada carta) | ❌ Não existe |
| Drag & Drop | ✅ Livre (P1 ↔ P2 ↔ mão) | ❌ Apenas invocação |
| HP | 8000 (estado local) | 8000 (BattleContext) |
| Timer | ❌ Não tem | ✅ 30s fases |
| Log | Detalhado com timestamps | Simplificado |
| Botão [RESET] | ✅ Sim | ❌ Não existe |
| Setup rápido | ✅ SETUP GLADIADOR, ROTAÇÃO LAB | ❌ Não tem |
| Cemitério visual | ✅ Modal completo com seletor | Parcial |
| Propósito | Implementar e testar habilidades | Jogar partida real |

---

## 6. WORKFLOW OBRIGATÓRIO DE DESENVOLVIMENTO

```
1. Implementar função no SpecialAbilitiesRegistry (AbilityEngine.ts)
   OU bloco if/case em TestLab.tsx → executeEffect()

2. Testar no TestLab:
   - Usar SETUP GLADIADOR ou spawn manual via busca
   - Clicar na carta → botão USAR EFEITO
   - Verificar log de eventos (timestamps)

3. Testar cenários de borda:
   - RANDOM (fill arena) → múltiplos inimigos
   - ⏳ TURNO → testar expiração e cleanup
   - [X] → testar cleanup manual (efeitos vinculados removidos?)
   - Repetir 3–5x

4. Se passar → marcar ✅ OK no HISTORY.md
   Formato: | ID | Nome | Data | Mecânica |

5. Arena → jogar partida real para validar balanceamento
   SOMENTE após aprovação no TestLab
```

---

## 7. SISTEMA DE COMBATE (CÂNONE)

```
ATK atacante > DEF defensor  → Defensor destruído. Excesso vira dano direto ao oponente (trample).
ATK atacante < DEF defensor  → Atacante destruído. Defensor perde DEF = ATK recebido (dano persistente).
ATK atacante = DEF defensor  → Empate. Ninguém sofre dano (implementação atual no BattleContext).

⚠️ BUG CONFIRMADO (B4): Em alguns casos com efeitos ativos, atacante morre mesmo com ATK > DEF.
   Fix pendente em resolveAttack() / executeAttack() no BattleContext.
```

### Regras especiais de combate
- Cartas **Efeito/Zeta** são intangíveis — não podem ser atacadas
- Cartas **Supremas** só podem ser atacadas por outras Supremas
- Cartas com `isReady = true` têm lógica reativa verificada ANTES do combate normal
- Stun (`isStunned = true`): carta não pode atacar nem usar HB; ações bloqueadas

---

## 8. ESTADO DO BATTLECONTEXT — CAMPOS IMPORTANTES

```typescript
// Boards (12 slots cada)
playerBoard: (Unit | null)[]        // slots 0-11
opponentBoard: (Unit | null)[]      // slots 0-11
divineSlots: { player: (Unit|null)[], opponent: (Unit|null)[] }  // 2 slots cada

// HP
playerHealth: 8000
opponentHealth: 8000

// Turno e Fase
turn: number
phase: 'strategy' | 'battle'
currentPlayer: 'player' | 'opponent'
turnTimer: 30  // segundos, decrementado por useEffect

// Controle de turno
hasPlayedWarriorThisTurn: boolean   // 1 guerreiro por turno
unitsUsedAbilityThisTurn: string[]  // IDs que já usaram HB
cardsPlayedThisTurn: string[]

// Sistema de Chain (resposta)
responseChain: { active, timer, answeringPlayer, pendingAction }

// Seleção de alvo
targetSelectionMode: { active, effect, source, validTargets[] } | null

// Sacrifício
needsSacrifice: { cardId, required } | null
pendingMaintenance: string[]  // IDs de Supremas aguardando manutenção

// Cemitério e banimento
playerGraveyard: Card[]
opponentGraveyard: Card[]
playerBanished: Card[]
opponentBanished: Card[]

// Outros
gameStatus: 'playing' | 'victory' | 'defeat'
isLabMode: boolean
canDrawCard: boolean
opponentHandRevealed: boolean
```

---

## 9. DIVERGÊNCIAS CONHECIDAS (Relatório Mestre v4.1 vs Código Real)

| Campo | Relatório Mestre | Código Real |
|-------|-----------------|-------------|
| HP inicial | 10.000 | 8.000 (BattleContext + TestLab) |
| AbilityEngine path | `src/AbilityEngine.ts` | `src/utils/AbilityEngine.ts` |
| Deploy | Firebase Hosting | **Vercel** |
| Stack React | React 18 | **React 19.2.0** |
| Stack Vite | Vite + TS + Tailwind | Vite **7.2.4** + TS **5.9.3** + Tailwind **4.1.17** |
| Slots Arena | 6 fixos | 12 fixos (expandível até 20) |
| Contextos | BattleContext apenas | AuthContext + BattleContext + **CardContext** + **GameContext** |

---

## 10. BUGS CRÍTICOS ABERTOS

| ID | Carta | Bug | Solução |
|----|-------|-----|---------|
| B1 | Boruto (136) | Seleção de alvo travada | Reimplementar via forceTargetSelect() |
| B2 | Rock Lee (137) | Só 1 ataque acontece (botão some) | `remainingAttacks: 3` — botão ATACAR persiste enquanto > 0 |
| B3 | Mulher Invisível (163) | Nada acontece ao ativar | isReady + gatilho ao aliado ser atacado |
| B4 | Motor de combate | Atacante morre com ATK maior | Fix resolveAttack(): ATK > DEF → só defensor morre |
| B5 | Goten (133) | Bônus ATK no 1º ataque em vez do 2º | Usar attacksThisTurn counter |
| B6 | Homem-Formiga (144) | Glow roxo não some após esquiva | Remover isReady imediatamente pós-esquiva |

---

## 11. CARTAS VALIDADAS (20 CARTAS — 12% DA BASE)

IDs: `11, 13, 18, 131, 139, 159, 160, 161, 162, 189, 190, 191, 192, 193, 194, 211, 212, 213, 214, TOK_SHENLONG`

Consultar `HISTORY.md` para lista completa com datas.

---

## 12. ARSENAL DE IDEs — QUANDO USAR CADA UM

| IDE | Quando usar |
|-----|-------------|
| **Antigravity** | PRINCIPAL. Tarefas rápidas: 1–8 cartas/lote, fixes CSS, componentes isolados |
| **Trae** | Fallback do Antigravity quando cota zerada |
| **Windsurf** | Novas features multi-arquivo (HP, timer, cemitério, condição de vitória) |
| **Cursor** | Refatoração complexa, Firebase, Cloud Functions. Fases futuras. |
| **Roo Code (VS Code)** | Backstop ilimitado (API Key Gemini própria). Sempre disponível. |
| **AI Studio** | Planejamento, geração de prompts, rascunhos. NÃO edita código. |
| **Claude (claude.ai)** | Arquitetura, decisões técnicas, atualização deste arquivo. NÃO edita código. |

**⚠️ NUNCA abrir Windsurf + Cursor simultaneamente. 8GB RAM. Trava o PC.**

---

## 13. CONVENÇÃO DE CHECKPOINTS

```
PONTO [N] - [DD/MM/AAAA] - [descrição curta do que foi concluído]
```
- Número sequencial, nunca se repete
- Registrar no início de cada sessão no HISTORY.md
- Último ponto registrado: **PONTO 0 — 05/03/2026 — Relatório Mestre v4.1 gerado**

---

## 14. O QUE NÃO TOCAR

- `src/data/cards.ts` — editar só para adicionar/corrigir cartas. NUNCA alterar IDs existentes.
- `cartas jc cw oficial.csv` — referência de design, não é mais parsed em runtime
- `HISTORY.md` — apenas adicionar linhas, nunca remover
- `src/types/index.ts` — alterar só se for adicionar novo tipo confirmado
- `public/cards/` — upload apenas manual via server.cjs, nunca via backend automático
- Cartas marcadas como "Carta não criada ainda" no CSV — conteúdo DLC, não implementar

---

_Gerado por Claude (claude.ai) — 09/03/2026 | v1.1 — corrigida fonte de verdade de cartas (CSV → cards.ts)_
_Atualizar após cada sessão de desenvolvimento significativa._
