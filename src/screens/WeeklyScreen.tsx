// Aba Personagem: controle completo de um personagem por vez (semana atual, editável).
import { Alert, Button, Panel, SectionTitle } from "../components/ui";
import { WeekView } from "../components/WeekView";
import { useStore } from "../data/store";
import { formatCountdown, localResetLabel } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";

export function WeeklyScreen({ clock, onGoToCharacters, selectedId, onSelect }: { clock: GameClock; onGoToCharacters: () => void; selectedId: string | null; onSelect: (id: string) => void }) {
  const { characters, main, data, toggleCheck } = useStore();
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();

  if (!characters.length) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <span style={{ fontSize: 16, color: "var(--text)" }}>Cadastre seus personagens para ver as tarefas da semana.</span>
            <Button variant="primary" onClick={onGoToCharacters}>
              Ir para Cadastro
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="page">
      <WeekView
        characters={characters}
        main={main}
        checks={data.checks}
        days={clock.days}
        weekKey={clock.weekKey}
        todayIndex={clock.todayIndex}
        onToggle={toggleCheck}
        weeklyExpiring={clock.todayIndex === 6}
        selectedId={selectedId}
        onSelect={onSelect}
        sideExtra={
          <Panel label="Atenção">
            <SectionTitle>Atenção</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {toWeekly < 86_400_000 ? (
                <Alert kind="danger">
                  Semanais expiram no reset de {localResetLabel(clock.nextWeekly)} (em {formatCountdown(toWeekly)}).
                </Alert>
              ) : (
                <Alert kind="info">
                  Reset semanal em {formatCountdown(toWeekly)} ({localResetLabel(clock.nextWeekly)}).
                </Alert>
              )}
              <Alert kind="warning">Odyle Energy: não deixe a barra encher, ela para de regenerar.</Alert>
              <Alert kind="info">Sempre pegue o cubo ao limpar Conquest ou Transcendence: sair sem ele também gasta a cota do servidor.</Alert>
            </div>
          </Panel>
        }
      />
    </div>
  );
}
