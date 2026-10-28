import { describe, expect, it } from "vitest";
import { addDays, formatCountdown, gameDayKey, gameWeekday, keyToUtcMidnight, nextDailyReset, nextWeeklyReset, weekDayKeys, weekRangeLabel, weekStartKey } from "./gameTime";

// Horário de Brasília = UTC-3 (sem horário de verão). Ajuda a escrever os casos.
const brt = (iso: string) => new Date(`${iso}-03:00`);

describe("dia do jogo", () => {
  it("terça 22:09 em Brasília ainda é terça", () => {
    expect(gameDayKey(brt("2026-10-27T22:09"))).toBe("2026-10-27");
  });
  it("quarta 03:59 ainda conta como terça (antes do reset)", () => {
    expect(gameDayKey(brt("2026-10-28T03:59"))).toBe("2026-10-27");
  });
  it("quarta 04:00 já é quarta", () => {
    expect(gameDayKey(brt("2026-10-28T04:00"))).toBe("2026-10-28");
  });
  it("jogar até 2h da manhã de quinta conta como quarta", () => {
    expect(gameDayKey(brt("2026-10-29T02:00"))).toBe("2026-10-28");
  });
});

describe("semana do jogo (quarta 04:00 → terça 03:59)", () => {
  it("terça 27/10 está na semana que começou quarta 21/10", () => {
    expect(weekStartKey("2026-10-27")).toBe("2026-10-21");
  });
  it("quarta 28/10 abre uma semana nova", () => {
    expect(weekStartKey("2026-10-28")).toBe("2026-10-28");
  });
  it("domingo 01/11 é o 5º dia da semana de 28/10", () => {
    const days = weekDayKeys(weekStartKey("2026-11-01"));
    expect(days[0]).toBe("2026-10-28");
    expect(days.indexOf("2026-11-01")).toBe(4);
    expect(days[6]).toBe("2026-11-03");
  });
  it("virada de ano funciona", () => {
    expect(weekStartKey("2027-01-02")).toBe("2026-12-30");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("em qualquer hora de um ano inteiro a semana começa numa quarta e contém o dia", () => {
    const start = Date.UTC(2026, 0, 1);
    for (let h = 0; h < 366 * 24; h += 1) {
      const day = gameDayKey(new Date(start + h * 3_600_000));
      const week = weekStartKey(day);
      expect(gameWeekday(week)).toBe(3);
      const diff = (keyToUtcMidnight(day) - keyToUtcMidnight(week)) / 86_400_000;
      expect(diff).toBeGreaterThanOrEqual(0);
      expect(diff).toBeLessThan(7);
    }
  });
});

describe("próximos resets", () => {
  it("terça 22:09 → diário e semanal na quarta 04:00", () => {
    const now = brt("2026-10-27T22:09");
    expect(nextDailyReset(now).toISOString()).toBe("2026-10-28T07:00:00.000Z");
    expect(nextWeeklyReset(now).toISOString()).toBe("2026-10-28T07:00:00.000Z");
  });
  it("quarta 04:00 em ponto → próximo semanal só na outra quarta", () => {
    const now = brt("2026-10-28T04:00");
    expect(nextDailyReset(now).toISOString()).toBe("2026-10-29T07:00:00.000Z");
    expect(nextWeeklyReset(now).toISOString()).toBe("2026-11-04T07:00:00.000Z");
  });
});

describe("textos", () => {
  it("intervalo da semana", () => {
    expect(weekRangeLabel("2026-10-21")).toBe("21 – 27 out");
    expect(weekRangeLabel("2026-10-28")).toBe("28 out – 3 nov");
  });
  it("contagem regressiva", () => {
    const min = 60_000;
    expect(formatCountdown(0)).toBe("agora");
    expect(formatCountdown(30_000)).toBe("menos de 1m");
    expect(formatCountdown(12 * min)).toBe("12m");
    expect(formatCountdown((9 * 60 + 5) * min)).toBe("9h 05m");
    expect(formatCountdown((2 * 1440 + 5 * 60 + 30) * min)).toBe("2d 5h");
  });
});
