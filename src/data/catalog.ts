// Catálogo inicial de tarefas (revisado e aprovado na Etapa 4).
// Fonte: pesquisa do cliente Global de 27/10/2026 (ver CLAUDE.md).
// IMPORTANTE: não mudar os "id" depois de publicado — o histórico é salvo por eles.
import type { CharacterRole, TaskDef, Weekday } from "./types";


export const DEFAULT_CATALOG: TaskDef[] = [
  // ---------- Diárias ----------
  { id: "duty-missions", name: "Duty Missions", description: "5 missões do Diário (não acumulam)", scope: "servidor", cadence: "diaria", category: "missoes", enabledByDefault: true },
  { id: "daily-dungeon", name: "Daily Dungeon", description: "2 entradas por dia (14 na semana)", scope: "servidor", cadence: "ritmo", category: "dungeons", enabledByDefault: true },
  { id: "shugo-festival", name: "Shugo Festival", description: "Usar as chaves do dia", scope: "servidor", cadence: "diaria", category: "eventos", enabledByDefault: true },
  { id: "dimensional-invasion", name: "Dimensional Invasion", description: "Usar a chave do dia", scope: "servidor", cadence: "diaria", category: "eventos", enabledByDefault: true },
  { id: "nightmare", name: "Nightmare", description: "2 tentativas (só gasta se vencer)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: true },
  { id: "odyle-energy", name: "Odyle Energy", description: "Gastar em cubos de Conquest/Transcendence antes de encher (máx. 560)", descriptionMember: "Gastar em cubos de Conquest/Transcendence antes de encher (máx. 840)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: false }, // desligada: a aba Odyle cuida disso (28/10/2026)
  { id: "supply-requests-urgent", name: "Supply Requests (urgente)", description: "Entregas do dia por Abyss Points", scope: "personagem", cadence: "diaria", category: "missoes", enabledByDefault: false },
  { id: "abandoned-balaur-fortress", name: "Abandoned Balaur Fortress", description: "1 entrada por dia (acumula até 7)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: false },
  { id: "fafnium-laboratory", name: "Fafnium Laboratory", description: "1 entrada por dia (acumula até 7)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: false },

  // ---------- Semanais ----------
  { id: "ascension-trial", name: "Ascension Trial", description: "3 entradas", scope: "personagem", cadence: "semanal", category: "dungeons", enabledByDefault: true },
  { id: "subjugation", name: "Subjugation", description: "3 tickets", scope: "personagem", cadence: "semanal", category: "dungeons", enabledByDefault: false },
  { id: "sanctuary-ludra", name: "Sanctuary: Abyssal Forge (Ludra)", description: "1 kill do chefe final", scope: "personagem", cadence: "semanal", category: "raids", enabledByDefault: true },
  { id: "sanctuary-corroded", name: "Sanctuary: Corroded Decontamination Facility", description: "2 kills do chefe final", scope: "personagem", cadence: "semanal", category: "raids", enabledByDefault: false },
  { id: "sanctuary-muspel", name: "Sanctuary: Chalice of Muspel", description: "2 kills do chefe final", scope: "personagem", cadence: "semanal", category: "raids", enabledByDefault: false },
  { id: "abyss", name: "Abyss", description: "7h por camada (Lower, Middle e Upper)", descriptionMember: "14h em Lower e Middle, 7h em Upper", scope: "personagem", cadence: "semanal", category: "abismo-pvp", enabledByDefault: true },
  { id: "growth-dungeons", name: "Growth Dungeons", description: "Silent Graveyard e Fafnite Amphitheater, 7h cada", scope: "personagem", cadence: "semanal", category: "dungeons", enabledByDefault: false },
  { id: "daeva-pass", name: "Daeva Pass", description: "Bater o limite semanal de EXP", scope: "personagem", cadence: "semanal", category: "missoes", enabledByDefault: true },
  { id: "arena-battlefield", name: "Arena / Battlefield", description: "Recompensas semanais de vitória e participação", scope: "personagem", cadence: "semanal", category: "abismo-pvp", enabledByDefault: false },
  { id: "abyss-corridor", name: "Abyss Corridor", description: "Usar as entradas antes do próximo Artifact Siege", scope: "personagem", cadence: "semanal", category: "abismo-pvp", enabledByDefault: false },
  { id: "supply-requests-weekly", name: "Supply Requests (semanal)", description: "Entregas da semana", scope: "personagem", cadence: "semanal", category: "missoes", enabledByDefault: false },

  // ---------- Compras da semana (agrupadas por loja) ----------
  // Os ids "command-scrolls-pve", "odyle-morph-character" e "odyle-morph-server" vêm de versões
  // anteriores e foram mantidos para não perder marcações já feitas.
  { id: "command-scrolls-pve", name: "Command: Altgard", description: "12 por semana", shop: "Command Shop", scope: "servidor", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "odyle-morph-character", name: "Odyle Energy", description: "4 por personagem", shop: "Substance Morph", scope: "personagem", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "odyle-morph-server", name: "Odyle Energy (servidor)", description: "16 por servidor", shop: "Substance Morph", scope: "servidor", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "latesran-root-command", name: "Latesran Eastern Root Command", description: "5 por servidor", shop: "Command Shop (Abyss)", scope: "servidor", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "latesran-root-command-veteran", name: "Latesran Eastern Root Command: Veteran", description: "5 por servidor", shop: "Command Shop (Abyss)", scope: "servidor", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "latesran-root-command-elite", name: "Latesran Eastern Root Command: Elite", description: "5 por servidor", shop: "Command Shop (Abyss)", scope: "servidor", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "latesran-root-command-special", name: "Latesran Eastern Root Command: Special", description: "5 por servidor", shop: "Command Shop (Abyss)", scope: "servidor", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "wind-breeze-odyle-energy", name: "Odyle Energy", description: "4 por personagem", shop: "Wind Breeze Merchants (Special)", scope: "personagem", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "wind-breeze-odyle-energy-server", name: "Odyle Energy (servidor)", description: "16 por servidor", shop: "Wind Breeze Merchants (Special)", scope: "servidor", cadence: "semanal", category: "compras", enabledByDefault: true },
  { id: "wind-breeze-lower-rift-stone", name: "Lower Abyss Rift Stone", description: "7 por personagem", shop: "Wind Breeze Merchants (Special)", scope: "personagem", cadence: "semanal", category: "compras", enabledByDefault: true },

  // ---------- Eventos em dias fixos ----------
  { id: "guardian-lord-nahma", name: "Guardian Lord Nahma (Abyss)", description: "Chefe de campo do Abismo", scope: "personagem", cadence: "dias-fixos", category: "eventos", days: [0, 5], time: "21:00 do servidor", enabledByDefault: false },
  { id: "abyss-executors", name: "Executors do Abyss", description: "Executor Tamasa, Kaira e Argo", scope: "personagem", cadence: "dias-fixos", category: "eventos", days: [1, 4, 6], time: "21:30 do servidor", enabledByDefault: false },
];

/* ---------- Funções de apoio ---------- */

/** Item da seção "Compras da semana" (check único por semana, agrupado por loja). */
export const isPurchase = (t: TaskDef) => t.category === "compras";

/** Agrupa tarefas pela loja, mantendo a ordem em que aparecem. */
export function groupByShop<T extends TaskDef>(tasks: T[]): { shop: string; items: T[] }[] {
  const groups: { shop: string; items: T[] }[] = [];
  for (const t of tasks) {
    const shop = t.shop?.trim() || "Outras compras";
    let g = groups.find((x) => x.shop === shop);
    if (!g) groups.push((g = { shop, items: [] }));
    g.items.push(t);
  }
  return groups;
}

/** Tarefas que um personagem deve ver: o main vê tudo; alts não veem as de servidor. */
export function tasksForRole<T extends TaskDef>(catalog: T[], role: CharacterRole): T[] {
  return catalog.filter((t) => role === "MAIN" || t.scope !== "servidor");
}

/** Descrição certa para o personagem (com ou sem membership). */
export function describe(task: TaskDef, member: boolean): string {
  return member && task.descriptionMember ? task.descriptionMember : task.description;
}

/** A tarefa aparece neste dia da semana? (só importa para "dias-fixos") */
export function occursOn(task: TaskDef, weekday: Weekday): boolean {
  return task.cadence !== "dias-fixos" || (task.days ?? []).includes(weekday);
}


export const WEEKDAY_SHORT: Record<Weekday, string> = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
