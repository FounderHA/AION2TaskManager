# AION2 Task Manager

Aplicativo para Windows que organiza as tarefas diárias e semanais do **Aion 2** em todos os seus personagens (main e alts), com marcação manual, histórico por semana e backup em arquivo de texto.

## Instalar

1. Abra a aba **[Releases](../../releases)** deste repositório.
2. Baixe o arquivo que termina em **`_x64-setup.exe`**.
3. Execute o arquivo. A instalação é só para o seu usuário e não pede senha de administrador.

> O Windows pode mostrar o aviso "O Windows protegeu o computador", porque o instalador não tem assinatura digital paga. Clique em **Mais informações → Executar assim mesmo**.

## Tecnologia

- [Tauri 2](https://tauri.app) (núcleo em Rust, instalador pequeno)
- React + TypeScript + Vite (interface)

## Desenvolvimento local (opcional)

Requer Node.js 22, Rust e Visual Studio Build Tools (C++).

```bash
npm install
npm run tauri dev     # abre o app em modo desenvolvimento
npm run tauri build   # gera o instalador em src-tauri/target/release/bundle
```

## Publicar uma nova versão

1. Atualize a versão em `package.json`, `src-tauri/tauri.conf.json` e `src-tauri/Cargo.toml`.
2. Envie as mudanças para a branch `main`.
3. Dispare o build em **Actions → Build e Release (Windows) → Run workflow** (ou envie uma tag `v*`).
4. O GitHub Actions compila, cria a tag `v<versão>` e publica o instalador em **Releases**.
