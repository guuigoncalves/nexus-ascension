# GESTÃO — NEXUS ASCENSION
**Versão:** 12.0 | **Data:** 09/05/2026 | **Gerado por:** Claude (Chat de Gestão)
**Documento canônico único. Cole este arquivo para retomar o projeto.**

---

## COMO USAR ESTE CHAT

Você é o **Chat de Gestão** do projeto Nexus Ascension.

**Responsabilidades:**
- Decidir o que fazer e gerar instruções precisas para executores
- Atualizar este documento após cada sessão
- Receber resultados e decidir próximo passo
- **Nunca editar código diretamente**

**Para iniciar nova sessão:**
1. Abrir novo chat no Claude.ai (projeto Nexus Ascension)
2. Colar este arquivo completo
3. Colar relatório do executor se houver
4. Dizer: "Você é o Chat de Gestão do Nexus Ascension. Confirme que entendeu."

**Primeira coisa que o novo chat deve fazer:**
Perguntar se Guilherme quer trabalho paralelo (múltiplos agentes) ou sequencial. Ver Seção 12.

---

## ESTRUTURA DE FERRAMENTAS

| Papel | Ferramenta | Função |
|-------|-----------|--------|
| Chat de Gestão | Claude (claude.ai) | Decide, documenta, gera instruções |
| Executor principal | Codex App/CLI (OpenAI) | /goal autônomo, bugs profundos, arquivos > 150KB |
| Executor UI/UX | Antigravity (Google) | Interface, layout, preview visual, Skills |
| Executor alternativo | Windsurf | Backend alternativo — cota um pouco maior que Cursor |
| Alternativo UI | Trae | Fallback do Antigravity |
| Backstop ilimitado | Kilo Code / Cline | BYOK gratuito — emergências sem cota |
| Backstop terminal | OpenCode | Fallback do Codex CLI quando cota esgotar |

> **Nota sobre Cursor:** Trava rapidamente. Usar apenas para fixes pontuais de 1-2 linhas via BYOK.
> **Nota sobre Windsurf:** Cota ligeiramente maior que Cursor. Histórico crítico — revisar TODO diff antes de aceitar.
> **Fluxo é 100% gratuito.** Codex App via ChatGPT Plus ($20/mês já pago para outros fins) é o único custo.

**Fluxo obrigatório:**
1. Claude decide e gera instrução precisa com IDE/modelo
2. Thread no executor: "Leia o AGENTS.md e o ARQUITETURA.md e confirme."
3. Agente confirma, executa, propõe diff
4. Revisar diff, npm run build + testar no browser
5. Trazer resultado para Claude — atualizar documentos

---

## 1. IDENTIDADE DO PROJETO

**Nexus Ascension** (renomeado em 18/04/2026) | Modo principal: Ascension Arena
Nome original: **JC Card Wars (JCCW)** — preservado para rastreabilidade.

| Versão | Personagens | Status |
|--------|------------|--------|
| App atual (Dev) | Copyright (Marvel, DC, Dragon Ball, Naruto, One Piece...) | Em desenvolvimento |
| Jogo original (futuro) | Personagens do livro de Guilherme | Aguarda livro |

**Status:** ALPHA — ~58% concluído
**Pasta local:** ~/Documentos/Projetos IDEs/jc-card-wars
**Dev:** http://localhost:5174/ | **Deploy:** Vercel

---

## 2. STACK

| Campo | Valor |
|-------|-------|
| Máquina | Dell OptiPlex 3060, 8GB RAM, Zorin OS |
| Node | v20.20.0 / npm 10.8.2 |
| React | 19.2.0 |
| Vite | 7.2.4 |
| TypeScript | 5.9.3 |
| Tailwind CSS | 4.1.17 |
| Firebase | 12.6.0 (auth + RTDB; Management API PROIBIDA) |

---

## 3. REGRAS ABSOLUTAS

| # | Regra |
|---|-------|
| R1 | NUNCA usar nome da carta. SEMPRE ID numérico como string. |
| R2 | NUNCA hardcodar ATK/DEF. Sempre de initialCards em cards.ts. |
| R3 | NUNCA criar HB para cartas "não criadas ainda". São DLC. |
| R4 | NUNCA implementar na Arena sem TestLab aprovado. |
| R5 | NUNCA Firebase Management API. |
| R6 | SEMPRE spread operator em mutações. |
| R7 | NUNCA mais de 5–8 cartas por lote. |
| R8 | PROIBIDO cartas repetidas no deck. |
| R9 | NUNCA Windsurf + Cursor simultaneamente (8GB RAM). |
| R10 | Toda edição: str_replace cirúrgico. Nunca reescrever arquivos inteiros. |
| R11 | IDs sagrados. Nunca alterar IDs em cards.ts. |
| R12 | Planning mode PROIBIDO nas IDEs. |
| R13 | Uma mudança por vez. Build + teste no browser antes de declarar concluído. |
| R14 | NUNCA misturar personagens licenciados com originais do livro. |
| R15 | PROIBIDO acentos/emojis em arquivos de dev. ASCII puro. |
| R16 | NUNCA múltiplas flags de estado para cliques. Sempre interactionMode. |
| R17 | NUNCA inventar HB. Sempre usar texto exato da Seção 7 deste documento. |
| R18 | Ao iniciar qualquer lote, confirmar HB de cada ID na Seção 7 ANTES de gerar prompt. |
| R19 | Setup dinâmico: NUNCA injetar IDs hardcoded. Sempre initialCards.find(c => c.id === 'ID'). |

---

## 4. LIÇÕES CRÍTICAS

