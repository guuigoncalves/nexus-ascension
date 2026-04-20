# GESTÃO — NEXUS ASCENSION
**Versão:** 6.0 | **Data:** 18/04/2026 | **Gerado por:** Claude (Chat de Gestão)
**Documento canônico único. Cole este arquivo para retomar o projeto.**

---

## COMO USAR ESTE CHAT

Você é o **Chat de Gestão** do projeto Nexus Ascension.

**Responsabilidades:**
- Decidir o que fazer e gerar instruções precisas para executores
- Atualizar este documento após cada sessão
- Receber resultados e decidir próximo passo
- **Nunca editar código diretamente**

**Para iniciar sessão:**
1. Abrir novo chat no Claude.ai
2. Colar este arquivo completo
3. Colar relatório do executor se houver
4. Dizer: *"Você é o Chat de Gestão do Nexus Ascension. Confirme que entendeu."*

---

## ESTRUTURA DE FERRAMENTAS

| Papel | Ferramenta | Função |
|-------|-----------|--------|
| **Chat de Gestão** | Claude (claude.ai) | Decide, documenta, gera instruções precisas |
| **Executor principal** | Codex App (OpenAI) | Backend, bugs profundos, multi-arquivo, review de diff |
| **Executor UI/UX** | Antigravity (Google) | Interface, preview visual em tempo real |
| **Executor alternativo** | Cursor | Backend alternativo, BYOK |
| **Backstop** | Kilo Code / Cline | BYOK ilimitado quando tudo esgota |

**Fluxo obrigatório:**
```
1. Claude decide e gera instrução precisa com IDE/modelo definidos
2. Abrir thread no executor correto
3. Primeira mensagem SEMPRE: "Leia o AGENTS.md e o ARQUITETURA.md e confirme."
4. Agente confirma, executa, propõe diff
5. Revisar diff — aprovar ou ajustar
6. Rodar npm run build no terminal
7. Trazer resultado para Claude
8. Claude avalia, atualiza documentos, decide próximo passo
```

**Regras do fluxo:**
- Uma tarefa por thread. Nunca encadear tarefas
- Nunca avançar sem resultado confirmado
- Planning PROIBIDO nas IDEs — sempre Fast/direto
- Verificar se tarefa já foi feita antes de mandar novo comando

---

## 1. IDENTIDADE DO PROJETO

### Nome atual
**Nexus Ascension** (renomeado em 18/04/2026)
**Modo principal de jogo:** Ascension Arena
**Sigla interna:** NA

### Memória histórica
Nome original: **JC Card Wars (JCCW)** — usado durante todo o desenvolvimento inicial até 18/04/2026. Preservado aqui para rastreabilidade histórica, docs antigas e commits anteriores.

### Separação app teste vs jogo original — NUNCA PERDER

| Versão | Personagens | Status | Objetivo |
|--------|------------|--------|---------|
| **App atual (Nexus Ascension Dev)** | Personagens de copyright (Marvel, DC, Dragon Ball, Naruto, One Piece e outros) | Em desenvolvimento ativo | Testar e validar motor de jogo, mecânicas, balanceamento |
| **Jogo original (futuro)** | Personagens originais do livro de Guilherme | Planejado — aguarda conclusão do livro | Produto publicável e comercializável |

> ⚠️ O livro com a história e personagens originais está em execução paralela. Quando concluído, os personagens originais substituirão os licenciados no jogo publicável. **Nunca misturar as bases de personagens. Nunca implementar personagens originais no app atual.**

**Status:** ALPHA — ~32% concluído
**Pasta local:** `~/Documentos/Projetos IDEs/jc-card-wars`
**Servidor dev:** `http://localhost:5174/` (Vite — porta real confirmada)
**Deploy:** Vercel

---

## 2. AMBIENTE E STACK

| Campo | Valor |
|-------|-------|
| **Máquina** | Dell OptiPlex 3060, 8GB RAM, Zorin OS |
| **Node** | v20.20.0 / npm 10.8.2 |
| **React** | 19.2.0 |
| **Vite** | 7.2.4 |
| **TypeScript** | 5.9.3 (⚠️ tsc falha) |
| **Tailwind CSS** | 4.1.17 |
| **Firebase** | 12.6.0 (auth + RTDB; Management API PROIBIDA) |
| **framer-motion** | 12.29.2 |
| **react-router-dom** | 7.9.6 |
| **lucide-react** | 0.555.0 |
| **express + cors + multer** | server.cjs |

**Estado do build:** `npm run build` passa | `npx tsc` falha | `npm run lint` falha (182 erros) | Testes: inexistentes

---

## 3. REGRAS ABSOLUTAS (NUNCA VIOLAR)

| # | Regra |
|---|-------|
| R1 | NUNCA usar nome da carta como identificador. SEMPRE ID numérico como string (`card.id`). |
| R2 | NUNCA hardcodar ATK/DEF. Sempre buscar de `src/data/cards.ts → initialCards`. |
| R3 | NUNCA criar habilidades para cartas "Carta não criada ainda". São DLC fora do escopo. |
| R4 | NUNCA implementar na Arena sem antes testar no TestLab. |
| R5 | NUNCA usar Firebase Management API (cota 333% excedida). |
| R6 | SEMPRE usar spread operator em mutações de estado React. Nunca mutar diretamente. |
| R7 | NUNCA implementar mais de 5–8 cartas por lote. |
| R8 | PROIBIDO cartas repetidas no deck. Máximo 1 cópia por carta. |
| R9 | NUNCA abrir Windsurf + Cursor simultaneamente (8GB RAM). |
| R10 | Toda edição: str_replace cirúrgico. Nunca reescrever arquivos inteiros. |
| R11 | IDs de cartas são sagrados. Nunca alterar IDs existentes em `cards.ts`. |
| R12 | Planning mode PROIBIDO em IDEs. Sempre Fast/direto. |
| R13 | Uma mudança por vez. Build deve passar antes de declarar tarefa concluída. |
| R14 | NUNCA misturar personagens licenciados com personagens originais do livro. |

---

