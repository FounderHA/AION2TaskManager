// Cadastro de personagens: nome, classe, facção, Main/Alt e Membership.
import { useEffect, useState } from "react";
import { AddCharacterCard, Alert, Badge, Button, CharacterCard, Panel, SectionTitle } from "../components/ui";
import { CLASSES, NAME_MAX, type Character, type CharacterClass, type Faction } from "../data/model";
import { useStore } from "../data/store";

type Mode = { kind: "none" } | { kind: "new" } | { kind: "edit"; id: string };

interface FormState {
  name: string;
  className: CharacterClass;
  faction: Faction;
  member: boolean;
  makeMain: boolean;
}

const blankForm = (faction: Faction = "Elyos"): FormState => ({ name: "", className: "Gladiator", faction, member: false, makeMain: false });
const fromChar = (c: Character): FormState => ({ name: c.name, className: c.className, faction: c.faction, member: c.member, makeMain: c.role === "MAIN" });

const STATUS_TEXT = { carregando: "Carregando…", salvando: "Salvando…", salvo: "Salvo automaticamente", erro: "Erro ao salvar! Seus dados podem não ter sido gravados." } as const;

export function CharactersScreen() {
  const { characters, main, saveStatus, addCharacter, updateCharacter, setMain, deleteCharacter } = useStore();
  const [mode, setMode] = useState<Mode>({ kind: "none" });
  const [form, setForm] = useState<FormState>(blankForm());
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const editing = mode.kind === "edit" ? characters.find((c) => c.id === mode.id) : undefined;
  const isFirst = characters.length === 0;

  // Se o personagem em edição sumir (excluído), fecha o formulário
  useEffect(() => {
    if (mode.kind === "edit" && !editing) setMode({ kind: "none" });
  }, [mode, editing]);

  const startNew = () => {
    setForm(blankForm(main?.faction ?? "Elyos"));
    setMode({ kind: "new" });
    setTouched(false);
    setConfirmDelete(false);
  };
  const startEdit = (c: Character) => {
    setForm(fromChar(c));
    setMode({ kind: "edit", id: c.id });
    setTouched(false);
    setConfirmDelete(false);
  };
  const close = () => {
    setMode({ kind: "none" });
    setConfirmDelete(false);
  };

  const nameTrim = form.name.trim();
  const duplicate = characters.some((c) => c.name.toLowerCase() === nameTrim.toLowerCase() && c.id !== editing?.id);
  const nameError = !nameTrim ? "Digite o nome do personagem." : duplicate ? "Já existe um personagem com esse nome." : "";

  const save = () => {
    setTouched(true);
    if (nameError) return;
    if (mode.kind === "new") {
      addCharacter({ name: nameTrim, className: form.className, faction: form.faction, member: form.member, makeMain: form.makeMain });
      close();
    } else if (editing) {
      updateCharacter(editing.id, { name: nameTrim, className: form.className, faction: form.faction, member: form.member });
      if (form.makeMain && editing.role !== "MAIN") setMain(editing.id);
      close();
    }
  };

  const remove = () => {
    if (!editing) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteCharacter(editing.id);
    close();
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const showForm = mode.kind !== "none";

  return (
    <div className="page">
      <Panel label="Seus personagens">
        <SectionTitle aside={<span className={`save-status ${saveStatus === "erro" ? "save-status--erro" : ""}`}>{STATUS_TEXT[saveStatus]}</span>}>Seus personagens</SectionTitle>
        {isFirst && mode.kind !== "new" ? (
          <div className="empty-state">
            <span style={{ fontSize: 16, color: "var(--text)" }}>Nenhum personagem cadastrado ainda.</span>
            <span style={{ fontSize: 14 }}>Comece pelo seu main. Ele faz o conteúdo de servidor; os alts fazem só o conteúdo de personagem.</span>
            <Button variant="primary" onClick={startNew}>
              Cadastrar primeiro personagem
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {characters.map((c) => (
              <CharacterCard key={c.id} data={c} selected={mode.kind === "edit" && mode.id === c.id} onSelect={() => startEdit(c)} footer="Clique para editar" />
            ))}
            <AddCharacterCard onClick={startNew} />
          </div>
        )}
      </Panel>

      {showForm && (
        <Panel label="Formulário do personagem">
          <SectionTitle aside={editing ? <Badge kind={editing.role === "MAIN" ? "main" : "alt"} /> : undefined}>{mode.kind === "new" ? "Novo personagem" : `Editar ${editing?.name ?? ""}`}</SectionTitle>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="field">
              <label className="field__label" htmlFor="char-name">
                Nome
              </label>
              <input id="char-name" className={`input ${touched && nameError ? "input--invalid" : ""}`} value={form.name} maxLength={NAME_MAX} autoFocus placeholder="Nome do personagem no jogo" onChange={(e) => set("name", e.target.value)} />
              {touched && nameError ? <span className="field__error">{nameError}</span> : <span className="field__hint">Até {NAME_MAX} caracteres.</span>}
            </div>

            <div className="field">
              <span className="field__label">Classe</span>
              <div className="choice-grid" role="group" aria-label="Classe">
                {CLASSES.map((cl) => (
                  <button type="button" key={cl} className="choice" aria-pressed={form.className === cl} onClick={() => set("className", cl)}>
                    {cl}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              <div className="field">
                <span className="field__label">Facção</span>
                <div className="choice-grid choice-grid--2" role="group" aria-label="Facção">
                  {(["Elyos", "Asmodian"] as Faction[]).map((f) => (
                    <button type="button" key={f} className="choice" aria-pressed={form.faction === f} onClick={() => set("faction", f)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span className="field__label">Membership</span>
                <div className="choice-grid choice-grid--2" role="group" aria-label="Membership">
                  <button type="button" className="choice" aria-pressed={!form.member} onClick={() => set("member", false)}>
                    Sem
                  </button>
                  <button type="button" className="choice" aria-pressed={form.member} onClick={() => set("member", true)}>
                    Com
                  </button>
                </div>
                <span className="field__hint">Muda os limites mostrados (Abyss 14h, Odyle 840).</span>
              </div>

              <div className="field">
                <span className="field__label">Papel</span>
                {isFirst || editing?.role === "MAIN" ? (
                  <>
                    <div className="choice-grid choice-grid--2">
                      <button type="button" className="choice" aria-pressed={true} disabled>
                        Main
                      </button>
                      <button type="button" className="choice" aria-pressed={false} disabled>
                        Alt
                      </button>
                    </div>
                    <span className="field__hint">{isFirst ? "O primeiro personagem é sempre o main." : "Para trocar o main, edite outro personagem e escolha Main."}</span>
                  </>
                ) : (
                  <>
                    <div className="choice-grid choice-grid--2" role="group" aria-label="Papel">
                      <button type="button" className="choice" aria-pressed={form.makeMain} onClick={() => set("makeMain", true)}>
                        Main
                      </button>
                      <button type="button" className="choice" aria-pressed={!form.makeMain} onClick={() => set("makeMain", false)}>
                        Alt
                      </button>
                    </div>
                    <span className="field__hint">{form.makeMain && main ? `${main.name} deixa de ser main e vira alt.` : "O conteúdo de servidor fica só no main."}</span>
                  </>
                )}
              </div>
            </div>

            {confirmDelete && editing && (
              <Alert kind="danger">
                Excluir <strong>{editing.name}</strong>? Clique em "Confirmar exclusão" para apagar. {editing.role === "MAIN" && characters.length > 1 ? "O alt mais antigo vira o novo main." : ""}
              </Alert>
            )}

            <div className="form__actions">
              <Button type="submit" variant="primary">
                {mode.kind === "new" ? "Cadastrar" : "Salvar alterações"}
              </Button>
              <Button type="button" variant="ghost" onClick={close}>
                Cancelar
              </Button>
              <span className="form__spacer" />
              {editing && (
                <Button type="button" variant="danger" onClick={remove}>
                  {confirmDelete ? "Confirmar exclusão" : "Excluir personagem"}
                </Button>
              )}
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