- **Alucinação de HBs:** AI Studio INVENTA habilidades sem texto oficial. Sempre consultar Seção 7.
- **Encoding:** ASCII puro em dev. Codex corrompe encoding com acentos → Mojibake → JSX quebrado.
- **Estado de clique:** Sempre interactionMode. Nunca flags concorrentes.
- **Build vs Runtime:** Build pode passar mas ReferenceError trava React silenciosamente. Testar no browser.
- **Versões Gemini no Antigravity:** Apenas Gemini 3 Flash, Gemini 3 Pro Low, Gemini 3 Pro High, Claude Sonnet, Claude Opus. NÃO existe "Gemini 1.5" ou "Gemini 2.5" no Antigravity.
- **Reaction Window (Wong/Mysterio):** Implementar simplificado agora. Pausa de decisão entra no Bloco 9.
- **Textos via CardEditor:** Pode gerar overrides no localStorage. Limpar storage resolve.
- **UI e lógica juntas:** Nunca refatorar UI e lógica de cartas no mesmo commit/agente.
- **Trabalho paralelo:** Só funciona quando os arquivos não se cruzam. Ver Seção 12.
- **Regressões de /goal:** O critério de parada do /goal é "build verde", não "jogo funcionando". Sempre validar carta a carta no browser após cada comando. Bugs de lógica passam pelo build silenciosamente.
- **Textos de HB no jogo:** O /goal pode reescrever strings de HB durante refatorações. Após cada ciclo, comparar textos exibidos contra a Seção 7 e corrigir divergências.
- **Cursor:** Trava rapidamente. Reservar para fixes de 1-2 linhas via BYOK. Não usar como executor principal.
- **Fragmentação de contexto (Antigravity):** Thread longa re-lê histórico inteiro a cada prompt, esgotando cota. Regra: tarefa nova = pasta limpa / thread nova.
- **Skills no Antigravity:** Usar @nome-da-skill em vez de forçar leitura contínua do AGENTS.md. Skills injetam contexto apenas quando chamadas, economizando a janela.

---

## 5. ARQUITETURA — ESTADO ATUAL ESTÁVEL

```
Camada 1 — Motor puro
  combatEngine.ts: ATK < DEF = morte do atacante. BLINDADO.
  AbilityEngine.ts: registry limpo, fallback desabilitado.

Camada 2 — Estado
  BattleContext.tsx: todos os hotfixes aplicados.

Camada 3 — Interface
  TestLab.tsx (~200KB):
    interactionMode (IDLE/SELECTING_ATTACK_TARGET/SELECTING_ABILITY_TARGET)
    Drag & Drop / clique Mão-Arena com swap
    Layout grid 2 colunas, barra lateral 260px
    Arena 14 slots por jogador (grid 7x2)
    Botões Voltar/Retroceder/Avançar/L|R acima da barra de pesquisa
    Lista de personagens inline na barra lateral (lupa → X)
    Filtros na lista: status, universo, raridade, AT, DF
    Botão Aleatório com sub-menu: [Adversário] [Meu lado] [Ambos]
    Botão Reset com sub-menu: [Adversário] [Meu lado] [Ambos]
    Aba Habilidades exibe: Nome | AT | DF | texto da HB
    Log renderizado abaixo de Habilidades (Split-Pane, sem abas)
    Setup Dinâmico (initialCards.find — sem IDs hardcoded)
    Setup Escarlate (preset especial para testar carta 53)
    Botão CEM com modal de visualização
    Habilidades do Oponente liberadas para teste
    ASCII puro
```

---

## 6. SISTEMA DE COMBATE — CÂNONE

```
ATK > DEF → defensor morre. Excesso = dano ao HP (trample).
ATK < DEF → atacante morre. DEF defensor -= ATK recebido.
ATK = DEF → empate. HP canônico: 8000

Ordem executeAttack (não alterar):
1. Interceptadores isReady em aliados (carta 163)
2. Esquiva isReady do defensor (carta 144)
3. resolveCombat(atk, def)
```

---

## 7. FONTE DE VERDADE — HABILIDADES OFICIAIS DO CSV

**CONSULTAR AQUI ANTES DE QUALQUER PROMPT DE CARTA.**
Texto marcado com "Carta não criada ainda" = DLC. Não implementar.

### Divinos/Supremos (1–16)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 1 | Ser Acima de Todos | 5000 | 5000 | Carta não criada ainda |
| 2 | Presença | 5000 | 5000 | Carta não criada ainda |
| 3 | Zeno | 4800 | 4800 | Carta não criada ainda |
| 4 | Dr. Manhattan | 4500 | 4300 | Manipula a realidade: troca 1 carta da arena ou cemitério por 1 carta da arena ou cemitério geral. |
| 5 | Whis | 4200 | 4200 | Treina um aliado, sendo ambos removidos da arena por 2T, retornando com +50% em seus PT e HB podendo ser utilizadas. Após isso, Whis pode treinar outro aliado. |
| 6 | Beerus | 4000 | 4000 | Uma vez por T, pode destruir qualquer carta seja na arena ou da mão do oponente. |
| 7 | Eternity | 3900 | 3900 | Carta não criada ainda |
| 8 | Morte | 3900 | 3900 | Carta não criada ainda |
| 9 | Anti-Monitor | 3800 | 3800 | Carta não criada ainda |
| 10 | Galactus | 3700 | 3600 | Drena permanentemente 20% do AT de todas as cartas adversárias na arena. |
| 11 | Darkseid | 3600 | 3500 | Invoca 1 Lacaio com 500 PTs e controla 1 oponente permanentemente. Efeitos cessam se Darkseid for eliminado. |
| 12 | Yhwach | 3500 | 3500 | Carta não criada ainda |
| 13 | Odin | 3400 | 3400 | Pode revelar a mão do oponente e selar uma das cartas da mão permanentemente. |
| 14 | Zeus | 3400 | 3400 | Chuva de raios: reduz 50% do AT de todos os oponentes enquanto Zeus estiver na arena. Com sacrifício de uma carta aliada, também reduz 50% da DF de 1 oponente por T. |
| 15 | Jean Grey (Fênix) | 3300 | 3200 | Controla 1 oponente por 1T. Ao fim do T, destroi o alvo. |
| 16 | Shenlong | 3200 | 3200 | Carta não criada ainda |

