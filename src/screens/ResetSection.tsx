// Etapa 12: horário do reset (dentro da aba Configurações).
import { Alert, Button, Panel, SectionTitle } from "../components/ui";
import { WEEKDAY_SHORT } from "../data/catalog";
import { localHourToUtc, utcHourToLocal } from "../data/settings";
import { useStore } from "../data/store";
import type { Weekday } from "../data/types";
import { DEFAULT_RESET, localResetLabel, nextWeeklyReset } from "../time/gameTime";

const WEEKDAY_FULL: Record<Weekday, string> = { 0: "Domingo", 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado" };

export function ResetSection() {
  const { reset, setReset } = useStore();
  const localHour = utcHourToLocal(reset.utcHour);
  const isDefault = reset.utcHour === DEFAULT_RESET.utcHour && reset.weeklyWeekday === DEFAULT_RESET.weeklyWeekday;

  return (
    <Panel label="Horário do reset">
      <SectionTitle aside={`Próximo reset semanal: ${localResetLabel(nextWeeklyReset(new Date(), reset))}`}>Horário do reset</SectionTitle>
      <p style={{ margin: "0 0 18px", color: "var(--text-soft)", lineHeight: 1.5 }}>
        No Aion 2 Global o dia vira às <strong>04:00 (horário de Brasília)</strong> e a semana na <strong>quarta-feira</strong>. Só mude se o jogo mudar o horário: as marcações já feitas ficam presas aos dias em que foram feitas.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
        <div className="field">
          <label className="field__label" htmlFor="reset-hour">
            Reset diário (hora do seu PC)
          </label>
          <select id="reset-hour" className="select" value={localHour} onChange={(e) => setReset({ ...reset, utcHour: localHourToUtc(Number(e.target.value)) })}>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="reset-day">
            Reset semanal
          </label>
          <select id="reset-day" className="select" value={reset.weeklyWeekday} onChange={(e) => setReset({ ...reset, weeklyWeekday: Number(e.target.value) as Weekday })}>
            {([3, 4, 5, 6, 0, 1, 2] as Weekday[]).map((d) => (
              <option key={d} value={d}>
                {WEEKDAY_FULL[d]} ({WEEKDAY_SHORT[d]})
              </option>
            ))}
          </select>
        </div>
        <Button variant="ghost" disabled={isDefault} onClick={() => setReset({ ...DEFAULT_RESET })}>
          Restaurar padrão (quarta 04:00)
        </Button>
      </div>
      {!isDefault && (
        <div style={{ marginTop: 16 }}>
          <Alert kind="warning">Você está usando um horário diferente do padrão do jogo.</Alert>
        </div>
      )}
    </Panel>
  );
}
