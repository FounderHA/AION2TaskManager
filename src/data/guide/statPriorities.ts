// Prioridade de status por equipamento (Soul Binding) e de Manastone/Soulstone.
// Fonte: aba "Stat Priorities" do "Screamheart's Aion 2 Content Guide" (planilha comunitária),
// transcrita em 28/10/2026. Nomes dos status em inglês, como no cliente do jogo.

export interface StatRow {
  stat: string;
  /** true = status-alvo (branco na planilha); false = opcional / provisório (amarelo). */
  target: boolean;
  /** Chance aproximada de sair (%). */
  roll: number;
}

export type SlotGroup = "armas" | "armadura" | "acessorios";

export interface GearSlot {
  id: string;
  /** Nome em português e nome no jogo. */
  name: string;
  game: string;
  group: SlotGroup;
  /** Vazio = a planilha ainda não tem dados para esse slot. */
  stats: StatRow[];
}

const r = (stat: string, target: boolean, roll: number): StatRow => ({ stat, target, roll });

const WEAPON: StatRow[] = [
  r("Combat Speed", true, 4),
  r("Weapon Damage Boost", true, 4),
  r("Damage Boost", true, 5),
  r("Might", true, 5),
  r("Attack", true, 6),
  r("Precision", true, 6),
  r("Multi-hit Chance", false, 2),
  r("Skill Ranks", false, 2),
];

const EARRING: StatRow[] = [
  r("Attack", true, 5),
  r("Might", true, 2),
  r("Precision", true, 2),
  r("Move Speed", true, 2),
  r("Passive Skill Ranks", true, 3),
  r("Critical Hit", false, 5),
  r("Class Specific Defense", false, 6),
  r("HP", false, 7),
];

const RING: StatRow[] = [
  r("Attack", true, 4),
  r("Might", true, 2),
  r("Precision", true, 2),
  r("Skill Ranks", true, 2),
  r("Critical Hit", false, 5),
  r("Class Specific Defense", false, 8),
  r("HP", false, 8),
  r("Accuracy", false, 5),
];

export const GEAR_SLOTS: GearSlot[] = [
  { id: "weapon", name: "Arma", game: "Weapon", group: "armas", stats: WEAPON },
  { id: "guard", name: "Escudo / Guarda", game: "Guard", group: "armas", stats: WEAPON },

  {
    id: "helm",
    name: "Elmo",
    game: "Helm",
    group: "armadura",
    stats: [r("Double Chance", true, 1), r("Attack Increase", true, 1), r("Attack", true, 4), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 5), r("Class Specific Defense", false, 5), r("HP", false, 6), r("Dexterity", false, 1)],
  },
  {
    id: "pauldrons",
    name: "Ombreiras",
    game: "Pauldrons",
    group: "armadura",
    stats: [r("Double Chance", true, 1), r("Critical Damage Boost", true, 3), r("Attack", true, 4), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 5), r("Class Specific Defense", false, 5), r("HP", false, 6), r("Dexterity", false, 4)],
  },
  {
    id: "breastplate",
    name: "Peitoral",
    game: "Breastplate",
    group: "armadura",
    stats: [r("Perfect Chance", true, 1), r("Damage Boost", true, 3), r("Attack", true, 4), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 5), r("Class Specific Defense", false, 5), r("HP", false, 6), r("Constitution", false, 4)],
  },
  { id: "belt", name: "Cinto", game: "Belt", group: "armadura", stats: [] },
  {
    id: "greaves",
    name: "Grevas",
    game: "Greaves",
    group: "armadura",
    stats: [r("Attack Increase", true, 1), r("Perfect Chance", true, 1), r("Damage Tolerance", true, 3), r("Attack", true, 4), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 5), r("Class Specific Defense", false, 5), r("HP", false, 6)],
  },
  {
    id: "gloves",
    name: "Luvas",
    game: "Gloves",
    group: "armadura",
    stats: [r("Combat Speed", true, 4), r("Perfect Chance", true, 1), r("Attack", true, 4), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 5), r("Class Specific Defense", false, 5), r("HP", false, 6), r("Dexterity", false, 4)],
  },
  {
    id: "cloak",
    name: "Capa",
    game: "Cloak",
    group: "armadura",
    stats: [r("Attack Increase", true, 1), r("Double Chance", true, 1), r("Attack", true, 4), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 5), r("Class Specific Defense", false, 5), r("HP", false, 6), r("Dexterity", false, 4)],
  },
  {
    id: "boots",
    name: "Botas",
    game: "Boots",
    group: "armadura",
    stats: [r("Perfect Chance", true, 1), r("Attack", true, 4), r("Move Speed", true, 3), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 5), r("Class Specific Defense", false, 5), r("HP", false, 6), r("Dexterity", false, 4)],
  },

  { id: "earrings", name: "Brincos (1 e 2)", game: "Earring", group: "acessorios", stats: EARRING },
  {
    id: "necklace",
    name: "Colar",
    game: "Necklace",
    group: "acessorios",
    stats: [r("Combat Speed", true, 3), r("Attack", true, 4), r("Might", true, 3), r("Precision", true, 3), r("Passive Skill Ranks", true, 2), r("Critical Hit", false, 8), r("Class Specific Defense", false, 6), r("HP", false, 7)],
  },
  { id: "amulet", name: "Amuleto", game: "Amulet", group: "acessorios", stats: [] },
  { id: "rings", name: "Anéis (1 e 2)", game: "Ring", group: "acessorios", stats: RING },
  { id: "bracelets", name: "Braceletes (1 e 2)", game: "Bracelet", group: "acessorios", stats: [] },
];

export const SLOT_GROUPS: { id: SlotGroup; label: string }[] = [
  { id: "armas", label: "Armas" },
  { id: "armadura", label: "Armadura" },
  { id: "acessorios", label: "Acessórios" },
];

/** Manastone / Soulstone: valem para todos os itens. */
export const STONE_STATS: StatRow[] = [
  r("Front/Back Attack Damage Boost", true, 4),
  r("Weapon Damage Boost", true, 4),
  r("Critical Damage Boost", true, 2),
  r("Damage Boost", true, 5),
  r("Attack", true, 6),
  r("Class Specific Defense", false, 5),
];

/** Status-alvo em pelo menos um slot, do mais comum para o menos comum. */
export function targetStats(): { stat: string; slots: number }[] {
  const count = new Map<string, number>();
  for (const s of GEAR_SLOTS) for (const row of s.stats) if (row.target) count.set(row.stat, (count.get(row.stat) ?? 0) + 1);
  return [...count.entries()].map(([stat, slots]) => ({ stat, slots })).sort((a, b) => b.slots - a.slots || a.stat.localeCompare(b.stat));
}

export const GUIDE_SOURCE = {
  title: "Screamheart's Aion 2 Content Guide",
  author: "Screamheart",
  url: "https://docs.google.com/spreadsheets/d/1bNxC1wd0S_ILGYAyWnO0aTo_G_AOrjkv7bTcOj_NRz8/",
  date: "28/10/2026",
};
