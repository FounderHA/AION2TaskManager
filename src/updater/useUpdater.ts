// Atualização pelo próprio app (plugin updater do Tauri).
// O app consulta o latest.json da última Release do GitHub, baixa o instalador
// assinado e reinicia já na versão nova.
import { useCallback, useEffect, useRef, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdaterState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "uptodate" }
  | { kind: "available"; version: string; notes?: string }
  | { kind: "downloading"; version: string; percent: number | null }
  | { kind: "installing"; version: string }
  | { kind: "error"; message: string };

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({ kind: "idle" });
  const [currentVersion, setCurrentVersion] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);
  const updateRef = useRef<Update | null>(null);

  const checkNow = useCallback(async (silent = false) => {
    if (!isTauri()) return; // rodando no navegador (desenvolvimento)
    setState({ kind: "checking" });
    try {
      const update = await check();
      if (update) {
        updateRef.current = update;
        setDismissed(false);
        setState({ kind: "available", version: update.version, notes: update.body ?? undefined });
      } else {
        setState(silent ? { kind: "idle" } : { kind: "uptodate" });
      }
    } catch (e) {
      setState(silent ? { kind: "idle" } : { kind: "error", message: "Não foi possível verificar atualizações. Confira sua internet." });
      console.error("Falha ao verificar atualização:", e);
    }
  }, []);

  const install = useCallback(async () => {
    const update = updateRef.current;
    if (!update) return;
    let total = 0;
    let received = 0;
    setState({ kind: "downloading", version: update.version, percent: null });
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength ?? 0;
        } else if (event.event === "Progress") {
          received += event.data.chunkLength;
          setState({ kind: "downloading", version: update.version, percent: total ? Math.round((received / total) * 100) : null });
        } else if (event.event === "Finished") {
          setState({ kind: "installing", version: update.version });
        }
      });
      // No Windows o instalador fecha o app sozinho; nos demais casos reiniciamos aqui.
      await relaunch();
    } catch (e) {
      console.error("Falha ao instalar atualização:", e);
      setState({ kind: "error", message: "A atualização falhou. Tente de novo ou baixe o instalador em Releases no GitHub." });
    }
  }, []);

  // Ao abrir o app: lê a versão atual e verifica atualização em silêncio
  useEffect(() => {
    if (!isTauri()) return;
    getVersion().then(setCurrentVersion).catch(() => {});
    const t = setTimeout(() => checkNow(true), 1500);
    return () => clearTimeout(t);
  }, [checkNow]);

  return { state, currentVersion, checkNow: () => checkNow(false), install, dismissed, dismiss: () => setDismissed(true) };
}
