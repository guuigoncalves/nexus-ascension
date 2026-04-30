# GESTÃO — NEXUS ASCENSION
**Versão:** 7.1 | **Data:** 29/04/2026 | **Gerado por:** Claude (Chat de Gestão)
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
| **Executor principal** | Codex App (OpenAI) | Backend, bugs profundos, multi-arquivo |
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

**Regras:** Uma tarefa por thread | Nunca avançar sem resultado confirmado | Planning PROIBIDO | Verificar se tarefa já foi feita antes de enviar

---

## 1. IDENTIDADE DO PROJETO

**Nexus Ascension** (renomeado em 18/04/2026) | Modo principal: **Ascension Arena**
Nome original: **JC Card Wars (JCCW)** — preservado para rastreabilidade histórica.

| Versão | Personagens | Status |
|--------|------------|--------|
| **App atual (Dev)** | Copyright (Marvel, DC, Dragon Ball, Naruto, One Piece...) | Em desenvolvimento ativo |
| **Jogo original (futuro)** | Personagens do livro de Guilherme | Aguarda conclusão do livro |

> ⚠️ Nunca misturar as duas bases. Nunca implementar personagens originais no app atual.

**Status:** ALPHA — ~52% concluído
**Pasta local:** `~/Documentos/Projetos IDEs/jc-card-wars`
**Dev:** `http://localhost:5174/` | **Deploy:** Vercel

---

## 2. STACK

| Campo | Valor |
|-------|-------|
| **Máquina** | Dell OptiPlex 3060, 8GB RAM, Zorin OS |
| **Node** | v20.20.0 / npm 10.8.2 |
| **React** | 19.2.0 | **Vite** | 7.2.4 |
| **TypeScript** | 5.9.3 | **Tailwind CSS** | 4.1.17 |
| **Firebase** | 12.6.0 (auth + RTDB; Management API PROIBIDA) |

---

## 3. REGRAS ABSOLUTAS

| # | Regra |
|---|-------|
| R1 | NUNCA usar nome da carta. SEMPRE ID numérico como string. |
| R2 | NUNCA hardcodar ATK/DEF. Sempre de `initialCards` em `cards.ts`. |
| R3 | NUNCA criar HB para cartas "não criadas ainda". São DLC. |
| R4 | NUNCA implementar na Arena sem TestLab aprovado. |
| R5 | NUNCA Firebase Management API. |
| R6 | SEMPRE spread operator em mutações. Nunca mutar diretamente. |
| R7 | NUNCA mais de 5–8 cartas por lote. |
| R8 | PROIBIDO cartas repetidas no deck. |
| R9 | NUNCA Windsurf + Cursor simultaneamente. |
| R10 | Toda edição: str_replace cirúrgico. Nunca reescrever arquivos inteiros. |
| R11 | IDs sagrados. Nunca alterar IDs em cards.ts. |
| R12 | Planning mode PROIBIDO nas IDEs. |
| R13 | Uma mudança por vez. Build + teste no browser antes de declarar concluído. |
| R14 | NUNCA misturar personagens licenciados com originais do livro. |
| R15 | PROIBIDO acentos/emojis em arquivos de dev. ASCII puro. |
| R16 | NUNCA múltiplas flags de estado para cliques. Sempre `interactionMode`. |

---

## 4. LIÇÕES CRÍTICAS

- **Encoding:** Codex corrompe encoding com acentos/emojis → Mojibake → JSX quebrado. ASCII puro em dev.
- **Estado de clique:** Múltiplas flags concorrentes causam cliques quebrados. Sempre `interactionMode`.
- **Build vs Runtime:** Build pode passar mas ReferenceError trava React silenciosamente. Sempre testar no browser.
- **Motor primeiro:** Estabilizar motor antes de implementar cartas.
- **Uma coisa por vez:** Nunca refatorar UI e lógica na mesma thread.

---

## 5. ARQUITETURA — ESTADO ATUAL ✅ TUDO ESTÁVEL

