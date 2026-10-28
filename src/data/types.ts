// Tipos do catálogo de tarefas.

/** personagem: cada personagem tem a própria cota (main e alts).
 *  servidor: cota dividida entre todos do servidor → aparece só no main. */
export type TaskScope = "personagem" | "servidor";

/** diaria:     1 check por dia
 *  ritmo:      tarefa semanal dividida em 1 check por dia com a meta do dia
 *  semanal:    1 check único na semana
 *  dias-fixos: 1 check só nos dias em que o evento acontece */
export type TaskCadence = "diaria" | "ritmo" | "semanal" | "dias-fixos";

export type TaskCategory = "missoes" | "dungeons" | "raids" | "abismo-pvp" | "lojas" | "eventos";

/** Dia da semana no padrão do JavaScript: 0 = domingo … 6 = sábado. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type CharacterRole = "MAIN" | "ALT";

export interface TaskDef {
  /** Identificador estável (nunca mudar: o histórico é gravado por ele). */
  id: string;
  /** Nome como aparece no cliente do jogo (inglês). */
  name: string;
  /** Explicação curta em português. */
  description: string;
  /** Texto alternativo para personagens com membership (quando muda algo). */
  descriptionMember?: string;
  scope: TaskScope;
  cadence: TaskCadence;
  category: TaskCategory;
  /** Só para cadence "dias-fixos". */
  days?: Weekday[];
  /** Horário de referência do evento (texto livre, horário do servidor). */
  time?: string;
  enabledByDefault: boolean;
}
