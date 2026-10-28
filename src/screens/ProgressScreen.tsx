// Aba Progresso: visão geral de todos os personagens, só para conferir.
// Dois blocos separados: "Hoje" (diárias, vira às 04:00) e "Esta semana" (semanais e compras, vira na quarta).
// As marcações são feitas na aba Personagem; clicar num personagem abre a aba dele.
import { Alert, Badge, Button, CharPortrait, Panel, ProgressBar, SectionTitle } from "../components/ui";
import { isEnabled, progressFor } from "../components/WeekView";
import { isPurchase, occursOn } from "../data/catalog";
import { activeTasks, dayCheckKey, isWeekly, weekCheckKey } from "../data/checks";
import type { Character } from "../data/model";
import { useStore } from "../data/store";
import type { TaskDef } from "../data/types";
import { dayLabel, formatCountdown, gameWeekday, localResetLabel } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";

const FULL_WEEKDAY: Record<string, string> = { DOM: "Domingo", SEG: "Segunda", TER: "Terça", QUA: "Quarta", QUI: "Quinta", SEX: "Sexta", SÁB: "Sábado" };

type Item = { task: TaskDef; done: boolean };

interface Row {
  char: Character;
  daily: Item[];
  weekly: Item[];
  purchases: Item[];
}

const count = (items: Item[]) => items.filter((i) => i.done).length;
const pct = (done: number, total: number) => (total ? (done / total) * 100 : 100);

function Pending({ items, doneText, emptyText, withShop }: { items: Item[]; doneText: string; emptyText: string; withShop?: boolean }) {
  if (!items.length) return <span className="progress-row__none">{emptyText}</span>;
  const left = items.filter((i) => !i.done);
  if (!left.length) return <span className="progress-row__ok">{doneText}</span>;
  return (
    <span className="progress-row__chips">
      {left.map(({ task }) => (
        <span key={task.id} className={`chip ${task.scope === "servidor" ? "chip--server" : ""}`} title={task.scope === "servidor" ? "Tarefa de servidor" : undefined}>
          {task.name}
          {withShop && task.shop && <span className="chip__shop">{task.shop}</span>}
        </span>
      ))}
    </span>
  );
}

function Who({ char, onOpen }: { char: Character; onOpen: () => void }) {
  return (
    <button type="button" className="progress-row__who" onClick={onOpen} title={`Abrir ${char.name} na aba Personagem`}>
      <CharPortrait photo={char.photo} name={char.name} size={36} />
      <span className="progress-row__name">{char.name}</span>
      <Badge kind={char.role === "MAIN" ? "main" : "alt"} />
    </button>
  );
}

