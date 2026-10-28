// Grade de uma semana do jogo para um personagem por vez.
// Usada pela aba Semana (editável) e pela aba Histórico (somente leitura).
import { useMemo, useState, type ReactNode } from "react";
import { CharStats } from "./CharStats";
import { Alert, Badge, CharacterCard, CheckCell, Panel, ProgressRing, SectionTitle, WeeklyCard } from "./ui";
import { describe, groupByShop, isPurchase } from "../data/catalog";
import { activeTasks, cellState, dayCheckKey, isWeekly, weekCheckKey, weekProgress, type Checks, type WeekProgress } from "../data/checks";
import type { Character } from "../data/model";
import type { ResolvedTask } from "../data/settings";
import { useStore } from "../data/store";
import { dayLabel, weekRangeLabel } from "../time/gameTime";

/** Tarefa ligada pelo usuário (aba Configurações). */
export const isEnabled = (t: ResolvedTask) => t.enabled;

export function progressFor(catalog: ResolvedTask[], characters: Character[], checks: Checks, days: string[], todayIndex: number, weekKey: string): Record<string, WeekProgress> {
  const map: Record<string, WeekProgress> = {};
  for (const c of characters) map[c.id] = weekProgress(checks, activeTasks(catalog, c, isEnabled), c, days, todayIndex, weekKey);
  return map;
}

interface WeekViewProps {
  characters: Character[];
  main: Character | undefined;
  checks: Checks;
  days: string[];
  weekKey: string;
  /** Posição de hoje (0–6). Use 7 para uma semana já encerrada. */
  todayIndex: number;
  readOnly?: boolean;
  onToggle?: (key: string) => void;
  /** Selo "EXPIRA HOJE" nas semanais pendentes. */
  weeklyExpiring?: boolean;
  /** Conteúdo extra na coluna lateral (alertas). */
  sideExtra?: ReactNode;
}

export function WeekView({ characters, main, checks, days, weekKey, todayIndex, readOnly, onToggle, weeklyExpiring, sideExtra }: WeekViewProps) {
  const { catalog } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = characters.find((c) => c.id === selectedId) ?? characters.find((c) => c.id === main?.id) ?? characters[0];
  const progress = useMemo(() => progressFor(catalog, characters, checks, days, todayIndex, weekKey), [catalog, characters, checks, days, todayIndex, weekKey]);
  const toggle = onToggle ?? (() => {});

  if (!selected) return null;

  const tasks = activeTasks(catalog, selected, isEnabled);
  const dailyTasks = tasks.filter((t) => !isWeekly(t));
  const weeklyTasks = tasks.filter((t) => isWeekly(t) && !isPurchase(t));
  const purchaseGroups = groupByShop(tasks.filter(isPurchase));
  const prog = progress[selected.id];
  const closed = todayIndex >= 7;

  return (
    <>
      <section aria-label="Personagens" style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {characters.map((c) => (
          <CharacterCard key={c.id} data={{ ...c, progress: progress[c.id]?.percent ?? 0 }} stats={<CharStats gs={c.gs} cp={c.cp} />} selected={c.id === selected.id} onSelect={() => setSelectedId(c.id)} />
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
                        <div key={key} className={`day-col day-col--${closed ? "future" : state}`}>
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
                            <CheckCell state={cellState(checks, t, selected, days, i, todayIndex)} label={`${t.name}, ${l.weekday} ${l.day}`} readOnly={readOnly} onToggle={() => toggle(dayCheckKey(t, selected, key))} />
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
                  return <WeeklyCard key={t.id} name={t.name} note={describe(t, selected.member)} done={!!checks[key]} server={t.scope === "servidor"} expiring={weeklyExpiring} readOnly={readOnly} onToggle={() => toggle(key)} />;
                })}
              </div>
            )}
          </Panel>

          {purchaseGroups.length > 0 && (
            <Panel label="Compras da semana">
              <SectionTitle aside={`${prog.purchaseDone} de ${prog.purchaseTotal} compradas`}>Compras da semana de {selected.name}</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {purchaseGroups.map((g) => (
                  <div key={g.shop}>
                    <div className="today-char__sub" style={{ marginTop: 0 }}>
                      <span>{g.shop}</span>
                    </div>
                    <div className="weekly-grid">
                      {g.items.map((t) => {
                        const key = weekCheckKey(t, selected, weekKey);
                        return <WeeklyCard key={t.id} name={t.name} note={describe(t, selected.member)} done={!!checks[key]} server={t.scope === "servidor"} expiring={weeklyExpiring} readOnly={readOnly} onToggle={() => toggle(key)} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        <aside aria-label="Resumo" style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel label="Progresso da semana">
            <SectionTitle>{closed ? "Resultado da semana" : "Progresso da semana"}</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <ProgressRing value={prog.percent} caption={selected.name} />
              <dl className="stat-list">
                {!closed && (
                  <>
                    <dt>Hoje</dt>
                    <dd>
                      {prog.doneToday} / {prog.totalToday}
                    </dd>
                  </>
                )}
                <dt>Diárias feitas</dt>
                <dd>
                  {prog.dailyDone} / {prog.dailyTotal}
                </dd>
                <dt>Diárias perdidas</dt>
                <dd style={{ color: prog.missed ? "#e7a0aa" : undefined }}>{prog.missed}</dd>
                <dt>{closed ? "Semanais não feitas" : "Semanais pendentes"}</dt>
                <dd style={{ color: prog.weeklyTotal - prog.weeklyDone ? "#f0c86a" : undefined }}>{prog.weeklyTotal - prog.weeklyDone}</dd>
                <dt>{closed ? "Compras não feitas" : "Compras pendentes"}</dt>
                <dd style={{ color: prog.purchaseTotal - prog.purchaseDone ? "#f0c86a" : undefined }}>{prog.purchaseTotal - prog.purchaseDone}</dd>
              </dl>
              {!closed && <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>O progresso conta só os dias até hoje e as semanais.</span>}
            </div>
          </Panel>
          {sideExtra}
        </aside>
      </div>
    </>
  );
}
