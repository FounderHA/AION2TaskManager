import { useEffect, useRef, useState } from "react";
import { Alert, AppHeader, type TabItem } from "./components/ui";
import { CharactersScreen } from "./screens/CharactersScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { OdyleScreen } from "./screens/OdyleScreen";
import { GuideScreen } from "./screens/GuideScreen";
import { CraftScreen } from "./screens/CraftScreen";
import { SimulatorsScreen } from "./screens/SimulatorsScreen";
import { TimersScreen } from "./screens/TimersScreen";
import { TimerAlerts } from "./components/TimerAlerts";
import { RuneBackdrop } from "./components/RuneBackdrop";
import { CompactView } from "./screens/CompactView";
import { DayCompleteFx } from "./components/DayCompleteFx";
import { enterCompact, exitCompact, setOnTop } from "./components/windowMode";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { WeeklyScreen } from "./screens/WeeklyScreen";
import { formatCountdown, localResetLabel } from "./time/gameTime";
import { useGameClock } from "./time/useGameClock";
import { useStore } from "./data/store";
import { currentOdyle, rulesFor } from "./data/odyle";
import { UpdateBanner, VersionFooter } from "./updater/UpdateBanner";
import { useUpdater } from "./updater/useUpdater";

type TabId = "personagem" | "progresso" | "odyle" | "guia" | "craft" | "simuladores" | "horarios" | "personagens" | "historico" | "configuracoes";

const BASE_TABS: TabItem<TabId>[] = [
  { id: "progresso", label: "Progresso" },
  { id: "personagem", label: "Personagem" },
  { id: "odyle", label: "Odyle" },
  { id: "horarios", label: "Horários" },
  { id: "craft", label: "Calc Craft" },
  { id: "simuladores", label: "Simuladores" },
  { id: "personagens", label: "Cadastro" },
  { id: "historico", label: "Histórico" },
  { id: "guia", label: "Guia" },
  { id: "configuracoes", label: "Configurações" },
];

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}
function writeFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* sem armazenamento */
  }
}

function App() {
  const [tab, setTab] = useState<TabId>("progresso");
  // A aba Simuladores fica montada depois da primeira visita (não perde a simulação ao trocar de aba)
  const [simOpened, setSimOpened] = useState(false);
  useEffect(() => {
    if (tab === "simuladores") setSimOpened(true);
  }, [tab]);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  // Modo compacto e "sempre no topo" lembrados neste PC
  const [compact, setCompact] = useState(() => readFlag("aion2tm-compacto", false));
  const [onTop, setOnTopState] = useState(() => readFlag("aion2tm-no-topo", true));
  useEffect(() => {
    if (compact) void enterCompact(onTop);
    // só ao abrir o app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const goCompact = () => {
    writeFlag("aion2tm-compacto", true);
    setCompact(true);
    void enterCompact(onTop);
  };
  const goFull = () => {
    writeFlag("aion2tm-compacto", false);
    setCompact(false);
    void exitCompact();
  };
  // Transparência do modo compacto (30% a 100%)
  const [overlay, setOverlayState] = useState(() => {
    try {
      const v = Number(localStorage.getItem("aion2tm-compacto-opacidade"));
      return v >= 30 && v <= 100 ? v : 100;
    } catch {
      return 100;
    }
  });
  const setOverlay = (v: number) => {
    setOverlayState(v);
    try {
      localStorage.setItem("aion2tm-compacto-opacidade", String(v));
    } catch {
      /* ok */
    }
  };
  // Fundo da página transparente só no compacto (a janela do app é transparente)
  useEffect(() => {
    document.documentElement.classList.toggle("is-compact", compact);
  }, [compact]);
  // Alguns jogos "roubam" o topo ao ganhar foco: reafirma o "sempre por cima" de tempos em tempos
  useEffect(() => {
    if (!compact || !onTop) return;
    const id = window.setInterval(() => void setOnTop(true), 4000);
    return () => window.clearInterval(id);
  }, [compact, onTop]);
  const toggleTop = () => {
    const next = !onTop;
    writeFlag("aion2tm-no-topo", next);
    setOnTopState(next);
    void setOnTop(next);
  };
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

  // Tema por facção: "auto" segue a facção do main
  const themeChoice = data.settings.theme;
  const mainFaction = characters.find((c) => c.role === "MAIN")?.faction;
  const faction = themeChoice === "auto" ? (mainFaction === "Asmodian" ? "asmodian" : "elyos") : themeChoice;
  useEffect(() => {
    document.documentElement.dataset.faction = faction;
  }, [faction]);
  const toWeekly = clock.nextWeekly.getTime() - clock.now.getTime();
  const resets = [
    { label: "Diário", value: formatCountdown(clock.nextDaily.getTime() - clock.now.getTime()) },
    { label: "Semanal", value: formatCountdown(toWeekly), hint: localResetLabel(clock.nextWeekly), urgent: toWeekly < 86_400_000 },
  ];

  // Ponto de alerta na aba Odyle quando alguém está perto do limite
  const odyleRules = rulesFor(data.settings.odyle, data.settings.membership);
  const odyleAlert = characters.some((c) => c.odyle && currentOdyle(c.odyle, odyleRules, clock.now).level !== "ok");
  const tabs = BASE_TABS.map((t) => (t.id === "odyle" ? { ...t, alert: odyleAlert } : t));

  if (compact) {
    return (
      <div className="app-bg app-bg--compact" style={{ ["--overlay" as string]: overlay / 100 }}>
        <RuneBackdrop />
        <CompactView clock={clock} onExpand={goFull} onTop={onTop} onToggleTop={toggleTop} overlay={overlay} onOverlay={setOverlay} />
        <DayCompleteFx todayKey={clock.todayKey} weekKey={clock.weekKey} />
        <TimerAlerts compact />
      </div>
    );
  }

  return (
    <div className="app-bg">
      <RuneBackdrop />
      <AppHeader
        tabs={tabs}
        active={tab}
        onTabChange={setTab}
        resets={resets}
        actions={
          <button type="button" className="header-btn" onClick={goCompact} title="Modo compacto: janela pequena, sempre por cima do jogo" aria-label="Modo compacto">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        }
      />
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
      ) : tab === "simuladores" ? null : tab === "horarios" ? (
        <TimersScreen />
      ) : tab === "craft" ? (
        <CraftScreen />
      ) : tab === "guia" ? (
        <GuideScreen />
      ) : tab === "personagens" ? (
        <CharactersScreen />
      ) : (
        <HistoryScreen clock={clock} />
      )}
      {(simOpened || tab === "simuladores") && <SimulatorsScreen hidden={tab !== "simuladores"} />}
      <DayCompleteFx todayKey={clock.todayKey} weekKey={clock.weekKey} />
      <TimerAlerts />
      <VersionFooter version={updater.currentVersion} state={updater.state} onCheck={updater.checkNow} />
    </div>
  );
}

export default App;
