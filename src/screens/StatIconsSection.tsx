// Ícones de GS e CP: o usuário escolhe uma imagem (ex.: recorte de print do jogo).
// A imagem é reduzida para 64×64 e salva só no dados.json do PC dele.
import { useState } from "react";
import { Alert, Button, Panel, SectionTitle } from "../components/ui";
import { StatIcon } from "../components/CharStats";
import { useStore } from "../data/store";
import { pickImage } from "../components/pickImage";

export function StatIconsSection() {
  const { data, setStatIcon } = useStore();
  const [error, setError] = useState("");

  const choose = async (which: "gs" | "cp") => {
    setError("");
    try {
      const url = await pickImage({ size: 64, fit: "contain" });
      if (url) setStatIcon(which, url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const rows: { which: "gs" | "cp"; label: string }[] = [
    { which: "gs", label: "GS (Gear Score)" },
    { which: "cp", label: "CP (Combat Power)" },
  ];

  return (
    <Panel label="Ícones de GS e CP">
      <SectionTitle>Ícones de GS e CP</SectionTitle>
      <p style={{ margin: "0 0 18px", color: "var(--text-soft)", lineHeight: 1.5 }}>
        Escolha uma imagem para cada ícone (por exemplo, um recorte do print do jogo). Ela aparece nos cards dos personagens e fica salva só no seu PC. Sem imagem, o app usa um ícone próprio.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        {rows.map((r) => (
          <div key={r.which} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="icon-slot">
              <StatIcon which={r.which} size={36} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="field__label">{r.label}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" className="btn--small" onClick={() => choose(r.which)}>
                  Escolher imagem
                </Button>
                {data.settings.icons[r.which] && (
                  <Button variant="ghost" className="btn--small" onClick={() => setStatIcon(r.which, null)}>
                    Usar ícone padrão
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div style={{ marginTop: 16 }}>
          <Alert kind="danger">{error}</Alert>
        </div>
      )}
    </Panel>
  );
}
