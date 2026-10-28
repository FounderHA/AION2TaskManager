import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ClockIcon, CrownIcon, InfoIcon, WarningIcon } from "./icons";

/* ---------- Painel com ornamento ✦ ---------- */
export function Panel({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <section className={`panel panel--pad ${className}`} aria-label={label}>
      {children}
    </section>
  );
}

/* ---------- Título de seção em ciano ---------- */
export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>
        <span aria-hidden="true">✦ </span>
        {children}
      </h2>
      {aside && <span className="section-title__aside">{aside}</span>}
    </div>
  );
}

/* ---------- Abas com arco luminoso ---------- */
export type TabItem<T extends string> = { id: T; label: string };

export function Tabs<T extends string>({ items, active, onChange, className = "" }: { items: TabItem<T>[]; active: T; onChange: (id: T) => void; className?: string }) {
  return (
    <nav className={`tabs ${className}`} aria-label="Seções">
      {items.map((t) => (
        <button key={t.id} className={`tab ${t.id === active ? "tab--active" : ""}`} aria-current={t.id === active ? "page" : undefined} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

/* ---------- Badges ---------- */
export type BadgeKind = "server" | "main" | "alt" | "expiring" | "done" | "member" | "on" | "off" | "neutral" | "custom";

const BADGE_TEXT: Record<BadgeKind, string> = {
  server: "SERVIDOR",
  main: "MAIN",
  alt: "ALT",
  expiring: "EXPIRA HOJE",
  done: "CONCLUÍDA",
  member: "MEMBERSHIP",
  on: "LIGADA",
  off: "DESLIGADA",
  neutral: "",
  custom: "SUA TAREFA",
};

export function Badge({ kind, children }: { kind: BadgeKind; children?: ReactNode }) {
  return (
    <span className={`badge badge--${kind}`}>
      {kind === "main" && <CrownIcon />}
      {children ?? BADGE_TEXT[kind]}
    </span>
  );
}

/* ---------- Barra de progresso dourada ---------- */
export function ProgressBar({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="progress-bar__label">{pct}%</span>}
    </div>
  );
}

/* ---------- Anel de progresso ornamentado ---------- */
export function ProgressRing({ value, caption, size = 170 }: { value: number; caption?: string; size?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const c = 2 * Math.PI * 64;
  return (
    <svg width={size} height={size} viewBox="0 0 170 170" role="img" aria-label={`Progresso ${pct}%${caption ? ` de ${caption}` : ""}`}>
      <circle cx="85" cy="85" r="78" fill="none" stroke="rgba(220,230,245,.18)" strokeWidth="1" />
      <circle cx="85" cy="85" r="64" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
      <circle
        cx="85"
        cy="85"
        r="64"
        fill="none"
        stroke="#e2b04a"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`}
        transform="rotate(-90 85 85)"
        style={{ transition: "stroke-dasharray .5s ease" }}
      />
      <path
        d="M85 4 L88 10 L85 16 L82 10 Z M85 154 L88 160 L85 166 L82 160 Z M4 85 L10 82 L16 85 L10 88 Z M154 85 L160 82 L166 85 L160 88 Z"
        fill="none"
        stroke="rgba(220,230,245,.7)"
        strokeWidth="1"
      />
      <text x="85" y="86" textAnchor="middle" fill="#f2f6fb" fontFamily="Noto Sans, sans-serif" fontSize="32" fontWeight="600">
        {pct}%
      </text>
      {caption && (
        <text x="85" y="108" textAnchor="middle" fill="#8d9ab0" fontFamily="Noto Sans, sans-serif" fontSize="12">
          {caption}
        </text>
      )}
    </svg>
  );
}

/* ---------- Alertas ---------- */
export function Alert({ kind, children }: { kind: "danger" | "warning" | "info"; children: ReactNode }) {
  const icon = kind === "danger" ? <ClockIcon /> : kind === "warning" ? <WarningIcon /> : <InfoIcon />;
  return (
    <div className={`alert alert--${kind}`} role={kind === "danger" ? "alert" : undefined}>
      <span style={{ flex: "none", marginTop: 2 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

/* ---------- Botões ---------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" };

export function Button({ variant = "secondary", className = "", ...rest }: ButtonProps) {
  return <button className={`btn btn--${variant} ${className}`} {...rest} />;
}

/* ---------- Interruptor liga/desliga ---------- */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`switch ${checked ? "switch--on" : ""}`} onClick={() => onChange(!checked)}>
      <span className="switch__knob" />
    </button>
  );
}