```
Camada 1 — Motor puro ✅
  combatEngine.ts: blindado — ATK < DEF = morte do atacante
  AbilityEngine.ts: registry limpo, fallback desabilitado

Camada 2 — Estado ✅
  BattleContext.tsx:
    ✅ localStorage.clear() removido
    ✅ Namespace nexus_v2_
    ✅ activateAbility corrigido
    ✅ confirmSacrifice dispara onPlay
    ✅ handleDeathTrigger universal
    ✅ Spread operator em tudo

Camada 3 — Interface ✅
  TestLab.tsx:
    ✅ interactionMode — máquina de estados para cliques
    ✅ Drag & Drop / clique Mão ↔ Arena com swap (Spread Operator)
    ✅ Layout grid 2 colunas, barra lateral 260px
    ✅ Arena 14 slots por jogador (grid 7x2)
    ✅ Alternância lado [L/R]
    ✅ Abas [HABILIDADES] e [LOG]
    ✅ Setup Dinâmico: dummy targets + cartas em foco
    ✅ Busca sincronizada (sem atraso)
    ✅ Botão Duplicar integrado aos slots
    ✅ Overlay de ataques discreto
    ✅ ASCII puro
    ✅ Seleção de alvo (habilidades) corrigida no opponentBoard
```

---

## 6. SISTEMA DE COMBATE — CÂNONE ✅

```
ATK > DEF → defensor morre. Excesso = dano ao HP (trample).
ATK < DEF → atacante morre. DEF defensor -= ATK recebido.
ATK = DEF → empate. HP canônico: 8000

Ordem executeAttack:
1. Interceptadores isReady em aliados (carta 163)
2. Esquiva isReady do defensor (carta 144)
3. resolveCombat(atk, def)
```

---

## 7. INVENTÁRIO DE CARTAS — 29/04/2026

### ✅ Validadas no TestLab (~52 cartas)

**Pré-sprint (20):**
`11, 13, 18, 131, 139, 159, 160, 161, 162, 189, 190, 191, 192, 193, 194, 211, 212, 213, 214, TOK_SHENLONG`

**Bloco 4 (6):**
`131(Zoro), 132(Trunks), 133(Goten), 136(Boruto), 137(Rock Lee), 193(Groot)`

**Lote 5A (6):**
`163(Mulher Invisivel), 144(Homem-Formiga), 194(Gaviao Arqueiro), 192(Rocket Raccoon), 191(Duende Verde), 190(Caveira Vermelha)`

**Lotes 5B+5C (8):**
`28(Adao Negro), 29(Shazam), 35(Gohan Beast), 86(Luffy Gear 5), 87(Mulher Maravilha), 146(Coisa), 148(Tocha Humana), 151(Drax)`

**Lotes 5D+5E — validados em 29/04 (10):**
`126(Iron Man), 127(Pantera Negra), 150(Estelar), 152(Gamora), 154(Ciclope), 157(Oob), 158(Killmonger), 172(Kuririn), 173(Tenshinhan), 175(Sakura)`

### ⏳ Lote 5F — validação pendente (5)
`138, 145, 164, 165, 195`

### 🔲 Cartas com HB para implementar — restantes (~47)

**🟢 SIMPLES** (~8 restantes) — ~25min cada
`147(Pietro), 150(já feito), 154(já feito), 157(já feito), 158(já feito), 172(já feito), 173(já feito), 175(já feito), 181(Chopper)`

Simples reais restantes: `147, 181`

**🟡 MÉDIO** (~28 restantes) — ~1h cada
`25, 26, 27, 31, 33, 34, 36, 47, 49, 51, 52, 55, 56, 57, 59, 60, 63, 76, 77, 90, 91, 92, 93, 94, 95, 128, 139`

**🔴 COMPLEXO** (~21 restantes) — ~2h cada
`6, 11, 13, 14, 15, 17, 18, 19, 20, 22, 37, 44, 50, 53, 54, 58, 64, 96, 97, 98, 111, 112, 113`

### Cartas especiais (~40) — após guerreiros
Efeitos, Equipes, Zetas, Joias, Manopla, Fusões — ~30h

### 74 sem HB (DLC — não tocar)
Inalterado.

---

## 8. BUGS ABERTOS

Nenhum bug crítico aberto. TestLab estável.