### Destruidor/Ômega (17–24)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 17 | Broly | 3100 | 2800 | A cada aliado derrotado aumenta sua ira, e ganha 1000 de AT. Ao perder o 4º aliado, é consumido pela fúria e se autodestrói. |
| 18 | Sentry | 2900 | 2700 | Dobra seu AT e torna-se imune a tudo por 3T. Após isso, a instabilidade cresce e se autodestrói. |
| 19 | Hulk | 2700 | 2400 | Por 3T, entra em fúria, dobrando seu AT e podendo atacar até 2 oponentes por T. Ao fim, retorna a Banner com apenas 100 PT. |
| 20 | Apocalypse | 2600 | 2500 | Pode ressuscitar até 3x, sempre no T seguinte e cada vez com -25% de seus Pts. Na 3ª leva junto dois companheiros. |
| 21 | Ultron | 2500 | 2400 | Carta não criada ainda |
| 22 | Juggernaut | 2400 | 2600 | Sempre que o adversário atacar, ganha +20% AT. Mesmo em modo de DF. Perde a DF na mesma proporção. |
| 23 | Gorr | 2300 | 2200 | Carta não criada ainda |
| 24 | Sentinela | 2200 | 2300 | Carta não criada ainda |

### Lendário/Top Tier (25–39)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 25 | Superman (Prime) | 2500 | 2500 | Absorve energia solar, dobra seu AT e torna-se imune a AT e atravessa barreiras por 3T. |
| 26 | Goku (Instinto Superior) | 2500 | 2450 | Instinto Superior: Esquiva de AT, HB e EF. E usa um Kamehameha que elimina 1 oponente por T. Dura 3T. |
| 27 | Vegeta (Ultra Ego) | 2500 | 2400 | Ultra Ego: por 2T elimina quem tocar, ao ser atingido resiste e contra-ataca, com poder devastador. |
| 28 | Adão Negro | 2450 | 2450 | Causa uma explosão de energia, reduzindo 50% dos PTs dos oponentes. |
| 29 | Shazam | 2400 | 2350 | Poder do trovão: aumenta 600 em seu AT. Lança a energia acumulada, reduzindo 50% DF de todos os oponentes. Dura 3T. |
| 30 | Satoru Gojo | 2400 | 2400 | Carta não criada ainda |
| 31 | Jiren | 2400 | 2350 | Libera seu poder, aumentando seu AT em 50%, anulando todos os EF do oponente e reduzindo 50% dos AT contra si. Dura 3T. |
| 32 | Yoriichi | 2350 | 2300 | Carta não criada ainda |
| 33 | Freeza (Black) | 2300 | 2250 | Por 3T ativa sua Forma Black, dobrando seus PTs e concedendo-lhe um contra-ataque imediato. |
| 34 | Saitama | 2300 | 2250 | Desfere um Soco Avassalador que destrói HB, EF ou guerreiros do alvo escolhido (exceto Divinos). Pode repetir a cada 4T. |
| 35 | Gohan (Beast) | 2300 | 2200 | Desperta sua Forma Beast, aumentando 50% de seu AT por 3T e eliminando um oponente com Makankosappo. |
| 36 | Thor | 2250 | 2200 | Invoca uma poderosa tempestade em seu T, que elimina até 3 oponentes e bloqueia HB dos demais por 2T. |
| 37 | Thanos | 2250 | 2250 | Ativa a Manopla do Infinito, escolhe uma Joia por 2T. Mente: controla 1 oponente. Alma: altera AT, DF ou HB de 1 carta. |
| 38 | Supergirl | 2200 | 2200 | Carta não criada ainda |
| 39 | Superboy-Prime | 2150 | 2150 | Carta não criada ainda |

### Titã (40–58)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 40 | Lobo | 2100 | 2100 | Carta não criada ainda |
| 41 | Ghost Rider | 2050 | 2000 | Carta não criada ainda |
| 42 | Yamamoto | 2050 | 2050 | Carta não criada ainda |
| 43 | Ichigo (Forma Final) | 2000 | 1950 | Carta não criada ainda |
| 44 | Flash | 2000 | 2000 | Volta no tempo e Ressuscita 2 aliados, mas traz 1 inimigo aleatório de volta. |
| 45 | Aang | 1950 | 1950 | Carta não criada ainda |
| 46 | Korra | 1950 | 1950 | Carta não criada ainda |
| 47 | Dr. Estranho | 1950 | 1950 | Olho de Agamotto: Aumenta 1000 em sua própria DF e revive 1 aliado. Dura 3T. |
| 48 | Aizen | 1950 | 1900 | Carta não criada ainda |
| 49 | Capitã Marvel | 1900 | 1850 | Explosão de Fótons: Elimina até 3 oponentes de nível 7 ou inferior. E rouba o AT de 1 deles, somando ao seu. |
| 50 | Dr. Destino | 1900 | 1900 | Rouba a HB de um oponente (ainda não usada). Se o alvo for mágico, reduz seus PTs pela metade. |
| 51 | Magneto | 1850 | 1850 | Cria um campo magnético que paralisa 2 adversários por 2T e destrói oponentes cibernéticos na arena. |
| 52 | Senhor Destino | 1850 | 1800 | Invoca o Elmo de Nabu por 3T. Cria um campo mágico que bloqueia HB inimigas e dobra sua DF e de seus aliados. |
| 53 | Feiticeira Escarlate | 1850 | 1800 | Realidade alternativa: troca todas as cartas da arena (mesma quantidade), pelas de seus cemitérios (aleatoriamente). |
| 54 | Zamasu | 1850 | 1850 | Troca de corpo com um oponente por 3T. Podendo usar a HB da vítima 1x, tendo sido usada antes ou não. |
| 55 | Moro | 1850 | 1900 | Drena o AT de 1 oponente para o seu permanentemente; e, ao ser atacado, absorve 1 AT, e soma à sua DF por 3T. |
| 56 | Hit | 1800 | 1850 | Ao ser atacado, salta no tempo e elimina o oponente antes do golpe. Pode usar 2x. |
| 57 | Toppo | 1850 | 1800 | Ativa a forma Hakaishin: fica imune a AT e HB por 3T e usa Hakai para apagar 1 oponente. |
| 58 | Majin Boo | 1800 | 1750 | Absorve 1 oponente que permanecerá absorvido até a eliminação de Majin Boo. Pode absorver outro oponente a cada 3T. |

