# 🗂️ HISTORY.md - BANCO DE DADOS DE PROGRESSO
**JC CARD WARS - Registro de Implementações e Validações**

---

## 📋 STATUS DE CARTAS VALIDADAS (100%)

### ✅ Heróis Elite (Motor Estável)
| ID | Nome | Status | Observações |
|----|------|--------|-------------|
| **11** | Homem de Ferro | ✅ VALIDADO | Dobra ATK por 3T. Sistema de buff temporário funcional. |
| **13** | Hulk | ✅ VALIDADO | Aumenta ATK em 1000 por 2T. Motor de Darkseid estável. |
| **18** | Pantera Negra | ✅ VALIDADO | Aumenta DEF em 800. Motor de Odin funcional. |

### ✅ Soldados (Implementados e Testados)
| ID | Nome | Status | Observações |
|----|------|--------|-------------|
| **189** | Asa Noturna (Robin) | ✅ VALIDADO | Imunidade funcional (defesa + ataque). Buff de ATK +50% por 2T. |
| **190** | Caveira Vermelha | ✅ VALIDADO | Ativação manual com `isReady`. +400 DEF permanente ao matar. Debuff -50% ATK nos inimigos por 2T. |
| **191** | Duende Verde | ✅ VALIDADO | Seleção múltipla (até 2 alvos). Destrói cartas com DEF < 1000. Botão CANCELAR implementado. |
| **192** | Rocket Raccoon | ✅ VALIDADO | Reduz DEF em 50%. Elimina cartas com DEF < 600. |
| **193** | Groot | ✅ VALIDADO | Passiva de morte: Renascimento como Escudo Vivo. 3 camadas de proteção que absorvem ataques. |
| **194** | Gavião Arqueiro | ✅ VALIDADO | Dano fixo de 1500 ignorando escudos. Seleção manual de alvo. |
| **211** | Alerquina | ✅ VALIDADO | Triplica ATK, reduz DEF pela metade por 3T. |
| **212** | Coringa | ✅ VALIDADO | Rouba carta aleatória da mão do oponente. |
| **213** | Nami | ✅ VALIDADO | +400 DEF própria, -200 DEF nos adversários por 2T. |
| **214** | Usopp | ✅ VALIDADO | Ataque extra de 500 no turno. |

### ✅ Sistemas Especiais
| Sistema | Status | Descrição |
|---------|--------|-----------|
| **Shenlong (Esferas)** | ✅ VALIDADO | Gatilho automático ao reunir 7 Esferas. Remove Esferas e invoca Token Shenlong (TOK_SHENLONG). |
| **Imunidade (Asa Noturna)** | ✅ VALIDADO | Bloqueia dano tanto ao defender quanto ao atacar. |
| **Múltiplos Alvos (Duende Verde)** | ✅ VALIDADO | Permite selecionar até 2 alvos com DEF < 1000. |
| **Feedback Visual (isReady)** | ✅ VALIDADO | Brilho roxo neon quando carta está "armada" (Caveira Vermelha). |

---

## 🔧 MECÂNICAS IMPLEMENTADAS

### 🎮 Sistema de Combate
- **Ataque Direto:** Cálculo de dano com contra-ataque
- **Imunidade:** Proteção total contra dano (atacante e defensor)
- **Morte em Combate:** Detecção e remoção de cartas destruídas
- **Passivas de Morte:** Gatilhos automáticos (Caveira Vermelha, Groot)

### 📜 Log de Batalha
- **Linguagem Natural:** Mensagens simplificadas sem IDs técnicos
- **Estado Inicial:** Minimizado por padrão (`logsCollapsed: false`)
- **Toggle:** Botão ChevronDown/Up para expandir/recolher
- **Exemplos:**
  - ✅ "Caveira Vermelha está pronto para o abate!"
  - ✅ "Asa Noturna bloqueou o ataque!"
  - ✅ "Nami usou Furacão!"
  - ✅ "Coringa roubou uma carta!"

### 🔍 Overlay de Busca
- **Fuzzy Search:** Busca por proximidade (70% de similaridade)
- **Botões Rápidos:** [✋ MÃO] [🎯 P1] [🎯 P2] integrados aos resultados
- **Filtros:** Oculta apenas Tokens/Totens (Shenlong, Lacaio)
- **Exemplos de Busca:**
  - "Shenl" → Encontra "Shenlong"
  - "Alerq" → Encontra "Alerquina"
  - "Asa Noturn" → Encontra "Asa Noturna"

### ⏱️ Sistema de Turnos
- **Controle de Duração:** Efeitos temporários com contador de turnos
- **Reversão de Status:** Buffs/debuffs removidos automaticamente
- **Timers Visuais:** Exibição de turnos restantes (ex: "⚡ 3T")
- **Limpeza Automática:** `statusText` removido quando timer zera

