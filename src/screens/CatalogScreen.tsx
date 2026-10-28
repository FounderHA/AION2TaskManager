// Etapa 4: conferência do catálogo de tarefas.
// Mostra todas as tarefas agrupadas e simula o que um main ou um alt veria.
// Na Etapa 12 esta tela vira o editor de tarefas (ligar/desligar, editar, criar).
import { useState } from "react";
import { Alert, Badge, Panel, SectionTitle } from "../components/ui";
import { CADENCE_LABEL, DEFAULT_CATALOG, describe, tasksForRole, WEEKDAY_SHORT } from "../data/catalog";
import type { CharacterRole, TaskCadence, TaskDef } from "../data/types";

const GROUPS: { title: string; cadences: TaskCadence[] }[] = [
  { title: "Diárias", cadences: ["diaria", "ritmo"] },
  { title: "Semanais", cadences: ["semanal"] },
  { title: "Eventos em dias fixos", cadences: ["dias-fixos"] },
];

function TaskRow({ task, member }: { task: TaskDef; member: boolean }) {
  return (
    <div className={`catalog-row ${task.enabledByDefault ? "" : "catalog-row--off"}`}>
      <span className="catalog-row__name">{task.name}</span>
      <span className="catalog-row__desc">
        {describe(task, member)}
        {task.days && ` · ${task.days.map((d) => WEEKDAY_SHORT[d]).join(", ")}${task.time ? `, ${task.time}` : ""}`}
      </span>
      <span className="catalog-row__tags">
        {task.cadence === "ritmo" && <Badge kind="neutral">RITMO DIÁRIO</Badge>}
        {task.scope === "servidor" && <Badge kind="server" />}
        <Badge kind={task.enabledByDefault ? "on" : "off"} />
      </span>
    </div>
  );
}

export function CatalogScreen() {
  const [role, setRole] = useState<CharacterRole>("MAIN");
  const [member, setMember] = useState(false);

  const visible = tasksForRole(DEFAULT_CATALOG, role);
  const enabled = visible.filter((t) => t.enabledByDefault);
  const hiddenServer = DEFAULT_CATALOG.length - visible.length;

  return (
    <div className="page">
      <Panel label="Prévia">
        <SectionTitle aside={`${visible.length} tarefas visíveis · ${enabled.length} ligadas por padrão`}>Catálogo de tarefas</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Ver como</span>
            <div className="segmented" role="group" aria-label="Papel do personagem">
              <button aria-pressed={role === "MAIN"} onClick={() => setRole("MAIN")}>
                Main
              </button>
              <button aria-pressed={role === "ALT"} onClick={() => setRole("ALT")}>
                Alt
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Membership</span>
            <div className="segmented" role="group" aria-label="Membership">
              <button aria-pressed={!member} onClick={() => setMember(false)}>
                Sem
              </button>
              <button aria-pressed={member} onClick={() => setMember(true)}>
                Com
              </button>
            </div>
          </div>
        </div>
        {role === "ALT" && (
          <div style={{ marginTop: 16 }}>
            <Alert kind="info">Um alt não vê as {hiddenServer} tarefas de servidor: elas ficam só no main.</Alert>
          </div>
        )}
      </Panel>

      {GROUPS.map((g) => {
        const items = visible.filter((t) => g.cadences.includes(t.cadence));
        if (!items.length) return null;
        return (
          <Panel key={g.title} label={g.title}>
            <SectionTitle aside={`${items.length} tarefas`}>{g.title}</SectionTitle>
            {items.map((t) => (
              <TaskRow key={t.id} task={t} member={member} />
            ))}
          </Panel>
        );
      })}

      <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
        Legenda: {Object.values(CADENCE_LABEL).join(" · ")}. Tarefas desligadas aparecem apagadas e poderão ser ligadas na tela de Configurações (Etapa 12).
      </p>
    </div>
  );
}
