// Calculadora de craft: lista de itens (catálogo fixo) e receitas salvas pelo usuário.

export type ItemIconId = "common-material" | "refining-stone";
export type RecipeIconId = "pauldron";

/** Item da lista, criado pelo usuário (os dois primeiros vêm de exemplo e podem ser editados ou excluídos). */
export interface CraftItem {
  id: string;
  name: string;
  rarity: RecipeGrade;
  /** Imagem escolhida pelo usuário (data URL 96×96). */
  image: string | null;
  /** Ícone desenhado no app (usado quando não há imagem). */
  icon?: ItemIconId;
}

export const ITEM_NAME_MAX = 40;
export const ITEM_IMAGE_MAX = 300_000;

export const DEFAULT_CRAFT_ITEMS: CraftItem[] = [
  { id: "common-material", name: "Common Material", rarity: "common", image: null, icon: "common-material" },
  { id: "refining-stone", name: "Refining Stone", rarity: "common", image: null, icon: "refining-stone" },
];

/** Tipo (grau) da receita, com as cores dos selos do jogo. */
export type RecipeGrade = "common" | "rare" | "epic" | "unique";
export const RECIPE_GRADES: { id: RecipeGrade; label: string; bg: string; fg: string }[] = [
  { id: "common", label: "Common", bg: "#353535", fg: "#c3c3c3" },
  { id: "rare", label: "Rare", bg: "#29501d", fg: "#19e048" },
  { id: "epic", label: "Epic", bg: "#0e5171", fg: "#379aff" },
  { id: "unique", label: "Unique", bg: "#785408", fg: "#ffd02b" },
];
export const gradeInfo = (g: RecipeGrade) => RECIPE_GRADES.find((x) => x.id === g) ?? RECIPE_GRADES[0];

export const RECIPE_ICONS: { id: RecipeIconId; label: string }[] = [{ id: "pauldron", label: "Ombreira" }];

export interface RecipeLine {
  itemId: string;
  /** Quantos ainda faltam. */
  qty: number;
  /** Valor de mercado de 1 unidade (Kinah). */
  price: number;
}

export interface Recipe {
  id: string;
  name: string;
  icon: RecipeIconId;
  grade: RecipeGrade;
  lines: RecipeLine[];
  updatedAt: string;
}

export const RECIPE_NAME_MAX = 40;
export const NUM_MAX = 999_999_999_999;

export const lineTotal = (l: RecipeLine) => l.qty * l.price;
export const recipeTotal = (lines: RecipeLine[]) => lines.reduce((n, l) => n + lineTotal(l), 0);
export const formatKinah = (n: number) => Math.round(n).toLocaleString("en-US");

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(NUM_MAX, Math.round(v)) : 0);

/** Lê as receitas salvas com tolerância. Itens que não existem mais no catálogo são mantidos (aparecem como desconhecidos). */
export function parseRecipes(raw: unknown): Recipe[] {
  if (!Array.isArray(raw)) return [];
  const out: Recipe[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string") continue;
    const lines: RecipeLine[] = Array.isArray(o.lines)
      ? (o.lines as unknown[])
          .filter((l): l is Record<string, unknown> => !!l && typeof l === "object" && typeof (l as { itemId?: unknown }).itemId === "string")
          .map((l) => ({ itemId: String(l.itemId), qty: num(l.qty), price: num(l.price) }))
      : [];
    out.push({
      id: o.id,
      name: o.name.slice(0, RECIPE_NAME_MAX) || "Receita",
      icon: RECIPE_ICONS.some((i) => i.id === o.icon) ? (o.icon as RecipeIconId) : "pauldron",
      grade: RECIPE_GRADES.some((g) => g.id === o.grade) ? (o.grade as RecipeGrade) : "common",
      lines,
      updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
    });
  }
  return out;
}

const ICON_IDS: ItemIconId[] = ["common-material", "refining-stone"];

/** Lê a lista de itens. Arquivo sem a lista (versões antigas) começa com os itens de exemplo. */
export function parseCraftItems(raw: unknown): CraftItem[] {
  if (!Array.isArray(raw)) return DEFAULT_CRAFT_ITEMS.map((i) => ({ ...i }));
  const out: CraftItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string" || !o.name.trim()) continue;
    out.push({
      id: o.id,
      name: o.name.slice(0, ITEM_NAME_MAX),
      rarity: RECIPE_GRADES.some((g) => g.id === o.rarity) ? (o.rarity as RecipeGrade) : "common",
      image: typeof o.image === "string" && o.image.startsWith("data:image/") && o.image.length < ITEM_IMAGE_MAX ? o.image : null,
      icon: ICON_IDS.includes(o.icon as ItemIconId) ? (o.icon as ItemIconId) : undefined,
    });
  }
  return out;
}
