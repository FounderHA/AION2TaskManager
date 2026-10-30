// Itens que vêm junto com o app (lista padrão da calculadora de craft).
// Para atualizar: o usuário exporta em Configurações → Calc Craft ("Exportar itens e ícones") e o
// conteúdo do arquivo entra aqui. Quem atualiza o app recebe os itens novos sem perder os próprios.
// Os ids são estáveis: nunca trocar o id de um item já publicado.
import type { CraftItem, RecipeIconDef } from "./craft";

export const BUILTIN_CRAFT_ITEMS: CraftItem[] = [
  { id: "common-material", name: "Common Material", rarity: "common", image: null, icon: "common-material" },
  { id: "refining-stone", name: "Refining Stone", rarity: "common", image: null, icon: "refining-stone" },
];

/** Ícones de receita que vêm com o app. */
export const BUILTIN_RECIPE_ICONS: RecipeIconDef[] = [];
