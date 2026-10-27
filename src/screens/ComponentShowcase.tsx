// Etapa 3: tela de amostra de todos os componentes visuais e seus estados.
// Será substituída pelas telas reais a partir da Etapa 6.
import { useState } from "react";
import { AddCharacterCard, Alert, Badge, Button, CharacterCard, CheckCell, Panel, ProgressBar, ProgressRing, SectionTitle, WeeklyCard, type CellState, type CharacterCardData } from "../components/ui";

const SAMPLE_CHARS: CharacterCardData[] = [
  { name: "Kaelith", className: "Feiticeiro", faction: "Elyos", role: "MAIN", member: true, progress: 72 },
  { name: "Varos", className: "Gladiador", faction: "Elyos", role: "ALT", member: false, progress: 45 },
  { name: "Lyren", className: "Clériga", faction: "Elyos", role: "ALT", member: true, progress: 18 },
];

const CELL_DEMO: { state: CellState; title: string; text: string }[] = [
  { state: "done", title: "Concluída", text: "Clique para desmarcar" },
  { state: "today", title: "Pendente hoje", text: "Destaque em ciano" },
  { state: "missed", title: "Perdida", text: "Dia passado; ainda dá para marcar" },
  { state: "future", title: "Futuro", text: "Dia que ainda não chegou" },
];

export function ComponentShowcase() {
  const [selected, setSelected] = useState(0);
  const [cells, setCells] = useState<CellState[]>(CELL_DEMO.map((c) => c.state));
  const [weekly, setWeekly] = useState([true, false, false]);
  const [ring, setRing] = useState(64);

  const toggleCell = (i: number) =>
    setCells((prev) => prev.map((s, j) => (j !== i ? s : s === "done" ? CELL_DEMO[i].state === "done" ? "today" : CELL_DEMO[i].state : "done")));

  return (
    <div className="page">
      <Alert kind="info">Tela de amostra da Etapa 3: todos os componentes visuais do app. Os dados são de exemplo.</Alert>

      <Panel label="Personagens">
        <SectionTitle aside="Clique para selecionar">Card de personagem</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {SAMPLE_CHARS.map((c, i) => (
            <CharacterCard key={c.name} data={c} selected={i === selected} onSelect={() => setSelected(i)} />
          ))}
          <AddCharacterCard onClick={() => {}} />
        </div>
      </Panel>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-start" }}>
        <div style={{ flex: "999 1 700px", minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
          <Panel label="Check de dia">
            <SectionTitle aside="Clique para alternar">Check de dia</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 }}>
              {CELL_DEMO.map((c, i) => (
                <div key={c.state} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CheckCell state={cells[i]} label={c.title} onToggle={() => toggleCell(i)} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Cards semanais">
            <SectionTitle aside="Clique para marcar">Card semanal</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              <WeeklyCard name="Ascension Trial" note="3 entradas" done={weekly[0]} expiring onToggle={() => setWeekly((w) => [!w[0], w[1], w[2]])} />
              <WeeklyCard name="Sanctuary: Ludra" note="1 kill do chefe final" done={weekly[1]} expiring onToggle={() => setWeekly((w) => [w[0], !w[1], w[2]])} />
              <WeeklyCard name="Command Scrolls PvE" note="12 compras na capital" done={weekly[2]} server onToggle={() => setWeekly((w) => [w[0], w[1], !w[2]])} />
            </div>
          </Panel>

          <Panel label="Badges e botões">
            <SectionTitle>Badges e botões</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              <Badge kind="main" />
              <Badge kind="alt" />
              <Badge kind="server" />
              <Badge kind="member" />
              <Badge kind="expiring" />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Button variant="primary">Exportar backup</Button>
              <Button variant="secondary">Importar backup</Button>
              <Button variant="ghost">Cancelar</Button>
              <Button variant="danger">Excluir personagem</Button>
              <Button variant="secondary" disabled>
                Desativado
              </Button>
            </div>
          </Panel>
        </div>

        <aside style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel label="Progresso">
            <SectionTitle>Progresso</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <ProgressRing value={ring} caption={SAMPLE_CHARS[selected].name} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="ghost" onClick={() => setRing((r) => Math.max(0, r - 10))}>
                  −10%
                </Button>
                <Button variant="ghost" onClick={() => setRing((r) => Math.min(100, r + 10))}>
                  +10%
                </Button>
              </div>
              <div style={{ width: "100%" }}>
                <ProgressBar value={ring} />
              </div>
            </div>
          </Panel>

          <Panel label="Alertas">
            <SectionTitle>Alertas</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Alert kind="danger">Semanais expiram no reset de quarta às 04:00.</Alert>
              <Alert kind="warning">Odyle Energy: não deixe a barra encher.</Alert>
              <Alert kind="info">Sempre pegue o cubo ao limpar Conquest ou Transcendence.</Alert>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
