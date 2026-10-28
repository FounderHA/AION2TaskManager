// Modo compacto: diminui a janela e deixa sempre por cima do jogo. No navegador só troca a tela.
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const COMPACT_SIZE = { width: 380, height: 720 };
const FULL_MIN = { width: 1100, height: 700 };
const FULL_DEFAULT = { width: 1440, height: 900 };
const SAVED_KEY = "aion2tm-janela-completa";

export async function enterCompact(onTop: boolean): Promise<void> {
  if (!isTauri()) return;
  const w = getCurrentWindow();
  try {
    // Guarda o tamanho atual para voltar depois
    const factor = await w.scaleFactor();
    const size = (await w.innerSize()).toLogical(factor);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify({ width: Math.round(size.width), height: Math.round(size.height) }));
    } catch {
      /* sem armazenamento */
    }
    if (await w.isMaximized()) await w.unmaximize();
    await w.setMinSize(new LogicalSize(320, 420));
    await w.setSize(new LogicalSize(COMPACT_SIZE.width, COMPACT_SIZE.height));
    await w.setAlwaysOnTop(onTop);
  } catch (e) {
    console.error("Modo compacto:", e);
  }
}

export async function exitCompact(): Promise<void> {
  if (!isTauri()) return;
  const w = getCurrentWindow();
  let saved = FULL_DEFAULT;
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.width >= FULL_MIN.width && s.height >= FULL_MIN.height) saved = s;
    }
  } catch {
    /* usa o padrão */
  }
  try {
    await w.setAlwaysOnTop(false);
    await w.setSize(new LogicalSize(saved.width, saved.height));
    await w.setMinSize(new LogicalSize(FULL_MIN.width, FULL_MIN.height));
  } catch (e) {
    console.error("Modo completo:", e);
  }
}

export async function setOnTop(onTop: boolean): Promise<void> {
  if (!isTauri()) return;
  try {
    await getCurrentWindow().setAlwaysOnTop(onTop);
  } catch (e) {
    console.error("Sempre no topo:", e);
  }
}
