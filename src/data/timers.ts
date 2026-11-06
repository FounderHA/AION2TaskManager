// Horários de eventos e chefes do Aion 2 (servidores Global).
// Os servidores Global (NA, EU, América do Sul, JP) usam um relógio único em GMT+9:
// o reset diário de 16:00 do servidor é 07:00 UTC = 04:00 em Brasília.
// Fontes (06/11/2026): allthings.how (event schedule, world boss timers) e aion2hub.com (world bosses).
// Os horários mudam com patches; o usuário pode ligar/desligar cada um.

export const SERVER_UTC_OFFSET = 9;

export type TimerCategory = "boss-abismo" | "boss-campo" | "evento";

export const TIMER_CATEGORIES: { id: TimerCategory; label: string; color: string }[] = [
  { id: "boss-abismo", label: "Chefe do Abismo", color: "#ff7a45" },
  { id: "boss-campo", label: "Chefe de campo", color: "#ffc93c" },
  { id: "evento", label: "Evento", color: "#4fc3ff" },
];
export const categoryInfo = (c: TimerCategory) => TIMER_CATEGORIES.find((x) => x.id === c) ?? TIMER_CATEGORIES[0];

/** Horário no relógio do servidor (GMT+9) com duração em minutos. */
export interface ServerTime {
  h: number;
  m: number;
  dur: number;
}

export type TimerSchedule =
  /** Dias da semana do servidor (0 = domingo) em horários fixos. */
  | { type: "weekly"; days: number[]; times: ServerTime[] }
  /** A cada N minutos, a partir de um minuto do dia do servidor. */
  | { type: "every"; everyMin: number; offsetMin: number; dur: number }
  /** Renasce N horas depois de morto (o usuário marca quando matou). */
  | { type: "respawn"; hours: number };

