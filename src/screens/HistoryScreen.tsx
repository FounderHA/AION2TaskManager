// Etapa 11: aba Histórico — semanas já encerradas, somente leitura.
import { useMemo, useState } from "react";
import { Button, Panel, ProgressBar, SectionTitle } from "../components/ui";
import { progressFor, WeekView } from "../components/WeekView";
import { earliestCheckDay, existedInWeek } from "../data/checks";
import { useStore } from "../data/store";
import { addDays, gameDayKey, weekDayKeys, weekRangeLabel, weekStartKey } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";

export function HistoryScreen({ clock }: { clock: GameClock }) {
  const { characters, main, data, catalog, reset } = useStore();
  const checks = data.checks;

  // Semanas disponíveis: da primeira com dados até a última já encerrada
  const lastClosed = addDays(clock.weekKey, -7);
  const firstWeek = useMemo(() => {
    const candidates: string[] = [];
    const firstCheck = earliestCheckDay(checks);
    if (firstCheck) candidates.push(weekStartKey(firstCheck, reset));
    for (const c of characters) candidates.push(weekStartKey(gameDayKey(new Date(c.createdAt), reset), reset));
    return candidates.sort()[0] ?? null;
  }, [checks, characters, reset]);

  const [viewWeek, setViewWeek] = useState<string>(lastClosed);
  const hasHistory = !!firstWeek && firstWeek <= lastClosed;
  const week = !hasHistory ? lastClosed : viewWeek > lastClosed ? lastClosed : viewWeek < firstWeek! ? firstWeek! : viewWeek;
  const weekEnd = addDays(week, 6);
  const days = useMemo(() => weekDayKeys(week), [week]);
  const weekChars = useMemo(() => characters.filter((c) => existedInWeek(c, checks, week, weekEnd)), [characters, checks, week, weekEnd]);
  const progress = useMemo(() => progressFor(catalog, weekChars, checks, days, 7, week), [catalog, weekChars, checks, days, week]);

  if (!hasHistory) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <span style={{ fontSize: 16, color: "var(--text)" }}>Ainda não há semanas encerradas.</span>
            <span style={{ fontSize: 14 }}>O histórico começa a aparecer depois do primeiro reset semanal (quarta às 04:00). Tudo o que você marcar na semana atual vai ficar guardado aqui.</span>
          </div>
        </Panel>
      </div>
    );
  }

  const weeksAgo = Math.round((Date.parse(clock.weekKey) - Date.parse(week)) / (7 * 86_400_000));
  const totalPct = weekChars.length ? Math.round(weekChars.reduce((n, c) => n + (progress[c.id]?.percent ?? 0), 0) / weekChars.length) : 0;

  return (
    <div className="page">
      <Panel label="Escolher semana">
        <div className="week-nav">
          <Button variant="ghost" onClick={() => setViewWeek(addDays(week, -7))} disabled={week <= firstWeek!}>
            ← Semana anterior
          </Button>
          <div className="week-nav__title">
            <span className="week-nav__range">Semana {weekRangeLabel(week)}</span>
            <span className="week-nav__sub">
              {weeksAgo === 1 ? "Semana passada" : `Há ${weeksAgo} semanas`} · encerrada · somente leitura
            </span>
          </div>
          <Button variant="ghost" onClick={() => setViewWeek(addDays(week, 7))} disabled={week >= lastClosed}>
            Próxima semana →
          </Button>
        </div>
      </Panel>

      {weekChars.length === 0 ? (
        <Panel>
          <p style={{ margin: 0, color: "var(--text-soft)" }}>Nenhum personagem cadastrado nesta semana.</p>
        </Panel>
      ) : (
        <>
          <Panel label="Resumo da semana">
            <SectionTitle aside={`Média da conta: ${totalPct}%`}>Resumo da semana</SectionTitle>
            <div style={{ overflowX: "auto" }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Personagem</th>
                    <th style={{ width: "30%" }}>Progresso</th>
                    <th>Diárias feitas</th>
                    <th>Diárias perdidas</th>
                    <th>Semanais feitas</th>
                  </tr>
                </thead>
                <tbody>
                  {weekChars.map((c) => {
                    const p = progress[c.id];
                    return (
                      <tr key={c.id}>
                        <td>
                          {c.name} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--text-muted)" }}>{c.role === "MAIN" ? "main" : "alt"}</span>
                        </td>
                        <td>
                          <ProgressBar value={p.percent} />
                        </td>
                        <td>
                          {p.dailyDone} / {p.dailyTotal}
                        </td>
                        <td style={{ color: p.missed ? "#e7a0aa" : undefined }}>{p.missed}</td>
                        <td>
                          {p.weeklyDone} / {p.weeklyTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <WeekView key={week} characters={weekChars} main={main} checks={checks} days={days} weekKey={week} todayIndex={7} readOnly />
        </>
      )}
    </div>
  );
}