### AUDs pendentes (não críticos)
| ID | Bug | Status |
|----|-----|--------|
| AUD-017 | Logout visual sem encerramento real | ⏳ Bloco 9+ |
| AUD-018 | tsc + lint quebrados | ⏳ Bloco 12 |
| AUD-019 | UID logado no console | ⏳ Bloco 12 |
| AUD-020 | Sem testes automatizados | ⏳ Bloco 12 |

---

## 9. PLANO COMPLETO — DAQUI ATÉ O RELEASE

| Bloco | Escopo | Status | Período | Estimativa |
|-------|--------|--------|---------|-----------|
| **Blocos 0–5** | Motor + infraestrutura + cartas simples | ✅ ~95% | Abr/2026 | — |
| **Bloco 5F** | Validar 5 cartas pendentes | 🔄 | 29/04–30/04 | ~1h |
| **Bloco 6** | ~28 cartas médias | ⏳ | 01/05–27/05 | ~28h |
| **Bloco 7** | ~21 cartas complexas | ⏳ | 28/05–01/07 | ~42h |
| **Bloco 8** | ~40 cartas especiais | ⏳ | 02/07–22/07 | ~30h |
| **Bloco 9** | Arena multiplayer | ⏳ | 23/07–21/08 | ~40h |
| **Bloco 10** | Gacha + Shop | ⏳ | 22/08–10/09 | ~20h |
| **Bloco 11** | Ranking + Troféus | ⏳ | 11–25/09 | ~15h |
| **Bloco 12** | Polimento Release Dev | ⏳ | 26/09–16/10 | ~20h |

**Release Dev estimado: outubro/novembro 2026**
**Release Original (personagens do livro): TBD — aguarda livro**

> Riscos de atraso: Bloco 7 (cartas com mecânicas únicas como Cell, Kakashi, Feiticeira Escarlate) e Bloco 9 (Firebase RTDB em tempo real). Buffer de 1 semana recomendado em cada.

---

## 10. PRÓXIMA SESSÃO

### Tarefa 1 — Lote 5F: Validar cartas pendentes
**IDE:** Antigravity | **Modelo:** Gemini Flash (Fast) | **Reserva:** Codex mini

```
TAREFA PARA O ANTIGRAVITY:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Tarefa: Validar e implementar HBs no TestLab para as cartas: 138, 145, 164, 165, 195

Para cada carta:
1. Verificar ATK/DEF em cards.ts (NUNCA hardcodar)
2. Verificar descricao da HB no CSV oficial
3. Se HB ja existe: testar no TestLab e confirmar que funciona corretamente
4. Se HB nao existe ou esta incorreta: implementar conforme CSV
5. Testar cada carta antes de avancar

REGRAS:
- str_replace cirurgico
- Spread operator em mutacoes
- SEM acentos ou emojis
- ID numerico como string
- npm run build deve passar apos cada carta

RELATORIO ESPERADO:
Para cada ID: funcionou / teve que corrigir o que / comportamento validado
```

### Tarefa 2 — Ajuste textos via CardEditor
**IDE:** Antigravity | **Modelo:** Gemini Flash (Fast)

```
TAREFA PARA O ANTIGRAVITY:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Arquivo: src/pages/CardEditor.tsx
Tarefa: Verificar e corrigir textos/descricoes de cartas que precisam de ajuste.

Guilherme vai indicar quais IDs precisam de ajuste de texto.
Para cada carta: localizar no CardEditor, ajustar o campo description/ability
conforme indicado. Campo id deve permanecer readonly.

REGRAS: str_replace cirurgico | SEM acentos nos campos de codigo
```

### Tarefa 3 — Início Bloco 6: Lote 6A (cartas médias)
**IDE:** Antigravity | **Modelo:** Claude Sonnet (Planning) | **Reserva:** Codex GPT-5.4
**Após validar Lote 5F**