## 4. ARQUITETURA MODULAR — INTENÇÃO

O projeto está sendo migrado para 3 camadas separadas:

```
Camada 1 — Motor puro (sem React, sem UI)
  src/engine/
    combatEngine.ts   → resolve ATK vs DEF (Sprint 4)
    abilityEngine.ts  → registry de habilidades por ID (Sprint 3)
    deckValidator.ts  → valida deck

Camada 2 — Estado do jogo (React, sem UI)
  src/contexts/
    BattleContext.tsx → orquestra o motor, gerencia estado

Camada 3 — Interface (só renderiza)
  src/pages/TestLab.tsx
  src/pages/Battle.tsx
```

**Benefício:** Cada habilidade escrita uma vez, usada em Lab e Arena. Troca de personagens no futuro = só muda `cards.ts`, motor permanece intacto.

---

## 5. MAPA DE ARQUIVOS

### Raiz
```
GESTAO.md / ARQUITETURA.md / AGENTS.md / .gemini_ignore
cartas jc cw oficial.csv    → Referência de design. NÃO parsed em runtime.
HISTORY.md                  → ⚠️ Desatualizado — diz 214 cartas, real são 178
server.cjs                  → Upload de imagens local — endpoint INSEGURO
tsc_errors.txt              → Erros TypeScript
```

### src/utils/ — Motor de lógica (atual, pré-refatoração)
```
AbilityEngine.ts    → const SpecialAbilities (registry) + parseAbilityToEffects()
                      ⚠️ IDs 1, 3, 4 stale/errados | fallback heurístico — remover do prod
AbilityParser.ts    → Stub sem uso real
cardUtils.ts        → getSacrificeCost()
deckValidator.ts    → ⚠️ Valida só tamanho — não valida unicidade
gachaLogic.ts       → Lógica de pacotes
```

### src/contexts/
```
BattleContext.tsx   → Estado central (~81.5KB). SEMPRE str_replace cirúrgico.
                      HP canônico: 8000
                      ⚠️ localStorage.clear() linha 130–131 (P0)
                      ⚠️ activateAbility consome uso antes de validar (1769–1773)
                      ⚠️ confirmSacrifice não dispara onPlay (1322–1387)
                      ⚠️ IA usa lógica de combate divergente (611–641)
CardContext.tsx     → useCards() → { cards, getCard(id), updateCard, mode }
GameContext.tsx     → ⚠️ deck é number[] | chaves localStorage sem namespace por uid
```

### src/pages/
```
TestLab.tsx   → AMBIENTE DE DEV (~192.8KB). Testar TUDO aqui.
               ⚠️ Motor divergente | executeEffect sem filtro de trigger
Battle.tsx    → Arena real. 12 slots fixos. Timer 30s.
Deck.tsx      → ⚠️ parseInt(c.id) — quebra IDs alfanuméricos
CardEditor.tsx → ⚠️ Campo id editável — viola R11
```

### src/data/
```
cards.ts  → FONTE DE VERDADE. 178 cartas únicas. 3 blocos effects estruturados.
            IDs alfanuméricos: TOK_BATMAN_Z, TOK_SHENLONG.
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
cards/originais/  → Imagens PNG. Nomenclatura: {ID}.png
                   ⚠️ Doc antiga dizia "cards/oficial" — errado
arenas/           → arena1_bg.jpg … arena10_bg.jpg
Audio temas/      → 24 músicas .m4a
```

---

## 6. SISTEMA DE COMBATE — CÂNONE

```
ATK > DEF → só defensor morre. Excesso = dano ao HP oponente (trample).
ATK < DEF → só atacante morre. DEF defensor -= ATK recebido.
ATK = DEF → empate. Ninguém morre.
Efeito/Zeta: não podem ser atacadas.
Supremas: só atacadas por outras Supremas.
isStunned: não pode atacar nem usar HB.
```

**3 motores divergentes hoje:** Arena jogador (✅ mais próximo), Arena IA (❌ diverge), TestLab (❌ atacante nunca morre). Motor canônico unificado: Sprint 4.

---

## 7. CARTAS — INVENTÁRIO COMPLETO

### Status atual
- **20 validadas e funcionando**
- **74 sem HB definida** (DLC — não implementar)
- **~84 com HB escrita, não implementadas**
- **~40 cartas especiais** (Efeitos, Equipes, Zetas, Joias, Fusões)

### 20 Cartas validadas
IDs: `11, 13, 18, 131, 139, 159, 160, 161, 162, 189, 190, 191, 192, 193, 194, 211, 212, 213, 214, TOK_SHENLONG`

### 7 Cartas aguardando validação
IDs: `132, 138, 145, 146, 164, 165, 195`

### 74 Cartas sem HB (DLC — não tocar)
IDs: `1, 2, 3, 7, 8, 9, 12, 16, 21, 23, 24, 30, 32, 38, 39, 40, 41, 42, 43, 45, 46, 48, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 78, 79, 80, 81, 82, 83, 84, 85, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 134, 135, 140, 141, 142, 143, 155, 156, 176, 177, 178, 179, 180, 182, 183, 184, 185, 186, 187, 188, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224`

### ~84 Cartas com HB para implementar — classificadas por complexidade

**🟢 SIMPLES** (~28 cartas) — 1 efeito direto, sem condição complexa. ~25min cada.
`25(parcial), 28, 29, 35, 86, 87, 88, 89, 126, 127, 148, 150, 151, 152, 154, 157, 158, 165, 172, 173, 175, 181, 190, 191, 192, 194, 211, 213, 214`

**🟡 MÉDIO** (~32 cartas) — múltiplos efeitos, timer, condição. ~1h cada.
`25(completo), 26, 27, 31, 33, 34, 36, 47, 49, 51, 52, 55, 56, 57, 59, 60, 63, 76, 77, 90, 91, 92, 93, 94, 95, 128, 131, 132, 133, 139, 146, 147`

**🔴 COMPLEXO** (~24 cartas) — mecânicas únicas, estado persistente, interação entre cartas. ~2h cada.
`6, 11, 13, 14, 15, 17, 18, 19, 20, 22, 37, 44, 50, 53, 54, 58, 64, 96, 97, 98, 111, 112, 113, 136`

