# Aion 2 Manager

Aplicativo para Windows que organiza as tarefas diárias e semanais do **Aion 2** (versão Global) em todos os seus personagens: um **main** e quantos **alts** você quiser. Você marca o que já fez, acompanha a semana e consulta o histórico. Tudo fica salvo no seu PC, e dá para levar para outro computador com um backup.

## Instalar

1. Abra a aba **[Releases](../../releases/latest)** deste repositório.
2. Baixe o arquivo que termina em **`_x64-setup.exe`**.
3. Execute o arquivo. A instalação é só para o seu usuário e não pede senha de administrador.

> O Windows pode mostrar "O Windows protegeu o computador", porque o instalador não tem assinatura digital paga. Clique em **Mais informações → Executar assim mesmo**.

## Atualizar

O app se atualiza sozinho: ao abrir, se houver versão nova, aparece uma faixa dourada **"Nova versão disponível"**. Clique em **Atualizar agora** e ele baixa, instala e reabre. Também dá para conferir no rodapé, em **Verificar atualizações**.

## Como usar

| Aba | Para que serve |
|---|---|
| **Hoje** | O que falta hoje, de todos os personagens numa tela. É a aba para usar enquanto joga. |
| **Semana** | A semana inteira (quarta a terça) de um personagem por vez: diárias dia a dia, semanais e progresso. |
| **Personagens** | Cadastro do main e dos alts: nome, classe, facção e membership. |
| **Histórico** | Semanas encerradas, só para consulta: o que foi feito e o que ficou para trás. |
| **Configurações** | Backup, ligar/desligar tarefas, criar tarefas próprias e horário do reset. |

**Regras principais**

- O dia vira às **04:00 (Brasília)** e a semana na **quarta-feira às 04:00**, como no jogo. Jogar até 2h da manhã ainda conta como o dia anterior.
- Tarefas de **servidor** (Duty Missions, Daily Dungeon, Shugo Festival, Command Scrolls…) aparecem **só no main**. Os alts mostram só as tarefas de personagem.
- Um dia que passou sem marcar fica tracejado e ainda pode ser marcado. Dias futuros não podem ser marcados.
- Nada é apagado no reset: a semana nova começa em branco e a anterior vai para o Histórico.

**Primeiro uso**

1. Em **Personagens**, cadastre o seu main e depois os alts.
2. Em **Configurações → Tarefas**, desligue o que você não faz e ligue o que faz.
3. Use a aba **Hoje** no dia a dia.

## Backup e troca de PC

Em **Configurações → Backup**:

- **Exportar backup** salva um arquivo `.json` (abre no Bloco de Notas) com personagens, marcações e configurações.
- **Importar backup** mostra o que tem no arquivo e só substitui os dados depois que você confirmar. Antes de importar, o app guarda sozinho uma cópia dos dados atuais.

Para trocar de PC: exporte no PC antigo, copie o arquivo (pendrive, Google Drive…), instale o app no PC novo e importe.

Os dados ficam em `%APPDATA%\com.founderha.aion2taskmanager\dados.json` (o caminho exato aparece em **Configurações → Local dos dados**).

---

## Para desenvolvedores

Feito com [Tauri 2](https://tauri.app) (núcleo em Rust) + React + TypeScript + Vite. Detalhes do projeto, decisões e regras em [`CLAUDE.md`](CLAUDE.md).

```bash
npm install
npm test              # testes (vitest)
npm run tauri dev     # abre o app em modo desenvolvimento
npm run tauri build   # gera o instalador em src-tauri/target/release/bundle
```

Requer Node.js 22, Rust e Visual Studio Build Tools (C++).

**Publicar uma nova versão**

1. Atualize a versão em `package.json`, `src-tauri/tauri.conf.json` e `src-tauri/Cargo.toml`.
2. Envie as mudanças para a branch `main`.
3. Dispare o build em **Actions → Build e Release (Windows) → Run workflow**, escrevendo as novidades no campo **notas** (elas aparecem na faixa de atualização do app).
4. O GitHub Actions roda os testes, compila, assina a atualização, cria a tag `v<versão>` e publica em **Releases**.
