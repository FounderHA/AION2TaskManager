// Formato do arquivo de backup (exportar/importar).
//
// O arquivo é um JSON legível no Bloco de Notas:
// {
//   "app": "AION2 Task Manager",
//   "tipo": "backup",
//   "exportadoEm": "2026-10-27T23:30:00.000Z",
//   "versaoApp": "0.9.0",
//   "dados": { ...mesmo conteúdo do dados.json... }
// }
// Também aceita um dados.json "puro" (copiado direto da pasta do app).
import { parseData, type AppData } from "./model";

export const BACKUP_APP = "AION2 Task Manager";

export interface BackupSummary {
  exportedAt: string | null;
  appVersion: string | null;
  characters: number;
  mainName: string | null;
  checks: number;
  /** Primeiro e último dia com marcação ("YYYY-MM-DD"). */
  firstDay: string | null;
  lastDay: string | null;
}

export function makeBackup(data: AppData, appVersion: string, now = new Date()): string {
  return JSON.stringify({ app: BACKUP_APP, tipo: "backup", exportadoEm: now.toISOString(), versaoApp: appVersion || null, dados: data }, null, 2);
}

export function backupFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `AION2-backup-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

/** Nome da cópia automática feita antes de importar (só letras, números e hífens). */
export function snapshotName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `antes-de-importar-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
}

export function summarize(data: AppData, exportedAt: string | null = null, appVersion: string | null = null): BackupSummary {
  const days = Object.keys(data.checks)
    .map((k) => k.split("|")[2]?.slice(2))
    .filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  return {
    exportedAt,
    appVersion,
    characters: data.characters.length,
    mainName: data.characters.find((c) => c.role === "MAIN")?.name ?? null,
    checks: Object.keys(data.checks).length,
    firstDay: days[0] ?? null,
    lastDay: days[days.length - 1] ?? null,
  };
}

export type ReadResult = { ok: true; data: AppData; summary: BackupSummary } | { ok: false; error: string };

/** Lê o texto de um arquivo de backup e valida. Nunca lança exceção. */
export function readBackup(text: string): ReadResult {
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    return { ok: false, error: "O arquivo não é um JSON válido. Escolha um arquivo de backup do AION2 Task Manager." };
  }
  if (!obj || typeof obj !== "object") return { ok: false, error: "Arquivo vazio ou em formato desconhecido." };

  const o = obj as Record<string, unknown>;
  const isWrapper = o.tipo === "backup" && o.dados && typeof o.dados === "object";
  const raw = isWrapper ? o.dados : o;
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as Record<string, unknown>).characters)) {
    return { ok: false, error: "Este arquivo não parece ser um backup do AION2 Task Manager (não tem a lista de personagens)." };
  }
  const data = parseData(JSON.stringify(raw));
  const summary = summarize(data, isWrapper && typeof o.exportadoEm === "string" ? o.exportadoEm : null, isWrapper && typeof o.versaoApp === "string" ? o.versaoApp : null);
  return { ok: true, data, summary };
}
