// Aba Craft: calculadora de receitas. Você monta a receita com itens da lista,
// informa quantos faltam e o valor de mercado de cada um, e o app soma o total.
import { useMemo, useState } from "react";
import { Alert, Button, Panel, SectionTitle } from "../components/ui";
import { GradeBadge, ItemIcon, RecipeIcon, UnknownItemIcon } from "../components/CraftIcons";
import { formatKinah, lineTotal, NUM_MAX, gradeInfo, ITEM_IMAGE_MAX, ITEM_NAME_MAX, type CraftItem, type RecipeGrade, RECIPE_GRADES, RECIPE_ICONS, RECIPE_NAME_MAX, recipeTotal, type Recipe, type RecipeIconId } from "../data/craft";
import { useStore } from "../data/store";
import { pickImage } from "../components/pickImage";

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const blank = (): Recipe => ({ id: newId(), name: "", icon: "pauldron", grade: "common", lines: [], updatedAt: "" });
const sameRecipe = (a: Recipe, b: Recipe) => a.name === b.name && a.icon === b.icon && a.grade === b.grade && JSON.stringify(a.lines) === JSON.stringify(b.lines);

/** Campo numérico com separador de milhar. */
function NumberField({ value, onChange, label, placeholder }: { value: number; onChange: (n: number) => void; label: string; placeholder?: string }) {
  return (
    <input
      className="input craft-num"
      inputMode="numeric"
      aria-label={label}
      placeholder={placeholder ?? "0"}
      value={value ? formatKinah(value) : ""}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
        onChange(Math.min(NUM_MAX, digits ? Number(digits) : 0));
      }}
    />
  );
}