### Cartas especiais (~40) — estimativa separada
Efeitos, Equipes, Zetas, Joias do Infinito, Manopla, Fusões
~30h estimado — implementar após todas as cartas de guerreiro

---

## 8. AUDITORIA TÉCNICA — 20 AUDs

### P0 — Hotfix imediato

| ID | Arquivo | Bug | Evidência |
|----|---------|-----|-----------|
| AUD-001 | BattleContext.tsx:130–131 | `localStorage.clear()` apaga tudo ao entrar em batalha | Fato |
| AUD-002 | server.cjs:37–51 | Upload sem auth, vulnerável a path traversal | Fato |
| AUD-003 | GameContext.tsx:56, Deck.tsx:357 | Deck como `number[]` + `parseInt` | Fato |
| AUD-004 | AbilityEngine.ts:8 | Registry stale — ID 4 = Galactus, deveria ser Dr. Manhattan | Fato |
| AUD-005 | BattleContext.tsx:1781 | Arena parse sem card.id — inventa efeitos por texto | Fato |
| AUD-006 | useLocalStorage.ts:7 | Spread de arrays corrompe deck/packSlots após reload | Fato |
| AUD-007 | GameContext.tsx:41,56,58 | Chaves localStorage sem namespace por uid | Inferência forte |

### P1 — Alto risco

| ID | Arquivo | Bug | Evidência |
|----|---------|-----|-----------|
| AUD-008 | App.tsx:80 | Debug/cheat menu exposto sem guarda de ambiente | Fato |
| AUD-009 | App.tsx:64–76 | `/editor` e `/test-lab` sem proteção por role | Fato |
| AUD-010 | BattleContext.tsx:1221–1222 | Mutação direta de estado | Fato |
| AUD-011 | BattleContext vs TestLab | Três motores de combate divergentes | Fato |
| AUD-012 | BattleContext.tsx:1769–1773 | Uso da HB consumido antes de validar | Fato |
| AUD-013 | BattleContext.tsx:1322–1387 | confirmSacrifice não dispara onPlay | Fato |
| AUD-014 | BattleContext.tsx:611–641 | IA usa lógica própria, stats hardcoded | Fato |
| AUD-015 | deckValidator.ts:25–42 | Valida só tamanho, não unicidade | Fato |
| AUD-016 | CardEditor.tsx:76–84 | Campo id editável | Fato |

### P2 — Médio prazo

| ID | Arquivo | Bug | Evidência |
|----|---------|-----|-----------|
| AUD-017 | AuthContext.tsx:64–69 | Logout visual sem encerramento real | Inferência forte |
| AUD-018 | package.json | tsc + lint quebrados (182 erros) | Fato |
| AUD-019 | AuthContext.tsx:32–41 | UID logado no console | Fato |
| AUD-020 | — | Ausência total de testes | Fato |

### Bugs de cartas (B-series)

| ID | Carta | Bug | Status |
|----|-------|-----|--------|
| B1 | Boruto (136) | Seleção de alvo travada | 🔴 Aberto |
| B2 | Rock Lee (137) | Só 1 ataque em vez de 3 | 🔴 Aberto |
| B3 | Mulher Invisível (163) | Nada acontece ao ativar | 🔴 Aberto |
| B4 | Motor | Atacante morre com ATK > DEF (IA) | 🔴 Fragmentado |
| B5 | Goten (133) | Bônus ATK no turno errado | 🟡 Aberto |
| B6 | Homem-Formiga (144) | Glow roxo não some | 🟡 Aberto |

---

## 9. CONSISTÊNCIA DE CARTAS CRÍTICAS

| ID | Carta | Registry | TestLab | Arena | Risco |
|----|-------|----------|---------|-------|-------|
| 4 | Dr. Manhattan | stale (Galactus) | quebrado | ausente | Crítico |
| 11 | Darkseid | parcial | parcial | falso-parcial | Crítico |
| 14 | Zeus | stale/errado | quebrado | ausente | Crítico |
| 15 | Jean Grey | stale/errado | quebrado | explícito | Alto |
| 17 | Broly | parcial | manual | ausente | Alto |
| 18 | Sentry | parcial | parcial | ausente | Alto |

---

## 10. DÉBITO DOCUMENTAL

| Divergência | Doc diz | Real |
|-------------|---------|------|
| Porta dev | 5173 | **5174** |
| Diretório imagens | "cards/oficial" | **"cards/originais"** |
| Contagem cartas | 214 | **178** |
| Trigger onSummon | citado no HISTORY | **não existe no types** |

---

## 11. PLANO COMPLETO DE EXECUÇÃO

### Estimativa de esforço por bloco

| Bloco | Escopo | Esforço | Dias calendário |
|-------|--------|---------|-----------------|
| **Bloco 0** — Infraestrutura | AGENTS, .gemini_ignore, porta | 30min | 18/04 (hoje) |
| **Bloco 1** — Hotfixes P0 | AUD-001 a AUD-007, AUD-008/016 | ~2h | 19–20/04 |
| **Bloco 2** — Identidade domínio | Deck string[], localStorage, unicidade | ~3h | 21–23/04 |
| **Bloco 3** — Tipos e registry | Contrato TS, registry, fallback, card.id | ~4h | 24–27/04 |
| **Bloco 4** — Motor canônico | combatEngine, IA, activateAbility, onPlay | ~5h | 28/04–02/05 |
| **Bloco 5** — Cartas simples | ~28 cartas em lotes de 5–8 | ~12h | 03–14/05 |
| **Bloco 6** — Cartas médias | ~32 cartas em lotes de 5–8 | ~32h | 15/05–12/06 |
| **Bloco 7** — Cartas complexas | ~24 cartas em lotes de 3–5 | ~48h | 13/06–20/07 |
| **Bloco 8** — Cartas especiais | Efeitos, Equipes, Zetas, Joias, Fusões | ~30h | 21/07–10/08 |
| **Bloco 9** — Arena multiplayer | Matchmaking, salas, sync Firebase | ~40h | 11/08–10/09 |
| **Bloco 10** — Gacha + Shop | Pacotes, loja básica, moedas | ~20h | 11–30/09 |
| **Bloco 11** — Ranking + Troféus | Sistema de progressão | ~15h | 01–15/10 |
| **Bloco 12** — Polimento Release Dev | UI/UX, onboarding, estabilidade | ~20h | 16/10–05/11 |

