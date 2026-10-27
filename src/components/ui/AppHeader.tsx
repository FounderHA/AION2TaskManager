import { Tabs, type TabItem } from "./Basics";
import { LogoStar } from "./icons";

export function AppHeader<T extends string>({ tabs, active, onTabChange, resetLabel, resetValue, resetHint }: { tabs: TabItem<T>[]; active: T; onTabChange: (id: T) => void; resetLabel: string; resetValue: string; resetHint?: string }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <LogoStar />
        <span className="app-header__title">Registro do Daeva</span>
        <span className="app-header__subtitle">Tarefas</span>
      </div>
      <Tabs className="app-header__nav" items={tabs} active={active} onChange={onTabChange} />
      <div className="app-header__reset">
        <span className="app-header__reset-label">{resetLabel}</span>
        <span className="app-header__reset-value">
          {resetValue}
          {resetHint && <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-muted)" }}> · {resetHint}</span>}
        </span>
      </div>
    </header>
  );
}
