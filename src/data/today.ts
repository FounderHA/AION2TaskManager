// O que cada personagem tem para hoje e para a semana atual (usado pelo modo compacto e pelo efeito de dia completo).
import { isPurchase, occursOn } from "./catalog";
import { activeTasks, dayCheckKey, isWeekly, weekCheckKey, type Checks } from "./checks";
import type { Character } from "./model";
import type { ResolvedTask } from "./settings";
import type { TaskDef } from "./types";
import { gameWeekday } from "../time/gameTime";

export interface DayItem {
  task: TaskDef;
  key: string;
  done: boolean;
}

export interface CharDay {
  char: Character;
  daily: DayItem[];
  weekly: DayItem[];
  purchases: DayItem[];
}

const enabled = (t: ResolvedTask) => t.enabled;

export function charDays(catalog: ResolvedTask[], characters: Character[], checks: Checks, todayKey: string, weekKey: string): CharDay[] {
  const weekday = gameWeekday(todayKey);
  return characters.map((char) => {
    const tasks = activeTasks(catalog, char, enabled);
    const item = (task: TaskDef, key: string): DayItem => ({ task, key, done: !!checks[key] });
    return {
      char,
      daily: tasks.filter((t) => !isWeekly(t) && occursOn(t, weekday)).map((t) => item(t, dayCheckKey(t, char, todayKey))),
      weekly: tasks.filter((t) => isWeekly(t) && !isPurchase(t)).map((t) => item(t, weekCheckKey(t, char, weekKey))),
      purchases: tasks.filter(isPurchase).map((t) => item(t, weekCheckKey(t, char, weekKey))),
    };
  });
}

export const doneCount = (items: DayItem[]) => items.filter((i) => i.done).length;

/** Personagens com todas as diárias de hoje feitas (e pelo menos uma diária). */
export function completeToday(rows: CharDay[]): Set<string> {
  return new Set(rows.filter((r) => r.daily.length > 0 && r.daily.every((d) => d.done)).map((r) => r.char.id));
}
