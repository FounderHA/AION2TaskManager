// Janelas do Windows para salvar/abrir o backup e gravação dos arquivos.
// No navegador (desenvolvimento) usa download e <input type="file">.
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const FILTERS = [{ name: "Backup do Aion 2 Manager", extensions: ["json"] }];

/** Abre "Salvar como" e grava o backup. Retorna o caminho salvo, ou null se o usuário cancelou. */
export async function saveBackupFile(contents: string, defaultName: string): Promise<string | null> {
  if (!isTauri()) {
    const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultName;
    a.click();
    URL.revokeObjectURL(url);
    return defaultName;
  }
  const path = await save({ title: "Exportar backup", defaultPath: defaultName, filters: FILTERS });
  if (!path) return null;
  await invoke("write_text_file", { path, contents });
  return path;
}

/** Abre a janela de escolher arquivo e lê o conteúdo. Retorna null se o usuário cancelou. */
export async function pickBackupFile(): Promise<{ name: string; text: string } | null> {
  if (!isTauri()) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.onchange = async () => {
        const file = input.files?.[0];
        resolve(file ? { name: file.name, text: await file.text() } : null);
      };
      input.click();
    });
  }
  const path = await open({ title: "Importar backup", multiple: false, directory: false, filters: FILTERS });
  if (!path || Array.isArray(path)) return null;
  const text = await invoke<string>("read_text_file", { path });
  return { name: path.split(/[\\/]/).pop() ?? path, text };
}

/** Guarda uma cópia dos dados atuais antes de importar. Retorna onde foi salva. */
export async function snapshotCurrent(name: string, contents: string): Promise<string> {
  if (!isTauri()) {
    try {
      localStorage.setItem(`aion2tm-${name}`, contents);
    } catch {
      /* sem armazenamento */
    }
    return `(navegador) ${name}`;
  }
  return invoke<string>("snapshot_data", { name, contents });
}
