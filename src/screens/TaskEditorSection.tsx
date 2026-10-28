// Etapa 12: editor de tarefas (dentro da aba Configurações).
// Ligar/desligar, editar descrição, criar e excluir tarefas próprias.
import { useState } from "react";
import { Alert, Badge, Button, Panel, SectionTitle, Switch } from "../components/ui";
import { WEEKDAY_SHORT } from "../data/catalog";
import { TASK_DESC_MAX, TASK_NAME_MAX, type ResolvedTask } from "../data/settings";
import { useStore } from "../data/store";
import type { TaskCadence, TaskScope, Weekday } from "../data/types";

const GROUPS: { title: string; cadences: TaskCadence[]; hint: string }[] = [
  { title: "Diárias", cadences: ["diaria", "ritmo"], hint: "Um check por dia" },
  { title: "Semanais", cadences: ["semanal"], hint: "Um check por semana" },
  { title: "Eventos em dias fixos", cadences: ["dias-fixos"], hint: "Um check só nos dias do evento" },
];

// Ordem da semana do jogo: quarta → terça
const WEEK_ORDER: Weekday[] = [3, 4, 5, 6, 0, 1, 2];

function TaskRow({ task }: { task: ResolvedTask }) {
  const { setTaskEnabled, setTaskDescription, deleteCustomTask } = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.description);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    setTaskDescription(task.id, text);
    setEditing(false);
  };

  return (
    <div className={`task-edit-row ${task.enabled ? "" : "task-edit-row--off"}`}>
      <Switch checked={task.enabled} onChange={(v) => setTaskEnabled(task.id, v)} label={`${task.enabled ? "Desligar" : "Ligar"} ${task.name}`} />
      <span className="task-edit-row__name">
        {task.name}
        {task.scope === "servidor" && <Badge kind="server" />}
        {task.custom && <Badge kind="custom" />}
      </span>
      {editing ? (
        <input
          className="input input--small"
          value={text}
          maxLength={TASK_DESC_MAX}
          autoFocus
          aria-label={`Descrição de ${task.name}`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <span className="task-edit-row__desc">
          {task.description || <em style={{ opacity: 0.6 }}>sem descrição</em>}
          {task.days && ` · ${task.days.map((d) => WEEKDAY_SHORT[d]).join(", ")}`}
          {task.descriptionEdited && !task.custom && <span style={{ color: "var(--text-muted)" }}> (editada)</span>}
        </span>
      )}
      <span className="task-edit-row__actions">
        {editing ? (
          <>
            <Button variant="primary" className="btn--small" onClick={save}>
              Salvar
            </Button>
            {task.descriptionEdited && !task.custom && (
              <Button
                variant="ghost"
                className="btn--small"
                onClick={() => {
                  setTaskDescription(task.id, null);
                  setEditing(false);
                }}
              >
                Restaurar padrão
              </Button>
            )}
            <Button variant="ghost" className="btn--small" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="btn--small"
              onClick={() => {
                setText(task.description);
                setEditing(true);
                setConfirmDelete(false);
              }}
            >
              Editar
            </Button>
            {task.custom && (
              <Button variant="danger" className="btn--small" onClick={() => (confirmDelete ? deleteCustomTask(task.id) : setConfirmDelete(true))} onBlur={() => setConfirmDelete(false)}>
                {confirmDelete ? "Confirmar" : "Excluir"}
              </Button>
            )}
          </>
        )}
      </span>
    </div>
  );
}

