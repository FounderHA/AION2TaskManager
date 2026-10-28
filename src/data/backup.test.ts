import { describe, expect, it } from "vitest";
import { backupFileName, makeBackup, readBackup, snapshotName } from "./backup";
import type { AppData } from "./model";
import { defaultSettings } from "./settings";

const data: AppData = {
  schemaVersion: 1,
  characters: [
    { id: "m1", name: "Kaelith", className: "Sorcerer", faction: "Elyos", role: "MAIN", createdAt: "2026-10-01T00:00:00Z", gs: null, cp: null, odyle: null },
    { id: "a1", name: "Varos", className: "Gladiator", faction: "Elyos", role: "ALT", createdAt: "2026-10-02T00:00:00Z", gs: null, cp: null, odyle: null },
  ],
  checks: {
    "SERVER|duty-missions|d:2026-10-21": "2026-10-21T20:00:00Z",
    "m1|nightmare|d:2026-10-27": "2026-10-27T20:00:00Z",
    "m1|ascension-trial|w:2026-10-21": "2026-10-22T20:00:00Z",
  },
  settings: defaultSettings(),
};

describe("backup", () => {
  it("exportar e importar devolve exatamente os mesmos dados", () => {
    const text = makeBackup(data, "0.9.0", new Date("2026-10-27T23:30:00Z"));
    const r = readBackup(text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toEqual(data);
    expect(r.summary).toEqual({
      exportedAt: "2026-10-27T23:30:00.000Z",
      appVersion: "0.9.0",
      characters: 2,
      mainName: "Kaelith",
      checks: 3,
      firstDay: "2026-10-21",
      lastDay: "2026-10-27",
    });
  });
  it("aceita o dados.json puro copiado da pasta do app", () => {
    const r = readBackup(JSON.stringify(data));
    expect(r.ok && r.data.characters.length).toBe(2);
    expect(r.ok && r.summary.exportedAt).toBe(null);
  });
  it("recusa arquivo que não é JSON", () => {
    const r = readBackup("isso não é json");
    expect(r.ok).toBe(false);
  });
  it("recusa JSON que não é backup", () => {
    expect(readBackup(JSON.stringify({ foo: 1 })).ok).toBe(false);
    expect(readBackup("[]").ok).toBe(false);
  });
  it("nomes de arquivo", () => {
    const d = new Date(2026, 9, 27, 23, 5, 9);
    expect(backupFileName(d)).toBe("AION2-backup-2026-10-27.json");
    expect(snapshotName(d)).toBe("antes-de-importar-20261027-230509");
    expect(/^[A-Za-z0-9-]+$/.test(snapshotName(d))).toBe(true);
  });
});