### ⚡ Ability Engine
- **Parser de Habilidades:** `parseAbilityToEffects()` em `AbilityEngine.ts`
- **Tipos de Gatilho:**
  - `onActivate` - Ativação manual (botão "USAR EFEITO")
  - `passive` - Ativação automática (condições específicas)
  - `onDeath` - Dispara ao morrer
  - `onSummon` - Dispara ao entrar no campo
- **Seleção de Alvos:** Sistema REQUIRES_TARGET para cartas que precisam de alvo manual

---

## 🔮 BACKLOG (PLANEJAMENTO FUTURO)

### 💡 Slot de Reserva (REMOVIDO DO TESTLAB)
**Status:** Implementação adiada para Arena.tsx

**Descrição Original:**
- Slot único com borda tracejada e fundo semi-transparente
- Drag & Drop funcional (mão ↔ reserva)
- Botão de remoção no hover
- Label: `📦 RESERVA` (roxo, uppercase)

**Código de Referência:**
```tsx
const [reserveSlot, setReserveSlot] = useState<any>(null);

// UI Component
<div className="p-3 border-b border-white/5">
    <div className="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2">
        📦 RESERVA
    </div>
    <div
        draggable={!!reserveSlot}
        onDragStart={() => handleDragStart('hand', -1)}
        onDragOver={handleDragOver}
        onDrop={(e) => {
            // Lógica de troca entre mão e reserva
        }}
        className={`h-16 rounded-lg border-2 border-dashed transition-all relative group ${
            reserveSlot
                ? 'bg-purple-500/10 border-purple-500/40 hover:bg-purple-500/20 cursor-grab'
                : 'bg-white/5 border-white/20 hover:border-purple-500/30'
        }`}
    >
        {/* Conteúdo do slot */}
    </div>
</div>
```

**Motivo da Remoção:** Funcionalidade mais adequada para o modo Arena (partidas reais), não para o Laboratório de testes.

**Implementação Futura (Arena.tsx):**
- Adicionar estado `reserveSlot` no contexto de batalha
- Permitir trocar cartas entre mão e reserva durante o turno
- Limite de 1 troca por turno (regra de jogo)
- Animação de transição ao mover cartas
- **Mecânica de Jogo:** Ocultar cartas do oponente (estratégia)

### 📱 Modo Mobile
**Status:** Planejado

**Requisitos:**
- Responsividade vertical para dispositivos móveis
- Layout adaptativo (campos empilhados)
- Controles touch-friendly
- Gestos de swipe para ações rápidas

### 👑 Cartas Elite/Divinas
**Status:** Planejado

**IDs a Implementar:** 1-10
- Lógicas de alto nível
- Efeitos complexos e combinados
- Animações especiais
- Balanceamento de poder

---

## 🛠️ SISTEMAS TÉCNICOS IMPLEMENTADOS

### 🎨 Filtros de Busca
**Status:** ✅ Funcional

**Configuração Atual:**
- **Visíveis:** Zeta, Efeito, Soldados, Heróis, Divinos
- **Ocultos:** Token, Totem, Lacaio, Shenlong (apenas tokens de invocação)

**Código:**
```tsx
const excludeKeywords = ['token', 'totem', 'lacaio', 'shenlong'];
```

### 🎯 Sistema de Alvos
**Status:** ✅ Funcional

**Cartas que Requerem Seleção Manual:**
- ID 191 (Duende Verde) - Até 2 alvos
- ID 194 (Gavião Arqueiro) - 1 alvo
- ID 195 (Mysterio) - 1 alvo

**Lista de Controle:**
```tsx
const REQUIRES_TARGET = ['191', '194', '195'];
```

### 📊 Sistema de Buffs/Debuffs
**Status:** ✅ Funcional

**Campos de Controle:**
- `originalAttack` - ATK original para reverter buffs
- `originalHealth` - DEF original para reverter buffs
- `effectTurns` - Contador de turnos do efeito
- `statusText` - Texto visual do status (ex: "⚡ 3T")
- `statusEffect` - Label do efeito (ex: 'immune', 'weakened')
- `isReady` - Estado de prontidão (Caveira Vermelha)
- `hasRevived` - Marca se já renasceu (Groot)

---

## 📝 NOTAS DE DESENVOLVIMENTO

### 🔧 Arquitetura de Cartas
**Localização:** `src/data/cards.ts`

**Estrutura:**
```typescript
{
    id: string,
    name: string,
    universe: string,
    atk: number,
    def: number,
    rarity: string,
    description: string,
    image: string
}
```