**Data estimada Release Dev (personagens licenciados):** **Novembro 2026**
**Release Original (personagens do livro):** TBD — aguarda conclusão do livro

> ⚠️ Estimativas assumem 1–2h produtivas por dia, 5 dias/semana, sem bloqueios de IDE. Bloco 4 é o maior risco de atraso — tocar BattleContext múltiplas vezes costuma revelar problemas encadeados. Buffer de 5 dias recomendado entre Bloco 4 e Bloco 5.

---

### BLOCO 0 — Infraestrutura

#### Tarefa 0.1 — Criar AGENTS.md na raiz
**IDE:** Codex App | **Modelo:** GPT-5.4-mini | **Reserva:** Cursor BYOK

```
TAREFA PARA O CODEX:
Leia o ARQUITETURA.md e confirme que entendeu.

Crie o arquivo AGENTS.md na raiz do projeto com o conteúdo do AGENTS.md
que está nos documentos de gestão. Após criar, confirme existência
e mostre as primeiras 10 linhas. Não altere nenhum outro arquivo.
```

#### Tarefa 0.2 — Criar .gemini_ignore
**IDE:** Codex App | **Modelo:** GPT-5.4-mini | **Reserva:** Cursor BYOK

```
Crie .gemini_ignore na raiz:
node_modules/
dist/
.git/
*.log
*.lock
public/Audio temas/
```

#### Tarefa 0.3 — Confirmar porta dev
**IDE:** Codex App | **Modelo:** GPT-5.4-mini

```
Leia vite.config.ts e informe qual porta está configurada. Não altere nada.
```

---

### BLOCO 1 — Hotfixes P0

#### Tarefa 1.1 — Remover localStorage.clear() do BattleProvider
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Antigravity Claude Sonnet (Planning)
**⚠️ NUNCA usar Flash — BattleContext ~81KB**

```
TAREFA PARA O CODEX:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Arquivo: src/contexts/BattleContext.tsx
Tarefa: Remover localStorage.clear() do corpo do BattleProvider.

PROBLEMA:
Linhas 130–131 executam localStorage.clear() diretamente no corpo do provider,
apagando todos os dados do usuário toda vez que a batalha é iniciada.

SOLUÇÃO:
1. Localizar linhas 130–131
2. Remover as duas linhas com localStorage.clear()
3. Não substituir por nada — apenas remover
4. Opcional: comentar como // DEV ONLY: localStorage.clear()

REGRAS:
- str_replace cirúrgico — não reescrever o arquivo
- Não alterar nada além das linhas 130–131
- npm run build deve passar após

VALIDAÇÃO:
- localStorage.setItem('jc-profile', 'teste')
- Navegar para /battle
- localStorage.getItem('jc-profile') deve retornar 'teste'
```

#### Tarefa 1.2 — Fechar endpoint de upload
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK

```
TAREFA PARA O CODEX:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Arquivo: server.cjs
Tarefa: Endurecer endpoint contra path traversal e uso não autorizado.

SOLUÇÃO — aplicar em ordem:
1. cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] })
2. Sanitizar cardId:
   const safeCardId = cardId.replace(/[^a-zA-Z0-9_-]/g, '')
   Se safeCardId vazio ou diferente: retornar 400
3. Verificar path final:
   const targetPath = path.join(cardsDir, safeCardId + '.png')
   if (!targetPath.startsWith(path.resolve(cardsDir))) retornar 403
4. fileFilter: aceitar apenas image/jpeg e image/png
5. limits: { fileSize: 2 * 1024 * 1024 }

VALIDAÇÃO:
- cardId '../pwned' → deve retornar 400
- arquivo .exe → deve ser rejeitado
- PNG com ID numérico → deve funcionar
```

#### Tarefa 1.3 — Remover DebugFloatingMenu do runtime
**IDE:** Antigravity | **Modelo:** Gemini Flash (Fast) | **Reserva:** Codex GPT-5.4-mini

```
TAREFA PARA O ANTIGRAVITY:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Arquivo: src/App.tsx
Substituir linha 80:
  <DebugFloatingMenu />
Por:
  {import.meta.env.DEV && <DebugFloatingMenu />}

str_replace cirúrgico — apenas essa linha.
npm run build após.
```

#### Tarefa 1.4 — Tornar id readonly no CardEditor
**IDE:** Antigravity | **Modelo:** Gemini Flash (Fast) | **Reserva:** Codex GPT-5.4-mini

```
TAREFA PARA O ANTIGRAVITY:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Arquivo: src/pages/CardEditor.tsx
Localizar input do campo id (linhas 76–84).
Adicionar: readOnly + className "cursor-not-allowed opacity-60"
Remover o handler onChange desse campo específico.
str_replace cirúrgico.
```

---

### BLOCO 2 — Identidade de domínio

#### Tarefa 2.1 — Migrar deck de number[] para string[]
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK
**⚠️ Afeta 3 arquivos — usar /review antes de commit**

```
TAREFA PARA O CODEX:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Tarefa: Migrar deck de number[] para string[] de card.id.

ARQUIVOS — nesta ordem:
1. GameContext.tsx: alterar tipo de deck de number[] para string[]
2. Deck.tsx: remover parseInt(c.id), usar c.id diretamente
3. deckValidator.ts: alterar assinatura para string[]
   ADICIONAR validação de unicidade:
   if (deck.length !== new Set(deck).size) → rejeitar

REGRAS:
- str_replace cirúrgico em cada arquivo
- /review antes de commit
- npm run build após cada arquivo

VALIDAÇÃO:
- Deck com TOK_SHENLONG deve funcionar
- Carta duplicada deve ser rejeitada
- Salvar deck, recarregar — cartas corretas devem estar lá
```