### Elite (59–110)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 59 | Goku Black | 1750 | 1800 | Super Saiyajin Rosé: aumenta 1000 em seu AT por 3T e dispara um AT devastador de 1500, ignorando escudos. |
| 60 | Piccolo (Orange) | 1800 | 1750 | Orange: aumenta seu AT em 50%, e reduz AT recebidos em 50%. A cada AT lançado perde 500 de DF, até ser eliminado. |
| 61 | Android 17 | 1750 | 1700 | Absorve 2 AT contra si ou seus aliados (à sua escolha) e adiciona ao seu AT, mas perde 500 de DF por absorção. |
| 62 | Android 18 | 1750 | 1650 | Absorve 1 AT recebido, juntando ao seu próprio AT. |
| 63 | Trunks do Futuro | 1700 | 1750 | Desfere um golpe preciso de 1500 com sua espada a um oponente no seu T seguinte, seu AT aumenta em 50%. |
| 64 | Cell | 1700 | 1650 | Quando ativo em 2T próprios explode, destruindo a arena e todos nela. Após 2T Cell se regenera com AT +50% e DF -50%. |
| 65–75 | Android 16, Toshiro, Kenpachi, Byakuya, Toph, Azula, Eren, Muzan, Edward, Alphonse, Roy | vários | vários | Carta não criada ainda (todos) |
| 76 | Naruto | 1650 | 1600 | Sábio dos Seis Caminhos: Fica imune a AT por 3T e aumenta seu AT em 50% durante esse período. |
| 77 | Sasuke | 1600 | 1650 | Manifesta o Susanoo por 3T, elevando seu AT para 2500; Após isso, perde toda a DF. Se for atacado, devolve o AT com +900. |
| 78–85 | Madara, Kaguya, Minato, Might Guy, Shanks, Mihawk, Oden, Katakuri | vários | vários | Carta não criada ainda (todos) |
| 86 | Luffy (Gear 5) | 1600 | 1550 | Por 2T, dobra seu AT e reduz a DF de todos na arena em 50%. |
| 87 | Mulher Maravilha | 1600 | 1600 | Por 2T, dobra a DF e, a cada T, o Laço da Verdade revela 1 carta virada para baixo. |
| 88 | Aquaman | 1500 | 1550 | Convoca um exército marítimo que elimina os inimigos que tiverem 900 ou menos de AT ou DF. |
| 89 | Ciborgue | 1500 | 1550 | Aumenta seus PT em 50% e desativa oponentes cibernéticos, impedindo-os de atacar ou usar HB. Dura 3T. |
| 90 | Lanterna Verde | 1550 | 1550 | Cria construtos de energia: para realizar AT adicional de 1200. Que pode ser lançado no T do oponente. Dura 3T. |
| 91 | Sinestro | 1550 | 1500 | Usa o anel do medo paralisando AT e HB de 1 oponente por 2T. E absorve 50% de sua DF permanentemente. |
| 92 | Visão | 1550 | 1520 | Fica intangível por 3T, não sofrendo com AT, HB e EF. Pode atravessar escudos. |
| 93 | Hela | 1550 | 1550 | Cada oponente derrotado aumenta 50% seu AT. Com 1 sacrifício, abre o cemitério inimigo para roubar 1 carta e colocá-la na sua arena. |
| 94 | Loki | 1500 | 1500 | Destrói uma linha do tempo, apagando todas as cartas adversárias do universo escolhido, na arena. (apenas 1x) |
| 95 | Ravena | 1550 | 1500 | Invoca uma aura psíquica que absorve o AT de 2 oponentes (subtraindo deles), transferindo para sua DF. E anula os EF do oponente. Dura 2T. Ao fim, os alvos recuperam o AT perdido. |
| 96 | Professor X | 1450 | 1400 | Controla totalmente 1 oponente da arena ou cemitério por 3T e reduz em 50% os AT recebidos nesse período. |
| 97 | Kratos | 1550 | 1550 | Ao derrotar um oponente, incorpora sua HB. (apenas uma vez) |
| 98 | Itachi Uchiha | 1550 | 1550 | Por 3T Aprisiona o alvo em um genjutsu, impedindo-o de usar AT e HB. E forçando-o a atacar 1 aliado por T. |
| 99–110 | Kokushibo, Scar, Rei Bradley, Zuko, Katara, Levi, Mikasa, Rukia, Renji, Ulquiorra, Monstro Pântano, Etrigan | vários | vários | Carta não criada ainda (todos) |

