// Hook que mantém o relógio do jogo atualizado na tela (a cada 15 s).
// Quando o dia ou a semana viram com o app aberto, tudo que depende disso re-renderiza.
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_RESET, gameDayKey, nextDailyReset, nextWeeklyReset, weekDayKeys, weekStartKey, type ResetConfig } from "./gameTime";

export interface GameClock {
  now: Date;
  /** Dia do jogo de hoje ("YYYY-MM-DD"). */
  todayKey: string;
  /** Quarta-feira que abre a semana atual. */
  weekKey: string;
  /** Os 7 dias da semana atual (qua → ter). */
  days: string[];
  /** Posição de hoje na semana (0 = quarta … 6 = terça). */
  todayIndex: number;
  nextDaily: Date;
  nextWeekly: Date;
}

export function useGameClock(cfg: ResetConfig = DEFAULT_RESET, tickMs = 15_000): GameClock {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(t);
  }, [tickMs]);

  return useMemo(() => {
    const todayKey = gameDayKey(now, cfg);
    const weekKey = weekStartKey(todayKey, cfg);
    const days = weekDayKeys(weekKey);
    return { now, todayKey, weekKey, days, todayIndex: days.indexOf(todayKey), nextDaily: nextDailyReset(now, cfg), nextWeekly: nextWeeklyReset(now, cfg) };
  }, [now, cfg]);
}
