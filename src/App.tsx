import { useState } from "react";
import { AppHeader, type TabItem } from "./components/ui";
import { CharactersScreen } from "./screens/CharactersScreen";
import { ComponentShowcase } from "./screens/ComponentShowcase";
import { HistoryScreen } from "./screens/HistoryScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { TodayScreen } from "./screens/TodayScreen";
import { WeeklyScreen } from "./screens/WeeklyScreen";
import { formatCountdown, localResetLabel } from "./time/gameTime";
import { useGameClock } from "./time/useGameClock";
import { useStore } from "./data/store";
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

function App() {
  const [tab, setTab] = useState<TabId>("semana");
  const updater = useUpdater();
  const { reset } = useStore();
  const clock = useGameClock(reset);
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
        <HistoryScreen clock={clock} />
      )}
      <VersionFooter version={updater.currentVersion} state={updater.state} onCheck={updater.checkNow} />
    </div>
  );
}

export default App;