### Veterano (111–130)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 111 | Gaara | 1400 | 1450 | Imobiliza 1 oponente na areia, reduzindo 50% de sua DF por T. Ao fim do 2T, o oponente é eliminado, a menos que a areia seja atacada com 1700 ou mais. |
| 112 | Orochimaru | 1350 | 1400 | Infecta 1 oponente com sua marca. Após 3T, toma posse de seu corpo. Porém HB permanece a do Orochimaru (reutilizável). |
| 113 | Kakashi | 1350 | 1400 | Sharingan: Copia uma HB que assistiu na arena. Além disso, pode usar Raikiri para eliminar 1 oponente no seu T. |
| 114–125 | Jiraiya, Tsunade, Hiruzen, Ace, Sabo, Jinbe, Sanji, Tanjiro, Barba Branca, Doflamingo, King, Queen | vários | vários | Carta não criada ainda (todos) |
| 126 | Homem de Ferro | 1250 | 1250 | Armadura Força Ômega: aumenta 1000 em seus PT por 3T. Todo dano causado gera um AT extra automático no 4T. |
| 127 | Pantera Negra | 1250 | 1300 | Conecta-se aos ancestrais, aumentando seu AT em 500. Cada oponente derrotado concede +500 de DF permanente. Dura 2T. |
| 128 | Wolverine | 1300 | 1350 | Instinto predatório: dobra seu AT por 2T. Caso resista a um AT durante esse período, reforça 50% sua DF. |
| 129 | Venom | 1300 | 1200 | Toma posse de um oponente unindo seus PTs por 2T. Ao retornar, absorve 50% de seu AT, porém cede sua DF ao oponente. |
| 130 | Ronan | 1300 | 1250 | Por 4T, usa o Cosmi-Rod, eliminando um oponente e tornando-se imune a AT. |

### Gladiador (131–166)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 131 | Roronoa Zoro | 1200 | 1200 | Empunhando suas três espadas, recebe +500 AT por 2T e pode atingir 3 oponentes uma única vez no seu T. |
| 132 | Trunks | 1150 | 1200 | Ao se transformar, ganha 400 PT e reduz em 20% a DF do alvo. Dura 2T. |
| 133 | Goten | 1150 | 1200 | Se transforma, podendo atacar 2 vezes por T; cada AT aumenta em 300 o próximo. |
| 134 | Pain/Nagato | 1200 | 1200 | Carta não criada ainda |
| 135 | Obito | 1200 | 1150 | Carta não criada ainda |
| 136 | Boruto | 1150 | 1150 | Marca um oponente com o Karma, absorvendo sua DF no 1ºT. Seu AT no 2ºT, o destruindo. |
| 137 | Rock Lee (8 Portas) | 1200 | 1100 | Porta da Fera: Acelera seus movimentos, realizando 3 AT por T. Dura 3T. Mas perde 90% de DF definitivamente após isso. |
| 138 | Neji Hyuga | 1100 | 1100 | Ao ser atacado, reduz 80% o AT e caso sobreviva devolve 40%. A cada 3T, revela 1 carta virada para baixo do oponente. |
| 139 | Homem-Aranha | 1100 | 1050 | Imobiliza todos os oponentes, impedindo de usarem AT e HB por 3T. Nesse período aumenta o próprio AT em 50%. |
| 140–143 | Máquina de Combate, Colossus, Homem de Gelo, Carnificina | vários | vários | Carta não criada ainda (todos) |
| 144 | Homem-Formiga (Gigante) | 1000 | 1050 | Reduz seu tamanho para esquivar de 1 AT ou HB. Após, retornar ao normal, dobra seu AT. |
| 145 | Vespa (Gigante) | 1050 | 1000 | Encolhe-se para atacar e, golpeando até 3 oponentes em um T. |
| 146 | Coisa | 1100 | 1100 | Libera sua força bruta, triplicando o AT por 2T. Porém, imediatamente a exaustão o enfraquece, e reduz imediatamente sua DF em 50%. |
| 147 | Pietro Maximoff | 1100 | 1000 | Sua velocidade ultrapassa limites: ataca 2x por T: o primeiro usa seu AT normal, o segundo tem 1800 de AT. Dura 3T. |
| 148 | Tocha Humana | 1000 | 950 | Lança chamas intensas, eliminando oponentes com menos de 700 de DF e reduzindo 500 a DF dos demais na arena. |
| 149 | Mutano | 1000 | 1000 | Pode se transformar em seu T. Escolha: Tigre: dobra o AT. Elefante: dobra a DF. |
| 150 | Estelar | 1050 | 1050 | Canaliza uma explosão de energia que elimina até 2 oponentes a sua escolha. |
| 151 | Drax | 1000 | 1000 | Dobra o AT e reduz a DF dos oponentes em 500, por 2T. |
| 152 | Gamora | 1000 | 1000 | A cada oponente derrotado, aumenta seu AT em 50% e realiza um segundo ataque. |
| 153 | Vampira | 900 | 900 | Absorve os PTs de 1 oponente por T e anula seu AT por 1T. Não pode atacar esse oponente no T da absorção. |
| 154 | Ciclope | 1000 | 950 | Lança um poderoso raio óptico com 1000 de AT. Que acerta até 3 oponentes. |
| 155–156 | Bardock, Nappa | vários | vários | Carta não criada ainda (todos) |
| 157 | Oob | 1000 | 950 | Libera poder oculto por 2T: dobra seu AT e pode atacar 2x por T. Ao fim, perde 50% de sua DF permanentemente. |
| 158 | Eric Killmonger | 950 | 1000 | Aumenta seu AT em 50%. Se derrotar 1 oponente após ativação, sobe para 100%. |
| 159 | Deadpool | 900 | 900 | Quando é derrotado permite ressuscitar uma carta aliada do cemitério (próprio) que recebe 50% de aumento de AT e DF. |
| 160 | Capitão América | 850 | 900 | Bloqueia um AT, e sua escolha: contra si ou aliados, e os rebate para qualquer adversário. Pode ser usado até 2x. |
| 161 | Shuri (Pantera) | 800 | 900 | Invoca armaduras que aumentam em 50% a DF de todos os aliados por 3T. |
| 162 | Homem Elástico | 850 | 900 | Usa seu corpo elástico para proteger a si e seus aliados 2x de AT e HB. Cada uso aumenta instantaneamente sua DF em 500. |
| 163 | Mulher Invisível | 900 | 950 | Cria uma barreira psíquica que desvia até 3 AT (sua escolha), contra si ou aliados. Cada desvio aumenta sua DF em 300. |
| 164 | Wong | 900 | 950 | Cria uma barreira que absorve até 2 AT e redireciona imediatamente o dano a um oponente. |
| 165 | Viúva Negra | 800 | 850 | Desfere AT adicional de 500 e anula ativação de HB dos demais por 2T. |
| 166 | Nebulosa | 850 | 850 | Uma vez por T — pode usar a HB de uma carta do cemitério. Pode ser usada 3T. |

