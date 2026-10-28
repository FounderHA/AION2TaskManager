// Configurações → Conta: Membership (vale para a conta inteira) e regras da Odyle Energy.
import { useEffect, useState } from "react";
import { Button, Panel, SectionTitle, Switch } from "../components/ui";
import { DEFAULT_ODYLE, type OdyleConfig } from "../data/settings";
import { useStore } from "../data/store";

const FIELDS: { key: keyof OdyleConfig; label: string }[] = [
  { key: "capMember", label: "Limite com Membership" },
  { key: "rateMember", label: "Recarga com Membership" },
  { key: "capFree", label: "Limite sem Membership" },
  { key: "rateFree", label: "Recarga sem Membership" },
];

const toText = (c: OdyleConfig) => Object.fromEntries(FIELDS.map((f) => [f.key, String(c[f.key])])) as Record<keyof OdyleConfig, string>;

export function AccountSection() {
  const { data, setMembership, setOdyleConfig } = useStore();
  const { membership, odyle } = data.settings;
  const [draft, setDraft] = useState(toText(odyle));
  useEffect(() => setDraft(toText(odyle)), [odyle]);

  const parsed = Object.fromEntries(FIELDS.map((f) => [f.key, Number(draft[f.key])])) as unknown as OdyleConfig;
  const valid = FIELDS.every((f) => draft[f.key] !== "" && parsed[f.key] >= 1 && parsed[f.key] <= 100000);
  const dirty = FIELDS.some((f) => parsed[f.key] !== odyle[f.key]);
  const isDefault = FIELDS.every((f) => odyle[f.key] === DEFAULT_ODYLE[f.key]);

  return (
    <Panel label="Conta">
      <SectionTitle>Conta</SectionTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
        <Switch checked={membership} onChange={setMembership} label="Membership" />
        <span style={{ fontSize: 15, color: "var(--text)" }}>
          Membership <strong style={{ color: membership ? "var(--cyan-light)" : "var(--text-muted)" }}>{membership ? "ativo" : "desativado"}</strong>
        </span>
      </div>
      <p style={{ margin: "0 0 20px", color: "var(--text-soft)", lineHeight: 1.5 }}>
        O Membership é da conta e vale para todos os personagens. Ele muda o limite e a recarga da Odyle Energy e as descrições das tarefas (ex.: Abyss 14h).
      </p>

      <div className="field__label" style={{ marginBottom: 10 }}>
        Odyle Energy (Basic) — recarrega a cada 3h: 01h, 04h, 07h, 10h, 13h, 16h, 19h e 22h (Brasília)
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end" }}>
        {FIELDS.map((f) => (
          <div className="field" key={f.key} style={{ width: 200 }}>
            <label className="field__label" htmlFor={`odyle-${f.key}`}>
              {f.label}
            </label>
            <input id={`odyle-${f.key}`} className="input" inputMode="numeric" value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
          </div>
        ))}
        <Button variant="primary" disabled={!valid || !dirty} onClick={() => setOdyleConfig(parsed)}>
          Salvar
        </Button>
        <Button variant="ghost" disabled={isDefault && !dirty} onClick={() => setOdyleConfig({ ...DEFAULT_ODYLE })}>
          Restaurar padrão
        </Button>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Padrão: 840 e +15 com Membership; 560 e +10 sem. Só mude se o jogo mudar.</p>
    </Panel>
  );
}
