// Etapa 7: Painel Semanal — tarefas de um personagem em cada dia da semana do jogo.
import { useMemo, useState } from "react";
import { Alert, Badge, Button, CharacterCard, CheckCell, Panel, ProgressRing, SectionTitle, WeeklyCard } from "../components/ui";
import { DEFAULT_CATALOG, describe } from "../data/catalog";
import { activeTasks, cellState, dayCheckKey, isWeekly, weekCheckKey, weekProgress } from "../data/checks";
import type { Character } from "../data/model";
import { useStore } from "../data/store";
import type { TaskDef } from "../data/types";
import { dayLabel, formatCountdown, localResetLabel, weekRangeLabel } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";

// Até a Etapa 12 (Configurações), vale o padrão do catálogo
const isEnabled = (t: TaskDef) => t.enabledByDefault;

export function WeeklyScreen({ clock, onGoToCharacters }: { clock: GameClock; onGoToCharacters: () => void }) {
  const { characters, main, data, toggleCheck } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: Character | undefined = characters.find((c) => c.id === selectedId) ?? main;

  const { days, todayIndex, weekKey } = clock;
  const checks = data.checks;

  const progressByChar = useMemo(() => {
    const map: Record<string, ReturnType<typeof weekProgress>> = {};
    for (const c of characters) map[c.id] = weekProgress(checks, activeTasks(DEFAULT_CATALOG, c, isEnabled), c, days, todayIndex, weekKey);
    return map;
  }, [characters, checks, days, todayIndex, weekKey]);

  if (!selected) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <span style={{ fontSize: 16, color: "var(--text)" }}>Cadastre seus personagens para ver as tarefas da semana.</span>
            <Button variant="primary" onClick={onGoToCharacters}>
              Ir para Personagens
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  const tasks = activeTasks(DEFAULT_CATALOG, selected, isEnabled);
  const dailyTasks = tasks.filter((t) => !isWeekly(t));
  const weeklyTasks = tasks.filter(isWeekly);
  const prog = progressByChar[selected.id];
  const lastDay = todayIndex === 6;
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();

  return (
    <div className="page">
      <section aria-label="Personagens" style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {characters.map((c) => (
          <CharacterCard key={c.id} data={{ ...c, progress: progressByChar[c.id]?.percent ?? 0 }} selected={c.id === selected.id} onSelect={() => setSelectedId(c.id)} />
        ))}
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-start" }}>
        <div style={{ flex: "999 1 760px", minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
          {selected.role === "ALT" && main && <Alert kind="info">Tarefas de servidor ficam só no main ({main.name}). Aqui aparecem apenas as tarefas deste personagem.</Alert>}

          <Panel label="Tarefas diárias">
            <SectionTitle aside={`Semana ${weekRangeLabel(weekKey)}`}>Diárias de {selected.name}</SectionTitle>
            {dailyTasks.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-soft)" }}>Nenhuma tarefa diária ligada.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <div className="task-table">
                  <div className="task-table__row task-table__row--head">
                    <span className="task-table__head-label">TAREFA</span>
                    {days.map((key, i) => {
                      const l = dayLabel(key);
                      const state = i < todayIndex ? "past" : i === todayIndex ? "today" : "future";
                      return (
                        <div key={key} className={`day-col day-col--${state}`}>
                          <span className="day-col__wd">{l.weekday}</span>
                          <span className="day-col__num">{l.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  {dailyTasks.map((t) => (
                    <div key={t.id} className="task-table__row">
                      <div className="task-table__task">
                        <span className="task-table__name">
                          {t.name}
                          {t.scope === "servidor" && <Badge kind="server" />}
                        </span>
                        <span className="task-table__desc">{describe(t, selected.member)}</span>
                      </div>
                      {days.map((key, i) => {
                        const l = dayLabel(key);
                        return (
                          <div key={key} className="task-table__cell">
                            <CheckCell state={cellState(checks, t, selected, days, i, todayIndex)} label={`${t.name}, ${l.weekday} ${l.day}`} onToggle={() => toggleCheck(dayCheckKey(t, selected, key))} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          <Panel label="Tarefas semanais">
            <SectionTitle aside={`${prog.weeklyDone} de ${prog.weeklyTotal} concluídas`}>Semanais de {selected.name}</SectionTitle>
            {weeklyTasks.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-soft)" }}>Nenhuma tarefa semanal ligada.</p>
            ) : (
              <div className="weekly-grid">
                {weeklyTasks.map((t) => {
                  const key = weekCheckKey(t, selected, weekKey);
                  return <WeeklyCard key={t.id} name={t.name} note={describe(t, selected.member)} done={!!checks[key]} server={t.scope === "servidor"} expiring={lastDay} onToggle={() => toggleCheck(key)} />;
                })}
              </div>
            )}
          </Panel>
        </div>

        <aside aria-label="Resumo" style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel label="Progresso da semana">
            <SectionTitle>Progresso da semana</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <ProgressRing value={prog.percent} caption={selected.name} />
              <dl className="stat-list">
                <dt>Hoje</dt>
                <dd>
                  {prog.doneToday} / {prog.totalToday}
                </dd>
                <dt>Diárias perdidas</dt>
                <dd style={{ color: prog.missed ? "#e7a0aa" : undefined }}>{prog.missed}</dd>
                <dt>Semanais pendentes</dt>
                <dd style={{ color: prog.weeklyTotal - prog.weeklyDone ? "#f0c86a" : undefined }}>{prog.weeklyTotal - prog.weeklyDone}</dd>
              </dl>
              <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>O progresso conta só os dias até hoje e as semanais.</span>
            </div>
          </Panel>

          <Panel label="Atenção">
            <SectionTitle>Atenção</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {toWeekly < 86_400_000 ? (
                <Alert kind="danger">Semanais expiram no reset de {localResetLabel(clock.nextWeekly)} (em {formatCountdown(toWeekly)}).</Alert>
              ) : (
                <Alert kind="info">Reset semanal em {formatCountdown(toWeekly)} ({localResetLabel(clock.nextWeekly)}).</Alert>
              )}
              <Alert kind="warning">Odyle Energy: não deixe a barra encher, ela para de regenerar.</Alert>
              <Alert kind="info">Sempre pegue o cubo ao limpar Conquest ou Transcendence: sair sem ele também gasta a cota do servidor.</Alert>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
