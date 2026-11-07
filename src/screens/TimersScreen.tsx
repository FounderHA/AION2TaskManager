// Aba Horários: eventos e chefes do jogo em ordem (o próximo em cima), com barra do tempo que falta.
import { useState } from "react";
import { Panel, SectionTitle } from "../components/ui";
import { TimerList, useNow, type TimerFilter } from "../components/TimerList";
import { useStore } from "../data/store";
import { SERVER_REGIONS, TIMER_CATALOG, TIMER_CATEGORIES, categoryInfo, describeSchedule, formatTimerCountdown, isTimerEnabled, localWhen, regionInfo, timerState, type ServerRegion } from "../data/timers";

const FILTERS: { id: TimerFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "chefes", label: "Chefes" },
  { id: "eventos", label: "Eventos" },
];
const KILL_AGO = [0, 5, 10, 15, 30, 60];

function RespawnBosses() {
  const { data, setTimerKill } = useStore();
  const now = useNow(1000);
  const s = data.settings.timers;
  const [ago, setAgo] = useState<Record<string, number>>({});
  const bosses = TIMER_CATALOG.filter((d) => d.schedule.type === "respawn" && isTimerEnabled(d, s));
  if (!bosses.length) return null;
  return (
    <Panel label="Chefes de campo">
      <SectionTitle aside="Renascem algumas horas depois de mortos">Chefes de campo (respawn)</SectionTitle>
      <p className="tm-hint">Marque quando o chefe morrer: a contagem até ele renascer entra na lista de cima.</p>
      <div className="tm-respawn">
        {bosses.map((d) => {
          const st = timerState(d, now, s.kills);
          const hours = d.schedule.type === "respawn" ? d.schedule.hours : 0;
          const a = ago[d.id] ?? 0;
          return (
            <div key={d.id} className={`tm-boss tm-boss--${st.kind}`} style={{ ["--c" as string]: categoryInfo(d.category).color }}>
              <div className="tm-boss__head">
                <span className="tm-boss__name">{d.name}</span>
                <span className="tm-boss__hours">{hours}h</span>
              </div>
              {d.place && <span className="tm-boss__place">{d.place}</span>}
              <span className="tm-boss__state">
                {st.kind === "unknown" && "Sem horário marcado"}
                {st.kind === "next" && (
                  <>
                    Renasce em <b>{formatTimerCountdown(st.start - now)}</b> · {localWhen(st.start, now)}
                  </>
                )}
                {st.kind === "spawned" && (
                  <>
                    <b>Já deve ter nascido</b> · {localWhen(st.start, now)}
                  </>
                )}
              </span>
              <div className="tm-boss__actions">
                <button type="button" className="btn btn--primary btn--small" onClick={() => setTimerKill(d.id, new Date(Date.now() - a * 60_000))}>
                  Matei {a ? `há ${a} min` : "agora"}
                </button>
                <select className="input tm-boss__ago" value={a} onChange={(e) => setAgo({ ...ago, [d.id]: Number(e.target.value) })} aria-label={`Quando ${d.name} morreu`}>
                  {KILL_AGO.map((m) => (
                    <option key={m} value={m}>
                      {m ? `há ${m} min` : "agora"}
                    </option>
                  ))}
                </select>
                {s.kills[d.id] && (
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => setTimerKill(d.id, null)}>
                    Limpar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TimerSettingsPanel() {
  const { data, setTimerEnabled, setTimerRegion } = useStore();
  const s = data.settings.timers;
  return (
    <Panel label="Escolher eventos">
      <SectionTitle aside={`Horários no relógio de: ${regionInfo(s.region).label}`}>Quais horários mostrar</SectionTitle>
      <div className="field tm-region">
        <label className="field__label" htmlFor="tm-region">
          Região do servidor
        </label>
        <select id="tm-region" className="input" value={s.region} onChange={(e) => setTimerRegion(e.target.value as ServerRegion)}>
          {SERVER_REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <span className="tm-hint">Cada região segue o próprio relógio (ex.: Artifact Siege às 21:00 locais). Na lista, os horários aparecem no relógio do seu PC.</span>
      </div>
      {TIMER_CATEGORIES.map((c) => (
        <div key={c.id} className="tm-cfg">
          <div className="tm-cfg__title" style={{ ["--c" as string]: c.color }}>
            {c.label}
          </div>
          {TIMER_CATALOG.filter((d) => d.category === c.id).map((d) => {
            const on = isTimerEnabled(d, s);
            return (
              <label key={d.id} className={`tm-cfg__row ${on ? "" : "tm-cfg__row--off"}`}>
                <input type="checkbox" checked={on} onChange={(e) => setTimerEnabled(d.id, e.target.checked)} />
                <span className="tm-cfg__name">
                  {d.name}
                  {d.place && <span className="tm-cfg__place"> · {d.place}</span>}
                </span>
                <span className="tm-cfg__sched">{describeSchedule(d.schedule)}</span>
                {d.note && <span className="tm-cfg__note">{d.note}</span>}
              </label>
            );
          })}
        </div>
      ))}
      <p className="tm-hint">
        A NCSOFT não publica os horários do Global: estes são da comunidade (shugo.gg, daevaguides.com, aion2rifttimer.com, metabot.gg; revisados em 07/11/2026) e podem mudar com patches. Os chefes de campo renascem de 30 min a 12h depois de mortos; o mapa do jogo (aba Exploration) mostra o tempo exato.
      </p>
    </Panel>
  );
}

export function TimersScreen() {
  const [filter, setFilter] = useState<TimerFilter>("todos");
  const [config, setConfig] = useState(false);
  return (
    <div className="page">
      <Panel label="Horários">
        <SectionTitle
          aside={
            <div className="tm-tools">
              <div className="tm-filters" role="tablist" aria-label="Filtro">
                {FILTERS.map((f) => (
                  <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={`tm-filter ${filter === f.id ? "tm-filter--on" : ""}`} onClick={() => setFilter(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
              <button type="button" className={`btn btn--ghost btn--small ${config ? "is-on" : ""}`} onClick={() => setConfig(!config)} aria-expanded={config}>
                {config ? "Fechar" : "Escolher eventos"}
              </button>
            </div>
          }
        >
          Próximos eventos e chefes
        </SectionTitle>
        <div className="tm-legend">
          {TIMER_CATEGORIES.map((c) => (
            <span key={c.id} style={{ ["--c" as string]: c.color }}>
              <i /> {c.label}
            </span>
          ))}
          <span className="tm-legend__note">O próximo fica em cima · a barra enche até a hora do evento</span>
        </div>
        <TimerList filter={filter} empty="Nada ligado neste filtro. Use “Escolher eventos” para ligar." />
      </Panel>
      {config && <TimerSettingsPanel />}
      <RespawnBosses />
    </div>
  );
}
