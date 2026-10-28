// Cadastro de personagens: nome, classe, facção, Main/Alt, GS/CP e Odyle Energy inicial.
// Membership é da conta: fica em Configurações.
import { useEffect, useState } from "react";
import { AddCharacterCard, Alert, Badge, Button, CharacterCard, CharPortrait, Panel, SectionTitle } from "../components/ui";
import { CharStats, StatIcon } from "../components/CharStats";
import { pickImage } from "../components/pickImage";
import { CLASSES, NAME_MAX, PHOTO_MAX, type Character, type CharacterClass, type Faction } from "../data/model";
import { useStore } from "../data/store";
import { CHARGED_CAP, currentOdyle, rulesFor, snapshotFromInput, type OdyleRules } from "../data/odyle";

type Mode = { kind: "none" } | { kind: "new" } | { kind: "edit"; id: string };

interface FormState {
  name: string;
  className: CharacterClass;
  faction: Faction;
  makeMain: boolean;
  /** Texto digitado (só dígitos); vazio = não informado. */
  gs: string;
  cp: string;
  /** Odyle Energy atual (vazio = não controlar). */
  basic: string;
  charged: string;
  photo: string | null;
}

const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 9);
const toStat = (v: string): number | null => (v ? Number(v) : null);
const onlyDigits4 = (v: string) => v.replace(/\D/g, "").slice(0, 4);

const blankForm = (faction: Faction = "Elyos"): FormState => ({ name: "", className: "Gladiator", faction, makeMain: false, gs: "", cp: "", basic: "", charged: "", photo: null });
const fromChar = (c: Character, rules: OdyleRules): FormState => {
  const cur = c.odyle ? currentOdyle(c.odyle, rules, new Date()) : null;
  return { name: c.name, className: c.className, faction: c.faction, makeMain: c.role === "MAIN", gs: c.gs === null ? "" : String(c.gs), cp: c.cp === null ? "" : String(c.cp), basic: cur ? String(cur.basic) : "", charged: cur ? String(cur.charged) : "", photo: c.photo };
};

const STATUS_TEXT = { carregando: "Carregando…", salvando: "Salvando…", salvo: "Salvo automaticamente", erro: "Erro ao salvar! Seus dados podem não ter sido gravados." } as const;

export function CharactersScreen() {
  const { characters, main, saveStatus, addCharacter, updateCharacter, setMain, deleteCharacter, data } = useStore();
  const rules = rulesFor(data.settings.odyle, data.settings.membership);
  const [initialOdyle, setInitialOdyle] = useState({ basic: "", charged: "" });
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
    setInitialOdyle({ basic: "", charged: "" });
    setMode({ kind: "new" });
    setTouched(false);
    setConfirmDelete(false);
  };
  const startEdit = (c: Character) => {
    const f = fromChar(c, rules);
    setForm(f);
    setInitialOdyle({ basic: f.basic, charged: f.charged });
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

  // Odyle: os dois vazios = não controlar; um vazio conta como 0.
  const odyleFromForm = () => (form.basic === "" && form.charged === "" ? null : snapshotFromInput(Number(form.basic || 0), Number(form.charged || 0), rules, new Date()));
  const odyleChanged = form.basic !== initialOdyle.basic || form.charged !== initialOdyle.charged;

  const save = () => {
    setTouched(true);
    if (nameError) return;
    if (mode.kind === "new") {
      addCharacter({ name: nameTrim, className: form.className, faction: form.faction, makeMain: form.makeMain, gs: toStat(form.gs), cp: toStat(form.cp), odyle: odyleFromForm(), photo: form.photo });
      close();
    } else if (editing) {
      updateCharacter(editing.id, { name: nameTrim, className: form.className, faction: form.faction, gs: toStat(form.gs), cp: toStat(form.cp), photo: form.photo, ...(odyleChanged ? { odyle: odyleFromForm() } : {}) });
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

  const [photoError, setPhotoError] = useState("");
  const choosePhoto = async () => {
    setPhotoError("");
    try {
      const url = await pickImage({ size: 160, fit: "cover", type: "image/jpeg" });
      if (!url) return;
      if (url.length >= PHOTO_MAX) setPhotoError("Imagem grande demais, tente outra.");
      else set("photo", url);
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : String(e));
    }
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
              <CharacterCard key={c.id} data={c} stats={<CharStats gs={c.gs} cp={c.cp} />} selected={mode.kind === "edit" && mode.id === c.id} onSelect={() => startEdit(c)} footer="Clique para editar" />
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
            <div className="photo-field">
              <CharPortrait photo={form.photo} name={form.name || "personagem"} size={88} />
              <div className="photo-field__side">
                <span className="field__label">Foto do personagem</span>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button type="button" variant="secondary" onClick={choosePhoto}>
                    {form.photo ? "Trocar foto" : "Escolher foto"}
                  </Button>
                  {form.photo && (
                    <Button type="button" variant="ghost" onClick={() => set("photo", null)}>
                      Remover
                    </Button>
                  )}
                </div>
                {photoError ? <span className="field__error">{photoError}</span> : <span className="field__hint">Um print do personagem, por exemplo. A imagem é cortada em quadrado e fica salva só no seu PC.</span>}
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="char-name">
                Nome
              </label>
              <input id="char-name" className={`input ${touched && nameError ? "input--invalid" : ""}`} value={form.name} maxLength={NAME_MAX} autoFocus placeholder="Nome do personagem no jogo" onChange={(e) => set("name", e.target.value)} />
              {touched && nameError ? <span className="field__error">{nameError}</span> : <span className="field__hint">Até {NAME_MAX} caracteres.</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              <div className="field">
                <label className="field__label" htmlFor="char-gs">
                  GS (Gear Score)
                </label>
                <div className="input-with-icon">
                  <StatIcon which="gs" size={20} />
                  <input id="char-gs" className="input" inputMode="numeric" value={form.gs} placeholder="Ex.: 2673" onChange={(e) => set("gs", onlyDigits(e.target.value))} />
                </div>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="char-cp">
                  CP (Combat Power)
                </label>
                <div className="input-with-icon">
                  <StatIcon which="cp" size={20} />
                  <input id="char-cp" className="input" inputMode="numeric" value={form.cp} placeholder="Ex.: 152700" onChange={(e) => set("cp", onlyDigits(e.target.value))} />
                </div>
                <span className="field__hint">Digite o número inteiro; o card mostra no formato do jogo (152.7K).</span>
              </div>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              <div className="field">
                <label className="field__label" htmlFor="char-basic">
                  Odyle Energy — Basic (agora)
                </label>
                <input id="char-basic" className="input" inputMode="numeric" value={form.basic} placeholder={`0 a ${rules.cap}`} onChange={(e) => set("basic", onlyDigits4(e.target.value))} />
                <span className="field__hint">O valor que aparece no jogo agora. A partir dele o app soma +{rules.rate} a cada recarga (limite {rules.cap}).</span>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="char-charged">
                  Odyle Energy — Charged (agora)
                </label>
                <input id="char-charged" className="input" inputMode="numeric" value={form.charged} placeholder={`0 a ${CHARGED_CAP}`} onChange={(e) => set("charged", onlyDigits4(e.target.value))} />
                <span className="field__hint">Energia extra dos itens (até {CHARGED_CAP}). Deixe os dois vazios para não controlar este personagem.</span>
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