```
TAREFA PARA O ANTIGRAVITY:
Leia AGENTS.md e ARQUITETURA.md e confirme.

Implementar HBs no TestLab para as cartas: 25, 26, 27, 31, 33

Para cada carta, consultar cards.ts para ATK/DEF e CSV para HB.
Cartas medias: cada uma tem multiplos efeitos, timer ou condicional.
Planejar cada HB antes de implementar. Apresentar o plano para aprovacao.

REGRAS: str_replace cirurgico | Spread operator | ASCII puro | NUNCA hardcodar

CARTAS:
25 — Superman Prime: Absorve energia solar, dobra ATK, imune a AT e atravessa barreiras por 3T.
26 — Goku (Instinto Superior): Esquiva de AT/HB/EF. Kamehameha elimina 1 oponente por T. 3T.
27 — Vegeta (Ultra Ego): Por 2T elimina quem tocar, ao ser atingido resiste e contra-ataca.
31 — Jiren: Aumenta ATK 50%, anula EF do oponente, reduz 50% AT contra si. 3T.
33 — Freeza Black: Por 3T dobra PT e concede contra-ataque imediato ao ser atingido.
```

---

## 11. CHECKPOINTS

```
PONTO 0 — 05/03/2026 — Estrutura de gestão fundada.
PONTO 1 — 19/03/2026 — HP canônico 8.000.
PONTO 2 — 18/04/2026 — 20 AUDs mapeados. Nexus Ascension.
PONTO 3 — 22/04/2026 — Blocos 0–3. Motor criado.
PONTO 4 — 22/04/2026 — Bloco 4. Motor blindado. interactionMode.
PONTO 5 — 22/04/2026 — Lotes 5A, 5B, 5C. TestLab reestruturado.
PONTO 6 — 29/04/2026 — Lotes 5D+5E (10 cartas). Fix Mão→Arena. Drag & Drop. UI estável.
PONTO 7 — [pendente] — Após Lote 5F validado + Bloco 6 iniciado.
```

---

## 12. ARSENAL DE FERRAMENTAS

| Tipo de tarefa | IDE principal | Modelo | Reserva |
|----------------|--------------|--------|---------|
| Arquivo grande (>500L) | Codex App | GPT-5.4 | Antigravity Sonnet |
| 1–2 linhas simples | Antigravity | Gemini Flash (Fast) | Codex mini |
| Multi-arquivo (3+) | Codex App | GPT-5.4 + /review | Cursor BYOK |
| UI/componente visual | Antigravity | Claude Sonnet (Planning) | Trae |
| Carta simples | Antigravity | Gemini Flash (Fast) | Codex mini |
| Carta média | Antigravity | Claude Sonnet (Planning) | Codex GPT-5.4 |
| Carta complexa | Codex App | GPT-5.4 + /review | Cursor BYOK |
| Firebase/backend | Codex App | GPT-5.4 | Cursor BYOK |
| Sem cota | Cursor BYOK | Gemini AI Studio | Kilo Code + Groq |

**⚠️ NUNCA Flash em BattleContext.tsx ou TestLab.tsx.**
**⚠️ NUNCA Windsurf + Cursor ao mesmo tempo.**

---

## 13. LIÇÕES APRENDIDAS

- **L14:** Codex corrompe encoding. ASCII puro em dev.
- **L15:** Nunca refatorar UI e lógica ao mesmo tempo.
- **L16:** Motor canônico primeiro. Depois cartas.
- **L17:** Múltiplas flags de clique = bugs. Sempre interactionMode.
- **L18:** Clique para após implementar cartas = estado de interação corrompido.
- **L19:** Build pode passar mas ReferenceError trava React silenciosamente. Sempre testar no browser.

---

## 14. DECISÕES REGISTRADAS

| Data | Decisão |
|------|---------|
| 19/03/2026 | HP canônico: **8.000** |
| 18/04/2026 | Renomeação: **Nexus Ascension** |
| 22/04/2026 | Namespace localStorage: **nexus_v2_** |
| 22/04/2026 | TestLab: **ASCII puro** |
| 22/04/2026 | **interactionMode** como máquina de estados única |
| 22/04/2026 | **Ordem executeAttack:** 163 → 144 → resolveCombat |
| 22/04/2026 | Arena TestLab: **14 slots por jogador** |
| 29/04/2026 | Drag & Drop Mão↔Arena com swap via Spread Operator |
| 29/04/2026 | ~52% concluído. Lotes 5D+5E entregues. |

---

_Nexus Ascension (ex-JC Card Wars) — 29/04/2026 | v7.1_
_Atualizar após cada sessão significativa ou decisão tomada._
