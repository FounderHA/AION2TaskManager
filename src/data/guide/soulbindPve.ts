// Guia · status importantes de dano PvE no Soul Binding, por peça.
// Transcrito da página 1 do PDF "Soulbind and Genus Important PvE Damage stats" (04/11/2026).

export interface SoulbindPveEntry {
  /** Nome da peça como no PDF. */
  piece: string;
  /** Ids de GEAR_SLOTS (statPriorities.ts) que essa peça cobre. */
  slots: string[];
  stats: string[];
}

export const SOULBIND_PVE: SoulbindPveEntry[] = [
  { piece: "Weapon & Guard", slots: ["weapon", "guard"], stats: ["Combat Speed", "Weapon Damage Boost", "Damage Boost"] },
  { piece: "Head", slots: ["helm"], stats: ["Double Chance", "Attack Increase"] },
  { piece: "Shoulders", slots: ["pauldrons"], stats: ["Critical Damage Boost", "Double Chance"] },
  { piece: "Chest", slots: ["breastplate"], stats: ["Damage Boost", "Perfect Chance"] },
  { piece: "Legs", slots: ["greaves"], stats: ["Attack Increase", "Perfect Chance", "Damage Tolerance"] },
  { piece: "Arms", slots: ["gloves"], stats: ["Combat Speed", "Perfect Chance"] },
  { piece: "Feet", slots: ["boots"], stats: ["Move Speed", "Perfect Chance"] },
  { piece: "Cloak", slots: ["cloak"], stats: ["Double Chance", "Attack Increase"] },
  { piece: "Earrings", slots: ["earrings"], stats: ["Move Speed"] },
  { piece: "Necklace", slots: ["necklace"], stats: ["Combat Speed"] },
  { piece: "Rings", slots: ["rings"], stats: ["Skills"] },
];

export const soulbindPveFor = (slotId: string) => SOULBIND_PVE.find((e) => e.slots.includes(slotId));