**Raridades Disponíveis:**
- Soldado (700-750 ATK/DEF)
- Paladino (800-1000 ATK/DEF)
- Herói (1000-1500 ATK/DEF)
- Divino (2000+ ATK/DEF)
- Efeito (0 ATK/DEF, habilidades especiais)
- Zeta (Cartas de fusão/combo)
- Fusão (Resultado de combinações)

### 🎮 Motor de Habilidades
**Localização:** `src/utils/AbilityEngine.ts`

**Tipos de Gatilho:**
- `onActivate` - Ativação manual (botão "USAR EFEITO")
- `passive` - Ativação automática (condições específicas)
- `onDeath` - Dispara ao morrer
- `onSummon` - Dispara ao entrar no campo

**Exemplo de Implementação:**
```typescript
'190': () => [{
    trigger: 'onActivate',
    type: 'buffDef',
    target: 'self',
    value: 400,
    operation: 'add',
    description: 'O próximo adversário que destruir, ganha +400 DEF e reduz 50% do AT dos oponentes por 2T.',
    requiresTarget: false
}]
```

---

## 🚀 PRÓXIMAS IMPLEMENTAÇÕES PLANEJADAS

### 🎯 Curto Prazo (Concluído)
- [x] Fuzzy Search (busca por proximidade)
- [x] Botões de ação rápida no overlay de busca ([✋ MÃO] [🎯 P1] [🎯 P2])
- [x] Logs colapsáveis e simplificados
- [x] Linguagem de jogo nos logs (remover termos técnicos)
- [x] Remoção de botões laterais duplicados
- [x] Setup Lab otimizado (apenas Caveira + Soldados/Recrutas)

### 🔮 Médio Prazo
- [ ] Slot de Reserva na Arena.tsx
- [ ] Sistema de cemitério (graveyard)
- [ ] Animações de ataque/defesa
- [ ] Efeitos sonoros
- [ ] Modo Mobile responsivo

### 🌟 Longo Prazo
- [ ] Cartas Elite/Divinas (IDs 1-10)
- [ ] Modo multiplayer online
- [ ] Sistema de ranking
- [ ] Torneios automatizados
- [ ] Editor de cartas customizadas

---

## 📚 REFERÊNCIAS RÁPIDAS

### 🔗 Arquivos Principais
- **TestLab:** `src/pages/TestLab.tsx` (Laboratório de testes)
- **Arena:** `src/pages/Battle.tsx` (Partidas reais)
- **Cartas:** `src/data/cards.ts` (Banco de dados de cartas)
- **Engine:** `src/utils/AbilityEngine.ts` (Motor de habilidades)
- **Contexto:** `src/contexts/CardContext.tsx` (Gerenciamento de estado)

### 🎨 Convenções de Código
- **IDs de Cartas:** String numérica (ex: "189", "190")
- **IDs de Tokens:** Prefixo "TOK_" (ex: "TOK_SHENLONG")
- **Estados Booleanos:** Prefixo "is" (ex: `isReady`, `isImmune`)
- **Contadores:** Sufixo "Turns" ou "Count" (ex: `effectTurns`, `esferasCount`)

### 🎯 Comandos de Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Iniciar backend
node server.cjs

# Build de produção
npm run build

