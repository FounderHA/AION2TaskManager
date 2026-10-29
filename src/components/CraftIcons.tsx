// Ícones originais da calculadora de craft (desenhados em SVG, sem arte do jogo).
import { useId } from "react";
import { RARITY, type ItemIconId, type Rarity, type RecipeIconId } from "../data/craft";

/** Material comum: pedaço de minério cinza com facetas. */
function CommonMaterialArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9dde2" />
          <stop offset="1" stopColor="#7b828c" />
        </linearGradient>
        <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9aa1aa" />
          <stop offset="1" stopColor="#4c525a" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="50" rx="18" ry="4" fill="rgba(0,0,0,.45)" />
      {/* bloco principal */}
      <path d="M14 38 L20 20 L34 14 L48 22 L52 38 L40 50 L22 49 Z" fill={`url(#${uid}-b)`} stroke="#2b2f35" strokeWidth="1.2" strokeLinejoin="round" />
      {/* facetas claras */}
      <path d="M20 20 L34 14 L36 28 L24 32 Z" fill={`url(#${uid}-a)`} />
      <path d="M34 14 L48 22 L44 31 L36 28 Z" fill="#b9bfc6" />
      <path d="M24 32 L36 28 L44 31 L40 50 L22 49 Z" fill="#6c737c" />
      <path d="M44 31 L52 38 L40 50 Z" fill="#545a62" />
      <path d="M14 38 L20 20 L24 32 L22 49 Z" fill="#848b94" />
      {/* veios e brilho */}
      <path d="M26 36 L31 41 M35 33 L38 40" stroke="#e8ebef" strokeOpacity=".55" strokeWidth="1" strokeLinecap="round" />
      <path d="M23 22 L30 19" stroke="#ffffff" strokeOpacity=".8" strokeWidth="1.4" strokeLinecap="round" />
      {/* lascas menores */}
      <path d="M48 46 L53 43 L56 48 L51 51 Z" fill="#7b828c" stroke="#2b2f35" strokeWidth=".8" />
      <path d="M10 46 L14 44 L16 48 L12 50 Z" fill="#9aa1aa" stroke="#2b2f35" strokeWidth=".8" />
    </g>
  );
}

/** Ombreira de metal com placas sobrepostas (representação original). */
function PauldronArt({ uid }: { uid: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e3e4e2" />
          <stop offset=".55" stopColor="#9c9f9f" />
          <stop offset="1" stopColor="#55595c" />
        </linearGradient>
        <linearGradient id={`${uid}-d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b8f90" />
          <stop offset="1" stopColor="#3f4346" />
        </linearGradient>
      </defs>
      <ellipse cx="33" cy="58" rx="20" ry="3" fill="rgba(0,0,0,.45)" />
      <g transform="translate(1 3) rotate(-24 32 34) scale(1.12 0.92) translate(-3 2)">
      {/* espinhos ao longo da borda superior */}
      {[
        [13, 24],
        [18, 17],
        [25, 12],
        [33, 9],
        [41, 9],
        [49, 12],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x - 3} ${y + 4} L${x} ${y - 4} L${x + 4} ${y + 3} Z`} fill="#6f7375" stroke="#25282b" strokeWidth=".8" strokeLinejoin="round" />
      ))}
      {/* casco principal, inclinado como uma ombreira vista de lado */}
      <path d="M8 31 C 9 17, 27 8, 44 11 C 54 13, 59 21, 57 31 C 49 28, 38 28, 28 31 C 20 33, 13 34, 8 31 Z" fill={`url(#${uid}-m)`} stroke="#25282b" strokeWidth="1.2" strokeLinejoin="round" />
      {/* lamelas (placas sobrepostas) */}
      <path d="M10 33 C 21 37, 40 32, 57 33 L 55 41 C 40 40, 24 44, 13 41 Z" fill="#9a9d9e" stroke="#25282b" strokeWidth="1" strokeLinejoin="round" />
      <path d="M14 42 C 26 45, 40 41, 54 42 L 51 49 C 40 48, 27 52, 17 49 Z" fill="#7f8384" stroke="#25282b" strokeWidth="1" strokeLinejoin="round" />
      <path d="M18 50 C 28 53, 39 50, 50 50 L 47 56 C 38 56, 29 58, 21 56 Z" fill="#666a6c" stroke="#25282b" strokeWidth="1" strokeLinejoin="round" />
      {/* friso e rebites */}
      <path d="M12 28 C 24 24, 42 23, 54 26" fill="none" stroke="#3a3e41" strokeWidth="1.4" />
      {[16, 26, 36, 46].map((x, i) => (
        <circle key={x} cx={x} cy={[26.5, 24.6, 24, 24.6][i]} r="1.3" fill="#e0e1de" stroke="#2b2e31" strokeWidth=".6" />
      ))}
      {[22, 34, 46].map((x) => (
        <circle key={x} cx={x} cy={x === 34 ? 37.3 : 37.8} r="1" fill="#d0d1ce" stroke="#2b2e31" strokeWidth=".5" />
      ))}
      {/* brilho */}
      <path d="M15 21 C 22 15, 31 13, 39 13" fill="none" stroke="#ffffff" strokeOpacity=".75" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 35 C 26 37, 38 34, 50 34" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Frame({ size, border, glow, children, title }: { size: number; border: string; glow: string; children: React.ReactNode; title?: string }) {
  return (
    <span className="craft-icon" style={{ width: size, height: size, borderColor: border, boxShadow: `inset 0 0 ${size / 4}px ${glow}` }} title={title}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}

export function ItemIcon({ icon, rarity, size = 48, title }: { icon: ItemIconId; rarity: Rarity; size?: number; title?: string }) {
  const uid = useId().replace(/:/g, "");
  const color = RARITY[rarity].color;
  return (
    <Frame size={size} border={`${color}66`} glow={`${color}22`} title={title}>
      {icon === "common-material" && <CommonMaterialArt uid={uid} />}
    </Frame>
  );
}

export function RecipeIcon({ icon, size = 48 }: { icon: RecipeIconId; size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <Frame size={size} border="rgba(224,180,82,.6)" glow="rgba(224,180,82,.18)">
      {icon === "pauldron" && <PauldronArt uid={uid} />}
    </Frame>
  );
}

/** Ícone para um item que não existe mais no catálogo. */
export function UnknownItemIcon({ size = 48 }: { size?: number }) {
  return (
    <Frame size={size} border="rgba(160,180,210,.3)" glow="transparent">
      <text x="32" y="42" textAnchor="middle" fontSize="28" fill="#5a6b85" fontFamily="Noto Sans, sans-serif">
        ?
      </text>
    </Frame>
  );
}
