// Aba Horários: eventos e chefes do jogo em ordem (o próximo em cima), com barra do tempo que falta.
import { useState } from "react";
import { Panel, SectionTitle } from "../components/ui";
import { TimerList, useNow, type TimerFilter } from "../components/TimerList";
import { useStore } from "../data/store";
import { playAlertSound } from "../components/alertSound";
import { ALERT_LEADS, isAlertOn, SERVER_REGIONS, TIMER_CATALOG, TIMER_CATEGORIES, categoryInfo, describeSchedule, formatTimerCountdown, isTimerEnabled, localWhen, regionInfo, timerState, type ServerRegion } from "../data/timers";

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

function AlertsPanel() {
  const { data, setTimerAlerts } = useStore();
  const a = data.settings.timers.alerts;
  return (
    <Panel label="Avisos">
      <SectionTitle aside="Pop-up dentro do app + som + notificação do Windows">Avisos antes dos eventos</SectionTitle>
      <div className="tm-alerts">
        <label className="tm-alerts__toggle">
          <input type="checkbox" checked={a.on} onChange={(e) => setTimerAlerts({ on: e.target.checked })} />
          Avisar antes dos eventos ligados
        </label>
        <div className="field">
          <label className="field__label" htmlFor="tm-lead">
            Quando
          </label>
          <select id="tm-lead" className="input" value={a.lead} disabled={!a.on} onChange={(e) => setTimerAlerts({ lead: Number(e.target.value) })}>
            {ALERT_LEADS.map((m) => (
              <option key={m} value={m}>
                {m === 0 ? "Na hora" : `${m} min antes`}
              </option>
            ))}
          </select>
        </div>
        <div className="field tm-alerts__vol">
          <label className="field__label" htmlFor="tm-vol">
            Volume do som · {a.volume}%
          </label>
          <input id="tm-vol" type="range" min={0} max={100} step={5} value={a.volume} disabled={!a.on} onChange={(e) => setTimerAlerts({ volume: Number(e.target.value) })} />
        </div>
        <label className="tm-alerts__toggle">
          <input type="checkbox" checked={a.system} disabled={!a.on} onChange={(e) => setTimerAlerts({ system: e.target.checked })} />
          Também mostrar a notificação do Windows
        </label>
      </div>
      <p className="tm-hint">Cada evento tem um som próprio (provisório até chegarem os sons definitivos). Ligue ou desligue o aviso de cada um e teste o som no sininho e no ▶ em “Escolher eventos”.</p>
    </Panel>
  );
}

function TimerSettingsPanel() {
  const { data, setTimerEnabled, setTimerRegion, setTimerAlerts } = useStore();
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
                <span className="tm-cfg__alert" onClick={(e) => e.preventDefault()}>
                  <button
                    type="button"
                    className={`tm-bell ${isAlertOn(d, s) ? "tm-bell--on" : ""}`}
                    disabled={!on}
                    onClick={() => setTimerAlerts({ events: { ...s.alerts.events, [d.id]: !isAlertOn(d, s) } })}
                    title={isAlertOn(d, s) ? "Aviso ligado (clique para desligar)" : "Aviso desligado (clique para ligar)"}
                    aria-pressed={isAlertOn(d, s)}
                    aria-label={`Aviso de ${d.name}`}
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M8 2a4 4 0 0 0-4 4v3L2.5 11h11L12 9V6a4 4 0 0 0-4-4zM6.5 13a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      {!isAlertOn(d, s) && <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.4" />}
                    </svg>
                  </button>
                  <button type="button" className="tm-bell" onClick={() => playAlertSound(d.id, s.alerts.volume)} title="Testar o som deste evento" aria-label={`Testar som de ${d.name}`}>
                    ▶
                  </button>
                </span>
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
      <AlertsPanel />
      {config && <TimerSettingsPanel />}
      <RespawnBosses />
    </div>
  );
}