### Paladino (167–186)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 167 | Mística | 850 | 850 | Copia os PTs de 1 adversário na arena. O deixando inconsciente sem atacar por 2T. |
| 168 | Pepper Potts | 800 | 850 | Carta não criada ainda |
| 169 | Agatha Harkness | 850 | 850 | Usa magias ancestrais para selar todos os EF e HB dos oponentes por 4T, anulando ativos e inativos. |
| 170 | Lex Luthor | 900 | 850 | Dura 2T, escolha: ativar o traje avançado para aumentar seus PTs em 1000 ou usar drones para zerar a DF de 2 oponentes. |
| 171 | Aquaman (padrão) | 850 | 850 | Carta não criada ainda |
| 172 | Kuririn | 900 | 900 | Lança um Kienzan em um oponente à sua escolha. Caso o oponente não seja salvo é eliminado. Pode lançar outro após 4T. |
| 173 | Tenshinhan | 850 | 850 | Ativa seu Terceiro Olho, revelando todas as cartas viradas para baixo e a mão do oponente. Dura 2T. |
| 174 | Mestre Kami | 850 | 900 | Sela um oponente em um recipiente com 850 de DF, até o recipiente ser atacado. Todo dano ao recipiente atinge a vítima. |
| 175 | Sakura | 850 | 850 | Cria uma onda de choque que impede todos os oponentes de AT por 2T. E aumenta a DF dos aliados em 400. |
| 176–180 | Yamcha, Hinata, Nico Robin, Franky, Brook | vários | vários | Carta não criada ainda (todos) |
| 181 | Tony Chopper | 750 | 800 | Lança rajada de fogo com 600 de AT a um oponente, ignorando qualquer escudo. Pode ser usado 2T. |
| 182–186 | Sasori, Deidara, Hidan, Chiaotzu, Barba Negra | vários | vários | Carta não criada ainda (todos) |

### Soldado/Recruta (187–224)
| ID | Nome | AT | DF | HB |
|----|------|----|----|----|
| 187–188 | Justiceiro, Elektra | 700 | 700 | Carta não criada ainda (ambos) |
| 189 | Asa Noturna (Robin) | 700 | 750 | Torna-se imune a qualquer AT por 2T seguidos, nesse tempo aumenta o próprio AT em 50%. |
| 190 | Caveira Vermelha | 700 | 750 | Automático — Ao eliminar um oponente, ganha 400 de DF e reduz 50% do AT dos demais oponentes por 2T. |
| 191 | Duende Verde | 700 | 700 | Implanta caos nas cartas adversárias na arena, destruindo até 2 cartas de DF menor que 1000. |
| 192 | Rocket Raccoon | 650 | 700 | Explosivos: Reduz DF dos adversários em 50%. E elimina oponentes que ficaram com DF menor que 600. |
| 193 | Groot | 650 | 650 | Quando destruído, volta como escudo vivo, bloqueando até 3 AT em aliados. |
| 194 | Gavião Arqueiro | 650 | 700 | Atinge um oponente com 1500 de dano, ignorando qualquer escudo. |
| 195 | Mysterio | 600 | 650 | Anula 2 AT de oponentes à sua escolha contra si ou seus aliados. |
| 196–210 | Shikamaru, Kiba, Konohamaru, Tenten, Senhor das Estrelas, Crocodile, Batgirl, Robin (Damian), Capuz Vermelho, Arsenal, Canário Negro, Soldado Invernal, Fera, Blade, Videl | vários | vários | Carta não criada ainda (todos) |
| 211 | Arlequina | 450 | 500 | Triplica seu AT, mas reduz sua DF pela metade, por 3T. |
| 212 | Coringa | 400 | 500 | Escolhe uma carta da mão do oponente aleatoriamente para si. |
| 213 | Nami | 450 | 500 | Aumenta sua própria DF em 400 e reduz 200 PTs dos adversários na arena por 2T. |
| 214 | Usopp | 400 | 500 | Lança um AT extra de 500 no seu T. |
| 215–224 | Nick Fury, Charada, Mr. Satan, Buggy, Perona, Mr. 2, Bulma, Chi-Chi, Alfred, Yajirobe | vários | vários | Carta não criada ainda (todos) |

---

## 8. STATUS DE IMPLEMENTAÇÃO — 09/05/2026

### Cartas validadas no TestLab

**Pré-sprint:** 11, 13, 18, 131, 139, 159, 160, 161, 162, 189, 190, 191, 192, 193, 194, 211, 212, 213, 214, TOK_SHENLONG
**Bloco 4:** 132, 133, 136, 137
**Lote 5A:** 144, 163, 190*, 191*, 192*, 194*
**Lotes 5B+5C:** 28, 29, 35, 86, 87, 146, 148, 151
**Lotes 5D+5E:** 126, 127, 150, 152, 154, 157, 158, 172, 173, 175
**Lote 5F parcial:** 47, 92, 138
**Ciclo /goal 1+2:** 27, 31, 56, 91, 94, 145, 165, 139*