#### Tarefa 2.2 — Corrigir useLocalStorage para arrays
**IDE:** Codex App | **Modelo:** GPT-5.4-mini | **Reserva:** Antigravity Flash

```
TAREFA PARA O CODEX:
Arquivo: src/hooks/useLocalStorage.ts

PROBLEMA: Linha 7 usa { ...initialValue, ...parsed }.
Arrays viram objetos com chaves numéricas após reload.

SOLUÇÃO:
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(initialValue)) return parsed ?? initialValue
  return { ...initialValue, ...parsed }

str_replace cirúrgico. Não alterar assinatura.
```

#### Tarefa 2.3 — Namespace por uid no localStorage
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK

```
TAREFA PARA O CODEX:
Arquivo: src/contexts/GameContext.tsx

PROBLEMA: Chaves jc-profile, jc-deck, jc-pack-slots globais.
Dois usuários no mesmo navegador compartilham dados.

SOLUÇÃO:
1. Importar useAuth ou uid do contexto
2. Prefixar chaves: jc-profile-${uid}, jc-deck-${uid}, jc-pack-slots-${uid}
3. No logout: limpar apenas chaves do uid atual

Garantir uid disponível antes de ler/gravar.
```

---

### BLOCO 3 — Contrato de tipos e registry

#### Tarefa 3.1 — Fechar contrato de EffectType/EffectTrigger
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK
**⚠️ /review obrigatório — mudança de tipo tem cascata**

```
TAREFA PARA O CODEX:
Arquivos: src/types/index.ts, src/utils/AbilityEngine.ts

PROBLEMA: AbilityEngine usa tipos fora do union canônico:
  complexBuff, stealCard, weakenAll, immunity, condDestroy, halveAndKill
  Targets: opponentHand, allOpponents

SOLUÇÃO — substituir pelo tipo canônico mais próximo:
  complexBuff → buffAtk ou buffDef
  stealCard → mindControl ou draw
  weakenAll → buffAtk com valor negativo
  immunity → silence
  condDestroy → destroy
  halveAndKill → damage + destroy (dois efeitos separados)
  opponentHand → 'hand'
  allOpponents → 'allEnemies'

Verificar cada substituição individualmente.
/review antes de commit.
npx tsc após cada alteração.
```

#### Tarefa 3.2 — Reconstruir registry a partir de cards.ts
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK
**⚠️ /review obrigatório**

```
TAREFA PARA O CODEX:
Arquivos: src/utils/AbilityEngine.ts, src/data/cards.ts

PROBLEMA: Registry tem IDs stale:
  ID 1: errado | ID 3: errado | ID 4: Galactus → deveria ser Dr. Manhattan

SOLUÇÃO:
1. Ler cards.ts — identificar cartas IDs 1, 3, 4
2. Corrigir os blocos correspondentes no registry
3. Listar outros IDs não presentes em cards.ts (não remover ainda)

str_replace cirúrgico nos blocos dos IDs 1, 3, 4 apenas.

VALIDAÇÃO:
- Ativar HB da carta ID 4 no TestLab
- Comportamento deve corresponder à descrição em cards.ts
```

#### Tarefa 3.3 — Remover fallback heurístico do caminho produtivo
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK

```
TAREFA PARA O CODEX:
Arquivo: src/utils/AbilityEngine.ts

PROBLEMA: Bloco 243–304 inventa efeitos por keywords de texto.
Viola R2: mudanças de texto alteram comportamento de jogo.

SOLUÇÃO: Envolver o bloco em condição que nunca é atingida em produção:
  if (import.meta.env.DEV && false) {
    // fallback heurístico — desabilitado
    [código atual]
  }
  return []

Não deletar — apenas desabilitar.

VALIDAÇÃO:
- Carta sem registry: botão HB cinza (desabilitado)
- Carta com registry: funciona normalmente
```

#### Tarefa 3.4 — Passar card.id no parse da Arena
**IDE:** Codex App | **Modelo:** GPT-5.4
**⚠️ NUNCA usar Flash — BattleContext ~81KB**

```
TAREFA PARA O CODEX:
Arquivo: src/contexts/BattleContext.tsx

PROBLEMA: Linha 1781 chama parseAbilityToEffects(unit.description) sem ID.
Registry só ativado quando cardId é fornecido.

SOLUÇÃO:
Localizar linha 1781:
  parseAbilityToEffects(unit.description)
Substituir por:
  parseAbilityToEffects(unit.description, unit.card?.id ?? unit.id)

str_replace cirúrgico — apenas essa linha.
```

---

### BLOCO 4 — Motor canônico compartilhado

#### Tarefa 4.1 — Criar combatEngine.ts
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK

```
TAREFA PARA O CODEX:
Criar src/utils/combatEngine.ts com a função canônica:

export function resolveCombat(attackerAtk: number, defenderDef: number): {
  attackerDies: boolean
  defenderDies: boolean
  trampleDamage: number
  defenderDefRemaining: number
} {
  if (attackerAtk > defenderDef) {
    return { attackerDies: false, defenderDies: true,
             trampleDamage: attackerAtk - defenderDef, defenderDefRemaining: 0 }
  } else if (attackerAtk < defenderDef) {
    return { attackerDies: true, defenderDies: false,
             trampleDamage: 0, defenderDefRemaining: defenderDef - attackerAtk }
  } else {
    return { attackerDies: false, defenderDies: false,
             trampleDamage: 0, defenderDefRemaining: defenderDef }
  }
}

NÃO migrar BattleContext ou TestLab nesta tarefa — apenas criar o arquivo.

VALIDAÇÃO:
  resolveCombat(3000, 1000) → defenderDies: true, trampleDamage: 2000
  resolveCombat(1000, 3000) → attackerDies: true, defenderDefRemaining: 2000
  resolveCombat(2000, 2000) → ambos false
```

#### Tarefa 4.2 — Corrigir motor da IA
**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK
**⚠️ NUNCA usar Flash | /review obrigatório**

