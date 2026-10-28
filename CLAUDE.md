# CLAUDE.md — AION2 Task Manager

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

## Decisões de produto (já tomadas)

| Tema | Decisão |
|---|---|
| Plataforma | Só Windows |
| Personagens | Todos no **mesmo servidor**, com **um único main** |
| Conteúdo de servidor | Aparece **só no main**. Alts mostram só tarefas de personagem |
| Membership (Special Quai) | Por personagem (alguns têm, outros não). Com check simples, só muda os textos das tarefas (ex.: Abismo 7h → 14h) |
| Marcação | **Check simples** (feito / não feito) |
| Tarefas diárias | Um check por dia |
| Semanais com ritmo diário | Um check por dia com a meta do dia (ex.: Daily Dungeon "2 entradas" por dia → 14 na semana) |
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
- Ao mudar o catálogo padrão, aumentar `CATALOG_VERSION` (a migração dos dados salvos vai usar isso).
- Ficaram de fora de propósito: Spacetime Rifts (timers na Etapa 14), "sempre pegar o cubo" (vira alerta fixo), Season Mission (automática).
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
  screens/ComponentShowcase.tsx Tela de amostra da Etapa 3 (temporária)
  updater/                      Atualização pelo app (hook + faixa de aviso + rodapé de versão)
  data/types.ts                 Tipos: TaskDef, TaskScope, TaskCadence, Weekday, CharacterRole
  data/catalog.ts               Catálogo padrão (DEFAULT_CATALOG) + tasksForRole, describe, occursOn
  screens/CatalogSection.tsx    Seção do catálogo (dentro de Configurações): prévia Main/Alt e membership
  screens/SettingsScreen.tsx    Aba Configurações: backup (exportar/importar), local dos dados, catálogo
  screens/CharactersScreen.tsx  Aba Personagens: cadastro, edição, exclusão, Main/Alt e membership
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

## Histórico (desde a v0.10.0)

- Mostra só semanas **encerradas**: da semana mais antiga com dados (primeira marcação ou cadastro de personagem) até a semana passada. Abre na semana passada.
- Usa `WeekView` com `todayIndex = 7` (semana fechada: todos os dias contam) e `readOnly` (células e cards não clicáveis).
- Resumo por personagem: progresso, diárias feitas/devidas, diárias perdidas, semanais feitas; e a média da conta.
- Personagem cadastrado depois da semana não aparece nela, a menos que tenha marcações nela (`existedInWeek`).
- O histórico é calculado com o catálogo e os papéis (main/alt) **atuais**.
- `isEnabled` agora fica em `components/WeekView.tsx` e é usado por Semana, Hoje e Histórico (vira configuração na Etapa 12).

## Backup e aba Configurações (desde a v0.9.0)

- A aba **Catálogo** virou **Configurações** (Backup + Local dos dados + Catálogo). Ficam 5 abas finais: Semana, Hoje, Personagens, Histórico, Configurações (+ Componentes temporária).
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
- Tarefas ligadas: por enquanto `enabledByDefault` do catálogo (`isEnabled` em `WeeklyScreen.tsx`); na Etapa 12 vira configuração do usuário.
- O selo "EXPIRA HOJE" aparece nas semanais pendentes só no último dia (terça).

## Lógica de tempo (desde a v0.6.0)

- Tudo calculado em **UTC**: o "dia do jogo" é a data UTC de `agora − 7h` (`gameDayKey`), então o fuso e o horário de verão do PC não interferem. Reset configurável em `ResetConfig` (`utcHour` = 7, `weeklyWeekday` = 3 quarta).
- Chaves de dia no formato `"YYYY-MM-DD"`; a semana é identificada pela chave da sua **quarta** (`weekStartKey`). Essas chaves serão usadas para gravar as marcações.
- `useGameClock()` devolve `todayKey`, `weekKey`, `days` (7 chaves qua→ter), `todayIndex`, `nextDaily`, `nextWeekly`; atualiza a cada 15 s, então o app vira o dia sozinho se ficar aberto.
- Cabeçalho mostra contagem do reset diário e semanal; o semanal fica vermelho com menos de 24h.
- Testes: `npm test` (vitest). O workflow roda os testes antes de compilar; teste falhando impede a release.
- Para simular datas nos testes de tela, usar o relógio falso do Playwright (`page.clock.install`) com `timezone_id="America/Sao_Paulo"`.

## Personagens e salvamento (desde a v0.5.0)

- Campos: nome (até 24 caracteres, sem repetir), classe (nomes do cliente em inglês: Gladiator, Templar, Assassin, Ranger, Sorcerer, Spiritmaster, Cleric, Chanter), facção (Elyos/Asmodian), papel (MAIN/ALT) e membership.
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
| 12 | Configurações (horário de reset, editor de tarefas, tema) | ⏳ Próxima |
| 13 | Versão 1.0 | |
| 14 | Extras: timers de Rift e chefes, aviso de Odyle, notificações do Windows | |

## Ideias registradas para depois

- Tema Asmodian (carmesim + roxo) além do Elyos (dourado + azul), trocando conforme a facção do personagem.
- Animação de asas ao fechar 100% do dia.
- Alerta "cubos restantes no servidor" (10/semana).
- Backup automático semanal numa pasta escolhida (ex.: Google Drive) para sincronizar PCs.
