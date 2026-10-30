// Calculadora de craft: lista de itens (catálogo fixo) e receitas salvas pelo usuário.

export type ItemIconId = "common-material" | "refining-stone";
export type RecipeArtId = "pauldron";

/** Ícone de receita: imagem escolhida pelo usuário ou desenho do app. */
export interface RecipeIconDef {
  id: string;
  name: string;
  image: string | null;
  art?: RecipeArtId;
}

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


/** Tipo (grau) da receita, com as cores dos selos do jogo. */
export type RecipeGrade = "common" | "rare" | "epic" | "unique";
export const RECIPE_GRADES: { id: RecipeGrade; label: string; bg: string; fg: string }[] = [
  { id: "common", label: "Common", bg: "#353535", fg: "#c3c3c3" },
  { id: "rare", label: "Rare", bg: "#29501d", fg: "#19e048" },
  { id: "epic", label: "Epic", bg: "#0e5171", fg: "#379aff" },
  { id: "unique", label: "Unique", bg: "#785408", fg: "#ffd02b" },
];
export const gradeInfo = (g: RecipeGrade) => RECIPE_GRADES.find((x) => x.id === g) ?? RECIPE_GRADES[0];


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
  /** Id do ícone (RecipeIconDef). */
  icon: string;
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
      icon: typeof o.icon === "string" && o.icon ? o.icon : "pauldron",
      grade: RECIPE_GRADES.some((g) => g.id === o.grade) ? (o.grade as RecipeGrade) : "common",
      lines,
      updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
    });
  }
  return out;
}

const ICON_IDS: ItemIconId[] = ["common-material", "refining-stone"];

/** Lê uma lista de itens (do dados.json ou de um arquivo exportado). */
export function parseCraftItems(raw: unknown): CraftItem[] {
  if (!Array.isArray(raw)) return [];
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

/**
 * Junta os itens do usuário com a lista padrão do app: itens padrão que o usuário ainda não tem
 * (e não excluiu) entram no fim. Itens que ele já tem, editados ou não, ficam como estão.
 */
export function mergeBuiltinItems<T extends { id: string }>(userItems: T[], hidden: string[], builtin: T[]): T[] {
  const have = new Set(userItems.map((i) => i.id));
  const skip = new Set(hidden);
  return [...userItems, ...builtin.filter((b) => !have.has(b.id) && !skip.has(b.id)).map((b) => ({ ...b }))];
}

const ART_IDS: RecipeArtId[] = ["pauldron"];

/** Lê a lista de ícones de receita. */
export function parseRecipeIcons(raw: unknown): RecipeIconDef[] {
  if (!Array.isArray(raw)) return [];
  const out: RecipeIconDef[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string" || !o.name.trim()) continue;
    const image = typeof o.image === "string" && o.image.startsWith("data:image/") && o.image.length < ITEM_IMAGE_MAX ? o.image : null;
    const art = ART_IDS.includes(o.art as RecipeArtId) ? (o.art as RecipeArtId) : undefined;
    if (!image && !art) continue;
    out.push({ id: o.id, name: o.name.slice(0, ITEM_NAME_MAX), image, art });
  }
  return out;
}

/** Arquivo exportado com a lista de itens e os ícones de receita (para virar lista padrão do app). */
export function makeCraftExport(items: CraftItem[], icons: RecipeIconDef[], appVersion: string): string {
  return JSON.stringify({ app: "Aion 2 Manager", tipo: "listas-calc-craft", exportadoEm: new Date().toISOString(), versaoApp: appVersion, itens: items, icones: icons }, null, 2);
}

/** Lê um arquivo exportado (aceita também o formato antigo só com itens). */
export function readCraftExport(text: string): { items: CraftItem[]; icons: RecipeIconDef[] } | null {
  try {
    const o = JSON.parse(text);
    if (o?.tipo !== "listas-calc-craft" && o?.tipo !== "itens-craft") return null;
    return { items: parseCraftItems(o.itens), icons: parseRecipeIcons(o.icones) };
  } catch {
    return null;
  }
}
