// Modelo dos dados salvos em dados.json (e no backup da Etapa 10).
import type { CharacterRole } from "./types";

export type Faction = "Elyos" | "Asmodian";

/** Classes como aparecem no cliente em inglês. */
export const CLASSES = ["Gladiator", "Templar", "Assassin", "Ranger", "Sorcerer", "Spiritmaster", "Cleric", "Chanter"] as const;
export type CharacterClass = (typeof CLASSES)[number];

export interface Character {
  id: string;
  name: string;
  className: CharacterClass;
  faction: Faction;
  role: CharacterRole;
  member: boolean;
  /** ISO 8601; usado para ordenar e para escolher o novo main. */
  createdAt: string;
}

export interface AppData {
  /** Versão do formato do arquivo; aumentar quando a estrutura mudar. */
  schemaVersion: 1;
  characters: Character[];
}

export const SCHEMA_VERSION = 1 as const;
export const NAME_MAX = 24;

export function emptyData(): AppData {
  return { schemaVersion: SCHEMA_VERSION, characters: [] };
}

/** Lê o JSON salvo com tolerância: campos estranhos são ignorados, faltantes recebem padrão. */
export function parseData(raw: string | null | undefined): AppData {
  if (!raw) return emptyData();
  try {
    const obj = JSON.parse(raw);
    const list: unknown[] = Array.isArray(obj?.characters) ? obj.characters : [];
    const characters: Character[] = list
      .filter((c): c is Record<string, unknown> => !!c && typeof c === "object" && typeof (c as { id?: unknown }).id === "string")
      .map((c) => ({
        id: String(c.id),
        name: String(c.name ?? "").slice(0, NAME_MAX) || "Sem nome",
        className: (CLASSES as readonly string[]).includes(String(c.className)) ? (c.className as CharacterClass) : "Gladiator",
        faction: c.faction === "Asmodian" ? "Asmodian" : "Elyos",
        role: c.role === "MAIN" ? "MAIN" : "ALT",
        member: c.member === true,
        createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date().toISOString(),
      }));
    return { schemaVersion: SCHEMA_VERSION, characters: ensureSingleMain(characters) };
  } catch {
    return emptyData();
  }
}

/** Garante a regra: se houver personagens, existe exatamente um main. */
export function ensureSingleMain(list: Character[]): Character[] {
  if (!list.length) return list;
  const sorted = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const mainId = sorted.find((c) => c.role === "MAIN")?.id ?? sorted[0].id;
  return list.map((c) => ({ ...c, role: c.id === mainId ? "MAIN" : "ALT" }));
}

/** Ordem de exibição: main primeiro, depois alts por data de cadastro. */
export function sortCharacters(list: Character[]): Character[] {
  return [...list].sort((a, b) => (a.role === b.role ? a.createdAt.localeCompare(b.createdAt) : a.role === "MAIN" ? -1 : 1));
}
