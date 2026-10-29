// Calculadora de craft: lista de itens (catálogo fixo) e receitas salvas pelo usuário.

export type Rarity = "common";

export const RARITY: Record<Rarity, { label: string; color: string }> = {
  common: { label: "Comum", color: "#e8ebef" },
};

export type ItemIconId = "common-material";
export type RecipeIconId = "pauldron";

export interface CraftItem {
  id: string;
  name: string;
  rarity: Rarity;
  icon: ItemIconId;
}

/** Itens disponíveis para as receitas. */
export const CRAFT_ITEMS: CraftItem[] = [{ id: "common-material", name: "Common Material", rarity: "common", icon: "common-material" }];

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
  lines: RecipeLine[];
  updatedAt: string;
}

export const RECIPE_NAME_MAX = 40;
export const NUM_MAX = 999_999_999_999;

export const lineTotal = (l: RecipeLine) => l.qty * l.price;
export const recipeTotal = (lines: RecipeLine[]) => lines.reduce((n, l) => n + lineTotal(l), 0);
export const formatKinah = (n: number) => Math.round(n).toLocaleString("en-US");
export const itemById = (id: string) => CRAFT_ITEMS.find((i) => i.id === id);

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
      lines,
      updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
    });
  }
  return out;
}
