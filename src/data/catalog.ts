// Catálogo inicial de tarefas (revisado e aprovado na Etapa 4).
// Fonte: pesquisa do cliente Global de 27/10/2026 (ver CLAUDE.md).
// IMPORTANTE: não mudar os "id" depois de publicado — o histórico é salvo por eles.
import type { CharacterRole, TaskCadence, TaskDef, Weekday } from "./types";

/** Aumentar quando o catálogo padrão mudar, para a migração da Etapa 9/12 saber o que adicionar. */
export const CATALOG_VERSION = 1;

export const DEFAULT_CATALOG: TaskDef[] = [
  // ---------- Diárias ----------
  { id: "duty-missions", name: "Duty Missions", description: "5 missões do Diário (não acumulam)", scope: "servidor", cadence: "diaria", category: "missoes", enabledByDefault: true },
  { id: "daily-dungeon", name: "Daily Dungeon", description: "2 entradas por dia (14 na semana)", scope: "servidor", cadence: "ritmo", category: "dungeons", enabledByDefault: true },
  { id: "shugo-festival", name: "Shugo Festival", description: "Usar as chaves do dia", scope: "servidor", cadence: "diaria", category: "eventos", enabledByDefault: true },
  { id: "dimensional-invasion", name: "Dimensional Invasion", description: "Usar a chave do dia", scope: "servidor", cadence: "diaria", category: "eventos", enabledByDefault: true },
  { id: "nightmare", name: "Nightmare", description: "2 tentativas (só gasta se vencer)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: true },
  { id: "odyle-energy", name: "Odyle Energy", description: "Gastar em cubos de Conquest/Transcendence antes de encher (máx. 560)", descriptionMember: "Gastar em cubos de Conquest/Transcendence antes de encher (máx. 840)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: true },
  { id: "supply-requests-urgent", name: "Supply Requests (urgente)", description: "Entregas do dia por Abyss Points", scope: "personagem", cadence: "diaria", category: "missoes", enabledByDefault: false },
  { id: "abandoned-balaur-fortress", name: "Abandoned Balaur Fortress", description: "1 entrada por dia (acumula até 7)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: false },
  { id: "fafnium-laboratory", name: "Fafnium Laboratory", description: "1 entrada por dia (acumula até 7)", scope: "personagem", cadence: "diaria", category: "dungeons", enabledByDefault: false },

  // ---------- Semanais ----------
  { id: "ascension-trial", name: "Ascension Trial", description: "3 entradas", scope: "personagem", cadence: "semanal", category: "dungeons", enabledByDefault: true },
  { id: "subjugation", name: "Subjugation", description: "3 tickets", scope: "personagem", cadence: "semanal", category: "dungeons", enabledByDefault: true },
  { id: "sanctuary-ludra", name: "Sanctuary: Abyssal Forge (Ludra)", description: "1 kill do chefe final", scope: "personagem", cadence: "semanal", category: "raids", enabledByDefault: true },
  { id: "sanctuary-corroded", name: "Sanctuary: Corroded Decontamination Facility", description: "2 kills do chefe final", scope: "personagem", cadence: "semanal", category: "raids", enabledByDefault: true },
  { id: "sanctuary-muspel", name: "Sanctuary: Chalice of Muspel", description: "2 kills do chefe final", scope: "personagem", cadence: "semanal", category: "raids", enabledByDefault: true },
  { id: "exploration", name: "Exploration", description: "7 recompensas por dungeon de Expedition", scope: "personagem", cadence: "semanal", category: "dungeons", enabledByDefault: true },
  { id: "abyss", name: "Abyss", description: "7h por camada (Lower, Middle e Upper)", descriptionMember: "14h em Lower e Middle, 7h em Upper", scope: "personagem", cadence: "semanal", category: "abismo-pvp", enabledByDefault: true },
  { id: "growth-dungeons", name: "Growth Dungeons", description: "Silent Graveyard e Fafnite Amphitheater, 7h cada", scope: "personagem", cadence: "semanal", category: "dungeons", enabledByDefault: false },
  { id: "daeva-pass", name: "Daeva Pass", description: "Bater o limite semanal de EXP", scope: "personagem", cadence: "semanal", category: "missoes", enabledByDefault: true },
  { id: "arena-battlefield", name: "Arena / Battlefield", description: "Recompensas semanais de vitória e participação", scope: "personagem", cadence: "semanal", category: "abismo-pvp", enabledByDefault: false },
  { id: "abyss-corridor", name: "Abyss Corridor", description: "Usar as entradas antes do próximo Artifact Siege", scope: "personagem", cadence: "semanal", category: "abismo-pvp", enabledByDefault: false },
  { id: "odyle-morph-character", name: "Odyle Morph", description: "Transmutações semanais (4 por personagem)", scope: "personagem", cadence: "semanal", category: "lojas", enabledByDefault: false },
  { id: "shops-character", name: "Lojas: compras do personagem", description: "Resurrection Stone, Mana Stone, Silver Medal…", scope: "personagem", cadence: "semanal", category: "lojas", enabledByDefault: true },
  { id: "supply-requests-weekly", name: "Supply Requests (semanal)", description: "Entregas da semana", scope: "personagem", cadence: "semanal", category: "missoes", enabledByDefault: false },
  { id: "command-scrolls-pve", name: "Command Scrolls PvE", description: "12 compras na capital", scope: "servidor", cadence: "semanal", category: "lojas", enabledByDefault: true },
  { id: "command-scrolls-pvp", name: "Command Scrolls PvP", description: "20 compras no Abismo", scope: "servidor", cadence: "semanal", category: "lojas", enabledByDefault: true },
  { id: "shops-server", name: "Lojas: compras do servidor", description: "Potential Boost Stone, Soul Crystal, tickets…", scope: "servidor", cadence: "semanal", category: "lojas", enabledByDefault: true },
  { id: "odyle-morph-server", name: "Odyle Morph (servidor)", description: "16 transmutações compartilhadas", scope: "servidor", cadence: "semanal", category: "lojas", enabledByDefault: false },

  // ---------- Eventos em dias fixos ----------
  { id: "guardian-lord-nahma", name: "Guardian Lord Nahma (Abyss)", description: "Chefe de campo do Abismo", scope: "personagem", cadence: "dias-fixos", category: "eventos", days: [0, 5], time: "21:00 do servidor", enabledByDefault: false },
  { id: "abyss-executors", name: "Executors do Abyss", description: "Executor Tamasa, Kaira e Argo", scope: "personagem", cadence: "dias-fixos", category: "eventos", days: [1, 4, 6], time: "21:30 do servidor", enabledByDefault: false },
];

/* ---------- Funções de apoio ---------- */

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

export const CADENCE_LABEL: Record<TaskCadence, string> = {
  diaria: "Diária",
  ritmo: "Semanal com ritmo diário",
  semanal: "Semanal",
  "dias-fixos": "Dias fixos",
};

export const WEEKDAY_SHORT: Record<Weekday, string> = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
