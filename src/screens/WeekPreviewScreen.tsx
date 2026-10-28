// Etapa 5: prévia da semana do jogo (quarta → terça) com o dia de hoje e os resets.
// Na Etapa 7 esta aba vira o Painel Semanal com as tarefas e os checks.
import { Alert, Panel, SectionTitle } from "../components/ui";
import { dayLabel, formatCountdown, localResetLabel, weekRangeLabel } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";

const FULL_WEEKDAY: Record<string, string> = { DOM: "domingo", SEG: "segunda", TER: "terça", QUA: "quarta", QUI: "quinta", SEX: "sexta", SÁB: "sábado" };

export function WeekPreviewScreen({ clock }: { clock: GameClock }) {
  const today = dayLabel(clock.todayKey);
  const toDaily = clock.nextDaily.getTime() - clock.now.getTime();
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();
  const lastDay = clock.todayIndex === 6;

  return (
    <div className="page">
      <Panel label="Semana atual">
        <SectionTitle aside={`Dia ${clock.todayIndex + 1} de 7`}>Semana {weekRangeLabel(clock.weekKey)}</SectionTitle>
        <div className="week-strip">
          {clock.days.map((key, i) => {
            const l = dayLabel(key);
            const state = i < clock.todayIndex ? "past" : i === clock.todayIndex ? "today" : "future";
            return (
              <div key={key} className={`day-head day-head--${state}`} aria-current={state === "today" ? "date" : undefined}>
                <span className="day-head__wd">{l.weekday}</span>
                <span className="day-head__num">{l.day}</span>
                <span className="day-head__tag">{state === "today" ? "HOJE" : ""}</span>
              </div>
            );
          })}
        </div>

        <div className="info-grid">
          <div className="info-card">
            <span className="info-card__label">Hoje no jogo</span>
            <span className="info-card__value">
              {FULL_WEEKDAY[today.weekday]}, {today.day} {today.month}
            </span>
            <span className="info-card__hint">O dia vira às 04:00 (horário de Brasília)</span>
          </div>
          <div className="info-card">
            <span className="info-card__label">Reset diário</span>
            <span className="info-card__value">em {formatCountdown(toDaily)}</span>
            <span className="info-card__hint">{localResetLabel(clock.nextDaily)}</span>
          </div>
          <div className="info-card">
            <span className="info-card__label">Reset semanal</span>
            <span className="info-card__value" style={{ color: toWeekly < 86_400_000 ? "#f2a3ae" : undefined }}>
              em {formatCountdown(toWeekly)}
            </span>
            <span className="info-card__hint">{localResetLabel(clock.nextWeekly)}</span>
          </div>
        </div>
      </Panel>

      {lastDay ? (
        <Alert kind="danger">Hoje é o último dia da semana: as tarefas semanais expiram no reset de {localResetLabel(clock.nextWeekly)}.</Alert>
      ) : (
        <Alert kind="info">Na Etapa 7 esta aba vira o Painel Semanal, com as tarefas de cada personagem em cada um desses dias.</Alert>
      )}
    </div>
  );
}
