import { useEffect, useRef, useState } from "react";
import { Alert, AppHeader, type TabItem } from "./components/ui";
import { CharactersScreen } from "./screens/CharactersScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { OdyleScreen } from "./screens/OdyleScreen";
import { RuneBackdrop } from "./components/RuneBackdrop";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { WeeklyScreen } from "./screens/WeeklyScreen";
import { formatCountdown, localResetLabel } from "./time/gameTime";
import { useGameClock } from "./time/useGameClock";
import { useStore } from "./data/store";
import { currentOdyle, rulesFor } from "./data/odyle";
import { UpdateBanner, VersionFooter } from "./updater/UpdateBanner";
import { useUpdater } from "./updater/useUpdater";

type TabId = "personagem" | "progresso" | "odyle" | "personagens" | "historico" | "configuracoes";

const BASE_TABS: TabItem<TabId>[] = [
  { id: "progresso", label: "Progresso" },
  { id: "personagem", label: "Personagem" },
  { id: "odyle", label: "Odyle" },
  { id: "personagens", label: "Cadastro" },
  { id: "historico", label: "Histórico" },
  { id: "configuracoes", label: "Configurações" },
];

function App() {
  const [tab, setTab] = useState<TabId>("progresso");
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const updater = useUpdater();
  const { reset, saveStatus, characters, data } = useStore();

  // Ao abrir: sem personagens cadastrados, começa na aba Cadastro
  const decidedStart = useRef(false);
  useEffect(() => {
    if (decidedStart.current || saveStatus === "carregando") return;
    decidedStart.current = true;
    if (characters.length === 0) setTab("personagens");
  }, [saveStatus, characters.length]);
  const clock = useGameClock(reset);
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();
  const resets = [
    { label: "Diário", value: formatCountdown(clock.nextDaily.getTime() - clock.now.getTime()) },
    { label: "Semanal", value: formatCountdown(toWeekly), hint: localResetLabel(clock.nextWeekly), urgent: toWeekly < 86_400_000 },
  ];

  // Ponto de alerta na aba Odyle quando alguém está perto do limite
  const odyleRules = rulesFor(data.settings.odyle, data.settings.membership);
  const odyleAlert = characters.some((c) => c.odyle && currentOdyle(c.odyle, odyleRules, clock.now).level !== "ok");
  const tabs = BASE_TABS.map((t) => (t.id === "odyle" ? { ...t, alert: odyleAlert } : t));

  return (
    <div className="app-bg">
      <RuneBackdrop />
      <AppHeader tabs={tabs} active={tab} onTabChange={setTab} resets={resets} />
      <UpdateBanner state={updater.state} dismissed={updater.dismissed} onInstall={updater.install} onDismiss={updater.dismiss} />
      {saveStatus === "erro" && (
        <div style={{ margin: "16px 40px 0" }}>
          <Alert kind="danger">Não foi possível salvar suas últimas alterações. Feche e abra o app de novo; se continuar, exporte um backup em Configurações.</Alert>
        </div>
      )}
      {tab === "configuracoes" ? (
        <SettingsScreen appVersion={updater.currentVersion} />
      ) : tab === "personagem" ? (
        <WeeklyScreen clock={clock} onGoToCharacters={() => setTab("personagens")} selectedId={selectedChar} onSelect={setSelectedChar} />
      ) : tab === "progresso" ? (
        <ProgressScreen
          clock={clock}
          onGoToCharacters={() => setTab("personagens")}
          onOpenCharacter={(id) => {
            setSelectedChar(id);
            setTab("personagem");
          }}
        />
      ) : tab === "odyle" ? (
        <OdyleScreen clock={clock} onGoToCharacters={() => setTab("personagens")} />
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
