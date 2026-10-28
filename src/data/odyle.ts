// Odyle Energy: valor atual calculado a partir da última "foto" + recargas desde então.
//
// - Basic Energy recarrega +rate a cada 3h, às 01:00, 04:00, 07:00 … (horário de Brasília),
//   que são 04:00, 07:00, … 01:00 em UTC: os horários UTC com hora ≡ 1 (mod 3).
// - Ao chegar no limite (cap), para de recarregar; o excedente é perdido (como no jogo).
// - Charged Energy (dos itens) vai até 2000 e não recarrega sozinha.
// - Gastos saem primeiro da Basic e depois da Charged.
// O app não precisa ficar aberto: tudo é calculado pelo relógio quando a tela é mostrada.
import type { OdyleSnapshot } from "./model";
import type { OdyleConfig } from "./settings";

const HOUR = 3_600_000;
export const TICK_PERIOD = 3 * HOUR;
/** Deslocamento dos horários de recarga a partir da meia-noite UTC (01:00 UTC = 22:00 BRT). */
export const TICK_OFFSET = 1 * HOUR;
export const CHARGED_CAP = 2000;
/** Gastos possíveis por vez (botões). */
export const SPEND_OPTIONS = [40, 80] as const;
/** Itens de energia que viram Charged. */
export const CHARGED_ADD_OPTIONS = [40, 10] as const;
/** Avisar quando faltar menos que isso para o limite (uma recarga de 40). */
export const WARN_MARGIN = 40;

export interface OdyleRules {
  cap: number;
  rate: number;
}

export function rulesFor(cfg: OdyleConfig, membership: boolean): OdyleRules {
  return membership ? { cap: cfg.capMember, rate: cfg.rateMember } : { cap: cfg.capFree, rate: cfg.rateFree };
}

/** Quantas recargas acontecem no intervalo (from, to]. */
export function ticksBetween(fromMs: number, toMs: number): number {
  if (toMs <= fromMs) return 0;
  return Math.floor((toMs - TICK_OFFSET) / TICK_PERIOD) - Math.floor((fromMs - TICK_OFFSET) / TICK_PERIOD);
}

/** Próximo horário de recarga depois de agora. */
export function nextTickAfter(nowMs: number): number {
  return (Math.floor((nowMs - TICK_OFFSET) / TICK_PERIOD) + 1) * TICK_PERIOD + TICK_OFFSET;
}

export type OdyleLevel = "ok" | "warn" | "full";

export interface OdyleNow {
  basic: number;
  charged: number;
  cap: number;
  rate: number;
  nextTick: Date;
  /** Quando a Basic chega no limite (null se já está cheia). */
  fullAt: Date | null;
  level: OdyleLevel;
}

export function currentOdyle(snap: OdyleSnapshot, rules: OdyleRules, now: Date): OdyleNow {
  const nowMs = now.getTime();
  const startMs = Date.parse(snap.at);
  const n = ticksBetween(startMs, nowMs);
  const basic = snap.basic >= rules.cap ? snap.basic : Math.min(rules.cap, snap.basic + n * rules.rate);
  const nextTick = nextTickAfter(nowMs);
  let fullAt: Date | null = null;
  if (basic < rules.cap && rules.rate > 0) {
    const k = Math.ceil((rules.cap - basic) / rules.rate);
    fullAt = new Date(nextTick + (k - 1) * TICK_PERIOD);
  }
  const level: OdyleLevel = basic >= rules.cap ? "full" : basic >= rules.cap - WARN_MARGIN ? "warn" : "ok";
  return { basic, charged: Math.min(CHARGED_CAP, snap.charged), cap: rules.cap, rate: rules.rate, nextTick: new Date(nextTick), fullAt, level };
}

/** Nova foto com os valores atuais (usada antes de qualquer alteração). */
export function reanchor(snap: OdyleSnapshot, rules: OdyleRules, now: Date): OdyleSnapshot {
  const cur = currentOdyle(snap, rules, now);
  return { basic: cur.basic, charged: cur.charged, at: now.toISOString() };
}

/** Gasta energia (Basic primeiro, depois Charged). Retorna null se não houver o suficiente. */
export function spend(snap: OdyleSnapshot, rules: OdyleRules, amount: number, now: Date): OdyleSnapshot | null {
  const cur = currentOdyle(snap, rules, now);
  if (cur.basic + cur.charged < amount) return null;
  const fromBasic = Math.min(cur.basic, amount);
  return { basic: cur.basic - fromBasic, charged: cur.charged - (amount - fromBasic), at: now.toISOString() };
}

/** Adiciona Charged Energy (itens), até 2000. */
export function addCharged(snap: OdyleSnapshot, rules: OdyleRules, amount: number, now: Date): OdyleSnapshot {
  const cur = reanchor(snap, rules, now);
  return { ...cur, charged: Math.min(CHARGED_CAP, cur.charged + amount) };
}

/** Foto a partir de valores digitados pelo usuário (limitados aos máximos). */
export function snapshotFromInput(basic: number, charged: number, rules: OdyleRules, now: Date): OdyleSnapshot {
  return { basic: Math.max(0, Math.min(rules.cap, Math.round(basic))), charged: Math.max(0, Math.min(CHARGED_CAP, Math.round(charged))), at: now.toISOString() };
}
