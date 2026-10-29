// Modelo dos dados salvos em dados.json (e no backup da Etapa 10).
import type { CharacterRole } from "./types";
import { defaultSettings, parseSettings, type Settings } from "./settings";
import { parseRecipes, type Recipe } from "./craft";

/** Tamanho máximo do texto da foto (data URL). */
export const PHOTO_MAX = 250_000;

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
  /** ISO 8601; usado para ordenar e para escolher o novo main. */
  createdAt: string;
  /** Gear Score (GS) e Combat Power (CP) informados pelo usuário; null = não informado. */
  gs: number | null;
  cp: number | null;
  /** Última "foto" da Odyle Energy (ver data/odyle.ts); null = não informada. */
  odyle: OdyleSnapshot | null;
  /** Foto do personagem (data URL quadrado, ~160px); null = sem foto. */
  photo: string | null;
}

/** Valores informados num momento; o valor atual é calculado somando as recargas desde então. */
export interface OdyleSnapshot {
  basic: number;
  charged: number;
  /** ISO 8601 do momento da foto. */
  at: string;
}

function parseOdyle(v: unknown): OdyleSnapshot | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.round(x) : null);
  const basic = n(o.basic);
  const charged = n(o.charged);
  if (basic === null || charged === null || typeof o.at !== "string" || Number.isNaN(Date.parse(o.at))) return null;
  return { basic, charged, at: o.at };
}

const statOrNull = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : null);

/** GS no formato do jogo: 2,673 */
export function formatGs(n: number | null): string {
  return n === null ? "—" : n.toLocaleString("en-US");
}

/** CP no formato do jogo: 45,210 · 152.7K · 1.2M */
export function formatCp(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 100_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString("en-US");
}

export interface AppData {
  /** Versão do formato do arquivo; aumentar quando a estrutura mudar. */
  schemaVersion: 1;
  characters: Character[];
  /** Marcações: chave (ver data/checks.ts) → data/hora em que foi marcada (ISO). */
  checks: Record<string, string>;
  /** Horário do reset, tarefas ligadas/desligadas e tarefas próprias. */
  settings: Settings;
  /** Receitas da calculadora de craft. */
  recipes: Recipe[];
}

export const SCHEMA_VERSION = 1 as const;
export const NAME_MAX = 24;

export function emptyData(): AppData {
  return { schemaVersion: SCHEMA_VERSION, characters: [], checks: {}, settings: defaultSettings(), recipes: [] };
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
        createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date().toISOString(),
        gs: statOrNull(c.gs),
        cp: statOrNull(c.cp),
        odyle: parseOdyle(c.odyle),
        photo: typeof c.photo === "string" && c.photo.startsWith("data:image/") && c.photo.length < PHOTO_MAX ? c.photo : null,
      }));
    // Versões antigas guardavam membership por personagem: se algum tinha, a conta passa a ter
    const legacyMember = list.some((c) => !!c && typeof c === "object" && (c as { member?: unknown }).member === true);
    const checks: Record<string, string> = {};
    if (obj?.checks && typeof obj.checks === "object") {
      for (const [k, v] of Object.entries(obj.checks as Record<string, unknown>)) {
        if (typeof v === "string" && k.includes("|")) checks[k] = v;
      }
    }
    return { schemaVersion: SCHEMA_VERSION, characters: ensureSingleMain(characters), checks, settings: parseSettings(obj?.settings, { membership: legacyMember }), recipes: parseRecipes(obj?.recipes) };
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
