// Configurações → Calc Craft: exportar os itens e os ícones de receita cadastrados,
// para virarem a lista padrão do app numa próxima versão.
import { useState } from "react";
import { Alert, Button, Panel, SectionTitle } from "../components/ui";
import { saveBackupFile } from "../data/backupIO";
import { makeCraftExport } from "../data/craft";
import { useStore } from "../data/store";

export function CalcCraftSection({ appVersion }: { appVersion: string }) {
  const { data } = useStore();
  const [msg, setMsg] = useState<{ kind: "info" | "danger"; text: string } | null>(null);
  const items = data.craftItems.length;
  const icons = data.recipeIcons.length;

  const doExport = async () => {
    setMsg(null);
    try {
      const day = new Date().toISOString().slice(0, 10);
      const path = await saveBackupFile(makeCraftExport(data.craftItems, data.recipeIcons, appVersion), `calc-craft-${day}.json`, "Exportar itens e ícones do Calc Craft");
      if (path) setMsg({ kind: "info", text: `Exportado (${items} itens e ${icons} ícones): ${path}` });
    } catch (e) {
      setMsg({ kind: "danger", text: `Não foi possível exportar: ${String(e)}` });
    }
  };

  return (
    <Panel label="Calc Craft">
      <SectionTitle aside={`${items} itens · ${icons} ícones de receita`}>Calc Craft</SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, color: "var(--text-soft)", lineHeight: 1.6, flex: "1 1 420px" }}>Gera um arquivo com a lista de itens e os ícones de receita que você cadastrou, para virarem a lista padrão do app numa próxima versão.</p>
        <Button variant="ghost" onClick={doExport}>
          Exportar itens e ícones
        </Button>
      </div>
      {msg && (
        <div style={{ marginTop: 14 }}>
          <Alert kind={msg.kind}>{msg.text}</Alert>
        </div>
      )}
    </Panel>
  );
}