function NewTaskForm({ onClose }: { onClose: () => void }) {
  const { addCustomTask } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<TaskScope>("personagem");
  const [cadence, setCadence] = useState<TaskCadence>("diaria");
  const [days, setDays] = useState<Weekday[]>([]);
  const [touched, setTouched] = useState(false);

  const nameError = !name.trim() ? "Digite o nome da tarefa." : "";
  const daysError = cadence === "dias-fixos" && days.length === 0 ? "Escolha pelo menos um dia." : "";

  const save = () => {
    setTouched(true);
    if (nameError || daysError) return;
    addCustomTask({ name, description, scope, cadence, category: "eventos", days: cadence === "dias-fixos" ? [...days].sort() : undefined });
    onClose();
  };

  const toggleDay = (d: Weekday) => setDays((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]));

  return (
    <div className="panel" style={{ padding: 20, marginBottom: 8 }}>
      <SectionTitle>Nova tarefa</SectionTitle>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          <div className="field">
            <label className="field__label" htmlFor="task-name">
              Nome
            </label>
            <input id="task-name" className={`input ${touched && nameError ? "input--invalid" : ""}`} value={name} maxLength={TASK_NAME_MAX} autoFocus placeholder="Ex.: Evento de Halloween" onChange={(e) => setName(e.target.value)} />
            {touched && nameError && <span className="field__error">{nameError}</span>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="task-desc">
              Descrição (opcional)
            </label>
            <input id="task-desc" className="input" value={description} maxLength={TASK_DESC_MAX} placeholder="Ex.: Trocar abóboras na loja do evento" onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          <div className="field">
            <span className="field__label">Quem faz</span>
            <div className="choice-grid choice-grid--2" role="group" aria-label="Quem faz">
              <button type="button" className="choice" aria-pressed={scope === "personagem"} onClick={() => setScope("personagem")}>
                Cada personagem
              </button>
              <button type="button" className="choice" aria-pressed={scope === "servidor"} onClick={() => setScope("servidor")}>
                Só o main
              </button>
            </div>
            <span className="field__hint">{scope === "servidor" ? "Conteúdo de servidor: aparece só no main." : "Aparece no main e em todos os alts."}</span>
          </div>
          <div className="field">
            <span className="field__label">Frequência</span>
            <div className="choice-grid choice-grid--3" role="group" aria-label="Frequência">
              <button type="button" className="choice" aria-pressed={cadence === "diaria"} onClick={() => setCadence("diaria")}>
                Diária
              </button>
              <button type="button" className="choice" aria-pressed={cadence === "semanal"} onClick={() => setCadence("semanal")}>
                Semanal
              </button>
              <button type="button" className="choice" aria-pressed={cadence === "dias-fixos"} onClick={() => setCadence("dias-fixos")}>
                Dias fixos
              </button>
            </div>
          </div>
        </div>

        {cadence === "dias-fixos" && (
          <div className="field">
            <span className="field__label">Dias</span>
            <div className="choice-grid choice-grid--7" role="group" aria-label="Dias">
              {WEEK_ORDER.map((d) => (
                <button type="button" key={d} className="choice" aria-pressed={days.includes(d)} onClick={() => toggleDay(d)}>
                  {WEEKDAY_SHORT[d]}
                </button>
              ))}
            </div>
            {touched && daysError && <span className="field__error">{daysError}</span>}
          </div>
        )}

        <div className="form__actions">
          <Button type="submit" variant="primary">
            Criar tarefa
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export function TaskEditorSection() {
  const { catalog } = useStore();
  const [creating, setCreating] = useState(false);
  const enabledCount = catalog.filter((t) => t.enabled).length;

  return (
    <Panel label="Tarefas">
      <SectionTitle aside={`${enabledCount} de ${catalog.length} ligadas`}>Tarefas</SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: "var(--text-soft)", maxWidth: 720, lineHeight: 1.5 }}>
          Ligue só o que você faz. Tarefas desligadas somem das abas Semana, Hoje e Histórico (as marcações antigas continuam guardadas). Use <strong>Editar</strong> para mudar a descrição, ou crie tarefas suas para eventos novos do jogo.
        </span>
        {!creating && (
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Nova tarefa
          </Button>
        )}
      </div>

      {creating && <NewTaskForm onClose={() => setCreating(false)} />}

      {GROUPS.map((g) => {
        const items = catalog.filter((t) => g.cadences.includes(t.cadence));
        if (!items.length) return null;
        return (
          <div key={g.title} style={{ marginTop: 22 }}>
            <div className="today-char__sub">
              <span>{g.title}</span>
              <span>{g.hint}</span>
            </div>
            {items.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        );
      })}

      {enabledCount === 0 && (
        <div style={{ marginTop: 16 }}>
          <Alert kind="warning">Todas as tarefas estão desligadas: as abas Semana e Hoje vão ficar vazias.</Alert>
        </div>
      )}
    </Panel>
  );
}
