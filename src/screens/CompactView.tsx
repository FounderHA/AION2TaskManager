// Modo compacto: janela pequena (sempre por cima do jogo) com o que falta hoje e na semana.
import { useMemo, useState } from "react";
import { CharPortrait } from "../components/ui";
import { CheckIcon } from "../components/ui/icons";
import { progressFor } from "../components/WeekView";
import { currentOdyle, rulesFor } from "../data/odyle";
import { useStore } from "../data/store";
import { charDays, doneCount, type DayItem } from "../data/today";
import { formatCountdown, localResetLabel } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";

function Ring({ value, label, sub, size = 92 }: { value: number; label: string; sub: string; size?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="mini-ring">
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(220,230,245,.15)" strokeWidth="1" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--gold)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray .5s ease" }} />
        <text x="50" y="56" textAnchor="middle" fill="var(--text-strong)" fontSize="22" fontWeight="600" fontFamily="Noto Sans, sans-serif">
          {pct}%
        </text>
      </svg>
      <span className="mini-ring__label">{label}</span>
      <span className="mini-ring__sub">{sub}</span>
    </div>
  );
}

function Row({ item, onToggle, note }: { item: DayItem; onToggle: () => void; note?: string }) {
  return (
    <button type="button" className={`compact-row ${item.done ? "compact-row--done" : ""} ${item.task.scope === "servidor" ? "compact-row--server" : ""}`} aria-pressed={item.done} onClick={onToggle}>
      <span className="compact-row__box">{item.done && <CheckIcon size={12} />}</span>
      <span className="compact-row__name">{item.task.name}</span>
      {note && <span className="compact-row__note">{note}</span>}
    </button>
  );
}

export function CompactView({ clock, onExpand, onTop, onToggleTop }: { clock: GameClock; onExpand: () => void; onTop: boolean; onToggleTop: () => void }) {
  const { characters, data, catalog, toggleCheck } = useStore();
  const [showDone, setShowDone] = useState(false);
  const [openWeek, setOpenWeek] = useState<Record<string, boolean>>({});
  const rows = useMemo(() => charDays(catalog, characters, data.checks, clock.todayKey, clock.weekKey), [catalog, characters, data.checks, clock.todayKey, clock.weekKey]);
  const week = useMemo(() => progressFor(catalog, characters, data.checks, clock.days, clock.todayIndex, clock.weekKey), [catalog, characters, data.checks, clock.days, clock.todayIndex, clock.weekKey]);
  const rules = rulesFor(data.settings.odyle, data.settings.membership);

  const dayDone = rows.reduce((n, r) => n + doneCount(r.daily), 0);
  const dayTotal = rows.reduce((n, r) => n + r.daily.length, 0);
  const weekAvg = characters.length ? characters.reduce((n, c) => n + (week[c.id]?.percent ?? 0), 0) / characters.length : 0;
  const weekLeft = rows.reduce((n, r) => n + r.weekly.length - doneCount(r.weekly) + r.purchases.length - doneCount(r.purchases), 0);
  const toDaily = clock.nextDaily.getTime() - clock.now.getTime();
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();

  return (
    <div className="compact">
      <div className="compact__bar">
        <span className="compact__title">
          Aion 2 <span>Manager</span>
        </span>
        <span className="form__spacer" />
        <button type="button" className={`compact__icon ${onTop ? "compact__icon--on" : ""}`} onClick={onToggleTop} title={onTop ? "Sempre no topo: ligado" : "Sempre no topo: desligado"} aria-pressed={onTop}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 1h6l-1 5 3 3H3l3-3zM8 9v6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="compact__icon" onClick={onExpand} title="Voltar ao modo completo">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      <div className="compact__summary">
        <Ring value={dayTotal ? (dayDone / dayTotal) * 100 : 100} label="Hoje" sub={`${dayDone}/${dayTotal} · vira em ${formatCountdown(toDaily)}`} />
        <Ring value={weekAvg} label="Semana" sub={`${weekLeft} pendentes · ${localResetLabel(clock.nextWeekly)}`} />
      </div>
      {toWeekly < 86_400_000 && weekLeft > 0 && <div className="compact__alert">Semana acaba em {formatCountdown(toWeekly)}: {weekLeft} pendentes.</div>}

      <div className="compact__list">
        {rows.map(({ char, daily, weekly, purchases }) => {
          const d = doneCount(daily);
          const complete = daily.length > 0 && d === daily.length;
          const shown = showDone ? daily : daily.filter((i) => !i.done);
          const weekItems = [...weekly, ...purchases];
          const wLeft = weekItems.filter((i) => !i.done);
          const odyle = char.odyle ? currentOdyle(char.odyle, rules, clock.now) : null;
          const open = !!openWeek[char.id];
          return (
            <section key={char.id} className={`compact-char ${complete ? "compact-char--complete" : ""}`}>
              <div className="compact-char__head">
                <CharPortrait photo={char.photo} name={char.name} size={34} />
                <span className="compact-char__name">{char.name}</span>
                {odyle && odyle.level !== "ok" && (
                  <span className={`compact-char__odyle compact-char__odyle--${odyle.level}`} title="Odyle Energy (Basic)">
                    Odyle {odyle.basic}
                  </span>
                )}
                <span className="compact-char__pct">{daily.length ? `${d}/${daily.length}` : "—"}</span>
              </div>
              <div className="compact-char__bar">
                <span style={{ width: `${daily.length ? (d / daily.length) * 100 : 0}%` }} />
              </div>
              {complete && !showDone ? (
                <div className="compact-char__done">✦ Dia completo</div>
              ) : (
                <div className="compact-char__rows">
                  {shown.map((item) => (
                    <Row key={item.key} item={item} onToggle={() => toggleCheck(item.key)} />
                  ))}
                </div>
              )}
              {weekItems.length > 0 && (
                <>
                  <button type="button" className="compact-char__week" onClick={() => setOpenWeek((o) => ({ ...o, [char.id]: !open }))} aria-expanded={open}>
                    <span>{open ? "▾" : "▸"} Semana</span>
                    <span>{wLeft.length ? `${wLeft.length} pendentes` : "✦ tudo feito"}</span>
                  </button>
                  {open && (
                    <div className="compact-char__rows">
                      {(showDone ? weekItems : wLeft).map((item) => (
                        <Row key={item.key} item={item} onToggle={() => toggleCheck(item.key)} note={item.task.shop} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>

      <label className="compact__footer">
        <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
        Mostrar concluídas
      </label>
    </div>
  );
}
