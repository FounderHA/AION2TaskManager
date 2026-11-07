// Horários de eventos e chefes do Aion 2 (servidores Global).
// Cada região Global segue o RELÓGIO LOCAL dela (América do Sul = horário de São Paulo, sem horário de verão;
// NA East = Nova York; NA West = Los Angeles; Europa = Berlim; Ásia = Seul). Ex.: o Artifact Siege é 21:00
// no relógio de cada região. Só os resets são o mesmo instante em todas (07:00 UTC = 04:00 em Brasília).
// Fontes (07/11/2026): shugo.gg/timers (tabela da América do Sul), daevaguides.com, aion2rifttimer.com, metabot.gg.
// A NCSOFT não publica os horários do Global: são da comunidade e mudam com patches.

export type ServerRegion = "sa" | "na-east" | "na-west" | "eu" | "asia";

export const SERVER_REGIONS: { id: ServerRegion; label: string; tz: string }[] = [
  { id: "sa", label: "América do Sul (horário de São Paulo)", tz: "America/Sao_Paulo" },
  { id: "na-east", label: "NA East (horário de Nova York)", tz: "America/New_York" },
  { id: "na-west", label: "NA West (horário de Los Angeles)", tz: "America/Los_Angeles" },
  { id: "eu", label: "Europa (horário de Berlim)", tz: "Europe/Berlin" },
  { id: "asia", label: "Ásia (horário de Seul)", tz: "Asia/Seoul" },
];
export const regionInfo = (r: ServerRegion) => SERVER_REGIONS.find((x) => x.id === r) ?? SERVER_REGIONS[0];

export type TimerCategory = "boss-abismo" | "boss-campo" | "evento";

export const TIMER_CATEGORIES: { id: TimerCategory; label: string; color: string }[] = [
  { id: "boss-abismo", label: "Chefe do Abismo", color: "#ff7a45" },
  { id: "boss-campo", label: "Chefe de campo", color: "#ffc93c" },
  { id: "evento", label: "Evento", color: "#4fc3ff" },
];
export const categoryInfo = (c: TimerCategory) => TIMER_CATEGORIES.find((x) => x.id === c) ?? TIMER_CATEGORIES[0];

/** Horário no relógio da região do servidor, com duração em minutos. */
export interface ServerTime {
  h: number;
  m: number;
  dur: number;
}

