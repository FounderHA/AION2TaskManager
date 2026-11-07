// Lista de horários (eventos e chefes), ordenada pelo próximo. Usada na aba Horários e no modo compacto.
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../data/store";
import { TIMER_CATALOG, barFraction, categoryInfo, formatTimerCountdown, isTimerEnabled, localWhen, sortKey, timerState, type TimerCategory, type TimerDef, type TimerState } from "../data/timers";

/** Relógio que atualiza a cada `ms`. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

export type TimerFilter = "todos" | "chefes" | "eventos";
const SOON = 10 * 60_000;

export interface TimerEntry {
  def: TimerDef;
  state: TimerState;
}

/** Eventos ligados com horário conhecido, já em ordem. */
export function useTimerEntries(now: number, filter: TimerFilter = "todos"): TimerEntry[] {
  const { data } = useStore();
  const s = data.settings.timers;
  return useMemo(() => {
    const keep = (c: TimerCategory) => filter === "todos" || (filter === "chefes" ? c !== "evento" : c === "evento");
    return TIMER_CATALOG.filter((d) => isTimerEnabled(d, s) && keep(d.category))
      .map((def) => ({ def, state: timerState(def, now, s.kills, s.region) }))
      .filter((e) => e.state.kind !== "unknown")
      .sort((a, b) => {
        const ka = sortKey(a.state);
        const kb = sortKey(b.state);
        return ka[0] - kb[0] || ka[1] - kb[1] || a.def.name.localeCompare(b.def.name);
      });
  }, [s, now, filter]);
}

function rowInfo(e: TimerEntry, now: number) {
  const st = e.state;
  if (st.kind === "live") return { mod: "live", count: formatTimerCountdown(st.end - now), when: `termina ${localWhen(st.end, now).replace(/^hoje /, "às ")}`, tag: "AGORA" };
  if (st.kind === "spawned") return { mod: "spawned", count: `há ${formatTimerCountdown(now - st.start)}`, when: `nasceu ${localWhen(st.start, now)}`, tag: "NASCEU" };
  if (st.kind === "next") return { mod: st.start - now <= SOON ? "soon" : "", count: formatTimerCountdown(st.start - now), when: localWhen(st.start, now), tag: st.start - now <= SOON ? "JÁ JÁ" : "" };
  return { mod: "", count: "—", when: "", tag: "" };
}

export function TimerRow({ entry, now, compact, onKill }: { entry: TimerEntry; now: number; compact?: boolean; onKill?: () => void }) {
  const { def, state } = entry;
  const cat = categoryInfo(def.category);
  const info = rowInfo(entry, now);
  const frac = barFraction(state, now);
  return (
    <div className={`tm-row ${info.mod ? `tm-row--${info.mod}` : ""} ${compact ? "tm-row--compact" : ""}`} style={{ ["--c" as string]: cat.color }}>
      <span className="tm-row__dot" aria-hidden="true" />
      <div className="tm-row__main">
        <span className="tm-row__name">
          {def.name}
          {info.tag && <span className="tm-row__tag">{info.tag}</span>}
        </span>
        {!compact && (
          <span className="tm-row__sub">
            {cat.label}
            {def.place ? ` · ${def.place}` : ""}
          </span>
        )}
      </div>
      <div className="tm-row__when">
        <span className="tm-row__count">{info.count}</span>
        <span className="tm-row__time">{info.when}</span>
      </div>
      {onKill && def.schedule.type === "respawn" && (
        <button type="button" className="tm-row__kill" onClick={onKill} title="Marcar que matou agora (recomeça a contagem)">
          Matei
        </button>
      )}
      <div className="tm-row__bar" aria-hidden="true">
        <span style={{ width: `${frac * 100}%` }} />
      </div>
    </div>
  );
}

/** Lista pronta (com relógio próprio de 1 s). */
export function TimerList({ filter = "todos", compact, empty }: { filter?: TimerFilter; compact?: boolean; empty?: string }) {
  const now = useNow(1000);
  const entries = useTimerEntries(now, filter);
  const { setTimerKill } = useStore();
  if (!entries.length) return <p className="tm-empty">{empty ?? "Nenhum horário para mostrar."}</p>;
  return (
    <div className={`tm-list ${compact ? "tm-list--compact" : ""}`}>
      {entries.map((e) => (
        <TimerRow key={e.def.id} entry={e} now={now} compact={compact} onKill={() => setTimerKill(e.def.id, new Date())} />
      ))}
    </div>
  );
}
