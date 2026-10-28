// Etapa 8: aba Hoje — o que fazer hoje, de todos os personagens numa tela só.
// Usa as mesmas marcações da aba Semana.
import { useState } from "react";
import { Alert, Badge, Button, Panel, SectionTitle, TaskToggleRow } from "../components/ui";
import { isEnabled } from "../components/WeekView";
import { describe, occursOn } from "../data/catalog";
import { activeTasks, dayCheckKey, isWeekly, weekCheckKey } from "../data/checks";
import type { Character } from "../data/model";
import { useStore } from "../data/store";
import type { TaskDef } from "../data/types";
import { dayLabel, formatCountdown, gameWeekday, localResetLabel } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";


const FULL_WEEKDAY: Record<string, string> = { DOM: "Domingo", SEG: "Segunda", TER: "Terça", QUA: "Quarta", QUI: "Quinta", SEX: "Sexta", SÁB: "Sábado" };

interface CharToday {
  char: Character;
  daily: { task: TaskDef; key: string; done: boolean }[];
  weekly: { task: TaskDef; key: string; done: boolean }[];
}

export function TodayScreen({ clock, onGoToCharacters }: { clock: GameClock; onGoToCharacters: () => void }) {
  const { characters, data, toggleCheck, catalog } = useStore();
  const [hideDone, setHideDone] = useState(false);
  const checks = data.checks;
  const weekday = gameWeekday(clock.todayKey);
  const lastDay = clock.todayIndex === 6;
  const toDaily = clock.nextDaily.getTime() - clock.now.getTime();
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();

  if (!characters.length) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <span style={{ fontSize: 16, color: "var(--text)" }}>Cadastre seus personagens para ver as tarefas de hoje.</span>
            <Button variant="primary" onClick={onGoToCharacters}>
              Ir para Personagens
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  const rows: CharToday[] = characters.map((char) => {
    const tasks = activeTasks(catalog, char, isEnabled);
    return {
      char,
      daily: tasks
        .filter((t) => !isWeekly(t) && occursOn(t, weekday))
        .map((task) => {
          const key = dayCheckKey(task, char, clock.todayKey);
          return { task, key, done: !!checks[key] };
        }),
      weekly: tasks.filter(isWeekly).map((task) => {
        const key = weekCheckKey(task, char, clock.weekKey);
        return { task, key, done: !!checks[key] };
      }),
    };
  });

  const dailyLeft = rows.reduce((n, r) => n + r.daily.filter((d) => !d.done).length, 0);
  const weeklyLeft = rows.reduce((n, r) => n + r.weekly.filter((w) => !w.done).length, 0);
  const today = dayLabel(clock.todayKey);

  return (
    <div className="page">
      <Panel label="Resumo de hoje">
        <SectionTitle
          aside={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-soft)" }}>
                <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
                Ocultar concluídas
              </label>
            </span>
          }
        >
          {FULL_WEEKDAY[today.weekday]}, {today.day} {today.month}
        </SectionTitle>
        <dl className="stat-list" style={{ maxWidth: 520 }}>
          <dt>Diárias que faltam hoje</dt>
          <dd style={{ color: dailyLeft ? "var(--cyan-light)" : "var(--gold)" }}>{dailyLeft === 0 ? "Tudo feito ✦" : dailyLeft}</dd>
          <dt>Semanais pendentes</dt>
          <dd style={{ color: weeklyLeft ? "#f0c86a" : "var(--gold)" }}>{weeklyLeft === 0 ? "Tudo feito ✦" : weeklyLeft}</dd>
          <dt>Reset diário</dt>
          <dd>em {formatCountdown(toDaily)}</dd>
          <dt>Reset semanal</dt>
          <dd style={{ color: toWeekly < 86_400_000 ? "#f2a3ae" : undefined }}>
            em {formatCountdown(toWeekly)} · {localResetLabel(clock.nextWeekly)}
          </dd>
        </dl>
      </Panel>

      {lastDay && weeklyLeft > 0 && <Alert kind="danger">Último dia da semana: {weeklyLeft} semanais ainda pendentes expiram no reset de {localResetLabel(clock.nextWeekly)}.</Alert>}

      <div className="today-grid">
        {rows.map(({ char, daily, weekly }) => {
          const dailyDone = daily.filter((d) => d.done).length;
          const weeklyDone = weekly.filter((w) => w.done).length;
          const complete = daily.length > 0 && dailyDone === daily.length;
          const showDaily = hideDone ? daily.filter((d) => !d.done) : daily;
          const showWeekly = hideDone ? weekly.filter((w) => !w.done) : weekly;
          return (
            <Panel key={char.id} label={char.name}>
              <div className="today-char__head">
                <span className="today-char__name">{char.name}</span>
                <Badge kind={char.role === "MAIN" ? "main" : "alt"} />
                <span className="today-char__meta">
                  {char.className}
                  {char.member ? " · Membership" : ""}
                </span>
                <span className="today-char__count">
                  {dailyDone}/{daily.length} hoje
                </span>
              </div>

              {complete && <div className="today-complete">✦ Dia completo! Todas as diárias de hoje feitas.</div>}

              <div className="today-char__sub">
                <span>Diárias de hoje</span>
                <span>
                  {dailyDone}/{daily.length}
                </span>
              </div>
              <div className="today-list">
                {showDaily.map(({ task, key, done }) => (
                  <TaskToggleRow key={key} name={task.name} note={describe(task, char.member)} done={done} server={task.scope === "servidor"} onToggle={() => toggleCheck(key)} />
                ))}
                {showDaily.length === 0 && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{daily.length ? "Nada pendente." : "Nenhuma diária ligada."}</span>}
              </div>

              <div className="today-char__sub">
                <span>Semanais</span>
                <span>
                  {weeklyDone}/{weekly.length}
                </span>
              </div>
              <div className="today-list">
                {showWeekly.map(({ task, key, done }) => (
                  <TaskToggleRow key={key} name={task.name} note={describe(task, char.member)} done={done} server={task.scope === "servidor"} onToggle={() => toggleCheck(key)} />
                ))}
                {showWeekly.length === 0 && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{weekly.length ? "Todas as semanais feitas ✦" : "Nenhuma semanal ligada."}</span>}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