```
TAREFA PARA O CODEX:
Arquivo: src/contexts/BattleContext.tsx

PROBLEMA: Bloco 611–641 compara ATK vs HP (errado) — deveria ser ATK vs DEF.

SOLUÇÃO:
1. Importar resolveCombat de src/utils/combatEngine.ts
2. Localizar bloco 611–641
3. Substituir por:
   const result = resolveCombat(unit.currentAttack, target.currentDefense ?? 0)
   if (result.defenderDies) { /* remover defensor */ }
   if (result.attackerDies) { /* remover atacante */ }
   if (result.trampleDamage > 0) { /* dano ao HP */ }
4. Spread operator em todas as mutações

VALIDAÇÃO:
- ATK 3000 vs DEF 1000: só carta com DEF 1000 morre
- ATK 500 vs DEF 2000: só atacante morre
```

#### Tarefa 4.3 — Corrigir activateAbility
**IDE:** Codex App | **Modelo:** GPT-5.4
**⚠️ NUNCA usar Flash**

```
TAREFA PARA O CODEX:
Arquivo: src/contexts/BattleContext.tsx

PROBLEMA: Linhas 1769–1773 consomem o uso da HB ANTES de saber se existe
e sem rollback quando o usuário cancela a seleção de alvo (1720–1723).

SOLUÇÃO:
1. Mover o consumo de uso para DEPOIS da execução do efeito
2. Se precisar de alvo e usuário cancelar: NÃO consumir uso
3. Estrutura:
   - Validar silêncio e uso por turno
   - Encontrar o efeito (sem consumir)
   - Se precisar de alvo: abrir seleção; consumir só após executar
   - Se não precisar: executar efeito, então consumir

VALIDAÇÃO:
- Cancelar seleção de alvo: uso NÃO consumido
- Completar normalmente: uso consumido uma vez
```

#### Tarefa 4.4 — Corrigir confirmSacrifice → onPlay
**IDE:** Codex App | **Modelo:** GPT-5.4
**⚠️ NUNCA usar Flash**

```
TAREFA PARA O CODEX:
Arquivo: src/contexts/BattleContext.tsx

PROBLEMA: playCard() dispara onPlay (1305–1319).
confirmSacrifice() coloca a carta no campo (1322–1387) mas NÃO dispara onPlay.

SOLUÇÃO:
1. Após carta entrar no campo em confirmSacrifice
2. Disparar o mesmo bloco de onPlay de playCard
3. Pode ser função auxiliar triggerOnPlay(card, board)

onPlay deve disparar exatamente uma vez por invocação.

VALIDAÇÃO:
- Carta com sacrifício + onPlay: deve executar o efeito ao entrar
- Sem sacrifício: comportamento não deve mudar
```

---

### BLOCO 5 — Cartas simples (~28 cartas)

**Regra:** lotes de 5–8 cartas. TestLab primeiro, Arena depois. Uma thread por lote.
**IDE:** Antigravity | **Modelo:** Gemini Flash (Fast) para simples, Gemini Pro se precisar de mais contexto
**Reserva:** Codex GPT-5.4-mini

**Lote 5A** (após validar 7 pendentes): IDs 28, 29, 35, 86, 87
**Lote 5B:** IDs 88, 89, 148, 150, 151
**Lote 5C:** IDs 152, 154, 157, 158, 165
**Lote 5D:** IDs 172, 173, 175, 181, 190
**Lote 5E:** IDs 191, 192, 194, 211, 213, 214
**Lote 5F:** Validar 7 pendentes (132, 138, 145, 146, 164, 165, 195) + fix B5, B6

**Template de prompt para cartas simples:**
```
TAREFA PARA O ANTIGRAVITY:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Implementar HBs no TestLab para as cartas: [IDs]

Para cada carta:
1. Consultar cards.ts para ATK/DEF reais (NUNCA hardcodar)
2. Consultar CSV/GESTAO.md para a descrição da HB
3. Adicionar bloco if (card.id === 'X') em executeEffect() no TestLab.tsx
4. Testar no TestLab antes de avançar para a próxima

REGRAS:
- str_replace cirúrgico
- Spread operator em mutações
- NUNCA hardcodar ATK/DEF
- ID numérico como string

TESTE ESPERADO POR CARTA:
[descrever o comportamento esperado de cada uma]
```

---

### BLOCO 6 — Cartas médias (~32 cartas)

**IDE:** Antigravity | **Modelo:** Claude Sonnet (Planning) — múltiplos efeitos e timers exigem mais contexto
**Reserva:** Codex GPT-5.4

Lotes de 5 cartas (mais lentas — ~1h cada):
**Lote 6A:** IDs 25, 26, 27, 31, 33
**Lote 6B:** IDs 34, 36, 47, 49, 51
**Lote 6C:** IDs 52, 55, 56, 57, 59
**Lote 6D:** IDs 60, 63, 76, 77, 90
**Lote 6E:** IDs 91, 92, 93, 94, 95
**Lote 6F:** IDs 128, 131, 133, 139, 146
**Lote 6G:** IDs 147 + revisão do 132 (já tem base)

---

### BLOCO 7 — Cartas complexas (~24 cartas)

**IDE:** Codex App | **Modelo:** GPT-5.4 (complexidade requer análise profunda e /review)
**Reserva:** Cursor BYOK

Lotes de 3 cartas (mais lentas — ~2h cada, risco de bugs encadeados):
**Lote 7A:** IDs 136 (fix B1), 137 (fix B2), 163 (fix B3) — bugs existentes primeiro
**Lote 7B:** IDs 6, 13, 14
**Lote 7C:** IDs 15, 17, 18 — registry stale, corrigir junto
**Lote 7D:** IDs 19, 20, 22
**Lote 7E:** IDs 37, 44, 50
**Lote 7F:** IDs 53, 54, 58
**Lote 7G:** IDs 64, 96, 97
**Lote 7H:** IDs 98, 111, 112
**Lote 7I:** IDs 113 (Kakashi — copia HB)

---

### BLOCO 8 — Cartas especiais (~40 cartas)

**IDE:** Codex App | **Modelo:** GPT-5.4 | **Reserva:** Cursor BYOK