export interface TimerDef {
  id: string;
  name: string;
  place?: string;
  category: TimerCategory;
  schedule: TimerSchedule;
  enabledByDefault: boolean;
  note?: string;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export const TIMER_CATALOG: TimerDef[] = [
  {
    id: "watcher-kaira",
    name: "Watcher Kaira",
    place: "Chaotic Lower Reshanta",
    category: "boss-abismo",
    schedule: { type: "every", everyMin: 180, offsetMin: 60, dur: 30 },
    enabledByDefault: true,
    note: "A cada 3h. Anda pelo mapa: Siel's Wings, Black Fragments, Devastated Remnants, Sulfur Tree Island.",
  },
  {
    id: "executors",
    name: "Executors Argo, Kaira e Tamasa",
    place: "Chaotic Lower Reshanta",
    category: "boss-abismo",
    schedule: { type: "weekly", days: [1, 4, 6], times: [{ h: 21, m: 30, dur: 30 }] },
    enabledByDefault: true,
    note: "Segunda, quinta e sábado. Chefes do cerco (nível 65).",
  },
  {
    id: "nahma",
    name: "Guardian Lord Nahma",
    place: "Reshanta (Abyss Siege Boss)",
    category: "boss-abismo",
    schedule: { type: "weekly", days: [0, 5], times: [{ h: 21, m: 0, dur: 30 }] },
    enabledByDefault: true,
    note: "Sexta e domingo.",
  },
  {
    id: "middle-reshanta-bosses",
    name: "Dramos, Marakha e Ducal",
    place: "Chaotic Middle Reshanta",
    category: "boss-abismo",
    schedule: { type: "weekly", days: [1, 4, 6], times: [{ h: 21, m: 30, dur: 30 }] },
    enabledByDefault: false,
    note: "Nível 80. As fontes divergem se já existem no Global.",
  },
  {
    id: "artifact-siege",
    name: "Artifact Siege",
    place: "Reshanta",
    category: "evento",
    schedule: { type: "weekly", days: [1, 4, 6], times: [{ h: 21, m: 0, dur: 30 }] },
    enabledByDefault: true,
    note: "Segunda, quinta e sábado. A disputa no chão começa antes da contagem.",
  },
  {
    id: "spacetime-rift",
    name: "Spacetime Rift",
    category: "evento",
    schedule: { type: "every", everyMin: 180, offsetMin: 0, dur: 10 },
    enabledByDefault: true,
    note: "A cada 3h. O portal fica aberto 10 min.",
  },
  {
    id: "arena-tactics",
    name: "Arena of Tactics (10v10)",
    category: "evento",
    schedule: {
      type: "weekly",
      days: ALL_DAYS,
      times: [
        { h: 11, m: 0, dur: 180 },
        { h: 19, m: 0, dur: 120 },
      ],
    },
    enabledByDefault: true,
    note: "Todo dia, duas janelas.",
  },
  {
    id: "shugo-festival",
    name: "Shugo Festival",
    category: "evento",
    schedule: { type: "every", everyMin: 60, offsetMin: 0, dur: 3 },
    enabledByDefault: false,
    note: "Toda hora cheia (3 min para entrar).",
  },
  {
    id: "dimensional-invasion",
    name: "Dimensional Invasion",
    category: "evento",
    schedule: { type: "every", everyMin: 60, offsetMin: 30, dur: 3 },
    enabledByDefault: false,
    note: "Toda hora e meia (3 min para entrar).",
  },
  { id: "melted-danar", name: "Melted Danar", place: "Verteron / Altgard", category: "boss-campo", schedule: { type: "respawn", hours: 1 }, enabledByDefault: true },
  { id: "silent-dartan", name: "Silent Dartan", place: "Verteron / Altgard", category: "boss-campo", schedule: { type: "respawn", hours: 6 }, enabledByDefault: true },
  { id: "soul-ruler-kashapa", name: "Soul Ruler Kashapa", place: "Verteron / Altgard", category: "boss-campo", schedule: { type: "respawn", hours: 6 }, enabledByDefault: true },
  { id: "high-commander-lagta", name: "High Commander Lagta", place: "Verteron / Altgard", category: "boss-campo", schedule: { type: "respawn", hours: 12 }, enabledByDefault: true },
  { id: "immortal-gartua", name: "Immortal Gartua", category: "boss-campo", schedule: { type: "respawn", hours: 12 }, enabledByDefault: true },
];

export interface TimerSettings {
  /** Ligado/desligado escolhido pelo usuário (sem entrada = padrão do catálogo). */
  enabled: Record<string, boolean>;
  /** Quando o usuário matou cada chefe de respawn (ISO). */
  kills: Record<string, string>;
}

export const defaultTimerSettings = (): TimerSettings => ({ enabled: {}, kills: {} });

export function parseTimerSettings(raw: unknown): TimerSettings {
  const s = defaultTimerSettings();
  if (!raw || typeof raw !== "object") return s;
  const o = raw as Record<string, unknown>;
  if (o.enabled && typeof o.enabled === "object") {
    for (const [k, v] of Object.entries(o.enabled as Record<string, unknown>)) if (typeof v === "boolean") s.enabled[k] = v;
  }
  if (o.kills && typeof o.kills === "object") {
    for (const [k, v] of Object.entries(o.kills as Record<string, unknown>)) if (typeof v === "string" && !Number.isNaN(Date.parse(v))) s.kills[k] = v;
  }
  return s;
}

export const isTimerEnabled = (def: TimerDef, s: TimerSettings) => s.enabled[def.id] ?? def.enabledByDefault;

/** Estado de um timer agora. */
export type TimerState =
  /** Acontecendo: começou e ainda não terminou. */
  | { kind: "live"; start: number; end: number }
  /** Próximo horário. `prev` = início anterior (para a barra). */
  | { kind: "next"; start: number; prev: number | null }
  /** Chefe de respawn que já deve ter renascido (desde `start`). */
  | { kind: "spawned"; start: number }
  /** Chefe de respawn sem horário marcado. */
  | { kind: "unknown" };

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Instante (UTC ms) de um horário do servidor num dia do servidor. */
function serverInstant(serverDayStartUtc: number, t: { h: number; m: number }) {
  return serverDayStartUtc + (t.h * 60 + t.m) * MIN;
}

/** Inícios (com fim) em volta de agora, em ordem. */
function occurrences(s: Exclude<TimerSchedule, { type: "respawn" }>, now: number): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  const offset = SERVER_UTC_OFFSET * HOUR;
  // Início do dia do servidor (00:00 GMT+9) que contém agora, em UTC
  const today = Math.floor((now + offset) / DAY) * DAY - offset;
  if (s.type === "weekly") {
    for (let d = -2; d <= 8; d++) {
      const dayStart = today + d * DAY;
      const weekday = new Date(dayStart + offset).getUTCDay();
      if (!s.days.includes(weekday)) continue;
      for (const t of s.times) {
        const start = serverInstant(dayStart, t);
        out.push({ start, end: start + t.dur * MIN });
      }
    }
  } else {
    const period = s.everyMin * MIN;
    const base = today + s.offsetMin * MIN;
    const k = Math.floor((now - base) / period);
    for (let i = k - 1; i <= k + 2; i++) {
      const start = base + i * period;
      out.push({ start, end: start + s.dur * MIN });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

export function timerState(def: TimerDef, now: number, kills: Record<string, string>): TimerState {
  const s = def.schedule;
  if (s.type === "respawn") {
    const k = kills[def.id];
    if (!k) return { kind: "unknown" };
    const start = Date.parse(k) + s.hours * HOUR;
    return start <= now ? { kind: "spawned", start } : { kind: "next", start, prev: Date.parse(k) };
  }
  const occ = occurrences(s, now);
  const live = occ.find((o) => o.start <= now && now < o.end);
  if (live) return { kind: "live", start: live.start, end: live.end };
  const i = occ.findIndex((o) => o.start > now);
  return { kind: "next", start: occ[i].start, prev: i > 0 ? occ[i - 1].start : null };
}

/** Ordem da lista: acontecendo (termina antes primeiro), renascidos, depois o próximo a começar. Sem horário vai pro fim. */
export function sortKey(st: TimerState): [number, number] {
  switch (st.kind) {
    case "live":
      return [0, st.end];
    case "spawned":
      return [1, -st.start];
    case "next":
      return [2, st.start];
    default:
      return [3, 0];
  }
}

/** Fração da barra (0 a 1) que já passou rumo ao próximo início; janela máxima de 24h. */
export function barFraction(st: TimerState, now: number): number {
  if (st.kind === "live") return Math.min(1, Math.max(0, (now - st.start) / (st.end - st.start)));
  if (st.kind !== "next") return st.kind === "spawned" ? 1 : 0;
  const total = Math.min(DAY, st.prev ? st.start - st.prev : DAY);
  const left = st.start - now;
  return Math.min(1, Math.max(0, 1 - left / total));
}

/** Contagem curta: 1d 4h · 3h 05m · 12:09 (min:seg abaixo de 1h). */
export function formatTimerCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Horário no relógio do PC: "hoje 09:30", "amanhã 01:00", "sex 09:00". */
export function localWhen(ms: number, now: number): string {
  const d = new Date(ms);
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const day0 = new Date(now);
  day0.setHours(0, 0, 0, 0);
  const diff = Math.floor((new Date(d).setHours(0, 0, 0, 0) - day0.getTime()) / DAY + 0.5);
  if (diff === 0) return `hoje ${hm}`;
  if (diff === 1) return `amanhã ${hm}`;
  if (diff === -1) return `ontem ${hm}`;
  return `${WEEKDAYS[d.getDay()]} ${hm}`;
}

/** Texto do horário fixo no relógio do PC (para a lista de configuração). */
export function describeSchedule(s: TimerSchedule): string {
  const toLocal = (h: number, m: number) => {
    const d = new Date(Date.UTC(2026, 0, 4, h - SERVER_UTC_OFFSET, m));
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  if (s.type === "respawn") return `Renasce ${s.hours}h depois de morto`;
  if (s.type === "every") {
    const first = toLocal(Math.floor(s.offsetMin / 60), s.offsetMin % 60);
    return s.everyMin === 60 ? (s.offsetMin % 60 ? `Toda hora, aos ${s.offsetMin % 60} min` : "Toda hora cheia") : `A cada ${s.everyMin / 60}h (${first}, …)`;
  }
  // Dias no fuso do PC (o dia pode mudar ao converter)
  const parts = s.times.map((t) => {
    const days = s.days.map((wd) => {
      // 4/1/2026 foi domingo: wd dias depois, no horário do servidor
      const d = new Date(Date.UTC(2026, 0, 4 + wd, t.h - SERVER_UTC_OFFSET, t.m));
      return d.getDay();
    });
    const dayTxt = days.length === 7 ? "todo dia" : [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((x) => WEEKDAYS[x]).join(", ");
    return `${dayTxt} ${toLocal(t.h, t.m)}`;
  });
  return parts.join(" · ");
}
