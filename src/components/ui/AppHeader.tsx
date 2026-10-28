import { Tabs, type TabItem } from "./Basics";
import { LogoStar } from "./icons";

export interface ResetInfo {
  label: string;
  value: string;
  hint?: string;
  /** Destaca em vermelho (ex.: menos de 24h para o reset semanal). */
  urgent?: boolean;
}

export function AppHeader<T extends string>({ tabs, active, onTabChange, resets }: { tabs: TabItem<T>[]; active: T; onTabChange: (id: T) => void; resets: ResetInfo[] }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <LogoStar />
        <span className="app-header__title">
          Aion 2 <span className="app-header__subtitle">Manager</span>
        </span>
      </div>
      <Tabs className="app-header__nav" items={tabs} active={active} onChange={onTabChange} />
      <div className="app-header__reset">
        {resets.map((r) => (
          <div key={r.label} className="app-header__reset-row">
            <span className="app-header__reset-label">{r.label}</span>
            <span className={`app-header__reset-value ${r.urgent ? "app-header__reset-value--urgent" : ""}`}>{r.value}</span>
            {r.hint && <span className="app-header__reset-hint">{r.hint}</span>}
          </div>
        ))}
      </div>
    </header>
  );
}
