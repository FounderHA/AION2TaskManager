// Leitura e gravação do arquivo de dados.
// No app instalado usa os comandos Rust (dados.json na pasta do app);
// no navegador (desenvolvimento) usa o localStorage como substituto.
import { invoke } from "@tauri-apps/api/core";

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const DEV_KEY = "aion2tm-dados";

export async function loadRaw(): Promise<string | null> {
  if (!isTauri()) {
    try {
      return localStorage.getItem(DEV_KEY);
    } catch {
      return null;
    }
  }
  return (await invoke<string | null>("load_data")) ?? null;
}

export async function saveRaw(contents: string): Promise<void> {
  if (!isTauri()) {
    try {
      localStorage.setItem(DEV_KEY, contents);
    } catch {
      /* sem armazenamento disponível */
    }
    return;
  }
  await invoke("save_data", { contents });
}

export async function dataLocation(): Promise<string> {
  if (!isTauri()) return "(navegador — modo desenvolvimento)";
  return invoke<string>("data_location");
}
