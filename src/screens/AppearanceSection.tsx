// Configurações → Aparência: tema por facção.
import { Panel, SectionTitle } from "../components/ui";
import type { ThemeChoice } from "../data/settings";
import { useStore } from "../data/store";

const OPTIONS: { id: ThemeChoice; label: string; hint: string }[] = [
  { id: "auto", label: "Automático", hint: "Segue a facção do main" },
  { id: "elyos", label: "Elyos", hint: "Azul e dourado" },
  { id: "asmodian", label: "Asmodian", hint: "Carmesim e roxo" },
];

export function AppearanceSection() {
  const { data, setTheme, main } = useStore();
  const theme = data.settings.theme;
  return (
    <Panel label="Aparência">
      <SectionTitle aside={theme === "auto" && main ? `Agora: ${main.faction} (main: ${main.name})` : undefined}>Aparência</SectionTitle>
      <div className="field__label" style={{ marginBottom: 10 }}>
        Tema
      </div>
      <div className="theme-choices" role="radiogroup" aria-label="Tema">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={theme === o.id} className={`theme-choice theme-choice--${o.id}`} onClick={() => setTheme(o.id)}>
            <span className="theme-choice__swatch" aria-hidden="true" />
            <span className="theme-choice__label">{o.label}</span>
            <span className="theme-choice__hint">{o.hint}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
