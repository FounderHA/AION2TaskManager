import { describe, expect, it } from "vitest";
import { TIMER_CATALOG, barFraction, formatTimerCountdown, parseTimerSettings, sortKey, timerState, zonedToUtc } from "./timers";

const def = (id: string) => TIMER_CATALOG.find((d) => d.id === id)!;
const at = (iso: string) => Date.parse(iso);

describe("relógio da região", () => {
  it("São Paulo é UTC-3 (sem horário de verão)", () => {
    expect(zonedToUtc(2026, 11, 7, 21, 0, "America/Sao_Paulo")).toBe(at("2026-11-08T00:00:00Z"));
  });
  it("Berlim no inverno é UTC+1 e no verão UTC+2", () => {
    expect(zonedToUtc(2026, 11, 7, 21, 0, "Europe/Berlin")).toBe(at("2026-11-07T20:00:00Z"));
    expect(zonedToUtc(2026, 7, 7, 21, 0, "Europe/Berlin")).toBe(at("2026-07-07T19:00:00Z"));
  });
});

describe("timerState (América do Sul)", () => {
  it("Spacetime Rift: 02:00, 05:00 … 23:00 de Brasília", () => {
    // sáb 07/11 00:34 BRT (03:34 UTC) → próximo 02:00 BRT (05:00 UTC), anterior 23:00 BRT de sexta
    const st = timerState(def("spacetime-rift"), at("2026-11-07T03:34:00Z"), {});
    expect(st).toEqual({ kind: "next", start: at("2026-11-07T05:00:00Z"), prev: at("2026-11-07T02:00:00Z") });
  });
  it("fica 'acontecendo' durante a duração", () => {
    const st = timerState(def("spacetime-rift"), at("2026-11-07T05:05:00Z"), {});
    expect(st).toEqual({ kind: "live", start: at("2026-11-07T05:00:00Z"), end: at("2026-11-07T05:10:00Z") });
  });
  it("Watcher Kaira: 01:00, 04:00 … 22:00 de Brasília", () => {
    const st = timerState(def("watcher-kaira"), at("2026-11-07T03:34:00Z"), {});
    if (st.kind !== "next") throw new Error("esperava next");
    expect(st.start).toBe(at("2026-11-07T04:00:00Z")); // 01:00 BRT
  });
  it("Artifact Siege: quinta e sábado 21:00 de Brasília", () => {
    const st = timerState(def("artifact-siege"), at("2026-11-07T03:34:00Z"), {});
    if (st.kind !== "next") throw new Error("esperava next");
    expect(st.start).toBe(at("2026-11-08T00:00:00Z")); // sáb 07/11 21:00 BRT
  });
  it("Nahma: sexta e domingo 21:00 de Brasília", () => {
    const st = timerState(def("nahma"), at("2026-11-07T03:34:00Z"), {});
    if (st.kind !== "next") throw new Error("esperava next");
    expect(st.start).toBe(at("2026-11-09T00:00:00Z")); // dom 08/11 21:00 BRT
  });
  it("outra região usa o relógio dela (Europa: siege sáb 21:00 de Berlim = 20:00 UTC)", () => {
    const st = timerState(def("artifact-siege"), at("2026-11-07T03:34:00Z"), {}, "eu");
    if (st.kind !== "next") throw new Error("esperava next");
    expect(st.start).toBe(at("2026-11-07T20:00:00Z"));
  });
  it("respawn: sem morte marcada, depois contando, depois renascido", () => {
    const d = def("silent-dartan");
    expect(timerState(d, at("2026-11-06T10:00:00Z"), {}).kind).toBe("unknown");
    const kills = { "silent-dartan": "2026-11-06T10:00:00.000Z" };
    expect(timerState(d, at("2026-11-06T12:00:00Z"), kills)).toEqual({ kind: "next", start: at("2026-11-06T16:00:00Z"), prev: at("2026-11-06T10:00:00Z") });
    expect(timerState(d, at("2026-11-06T17:00:00Z"), kills)).toEqual({ kind: "spawned", start: at("2026-11-06T16:00:00Z") });
  });
});

describe("ordem, barra e textos", () => {
  it("acontecendo vem antes do próximo; próximo por horário", () => {
    const now = at("2026-11-07T05:05:00Z");
    const ks = ["spacetime-rift", "watcher-kaira", "nahma"].map((id) => sortKey(timerState(def(id), now, {})));
    expect(ks[0][0]).toBe(0);
    expect(ks[1][1]).toBeLessThan(ks[2][1]);
  });
  it("barra enche rumo ao próximo início", () => {
    const st = timerState(def("spacetime-rift"), at("2026-11-07T03:30:00Z"), {});
    expect(barFraction(st, at("2026-11-07T03:30:00Z"))).toBeCloseTo(0.5, 2);
  });
  it("contagem", () => {
    expect(formatTimerCountdown(65_000)).toBe("01:05");
    expect(formatTimerCountdown(3 * 3600_000 + 5 * 60_000)).toBe("3h 05m");
    expect(formatTimerCountdown(28 * 3600_000)).toBe("1d 4h");
  });
  it("parse tolerante (região padrão = América do Sul)", () => {
    expect(parseTimerSettings({ region: "xx", enabled: { a: true, b: "x" }, kills: { c: "lixo", d: "2026-11-06T10:00:00Z" } })).toEqual({ region: "sa", alerts: { on: true, lead: 5, volume: 70, system: true, events: {} }, enabled: { a: true }, kills: { d: "2026-11-06T10:00:00Z" } });
    expect(parseTimerSettings({ region: "eu" }).region).toBe("eu");
  });
});

import { defaultTimerSettings, dueAlerts } from "./timers";

describe("avisos", () => {
  it("avisa 5 min antes, uma vez só", () => {
    const s = defaultTimerSettings();
    // Rift às 02:00 BRT (05:00 UTC); 4 min antes
    const now = at("2026-11-07T04:56:00Z");
    const due = dueAlerts(s, now, new Set());
    const rift = due.find((d) => d.def.id === "spacetime-rift");
    expect(rift?.start).toBe(at("2026-11-07T05:00:00Z"));
    expect(dueAlerts(s, now, new Set([rift!.key])).some((d) => d.def.id === "spacetime-rift")).toBe(false);
  });
  it("não avisa cedo demais, nem desligado", () => {
    const s = defaultTimerSettings();
    expect(dueAlerts(s, at("2026-11-07T04:50:00Z"), new Set()).some((d) => d.def.id === "spacetime-rift")).toBe(false);
    s.alerts.events["spacetime-rift"] = false;
    expect(dueAlerts(s, at("2026-11-07T04:56:00Z"), new Set()).some((d) => d.def.id === "spacetime-rift")).toBe(false);
    s.alerts.on = false;
    expect(dueAlerts(s, at("2026-11-07T04:56:00Z"), new Set())).toEqual([]);
  });
  it("na hora (lead 0): só no primeiro minuto", () => {
    const s = defaultTimerSettings();
    s.alerts.lead = 0;
    expect(dueAlerts(s, at("2026-11-07T05:00:30Z"), new Set()).some((d) => d.def.id === "spacetime-rift")).toBe(true);
    expect(dueAlerts(s, at("2026-11-07T05:02:00Z"), new Set()).some((d) => d.def.id === "spacetime-rift")).toBe(false);
  });
});