**Com ressalvas — Reaction Window pendente (Bloco 9):** 164, 195
**TOTAL VALIDADAS: ~53 únicas**

### Bugs de lógica abertos (pós ciclos /goal)
| ID | Carta | Bug | Prioridade |
|----|-------|-----|------------|
| B-26 | Goku UI | Sofre dano normal. Deve desviar AT, HB e EF enquanto ativo | ALTA |
| B-33 | Freeza Black | Motor não aplica morte a ele ao atacar carta com DF muito maior | ALTA |
| B-34 | Saitama | Cooldown não desconta por turno. Consegue deletar Divinos (errado) | ALTA |
| B-36 | Thor | Clique não atualiza mesa imediatamente. Efeito só aparece ao selecionar todos | MÉDIA |
| B-51 | Magneto | Mesmo problema do Thor — atualização não é imediata por clique | MÉDIA |
| B-76 | Naruto | Escudo bloqueia recuo do atacante fraco. Atacante deve morrer normalmente | ALTA |
| B-90 | Lanterna Verde | AT extra de 1200 engatilha automático. Deve ser ativação MANUAL | MÉDIA |
| B-93 | Hela | Não ganha AT ao derrotar inimigo. HB manual deve abrir cemitério inimigo | ALTA |
| B-95 | Ravena | Absorção não subtrai AT dos alvos. Deve subtrair e devolver ao fim dos 2T | MÉDIA |

### Pendências de UI
| Tarefa | Descrição | Status |
|--------|-----------|--------|
| UI-i1 | Botões < e > ainda gigantes. Forçar w-10 h-10 redondo | Pendente |
| UI-i2 | Remover seta/dropdown icon nos botões de filtro da lista | Pendente |
| UI-i3 | AT e DF da lista alinhados à direita (justify-between) | Pendente |
| UI-i4 | Drag & Drop para dentro do slot do Cemitério | Pendente |
| UI-i5 | Setup não deve limpar Cemitério ao ser acionado | Pendente |
| UI-i6 | Botão Voltar: substituir por ícone de seta pequeno no canto superior esquerdo | Pendente |

### Pendência de revisão
| Item | Descrição |
|------|-----------|
| REV-1 | Varredura de regressões em cartas antigas (ao menos 1 quebrada pós /goal) |
| REV-2 | Comparar todos os textos de HB exibidos no jogo contra Seção 7. Corrigir divergências. |
| REV-3 | Cartas 63 (Trunks do Futuro) e 77 (Sasuke) pausadas para revisão de texto |

---

## 9. PLANO DE EXECUÇÃO — OBJETIVO: FECHAR TODAS AS CARTAS ATÉ MEADOS DE BLOCO 8

### Prioridade imediata — Comando Gigante 3 (correções)
**Objetivo:** Fechar os 9 bugs de lógica + 6 pendências de UI em um único /goal
**IDE 1:** Codex CLI /goal | **IDE 2:** Windsurf | **IDE 3:** Kilo Code + Groq
**Regra:** Bugs de lógica primeiro. UI no mesmo comando se o budget permitir.

### Sequência de lotes após correções

| Fase | Cartas | IDE 1 | IDE 2 | IDE 3 |
|------|--------|-------|-------|-------|
| Lote 6A restante | 25, 26*, 33* (reabrir com fix), 49, 52 | Codex /goal | Windsurf | Kilo Code |
| Lote 6B | 34*, 36*, 51*, 55, 57 | Codex /goal | Windsurf | Kilo Code |
| Lote 6C | 59, 60, 63**, 76*, 77** | Codex /goal | Windsurf | Kilo Code |
| Lote 6D restante | 90*, 91*, 93*, 95*, 128 | Codex /goal | Windsurf | Kilo Code |
| Lote 6E restante | 139* já OK. Restam: 129, 130, 147, 149, 153 | Codex /goal | Windsurf | Kilo Code |
| Varredura + textos | REV-1, REV-2, REV-3 | Codex /goal leitura | Antigravity Sonnet | Kilo Code |
| Bloco 7 (complexas) | ~21 cartas: Cell, Thanos, Flash, Orochimaru... | Codex /goal | Windsurf | Kilo Code |
| Bloco 8 (volume) | ~40 cartas Soldado/Recruta | Codex /goal | Antigravity Flash | Kilo Code |

> * Bug aberto — reabre no lote após fix do Comando 3
> ** Pausada para revisão de texto

**Nota de IDEs:** Cursor reservado apenas para fixes pontuais de 1-2 linhas via BYOK. Windsurf como IDE 2 padrão (cota maior que Cursor) — sempre revisar diff completo antes de aceitar.

---

## 10. CRONOGRAMA ATUALIZADO — 09/05/2026

| Bloco | Escopo | Previsão |
|-------|--------|----------|
| Correções (Cmd 3) | 9 bugs lógica + 6 UI + varredura | Final mai 2026 |
| Bloco 6 completo | ~20 cartas restantes | Junho 2026 |
| Bloco 7 | ~21 cartas complexas | Julho 2026 |
| Bloco 8 | ~40 cartas Soldado/Recruta | Agosto 2026 |
| Bloco 9 | Arena multiplayer + Reaction Window | Outubro 2026 |
| Blocos 10-11 | Gacha, Shop, Ranking, Troféus | Nov/Dez 2026 |
| Bloco 12 | Polimento, revisão final de textos | Dez 2026/Jan 2027 |

**Release Dev estimado: janeiro 2027**

---

## 11. CHECKPOINTS

