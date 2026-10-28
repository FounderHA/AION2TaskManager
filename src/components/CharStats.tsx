// GS (Gear Score) e CP (Combat Power) do personagem, com ícone.
// O ícone é a imagem escolhida pelo usuário em Configurações; sem imagem, usa um ícone próprio do app.
import { formatCp, formatGs } from "../data/model";
import { useStore } from "../data/store";

function DefaultGsIcon() {
  // Elmo estilizado (arte própria)
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.8 C5 1.8 3 4.6 3 8.4 V12.6 L5.6 15.6 H7.4 V11 H10.6 V15.6 H12.4 L15 12.6 V8.4 C15 4.6 13 1.8 9 1.8 Z" stroke="#e8d9a8" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9 1.8 V7.6 M5.4 8.6 H12.6" stroke="#e8d9a8" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function DefaultCpIcon() {
  // Duas lâminas cruzadas (arte própria)
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 2.5 L11.5 11 M15 2.5 L6.5 11" stroke="var(--cyan-light)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 12.5 L13.5 9 M8 12.5 L4.5 9 M12.2 13.8 L14.8 16.4 M5.8 13.8 L3.2 16.4" stroke="var(--cyan-light)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function StatIcon({ which, size = 18 }: { which: "gs" | "cp"; size?: number }) {
  const { data } = useStore();
  const custom = data.settings.icons[which];
  if (custom) return <img src={custom} alt="" width={size} height={size} style={{ objectFit: "contain", display: "block" }} />;
  return which === "gs" ? <DefaultGsIcon /> : <DefaultCpIcon />;
}

export function CharStats({ gs, cp }: { gs: number | null; cp: number | null }) {
  return (
    <div className="char-stats">
      <span className="char-stats__item" title="Gear Score">
        <StatIcon which="gs" />
        <span className="char-stats__value char-stats__value--gs">{formatGs(gs)}</span>
      </span>
      <span className="char-stats__item" title="Combat Power">
        <StatIcon which="cp" />
        <span className="char-stats__value char-stats__value--cp">{formatCp(cp)}</span>
      </span>
    </div>
  );
}