export type TimerSchedule =
  /** Dias da semana (relógio da região; 0 = domingo) em horários fixos. */
  | { type: "weekly"; days: number[]; times: ServerTime[] }
  /** A cada N minutos, a partir de um minuto do dia (relógio da região). */
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
    note: "A cada 3h (01:00, 04:00 … 22:00). Aparece num ponto aleatório e vai embora em 30 min.",
  },
  {
    id: "argo-spirit-king",
    name: "Argo, the Spirit King",
    place: "Chaotic Lower Reshanta",
    category: "boss-abismo",
    schedule: { type: "weekly", days: ALL_DAYS, times: [{ h: 10, m: 30, dur: 30 }, { h: 22, m: 30, dur: 30 }] },
    enabledByDefault: true,
    note: "Todo dia, 10:30 e 22:30.",
  },
  {
    id: "executors",
    name: "Executors Argo, Kaira e Tamasa",
    place: "Chaotic Lower Reshanta",
    category: "boss-abismo",
    schedule: { type: "weekly", days: [4, 6], times: [{ h: 21, m: 30, dur: 30 }] },
    enabledByDefault: true,
    note: "Quinta e sábado, 30 min depois do cerco (grupos 21:30, 21:35 e 21:40).",
  },
  {
    id: "nahma",
    name: "Guardian Lord Nahma",
    place: "Lower e Middle Reshanta",
    category: "boss-abismo",
    schedule: { type: "weekly", days: [0, 5], times: [{ h: 21, m: 0, dur: 30 }] },
    enabledByDefault: true,
    note: "Sexta e domingo (grupos 21:00, 21:05 e 21:10).",
  },
  {
    id: "middle-reshanta-bosses",
    name: "Dramos, Marakha e Ducal",
    place: "Chaotic Middle Reshanta",
    category: "boss-abismo",
    schedule: { type: "weekly", days: [4, 6], times: [{ h: 21, m: 30, dur: 30 }] },
    enabledByDefault: false,
    note: "Junto com os Executors. Nível 80.",
  },
  {
    id: "artifact-siege",
    name: "Artifact Siege",
    place: "Chaotic Lower Reshanta",
    category: "evento",
    schedule: { type: "weekly", days: [4, 6], times: [{ h: 21, m: 0, dur: 30 }] },
    enabledByDefault: true,
    note: "Quinta e sábado desde 04/11 (antes era também segunda). Grupos 21:00, 21:05 e 21:10.",
  },
  {
    id: "spacetime-rift",
    name: "Spacetime Rift",
    category: "evento",
    schedule: { type: "every", everyMin: 180, offsetMin: 120, dur: 10 },
    enabledByDefault: true,
    note: "A cada 3h (02:00, 05:00 … 23:00). O portal fica aberto nos primeiros 10 min.",
  },
  {
    id: "arena-tactics",
    name: "Arena of Tactics (Battlefield)",
    category: "evento",
    schedule: {
      type: "weekly",
      days: ALL_DAYS,
      times: [
        { h: 11, m: 0, dur: 120 },
        { h: 19, m: 0, dur: 120 },
      ],
    },
    enabledByDefault: true,
    note: "Todo dia, 11:00 e 19:00 (2h cada).",
  },
  {
    id: "shugo-festival",
    name: "Shugo Festival",
    category: "evento",
    schedule: { type: "every", everyMin: 60, offsetMin: 0, dur: 10 },
    enabledByDefault: false,
    note: "Toda hora cheia (10 min). Gasta uma chave.",
  },
  {
    id: "dimensional-invasion",
    name: "Dimensional Invasion",
    category: "evento",
    schedule: { type: "every", everyMin: 60, offsetMin: 30, dur: 15 },
    enabledByDefault: false,
    note: "Toda hora e meia (entre pelo aviso em até 3 min).",
  },
  { id: "melted-danar", name: "Melted Danar", place: "Altgard", category: "boss-campo", schedule: { type: "respawn", hours: 1 }, enabledByDefault: true },
  { id: "silent-dartan", name: "Silent Dartan", place: "Verteron", category: "boss-campo", schedule: { type: "respawn", hours: 6 }, enabledByDefault: true },
  { id: "soul-ruler-kashapa", name: "Soul Ruler Kashapa", place: "Verteron", category: "boss-campo", schedule: { type: "respawn", hours: 6 }, enabledByDefault: true },
  { id: "high-commander-lagta", name: "High Commander Lagta", place: "Verteron", category: "boss-campo", schedule: { type: "respawn", hours: 12 }, enabledByDefault: true },
  { id: "immortal-gartua", name: "Immortal Gartua", place: "Altgard", category: "boss-campo", schedule: { type: "respawn", hours: 12 }, enabledByDefault: true },
];

export interface TimerAlerts {
  /** Avisos ligados (chave geral). */
  on: boolean;
  /** Quantos minutos antes avisar (0 = na hora). */
  lead: number;
  /** Volume do som (0 a 100). */
  volume: number;
  /** Também mostrar a notificação do Windows. */
  system: boolean;
  /** Aviso por evento (sem entrada = ligado). */
  events: Record<string, boolean>;
}

export const ALERT_LEADS = [0, 1, 3, 5, 10, 15, 30];

export interface TimerSettings {
  /** Região do servidor (define o relógio dos horários). */
  region: ServerRegion;
  /** Avisos (pop-up + som) antes de cada evento. */
  alerts: TimerAlerts;
  /** Ligado/desligado escolhido pelo usuário (sem entrada = padrão do catálogo). */
  enabled: Record<string, boolean>;
  /** Quando o usuário matou cada chefe de respawn (ISO). */
  kills: Record<string, string>;
}

export const defaultAlerts = (): TimerAlerts => ({ on: true, lead: 5, volume: 70, system: true, events: {} });
export const defaultTimerSettings = (): TimerSettings => ({ region: "sa", alerts: defaultAlerts(), enabled: {}, kills: {} });

export function parseTimerSettings(raw: unknown): TimerSettings {
  const s = defaultTimerSettings();
  if (!raw || typeof raw !== "object") return s;
  const o = raw as Record<string, unknown>;
  if (SERVER_REGIONS.some((r) => r.id === o.region)) s.region = o.region as ServerRegion;
  const al = o.alerts as Record<string, unknown> | undefined;
  if (al && typeof al === "object") {
    if (typeof al.on === "boolean") s.alerts.on = al.on;
    if (typeof al.system === "boolean") s.alerts.system = al.system;
    if (typeof al.lead === "number" && ALERT_LEADS.includes(al.lead)) s.alerts.lead = al.lead;
    if (typeof al.volume === "number" && al.volume >= 0 && al.volume <= 100) s.alerts.volume = Math.round(al.volume);
    if (al.events && typeof al.events === "object") {
      for (const [k, v] of Object.entries(al.events as Record<string, unknown>)) if (typeof v === "boolean") s.alerts.events[k] = v;
    }
  }
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

/** Partes da data/hora num fuso (IANA). */
function zonedParts(ms: number, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
  const p: Record<string, number> = {};
  for (const x of f.formatToParts(new Date(ms))) if (x.type !== "literal") p[x.type] = Number(x.value);
  return { y: p.year, mo: p.month, d: p.day, h: p.hour % 24, mi: p.minute, s: p.second };
}

/** Diferença (ms) entre o relógio do fuso e o UTC naquele instante. */
function tzOffset(ms: number, tz: string) {
  const p = zonedParts(ms, tz);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
}

/** Instante (UTC ms) de uma data/hora no relógio do fuso (ajusta horário de verão). */
export function zonedToUtc(y: number, mo: number, d: number, h: number, mi: number, tz: string) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let t = guess - tzOffset(guess, tz);
  t = guess - tzOffset(t, tz);
  return t;
}

