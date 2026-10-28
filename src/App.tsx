import { useState } from "react";
import { AppHeader, Panel, SectionTitle, type TabItem } from "./components/ui";
import { CharactersScreen } from "./screens/CharactersScreen";
import { ComponentShowcase } from "./screens/ComponentShowcase";
import { SettingsScreen } from "./screens/SettingsScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { WeeklyScreen } from "./screens/WeeklyScreen";
import { formatCountdown, localResetLabel } from "./time/gameTime";
import { useGameClock } from "./time/useGameClock";
import { UpdateBanner, VersionFooter } from "./updater/UpdateBanner";
import { useUpdater } from "./updater/useUpdater";

type TabId = "semana" | "hoje" | "personagens" | "historico" | "configuracoes" | "componentes";

const TABS: TabItem<TabId>[] = [
  { id: "semana", label: "Semana" },
  { id: "hoje", label: "Hoje" },
  { id: "personagens", label: "Personagens" },
  { id: "historico", label: "Histórico" },
  { id: "configuracoes", label: "Configurações" },
  { id: "componentes", label: "Componentes" },
];

// Em qual etapa do plano cada tela será construída
const COMING: Record<Exclude<TabId, "componentes" | "configuracoes" | "personagens" | "semana" | "hoje">, string> = {
  historico: "Etapa 11 — Histórico",
};

function App() {
  const [tab, setTab] = useState<TabId>("semana");
  const updater = useUpdater();
  const clock = useGameClock();
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();
  const resets = [
    { label: "Diário", value: formatCountdown(clock.nextDaily.getTime() - clock.now.getTime()) },
    { label: "Semanal", value: formatCountdown(toWeekly), hint: localResetLabel(clock.nextWeekly), urgent: toWeekly < 86_400_000 },
  ];

  return (
    <div className="app-bg">
      <AppHeader tabs={TABS} active={tab} onTabChange={setTab} resets={resets} />
      <UpdateBanner state={updater.state} dismissed={updater.dismissed} onInstall={updater.install} onDismiss={updater.dismiss} />
      {tab === "componentes" ? (
        <ComponentShowcase />
      ) : tab === "configuracoes" ? (
        <SettingsScreen appVersion={updater.currentVersion} />
      ) : tab === "semana" ? (
        <WeeklyScreen clock={clock} onGoToCharacters={() => setTab("personagens")} />
      ) : tab === "hoje" ? (
        <TodayScreen clock={clock} onGoToCharacters={() => setTab("personagens")} />
      ) : tab === "personagens" ? (
        <CharactersScreen />
      ) : (
        <div className="page">
          <Panel>
            <SectionTitle>Em construção</SectionTitle>
            <p style={{ margin: 0, color: "var(--text-soft)" }}>Esta tela chega na {COMING[tab]}.</p>
          </Panel>
        </div>
      )}
      <VersionFooter version={updater.currentVersion} state={updater.state} onCheck={updater.checkNow} />
    </div>
  );
}

export default App;
