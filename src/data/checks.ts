// Marcações (checks) e cálculos de progresso.
//
// Cada check é uma chave de texto gravada em AppData.checks:
//   diária / ritmo / dias fixos:  "<dono>|<tarefa>|d:<YYYY-MM-DD>"   (dia do jogo)
//   semanal:                      "<dono>|<tarefa>|w:<YYYY-MM-DD>"   (quarta que abre a semana)
// O <dono> é o id do personagem, ou "SERVER" para tarefas de servidor —
// assim o que o main fez continua valendo mesmo se o main for trocado.
import { occursOn, tasksForRole } from "./catalog";
import type { Character } from "./model";
import type { TaskDef } from "./types";
import { gameWeekday } from "../time/gameTime";

export const SERVER_OWNER = "SERVER";
export type Checks = Record<string, string>;

export const isWeekly = (t: TaskDef) => t.cadence === "semanal";

export function ownerOf(task: TaskDef, char: Character): string {
  return task.scope === "servidor" ? SERVER_OWNER : char.id;
}

export function dayCheckKey(task: TaskDef, char: Character, dayKey: string): string {
  return `${ownerOf(task, char)}|${task.id}|d:${dayKey}`;
}

export function weekCheckKey(task: TaskDef, char: Character, weekKey: string): string {
  return `${ownerOf(task, char)}|${task.id}|w:${weekKey}`;
}

/** Tarefas que o personagem vê e que estão ligadas. */
export function activeTasks(catalog: TaskDef[], char: Character, enabled: (t: TaskDef) => boolean): TaskDef[] {
  return tasksForRole(catalog, char.role).filter(enabled);
}

export type CellState = "done" | "today" | "missed" | "future" | "none";

/** Estado de uma célula diária: "none" quando o evento não acontece naquele dia. */
export function cellState(checks: Checks, task: TaskDef, char: Character, days: string[], index: number, todayIndex: number): CellState {
  const dayKey = days[index];
  if (!occursOn(task, gameWeekday(dayKey))) return "none";
  if (checks[dayCheckKey(task, char, dayKey)]) return "done";
  if (index < todayIndex) return "missed";
  if (index === todayIndex) return "today";
  return "future";
}

export interface WeekProgress {
  /** % do que já deveria estar feito até hoje + semanais (dias futuros não contam). */
  percent: number;
  doneToday: number;
  totalToday: number;
  missed: number;
  weeklyDone: number;
  weeklyTotal: number;
}

export function weekProgress(checks: Checks, tasks: TaskDef[], char: Character, days: string[], todayIndex: number, weekKey: string): WeekProgress {
  let due = 0;
  let done = 0;
  let doneToday = 0;
  let totalToday = 0;
  let missed = 0;
  let weeklyDone = 0;
  let weeklyTotal = 0;

  for (const t of tasks) {
    if (isWeekly(t)) {
      weeklyTotal++;
      due++;
      if (checks[weekCheckKey(t, char, weekKey)]) {
        weeklyDone++;
        done++;
      }
      continue;
    }
    for (let i = 0; i <= todayIndex && i < days.length; i++) {
      const st = cellState(checks, t, char, days, i, todayIndex);
      if (st === "none") continue;
      due++;
      if (st === "done") done++;
      if (st === "missed") missed++;
      if (i === todayIndex) {
        totalToday++;
        if (st === "done") doneToday++;
      }
    }
  }
  return { percent: due ? Math.round((done / due) * 100) : 0, doneToday, totalToday, missed, weeklyDone, weeklyTotal };
}