/** Inícios (com fim) em volta de agora, em ordem, no relógio da região. */
function occurrences(s: Exclude<TimerSchedule, { type: "respawn" }>, now: number, tz: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  const today = zonedParts(now, tz);
  const span = s.type === "weekly" ? [-2, 8] : [-1, 1];
  for (let k = span[0]; k <= span[1]; k++) {
    // Data do calendário (dia k a partir de hoje no relógio da região)
    const cal = new Date(Date.UTC(today.y, today.mo - 1, today.d + k));
    const y = cal.getUTCFullYear();
    const mo = cal.getUTCMonth() + 1;
    const d = cal.getUTCDate();
    if (s.type === "weekly") {
      if (!s.days.includes(cal.getUTCDay())) continue;
      for (const t of s.times) {
        const start = zonedToUtc(y, mo, d, t.h, t.m, tz);
        out.push({ start, end: start + t.dur * MIN });
      }
    } else {
      for (let m = s.offsetMin; m < 24 * 60; m += s.everyMin) {
        const start = zonedToUtc(y, mo, d, Math.floor(m / 60), m % 60, tz);
        out.push({ start, end: start + s.dur * MIN });
      }
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

export function timerState(def: TimerDef, now: number, kills: Record<string, string>, region: ServerRegion = "sa"): TimerState {
  const s = def.schedule;
  if (s.type === "respawn") {
    const k = kills[def.id];
    if (!k) return { kind: "unknown" };
    const start = Date.parse(k) + s.hours * HOUR;
    return start <= now ? { kind: "spawned", start } : { kind: "next", start, prev: Date.parse(k) };
  }
  const occ = occurrences(s, now, regionInfo(region).tz);
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

const hm = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

/** Texto do horário no relógio da região do servidor (para a lista de configuração). */
export function describeSchedule(s: TimerSchedule): string {
  if (s.type === "respawn") return `Renasce ${s.hours}h depois de morto`;
  if (s.type === "every") {
    if (s.everyMin === 60) return s.offsetMin % 60 ? `Toda hora, aos ${s.offsetMin % 60} min` : "Toda hora cheia";
    return `A cada ${s.everyMin / 60}h (${hm(Math.floor(s.offsetMin / 60), s.offsetMin % 60)}, …)`;
  }
  const days = s.days.length === 7 ? "todo dia" : [...s.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((x) => WEEKDAYS[x]).join(", ");
  return `${days} ${s.times.map((t) => hm(t.h, t.m)).join(" e ")}`;
}

export const isAlertOn = (def: TimerDef, s: TimerSettings) => s.alerts.events[def.id] ?? true;

export interface DueAlert {
  def: TimerDef;
  /** Chave única (evento + horário) para não avisar duas vezes. */
  key: string;
  start: number;
}

/**
 * Avisos que devem disparar agora: eventos ligados, com aviso ligado, que começam
 * dentro de `lead` minutos (ou que acabaram de começar, se lead = 0) e que ainda não foram avisados.
 */
export function dueAlerts(s: TimerSettings, now: number, fired: Set<string>): DueAlert[] {
  if (!s.alerts.on) return [];
  const lead = s.alerts.lead * MIN;
  const out: DueAlert[] = [];
  for (const def of TIMER_CATALOG) {
    if (!isTimerEnabled(def, s) || !isAlertOn(def, s)) continue;
    const st = timerState(def, now, s.kills, s.region);
    let start: number | null = null;
    if (st.kind === "next" && st.start - now <= lead && (lead > 0 || st.start - now <= 1000)) start = st.start;
    // Na hora (ou se o app abriu logo depois): até 1 min depois do início
    if ((st.kind === "live" || st.kind === "spawned") && lead === 0 && now - st.start < MIN) start = st.start;
    if (start === null) continue;
    const key = `${def.id}|${start}`;
    if (!fired.has(key)) out.push({ def, key, start });
  }
  return out;
}
