import { describe, expect, it } from "vitest";
import { addCharged, currentOdyle, nextTickAfter, reanchor, rulesFor, snapshotFromInput, spend, ticksBetween } from "./odyle";
import { DEFAULT_ODYLE } from "./settings";

// Horário de Brasília = UTC-3
const brt = (iso: string) => new Date(`${iso}-03:00`);
const member = rulesFor(DEFAULT_ODYLE, true); // 840, +15
const free = rulesFor(DEFAULT_ODYLE, false); // 560, +10

describe("horários de recarga (01h, 04h, 07h … de Brasília)", () => {
  it("próxima recarga", () => {
    expect(new Date(nextTickAfter(brt("2026-10-28T01:01").getTime()))).toEqual(brt("2026-10-28T04:00"));
    expect(new Date(nextTickAfter(brt("2026-10-28T00:59").getTime()))).toEqual(brt("2026-10-28T01:00"));
    expect(new Date(nextTickAfter(brt("2026-10-28T22:30").getTime()))).toEqual(brt("2026-10-29T01:00"));
  });
  it("conta as recargas no intervalo (início exclusivo, fim inclusivo)", () => {
    const a = brt("2026-10-28T00:59").getTime();
    expect(ticksBetween(a, brt("2026-10-28T01:00").getTime())).toBe(1);
    expect(ticksBetween(brt("2026-10-28T01:00").getTime(), brt("2026-10-28T03:59").getTime())).toBe(0);
    expect(ticksBetween(a, brt("2026-10-28T10:00").getTime())).toBe(4); // 01, 04, 07, 10
  });
});

describe("valor atual", () => {
  it("print do usuário: 45/840 à 01:01 com membership → +15 às 04:00", () => {
    const snap = { basic: 45, charged: 920, at: brt("2026-10-28T01:01").toISOString() };
    expect(currentOdyle(snap, member, brt("2026-10-28T03:59")).basic).toBe(45);
    const at4 = currentOdyle(snap, member, brt("2026-10-28T04:00"));
    expect(at4).toMatchObject({ basic: 60, charged: 920, level: "ok" });
    expect(at4.nextTick).toEqual(brt("2026-10-28T07:00"));
  });
  it("sem membership: +10 até 560", () => {
    const snap = { basic: 540, charged: 0, at: brt("2026-10-28T01:30").toISOString() };
    expect(currentOdyle(snap, free, brt("2026-10-28T04:00")).basic).toBe(550);
    expect(currentOdyle(snap, free, brt("2026-10-28T23:00")).basic).toBe(560);
  });
  it("para no limite e avisa a partir de limite − 40", () => {
    const snap = { basic: 790, charged: 0, at: brt("2026-10-28T01:30").toISOString() };
    const a = currentOdyle(snap, member, brt("2026-10-28T04:30"));
    expect(a).toMatchObject({ basic: 805, level: "warn" });
    expect(a.fullAt).toEqual(brt("2026-10-28T13:00")); // 820, 835, 840
    const b = currentOdyle(snap, member, brt("2026-10-29T12:00"));
    expect(b).toMatchObject({ basic: 840, level: "full", fullAt: null });
  });
});

describe("gastar e adicionar", () => {
  const now = brt("2026-10-28T05:00");
  it("gasta da Basic primeiro, depois da Charged", () => {
    const snap = { basic: 30, charged: 100, at: now.toISOString() };
    expect(spend(snap, member, 40, now)).toEqual({ basic: 0, charged: 90, at: now.toISOString() });
    expect(spend(snap, member, 80, now)).toEqual({ basic: 0, charged: 50, at: now.toISOString() });
  });
  it("não deixa gastar mais do que tem", () => {
    expect(spend({ basic: 20, charged: 10, at: now.toISOString() }, member, 40, now)).toBeNull();
  });
  it("gastar usa o valor já recarregado", () => {
    const snap = { basic: 0, charged: 0, at: brt("2026-10-28T00:30").toISOString() };
    // recargas às 01:00 e 04:00 → 30; não dá para gastar 40
    expect(spend(snap, member, 40, now)).toBeNull();
    expect(reanchor(snap, member, now)).toEqual({ basic: 30, charged: 0, at: now.toISOString() });
  });
  it("Charged vai até 2000", () => {
    expect(addCharged({ basic: 0, charged: 1990, at: now.toISOString() }, member, 40, now).charged).toBe(2000);
  });
  it("valores digitados ficam dentro dos limites", () => {
    expect(snapshotFromInput(999, 5000, member, now)).toEqual({ basic: 840, charged: 2000, at: now.toISOString() });
  });
});
