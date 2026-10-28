import { Badge, ProgressBar } from "./Basics";
import { CheckIcon, CrossIcon } from "./icons";

/* ---------- Check de um dia da semana ----------
   done:   dourado (concluída)
   today:  ciano (pendente hoje)
   missed: tracejado (dia passado não feito; ainda pode marcar)
   future: neutro e desativado (dia que ainda não chegou)
   none:   sem quadrado (evento que não acontece nesse dia) */
export type CellState = "done" | "today" | "missed" | "future" | "none";

export function CheckCell({ state, label, onToggle }: { state: CellState; label: string; onToggle: () => void }) {
  if (state === "none") return <span className="check-cell check-cell--none" aria-hidden="true" />;
  const status = state === "done" ? "concluída" : state === "missed" ? "perdida" : state === "today" ? "pendente" : "ainda não chegou";
  return (
    <button className={`check-cell check-cell--${state}`} aria-pressed={state === "done"} aria-label={`${label}, ${status}`} disabled={state === "future"} onClick={onToggle}>
      {state === "done" && <CheckIcon />}
      {state === "missed" && <CrossIcon />}
    </button>
  );
}

/* ---------- Card de tarefa semanal ---------- */
export function WeeklyCard({ name, note, done, server, expiring, onToggle }: { name: string; note: string; done: boolean; server?: boolean; expiring?: boolean; onToggle: () => void }) {
  return (
    <button className={`weekly-card ${done ? "weekly-card--done" : ""}`} aria-pressed={done} onClick={onToggle}>
      <div className="weekly-card__head">
        <span className="weekly-card__name">{name}</span>
        <span className="weekly-card__box">{done && <CheckIcon size={14} />}</span>
      </div>
      <span className="weekly-card__note">{note}</span>
      <div className="weekly-card__tags">
        {server && <Badge kind="server" />}
        {!done && expiring && <Badge kind="expiring" />}
        {done && <Badge kind="done" />}
      </div>
    </button>
  );
}

/* ---------- Card de personagem ---------- */
export type CharacterCardData = {
  name: string;
  className: string;
  faction: "Elyos" | "Asmodian";
  role: "MAIN" | "ALT";
  member: boolean;
  /** Progresso da semana em %; se omitido, a barra não aparece. */
  progress?: number;
};

export function CharacterCard({ data, selected, onSelect, footer }: { data: CharacterCardData; selected: boolean; onSelect: () => void; footer?: string }) {
  return (
    <button className={`char-card ${selected ? "char-card--selected" : ""}`} aria-pressed={selected} onClick={onSelect}>
      <div className="char-card__top">
        <span className="char-card__name">{data.name}</span>
        <Badge kind={data.role === "MAIN" ? "main" : "alt"} />
      </div>
      <div className="char-card__meta">
        <span>{data.className}</span>
        <span className="char-card__dot">·</span>
        <span>{data.faction}</span>
        {data.member && (
          <>
            <span className="char-card__dot">·</span>
            <span style={{ color: "var(--cyan-light)" }}>Membership</span>
          </>
        )}
      </div>
      {data.progress !== undefined && <ProgressBar value={data.progress} />}
      {footer && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{footer}</span>}
    </button>
  );
}

export function AddCharacterCard({ onClick }: { onClick: () => void }) {
  return (
    <button className="char-card char-card--add" onClick={onClick}>
      <span>+</span>
      Adicionar personagem
    </button>
  );
}

/* ---------- Linha de tarefa grande (aba Hoje) ---------- */
export function TaskToggleRow({ name, note, done, server, expiring, onToggle }: { name: string; note: string; done: boolean; server?: boolean; expiring?: boolean; onToggle: () => void }) {
  return (
    <button className={`task-row ${done ? "task-row--done" : ""}`} aria-pressed={done} onClick={onToggle}>
      <span className="task-row__box">{done && <CheckIcon size={16} />}</span>
      <span className="task-row__text">
        <span className="task-row__name">{name}</span>
        <span className="task-row__note">{note}</span>
      </span>
      <span className="task-row__tags">
        {server && <Badge kind="server" />}
        {!done && expiring && <Badge kind="expiring" />}
      </span>
    </button>
  );
}
