// Efeito de "Dia completo": asas de luz e anel de runas acendendo quando um personagem
// fecha todas as diárias do dia (e um efeito maior quando a conta inteira fecha).
// Só dispara por marcação feita agora, nunca ao abrir o app ou na virada do dia.
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../data/store";
import { charDays, completeToday } from "../data/today";

type Fx = { id: number; title: string; name: string; all: boolean };

const FEATHERS = [0, 1, 2, 3, 4, 5];

function Wing({ side }: { side: "left" | "right" }) {
  return (
    <g transform={side === "left" ? "translate(200 120) scale(-1 1)" : "translate(200 120)"}>
     <g className="fx-wing">
      {FEATHERS.map((i) => {
        const angle = -38 + i * 15;
        const len = 150 - i * 14;
        return (
          <g key={i} transform={`rotate(${angle}) translate(46 0)`}>
            <path className="fx-feather" style={{ animationDelay: `${0.15 + i * 0.06}s` }} d={`M0 0 C ${len * 0.35} -14, ${len * 0.75} -12, ${len} 0 C ${len * 0.75} 9, ${len * 0.35} 10, 0 0 Z`} />
          </g>
        );
      })}
     </g>
    </g>
  );
}

export function DayCompleteFx({ todayKey, weekKey }: { todayKey: string; weekKey: string }) {
  const { characters, data, catalog } = useStore();
  const rows = useMemo(() => charDays(catalog, characters, data.checks, todayKey, weekKey), [catalog, characters, data.checks, todayKey, weekKey]);
  const done = useMemo(() => completeToday(rows), [rows]);
  const prev = useRef<{ day: string; set: Set<string>; chars: unknown; catalog: unknown } | null>(null);
  const [fx, setFx] = useState<Fx | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    const p = prev.current;
    prev.current = { day: todayKey, set: done, chars: data.characters, catalog };
    // Primeira leitura, dados carregados/importados, catálogo mudou ou dia novo: só registra
    if (!p || p.day !== todayKey || p.chars !== data.characters || p.catalog !== catalog || characters.length === 0) return;
    const newly = [...done].filter((id) => !p.set.has(id));
    if (!newly.length) return;
    const withDaily = rows.filter((r) => r.daily.length > 0);
    const all = withDaily.length > 1 && done.size === withDaily.length;
    const char = characters.find((c) => c.id === newly[0]);
    counter.current += 1;
    setFx({
      id: counter.current,
      all,
      title: all ? "Todas as diárias de hoje concluídas!" : "Dia completo",
      name: all ? `${withDaily.length} personagens` : (char?.name ?? ""),
    });
  }, [done, todayKey, rows, characters, data.characters, catalog]);

  useEffect(() => {
    if (!fx) return;
    const t = setTimeout(() => setFx(null), fx.all ? 4200 : 3200);
    return () => clearTimeout(t);
  }, [fx]);

  if (!fx) return null;
  return (
    <div key={fx.id} className={`fx-day ${fx.all ? "fx-day--all" : ""}`} aria-live="polite">
      <div className="fx-day__flash" />
      <svg className="fx-day__art" viewBox="0 0 400 240" aria-hidden="true">
        <defs>
          <radialGradient id="fx-glow">
            <stop offset="0%" stopColor="#fff3cf" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#f3c25a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f3c25a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="fx-glow" cx="200" cy="120" r="110" fill="url(#fx-glow)" />
        <Wing side="left" />
        <Wing side="right" />
        <g className="fx-ring">
          <circle cx="200" cy="120" r="44" />
          <circle cx="200" cy="120" r="36" opacity="0.6" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r1 = 44;
            const r2 = i % 2 ? 50 : 56;
            return <line key={i} x1={200 + Math.cos(a) * r1} y1={120 + Math.sin(a) * r1} x2={200 + Math.cos(a) * r2} y2={120 + Math.sin(a) * r2} />;
          })}
          <path d="M200 96 L224 120 L200 144 L176 120 Z" />
          <path d="M200 108 L212 120 L200 132 L188 120 Z" className="fx-core" />
        </g>
      </svg>
      <div className="fx-day__text">
        <span className="fx-day__title">✦ {fx.title}</span>
        <span className="fx-day__name">{fx.name}</span>
      </div>
    </div>
  );
}
