# 📜 JC CARD WARS - HISTÓRICO DE DESENVOLVIMENTO

## [Fase 4 - Refinamentos Finais] - 2026-02-10 01:18
- ✅ **Fix Caveira Vermelha (ID 190)**: Botão conectado e funcionando
  - Clicar em "USAR EFEITO" ativa `isReady = true`
  - Feedback visual: Brilho roxo neon quando `isReady = true`
  - Próxima kill concede +400 DEF permanente e -50% ATK nos demais por 2T
- ✅ **Restauração de Busca**: Cartas Zeta e Efeito agora visíveis
  - Apenas Tokens/Totens (Shenlong, Lacaio) permanecem ocultos
  - Permite buscar e visualizar cartas de fusão
- ✅ **Slot de Reserva**: Interface implementada
  - UI com borda tracejada e fundo semi-transparente
  - Drag & Drop funcional (mão ↔ reserva)
  - Botão de remoção no hover
- ✅ **Gatilho Shenlong**: Invocação automática implementada
  - Monitora campo do jogador via useEffect
  - Ao reunir 7 Esferas: remove todas e invoca Shenlong (TOK_SHENLONG)
  - Log épico: "🐉 ✨ AS 7 ESFERAS DO DRAGÃO FORAM REUNIDAS!"
- 🔍 **Busca "Original"**: Encontrado apenas em tipos/comentários
  - `Original/Geral` (universo de 1 carta)
  - Campos `originalAttack`, `originalHealth`, `originalOwner` (sistema de buffs)
  - Sem pastas `dev/` ou `prod/` separadas

## [Fase 3 - Rework e Privacidade] - 2026-02-10
- ✅ **Rework Caveira Vermelha (ID 190)**: Mudou de passivo para ativação manual
  - Agora requer clicar em "USAR EFEITO" para ativar estado `isReady`
  - Próxima kill concede +400 DEF **permanente** (sem timer)
  - Aplica -50% ATK nos demais inimigos por 2T (com timer visível)
- ✅ **Fix Asa Noturna (ID 189)**: Imunidade agora protege tanto ao defender quanto ao atacar
  - Quando imune, não recebe dano de contra-ataque
  - Corrigido bug onde morria ao atacar cartas mais fracas
- ✅ **Filtro de Privacidade**: Cartas especiais agora ocultas de buscas
  - Removidas: Zeta, Token, Esfera, Shenlong, Peça (exclusivas de fusão)
- ✅ **Novo Setup do Lab**: Atualizado para testes de soldados
  - Player: Asa Noturna (189), Caveira Vermelha (190), Soldados (187, 188)
  - Oponente: Recrutas sem efeito (202-206) com DEF baixa
- ✅ **Slot de Reserva**: Adicionado estado para futuras implementações
- 🛠️ **Arquivos DEV encontrados**: 
  - `/public/dev_cards/` (vazio)
  - `/dist/dev_cards/` (vazio)
  - `CardContext.tsx` com modo DEV/PROD ativo

## [Fase 2 - Soldados] - Data Anterior
- ✅ Implementado: Lógica de Múltiplos Alvos (Duende Verde - ID 191).
- ✅ Fix: Passiva de Morte (Caveira Vermelha - ID 190) agora soma DEF corretamente.
- ✅ Fix: Imunidade (Asa Noturna - ID 189) agora bloqueia dano sem matar atacante.
- 🛠️ Fix: Backup Git falhou (Resolvido Manualmente).
- 🛠️ Pendente: Ajuste de Layout Mobile.

## [Fase 1 - Infraestrutura]
- ✅ Motor de Jogo (Turnos, Ataque, Defesa).
- ✅ Sistema de Upload de Cartas (Backend 3001).
- ✅ Deploy Vercel (Frontend 5173).