export function ProgressScreen({ clock, onGoToCharacters, onOpenCharacter }: { clock: GameClock; onGoToCharacters: () => void; onOpenCharacter: (id: string) => void }) {
  const { characters, data, catalog } = useStore();
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
            <span style={{ fontSize: 16, color: "var(--text)" }}>Cadastre seus personagens para ver o progresso.</span>
            <Button variant="primary" onClick={onGoToCharacters}>
              Ir para Cadastro
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  const rows: Row[] = characters.map((char) => {
    const tasks = activeTasks(catalog, char, isEnabled);
    return {
      char,
      daily: tasks.filter((t) => !isWeekly(t) && occursOn(t, weekday)).map((task) => ({ task, done: !!checks[dayCheckKey(task, char, clock.todayKey)] })),
      weekly: tasks.filter((t) => isWeekly(t) && !isPurchase(t)).map((task) => ({ task, done: !!checks[weekCheckKey(task, char, clock.weekKey)] })),
      purchases: tasks.filter(isPurchase).map((task) => ({ task, done: !!checks[weekCheckKey(task, char, clock.weekKey)] })),
    };
  });
  const week = progressFor(catalog, characters, checks, clock.days, clock.todayIndex, clock.weekKey);

  const sum = (f: (r: Row) => Item[]) => rows.reduce((a, r) => ({ done: a.done + count(f(r)), total: a.total + f(r).length }), { done: 0, total: 0 });
  const dailyAll = sum((r) => r.daily);
  const weeklyAll = sum((r) => r.weekly);
  const purchaseAll = sum((r) => r.purchases);
  const avgWeek = Math.round(characters.reduce((n, c) => n + (week[c.id]?.percent ?? 0), 0) / characters.length);
  const today = dayLabel(clock.todayKey);
  const weeklyLeft = weeklyAll.total - weeklyAll.done;
  const purchasesLeft = purchaseAll.total - purchaseAll.done;

  return (
    <div className="page">
      <div className="progress-top">
        <Panel label="Hoje">
          <div className="progress-kpi">
            <span className="progress-kpi__label">Hoje · {FULL_WEEKDAY[today.weekday]}, {today.day} {today.month}</span>
            <span className="progress-kpi__value">
              {dailyAll.done}<small>/{dailyAll.total}</small>
            </span>
            <span className="progress-kpi__hint">diárias feitas · vira em {formatCountdown(toDaily)}</span>
          </div>
        </Panel>
        <Panel label="Semana">
          <div className="progress-kpi">
            <span className="progress-kpi__label">Esta semana</span>
            <span className="progress-kpi__value">
              {avgWeek}
              <small>%</small>
            </span>
            <span className="progress-kpi__hint" style={{ color: toWeekly < 86_400_000 ? "#f2a3ae" : undefined }}>
              média da conta · vira {localResetLabel(clock.nextWeekly)} (em {formatCountdown(toWeekly)})
            </span>
          </div>
        </Panel>
        <Panel label="Pendências da semana">
          <div className="progress-kpi">
            <span className="progress-kpi__label">Pendências da semana</span>
            <span className="progress-kpi__split">
              <span>
                <strong>{weeklyLeft}</strong> semanais
              </span>
              <span>
                <strong>{purchasesLeft}</strong> compras
              </span>
            </span>
            <span className="progress-kpi__hint">somando todos os personagens</span>
          </div>
        </Panel>
      </div>

      {lastDay && weeklyLeft + purchasesLeft > 0 && (
        <Alert kind="danger">
          Último dia da semana: {weeklyLeft} semanais e {purchasesLeft} compras pendentes expiram no reset de {localResetLabel(clock.nextWeekly)}.
        </Alert>
      )}

      <Panel label="Hoje">
        <SectionTitle aside={`Reset diário em ${formatCountdown(toDaily)}`}>Hoje — diárias</SectionTitle>
        <div className="progress-table">
          <div className="progress-row progress-row--head progress-row--day">
            <span>Personagem</span>
            <span>Diárias de hoje</span>
            <span>Faltam</span>
          </div>
          {rows.map(({ char, daily }) => {
            const d = count(daily);
            return (
              <div key={char.id} className="progress-row progress-row--day">
                <Who char={char} onOpen={() => onOpenCharacter(char.id)} />
                <span className="progress-row__bar">
                  <span className="progress-row__num">
                    {d}/{daily.length}
                  </span>
                  <ProgressBar value={pct(d, daily.length)} showLabel={false} />
                </span>
                <Pending items={daily} doneText="✦ Dia completo" emptyText="Nenhuma diária ligada" />
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel label="Esta semana">
        <SectionTitle aside={`Reset semanal ${localResetLabel(clock.nextWeekly)} · em ${formatCountdown(toWeekly)}`}>Esta semana — semanais e compras</SectionTitle>
        <div className="progress-table">
          <div className="progress-row progress-row--head progress-row--week">
            <span>Personagem</span>
            <span>Semana</span>
            <span>Semanais que faltam</span>
            <span>Compras que faltam</span>
          </div>
          {rows.map(({ char, weekly, purchases }) => {
            const p = week[char.id];
            const w = count(weekly);
            const c = count(purchases);
            return (
              <div key={char.id} className="progress-row progress-row--week">
                <Who char={char} onOpen={() => onOpenCharacter(char.id)} />
                <span className="progress-row__bar">
                  <span className="progress-row__num">{p?.percent ?? 0}%</span>
                  <ProgressBar value={p?.percent ?? 0} showLabel={false} />
                  {p && p.missed > 0 && <span className="progress-row__missed">{p.missed} diária{p.missed > 1 ? "s" : ""} perdida{p.missed > 1 ? "s" : ""}</span>}
                </span>
                <span className="progress-row__cell">
                  <span className="progress-row__count">
                    {w}/{weekly.length}
                  </span>
                  <Pending items={weekly} doneText="✦ Todas feitas" emptyText="Nenhuma semanal" />
                </span>
                <span className="progress-row__cell">
                  <span className="progress-row__count">
                    {c}/{purchases.length}
                  </span>
                  <Pending items={purchases} doneText="✦ Todas compradas" emptyText="Nenhuma compra" withShop />
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Clique num personagem para abrir a aba Personagem e marcar as tarefas. As marcadas com borda dourada são de servidor (ficam no main).</p>
    </div>
  );
}
