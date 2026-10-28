import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG } from "./catalog";
import { activeTasks, cellState, dayCheckKey, earliestCheckDay, existedInWeek, SERVER_OWNER, weekCheckKey, weekProgress, type Checks } from "./checks";
import type { Character } from "./model";
import { weekDayKeys } from "../time/gameTime";

const main: Character = { id: "m1", name: "Kaelith", className: "Sorcerer", faction: "Elyos", role: "MAIN", member: true, createdAt: "2026-10-01T00:00:00Z" };
const alt: Character = { id: "a1", name: "Varos", className: "Gladiator", faction: "Elyos", role: "ALT", member: false, createdAt: "2026-10-02T00:00:00Z" };
const task = (id: string) => DEFAULT_CATALOG.find((t) => t.id === id)!;
const WEEK = "2026-10-28"; // quarta
const days = weekDayKeys(WEEK);
const byDefault = (t: { enabledByDefault: boolean }) => t.enabledByDefault;

describe("chaves de marcação", () => {
  it("tarefa de servidor é gravada no servidor, não no personagem", () => {
    expect(dayCheckKey(task("duty-missions"), main, "2026-10-28")).toBe(`${SERVER_OWNER}|duty-missions|d:2026-10-28`);
    expect(weekCheckKey(task("command-scrolls-pve"), main, WEEK)).toBe(`${SERVER_OWNER}|command-scrolls-pve|w:${WEEK}`);
  });
  it("tarefa de personagem é gravada no personagem", () => {
    expect(dayCheckKey(task("nightmare"), alt, "2026-10-28")).toBe("a1|nightmare|d:2026-10-28");
  });
});

describe("tarefas ativas", () => {
  it("alt não recebe tarefas de servidor", () => {
    expect(activeTasks(DEFAULT_CATALOG, alt, byDefault).some((t) => t.scope === "servidor")).toBe(false);
    expect(activeTasks(DEFAULT_CATALOG, main, byDefault).some((t) => t.scope === "servidor")).toBe(true);
  });
});

describe("estado das células", () => {
  const nm = task("nightmare");
  it("passado sem marcar = perdida; hoje = pendente; futuro = futuro", () => {
    expect(cellState({}, nm, alt, days, 0, 2)).toBe("missed");
    expect(cellState({}, nm, alt, days, 2, 2)).toBe("today");
    expect(cellState({}, nm, alt, days, 5, 2)).toBe("future");
  });
  it("marcado = feito, mesmo num dia passado", () => {
    const checks: Checks = { [dayCheckKey(nm, alt, days[0])]: "x" };
    expect(cellState(checks, nm, alt, days, 0, 2)).toBe("done");
  });
  it("evento de dias fixos só existe nos dias dele", () => {
    const nahma = task("guardian-lord-nahma"); // domingo e sexta
    expect(cellState({}, nahma, alt, days, 1, 6)).toBe("none"); // quinta
    expect(cellState({}, nahma, alt, days, 2, 6)).toBe("missed"); // sexta
    expect(cellState({}, nahma, alt, days, 4, 6)).toBe("missed"); // domingo
  });
});

describe("progresso da semana", () => {
  const tasks = [task("nightmare"), task("ascension-trial")];
  it("conta só os dias até hoje + as semanais", () => {
    // hoje = sexta (índice 2): 3 dias de Nightmare + 1 semanal = 4 itens devidos
    const checks: Checks = {
      [dayCheckKey(tasks[0], alt, days[0])]: "x",
      [dayCheckKey(tasks[0], alt, days[2])]: "x",
      [weekCheckKey(tasks[1], alt, WEEK)]: "x",
    };
    const p = weekProgress(checks, tasks, alt, days, 2, WEEK);
    expect(p).toEqual({ percent: 75, doneToday: 1, totalToday: 1, missed: 1, weeklyDone: 1, weeklyTotal: 1, dailyDone: 2, dailyTotal: 3 });
  });
  it("semana sem nada marcado = 0%", () => {
    expect(weekProgress({}, tasks, alt, days, 0, WEEK).percent).toBe(0);
  });
});

describe("histórico", () => {
  it("semana passada inteira: todos os 7 dias contam (todayIndex = 7)", () => {
    const nm = task("nightmare");
    const checks: Checks = { [dayCheckKey(nm, alt, days[0])]: "x" };
    const p = weekProgress(checks, [nm], alt, days, 7, WEEK);
    expect(p.dailyTotal).toBe(7);
    expect(p.dailyDone).toBe(1);
    expect(p.missed).toBe(6);
  });
  it("dia mais antigo com marcação", () => {
    expect(earliestCheckDay({ "a|x|d:2026-10-25": "x", "a|y|w:2026-10-21": "x" })).toBe("2026-10-21");
    expect(earliestCheckDay({})).toBe(null);
  });
  it("personagem criado depois da semana não aparece nela (a não ser que tenha marcações)", () => {
    const late = { ...alt, id: "late", createdAt: "2026-11-10T00:00:00Z" };
    expect(existedInWeek(late, {}, WEEK, "2026-11-03")).toBe(false);
    expect(existedInWeek(late, { "late|nightmare|d:2026-10-30": "x" }, WEEK, "2026-11-03")).toBe(true);
    expect(existedInWeek(alt, {}, WEEK, "2026-11-03")).toBe(true);
  });
});
