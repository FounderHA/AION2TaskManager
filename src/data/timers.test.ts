import { describe, expect, it } from "vitest";
import { TIMER_CATALOG, barFraction, formatTimerCountdown, parseTimerSettings, sortKey, timerState } from "./timers";

const def = (id: string) => TIMER_CATALOG.find((d) => d.id === id)!;
const at = (iso: string) => Date.parse(iso);

describe("timerState", () => {
  it("Spacetime Rift: a cada 3h a partir de 00:00 do servidor (GMT+9) = 15:00 UTC", () => {
    // 06/11/2026 14:00 UTC = 23:00 do servidor → próximo às 00:00 do servidor (15:00 UTC)
    const st = timerState(def("spacetime-rift"), at("2026-11-06T14:00:00Z"), {});
    expect(st).toEqual({ kind: "next", start: at("2026-11-06T15:00:00Z"), prev: at("2026-11-06T12:00:00Z") });
  });
  it("fica 'acontecendo' durante a duração", () => {
    const st = timerState(def("spacetime-rift"), at("2026-11-06T15:05:00Z"), {});
    expect(st).toEqual({ kind: "live", start: at("2026-11-06T15:00:00Z"), end: at("2026-11-06T15:10:00Z") });
  });
  it("Watcher Kaira: 01:00 do servidor = 16:00 UTC do dia anterior", () => {
    const st = timerState(def("watcher-kaira"), at("2026-11-06T15:30:00Z"), {});
    expect(st.kind).toBe("next");
    if (st.kind === "next") expect(st.start).toBe(at("2026-11-06T16:00:00Z"));
  });
  it("semanal usa o dia da semana do servidor (sex 21:00 GMT+9 = sex 12:00 UTC)", () => {
    // qui 05/11/2026 20:00 UTC → Nahma sex/dom 21:00 do servidor
    const st = timerState(def("nahma"), at("2026-11-05T20:00:00Z"), {});
    expect(st.kind).toBe("next");
    if (st.kind === "next") expect(st.start).toBe(at("2026-11-06T12:00:00Z"));
  });
  it("Executors seg/qui/sáb 21:30 do servidor", () => {
    // sex 06/11 13:00 UTC → próximo sáb 07/11 21:30 GMT+9 = 12:30 UTC
    const st = timerState(def("executors"), at("2026-11-06T13:00:00Z"), {});
    if (st.kind === "next") expect(st.start).toBe(at("2026-11-07T12:30:00Z"));
    else throw new Error("esperava next");
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
    const now = at("2026-11-06T15:05:00Z");
    const ks = ["spacetime-rift", "watcher-kaira", "nahma"].map((id) => sortKey(timerState(def(id), now, {})));
    expect(ks[0][0]).toBe(0);
    expect(ks[1][1]).toBeLessThan(ks[2][1]);
  });
  it("barra enche rumo ao próximo início", () => {
    const st = timerState(def("spacetime-rift"), at("2026-11-06T13:30:00Z"), {});
    expect(barFraction(st, at("2026-11-06T13:30:00Z"))).toBeCloseTo(0.5, 2);
  });
  it("contagem", () => {
    expect(formatTimerCountdown(65_000)).toBe("01:05");
    expect(formatTimerCountdown(3 * 3600_000 + 5 * 60_000)).toBe("3h 05m");
    expect(formatTimerCountdown(28 * 3600_000)).toBe("1d 4h");
  });
  it("parse tolerante", () => {
    expect(parseTimerSettings({ enabled: { a: true, b: "x" }, kills: { c: "lixo", d: "2026-11-06T10:00:00Z" } })).toEqual({ enabled: { a: true }, kills: { d: "2026-11-06T10:00:00Z" } });
  });
});