Implementar após todas as cartas de guerreiro. Ordem:
1. Efeitos (cartas de suporte) — mais simples
2. Equipes (combos) — dependem de múltiplas cartas na arena
3. Joias do Infinito (individuais) — mecânica de sacrifício/turno
4. Manopla do Infinito — requer todas as joias
5. Fusões prontas (Gotenks, Vegetto, Gogeta, Zamasu Fundido)
6. Set completo Batman + Esferas do Dragão

---

### BLOCO 9 — Arena multiplayer

**IDE:** Codex App | **Modelo:** GPT-5.4 (Firebase + lógica de sync)
**Reserva:** Cursor BYOK

Subtarefas principais:
- Sala de partida com código de convite
- Sync de estado via Firebase RTDB
- Validação server-side de jogadas
- Timer sincronizado
- Sistema de reconexão

**⚠️ Este é o bloco mais arriscado tecnicamente — Firebase RTDB para jogo em tempo real requer planejamento cuidadoso antes de implementar. Claude deve gerar arquitetura detalhada antes de qualquer código.**

---

### BLOCO 10 — Gacha + Shop básico

**IDE:** Antigravity | **Modelo:** Claude Sonnet | **Reserva:** Codex GPT-5.4

- Sistema de moedas/gemas
- Abertura de pacotes (gachaLogic.ts já existe como base)
- Loja com compra de pacotes
- Histórico de aberturas

---

### BLOCO 11 — Ranking + Troféus

**IDE:** Antigravity | **Modelo:** Gemini Pro | **Reserva:** Codex GPT-5.4-mini

- Sistema de troféus por vitória/derrota
- Ranking global via Firebase
- Perfil com estatísticas
- Arenas desbloqueadas por troféus

---

### BLOCO 12 — Polimento Release Dev

**IDE:** Antigravity | **Modelo:** Claude Sonnet (Planning) | **Reserva:** Trae

- Onboarding para novos usuários
- Tutorial interativo
- UI/UX geral — responsividade, animações
- Remoção de features DEV do build de produção
- Varreduras de segurança finais (3 varreduras Codex)
- CI: build + tsc + lint automatizados

---

## 12. MATRIZ DE TESTES PRIORITÁRIOS

| # | Teste | Criticidade | Após |
|---|-------|-------------|------|
| 1 | Entrar em batalha NÃO apaga jc-profile, jc-deck | P0 | Bloco 1.1 |
| 2 | Upload rejeita cardId com `../` | P0 | Bloco 1.2 |
| 3 | Deck com carta duplicada é rejeitado | P0 | Bloco 2.1 |
| 4 | Arrays deck/packs íntegros após reload | P0 | Bloco 2.2 |
| 5 | Dr. Manhattan (4) dispara HB correta | P0 | Bloco 3.2 |
| 6 | Cancelar alvo NÃO consome uso da HB | P1 | Bloco 4.3 |
| 7 | Carta com sacrifício dispara onPlay 1x | P1 | Bloco 4.4 |
| 8 | Logout encerra sessão, não herda deck | P1 | Bloco 2.3 |
| 9 | Mesmo combate: resultado igual Lab e Arena | P1 | Bloco 4 |
| 10 | IA usa stats reais de cards.ts | P1 | Bloco 4.2 |
| 11 | Rock Lee (137): 3 ataques executados | P2 | Bloco 7A |
| 12 | Reordenar cards.ts não muda deck salvo | P0 | Bloco 2.1 |

---

## 13. O QUE NÃO VALIDAR SEM TESTE MANUAL

- Boruto (136), Rock Lee (137), Mulher Invisível (163) ponta a ponta
- Mysterio — recusa de bloqueio com window.confirm
- Logout real + troca de usuário no mesmo navegador
- Regras Firebase/RTDB remotas
- Deploy Vercel em produção
- UX completa no browser

---

## 14. PENDÊNCIAS

| ID | Pendência | Status |
|----|-----------|--------|
| P1 | HP canônico | ✅ **8.000** |
| P2 | Validar 7 cartas pendentes | ⏳ Lote 5F |
| P3 | Registrar PONTO 3 no HISTORY.md | ⏳ Após Bloco 1 |
| P4 | Criar AGENTS.md, .gemini_ignore na raiz | ⏳ Bloco 0 |
| P5 | Confirmar porta dev real | ⏳ Bloco 0 |
| P6 | Cruzar IDs HISTORY.md com cards.ts | ⏳ Bloco 12 |

---

## 15. PLANO MESTRE

| Fase | Escopo | Status | Estimativa |
|------|--------|--------|------------|
| Alpha I | Motor base, 20 cartas, TestLab funcional | ✅ Concluída | — |
| Alpha II | Blocos 0–4: infraestrutura, hotfixes, motor canônico | 🔄 Atual | Abr–Mai/2026 |
| Alpha III | Blocos 5–8: todas as 84 cartas + especiais | ⏳ | Jun–Ago/2026 |
| Beta | Blocos 9–11: multiplayer, gacha, ranking | ⏳ | Set–Out/2026 |
| Release Dev | Bloco 12: polimento — personagens licenciados | ⏳ | Nov/2026 |
| Release Original | Personagens do livro — produto público | ⏳ | Aguarda livro |

---

## 16. CHECKPOINTS

```
PONTO 0 — 05/03/2026 — Relatório Mestre v4.1. Estrutura de gestão fundada.
PONTO 1 — 19/03/2026 — HP canônico 8.000. Reestruturação de chats.
PONTO 2 — 18/04/2026 — Auditoria 20 AUDs. Plano completo. Nexus Ascension.
PONTO 3 — [pendente] — Após Bloco 1 concluído.
```

---

## 17. ARSENAL DE FERRAMENTAS

### Seleção por tipo de tarefa

