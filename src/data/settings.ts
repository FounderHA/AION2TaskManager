// Configurações do usuário: horário do reset, ajustes nas tarefas do catálogo
// e tarefas criadas pelo próprio usuário.
import { DEFAULT_CATALOG } from "./catalog";
import type { TaskCadence, TaskCategory, TaskDef, TaskScope, Weekday } from "./types";
import { DEFAULT_RESET, type ResetConfig } from "../time/gameTime";

/** Ajuste do usuário numa tarefa (do catálogo ou própria). */
export interface TaskOverride {
  enabled?: boolean;
  /** Descrição personalizada (substitui as duas descrições padrão). */
  description?: string;
}

/** Imagens escolhidas pelo usuário para os ícones de GS e CP (data URL, só no PC dele). */
export interface StatIcons {
  gs?: string;
  cp?: string;
}

/** Números da Odyle Energy (editáveis caso o jogo mude). */
export interface OdyleConfig {
  capMember: number;
  rateMember: number;
  capFree: number;
  rateFree: number;
}

export const DEFAULT_ODYLE: OdyleConfig = { capMember: 840, rateMember: 15, capFree: 560, rateFree: 10 };

export type ThemeChoice = "auto" | "elyos" | "asmodian";

export interface Settings {
  reset: ResetConfig;
  /** Membership é da conta (vale para todos os personagens). */
  membership: boolean;
  /** Tema visual: automático (facção do main), Elyos ou Asmodian. */
  theme: ThemeChoice;
  odyle: OdyleConfig;
  icons: StatIcons;
  tasks: Record<string, TaskOverride>;
  customTasks: TaskDef[];
}

/** Tarefa pronta para as telas: já com os ajustes do usuário aplicados. */
export type ResolvedTask = TaskDef & { enabled: boolean; custom: boolean; descriptionEdited: boolean };

export const CUSTOM_PREFIX = "custom-";
export const TASK_NAME_MAX = 40;
export const TASK_DESC_MAX = 120;

export function defaultSettings(): Settings {
  return { reset: { ...DEFAULT_RESET }, membership: false, theme: "auto", odyle: { ...DEFAULT_ODYLE }, icons: {}, tasks: {}, customTasks: [] };
}

const SCOPES: TaskScope[] = ["personagem", "servidor"];
const CADENCES: TaskCadence[] = ["diaria", "ritmo", "semanal", "dias-fixos"];
const CATEGORIES: TaskCategory[] = ["missoes", "dungeons", "raids", "abismo-pvp", "lojas", "eventos", "compras"];

/** Lê as configurações salvas com tolerância (valores inválidos voltam ao padrão). */
export function parseSettings(raw: unknown, legacy: { membership?: boolean } = {}): Settings {
  const s = defaultSettings();
  if (legacy.membership) s.membership = true;
  if (!raw || typeof raw !== "object") return s;
  const o = raw as Record<string, unknown>;

  if (typeof o.membership === "boolean") s.membership = o.membership;
  if (o.theme === "elyos" || o.theme === "asmodian" || o.theme === "auto") s.theme = o.theme;
  const od = o.odyle as Record<string, unknown> | undefined;
  for (const k of ["capMember", "rateMember", "capFree", "rateFree"] as const) {
    const v = od?.[k];
    if (typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 100_000) s.odyle[k] = v;
  }

  const r = o.reset as Record<string, unknown> | undefined;
  if (r && Number.isInteger(r.utcHour) && (r.utcHour as number) >= 0 && (r.utcHour as number) <= 23) s.reset.utcHour = r.utcHour as number;
  if (r && Number.isInteger(r.weeklyWeekday) && (r.weeklyWeekday as number) >= 0 && (r.weeklyWeekday as number) <= 6) s.reset.weeklyWeekday = r.weeklyWeekday as Weekday;

  const icons = o.icons as Record<string, unknown> | undefined;
  for (const k of ["gs", "cp"] as const) {
    const v = icons?.[k];
    if (typeof v === "string" && v.startsWith("data:image/") && v.length < 300_000) s.icons[k] = v;
  }

  if (o.tasks && typeof o.tasks === "object") {
    for (const [id, v] of Object.entries(o.tasks as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const ov = v as Record<string, unknown>;
      const clean: TaskOverride = {};
      if (typeof ov.enabled === "boolean") clean.enabled = ov.enabled;
      if (typeof ov.description === "string") clean.description = ov.description.slice(0, TASK_DESC_MAX);
      if (Object.keys(clean).length) s.tasks[id] = clean;
    }
  }

  if (Array.isArray(o.customTasks)) {
    for (const v of o.customTasks) {
      if (!v || typeof v !== "object") continue;
      const t = v as Record<string, unknown>;
      if (typeof t.id !== "string" || !t.id.startsWith(CUSTOM_PREFIX) || typeof t.name !== "string" || !t.name.trim()) continue;
      const cadence = CADENCES.includes(t.cadence as TaskCadence) ? (t.cadence as TaskCadence) : "diaria";
      const days = Array.isArray(t.days) ? (t.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) as Weekday[]) : undefined;
      s.customTasks.push({
        id: t.id,
        name: t.name.slice(0, TASK_NAME_MAX),
        description: typeof t.description === "string" ? t.description.slice(0, TASK_DESC_MAX) : "",
        scope: SCOPES.includes(t.scope as TaskScope) ? (t.scope as TaskScope) : "personagem",
        cadence: cadence === "dias-fixos" && !days?.length ? "diaria" : cadence,
        category: CATEGORIES.includes(t.category as TaskCategory) ? (t.category as TaskCategory) : "eventos",
        days: cadence === "dias-fixos" ? days : undefined,
        shop: typeof t.shop === "string" && t.shop.trim() ? t.shop.slice(0, TASK_NAME_MAX) : undefined,
        time: typeof t.time === "string" ? t.time.slice(0, 40) : undefined,
        enabledByDefault: true,
      });
    }
  }
  return s;
}

/** Catálogo final: padrão + tarefas próprias, com ligar/desligar e descrições do usuário. */
export function resolveCatalog(settings: Settings): ResolvedTask[] {
  const all = [...DEFAULT_CATALOG.map((t) => ({ t, custom: false })), ...settings.customTasks.map((t) => ({ t, custom: true }))];
  return all.map(({ t, custom }) => {
    const ov = settings.tasks[t.id] ?? {};
    const edited = ov.description !== undefined;
    return {
      ...t,
      description: edited ? ov.description! : t.description,
      descriptionMember: edited ? undefined : t.descriptionMember,
      enabled: ov.enabled ?? t.enabledByDefault,
      custom,
      descriptionEdited: edited,
    };
  });
}

/* ---------- Horário do reset na hora local do PC ---------- */

/** Converte a hora UTC do reset para a hora local do computador (0–23). */
export function utcHourToLocal(utcHour: number, now = new Date()): number {
  const offsetH = -now.getTimezoneOffset() / 60; // Brasília = -3
  return (((utcHour + offsetH) % 24) + 24) % 24;
}

/** Converte a hora local escolhida pelo usuário para UTC (0–23). */
export function localHourToUtc(localHour: number, now = new Date()): number {
  const offsetH = -now.getTimezoneOffset() / 60;
  return (((localHour - offsetH) % 24) + 24) % 24;
}
