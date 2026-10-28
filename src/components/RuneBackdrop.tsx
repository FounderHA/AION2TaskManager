// Fundo animado: névoa fria, anéis de runas girando devagar e brasas subindo.
// Arte original (runas desenhadas à mão como traços SVG). Fica atrás de tudo e não recebe cliques.
import { memo } from "react";

/** Runas do alfabeto Elder Futhark desenhadas numa grade 10×16 (só traços retos). */
const RUNES = [
  "M3 0V16M3 3L8 0M3 7L8 4", // fehu
  "M2 16V0L8 5V16", // uruz
  "M3 0V16M3 4L7 8L3 12", // thurisaz
  "M3 0V16M3 0L8 4M3 5L8 9", // ansuz
  "M2 16V0L7 4L2 8L8 16", // raido
  "M7 3L3 8L7 13", // kaunan
  "M2 2L8 14M8 2L2 14", // gebo
  "M3 0V16M3 0L7 4L3 8", // wunjo
  "M2 0V16M8 0V16M2 6L8 10", // hagalaz
  "M5 0V16M2 6L8 10", // naudiz
  "M5 0V16", // isa
  "M4 2L1 6L4 10M6 6L9 10L6 14", // jera
  "M5 0V16M5 0L8 3M5 16L2 13", // eihwaz
  "M3 0V16M3 0L7 3M3 16L7 13", // perth
  "M5 0V16M5 6L1 2M5 6L9 2", // algiz
  "M7 1L3 6L7 10L3 15", // sowilo
  "M5 0V16M5 0L1 5M5 0L9 5", // tiwaz
  "M3 0V16M3 0L7 4L3 8L7 12L3 16", // berkanan
  "M2 16V0L5 5L8 0V16", // ehwaz
  "M2 16V0L8 8M8 16V0L2 8", // mannaz
  "M3 0V16M3 0L8 5", // laguz
  "M5 2L9 8L5 14L1 8Z", // ingwaz
  "M1 1V15L9 1V15Z", // dagaz
  "M1 16L7 6L4 1L1 6L7 16", // othala
];

/** Anel com runas em volta, marcações e um nó geométrico no centro. */
function RuneRing({ size, runes, inner = true, seed = 0 }: { size: number; runes: number; inner?: boolean; seed?: number }) {
  const c = 500;
  const rOuter = 470;
  const rRunes = 420;
  const rInner = 372;
  const glyphs = Array.from({ length: runes }, (_, i) => RUNES[(i * 7 + seed) % RUNES.length]);
  return (
    <svg viewBox="0 0 1000 1000" width={size} height={size} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx={c} cy={c} r={rOuter} strokeWidth="2" />
        <circle cx={c} cy={c} r={rOuter - 12} strokeWidth="1" opacity="0.55" />
        <circle cx={c} cy={c} r={rInner} strokeWidth="1.5" />
        {/* runas */}
        {glyphs.map((d, i) => {
          const a = (i / runes) * 360;
          return (
            <g key={i} transform={`rotate(${a} ${c} ${c}) translate(${c - 15} ${c - rRunes - 24}) scale(3)`}>
              <path d={d} strokeWidth="1" />
            </g>
          );
        })}
        {/* marcações entre o anel e o miolo */}
        {Array.from({ length: 96 }, (_, i) => {
          const a = (i / 96) * Math.PI * 2;
          const len = i % 4 === 0 ? 22 : 9;
          const r1 = rInner - 6;
          const r2 = r1 - len;
          return <line key={i} x1={c + Math.cos(a) * r1} y1={c + Math.sin(a) * r1} x2={c + Math.cos(a) * r2} y2={c + Math.sin(a) * r2} strokeWidth={i % 4 === 0 ? 2 : 1} />;
        })}
        {inner && (
          <g strokeWidth="2">
            <circle cx={c} cy={c} r="250" opacity="0.6" />
            {/* três círculos entrelaçados + losango central */}
            {[0, 120, 240].map((a) => {
              const rad = ((a - 90) * Math.PI) / 180;
              return <circle key={a} cx={c + Math.cos(rad) * 78} cy={c + Math.sin(rad) * 78} r="120" opacity="0.8" />;
            })}
            <path d={`M ${c} ${c - 120} L ${c + 120} ${c} L ${c} ${c + 120} L ${c - 120} ${c} Z`} />
            <path d={`M ${c} ${c - 70} L ${c + 70} ${c} L ${c} ${c + 70} L ${c - 70} ${c} Z`} opacity="0.7" />
            <circle cx={c} cy={c} r="14" />
          </g>
        )}
      </g>
    </svg>
  );
}

/** Posições fixas das brasas (sem aleatoriedade a cada render). */
const EMBERS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: -((i * 2.3) % 18),
  duration: 14 + ((i * 5) % 12),
  size: 2 + (i % 3),
  drift: ((i % 5) - 2) * 18,
}));

export const RuneBackdrop = memo(function RuneBackdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__fog backdrop__fog--a" />
      <div className="backdrop__fog backdrop__fog--b" />
      <div className="backdrop__ring backdrop__ring--main">
        <div className="backdrop__spin backdrop__spin--slow">
          <RuneRing size={1100} runes={24} />
        </div>
      </div>
      <div className="backdrop__ring backdrop__ring--inner">
        <div className="backdrop__spin backdrop__spin--reverse">
          <RuneRing size={560} runes={16} inner={false} seed={3} />
        </div>
      </div>
      <div className="backdrop__ring backdrop__ring--small">
        <div className="backdrop__spin backdrop__spin--mid">
          <RuneRing size={520} runes={18} seed={5} />
        </div>
      </div>
      <div className="backdrop__embers">
        {EMBERS.map((e, i) => (
          <span key={i} style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDelay: `${e.delay}s`, animationDuration: `${e.duration}s`, ["--drift" as string]: `${e.drift}px` }} />
        ))}
      </div>
      <div className="backdrop__vignette" />
    </div>
  );
});