| Tipo de tarefa | IDE principal | Modelo | Reserva |
|----------------|--------------|--------|---------|
| Arquivo novo simples | Codex App | GPT-5.4-mini | Cursor BYOK |
| Correção 1–2 linhas | Antigravity | Gemini Flash (Fast) | Codex mini |
| Arquivo grande (>500L) | Codex App | GPT-5.4 | Antigravity Sonnet |
| Multi-arquivo (3+) | Codex App | GPT-5.4 + /review | Cursor BYOK |
| UI/componente visual | Antigravity | Claude Sonnet (Planning) | Trae |
| Carta simples | Antigravity | Gemini Flash (Fast) | Codex mini |
| Carta média | Antigravity | Claude Sonnet (Planning) | Codex GPT-5.4 |
| Carta complexa | Codex App | GPT-5.4 + /review | Cursor BYOK |
| Firebase/backend | Codex App | GPT-5.4 | Cursor BYOK |
| Sem cota em nada | Cursor BYOK | Gemini via AI Studio | Kilo Code + Groq |

**IDEs disponíveis:**

| Ferramenta | Papel | Observação |
|------------|-------|------------|
| **Codex App** | Executor principal | GPT-5.4/mini. Janela 5h. Cota compartilhada App/CLI/Web/IDE |
| **Antigravity** | Executor UI/UX | Preview browser em tempo real. Múltiplas contas Google |
| **Cursor** | Executor alternativo | BYOK disponível. Sem preview browser |
| **Kilo Code/Cline** | Backstop ilimitado | BYOK OpenRouter/Groq. Sem custo |
| **Windsurf** | ⚠️ Último recurso | Histórico de sobrescrever dados de produção |
| **Trae** | Alternativa UI/UX | ⚠️ ByteDance — telemetria. Não usar com código sensível |

**⚠️ NUNCA Flash em BattleContext.tsx ou TestLab.tsx. Causa regressões. Já aconteceu 3 vezes.**
**⚠️ NUNCA Windsurf + Cursor ao mesmo tempo. 8GB RAM.**

### Hierarquia Antigravity
1. Gemini Flash — grátis, simples, 1 arquivo
2. Gemini Pro Low — lógica moderada
3. Gemini Pro High — contexto maior
4. Claude Sonnet — complexo, multi-arquivo (**mínimo para >500 linhas**)
5. Claude Opus — último recurso, cota muito limitada

### APIs de IA para apps

| API | Uso | Gratuito? |
|-----|-----|-----------|
| **Google Gemini** | Principal — 1M tokens, PT-BR excelente | ✅ |
| **Groq** | Fallback rápido — <1s latência | ✅ |
| **DeepSeek** | Código e lógica complexa | ✅ |
| **OpenRouter** | Hub — 1 Key, dezenas de modelos | ✅ Parcial |

**Fallback apps:** `Gemini 2.5 Flash → Groq Llama 3.3 70B → DeepSeek V3 → mensagem amigável`

---

## 18. MEU MÉTODO DE TRABALHO COM IA

### Princípios
- Nunca editar código diretamente — todo código via agente
- Claude gera prompts mais precisos — não pular essa etapa
- Agente IDE recebe tarefas mastigadas — nunca decide sozinho
- Uma mudança por vez. Testar antes de avançar

### Varreduras de segurança (antes de deploy)

**Varredura 1 — Auth e dados:**
```
Leia AGENTS.md e ARQUITETURA.md e confirme.
TAREFA: Varredura auth/dados. Apenas leia e reporte. Não altere nada.
1. Credenciais hardcoded fora de .env?
2. Chamadas DB sem verificação de auth?
3. Identificadores de usuário de fonte confiável?
4. Dados sensíveis em localStorage sem necessidade?
5. Endpoints admin sem verificação de permissão?
```

**Varredura 2 — Estabilidade:**
```
TAREFA: Varredura estabilidade. Apenas leia e reporte. Não altere nada.
1. Violações das regras do AGENTS.md?
2. Estados de navegação paralelos?
3. Strings literais onde deveriam ser constantes?
4. Chamadas a APIs de tempo em estruturas inadequadas?
5. Campos/funções que deveriam ter sido removidos?
```

**Varredura 3 — Performance e build:**
```
TAREFA: Varredura performance/build. Apenas leia e reporte. Não altere nada.
1. npm run build — passa ou falha?
2. npm run lint — listar erros
3. Imports não utilizados em arquivos grandes?
4. useEffects sem deps corretas?
5. console.log() de debug?
6. Funcionalidades de debug visíveis?
```

### Lições aprendidas
- **L1:** Modelo esgota no meio → gerar prompt cirúrgico com só o que faltou
- **L2:** Prompts precisos > prompts longos. Antes/depois exato
- **L3:** Verificar se tarefa já foi feita antes de enviar
- **L7:** Windsurf — sempre revisar TUDO. Histórico crítico
- **L8:** Chat de Gestão gera prompts melhores. Não pular etapa
- **L11:** Modelos leves em arquivos grandes quebram código. Sonnet para >500 linhas
- **L12:** Executor confuso → trazer ao Chat de Gestão para reconstruir estado
- **L13:** Manter rollback antes de mudanças em BattleContext ou TestLab

---

## 19. DECISÕES REGISTRADAS

| Data | Decisão |
|------|---------|
| 09/03/2026 | Fonte de verdade: `cards.ts → initialCards` |
| 09/03/2026 | Deploy: Vercel |
| 19/03/2026 | HP canônico: **8.000** |
| 19/03/2026 | GESTAO.md = documento único |
| 18/04/2026 | Codex App = executor principal |
| 18/04/2026 | 20 AUDs mapeados via auditoria Codex |
| 18/04/2026 | Porta dev real: **5174** |
| 18/04/2026 | Registry real: `const SpecialAbilities` |
| 18/04/2026 | cards.ts tem **178 cartas** (não 214) |
| 18/04/2026 | **Renomeação: JC Card Wars → Nexus Ascension** |
| 18/04/2026 | Arquitetura modular: engine separada da UI |
| 18/04/2026 | ~84 cartas com HB para implementar: 28 simples / 32 médias / 24 complexas |
| 18/04/2026 | Release Dev estimado: **Novembro 2026** |

---

_Nexus Ascension (ex-JC Card Wars) — 18/04/2026 | v6.0_
_Atualizar após cada sessão significativa ou decisão tomada._
