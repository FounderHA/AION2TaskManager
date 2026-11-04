// Guia · Genus Insight: o que buscar em cada um dos 9 slots de cada categoria (foco em dano PvE).
// Transcrito do PDF "Soulbind and Genus Important PvE Damage stats" (páginas 2 a 6).
import cogniArt from "../../assets/genus/cogni.webp";
import cogniIcon from "../../assets/genus/cogni-icon.webp";
import feraArt from "../../assets/genus/fera.webp";
import feraIcon from "../../assets/genus/fera-icon.webp";
import naturaArt from "../../assets/genus/natura.webp";
import naturaIcon from "../../assets/genus/natura-icon.webp";
import varianArt from "../../assets/genus/varian.webp";
import varianIcon from "../../assets/genus/varian-icon.webp";
import specialArt from "../../assets/genus/special.webp";
import specialIcon from "../../assets/genus/special-icon.webp";

export type LockPriority = "first" | "second" | "third";

export const LOCK_PRIORITIES: { id: LockPriority; label: string; color: string; hint: string }[] = [
  { id: "first", label: "First", color: "#ff4b4b", hint: "Trave primeiro" },
  { id: "second", label: "Second", color: "#ffc93c", hint: "Trave em segundo" },
  { id: "third", label: "Third", color: "#3d9bff", hint: "Trave por último" },
];
export const lockInfo = (p: LockPriority) => LOCK_PRIORITIES.find((x) => x.id === p) ?? LOCK_PRIORITIES[0];

export interface GenusSlot {
  stat: string;
  min: number;
  max: number;
  /** "%" para status em porcentagem. */
  unit: "" | "%";
  priority: LockPriority;
}

export interface GenusCategory {
  id: "cogni" | "fera" | "natura" | "varian" | "special";
  name: string;
  art: string;
  icon: string;
  /** Slots 1 a 9, na ordem do jogo (começa no topo e desce pela esquerda). */
  slots: GenusSlot[];
}

const attack: GenusSlot = { stat: "Attack Bonus", min: 8, max: 16, unit: "", priority: "first" };
const hp: GenusSlot = { stat: "HP Increase", min: 0.8, max: 1.6, unit: "%", priority: "third" };
const accuracy: GenusSlot = { stat: "Accuracy Bonus", min: 20, max: 40, unit: "", priority: "second" };
const pveTolerance: GenusSlot = { stat: "PvE Damage Tolerance", min: 2, max: 4, unit: "%", priority: "third" };

/** Monta os 9 slots: só o 4 e o 7 mudam entre as categorias. */
const slots = (slot4: Omit<GenusSlot, "priority">, slot7: Omit<GenusSlot, "priority">): GenusSlot[] => [
  attack,
  hp,
  accuracy,
  { ...slot4, priority: "first" },
  attack,
  accuracy,
  { ...slot7, priority: "third" },
  hp,
  accuracy,
];

export const VARYING_SLOTS = [4, 7];

export const GENUS_CATEGORIES: GenusCategory[] = [
  {
    id: "cogni",
    name: "Cogni",
    art: cogniArt,
    icon: cogniIcon,
    slots: slots({ stat: "PvE Damage Boost", min: 2, max: 4, unit: "%" }, pveTolerance),
  },
  {
    id: "fera",
    name: "Fera",
    art: feraArt,
    icon: feraIcon,
    slots: slots({ stat: "Weapon Damage Boost", min: 1.5, max: 3, unit: "%" }, pveTolerance),
  },
  {
    id: "natura",
    name: "Natura",
    art: naturaArt,
    icon: naturaIcon,
    slots: slots({ stat: "PvE Damage Boost", min: 2, max: 4, unit: "%" }, pveTolerance),
  },
  {
    id: "varian",
    name: "Varian",
    art: varianArt,
    icon: varianIcon,
    slots: slots({ stat: "Front Attack Damage Boost", min: 1.5, max: 3, unit: "%" }, pveTolerance),
  },
  {
    id: "special",
    name: "Special",
    art: specialArt,
    icon: specialIcon,
    slots: slots({ stat: "Double Chance", min: 1.5, max: 3, unit: "%" }, { stat: "Damage Tolerance", min: 1.5, max: 3, unit: "%" }),
  },
];

export const fmtGenus = (n: number, unit: "" | "%") => `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}${unit}`;

export const GENUS_SOURCE = { title: "Soulbind and Genus Important PvE Damage stats (PDF)", date: "04/11/2026" };
