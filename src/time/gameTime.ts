// Relógio do jogo: em que "dia do jogo" e em que "semana do jogo" estamos.
//
// O Aion 2 Global vira o dia às 07:00 UTC (04:00 em Brasília) e a semana na
// quarta-feira nesse mesmo horário. Para achar o dia do jogo basta "atrasar" o
// relógio em 7 horas e olhar a data em UTC: tudo antes das 07:00 UTC ainda
// conta como o dia anterior. Fazer a conta em UTC evita problemas com fuso
// horário e horário de verão do computador.
import type { Weekday } from "../data/types";

export interface ResetConfig {
  /** Hora UTC do reset diário (padrão 7 = 04:00 em Brasília). */
  utcHour: number;
  /** Dia da semana do reset semanal (padrão 3 = quarta). */
  weeklyWeekday: Weekday;
}

export const DEFAULT_RESET: ResetConfig = { utcHour: 7, weeklyWeekday: 3 };

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** "2026-10-27" a partir de um timestamp já deslocado. */
function keyFromShifted(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Converte "YYYY-MM-DD" em meia-noite UTC daquele dia. */
export function keyToUtcMidnight(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Dia do jogo em que o instante cai ("YYYY-MM-DD"). */
export function gameDayKey(now: Date, cfg: ResetConfig = DEFAULT_RESET): string {
  return keyFromShifted(now.getTime() - cfg.utcHour * HOUR);
}

/** Dia da semana do dia do jogo (0 = domingo … 6 = sábado). */
export function gameWeekday(dayKey: string): Weekday {
  return new Date(keyToUtcMidnight(dayKey)).getUTCDay() as Weekday;
}

/** Soma dias a uma chave de dia. */
export function addDays(dayKey: string, n: number): string {
  return keyFromShifted(keyToUtcMidnight(dayKey) + n * DAY);
}

/** Primeiro dia (a quarta) da semana do jogo que contém o dia informado. */
export function weekStartKey(dayKey: string, cfg: ResetConfig = DEFAULT_RESET): string {
  const back = (gameWeekday(dayKey) - cfg.weeklyWeekday + 7) % 7;
  return addDays(dayKey, -back);
}

/** Os 7 dias da semana do jogo, na ordem (qua, qui, … ter). */
export function weekDayKeys(weekKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekKey, i));
}

/** Instante exato (Date) em que o dia do jogo informado começa. */
export function dayStart(dayKey: string, cfg: ResetConfig = DEFAULT_RESET): Date {
  return new Date(keyToUtcMidnight(dayKey) + cfg.utcHour * HOUR);
}

/** Próximo reset diário a partir de agora. */
export function nextDailyReset(now: Date, cfg: ResetConfig = DEFAULT_RESET): Date {
  return dayStart(addDays(gameDayKey(now, cfg), 1), cfg);
}

/** Próximo reset semanal a partir de agora. */
export function nextWeeklyReset(now: Date, cfg: ResetConfig = DEFAULT_RESET): Date {
  return dayStart(addDays(weekStartKey(gameDayKey(now, cfg), cfg), 7), cfg);
}

/* ---------- Textos para a interface (português) ---------- */

const WEEKDAY_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function dayLabel(dayKey: string): { weekday: string; day: string; month: string } {
  const d = new Date(keyToUtcMidnight(dayKey));
  return { weekday: WEEKDAY_SHORT[d.getUTCDay()], day: String(d.getUTCDate()), month: MONTH_SHORT[d.getUTCMonth()] };
}

/** "21 – 27 out" ou "29 out – 4 nov". */
export function weekRangeLabel(weekKey: string): string {
  const a = dayLabel(weekKey);
  const b = dayLabel(addDays(weekKey, 6));
  return a.month === b.month ? `${a.day} – ${b.day} ${b.month}` : `${a.day} ${a.month} – ${b.day} ${b.month}`;
}

/** Contagem regressiva curta: "2d 5h", "9h 45m", "12m", "menos de 1m". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "agora";
  const totalMin = Math.floor(ms / 60_000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m`;
  return "menos de 1m";
}

/** Horário local de um reset: "qua 04:00". */
export function localResetLabel(date: Date): string {
  const wd = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").slice(0, 3).toLowerCase();
  const hm = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${wd} ${hm}`;
}