# Preview de produção
npm run preview
```

---

## 📊 ESTATÍSTICAS DO PROJETO

### ✅ Cartas Implementadas
- **Total:** 214 cartas
- **Validadas:** 14 cartas (100% funcional)
- **Pendentes:** 200 cartas (lógica básica)

### 🎮 Sistemas Funcionais
- ✅ Motor de Combate
- ✅ Sistema de Turnos
- ✅ Ability Engine
- ✅ Fuzzy Search
- ✅ Logs Colapsáveis
- ✅ Overlay de Busca
- ✅ Drag & Drop
- ✅ Histórico (Undo/Redo)

### 🔧 Arquivos Modificados (Fase 5)
- `HISTORY.md` (NOVO)
- `src/data/cards.ts`
- `src/pages/TestLab.tsx`
- `src/utils/AbilityEngine.ts`

---

---

## 🚧 FASE 6 - IMPLEMENTAÇÃO DE SOLDADOS AVANÇADOS (EM ANDAMENTO)

**Data de Início:** 2026-02-10 14:22

### 🎯 Objetivos da Fase:
1. **Fix Definitivo - Caveira Vermelha (ID 190)**
   - Ativação manual via botão [USAR EFEITO]
   - Gatilho no combate: +400 DEF permanente ao matar
   - Debuff coletivo: -50% ATK nos inimigos por 2T
   - Reset automático de `isReady`

2. **Implementação - Groot (ID 193)**
   - Passiva de morte: Renascimento como "Escudo Vivo"
   - Mecânica de camadas: 3 camadas de proteção
   - Absorção de dano para aliados adjacentes
   - Remoção definitiva ao esgotar camadas

3. **Implementação - Gavião Arqueiro (ID 194)**
   - Habilidade ativa: Dano fixo de 1500
   - Seleção de alvo manual
   - Ignora escudos e buffs de defesa
   - Subtração direta de DEF

### 📝 Status de Implementação:
- [x] **Caveira Vermelha (ID 190)** - ✅ VALIDADO
  - Ativação manual via botão [USAR EFEITO] → `isReady: true`
  - Feedback visual: Brilho roxo neon
  - Gatilho no combate: +400 DEF permanente ao matar
  - Debuff coletivo: -50% ATK nos inimigos por 2T
  - Reset automático de `isReady` após disparo
  - Log: "Caveira Vermelha espalhou o caos no campo!"

- [x] **Groot (ID 193)** - ✅ VALIDADO
  - Passiva de morte: Renascimento como "Escudo Vivo"
  - Mecânica de camadas: 3 camadas de proteção (`shieldLayers: 3`)
  - Absorção de dano: Cada ataque consome 1 camada
  - ATK: 0 (escudo não ataca)
  - HP: 1 (mínimo para existir)
  - Remoção definitiva ao esgotar todas as camadas
  - Log: "Groot se sacrificou para proteger os aliados!"

- [x] **Gavião Arqueiro (ID 194)** - ✅ VALIDADO
  - Habilidade ativa: Dano fixo de 1500
  - Seleção de alvo manual (sistema REQUIRES_TARGET)
  - Ignora escudos e buffs de defesa
  - Subtração direta de DEF (não é ataque padrão)
  - Log: "Gavião Arqueiro disparou uma flecha certeira!"

### 🎯 Resultados da Fase 6:
**Status:** ✅ CONCLUÍDA COM SUCESSO

**Cartas Validadas:** 3/3 (100%)
- Caveira Vermelha (190): Ativação manual + Debuff coletivo
- Groot (193): Escudo Vivo com 3 camadas
- Gavião Arqueiro (194): Dano fixo direcionado

**Sistemas Implementados:**
- ✅ Mecânica de Escudo com Camadas (Groot)
- ✅ Absorção de Dano por Camadas
- ✅ Logs de Jogo Imersivos
- ✅ Interface TestUnit expandida (`shieldLayers`)

---

**Última Atualização:** 2026-02-10 14:22  
**Versão do Projeto:** Fase 6 - Soldados Avançados (CONCLUÍDA)  

---

## 🚧 FASE 7 - TESTLAB & REFINAMENTOS DE COMBATE (CONCLUÍDA)

**Data de Início:** 2026-02-10 17:00

### 🎯 Objetivos:
1.  **Refinamento de Combate:**
    - Corrigir dano parcial ao atacante vencedor (agora sai ileso).
    - Mysterio: Implementar popup customizado e lógica de bloqueio.

2.  **TestLab UX:**
    - **Busca Avançada:** Suporte a `at500`, `df650`, `pt1000` (regex).
    - **Visualização de Busca:** Stats visíveis por padrão, botões expandem ao clicar.
    - **Setup Automatizado:** Botão "🧪 CARREGAR CENÁRIO" para testes rápidos.

### ✅ Resultados:
- **Combate:** Atacante mais forte não perde DEF ao eliminar defensor.
- **Busca:** Funcionando com prefixos `at`, `df`, `pt` (busca exata).
- **Mysterio:** Popup customizado funcional e lógica de bloqueio validada.
- **Documentação:** Gerado `CARDS_MASTER_LIST.md` contendo o registro completo e status de implementação das 214 cartas.
- **Paladinos Fase 1:** Implementado cenário de teste e lógica para Deadpool (Renascer), Cap. América (Reflexão), Shuri (Buff Área) e Homem Elástico (Proteção/Buff).
- **Paladinos Fix v3.6:** Sistema de Cemitério com Modal, Deadpool Reviver (Sel. Manual), Shuri (Expiração 3T), Capitão/Reed (Postura Defensiva + Interceptação Manual).
- **UI Update:** Removido cenário de teste 'Mysterio' e reorganizado layout dos botões de controle e cemitério na sidebar.

**Última Atualização:** 2026-02-12 23:25
**Versão do Projeto:** Fase 7 - TestLab & Refinamentos (CONCLUÍDA)
**Próxima Fase:** Implementação de Cartas Elite/Divinas (IDs 1-10)
