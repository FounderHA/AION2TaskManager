// Guia · Genus Insight: medalhão de cada categoria com os 9 slots em volta (como no jogo)
// e a lista do que travar em cada slot, com a cor de prioridade.
import { useState, type ReactNode } from "react";
import { Panel, SectionTitle } from "../components/ui";
import { GENUS_CATEGORIES, GENUS_SOURCE, LOCK_PRIORITIES, VARYING_SLOTS, fmtGenus, lockInfo, type GenusCategory } from "../data/guide/genusInsight";

const STORE_KEY = "aion2tm-genus-cat";

/** Ângulo do slot (0° = topo). Como no jogo: começa no topo e desce pela esquerda, de 30° em 30°. */
const slotAngle = (i: number) => -15 - 30 * i;
const ORBIT = 43; // raio da órbita, em % do palco
const RING = 40.5; // raio do arco prateado
const point = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(a), y: 50 - r * Math.cos(a) };
};
function arcPath(r: number, from: number, to: number) {
  const p1 = point(from, r);
  const p2 = point(to, r);
  // Vai do topo para a esquerda (ângulo diminuindo) = sentido anti-horário na tela
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 1 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

function readCat(): GenusCategory["id"] {
  try {
    const v = localStorage.getItem(STORE_KEY);
    if (GENUS_CATEGORIES.some((c) => c.id === v)) return v as GenusCategory["id"];
  } catch {
    /* sem localStorage */
  }
  return "cogni";
}

function Medallion({ cat, hl, onHl }: { cat: GenusCategory; hl: number | null; onHl: (i: number | null) => void }) {
  const first = slotAngle(0) + 12;
  const last = slotAngle(8) - 14;
  return (
    <div className="genus-stage">
      <svg className="genus-stage__ring" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="genus-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2f4f6" />
            <stop offset=".45" stopColor="#8d959e" />
            <stop offset="1" stopColor="#d7dbe0" />
          </linearGradient>
        </defs>
        <path d={arcPath(RING + 3.2, first, last)} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="3.6" />
        <path d={arcPath(RING + 3.2, first, last)} fill="none" stroke="url(#genus-silver)" strokeWidth="2.4" strokeOpacity=".85" />
        <path d={arcPath(RING + 3.2, first, last)} fill="none" stroke="#2a3038" strokeWidth=".5" strokeDasharray="1.4 1.1" />
        <path d={arcPath(RING, first, last)} fill="none" stroke="url(#genus-silver)" strokeWidth=".7" strokeOpacity=".9" />
        {cat.slots.map((_, i) => {
          // Pontas em losango apontando para fora, como no jogo
          const a = slotAngle(i);
          const tip = point(a, ORBIT + 7.2);
          const base = point(a, ORBIT + 4.4);
          const l = point(a - 2.2, ORBIT + 5.6);
          const r = point(a + 2.2, ORBIT + 5.6);
          return <path key={i} d={`M ${tip.x} ${tip.y} L ${l.x} ${l.y} L ${base.x} ${base.y} L ${r.x} ${r.y} Z`} fill="#d9dde2" fillOpacity=".75" stroke="#14181d" strokeWidth=".25" />;
        })}
      </svg>
      <img className="genus-stage__art" src={cat.art} alt={`Medalhão ${cat.name}`} draggable={false} />
      {cat.slots.map((s, i) => {
        const p = point(slotAngle(i), ORBIT);
        const info = lockInfo(s.priority);
        return (
          <button
            key={i}
            type="button"
            className={`genus-orb ${hl === i ? "genus-orb--hl" : ""} ${hl !== null && hl !== i ? "genus-orb--dim" : ""}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, ["--orb" as string]: info.color }}
            onMouseEnter={() => onHl(i)}
            onMouseLeave={() => onHl(null)}
            onFocus={() => onHl(i)}
            onBlur={() => onHl(null)}
            aria-label={`Slot ${i + 1}: ${s.stat}, prioridade ${info.label}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

export function GenusInsightGuide({ nav }: { nav: ReactNode }) {
  const [catId, setCatId] = useState(readCat);
  const [hl, setHl] = useState<number | null>(null);
  const cat = GENUS_CATEGORIES.find((c) => c.id === catId) ?? GENUS_CATEGORIES[0];

  const pick = (id: GenusCategory["id"]) => {
    setCatId(id);
    setHl(null);
    try {
      localStorage.setItem(STORE_KEY, id);
    } catch {
      /* ok */
    }
  };

  return (
    <div className="page">
      {nav}
      <Panel label="Genus Insight">
        <SectionTitle aside={<span className="guide-source">Fonte: {GENUS_SOURCE.title} · transcrito em {GENUS_SOURCE.date}</span>}>Guia · Genus Insight (dano PvE)</SectionTitle>
        <div className="guide-intro">
          <p>
            Quais status travar (lock) em cada um dos <strong>9 slots</strong> de cada categoria, buscando o valor <strong>máximo</strong>. A cor mostra a ordem de prioridade do lock:{" "}
            {LOCK_PRIORITIES.map((p, i) => (
              <span key={p.id}>
                <span className="genus-prio" style={{ ["--orb" as string]: p.color }}>
                  {p.label}
                </span>
                {i < LOCK_PRIORITIES.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
          <p>
            Ao rolar, aceite também <strong>Critical Chance</strong> ou <strong>Accuracy</strong>: qualquer um dos dois serve. Os slots <strong>{VARYING_SLOTS.join(" e ")}</strong> mudam de uma categoria para outra; os outros 7 são iguais em todas.
          </p>
        </div>
      </Panel>

      <div className="genus-layout">
        <nav className="genus-cats" aria-label="Categorias">
          {GENUS_CATEGORIES.map((c, i) => (
            <button key={c.id} type="button" className={`genus-cat ${c.id === cat.id ? "genus-cat--on" : ""}`} style={{ ["--shift" as string]: `${[44, 16, 0, 16, 44][i]}px` }} onClick={() => pick(c.id)} aria-pressed={c.id === cat.id}>
              <img src={c.icon} alt="" draggable={false} />
              <span>{c.name}</span>
            </button>
          ))}
        </nav>

        <Medallion cat={cat} hl={hl} onHl={setHl} />

        <section className="genus-info" aria-label={`${cat.name} Insight`}>
          <div className="genus-info__head">
            <span className="genus-info__title">{cat.name} Insight</span>
            <span className="genus-info__lv">9 slots</span>
          </div>
          <div className="genus-info__bar" />
          <div className="genus-info__sub">✦ O que travar em cada slot</div>
          <ol className="genus-rows">
            {cat.slots.map((s, i) => {
              const info = lockInfo(s.priority);
              const varies = VARYING_SLOTS.includes(i + 1);
              return (
                <li key={i} className={`genus-row ${hl === i ? "genus-row--hl" : ""}`} style={{ ["--orb" as string]: info.color }} onMouseEnter={() => setHl(i)} onMouseLeave={() => setHl(null)}>
                  <span className="genus-row__num">{i + 1}</span>
                  <span className="genus-row__stat">
                    {s.stat}
                    {varies && <span className="genus-row__varies">muda por categoria</span>}
                    <span className="genus-row__range">
                      {fmtGenus(s.min, s.unit)} ~ {fmtGenus(s.max, s.unit)}
                    </span>
                  </span>
                  <span className="genus-row__max" title="Valor buscado">
                    {fmtGenus(s.max, s.unit)}
                  </span>
                  <span className="genus-row__prio">{info.label}</span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <Panel label="Resumo">
        <SectionTitle aside="Slots que mudam entre as categorias">Comparação das categorias</SectionTitle>
        <div className="genus-compare">
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                {VARYING_SLOTS.map((n) => (
                  <th key={n}>
                    Slot {n} <span className="genus-prio" style={{ ["--orb" as string]: lockInfo(GENUS_CATEGORIES[0].slots[n - 1].priority).color }}>{lockInfo(GENUS_CATEGORIES[0].slots[n - 1].priority).label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GENUS_CATEGORIES.map((c) => (
                <tr key={c.id} className={c.id === cat.id ? "is-on" : ""} onClick={() => pick(c.id)}>
                  <td>
                    <span className="genus-compare__cat">
                      <img src={c.icon} alt="" />
                      {c.name}
                    </span>
                  </td>
                  {VARYING_SLOTS.map((n) => {
                    const s = c.slots[n - 1];
                    return (
                      <td key={n}>
                        {s.stat} <span className="genus-row__range">{fmtGenus(s.min, s.unit)} ~ {fmtGenus(s.max, s.unit)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="genus-compare__note">
            Iguais em todas: <strong>Attack Bonus</strong> 8 ~ 16 (slots 1 e 5), <strong>Accuracy Bonus</strong> 20 ~ 40 (slots 3, 6 e 9) e <strong>HP Increase</strong> 0.8% ~ 1.6% (slots 2 e 8).
          </p>
        </div>
      </Panel>

      <p className="guide-footer">Dados da comunidade. Podem mudar com patches do jogo. Arte dos medalhões: prints do próprio jogo (uso pessoal).</p>
    </div>
  );
}
