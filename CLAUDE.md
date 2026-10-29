# CLAUDE.md — Aion 2 Manager

Contexto do projeto para qualquer sessão do Claude (ou pessoa) que for trabalhar neste repositório.

## O que é

App de desktop para **Windows** que organiza as tarefas diárias e semanais do jogo **Aion 2** (versão **Global**, servidores da América Latina) em todos os personagens do usuário: um **main** e vários **alts**.

- O usuário marca **manualmente** o que já fez (check simples, sem contadores).
- Vê **cada semana** e **cada dia da semana**, com histórico das semanas passadas.
- Faz **backup** em um arquivo de texto (`.json`) para levar o histórico para outro PC.
- Visual inspirado na interface do Aion 2, mas com **arte original** (nada de logos, ícones ou artes oficiais da NCSOFT).

## Como trabalhar com o usuário (Rafael)

- Toda comunicação, interface e textos do app em **português do Brasil**.
- Trabalhar **por etapas, uma de cada vez**. Planejar antes, mostrar o resultado e só seguir após aprovação. Não fazer várias etapas de uma vez.
- O usuário prefere ver algo visual para aprovar antes de código grande.
- Ele não compila localmente: a validação é feita instalando o `.exe` gerado pelo GitHub Actions.
- **Desde a v1.4.0: juntar várias mudanças antes de lançar.** Cada mudança é feita, testada e mostrada (prints) e vai para o GitHub (commit/push na `main`, que não dispara build). Só gerar instalador (subir versão + `gh workflow run`) quando o usuário pedir para publicar. Manter uma lista "Mudanças ainda não lançadas" abaixo.

### Mudanças ainda não lançadas
- (nenhuma)

## Decisões de produto (já tomadas)

| Tema | Decisão |
|---|---|
| Plataforma | Só Windows |
| Personagens | Todos no **mesmo servidor**, com **um único main** |
| Conteúdo de servidor | Aparece **só no main**. Alts mostram só tarefas de personagem |
| Membership (Special Quai) | **Por conta** (desde a v1.3.0; antes era por personagem). Um switch em Configurações → Conta. Muda os textos das tarefas (ex.: Abismo 7h → 14h) e o limite/recarga da Odyle Energy |
| Marcação | **Check simples** (feito / não feito) |
| Tarefas diárias | Um check por dia |
| Semanais com ritmo diário | Um check por dia com a meta do dia (cadência `ritmo`; a Daily Dungeon saiu daqui e virou semanal em 28/10/2026) |
| Semanais únicas | Um check na semana (ex.: Ascension Trial, raids) |
| Catálogo de tarefas | Editável pelo usuário (números mudam com patches) |
| Armazenamento | Arquivo local na pasta do app, salvo automaticamente |
| Backup | Exportar/importar `.json` legível no Bloco de Notas |
| Distribuição | Instalador NSIS gerado pelo GitHub Actions, publicado em Releases |

## Regras de tempo do jogo

- **Reset diário:** 07:00 UTC = **04:00 em Brasília (UTC-3)**.
- **Reset semanal:** **quarta-feira às 04:00** (Brasília).
- No app, a **semana vai de quarta 04:00 até terça 03:59**, e o **dia vira às 04:00** (jogar até 2h da manhã de quinta conta como quarta).
- O horário de reset deve ser configurável (confirmado pela comunidade, não oficialmente).

## Escopos de tarefa

No Aion 2 quase nada é "da conta" de verdade; o que é compartilhado costuma ser **por servidor**.

