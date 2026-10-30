import { describe, expect, it } from "vitest";
import { makeCraftExport, mergeBuiltinItems, readCraftExport, type CraftItem, type RecipeIconDef } from "./craft";

const builtin: CraftItem[] = [
  { id: "a", name: "A", rarity: "common", image: null },
  { id: "b", name: "B", rarity: "epic", image: null },
];

describe("lista padrão de itens", () => {
  it("quem não tem nenhum recebe todos", () => {
    expect(mergeBuiltinItems([], [], builtin).map((i) => i.id)).toEqual(["a", "b"]);
  });
  it("não sobrescreve item editado pelo usuário", () => {
    const user: CraftItem[] = [{ id: "a", name: "A editado", rarity: "unique", image: null }];
    const out = mergeBuiltinItems(user, [], builtin);
    expect(out).toHaveLength(2);
    expect(out[0].name).toBe("A editado");
  });
  it("item excluído não volta", () => {
    expect(mergeBuiltinItems([], ["b"], builtin).map((i) => i.id)).toEqual(["a"]);
  });
  it("mantém os itens próprios do usuário", () => {
    const user: CraftItem[] = [{ id: "x", name: "Meu", rarity: "rare", image: null }];
    expect(mergeBuiltinItems(user, [], builtin).map((i) => i.id)).toEqual(["x", "a", "b"]);
  });
});

describe("exportar lista", () => {
  it("ida e volta", () => {
    const items: CraftItem[] = [{ id: "x", name: "Radiant Odyle", rarity: "unique", image: "data:image/png;base64,AAA" }];
    const icons: RecipeIconDef[] = [{ id: "i1", name: "Maça", image: "data:image/png;base64,BBB" }];
    expect(readCraftExport(makeCraftExport(items, icons, "2.1.0"))).toEqual({ items, icons });
  });
  it("recusa arquivo de outro tipo", () => {
    expect(readCraftExport('{"tipo":"backup"}')).toBeNull();
    expect(readCraftExport("não é json")).toBeNull();
  });
});
