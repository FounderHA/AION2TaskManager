import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG } from "./catalog";
import { defaultSettings, parseSettings, resolveCatalog } from "./settings";

describe("configurações", () => {
  it("sem nada salvo, usa o padrão (reset 07:00 UTC na quarta)", () => {
    expect(parseSettings(undefined)).toEqual(defaultSettings());
    expect(defaultSettings().reset).toEqual({ utcHour: 7, weeklyWeekday: 3 });
  });

  it("valores inválidos voltam ao padrão", () => {
    const s = parseSettings({ reset: { utcHour: 99, weeklyWeekday: "x" }, tasks: { nightmare: { enabled: "sim" } }, customTasks: [{ id: "hack", name: "x" }] });
    expect(s.reset).toEqual({ utcHour: 7, weeklyWeekday: 3 });
    expect(s.tasks).toEqual({});
    expect(s.customTasks).toEqual([]);
  });

  it("lê tarefa própria válida", () => {
    const s = parseSettings({ customTasks: [{ id: "custom-1", name: "Evento Halloween", description: "Abóboras", scope: "servidor", cadence: "dias-fixos", days: [5, 6] }] });
    expect(s.customTasks[0]).toMatchObject({ id: "custom-1", name: "Evento Halloween", scope: "servidor", cadence: "dias-fixos", days: [5, 6], enabledByDefault: true });
  });

  it("dias fixos sem nenhum dia vira diária", () => {
    const s = parseSettings({ customTasks: [{ id: "custom-2", name: "X", cadence: "dias-fixos", days: [] }] });
    expect(s.customTasks[0].cadence).toBe("diaria");
  });
});

describe("catálogo resolvido", () => {
  it("sem ajustes = catálogo padrão com o ligado/desligado padrão", () => {
    const c = resolveCatalog(defaultSettings());
    expect(c).toHaveLength(DEFAULT_CATALOG.length);
    expect(c.filter((t) => t.enabled)).toHaveLength(DEFAULT_CATALOG.filter((t) => t.enabledByDefault).length);
  });

  it("aplica ligar/desligar, descrição editada e inclui tarefas próprias", () => {
    const s = defaultSettings();
    s.tasks["nightmare"] = { enabled: false };
    s.tasks["growth-dungeons"] = { enabled: true };
    s.tasks["abyss"] = { description: "Fazer as 7h do Lower" };
    s.customTasks.push({ id: "custom-1", name: "Halloween", description: "", scope: "personagem", cadence: "diaria", category: "eventos", enabledByDefault: true });
    const c = resolveCatalog(s);
    const byId = (id: string) => c.find((t) => t.id === id)!;
    expect(byId("nightmare").enabled).toBe(false);
    expect(byId("growth-dungeons").enabled).toBe(true);
    expect(byId("abyss").description).toBe("Fazer as 7h do Lower");
    expect(byId("abyss").descriptionMember).toBeUndefined();
    expect(byId("abyss").descriptionEdited).toBe(true);
    expect(byId("custom-1")).toMatchObject({ custom: true, enabled: true });
  });
});

describe("ícones de GS e CP", () => {
  it("aceita só imagens em data URL", () => {
    const s = parseSettings({ icons: { gs: "data:image/png;base64,AAAA", cp: "http://site/x.png" } });
    expect(s.icons).toEqual({ gs: "data:image/png;base64,AAAA" });
  });
});
