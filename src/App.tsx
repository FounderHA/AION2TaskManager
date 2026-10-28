import { useState } from "react";
import { AppHeader, Panel, SectionTitle, type TabItem } from "./components/ui";
import { CatalogScreen } from "./screens/CatalogScreen";
import { ComponentShowcase } from "./screens/ComponentShowcase";
import { UpdateBanner, VersionFooter } from "./updater/UpdateBanner";
import { useUpdater } from "./updater/useUpdater";

type TabId = "semana" | "hoje" | "conta" | "historico" | "catalogo" | "componentes";

const TABS: TabItem<TabId>[] = [
  { id: "semana", label: "Semana" },
  { id: "hoje", label: "Hoje" },
  { id: "conta", label: "Conta" },
  { id: "historico", label: "Histórico" },
  { id: "catalogo", label: "Catálogo" },
  { id: "componentes", label: "Componentes" },
];

// Em qual etapa do plano cada tela será construída
const COMING: Record<Exclude<TabId, "componentes" | "catalogo">, string> = {
  semana: "Etapa 7 — Painel Semanal",
  hoje: "Etapa 8 — Visão do Dia",
  conta: "Etapa 6 — Personagens",
  historico: "Etapa 11 — Histórico",
};

function App() {
  const [tab, setTab] = useState<TabId>("catalogo");
  const updater = useUpdater();

  return (
    <div className="app-bg">
      <AppHeader tabs={TABS} active={tab} onTabChange={setTab} resetLabel="Próximo reset" resetValue="--h --m" resetHint="qua 04:00" />
      <UpdateBanner state={updater.state} dismissed={updater.dismissed} onInstall={updater.install} onDismiss={updater.dismiss} />
      {tab === "componentes" ? (
        <ComponentShowcase />
      ) : tab === "catalogo" ? (
        <CatalogScreen />
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
