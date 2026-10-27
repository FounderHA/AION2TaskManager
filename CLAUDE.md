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

## Catálogo inicial de tarefas (pesquisa de 27/10/2026, cliente Global)

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
src-tauri/                      Núcleo Tauri 2 (Rust), ícones, config do instalador
```

## Stack

- **Tauri 2** + **React 19** + **TypeScript** + **Vite**.
- Instalador **NSIS**, modo `currentUser` (não pede administrador), em português. ~3,3 MB.
- Identificador: `com.founderha.aion2taskmanager`.

## Build e release

- O instalador é gerado pelo workflow **"Build e Release (Windows)"** (`.github/workflows/release.yml`).
- Dispara por **push de tag `v*`** ou manualmente (**workflow_dispatch**).
- **Em sessões do Claude, push de tag é bloqueado (HTTP 403).** Use: `gh workflow run release.yml -R FounderHA/aion2taskmanager --ref main`. O `tauri-action` cria sozinho a tag `v<versão>` e a Release a partir da versão do `tauri.conf.json`.
- Antes de cada release, atualizar a versão em **3 lugares**: `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`. A mesma versão não pode ser publicada duas vezes.
- Em sessões do Claude, o GraphQL do GitHub é bloqueado: use `gh api repos/FounderHA/aion2taskmanager/...` (REST) em vez de `gh release view`.
- Primeiro build leva ~10–15 min (compila Rust do zero); depois há cache.
- Validar o frontend localmente com `npm run build` (faz o type-check).
- O Windows mostra "O Windows protegeu o computador" (sem assinatura digital): **Mais informações → Executar assim mesmo**.

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
| 3 | Sistema visual (componentes reutilizáveis + tela de amostra) | ✅ Entregue na v0.2.0, aguardando validação |
| 3.1 | Atualização pelo próprio app (v0.3.0) | ✅ Implementado; depende do repositório público e do segredo de assinatura |
| 4 | Catálogo de tarefas (dados com escopo, ciclo, regra main/alt) | ⏳ Próxima |
| 5 | Lógica de tempo (semana qua 04:00 → ter 03:59, dia vira às 04:00) | |
| 6 | Personagens (cadastro, main/alt, membership) | |
| 7 | Painel Semanal (grade qua→ter, check por dia) | |
| 8 | Visão do Dia | |
| 9 | Salvamento local automático | |
| 10 | Backup (exportar/importar `.json`) | |
| 11 | Histórico de semanas | |
| 12 | Configurações (horário de reset, editor de tarefas, tema) | |
| 13 | Versão 1.0 | |
| 14 | Extras: timers de Rift e chefes, aviso de Odyle, notificações do Windows | |

## Ideias registradas para depois

- Tema Asmodian (carmesim + roxo) além do Elyos (dourado + azul), trocando conforme a facção do personagem.
- Animação de asas ao fechar 100% do dia.
- Alerta "cubos restantes no servidor" (10/semana).
- Backup automático semanal numa pasta escolhida (ex.: Google Drive) para sincronizar PCs.