- **Personagem:** cada personagem tem a própria cota.
- **Servidor:** todos os personagens do mesmo servidor dividem a cota → no app, vai só para o **main**.
- **Conta (global):** segue o jogador em qualquer servidor (ex.: cosméticos do Founder's Pack). Quase não gera tarefas.

## Catálogo de tarefas no código (Etapa 4)

- Fica em `src/data/catalog.ts` (`DEFAULT_CATALOG`, 29 tarefas, 18 ligadas por padrão). Aprovado pelo usuário em 27/10/2026.
- **Nomes em inglês** (o usuário joga com o cliente em inglês); descrições em português.
- Cada tarefa tem `id` estável (o histórico é salvo por ele — **nunca renomear um id**), `scope` (`personagem`/`servidor`), `cadence` (`diaria`, `ritmo`, `semanal`, `dias-fixos`), `category`, `enabledByDefault` e, quando muda com membership, `descriptionMember`.
- `tasksForRole()` aplica a regra main/alt; `occursOn()` filtra eventos de dias fixos.
- Tarefas novas adicionadas ao `DEFAULT_CATALOG` aparecem sozinhas para quem atualizar (o `resolveCatalog` junta o padrão com os ajustes salvos), sem migração.
- Ficaram de fora de propósito: Spacetime Rifts (timers na Etapa 14), "sempre pegar o cubo" (vira alerta fixo). Season Mission entrou depois como check semanal (pedido do usuário).
- O usuário pode pedir tarefas novas depois; adicionar ao catálogo com `id` novo.

## Pesquisa de origem do catálogo (27/10/2026, cliente Global)

Fontes principais: metabot.gg (lê os dados do cliente), leprestore.com, playnews.gg, guildorder.com, mein-mmo.de. Os números podem mudar com patches.

### Diárias

| Tarefa | Escopo | Regra |
|---|---|---|
| Duty Missions | Servidor | 5 por dia, **não acumulam** |
| Daily Dungeon (Unknown Fissure) | Servidor | 14 por semana (ritmo de 2/dia) |
| Shugo Festival (chaves) | Servidor | Recarga diária, acumula até um limite (12, ou 21 com membership; uma fonte diz 4/dia até 28) |
| Invasão Dimensional (chave) | Servidor | 1/dia, acumula até 7 |
| Nightmare | Personagem | 2 tentativas/dia, acumula até 14; só gasta se vencer |
| Odyle Energy | Personagem | +15 a cada 3h, máx. 560 (840 com membership); para de regenerar cheia; cubo custa 40 |
| Conquest (recompensas) | Personagem | +1 a cada 8h, máx. 21 |
| Transcendence (recompensas) | Personagem | +1 a cada 12h, máx. 14; exige item level 1.600 |
| Spacetime Rifts | — | Evento a cada 3h (opcional) |

### Semanais (zeram na quarta, não acumulam)

| Tarefa | Escopo | Regra |
|---|---|---|
| Sanctuary Raids (Ludra, Corroded Decontamination Facility, Chalice of Muspel) | Personagem | 4 tentativas cada; kills do chefe final: 1 na Ludra, 2 nas outras |
| Ascension Trial | Personagem | 3 entradas |
| Subjugation | Personagem | 3 tickets |
| Exploration | Personagem | 7 recompensas por dungeon de Expedition |
| Abismo (Lower, Middle, Upper Reshanta) | Personagem | 7h por camada (14h em Lower/Middle com membership) |
| Growth dungeons (Silent Graveyard, Fafnite Amphitheater) | Personagem | 7h cada |
| Daeva Pass | Personagem | Limite semanal de EXP (50.000 na Season 1) |
| Arena / Battlefield | Personagem | Recompensas de vitória e participação |
| Command Scrolls PvE | Servidor | 12 compras na capital |
| Command Scrolls PvP | Servidor | 20 compras no Abismo |
| Cubos não coletados (Conquest/Transcendence) | Servidor | 10/semana; sair sem pegar o cubo também desconta; em 0 bloqueia a entrada |
| Compras semanais (Breeze Light Merchants, loja do Abismo) | Misto | Ex.: Resurrection Spirit Stone 10/personagem; Potential Boost Stone 2/servidor |

### Divergências entre fontes (conferir no jogo)

1. Duty Missions e Daily Dungeon: a maioria diz **servidor**; o playnews.gg diz personagem. Adotado: **servidor**.
2. Chaves do Shugo Festival: 3/dia até 12 **ou** 4/dia até 28.

## Visual (aprovado na Etapa 1)

Referência: prints da interface do jogo (Stat Info e Market). Mockup aprovado no canvas de design do Claude.

- Fundo azul-ardósia escuro com degradê radial e **vinheta** escura nas bordas.
- Painéis com **losango ✦ e linha prateada** no centro do topo.
- Títulos de seção em **ciano** com "✦".
- Abas com **arco luminoso** sob a aba ativa.
- **Cores de raridade como estado:** pendente = cinza, hoje = ciano, concluído = **dourado** (como itens "Unique").
- Fonte **Noto Sans** (embutida via `@fontsource`, o app funciona offline).
- Tokens em `src/styles/theme.css`; estilos dos componentes em `src/styles/components.css`.

## Estrutura do repositório

```
.github/workflows/release.yml   Build do instalador no Windows e publicação em Releases
src/
  main.tsx                      Entrada: fontes, CSS, App
  App.tsx                       Cabeçalho + abas + tela ativa
  styles/theme.css              Tokens de cor, fundo com vinheta, .panel com ornamento
  styles/components.css         Estilos de todos os componentes
  components/ui/                Componentes visuais reutilizáveis (importar de "components/ui")
    Basics.tsx                  Panel, SectionTitle, Tabs, Badge, ProgressBar, ProgressRing, Alert, Button
    TaskWidgets.tsx             CheckCell, WeeklyCard, CharacterCard, AddCharacterCard
    AppHeader.tsx               Cabeçalho com logo, abas e contagem do reset
    icons.tsx                   Ícones SVG próprios
  components/ErrorBoundary.tsx  Tela amigável de erro (em vez de tela em branco)
  updater/                      Atualização pelo app (hook + faixa de aviso + rodapé de versão)
  data/types.ts                 Tipos: TaskDef, TaskScope, TaskCadence, Weekday, CharacterRole
  data/catalog.ts               Catálogo padrão (DEFAULT_CATALOG) + tasksForRole, describe, occursOn
  screens/SettingsScreen.tsx    Aba Configurações: Backup, Tarefas, Horário do reset, Local dos dados
  screens/TaskEditorSection.tsx Editor de tarefas: ligar/desligar, editar descrição, criar/excluir tarefas próprias
  screens/ResetSection.tsx      Horário do reset diário (hora local do PC) e dia do reset semanal
  data/settings.ts              Settings (reset, ajustes por tarefa, tarefas próprias), parseSettings, resolveCatalog (testado)
  screens/CraftScreen.tsx       Aba Craft (calculadora de receitas; data/craft.ts, components/CraftIcons.tsx)
  screens/GuideScreen.tsx       Aba Guia (prioridade de status; dados em data/guide/)
  screens/CharactersScreen.tsx  Aba Personagens: cadastro, edição, exclusão, Main/Alt, GS/CP e Odyle inicial
  screens/OdyleScreen.tsx       Aba Odyle: Basic/Charged por personagem, gastar −40/−80, Charged +40/+10, desfazer, corrigir
  screens/AccountSection.tsx    Configurações → Conta: Membership da conta e números da Odyle
  data/odyle.ts                 Cálculo da Odyle Energy (recargas, valor atual, enche às, gastar, charged) + odyle.test.ts
  data/model.ts                 Character, AppData (schemaVersion), CLASSES, parseData, ensureSingleMain
  data/store.tsx                StoreProvider/useStore: carrega ao abrir e salva 300 ms após cada mudança
  data/storage.ts               Ponte com o Rust (load_data/save_data); no navegador usa localStorage
  time/gameTime.ts              Dia/semana do jogo, próximos resets, textos (funções puras, testadas)
  time/gameTime.test.ts         Testes (vitest) da lógica de tempo
  time/useGameClock.ts          Hook que atualiza o relógio a cada 15 s
  components/WeekView.tsx       Grade de uma semana (cards, diárias, semanais, progresso); editável ou somente leitura
  screens/WeeklyScreen.tsx      Aba Semana: WeekView da semana atual + alertas
  screens/HistoryScreen.tsx     Aba Histórico: navegação entre semanas encerradas, resumo e WeekView somente leitura
  screens/TodayScreen.tsx       Aba Hoje: todos os personagens, diárias de hoje + semanais, botões grandes
  data/checks.ts                Chaves das marcações, estado das células e progresso da semana (testado)
  data/checks.test.ts           Testes das marcações e do progresso
  data/backup.ts                Formato do backup (envelope), leitura/validação e resumo (testado)
  data/backupIO.ts              Janelas Salvar/Abrir (plugin dialog) e cópia de segurança
src-tauri/                      Núcleo Tauri 2 (Rust), ícones, config do instalador
```

## Stack

- **Tauri 2** + **React 19** + **TypeScript** + **Vite**.
- Instalador **NSIS**, modo `currentUser` (não pede administrador), em português. ~3,3 MB.
- Identificador: `com.founderha.aion2taskmanager`.

## Build e release

- O instalador é gerado pelo workflow **"Build e Release (Windows)"** (`.github/workflows/release.yml`).
- Dispara por **push de tag `v*`** ou manualmente (**workflow_dispatch**), com o campo opcional `notas` (texto que aparece na faixa de atualização do app).
- **Em sessões do Claude, push de tag é bloqueado (HTTP 403).** Use: `gh workflow run release.yml -R FounderHA/aion2taskmanager --ref main -f notas="Novidades em português"`. O `tauri-action` cria sozinho a tag `v<versão>` e a Release a partir da versão do `tauri.conf.json`.
- Antes de cada release, atualizar a versão em **3 lugares**: `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`. A mesma versão não pode ser publicada duas vezes.
- Em sessões do Claude, o GraphQL do GitHub é bloqueado: use `gh api repos/FounderHA/aion2taskmanager/...` (REST) em vez de `gh release view`.
- Primeiro build leva ~10–15 min (compila Rust do zero); depois há cache.
- Validar o frontend localmente com `npm run build` (faz o type-check).
- O Windows mostra "O Windows protegeu o computador" (sem assinatura digital): **Mais informações → Executar assim mesmo**.

## Ajustes da v2.0.1
- Craft: removida a opção "Ordem de cadastro" da ordenação (pedido do usuário). Padrão agora é Raridade: Unique → Common; quem tinha "cadastro" salvo cai no padrão.

## Ajustes da v2.0.0
- Craft: **ordenar a lista de itens** (seletor abaixo da busca): ordem de cadastro, raridade Unique → Common, raridade Common → Unique, nome A → Z, nome Z → A (empate por nome). A escolha fica lembrada no localStorage (`aion2tm-craft-ordem`).

## Ajustes da v1.9.0
- **Aba Craft** (calculadora de receitas; entre Odyle e Cadastro; id `craft`): `screens/CraftScreen.tsx`, dados em `data/craft.ts`, ícones originais em `components/CraftIcons.tsx`.
  - **Lista de itens criada pelo usuário** (`AppData.craftItems`, `parseCraftItems`; arquivo sem a lista começa com os 2 exemplos): botão "+ Novo item" abre um formulário com **nome**, **raridade** (as 4 do jogo, mesmas cores dos selos: Common, Rare, Epic, Unique) e **imagem do ícone** escolhida do PC (PNG 96×96, `contain`, salva no dados.json). Lápis em cada item para editar; excluir em dois cliques (avisa se o item está em receitas, que passam a mostrar "item removido"). Itens de exemplo: Common Material e Refining Stone, com ícones desenhados no app (`icon`), editáveis/excluíveis.
  - Receita: itens da lista com **quantidade (quantos faltam)** e **valor de mercado por unidade**; subtotal por linha e **total** (Kinah, separador de milhar en-US). Sem campo "quanto tenho" (decisão do usuário). Item repetido não entra duas vezes.
  - Receitas salvas em `AppData.recipes` (`{id, name, icon, lines:[{itemId, qty, price}], updatedAt}`; `parseRecipes` tolerante; vão no backup). Salvar exige nome; editar uma salva mostra "Alterações não salvas" e trocar de receita com alterações pede confirmação. Excluir em dois cliques.
  - **Lista padrão para todos** (`data/craftCatalog.ts`, `BUILTIN_CRAFT_ITEMS`): o usuário cadastra itens, clica **"Exportar lista"** (arquivo `itens-craft-AAAA-MM-DD.json`, `tipo: "itens-craft"`, `makeItemsExport`/`readItemsExport`) e manda o arquivo aqui; os itens entram em `BUILTIN_CRAFT_ITEMS` (mantendo os ids) e vão numa versão. `mergeBuiltinItems` acrescenta itens padrão que a pessoa ainda não tem; não sobrescreve os que ela editou; os que ela excluiu ficam em `AppData.craftHidden` e não voltam. **Decisão do usuário (29/10/2026): embutir as imagens dos ícones do jogo no repositório (opção A), ciente de que o repo é público e a arte é da NCSOFT.** Ao embutir, salvar as imagens como arquivos em `src/assets/craft/` (import do Vite) em vez de base64 no código.
  - Exportar não funciona na versão de teste no navegador (o sandbox do artifact bloqueia downloads): usar o app instalado.
  - **Tipo da receita** (`grade`: `common` | `rare` | `epic` | `unique`, `RECIPE_GRADES` com as cores dos selos do jogo: Common cinza, Rare verde, Epic azul, Unique dourado). Selo `GradeBadge`; o nome da receita na lista usa a cor do tipo. Receitas antigas viram `common`.
  - **Versão de teste no navegador** (artifact privado do usuário): https://claude.ai/artifact/PKX6ETbgmuKiAfhAeB6Zsr — gerar com `npx vite build --base ./ --outDir <pasta>` e publicar `pagina.html` (title + link CSS + script module + `<div id="root">`) com os arquivos de `assets/` (só fontes latin/latin-ext). Dados do teste ficam no localStorage do navegador.
  - Ícone da receita (`RECIPE_ICONS`): por enquanto só **ombreira** (`pauldron`, desenho original inspirado no print do usuário). Ideia combinada: conjunto de ícones genéricos (armas, armaduras, acessórios, materiais) para receitas e itens.

## Ajustes da v1.8.0
- **Aba Guia** (nova, entre Histórico e Configurações; id `guia`): `screens/GuideScreen.tsx` + dados em `data/guide/statPriorities.ts`. Primeira seção: **Prioridade de status** transcrita (por prints do usuário em 28/10/2026) da aba "Stat Priorities" da planilha comunitária "Screamheart's Aion 2 Content Guide". Soul Binding por equipamento (Arma, Guarda, Elmo, Ombreiras, Peitoral, Grevas, Luvas, Capa, Botas, Brincos, Colar, Anéis; Cinto, Amuleto e Braceletes ainda sem dados na planilha), com ordem, Alvo/Opcional e chance aproximada (~%); Manastone/Soulstone; notas (breakpoint de Critical Hit/Accuracy, Precision vs Multi-hit). "Onde buscar cada status": chips que destacam os slots em que o status é alvo. Nomes de status em inglês (cliente). O resto da planilha (Checklist, Content Guide, Shops Guide, Gear Enhancement, Crafting…) fica para depois, uma aba de cada vez, a pedido do usuário.
- Botão do modo compacto no cabeçalho virou só ícone (com dica ao passar o mouse) para caber a 7ª aba; abas com padding menor abaixo de 1560 px.
- Neste ambiente o Google Sheets não abre (shell bloqueado, WebFetch só resume): pedir ao usuário CSV ou prints de cada aba.

## Ajustes da v1.7.0
- **Daily Dungeon virou semanal** ("14 entradas por semana", cadência `semanal`, mesmo id). Marcações antigas por dia ficam guardadas mas não aparecem mais.
- **Modo compacto** (`screens/CompactView.tsx` + `components/windowMode.ts`): botão "Compacto" no cabeçalho. A janela vai para 380×720, sempre no topo (alfinete liga/desliga). Mostra anéis de % de Hoje e da Semana, e por personagem: barra do dia, diárias que faltam com check, "▸ Semana" que abre semanais + compras com check, selo de Odyle perto do limite. "Mostrar concluídas" opcional. Lembra o modo e o alfinete no localStorage. Permissões novas em `capabilities/default.json`: `core:window:allow-set-size`, `allow-set-min-size`, `allow-set-always-on-top`, `allow-unmaximize`. No navegador só troca a tela.
- **Efeito "Dia completo"** (`components/DayCompleteFx.tsx`): asas de luz + anel de runas dourado + texto, quando um personagem fecha todas as diárias de hoje (versão maior quando todos fecham). Só dispara por marcação feita agora (ignora carregar/importar dados, mudança de catálogo e virada do dia). Funciona também no modo compacto. `data/today.ts` (`charDays`, `completeToday`) é compartilhado com o modo compacto.
- **Tema por facção**: `settings.theme` = `auto` (facção do main) | `elyos` | `asmodian`, em Configurações → Aparência. Aplica `data-faction` no `<html>`; o tema Asmodian (carmesim + roxo) redefine os tokens em `theme.css` (`--cyan*`, `--accent-rgb`, `--accent2-rgb`, fundo animado `--bd-*`, `--rune*`, `--ember*`). O dourado continua sendo "concluído". Cores de destaque e do fundo agora vêm desses tokens (não usar mais rgba fixo de ciano).
- Cuidado: `.app-bg > :not(.backdrop):not(.fx-day)` recebe `position: relative`; elementos fixos novos dentro do `.app-bg` precisam entrar nessa exceção.

## Ajustes da v1.6.0
- **Season Mission: Weekly** (nova, id `season-mission-weekly`, semanal, por personagem, ligada): um check de "conferi as missões da semana e peguei as recompensas". A aba Season (reset de temporada) ficou de fora.
- **Abyss Supply Request** ligado por padrão, por personagem: "Abyss Supply Request: Emergency" (diária, id `supply-requests-urgent`) e "Abyss Supply Request: Weekly" (semanal, id `supply-requests-weekly`). Ids antigos mantidos (antes eram "Supply Requests (urgente/semanal)", desligados). Um check só: "já olhei e entreguei o que dava".
- Ideia registrada (pensar depois): ler dados do jogo pela rede como os DPS meters (Npcap + engenharia reversa do protocolo). Riscos: quebra a cada patch, Npcap exige administrador, zona cinzenta nos termos da NCSOFT. Se fizer, começar só pela Odyle Energy e como opção desligada.

## Ajustes da v1.5.0
- Wind Breeze Merchants (Special): Odyle Energy passou de 20/personagem para **4 por personagem** (mesmo id `wind-breeze-odyle-energy`, marcações mantidas) + nova **Odyle Energy (servidor) 16 por servidor** (id `wind-breeze-odyle-energy-server`, só no main). Pedido do usuário em 28/10/2026.
- Tarefa diária **Odyle Energy desligada por padrão** (a aba Odyle cuida disso; quem quiser religa em Configurações → Tarefas; marcações antigas ficam guardadas). Alerta fixo de Odyle saiu da lateral da aba Personagem. As compras de Odyle Energy nas lojas continuam.
- **Fundo animado** inspirado no estilo do God of War 4 (pedido do usuário, arte 100% original): `components/RuneBackdrop.tsx` montado no App, atrás de tudo (`.backdrop`, fixo, sem cliques). Névoa fria azul-esverdeada que se move, anel grande de runas Elder Futhark (traços SVG desenhados no código) girando em 120 s, anel dourado interno girando ao contrário (80 s), anel menor no canto inferior esquerdo (100 s), brasas subindo e vinheta. Respeita `prefers-reduced-motion`. Painéis ficaram um pouco mais transparentes (`--panel-top/bottom`). Evitar `filter` em elementos que giram (custa a cada quadro).
- Texto do rodapé da aba Odyle atualizado (não fala mais da tarefa diária).
- Foto maior no card do personagem: moldura de 96 px à esquerda, com nome, classe, GS/CP e progresso ao lado (`char-card__body`).

## Abas Progresso e Personagem (v1.4.0)
- Abas: **Progresso · Personagem · Odyle · Cadastro · Histórico · Configurações**. O app abre em Progresso (ou Cadastro sem personagens).
- **Progresso** (`screens/ProgressScreen.tsx`, substituiu a aba Hoje/`TodayScreen`): só leitura. Três quadros (diárias de hoje somadas, % médio da semana, semanais/compras pendentes), bloco "Hoje — diárias" e bloco "Esta semana — semanais e compras" com chips do que falta (servidor em dourado; compras com o nome da loja). Clicar no personagem abre a aba Personagem com ele selecionado.
- **Personagem** = antiga aba Semana (`WeeklyScreen` + `WeekView`); a seleção fica no App (`selectedId`/`onSelect` opcionais no `WeekView`; o Histórico continua com seleção interna).
- **Cadastro** = antiga aba Personagens (ids internos das abas: `progresso`, `personagem`, `personagens`).

## Foto do personagem (v1.3.1)
- `Character.photo`: data URL (JPEG 160×160, cortado em quadrado no centro) ou null; dados antigos viram null; acima de `PHOTO_MAX` (250 KB) é descartada ao ler.
- Escolhida no formulário de Personagens ("Escolher foto"/"Trocar foto"/"Remover"); fica só no dados.json do PC (e vai no backup).
- `CharPortrait` (moldura dourada com silhueta quando não há foto) aparece no card do personagem (96 px; Cadastro, Personagem, Histórico), no Progresso e na aba Odyle.
- `components/pickImage.ts` é o seletor de imagem compartilhado (fit `contain` para ícones de GS/CP, `cover` para a foto).

## Odyle Energy e Membership por conta (v1.3.0)
- **Membership é da conta**: `settings.membership` (boolean). `Character.member` foi removido; ao abrir dados antigos, se qualquer personagem tinha `member: true`, a conta vira membership (migração em `parseData`). `describe(task, membership)` usa o da conta.
- **Regras** (`settings.odyle`, editáveis em Configurações → Conta): com membership limite 840 e +15; sem, 560 e +10. Recarga a cada 3h às 01, 04, 07, 10, 13, 16, 19, 22 de Brasília (= horas UTC ≡ 1 mod 3), confirmado pelo usuário. Charged Energy (itens) até 2000, não recarrega.
- **Modelo "foto + relógio"**: `Character.odyle = { basic, charged, at }` (ou null = não controla). Valor atual = foto + recargas em (at, agora], parando no limite; se a foto já está acima do limite, fica parada. Não precisa do app aberto.
- Qualquer ação gera uma foto nova com o valor atual: gastar (Basic primeiro, depois Charged; botão desabilita se não houver o suficiente), Charged +40/+10, "Corrigir valores" (o usuário digita o que vê no jogo e a contagem recomeça dali). Mudar membership ou os números refaz a foto de todos com as regras antigas antes de trocar.
- Gasto só por botão (−40 / −80), sem campo livre — pedido do usuário. "Desfazer" restaura a foto anterior (por card, só da última ação).
- Aviso a partir de limite − 40 (800 com membership): selo QUASE CHEIA, barra laranja, ponto na aba Odyle; cheia = barra vermelha, selo CHEIA.
- No cadastro do personagem há campos opcionais Basic/Charged; ao editar, só regrava a foto se o usuário mudou esses números.
- A tarefa diária "Odyle Energy" continua no catálogo, mas desde 28/10/2026 vem **desligada por padrão** (pedido do usuário: a aba Odyle já cuida disso).

## Ajustes da v1.2.0

- **Exploration removida** do catálogo (o usuário não quer controlar). O selo **"EXPIRA HOJE" voltou** (foi mal-entendido na 1.1.0: o pedido era tirar a Exploration).
- **Compras da semana**: nova seção separada das semanais, agrupada por loja (`category: "compras"`, campo `shop`; `isPurchase`, `groupByShop` em `catalog.ts`). Itens definidos pelo usuário:
  - Command Shop: Command: Altgard (12, servidor) — reaproveita o id `command-scrolls-pve`.
  - Substance Morph: Odyle Energy 4 (personagem, id `odyle-morph-character`) e 16 (servidor, id `odyle-morph-server`).
  - Command Shop (Abyss): Latesran Eastern Root Command, …: Veteran, …: Elite, …: Special (5 cada, servidor).
  - Wind Breeze Merchants (Special): Odyle Energy 4 (personagem) + 16 (servidor, desde 28/10/2026; antes era 20 por personagem) e Lower Abyss Rift Stone 7 (personagem).
  - Removidos: Command Scrolls PvP, Lojas: compras do personagem/servidor.
- `WeekProgress` ganhou `purchaseDone/purchaseTotal`; compras contam no % mas ficam fora de `weeklyDone/weeklyTotal`. Semana, Hoje, Histórico e o editor de tarefas mostram a seção. Tarefas próprias podem ser "Compra semanal" com nome de loja.
- **GS e CP** no personagem (`gs`, `cp`: número ou null; dados antigos viram null). Formulário aceita só dígitos; card mostra no formato do jogo (`formatGs` → 2,673; `formatCp` → 152.7K / 1.2M). Componentes `CharStats` e `StatIcon` em `components/CharStats.tsx`.
- **Ícones de GS/CP**: o app tem ícones próprios (SVG). Em Configurações → "Ícones de GS e CP" o usuário escolhe uma imagem, reduzida para PNG 64×64 e salva em `settings.icons` (data URL, só no PC dele). **Não embutir ícones do jogo no repositório** (é público e a arte é da NCSOFT).

## Ajustes da v1.1.0 (pedidos do usuário após testar a 1.0)

- **Nome no app: "Aion 2 Manager"** (cabeçalho com "Manager" em ciano, título da janela, rodapé, textos do backup, README).
  - O `productName` do instalador **continua "AION2 Task Manager"** de propósito: trocá-lo faz o NSIS instalar numa pasta nova e criar atalho duplicado. Só trocar se o usuário pedir, com instrução de desinstalar/reinstalar (os dados ficam em `%APPDATA%\com.founderha.aion2taskmanager`, que depende do `identifier`, não do nome).
- **Aba selecionada com fumaça subindo** (substituiu o arco luminoso): `.tab__smoke` com brilho na base e três volutas animadas (`smoke-rise`), bordas difusas por `mask-image` radial; respeita `prefers-reduced-motion`. Abas não mostram o retângulo de foco (o foco aparece como brilho no texto).
- **Desligadas por padrão** (ainda não existem no Global): Subjugation, Sanctuary: Corroded Decontamination Facility e Sanctuary: Chalice of Muspel. A Ludra continua ligada. Quem já ligou manualmente mantém a escolha.
- Em sessões do Claude: nunca usar `pkill -f "vite preview"` no mesmo comando que contém esse texto (mata o próprio shell). Encerrar o preview em um comando separado.

## Versão 1.0

- **5 abas, nesta ordem:** Hoje, Semana, Personagens, Histórico, Configurações. A aba Componentes foi removida.
- O app abre em **Hoje**; se não houver personagens, abre em **Personagens**.
- Faixa vermelha global se o salvamento falhar (`saveStatus === "erro"`); `ErrorBoundary` em volta de tudo.
- Contorno de foco visível (`:focus-visible`) para navegar pelo teclado.
- README reescrito para usuário final (instalar, atualizar, usar, backup) com seção para desenvolvedores.
- `npm audit`: 0 vulnerabilidades (vitest 5).
- A partir daqui, mudanças vêm de pedidos do usuário após ele testar a 1.0. Manter o mesmo fluxo: uma etapa por vez, mostrar e aprovar antes de seguir.

## Configurações do usuário (desde a v0.11.0)

- `AppData.settings` = `{ reset: { utcHour, weeklyWeekday }, tasks: { [idTarefa]: { enabled?, description? } }, customTasks: TaskDef[] }`. Vai junto no backup.
- **Catálogo final = `resolveCatalog(settings)`**: catálogo padrão + tarefas próprias, com ligar/desligar e descrição do usuário aplicados (`ResolvedTask` tem `enabled`, `custom`, `descriptionEdited`). O store expõe `catalog` e `reset`; todas as telas usam `catalog` (nunca `DEFAULT_CATALOG` direto) e `isEnabled = t.enabled`.
- Descrição editada substitui as duas variantes (com/sem membership); "Restaurar padrão" apaga o ajuste.
- Tarefas próprias têm id `custom-<uuid>`, escopo personagem/servidor e cadência diária/semanal/dias fixos (dias fixos exige ao menos um dia). Excluir uma tarefa própria apaga as marcações dela.
- Desligar uma tarefa só a esconde; as marcações antigas ficam guardadas.
- Reset: guardado em UTC; a tela mostra e recebe a hora **local do PC** (`utcHourToLocal`/`localHourToUtc`). O `useGameClock(reset)` usa a configuração. Mudar o reset reorganiza em que dia as marcações caem, por isso há aviso na tela.
- `parseSettings` é tolerante: valores inválidos voltam ao padrão; tarefas próprias sem `custom-` no id ou sem nome são ignoradas.

## Histórico (desde a v0.10.0)

- Mostra só semanas **encerradas**: da semana mais antiga com dados (primeira marcação ou cadastro de personagem) até a semana passada. Abre na semana passada.
- Usa `WeekView` com `todayIndex = 7` (semana fechada: todos os dias contam) e `readOnly` (células e cards não clicáveis).
- Resumo por personagem: progresso, diárias feitas/devidas, diárias perdidas, semanais feitas; e a média da conta.
- Personagem cadastrado depois da semana não aparece nela, a menos que tenha marcações nela (`existedInWeek`).
- O histórico é calculado com o catálogo e os papéis (main/alt) **atuais**.
- `isEnabled` fica em `components/WeekView.tsx` e é usado por Semana, Hoje e Histórico.

## Backup e aba Configurações (desde a v0.9.0)

- A aba **Catálogo** virou **Configurações**.
- Arquivo de backup: JSON com envelope `{ app, tipo: "backup", exportadoEm, versaoApp, dados }`; `dados` é igual ao `dados.json`. A importação também aceita um `dados.json` puro.
- `readBackup()` nunca lança exceção; recusa arquivo que não é JSON ou não tem `characters`. Lê com o mesmo `parseData` tolerante.
- Importar mostra a prévia (personagens, main, marcações, período, data da exportação) e pede confirmação. **Antes de substituir**, grava uma cópia dos dados atuais em `%APPDATA%\com.founderha.aion2taskmanager\copias-de-seguranca\antes-de-importar-AAAAMMDD-HHMMSS.json`; se a cópia falhar, a importação é cancelada.
- Plugin `tauri-plugin-dialog` (permissão `dialog:default`) para as janelas Salvar/Abrir. Comandos Rust novos: `write_text_file`, `read_text_file` (limite 20 MB), `snapshot_data` (nome só com letras, números e hífen).

## Aba Hoje (desde a v0.8.0)

- Um painel por personagem (main primeiro), com **Diárias de hoje** (só as que acontecem no dia) e **Semanais** da semana atual.
- Usa as mesmas chaves de marcação da aba Semana: marcar em uma reflete na outra.
- "Dia completo" quando todas as diárias do personagem estão feitas; opção "Ocultar concluídas".
- Resumo no topo: diárias que faltam hoje, semanais pendentes e contagem dos resets; alerta no último dia.
- Componente `TaskToggleRow` (linha grande com check) em `components/ui/TaskWidgets.tsx`.

## Marcações e Painel Semanal (desde a v0.7.0)

- Marcações ficam em `AppData.checks` (objeto chave → data/hora ISO em que foi marcada). Desmarcar apaga a chave.
- Formato da chave: `<dono>|<idTarefa>|d:<YYYY-MM-DD>` para diárias/ritmo/dias fixos (dia do jogo) e `<dono>|<idTarefa>|w:<YYYY-MM-DD>` para semanais (quarta da semana).
- `<dono>` = id do personagem, ou **`SERVER`** para tarefas de servidor. Assim, trocar o main não perde o que já foi feito no servidor.
- Excluir um personagem apaga as marcações dele (as de `SERVER` ficam).
- Estados da célula: `done` (dourado), `today` (ciano), `missed` (tracejado, ainda clicável), `future` (desativado, não marca), `none` (evento de dias fixos fora do dia).
- Progresso (`weekProgress`) conta só os dias **até hoje** + as semanais; dias futuros não pesam.
- Tarefas ligadas: definidas pelo usuário na aba Configurações (ver seção Configurações do usuário).
- O selo "EXPIRA HOJE" aparece nas semanais pendentes só no último dia (terça).

## Lógica de tempo (desde a v0.6.0)

- Tudo calculado em **UTC**: o "dia do jogo" é a data UTC de `agora − 7h` (`gameDayKey`), então o fuso e o horário de verão do PC não interferem. Reset configurável em `ResetConfig` (`utcHour` = 7, `weeklyWeekday` = 3 quarta).
- Chaves de dia no formato `"YYYY-MM-DD"`; a semana é identificada pela chave da sua **quarta** (`weekStartKey`). Essas chaves serão usadas para gravar as marcações.
- `useGameClock()` devolve `todayKey`, `weekKey`, `days` (7 chaves qua→ter), `todayIndex`, `nextDaily`, `nextWeekly`; atualiza a cada 15 s, então o app vira o dia sozinho se ficar aberto.
- Cabeçalho mostra contagem do reset diário e semanal; o semanal fica vermelho com menos de 24h.
- Testes: `npm test` (vitest). O workflow roda os testes antes de compilar; teste falhando impede a release.
- Para simular datas nos testes de tela, usar o relógio falso do Playwright (`page.clock.install`) com `timezone_id="America/Sao_Paulo"`.

## Personagens e salvamento (desde a v0.5.0)

- Campos: nome (até 24 caracteres, sem repetir), classe (nomes do cliente em inglês: Gladiator, Templar, Assassin, Ranger, Sorcerer, Spiritmaster, Cleric, Chanter), facção (Elyos/Asmodian), papel (MAIN/ALT), foto, GS/CP e Odyle inicial (membership saiu do personagem na v1.3.0).
- **Regra do main:** sempre exatamente um main quando há personagens. O primeiro cadastrado é main; promover outro rebaixa o atual; excluir o main promove o alt mais antigo (`ensureSingleMain`).
- Exclusão pede confirmação em dois cliques (sem diálogos nativos).
- Dados em `%APPDATA%\com.founderha.aion2taskmanager\dados.json`, escritos pelos comandos Rust `load_data`, `save_data`, `data_location` (`src-tauri/src/lib.rs`). A gravação é segura: escreve `.tmp`, guarda a versão anterior em `dados.json.bak` e troca.
- `parseData()` é tolerante (campos faltando recebem padrão). Ao mudar a estrutura, aumentar `schemaVersion` e migrar em `parseData`.
- Não foi possível rodar `cargo check` para Windows no ambiente do Claude (o `rustup target add` falha); o Rust é validado pelo build do GitHub.

## Atualização pelo próprio app (desde a v0.3.0)

- Plugins Tauri **updater** + **process**. Código em `src/updater/` (`useUpdater.ts`, `UpdateBanner.tsx`).
- Ao abrir, o app verifica em silêncio `https://github.com/FounderHA/AION2TaskManager/releases/latest/download/latest.json`. Se houver versão nova, mostra uma faixa dourada com **"Atualizar agora"**; baixa, instala (modo `passive`) e reinicia.
- Rodapé mostra a versão instalada e o link **"Verificar atualizações"**.
- **O repositório precisa ser público**: o atualizador não baixa de Releases privados.
- As atualizações são **assinadas**. A chave pública está em `tauri.conf.json` (`plugins.updater.pubkey`). A chave privada fica **só** no segredo `TAURI_SIGNING_PRIVATE_KEY` do repositório (sem senha) e numa cópia de segurança com o usuário. **Nunca commitar a chave privada.** Se ela for perdida, os apps já instalados não aceitam mais atualizações (seria preciso reinstalar manualmente uma versão com chave nova).
- `bundle.createUpdaterArtifacts: true` faz o build gerar a assinatura; o `tauri-action` publica o `latest.json` na Release.
- Sem o segredo configurado, o build **falha** (não consegue assinar).
- Versões anteriores à 0.3.0 não têm atualizador: precisam ser trocadas manualmente uma vez.

## Plano de etapas

| # | Etapa | Status |
|---|---|---|
| 1 | Mockup visual do Painel Semanal | ✅ Aprovado |
| 2 | Base do projeto + GitHub Actions (v0.1.0) | ✅ Instalador testado e funcionando |
| 3 | Sistema visual (componentes reutilizáveis + tela de amostra) | ✅ Aprovado |
| 3.1 | Atualização pelo próprio app (v0.3.0) | ✅ Testado de 0.3.0 → 0.3.1, funcionando |
| 4 | Catálogo de tarefas (dados com escopo, ciclo, regra main/alt) | ✅ Aprovado; código na v0.4.0 (aba Catálogo) |
| 5 | Lógica de tempo (semana qua 04:00 → ter 03:59, dia vira às 04:00) | ✅ v0.6.0 (contagem no cabeçalho + prévia na aba Semana) |
| 6 | Personagens (cadastro, main/alt, membership) | ✅ Adiantada a pedido do usuário; v0.5.0 (aba Personagens) |
| 7 | Painel Semanal (grade qua→ter, check por dia) | ✅ v0.7.0 |
| 8 | Visão do Dia | ✅ v0.8.0 (aba Hoje) |
| 9 | Salvamento local automático | ✅ Personagens (v0.5.0) e marcações (v0.7.0) |
| 10 | Backup (exportar/importar `.json`) | ✅ v0.9.0 (aba Configurações) |
| 11 | Histórico de semanas | ✅ v0.10.0 |
| 12 | Configurações (horário de reset, editor de tarefas, tema) | ✅ v0.11.0 (tema de facção ficou para os extras) |
| 13 | Versão 1.0 | ✅ v1.0.0 |
| 14 | Extras: timers de Rift e chefes, aviso de Odyle, notificações do Windows | ⏳ Opcional, sob pedido do usuário |

## Ideias registradas para depois

- Alerta "cubos restantes no servidor" (10/semana).
- Backup automático semanal numa pasta escolhida (ex.: Google Drive) para sincronizar PCs.