```
PONTO 0 — 05/03/2026 — Estrutura de gestão fundada.
PONTO 1 — 19/03/2026 — HP canônico 8.000.
PONTO 2 — 18/04/2026 — 20 AUDs mapeados. Nexus Ascension.
PONTO 3 — 22/04/2026 — Blocos 0–3. Motor criado.
PONTO 4 — 22/04/2026 — Bloco 4. Motor blindado. interactionMode.
PONTO 5 — 22/04/2026 — Lotes 5A, 5B, 5C. TestLab reestruturado.
PONTO 6 — 29/04/2026 — Lotes 5D+5E. Fix Mão→Arena. UI estável.
PONTO 7 — 30/04/2026 — CSV incorporado. R17/R18/R19. Bugs 145/165 abertos.
PONTO 8 — [pendente] — Pré-requisitos:
  [ ] 9 bugs de lógica (B-26 a B-95) corrigidos
  [ ] 6 pendências de UI (UI-i1 a UI-i6) executadas
  [ ] REV-1: varredura de regressões concluída
  [ ] REV-2: todos os textos de HB conferidos contra Seção 7
  [ ] Pelo menos 1 lote do Bloco 6 validado após correções
```

---

## 12. TRABALHO PARALELO

**Quando funciona:** Agente A em arquivo X, Agente B em arquivo Y completamente diferente.
**Quando NÃO funciona:** Dois agentes no mesmo trecho de código.
**Recomendação atual:** Sequencial. TestLab.tsx é único e crítico — paralelizar só quando a tarefa for explicitamente em arquivo separado.

---

## 13. ARSENAL — FERRAMENTAS E MODELOS

### Fluxo 100% gratuito (padrão)

| Ferramenta | Modelo | Quando usar |
|-----------|--------|-------------|
| Codex CLI /goal | GPT-5.4 (Plus incluso) | Executor principal — arquivos > 150KB, /goal autônomo |
| Antigravity | Gemini 3 Flash | UI isolada, fixes simples, arquivos < 150KB |
| Antigravity | Gemini 3 Pro Low | Lógica moderada, componentes |
| Antigravity | Claude Sonnet | Arquivos grandes, multi-arquivo — quando cota Flash esgotar |
| Windsurf | Auto | Backup de lógica. Cota > Cursor. Sempre revisar diff. |
| Trae | Auto | Fallback UI quando Antigravity indisponível |
| Kilo Code | Groq Llama 3.3 70B | Backstop ilimitado gratuito — emergência sem cota |
| OpenCode | NVIDIA Build (gratuito) | Fallback de terminal quando Codex CLI esgotar |
| Cursor | BYOK Gemini AI Studio | Apenas fixes de 1-2 linhas. Trava rápido. |

**NUNCA:** Gemini 3 Flash em BattleContext.tsx ou TestLab.tsx (arquivos > 500 linhas).
**NUNCA:** Windsurf + Cursor simultaneamente (8GB RAM).
**SEMPRE:** /review no Codex antes de commit em BattleContext.tsx, TestLab.tsx ou AbilityEngine.ts.

### Seleção por tipo de tarefa

| Tipo | IDE 1 | IDE 2 | IDE 3 |
|------|-------|-------|-------|
| Arquivo grande > 150KB | Codex /goal GPT-5.4 | Windsurf | Kilo Code + Groq |
| Bug profundo multi-arquivo | Codex /goal GPT-5.4 | Windsurf | Kilo Code + Groq |
| UI isolada / layout | Antigravity Gemini Flash | Trae | Kilo Code + Groq |
| Carta simples | Antigravity Gemini Flash | Kilo Code + Groq | Trae |
| Carta média | Codex /goal GPT-5.4 | Windsurf | Kilo Code + Groq |
| Carta complexa | Codex /goal GPT-5.4 | Windsurf | Kilo Code + Groq |
| Fix pontual 1-2 linhas | Cursor BYOK Gemini | Antigravity Flash | Trae |
| Varredura / review | Codex leitura | Kilo Code + Groq | — |
| Sem cota nenhuma | Kilo Code + Groq | OpenCode NVIDIA | Trae |

---

## 14. DECISÕES REGISTRADAS

| Data | Decisão |
|------|---------|
| 19/03/2026 | HP canônico: 8.000 |
| 18/04/2026 | Renomeação: Nexus Ascension |
| 22/04/2026 | Namespace localStorage: nexus_v2_ |
| 22/04/2026 | TestLab: ASCII puro |
| 22/04/2026 | interactionMode como máquina de estados única |
| 22/04/2026 | Ordem executeAttack: 163 → 144 → resolveCombat |
| 29/04/2026 | Drag & Drop Mão↔Arena com swap |
| 30/04/2026 | R17+R18+R19: nunca inventar HB; CSV é lei |
| 30/04/2026 | Reaction Window de Wong/Mysterio aguarda Bloco 9 |
| 08/05/2026 | /goal Codex CLI adotado como executor principal |
| 08/05/2026 | Lista de cartas validadas consolidada (sem duplicatas) |
| 09/05/2026 | Cursor rebaixado: apenas fixes de 1-2 linhas via BYOK |
| 09/05/2026 | Windsurf promovido a IDE 2 padrão (cota > Cursor) |
| 09/05/2026 | HB da Hela alterada: HB manual abre cemitério inimigo para roubar carta |
| 09/05/2026 | HB da Ravena corrigida: absorção subtrai AT dos alvos, devolvido ao fim |
| 09/05/2026 | Varredura de regressões + revisão de textos de HB adicionadas ao plano |

---

## 15. TRANSIÇÃO ENTRE CHATS DE GESTÃO

1. Chat atual gera GESTAO.md atualizado como última ação.
2. Novo chat recebe este arquivo + relatório do executor.
3. Novo chat confirma leitura e pergunta: "Paralelo ou sequencial hoje?"
4. Não gerar prompts antes de confirmação de Guilherme.

**Melhor opção para Chat de Gestão:** Claude (claude.ai) com Projeto dedicado — contexto longo, segue instruções estruturadas, memória de projeto.

---

_Nexus Ascension (ex-JC Card Wars) — 09/05/2026 | v12.0_
