import { useState } from "react";
import { AppHeader, Panel, SectionTitle, type TabItem } from "./components/ui";
import { ComponentShowcase } from "./screens/ComponentShowcase";

type TabId = "semana" | "hoje" | "conta" | "historico" | "componentes";

const TABS: TabItem<TabId>[] = [
  { id: "semana", label: "Semana" },
  { id: "hoje", label: "Hoje" },
  { id: "conta", label: "Conta" },
  { id: "historico", label: "Histórico" },
  { id: "componentes", label: "Componentes" },
];

// Em qual etapa do plano cada tela será construída
const COMING: Record<Exclude<TabId, "componentes">, string> = {
  semana: "Etapa 7 — Painel Semanal",
  hoje: "Etapa 8 — Visão do Dia",
  conta: "Etapa 6 — Personagens",
  historico: "Etapa 11 — Histórico",
};

function App() {
  const [tab, setTab] = useState<TabId>("componentes");

  return (
    <div className="app-bg">
      <AppHeader tabs={TABS} active={tab} onTabChange={setTab} resetLabel="Próximo reset" resetValue="--h --m" resetHint="qua 04:00" />
      {tab === "componentes" ? (
        <ComponentShowcase />
      ) : (
        <div className="page">
          <Panel>
            <SectionTitle>Em construção</SectionTitle>
            <p style={{ margin: 0, color: "var(--text-soft)" }}>Esta tela chega na {COMING[tab]}.</p>
          </Panel>
        </div>
      )}
    </div>
  );
}

export default App;
