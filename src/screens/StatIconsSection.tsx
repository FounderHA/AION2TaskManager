// Ícones de GS e CP: o usuário escolhe uma imagem (ex.: recorte de print do jogo).
// A imagem é reduzida para 64×64 e salva só no dados.json do PC dele.
import { useState } from "react";
import { Alert, Button, Panel, SectionTitle } from "../components/ui";
import { StatIcon } from "../components/CharStats";
import { useStore } from "../data/store";

const SIZE = 64;

/** Lê a imagem escolhida e devolve um PNG 64×64 (proporção mantida) em data URL. */
function pickImage(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/gif";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
        img.onload = () => {
          const scale = Math.min(SIZE / img.width, SIZE / img.height, 1);
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Não foi possível processar a imagem."));
          ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

export function StatIconsSection() {
  const { data, setStatIcon } = useStore();
  const [error, setError] = useState("");

  const choose = async (which: "gs" | "cp") => {
    setError("");
    try {
      const url = await pickImage();
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
