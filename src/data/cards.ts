import type { Card } from '../types';

export const initialCards: Card[] = [
    {
        "id": "4",
        "name": "Dr. Manhattan",
        "universe": "DC",
        "atk": 4500,
        "def": 4300,
        "rarity": "Supremo",
        "description": "Manipula a realidade: troca 1 carta da arena ou cemitério por 1 carta da arena ou cemitério geral.",
        "image": "/cards/4.png"
    },
    {
        "id": "5",
        "name": "Whis",
        "universe": "Dragon Ball",
        "atk": 4200,
        "def": 4200,
        "rarity": "Supremo",
        "description": "Treina um aliado, sendo ambos removidos da arena por 2 Turnos, retornando com +50% em seus Ataque e Defesa e sua Habilidade podendo ser utilizadas. Após isso, Whis pode treinar 'outro' aliado.",
        "image": "/cards/5.png"
    },
    {
        "id": "6",
        "name": "Beerus",
        "universe": "Dragon Ball",
        "atk": 4000,
        "def": 4000,
        "rarity": "Supremo",
        "description": "Uma vez por Turno, pode destruir qualquer carta seja na arena ou da mão do oponente.",
        "image": "/cards/6.png",
        "effects": [
            {
                "trigger": "onActivate",
                "type": "destroy",
                "target": "any",
                "value": 0,
                "description": "Destruir uma carta"
            }
        ]
    },
    {
        "id": "10",
        "name": "Galactus",
        "universe": "Marvel",
        "atk": 3700,
        "def": 3600,
        "rarity": "Supremo",
        "description": "Drena permanentemente 20% do Ataque de todas as cartas adversárias na arena.",
        "image": "/cards/10.png"
    },
    {
        "id": "11",
        "name": "Darkseid",
        "universe": "DC",
        "atk": 3600,
        "def": 3500,
        "rarity": "Supremo",
        "description": "Invoca 1 Lacaio com 500 Pontos e controla 1 oponente permanentemente. Efeitos cessam se Darkseid for eliminado.",
        "image": "/cards/11.png"
    },
    {
        "id": "13",
        "name": "Odin",
        "universe": "Marvel",
        "atk": 3400,
        "def": 3400,
        "rarity": "Supremo",
        "description": "Pode revelar a mão do oponente e selar uma das cartas da mão permanentemente.",
        "image": "/cards/13.png"
    },
    {
        "id": "14",
        "name": "Zeus",
        "universe": "Marvel/DC",
        "atk": 3400,
        "def": 3400,
        "rarity": "Supremo",
        "description": "Chuva de raios: reduz 50% do Ataque de todos os oponentes enquanto Zeus estiver na arena. Com sacrifício de uma carta aliada, também reduz 50% da Defesa de 1 oponente por Turno.",
        "image": "/cards/14.png"
    },
    {
        "id": "15",
        "name": "Jean Grey (Fênix)",
        "universe": "Marvel",
        "atk": 3300,
        "def": 3200,
        "rarity": "Supremo",
        "description": "Controla 1 oponente por 1 Turno. Ao fim do Turno, destroi o alvo.",
        "image": "/cards/15.png",
        "effects": [
            {
                "trigger": "onActivate",
                "type": "destroy",
                "target": "enemy",
                "value": 0,
                "description": "Destruir um oponente"
            }
        ]
    },
    {
        "id": "17",
        "name": "Broly",
        "universe": "Dragon Ball",
        "atk": 3100,
        "def": 2800,
        "rarity": "Destruidor",
        "description": "A cada aliado derrotado aumenta sua ira, e ganha 1000 de Ataque. Ao perder o 4º aliado, é consumido pela fúria e se autodestrói.",
        "image": "/cards/17.png"
    },
    {
        "id": "18",
        "name": "Sentry",
        "universe": "Marvel",
        "atk": 2900,
        "def": 2700,
        "rarity": "Destruidor",
        "description": "Dobra seu Ataque e tornar-se imune a tudo por 3 Turnos. Após isso, a instabilidade cresce e se autodestrói.",
        "image": "/cards/18.png"
    },
    {
        "id": "19",
        "name": "Hulk",
        "universe": "Marvel",
        "atk": 2700,
        "def": 2400,
        "rarity": "Destruidor",
        "description": "Por 3 Turnos, entra em fúria, dobrando seu Ataque e podendo atacar até 2 oponentes por Turno. Ao fim, retorna a Banner com apenas 100 Ataque e Defesa.",
        "image": "/cards/19.png"
    },
    {
        "id": "20",
        "name": "Apocalypse (Doomsday)",
        "universe": "DC",
        "atk": 2600,
        "def": 2500,
        "rarity": "Destruidor",
        "description": "Pode ressuscitar até 3x, sempre no Turno seguinte e cada vez com -25% de seus Pts. Na 3º leva junto dois companheiro.",
        "image": "/cards/20.png"
    },
    {
        "id": "22",
        "name": "Juggernaut",
        "universe": "Marvel",
        "atk": 2400,
        "def": 2600,
        "rarity": "Destruidor",
        "description": "Sempre que o adversario atacar, ganha +20% Ataque. Mesmo em modo de Defesa. (Deve ativar antes, é revelada no seu próximo Turno). Perde a Defesa na mesma proporção.",
        "image": "/cards/22.png"
    },
    {
        "id": "25",
        "name": "Superman (Prime)",
        "universe": "DC",
        "atk": 2500,
        "def": 2500,
        "rarity": "Lendário",
        "description": "Absorve energia solar, dobra seu Ataque e torna-se imune a Ataque e atravessa barreiras por 3 Turnos.",
        "image": "/cards/25.png"
    },
    {
        "id": "26",
        "name": "Goku (Instinto Superior)",
        "universe": "Dragon Ball",
        "atk": 2500,
        "def": 2450,
        "rarity": "Lendário",
        "description": "Instinto Superior: Esquiva de Ataque, Habilidade e Efeito. E usa um Kamehameha que elimina 1 oponente por Turno. Dura 3 Turnos.",
        "image": "/cards/26.png",
        "effects": [
            {
                "trigger": "onActivate",
                "type": "destroy",
                "target": "enemy",
                "value": 0,
                "description": "Kamehameha: Eliminar oponente"
            }
        ]
    },
    {
        "id": "27",
        "name": "Vegeta (Ultra Ego)",
        "universe": "Dragon Ball",
        "atk": 2500,
        "def": 2400,
        "rarity": "Lendário",
        "description": "Ultra Ego: por 2 Turnos elimina quem tocar, ao ser atingido resiste e contra-ataca, com poder devastador.",
        "image": "/cards/27.png"
    },
    {
        "id": "28",
        "name": "Adão Negro",
        "universe": "DC",
        "atk": 2450,
        "def": 2450,
        "rarity": "Lendário",
        "description": "Causa uma explosão de energia, reduzindo 50% dos Pontos dos oponentes.",
        "image": "/cards/28.png"
    },
    {
        "id": "29",
        "name": "Shazam",
        "universe": "DC",
        "atk": 2400,
        "def": 2350,
        "rarity": "Lendário",
        "description": "Poder do trovão: aumenta 600 em seu Ataque. Lança a energia acumulada, reduzindo 50% Defesa de todos os oponentes. dura 3 Turnos.",
        "image": "/cards/29.png"
    },
    {
        "id": "31",
        "name": "Jiren",
        "universe": "Dragon Ball",
        "atk": 2400,
        "def": 2350,
        "rarity": "Lendário",
        "description": "Libera seu poder, aumentando seu Ataque em 50%, anulando todos os Efeito do oponente e reduzindo 50% dos Ataque contra si. dura 3 Turnos.",
        "image": "/cards/31.png"
    },
    {
        "id": "33",
        "name": "Freeza (Black)",
        "universe": "Dragon Ball",
        "atk": 2300,
        "def": 2250,
        "rarity": "Lendário",
        "description": "Por 3 Turnos ativa sua Forma Black, dobrando seus Pontos e concedendo-lhe um contra-ataque imediato.",
        "image": "/cards/33.png"
    },
    {
        "id": "34",
        "name": "Saitama",
        "universe": "One Punch Man",
        "atk": 2300,
        "def": 2250,
        "rarity": "Lendário",
        "description": "Desfere um Soco Avassalador que destrói Habilidade, Efeito ou guerreiros do alvo escolhido (exceto Divinos). Pode repetir a cada 4T.",
        "image": "/cards/34.png"
    },
    {
        "id": "35",
        "name": "Gohan (Beast)",
        "universe": "Dragon Ball",
        "atk": 2300,
        "def": 2200,
        "rarity": "Lendário",
        "description": "Desperta sua Forma Beast, aumentando 50% de seu Ataque por 3 Turnos e eliminando um oponente com Makankōsappo.",
        "image": "/cards/35.png"
    },
    {
        "id": "36",
        "name": "Thor",
        "universe": "Marvel",
        "atk": 2250,
        "def": 2200,
        "rarity": "Lendário",
        "description": "Invoca uma poderosa tempestade em seu Turno, que elimina até 3 oponentes e bloqueia Habilidade dos demais por 2 Turnos.",
        "image": "/cards/36.png"
    },
    {
        "id": "37",
        "name": "Thanos",
        "universe": "Marvel",
        "atk": 2250,
        "def": 2250,
        "rarity": "Lendário",
        "description": "Ativa a Manopla do Infinito, escolhe uma Joia por 2 Turnos. Mente: controla 1 oponente, Alma: altera Ataque, Defesa ou Habilidade de 1 carta.",
        "image": "/cards/37.png"
    },
    {
        "id": "44",
        "name": "Flash",
        "universe": "DC",
        "atk": 2000,
        "def": 2000,
        "rarity": "Titã",
        "description": "Volta no tempo e Ressuscita 2 aliados, mas traz 1 inimigo aleatório de volta.",
        "image": "/cards/44.png"
    },
    {
        "id": "47",
        "name": "Dr. Estranho",
        "universe": "Marvel",
        "atk": 1950,
        "def": 1950,
        "rarity": "Titã",
        "description": "Olho de Agamotto: Aumenta 1000 em sua própria Defesa e revive 1 aliado. Dura 3 Turnos.",
        "image": "/cards/47.png"
    },
    {
        "id": "49",
        "name": "Capitã Marvel",
        "universe": "Marvel",
        "atk": 1900,
        "def": 1850,
        "rarity": "Titã",
        "description": "Explosão de Fótons: Elimina até 3 oponentes de nível 7 ou inferior. E rouba o Ataque de 1 deles, somando ao seu.",
        "image": "/cards/49.png"
    },
    {
        "id": "50",
        "name": "Dr. Destino",
        "universe": "Marvel",
        "atk": 1900,
        "def": 1900,
        "rarity": "Titã",
        "description": "Rouba a Habilidade de um oponente (ainda não usada). Se o alvo for mágico, reduz seus Pontos pela metade.",
        "image": "/cards/50.png"
    },
    {
        "id": "51",
        "name": "Magneto",
        "universe": "Marvel",
        "atk": 1850,
        "def": 1850,
        "rarity": "Titã",
        "description": "Cria um campo magnético que paralisa 2 adversários por 2 Turnos e destrói oponentes cibernéticos na arena.",
        "image": "/cards/51.png"
    },
    {
        "id": "52",
        "name": "Senhor Destino",
        "universe": "Marvel",
        "atk": 1850,
        "def": 1800,
        "rarity": "Titã",
        "description": "Invoca o Elmo de Nabu por 3 Turnos. Cria um campo mágico que bloqueia Habilidade inimigas e dobra sua Defesa e de seus aliados.",
        "image": "/cards/52.png"
    },
    {
        "id": "53",
        "name": "Feiticeira Escarlate",
        "universe": "Marvel",
        "atk": 1850,
        "def": 1800,
        "rarity": "Titã",
        "description": "Realidade alternativa: troca todas as cartas da arena (mesma quantidade), pelas de seus cemitérios (aleatoriamente).",
        "image": "/cards/53.png"
    },
    {
        "id": "54",
        "name": "Zamasu",
        "universe": "Dragon Ball",
        "atk": 1850,
        "def": 1850,
        "rarity": "Titã",
        "description": "Troca de corpo com um oponente por 3 Turnos. Podendo usar a Habilidade da vítima 1x, tendo sido usada antes ou não.",
        "image": "/cards/54.png"
    },
    {
        "id": "55",
        "name": "Moro",
        "universe": "Dragon Ball",
        "atk": 1850,
        "def": 1900,
        "rarity": "Titã",
        "description": "\"Drena o Ataque de 1 oponente para o seu permanentemente",
        "image": "/cards/55.png"
    },
    {
        "id": "56",
        "name": "Hit",
        "universe": "Dragon Ball",
        "atk": 1800,
        "def": 1850,
        "rarity": "Titã",
        "description": "Ao ser atacado, salta no tempo e elimina o oponente antes do golpe. Pode usar 2x.",
        "image": "/cards/56.png"
    },
    {
        "id": "57",
        "name": "Toppo",
        "universe": "Dragon Ball",
        "atk": 1850,
        "def": 1800,
        "rarity": "Titã",
        "description": "Ativa a forma Hakaishin: fica imune a Ataque e Habilidade por 3 Turnos e usa Hakai para apagar 1 oponente.",
        "image": "/cards/57.png"
    },
    {
        "id": "58",
        "name": "Majin Boo",
        "universe": "Dragon Ball",
        "atk": 1800,
        "def": 1750,
        "rarity": "Titã",
        "description": "Absorve 1 oponente que permanecerá absorvido até a eliminação de Majin boo. Pode absorver outro oponente a cada 3 Turnos.",
        "image": "/cards/58.png"
    },
    {
        "id": "59",
        "name": "Goku Black",
        "universe": "Dragon Ball",
        "atk": 1750,
        "def": 1800,
        "rarity": "Elite",
        "description": "Super Saiyajin Rosé: aumenta 1000 em seu Ataque por 3 Turnos e dispara um Ataque devastador de 1500, ignorando escudos.",
        "image": "/cards/59.png"
    },
    {
        "id": "60",
        "name": "Piccolo (Orange)",
        "universe": "Dragon Ball",
        "atk": 1800,
        "def": 1750,
        "rarity": "Elite",
        "description": "Orange: aumenta seu Ataque em 50%, e reduz  Ataque recebidos em 50%. A cada Ataque lancado perde 500 de Defesa, até ser eliminado.",
        "image": "/cards/60.png"
    },
    {
        "id": "61",
        "name": "Android 17",
        "universe": "Dragon Ball",
        "atk": 1750,
        "def": 1700,
        "rarity": "Elite",
        "description": "Absorve 2 Ataque contra si ou seus aliados (à sua escolha) e adiciona ao seu Ataque, mas perde 500 de Defesa por absorção.",
        "image": "/cards/61.png"
    },
    {
        "id": "62",
        "name": "Android 18",
        "universe": "Dragon Ball",
        "atk": 1750,
        "def": 1650,
        "rarity": "Elite",
        "description": "Absorve 1 Ataque recebido, juntando ao seu próprio Ataque.",
        "image": "/cards/62.png"
    },
    {
        "id": "63",
        "name": "Trunks do Futuro",
        "universe": "Dragon Ball",
        "atk": 1700,
        "def": 1750,
        "rarity": "Elite",
        "description": "Desfere um golpe preciso de 1500 com sua espada a um oponente no seu Turno seguinte, seu Ataque aumenta em 50%.",
        "image": "/cards/63.png"
    },
    {
        "id": "64",
        "name": "Cell",
        "universe": "Dragon Ball",
        "atk": 1700,
        "def": 1650,
        "rarity": "Elite",
        "description": "Quando ativo em 2 Turnos proprios explode, destruindo a arena e todos nela. Após 2 Turnos Cell se regenera com Ataque +50% e Defesa -50%.",
        "image": "/cards/64.png"
    },
    {
        "id": "76",
        "name": "Naruto",
        "universe": "Naruto",
        "atk": 1650,
        "def": 1600,
        "rarity": "Titã",
        "description": "Sábio dos Seis Caminhos: Fica imune a Ataque por 3 Turnos e aumenta seu Ataque em 50% durante esse período.",
        "image": "/cards/76.png"
    },
    {
        "id": "77",
        "name": "Sasuke",
        "universe": "Naruto",
        "atk": 1600,
        "def": 1650,
        "rarity": "Titã",
        "description": "\"Manifesta o Susanoo por 3 Turnos, elevando seu Ataque para 2500",
        "image": "/cards/77.png"
    },
    {
        "id": "86",
        "name": "Luffy (Gear 5)",
        "universe": "One Piece",
        "atk": 1600,
        "def": 1550,
        "rarity": "Titã",
        "description": "Por 2 Turnos, dobra seu Ataque e reduz a Defesa de todos na arena em 50%.",
        "image": "/cards/86.png"
    },
    {
        "id": "87",
        "name": "Mulher Maravilha",
        "universe": "DC",
        "atk": 1600,
        "def": 1600,
        "rarity": "Titã",
        "description": "Por 2 Turnos, dobra a Defesa e, a cada Turno, o Laço da Verdade revela 1 carta virada para baixo.",
        "image": "/cards/87.png"
    },
    {
        "id": "88",
        "name": "Aquaman",
        "universe": "DC",
        "atk": 1500,
        "def": 1550,
        "rarity": "Titã",
        "description": "Convoca um exército marítimo que elimina os inimigos que tiverem 900 ou menos de Ataque ou Defesa.",
        "image": "/cards/88.png"
    },
    {
        "id": "89",
        "name": "Ciborgue",
        "universe": "DC",
        "atk": 1500,
        "def": 1550,
        "rarity": "Titã",
        "description": "Aumenta seus Ataque e Defesa em 50% e desativa oponentes cibernéticos, impedindo-os de atacar ou usar Habilidade. Dura 3 Turnos.",
        "image": "/cards/89.png"
    },
    {
        "id": "90",
        "name": "Lanterna Verde (Hal)",
        "universe": "DC",
        "atk": 1550,
        "def": 1550,
        "rarity": "Titã",
        "description": "Cria construtos de energia: para realizar Ataque adicional de 1200. Que pode ser lancado no Turno do oponente. dura 3 Turnos",
        "image": "/cards/90.png"
    },
    {
        "id": "91",
        "name": "Sinestro",
        "universe": "DC",
        "atk": 1550,
        "def": 1500,
        "rarity": "Titã",
        "description": "Usa o anel do medo paralisando Ataque e Habilidade de 1 oponente por 2 Turnos. E absorve 50% de sua Defesa permanentemente.",
        "image": "/cards/91.png"
    },
    {
        "id": "92",
        "name": "Visão",
        "universe": "Marvel",
        "atk": 1550,
        "def": 1520,
        "rarity": "Titã",
        "description": "Fica intangível por 3 Turnos, nao sofrendo com Ataque, Habilidade e Efeito. Pode atravessar escudos.",
        "image": "/cards/92.png"
    },
    {
        "id": "93",
        "name": "Hela",
        "universe": "Marvel",
        "atk": 1550,
        "def": 1550,
        "rarity": "Titã",
        "description": "Cada oponente derrotado aumenta 50% seu Ataque. Com 1 sacrifício, revive 1 vilão geral",
        "image": "/cards/93.png"
    },
    {
        "id": "94",
        "name": "Loki",
        "universe": "Marvel",
        "atk": 1500,
        "def": 1500,
        "rarity": "Titã",
        "description": "Destrói uma linha do tempo, apagando todas as cartas adversárias do universo escolhido, na arena. (apenas 1x)",
        "image": "/cards/94.png"
    },
    {
        "id": "95",
        "name": "Ravena",
        "universe": "DC",
        "atk": 1550,
        "def": 1500,
        "rarity": "Titã",
        "description": "Invoca uma aura psíquica que absorve o Ataque de 2 oponentes, transferindo para sua Defesa. E anula os Efeito do oponente. Dura 2 Turnos.",
        "image": "/cards/95.png"
    },
    {
        "id": "96",
        "name": "Professor X",
        "universe": "Marvel",
        "atk": 1450,
        "def": 1400,
        "rarity": "Titã",
        "description": "Controla totalmente 1 oponente da arena ou cemitério por 3 Turnos e reduz em 50% os Ataque recebidos nesse período.",
        "image": "/cards/96.png"
    },
    {
        "id": "97",
        "name": "Kratos",
        "universe": "God of War",
        "atk": 1550,
        "def": 1550,
        "rarity": "Titã",
        "description": "Ao derrotar um oponente, incorpora sua Habilidade. (apenas uma vez)",
        "image": "/cards/97.png"
    },
    {
        "id": "98",
        "name": "Itachi Uchiha",
        "universe": "Naruto",
        "atk": 1550,
        "def": 1550,
        "rarity": "Titã",
        "description": "Por 3 Turnos Aprisiona o alvo em um genjutsu, impedindo-o de usar Ataque e Habilidade. E forçando-o a atacar 1 aliado por Turno.",
        "image": "/cards/98.png"
    },
    {
        "id": "111",
        "name": "Gaara",
        "universe": "Naruto",
        "atk": 1400,
        "def": 1450,
        "rarity": "Veterano",
        "description": "Imobiliza 1 oponente na areia, reduzindo 50% de sua Defesa por Turno. Ao fim do 2 Turnos, o oponente é eliminado, a menos que a areia atacada com 1700 ou mais.",
        "image": "/cards/111.png"
    },
    {
        "id": "112",
        "name": "Orochimaru",
        "universe": "Naruto",
        "atk": 1350,
        "def": 1400,
        "rarity": "Veterano",
        "description": "Infecta 1 oponente com sua marca. após 3 Turnos, toma posse de seu corpo. Porem Habilidade permanece a do Orochimaru (reutilizável).",
        "image": "/cards/112.png"
    },
    {
        "id": "113",
        "name": "Kakashi",
        "universe": "Naruto",
        "atk": 1350,
        "def": 1400,
        "rarity": "Veterano",
        "description": "Sharingan: Copia uma Habilidade que assistiu na arena. Além disso, pode usar Raikiri para eliminar 1 oponente no seu Turno.",
        "image": "/cards/113.png"
    },
    {
        "id": "126",
        "name": "Homem de Ferro",
        "universe": "Marvel",
        "atk": 1250,
        "def": 1250,
        "rarity": "Veterano",
        "description": "Armadura Força Ômega: aumenta 1000 em seus Ataque e Defesa por 3 Turnos. Todo dano causado gera um Ataque extra automático no 4T.",
        "image": "/cards/126.png"
    },
    {
        "id": "127",
        "name": "Pantera Negra",
        "universe": "Marvel",
        "atk": 1250,
        "def": 1300,
        "rarity": "Veterano",
        "description": "Conecta-se aos ancestrais, aumentando seu Ataque em 500. Cada oponente derrotado concede +500 de Defesa permanente. dura 2 Turnos",
        "image": "/cards/127.png"
    },
    {
        "id": "128",
        "name": "Wolverine",
        "universe": "Marvel",
        "atk": 1300,
        "def": 1350,
        "rarity": "Veterano",
        "description": "Instinto predatório: dobra seu Ataque por 2 Turnos. Caso resista a um Ataque durante esse período, reforça 50% sua Defesa.",
        "image": "/cards/128.png"
    },
    {
        "id": "129",
        "name": "Venom",
        "universe": "Marvel",
        "atk": 1300,
        "def": 1200,
        "rarity": "Veterano",
        "description": "Toma posse de um oponente unindo seus Pts por 2 Turnos. Ao retornar, absorve 50% de seu Ataque, porem cede sua Defesa ao oponente.",
        "image": "/cards/129.png"
    },
    {
        "id": "130",
        "name": "Ronan",
        "universe": "Marvel",
        "atk": 1300,
        "def": 1250,
        "rarity": "Veterano",
        "description": "Por 4T, usa o Cosmi-Rod, eliminando um oponente e tornando-se imune a Ataque.",
        "image": "/cards/130.png"
    },
    {
        "id": "131",
        "name": "Roronoa Zoro",
        "universe": "One Piece",
        "atk": 1200,
        "def": 1200,
        "rarity": "Gladiador",
        "description": "Empunhando suas três espadas, recebe +500 Ataque por 2 Turnos e pode atingir 3 oponentes uma única vez no seu Turno.",
        "image": "/cards/131.png"
    },
    {
        "id": "132",
        "name": "Trunks",
        "universe": "Dragon Ball",
        "atk": 1150,
        "def": 1200,
        "rarity": "Gladiador",
        "description": "Ao se transformar, ganha 400 Ataque e Defesa e reduz em 20% a Defesa do alvo. dura 2 Turnos.",
        "image": "/cards/132.png"
    },
    {
        "id": "133",
        "name": "Goten",
        "universe": "Dragon Ball",
        "atk": 1150,
        "def": 1200,
        "rarity": "Gladiador",
        "description": "\"Se transforma, podendo atacar 2 vezes por Turno",
        "image": "/cards/133.png"
    },
    {
        "id": "136",
        "name": "Boruto",
        "universe": "Naruto",
        "atk": 1150,
        "def": 1150,
        "rarity": "Gladiador",
        "description": "Marca um oponente com o Karma, absorvendo sua Defesa no 1º Turno. Seu Ataque no 2º Turno, o destruindo.",
        "image": "/cards/136.png"
    },
    {
        "id": "137",
        "name": "Rock Lee (8 Portas)",
        "universe": "Naruto",
        "atk": 1200,
        "def": 1100,
        "rarity": "Gladiador",
        "description": "Porta da Fera: Acelera seus movimentos, realizando 3 Ataque por Turno, Dura 3 Turnos. Mas perde 90% de Defesa definitivamente apos isso.",
        "image": "/cards/137.png"
    },
    {
        "id": "138",
        "name": "Neji Hyuga",
        "universe": "Naruto",
        "atk": 1100,
        "def": 1100,
        "rarity": "Gladiador",
        "description": "Ao ser atacado, reduz 80% o Ataque e caso sobreviva devolve 40%. A cada 3 Turnos, revela 1 carta virada para baixo do oponente.",
        "image": "/cards/138.png"
    },
    {
        "id": "139",
        "name": "Homem-Aranha",
        "universe": "Marvel",
        "atk": 1100,
        "def": 1050,
        "rarity": "Gladiador",
        "description": "Imobiliza todos os oponentes, impedindo de usarem Ataque e Habilidade por 3 Turnos. Nesse período aumenta o próprio Ataque em 50%.",
        "image": "/cards/139.png"
    },
    {
        "id": "144",
        "name": "Homem Formiga (Gigante)",
        "universe": "Marvel",
        "atk": 1000,
        "def": 1050,
        "rarity": "Gladiador",
        "description": "Reduz seu tamanho para esquivar de 1 Ataque ou Habilidade. Após, retornar ao normal, dobra seu Ataque.",
        "image": "/cards/144.png"
    },
    {
        "id": "145",
        "name": "Vespa (Gigante)",
        "universe": "Marvel",
        "atk": 1050,
        "def": 1000,
        "rarity": "Gladiador",
        "description": "Encolhe-se para atacar e, golpeando até 3 oponentes em um Turno.",
        "image": "/cards/145.png"
    },
    {
        "id": "146",
        "name": "Coisa",
        "universe": "Marvel",
        "atk": 1100,
        "def": 1100,
        "rarity": "Gladiador",
        "description": "Libera sua força bruta, triplicando o Ataque por 2 Turnos. Porém, imediatamente a exaustão o enfraquece, e reduz imediatamente sua Defesa em 50%.",
        "image": "/cards/146.png"
    },
    {
        "id": "147",
        "name": "Pietro Maximoff",
        "universe": "Marvel",
        "atk": 1100,
        "def": 1000,
        "rarity": "Gladiador",
        "description": "Sua velocidade ultrapassa limites: ataca 2x por Turno: o primeiro usa seu Ataque normal, o segundo tem 1800 de Ataque. Dura 3 Turnos.",
        "image": "/cards/147.png"
    },
    {
        "id": "148",
        "name": "Tocha Humana",
        "universe": "Marvel",
        "atk": 1000,
        "def": 950,
        "rarity": "Gladiador",
        "description": "Lança chamas intensas, eliminando oponentes com menos de 700 de Defesa e reduzindo 500 a Defesa dos demais na arena.",
        "image": "/cards/148.png"
    },
    {
        "id": "149",
        "name": "Mutano (Formas grandes)",
        "universe": "DC",
        "atk": 1000,
        "def": 1000,
        "rarity": "Gladiador",
        "description": "Pode se transformar em seu Turno. Escolha: Tigre: dobra o Ataque, Elefante: dobra a Defesa.",
        "image": "/cards/149.png"
    },
    {
        "id": "150",
        "name": "Estelar",
        "universe": "DC",
        "atk": 1050,
        "def": 1050,
        "rarity": "Gladiador",
        "description": "Canaliza uma explosão de energia que elimina até 2 oponentes a sua escolha.",
        "image": "/cards/150.png"
    },
    {
        "id": "151",
        "name": "Drax",
        "universe": "Marvel",
        "atk": 1000,
        "def": 1000,
        "rarity": "Gladiador",
        "description": "Dobra o Ataque e reduz a Defesa dos oponentes em 500, por 2 Turnos.",
        "image": "/cards/151.png"
    },
    {
        "id": "152",
        "name": "Gamora",
        "universe": "Marvel",
        "atk": 1000,
        "def": 1000,
        "rarity": "Gladiador",
        "description": "A cada oponente derrotado, aumenta seu Ataque em 50% e realiza um segundo ataque.",
        "image": "/cards/152.png"
    },
    {
        "id": "153",
        "name": "Vampira",
        "universe": "Marvel",
        "atk": 900,
        "def": 900,
        "rarity": "Gladiador",
        "description": "Absorve os Pontos de 1 oponente por Turno e anula seu Ataque por 1 Turno. Não pode atacar esse oponente no Turno da absorção.",
        "image": "/cards/153.png"
    },
    {
        "id": "154",
        "name": "Ciclope",
        "universe": "Marvel",
        "atk": 1000,
        "def": 950,
        "rarity": "Gladiador",
        "description": "Lança um poderoso raio óptico com 1000 de Ataque. Que acerta até 3 oponentes.",
        "image": "/cards/154.png"
    },
    {
        "id": "157",
        "name": "Oob",
        "universe": "Dragon Ball",
        "atk": 1000,
        "def": 950,
        "rarity": "Gladiador",
        "description": "Libera poder oculto por 2 Turnos: dobra seu Ataque e pode atacar 2x por Turno. Ao fim, perde 50% de sua Defesa permanentemente.",
        "image": "/cards/157.png"
    },
    {
        "id": "158",
        "name": "Eric Killmonger",
        "universe": "Marvel",
        "atk": 950,
        "def": 1000,
        "rarity": "Gladiador",
        "description": "Aumenta seu Ataque em 50%. Se derrotar 1 oponente apos ativacao, sobe para 100%",
        "image": "/cards/158.png"
    },
    {
        "id": "159",
        "name": "Deadpool",
        "universe": "Marvel",
        "atk": 900,
        "def": 900,
        "rarity": "Paladino",
        "description": "Quando é derrotado permite ressuscitar uma carta aliada do cemitério (próprio) que recebe 50% de aumento de Ataque e Defesa.",
        "image": "/cards/159.png"
    },
    {
        "id": "160",
        "name": "Capitão América",
        "universe": "Marvel",
        "atk": 850,
        "def": 900,
        "rarity": "Paladino",
        "description": "Bloqueia um Ataque, e sua escolha: contra si ou aliados, e os rebate para qualquer adversário. pode ser usado até 2x.",
        "image": "/cards/160.png"
    },
    {
        "id": "161",
        "name": "Shuri (Pantera)",
        "universe": "Marvel",
        "atk": 800,
        "def": 900,
        "rarity": "Paladino",
        "description": "Invoca armaduras que aumentam em 50% a Defesa de todos os aliados por 3 Turnos.",
        "image": "/cards/161.png"
    },
    {
        "id": "162",
        "name": "Homem Elástico",
        "universe": "Marvel",
        "atk": 850,
        "def": 900,
        "rarity": "Paladino",
        "description": "Usa seu corpo elástico para proteger a si e seus aliados 2x de Ataque e Habilidade. cada uso aumenta instantemente sua Defesa em 500.",
        "image": "/cards/162.png"
    },
    {
        "id": "163",
        "name": "Mulher Invisível",
        "universe": "Marvel",
        "atk": 900,
        "def": 950,
        "rarity": "Paladino",
        "description": "Cria uma barreira psíquica que desvia até 3 Ataque (sua escolha), contra si ou aliados. Cada desvio aumenta sua Defesa em 300.",
        "image": "/cards/163.png"
    },
    {
        "id": "164",
        "name": "Wong",
        "universe": "Marvel",
        "atk": 900,
        "def": 950,
        "rarity": "Paladino",
        "description": "Cria uma barreira que absorve até 2 Ataque e redireciona imediatamente o dano a um oponente.",
        "image": "/cards/164.png"
    },
    {
        "id": "165",
        "name": "Viúva Negra",
        "universe": "Marvel",
        "atk": 800,
        "def": 850,
        "rarity": "Paladino",
        "description": "Desfere Ataque adicional de 500 e anula ativação de Habilidade dos demais por 2 Turnos.",
        "image": "/cards/165.png"
    },
    {
        "id": "166",
        "name": "Nebulosa",
        "universe": "Marvel",
        "atk": 850,
        "def": 850,
        "rarity": "Paladino",
        "description": "Uma vez por Turno - pode usar a Habilidade de uma carta do cemiterio. Pode ser usada 3 Turnos",
        "image": "/cards/166.png"
    },
    {
        "id": "167",
        "name": "Mística",
        "universe": "Marvel",
        "atk": 850,
        "def": 850,
        "rarity": "Paladino",
        "description": "Copia os Pontos de 1 adversario na arena. O deixando inconsciente sem atacar por 2 Turnos",
        "image": "/cards/167.png"
    },
    {
        "id": "169",
        "name": "Agatha Harkness",
        "universe": "Marvel",
        "atk": 850,
        "def": 850,
        "rarity": "Paladino",
        "description": "Usa magias ancestrais para selar todos  os Efeito e Habilidade dos oponentes por 4T, anulando ativos e inativos.",
        "image": "/cards/169.png"
    },
    {
        "id": "170",
        "name": "Lex Luthor (Armadura)",
        "universe": "DC",
        "atk": 900,
        "def": 850,
        "rarity": "Paladino",
        "description": "dura 2 Turnos, escolha: ativar o traje avançado para aumentar seus Pontos em 1000 ou usar drones para zerar a Defesa de 2 oponentes.",
        "image": "/cards/170.png"
    },
    {
        "id": "172",
        "name": "Kuririn",
        "universe": "Dragon Ball",
        "atk": 900,
        "def": 900,
        "rarity": "Paladino",
        "description": "Lança um Kienzan em um oponente à sua escolha. Caso o oponente não seja salvo é eliminado. Pode lançar outro após 4T.",
        "image": "/cards/172.png"
    },
    {
        "id": "173",
        "name": "Tenshinhan",
        "universe": "Dragon Ball",
        "atk": 850,
        "def": 850,
        "rarity": "Paladino",
        "description": "Ativa seu Terceiro Olho, revelando todas as cartas viradas para baixo e a mão do oponente, dura 2 Turnos.",
        "image": "/cards/173.png"
    },
    {
        "id": "174",
        "name": "Mestre Kami",
        "universe": "Dragon Ball",
        "atk": 850,
        "def": 900,
        "rarity": "Paladino",
        "description": "Sela um oponente em um recipiente com 850 de Defesa, até o recipiente ser atacado. Todo dano ao recipiente atinge a vitima.",
        "image": "/cards/174.png"
    },
    {
        "id": "175",
        "name": "Sakura",
        "universe": "Naruto",
        "atk": 850,
        "def": 850,
        "rarity": "Paladino",
        "description": "Cria uma onda de choque que impede todos os oponentes de Ataque por 2 Turnos. E aumenta a Defesa dos aliados em 400.",
        "image": "/cards/175.png"
    },
    {
        "id": "181",
        "name": "Tony Chopper",
        "universe": "One Piece",
        "atk": 750,
        "def": 800,
        "rarity": "Paladino",
        "description": "Lança rajada de fogo com 600 de Ataque a um oponente, ignorando qualquer escudos. Pode ser usado 2 Turnos.",
        "image": "/cards/181.png"
    },
    {
        "id": "189",
        "name": "Asa Noturna (Robin)",
        "universe": "DC",
        "atk": 700,
        "def": 750,
        "rarity": "Soldado",
        "description": "Torna-se imune a qualquer Ataque por 2 Turnos seguidos, nesse tempo aumenta o próprio Ataque em 50%.",
        "image": "/cards/189.png"
    },
    {
        "id": "190",
        "name": "Caveira Vermelha",
        "universe": "Marvel",
        "atk": 700,
        "def": 750,
        "rarity": "Soldado",
        "description": "O próximo adversário que destruir, ganha +400 DEF e reduz 50% do AT dos oponentes por 2T.",
        "image": "/cards/190.png"
    },
    {
        "id": "191",
        "name": "Duende Verde",
        "universe": "Marvel",
        "atk": 700,
        "def": 700,
        "rarity": "Soldado",
        "description": "Implanta caos as cartas adversárias na arena, destruindo até 2 cartas de Defesa menor que 1000.",
        "image": "/cards/191.png"
    },
    {
        "id": "192",
        "name": "Rocket Raccoon",
        "universe": "Marvel",
        "atk": 650,
        "def": 700,
        "rarity": "Soldado",
        "description": "Explosivos: Reduz Defesa dos adversários em 50%. E elimina oponentes que ficaram com Defesa menor que 600.",
        "image": "/cards/192.png"
    },
    {
        "id": "193",
        "name": "Groot",
        "universe": "Marvel",
        "atk": 650,
        "def": 650,
        "rarity": "Soldado",
        "description": "Quando destruído, volta como escudo vivo, bloqueando até 3 Ataque contra seus aliados.",
        "image": "/cards/193.png"
    },
    {
        "id": "194",
        "name": "Gavião Arqueiro",
        "universe": "Marvel",
        "atk": 650,
        "def": 700,
        "rarity": "Soldado",
        "description": "Atinge um oponente com 1500 de dano, ignorando qualquer escudo.",
        "image": "/cards/194.png"
    },
    {
        "id": "195",
        "name": "Mysterio",
        "universe": "Marvel",
        "atk": 600,
        "def": 650,
        "rarity": "Soldado",
        "description": "Anula 2 Ataque de oponentes à sua escolha contra si ou seus aliados.",
        "image": "/cards/195.png"
    },
    {
        "id": "211",
        "name": "Alerquina",
        "universe": "DC",
        "atk": 450,
        "def": 500,
        "rarity": "Soldado",
        "description": "Triplica seu Ataque, mas reduz sua Defesa pela metade, por 3 Turnos.",
        "image": "/cards/211.png"
    },
    {
        "id": "212",
        "name": "Coringa",
        "universe": "DC",
        "atk": 400,
        "def": 500,
        "rarity": "Soldado",
        "description": "Escolha uma carta da mão do oponente aleatoriamente para si.",
        "image": "/cards/212.png"
    },
    {
        "id": "213",
        "name": "Nami",
        "universe": "One Piece",
        "atk": 450,
        "def": 500,
        "rarity": "Soldado",
        "description": "Aumenta sua própria Defesa em 400 e reduz 200 Pontos dos adversários na arena por 2 Turnos.",
        "image": "/cards/213.png"
    },
    {
        "id": "214",
        "name": "Usopp",
        "universe": "One Piece",
        "atk": 400,
        "def": 500,
        "rarity": "Soldado",
        "description": "Lança um Ataque extra de 500 no seu Turno.",
        "image": "/cards/214.png"
    },
    {
        "id": "1000",
        "name": "Criptonita",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Enfraquece um oponente, impedindo-o de atacar por 5T, mas permitindo que seja atacado durante esse tempo.",
        "image": "/cards/1000.png"
    },
    {
        "id": "1001",
        "name": "Buraco Negro",
        "universe": "Original/Geral",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Inverte os lados da arena, trocando todas as cartas entre os jogadores",
        "image": "/cards/1001.png"
    },
    {
        "id": "1002",
        "name": "O Guardião",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Realiza um desejo, limitado a 1 'Carta' dos baralhos, arena, cemitério ou mãos (requer 1 sacrifício).",
        "image": "/cards/1002.png"
    },
    {
        "id": "1003",
        "name": "Poder do Destino",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Replica os poderes de uma carta na arena, à escolha do portador, por 1 Turno.",
        "image": "/cards/1003.png"
    },
    {
        "id": "1004",
        "name": "Ataque Duplo",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Permite que um guerreiro ataque duas vezes no mesmo turno.",
        "image": "/cards/1004.png"
    },
    {
        "id": "1005",
        "name": "Zona Fantasma",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Aprisiona o jogador oponente, fazendo ele peder seu próximo Turno.",
        "image": "/cards/1005.png"
    },
    {
        "id": "1006",
        "name": "Reino Quântico",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Envia 1 oponente para o reino quântico por 3 Turnos, impossibilitando-o de atacar ou ser atacado durante esse tempo.",
        "image": "/cards/1006.png"
    },
    {
        "id": "1007",
        "name": "Chocolate do Boo",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Transforma um guerreiro adversário em chocolate, eliminando-o imediatamente. Nv8-: sem custo. Nv9+: 1 sacrifício. Divinos: requer 2 sacrifícios.",
        "image": "/cards/1007.png"
    },
    {
        "id": "1008",
        "name": "7 Vidas",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Concede 2 vidas a um guerreiro escolhido, permitindo que continue na arena após ser derrotado.",
        "image": "/cards/1008.png"
    },
    {
        "id": "1009",
        "name": "Escudo Lanterna Verde",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Cria um poderoso escudo verde, protegendo todo o seu lado da arena por 2 turnos.",
        "image": "/cards/1009.png"
    },
    {
        "id": "1010",
        "name": "Surpresa do Coringa",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Troca 1 carta do campo com a mão do oponente, à escolha do possuidor.",
        "image": "/cards/1010.png"
    },
    {
        "id": "1011",
        "name": "Um Roubo Imperfeito",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Permite 'roubar' aleatoriamente uma carta da mão do oponente.",
        "image": "/cards/1011.png"
    },
    {
        "id": "1012",
        "name": "Apocalipse o Destruidor",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Destrói um guerreiro oponente, exigindo um sacrifício para ativação.",
        "image": "/cards/1012.png"
    },
    {
        "id": "1013",
        "name": "Evolução do Super Homem",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Aumenta o Ataque de um guerreiro escolhido em 800 Pontos.",
        "image": "/cards/1013.png"
    },
    {
        "id": "1014",
        "name": "Guardiões do Tempo",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Anula todos os Efeito do oponente na arena, até que esta carta seja destruída com um Ataque superior a 2000.",
        "image": "/cards/1014.png"
    },
    {
        "id": "1015",
        "name": "Defesa Maravilha",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Reflete 1 ataque do adversário.",
        "image": "/cards/1015.png"
    },
    {
        "id": "1016",
        "name": "Simbionte",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Absorve e funde um guerreiro inimigo com um aliado por 3 Turnos, unindo suas forças. Requer 2 sacrifícios.",
        "image": "/cards/1016.png"
    },
    {
        "id": "1017",
        "name": "Double Attack",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Permite que dois guerreiros aliados unam seus ataques por 1 Turno.",
        "image": "/cards/1017.png"
    },
    {
        "id": "1018",
        "name": "O Cavalheiro",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Ressuscita 1 carta do cemitério, à escolha do portador.",
        "image": "/cards/1018.png"
    },
    {
        "id": "1019",
        "name": "Morte em Família",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Leva ao cemitério o guerreiro adversário que eliminar o seu.",
        "image": "/cards/1019.png"
    },
    {
        "id": "1020",
        "name": "Fusão Potara",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "\"Une 2 guerreiros aliados em campo por 3 Turnos",
        "image": "/cards/1020.png"
    },
    {
        "id": "1021",
        "name": "Escudo Americano",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Aumenta a Defesa de um guerreiro escolhido em 800.",
        "image": "/cards/1021.png"
    },
    {
        "id": "1022",
        "name": "Sacrifício de Ferro",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Permite ressuscitar uma carta do cemitério geral.",
        "image": "/cards/1022.png"
    },
    {
        "id": "1023",
        "name": "Fusão",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Une dois guerreiros aliados em campo. Quando um é derrotado, ambos são eliminados.",
        "image": "/cards/1023.png"
    },
    {
        "id": "1024",
        "name": "Edo Tensei",
        "universe": "Naruto",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Utiliza 1 carta do cemitério geral com 50% dos Pontos. Se o corpo permanecer vivo após 3 Turnos o Efeito pode ser reutilizado 1x.",
        "image": "/cards/1024.png"
    },
    {
        "id": "1025",
        "name": "Sharingan",
        "universe": "Naruto",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Replica uma Habilidade já usada na partida, seguindo sua duração original.",
        "image": "/cards/1025.png"
    },
    {
        "id": "1054",
        "name": "Engenharia Capsule Corp",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Engenharia: Escolha 1 Aliado na arena. Ele recebe +1000 de Defesa permanentemente.",
        "image": "/cards/1054.png"
    },
    {
        "id": "1055",
        "name": "Suporte Logístico",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Primeiro Socorros: Restaura imediatamente 2000 HP do seu Avatar (Vida do Jogador).",
        "image": "/cards/1055.png"
    },
    {
        "id": "1056",
        "name": "Intimidação Materna",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Intimidação: O oponente é obrigado a pular a Fase de Batalha (ninguém ataca neste turno).",
        "image": "/cards/1056.png"
    },
    {
        "id": "1057",
        "name": "Semente dos Deuses",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Semente dos Deuses: Restaura 100% de Ataque, Defesa e Habilidade de um aliado (deixa a carta nova em folha).",
        "image": "/cards/1057.png"
    },
    {
        "id": "1058",
        "name": "Iniciativa Vingadores",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Iniciativa Vingadores: Revele os 3 primeiros 'Vingadores' do deck. Escolha 1 para entrar diretamente na Arena.",
        "image": "/cards/1058.png"
    },
    {
        "id": "1059",
        "name": "Decifre-me",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Decifre-me: O oponente revela a mão. Você escolhe 1 carta para ele descartar.",
        "image": "/cards/1059.png"
    },
    {
        "id": "1060",
        "name": "O Campeão Chegou!",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "O Campeão: Faz um show que distrai o oponente. O inimigo perde o turno inteiro (Pula Compra, Estratégia e Batalha).",
        "image": "/cards/1060.png"
    },
    {
        "id": "1061",
        "name": "Bara Bara no Mi (Escape)",
        "universe": "One Piece",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Bara Bara no Mi: Ative quando Buggy for derrotado. Em vez de ir ao cemitério, ele retorna para sua mão.",
        "image": "/cards/1061.png"
    },
    {
        "id": "1062",
        "name": "Negative Hollow",
        "universe": "One Piece",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Negative Hollow: Escolha um inimigo. O Ataque (Ataque) e a Defesa (Defesa) dele são invertidos por 2 turnos.",
        "image": "/cards/1062.png"
    },
    {
        "id": "1063",
        "name": "Mane Mane no Mi (Cópia)",
        "universe": "One Piece",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito",
        "description": "Mane Mane no Mi: Escolha um inimigo. Um aliado seu copia o valor de Ataque (Ataque) dele por 1 turno.",
        "image": "/cards/1063.png"
    },
    {
        "id": "1026",
        "name": "X-Men",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Irmandade Mutante: Todos os mutantes aliados ganham +400 Pts. Dura 3 Turnos. (Precisa de 3 mutantes)",
        "image": "/cards/1026.png"
    },
    {
        "id": "1027",
        "name": "Vingadores",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "\"Reunir os Mais Fortes: Escolha 1 Vingador na arena",
        "image": "/cards/1027.png"
    },
    {
        "id": "1028",
        "name": "Quarteto Fantástico",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Sinergia Familiar: Todos os membros do Quarteto ganham +1000 Pts e ficam imunes a Efeito. Dura 2 Turnos. (Precisa de 4)",
        "image": "/cards/1028.png"
    },
    {
        "id": "1029",
        "name": "Guardiões da Galáxia",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Manobra Coordenada: Todos os Guardiões atacam um mesmo alvo simultaneamente. O dano é somado e ignora escudos. Uso único. (Precisa de 3)",
        "image": "/cards/1029.png"
    },
    {
        "id": "1030",
        "name": "Liga da Justiça",
        "universe": "DC",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Força Unida: Cria um escudo de 2000 pontos que protege apenas a liga por 3 Turnos. Ao quebrar, causa 1000 de dano aos oponentes. (Precisa de 4)",
        "image": "/cards/1030.png"
    },
    {
        "id": "1031",
        "name": "Guerreiros Z",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Espírito de Luta: 2 Guerreiros Z ganham +1400 de Ataque. Dura 2 Turnos. (Precisa de 4)",
        "image": "/cards/1031.png"
    },
    {
        "id": "1032",
        "name": "Time 7",
        "universe": "Naruto",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "\"Trabalho em Equipe: Os 3 atacam juntos 2 Turnos",
        "image": "/cards/1032.png"
    },
    {
        "id": "1033",
        "name": "Esferas do Dragão 1",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Reúna as 7 Esferas do Dragão, invoque Shenlong e faça um desejo sem limites. As esferas somem da arena após o uso.",
        "image": "/cards/1033.png"
    },
    {
        "id": "1034",
        "name": "Esferas do Dragão 2",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Reúna as 7 Esferas do Dragão, invoque Shenlong e faça um desejo sem limites. As esferas somem da arena após o uso.",
        "image": "/cards/1034.png"
    },
    {
        "id": "1035",
        "name": "Esferas do Dragão 3",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Reúna as 7 Esferas do Dragão, invoque Shenlong e faça um desejo sem limites. As esferas somem da arena após o uso.",
        "image": "/cards/1035.png"
    },
    {
        "id": "1036",
        "name": "Esferas do Dragão 4",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Reúna as 7 Esferas do Dragão, invoque Shenlong e faça um desejo sem limites. As esferas somem da arena após o uso.",
        "image": "/cards/1036.png"
    },
    {
        "id": "1037",
        "name": "Esferas do Dragão 5",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Reúna as 7 Esferas do Dragão, invoque Shenlong e faça um desejo sem limites. As esferas somem da arena após o uso.",
        "image": "/cards/1037.png"
    },
    {
        "id": "1038",
        "name": "Esferas do Dragão 6",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Reúna as 7 Esferas do Dragão, invoque Shenlong e faça um desejo sem limites. As esferas somem da arena após o uso.",
        "image": "/cards/1038.png"
    },
    {
        "id": "1039",
        "name": "Esferas do Dragão 7",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Reúna as 7 Esferas do Dragão, invoque Shenlong e faça um desejo sem limites. As esferas somem da arena após o uso.",
        "image": "/cards/1039.png"
    },
    {
        "id": "1040",
        "name": "Batman 1",
        "universe": "DC",
        "atk": 6000,
        "def": 6000,
        "rarity": "Zeta",
        "description": "Ao combinar as três cartas Batman, invoca um guerreiro supremo com 6.000 Pontos.",
        "image": "/cards/1040.png"
    },
    {
        "id": "1041",
        "name": "Batman 2",
        "universe": "DC",
        "atk": 6000,
        "def": 6000,
        "rarity": "Zeta",
        "description": "Ao combinar as três cartas Batman, invoca um guerreiro supremo com 6.000 Pontos.",
        "image": "/cards/1041.png"
    },
    {
        "id": "1042",
        "name": "Batman 3",
        "universe": "DC",
        "atk": 6000,
        "def": 6000,
        "rarity": "Zeta",
        "description": "Ao combinar as três cartas Batman, invoca um guerreiro supremo com 6.000 Pontos.",
        "image": "/cards/1042.png"
    },
    {
        "id": "1043",
        "name": "Reality Stone",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Realiza um pedido limitado à arena e cemitério. Requer um sacrifício por Turno, a joia é destruída caso não haja sacrifício.",
        "image": "/cards/1043.png"
    },
    {
        "id": "1044",
        "name": "Space Gem",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Permite criar portais transferindo cartas na arena. Requer um sacrifício por Turno, a joia é destruída caso não haja sacrifício.",
        "image": "/cards/1044.png"
    },
    {
        "id": "1045",
        "name": "Mind Stone",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Controla a alma de guerreiros vivos ou mortos. Requer um sacrifício por Turno, a joia é destruída caso não haja sacrifício.",
        "image": "/cards/1045.png"
    },
    {
        "id": "1046",
        "name": "Soul Stone",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Revela todas as cartas que o oponente possuir. Requer um sacrifício por Turno, a joia é destruída caso não haja sacrifício.",
        "image": "/cards/1046.png"
    },
    {
        "id": "1047",
        "name": "Time Stone",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Altera o tempo de uma carta, 1x por Turno. Requer um sacrifício por Turno, a joia é destruída caso não haja sacrifício.",
        "image": "/cards/1047.png"
    },
    {
        "id": "1048",
        "name": "Power Stone",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Iguala os Pontos de qualquer carta a outra já usada. Requer um sacrifício por Turno, a joia é destruída caso não haja sacrifício.",
        "image": "/cards/1048.png"
    },
    {
        "id": "1049",
        "name": "Manopla do Infinito",
        "universe": "Marvel",
        "atk": 0,
        "def": 0,
        "rarity": "Zeta",
        "description": "Atrai todas as Joias da arena e da mão do oponente em 4T. Com 6 joias, concede um pedido limitado a arena. Todas são destruídas após o pedido.",
        "image": "/cards/1049.png"
    },
    {
        "id": "1050",
        "name": "Gotenks",
        "universe": "Dragon Ball",
        "atk": 2800,
        "def": 2500,
        "rarity": "Fusão",
        "description": "\"Se transforma e pode atacar 2 vezes",
        "image": "/cards/1050.png"
    },
    {
        "id": "1051",
        "name": "Gogeta",
        "universe": "Dragon Ball",
        "atk": 5000,
        "def": 4800,
        "rarity": "Fusão",
        "description": "Instinto Superior (Kamehameha elimina 1 oponente por Turno) + Ultra Ego (ao ser atingido resiste e contra-ataca). Dura 3 Turnos.",
        "image": "/cards/1051.png"
    },
    {
        "id": "1052",
        "name": "Vegetto",
        "universe": "Dragon Ball",
        "atk": 5000,
        "def": 4800,
        "rarity": "Fusão",
        "description": "Instinto Superior (Esquiva de Ataque/Habilidade/Efeito) + Ultra Ego (elimina quem tocar). Dura 3 Turnos.",
        "image": "/cards/1052.png"
    },
    {
        "id": "1053",
        "name": "Zamasu Fundido",
        "universe": "Dragon Ball",
        "atk": 4200,
        "def": 4000,
        "rarity": "Fusão",
        "description": "Copia a Habilidade de 1 oponente que ainda não foi ativada. Adicionalmente, gera um escudo com 1000 de Defesa para o seu lado.",
        "image": "/cards/1053.png"
    },
    // TOKENS ESPECIAIS (GERADOS POR ZETA)
    {
        "id": "TOK_SHENLONG",
        "name": "Invocação de Shenlong",
        "universe": "Dragon Ball",
        "atk": 0,
        "def": 0,
        "rarity": "Efeito", // Token de Evento
        "description": "Invoca o Dragão Eterno. Ao ser jogado, permite realizar um desejo supremo (vitória instantânea ou recuperação total).",
        "image": "/cards/token_shenlong.png"
    },
    {
        "id": "TOK_BATMAN_Z",
        "name": "Batman Z (Supremo)",
        "universe": "DC",
        "atk": 6000,
        "def": 6000,
        "rarity": "Zeta", // Token Unidade
        "description": "O estrategista supremo. Com 6000 de ataque e defesa, é uma lenda viva no campo de batalha.",
        "image": "/cards/token_batman_z.png"
    }
];