/** Formulário de item: nome, raridade (cor padrão) e imagem do ícone. */
function ItemEditor({ initial, isNew, usedIn, onSave, onCancel, onDelete }: { initial: CraftItem; isNew: boolean; usedIn: number; onSave: (item: CraftItem) => void; onCancel: () => void; onDelete: () => void }) {
  const [item, setItem] = useState<CraftItem>(initial);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const choose = async () => {
    setError("");
    try {
      const url = await pickImage({ size: 96, fit: "contain" });
      if (!url) return;
      if (url.length >= ITEM_IMAGE_MAX) setError("Imagem grande demais, tente outra.");
      else setItem((i) => ({ ...i, image: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const save = () => {
    const name = item.name.trim();
    if (!name) {
      setError("Dê um nome para o item.");
      return;
    }
    onSave({ ...item, name });
  };
  return (
    <div className="item-editor">
      <div className="item-editor__top">
        <button type="button" className="item-editor__image" onClick={choose} title="Escolher imagem do ícone">
          <ItemIcon item={item} size={64} />
          <span>{item.image ? "Trocar" : "Imagem"}</span>
        </button>
        <div className="field" style={{ flex: 1, minWidth: 0 }}>
          <label className="field__label" htmlFor="item-name">
            Nome do item
          </label>
          <input id="item-name" className="input" value={item.name} maxLength={ITEM_NAME_MAX} autoFocus placeholder="Ex.: Radiant Odyle" style={{ color: gradeInfo(item.rarity).fg }} onChange={(e) => setItem((i) => ({ ...i, name: e.target.value }))} />
        </div>
      </div>
      <div className="grade-picker" role="radiogroup" aria-label="Raridade do item">
        <span className="grade-picker__label">Raridade</span>
        {RECIPE_GRADES.map((g) => (
          <button key={g.id} type="button" role="radio" aria-checked={item.rarity === g.id} className={`grade-picker__opt ${item.rarity === g.id ? "grade-picker__opt--on" : ""}`} onClick={() => setItem((i) => ({ ...i, rarity: g.id as RecipeGrade }))}>
            <GradeBadge grade={g.id} />
          </button>
        ))}
      </div>
      {item.image && (
        <button type="button" className="item-editor__link" onClick={() => setItem((i) => ({ ...i, image: null }))}>
          Remover imagem
        </button>
      )}
      {error && <span className="field__error">{error}</span>}
      {confirmDelete && <span className="field__error">{usedIn ? `Este item está em ${usedIn} receita(s). Elas vão mostrar "item removido". Clique de novo para confirmar.` : "Clique de novo para confirmar."}</span>}
      <div className="item-editor__actions">
        <Button variant="primary" onClick={save}>
          {isNew ? "Adicionar à lista" : "Salvar item"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        {!isNew && (
          <>
            <span className="form__spacer" />
            <Button variant="danger" onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}>
              {confirmDelete ? "Confirmar" : "Excluir"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function CraftScreen() {
  const { data, saveRecipe, deleteRecipe, saveCraftItem, deleteCraftItem } = useStore();
  const craftItems = data.craftItems;
  const itemById = (id: string) => craftItems.find((i) => i.id === id);
  const [editingItem, setEditingItem] = useState<CraftItem | null>(null);
  const recipes = useMemo(() => [...data.recipes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [data.recipes]);
  const [draft, setDraft] = useState<Recipe>(blank);
  const [pendingOpen, setPendingOpen] = useState<Recipe | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState(false);
  const [search, setSearch] = useState("");

  const saved = recipes.find((r) => r.id === draft.id);
  const dirty = saved ? !sameRecipe(saved, draft) : draft.name !== "" || draft.lines.length > 0;
  const total = recipeTotal(draft.lines);
  const items = craftItems.filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase()));

  const open = (target: Recipe | "new") => {
    setConfirmDelete(false);
    setMessage("");
    setNameError(false);
    setPendingOpen(null);
    setDraft(target === "new" ? blank() : { ...target, lines: target.lines.map((l) => ({ ...l })) });
  };
  const requestOpen = (target: Recipe | "new") => {
    if (dirty && !(target !== "new" && target.id === draft.id)) setPendingOpen(target);
    else open(target);
  };

  const addItem = (itemId: string) => {
    setMessage("");
    if (draft.lines.some((l) => l.itemId === itemId)) {
      setMessage("Esse item já está na receita: ajuste a quantidade nele.");
      return;
    }
    setDraft((d) => ({ ...d, lines: [...d.lines, { itemId, qty: 1, price: 0 }] }));
  };
  const updateLine = (i: number, patch: Partial<{ qty: number; price: number }>) => setDraft((d) => ({ ...d, lines: d.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const removeLine = (i: number) => setDraft((d) => ({ ...d, lines: d.lines.filter((_, j) => j !== i) }));

  const save = () => {
    const name = draft.name.trim();
    if (!name) {
      setNameError(true);
      return;
    }
    const rec = { ...draft, name };
    saveRecipe(rec);
    setDraft(rec);
    setNameError(false);
    setMessage(saved ? "Receita atualizada." : "Receita salva.");
  };
  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteRecipe(draft.id);
    open("new");
  };

  return (
    <div className="page">
      <div className="craft-grid">
        {/* Receitas salvas */}
        <Panel label="Receitas">
          <SectionTitle aside={`${recipes.length}`}>Receitas</SectionTitle>
          <Button variant="secondary" onClick={() => requestOpen("new")}>
            + Nova receita
          </Button>
          <div className="recipe-list">
            {recipes.length === 0 && <p className="craft-empty">Nenhuma receita salva ainda.</p>}
            {recipes.map((r) => (
              <button key={r.id} type="button" className={`recipe-item ${r.id === draft.id ? "recipe-item--active" : ""}`} onClick={() => requestOpen(r)}>
                <RecipeIcon icon={r.icon} size={42} />
                <span className="recipe-item__text">
                  <span className="recipe-item__name" style={{ color: gradeInfo(r.grade).fg }}>
                    {r.name}
                  </span>
                  <span className="recipe-item__meta">
                    <GradeBadge grade={r.grade} small />
                    <span className="recipe-item__total">{formatKinah(recipeTotal(r.lines))} Kinah</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Panel>

        {/* Receita aberta */}
        <Panel label="Receita">
          {pendingOpen && (
            <div style={{ marginBottom: 16 }}>
              <Alert kind="warning">
                A receita aberta tem alterações não salvas.{" "}
                <span className="craft-inline-actions">
                  <Button variant="danger" onClick={() => open(pendingOpen)}>
                    Descartar e abrir
                  </Button>
                  <Button variant="ghost" onClick={() => setPendingOpen(null)}>
                    Continuar editando
                  </Button>
                </span>
              </Alert>
            </div>
          )}

          <div className="recipe-head">
            <div className="recipe-head__icon">
              <RecipeIcon icon={draft.icon} size={64} />
              <div className="recipe-icons" role="radiogroup" aria-label="Ícone da receita">
                {RECIPE_ICONS.map((ic) => (
                  <button key={ic.id} type="button" role="radio" aria-checked={draft.icon === ic.id} title={ic.label} className={`recipe-icons__opt ${draft.icon === ic.id ? "recipe-icons__opt--on" : ""}`} onClick={() => setDraft((d) => ({ ...d, icon: ic.id as RecipeIconId }))}>
                    <RecipeIcon icon={ic.id} size={28} />
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label" htmlFor="recipe-name">
                Nome da receita
              </label>
              <input
                id="recipe-name"
                className={`input ${nameError ? "input--invalid" : ""}`}
                value={draft.name}
                maxLength={RECIPE_NAME_MAX}
                placeholder="Ex.: Ebony Dragon Lord Mace"
                onChange={(e) => {
                  setNameError(false);
                  setDraft((d) => ({ ...d, name: e.target.value }));
                }}
              />
              <div className="grade-picker" role="radiogroup" aria-label="Tipo da receita">
                <span className="grade-picker__label">Tipo</span>
                {RECIPE_GRADES.map((g) => (
                  <button key={g.id} type="button" role="radio" aria-checked={draft.grade === g.id} className={`grade-picker__opt ${draft.grade === g.id ? "grade-picker__opt--on" : ""}`} onClick={() => setDraft((d) => ({ ...d, grade: g.id }))}>
                    <GradeBadge grade={g.id} />
                  </button>
                ))}
              </div>
              {nameError ? <span className="field__error">Dê um nome para salvar a receita.</span> : <span className="field__hint">{saved ? (dirty ? "Alterações não salvas" : "Salva") : "Receita nova (ainda não salva)"}</span>}
            </div>
          </div>

          <div className="recipe-lines">
            <div className="recipe-line recipe-line--head">
              <span>Item</span>
              <span>Quantidade</span>
              <span>Valor no mercado (unid.)</span>
              <span>Subtotal</span>
              <span />
            </div>
            {draft.lines.length === 0 && <p className="craft-empty">Adicione itens da lista ao lado com o botão +.</p>}
            {draft.lines.map((l, i) => {
              const item = itemById(l.itemId);
              return (
                <div key={l.itemId} className="recipe-line">
                  <span className="recipe-line__item">
                    {item ? <ItemIcon item={item} size={44} /> : <UnknownItemIcon size={44} />}
                    <span style={{ color: item ? gradeInfo(item.rarity).fg : "var(--text-muted)" }}>{item?.name ?? "Item removido da lista"}</span>
                  </span>
                  <NumberField label={`Quantidade de ${item?.name ?? "item"}`} value={l.qty} onChange={(qty) => updateLine(i, { qty })} />
                  <NumberField label={`Valor de ${item?.name ?? "item"}`} value={l.price} onChange={(price) => updateLine(i, { price })} />
                  <span className="recipe-line__sub">{formatKinah(lineTotal(l))}</span>
                  <button type="button" className="recipe-line__remove" onClick={() => removeLine(i)} title="Tirar da receita" aria-label={`Tirar ${item?.name ?? "item"} da receita`}>
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="recipe-total">
            <span className="recipe-total__label">Total para completar</span>
            <span className="recipe-total__value">
              {formatKinah(total)} <small>Kinah</small>
            </span>
          </div>

          {message && (
            <div style={{ marginTop: 12 }}>
              <Alert kind="info">{message}</Alert>
            </div>
          )}

          <div className="form__actions" style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={save} disabled={!!saved && !dirty}>
              {saved ? "Salvar alterações" : "Salvar receita"}
            </Button>
            <span className="form__spacer" />
            {saved && (
              <Button variant="danger" onClick={remove}>
                {confirmDelete ? "Confirmar exclusão" : "Excluir receita"}
              </Button>
            )}
          </div>
        </Panel>

        {/* Lista de itens */}
        <Panel label="Itens">
          <SectionTitle aside={`${craftItems.length}`}>Itens</SectionTitle>
          {editingItem ? (
            <ItemEditor
              key={editingItem.id}
              initial={editingItem}
              isNew={!craftItems.some((i) => i.id === editingItem.id)}
              usedIn={recipes.filter((r) => r.lines.some((l) => l.itemId === editingItem.id)).length}
              onCancel={() => setEditingItem(null)}
              onSave={(it) => {
                saveCraftItem(it);
                setEditingItem(null);
              }}
              onDelete={() => {
                deleteCraftItem(editingItem.id);
                setEditingItem(null);
              }}
            />
          ) : (
            <Button variant="secondary" onClick={() => setEditingItem({ id: newId(), name: "", rarity: "common", image: null })}>
              + Novo item
            </Button>
          )}
          <input style={{ marginTop: 12 }} className="input" placeholder="Buscar item…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar item" />
          <div className="item-list">
            {items.map((it) => {
              const inRecipe = draft.lines.some((l) => l.itemId === it.id);
              return (
                <div key={it.id} className={`item-row ${inRecipe ? "item-row--in" : ""}`}>
                  <button type="button" className="item-row__add" onClick={() => addItem(it.id)} title={inRecipe ? "Já está na receita" : "Adicionar à receita"} aria-label={`Adicionar ${it.name} à receita`} disabled={inRecipe}>
                    {inRecipe ? "✓" : "+"}
                  </button>
                  <ItemIcon item={it} size={52} />
                  <span className="item-row__name" style={{ color: gradeInfo(it.rarity).fg }}>
                    {it.name}
                  </span>
                  <button type="button" className="item-row__edit" onClick={() => setEditingItem({ ...it })} title="Editar item" aria-label={`Editar ${it.name}`}>
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M11 2l3 3-8 8H3v-3z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
            {items.length === 0 && <p className="craft-empty">{craftItems.length ? "Nenhum item com esse nome." : "Nenhum item ainda. Use + Novo item."}</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
