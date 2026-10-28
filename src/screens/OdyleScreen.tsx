// Aba Odyle: Odyle Energy de cada personagem (Basic com recarga automática + Charged dos itens).
import { useState } from "react";
import { Alert, Badge, Button, Panel, SectionTitle } from "../components/ui";
import type { Character, OdyleSnapshot } from "../data/model";
import { CHARGED_ADD_OPTIONS, CHARGED_CAP, currentOdyle, rulesFor, SPEND_OPTIONS, type OdyleNow, type OdyleRules } from "../data/odyle";
import { useStore } from "../data/store";
import { formatCountdown } from "../time/gameTime";
import type { GameClock } from "../time/useGameClock";

/** "13:00" se for hoje; senão "qui 13:00". */
function timeLabel(d: Date, now: Date): string {
  const hm = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return hm;
  const wd = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return `${wd} ${hm}`;
}

function EnergyBar({ value, max, kind, level }: { value: number; max: number; kind: "basic" | "charged"; level?: OdyleNow["level"] }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="energy">
      <div className={`energy__track energy__track--${kind} ${level ? `energy__track--${level}` : ""}`}>
        <div className="energy__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="energy__value">
        <strong>{value}</strong> / {max}
      </span>
    </div>
  );
}

const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 4);

function OdyleEditor({ initial, rules, onSave, onCancel, onStop }: { initial: { basic: number; charged: number } | null; rules: OdyleRules; onSave: (v: { basic: number; charged: number }) => void; onCancel: () => void; onStop?: () => void }) {
  const [basic, setBasic] = useState(initial ? String(initial.basic) : "");
  const [charged, setCharged] = useState(initial ? String(initial.charged) : "");
  return (
    <form
      className="odyle-editor"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ basic: Number(basic || 0), charged: Number(charged || 0) });
      }}
    >
      <p className="odyle-editor__hint">Digite os valores que aparecem no jogo agora. A contagem recomeça a partir deles.</p>
      <div className="odyle-editor__fields">
        <label className="field">
          <span className="field__label">Basic (0–{rules.cap})</span>
          <input className="input" inputMode="numeric" autoFocus value={basic} onChange={(e) => setBasic(onlyDigits(e.target.value))} />
        </label>
        <label className="field">
          <span className="field__label">Charged (0–{CHARGED_CAP})</span>
          <input className="input" inputMode="numeric" value={charged} onChange={(e) => setCharged(onlyDigits(e.target.value))} />
        </label>
      </div>
      <div className="odyle-editor__actions">
        <Button type="submit" variant="primary">
          Salvar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        {onStop && (
          <>
            <span className="form__spacer" />
            <Button type="button" variant="ghost" onClick={onStop}>
              Parar de controlar
            </Button>
          </>
        )}
      </div>
    </form>
  );
}

function OdyleCard({ char, rules, now }: { char: Character; rules: OdyleRules; now: Date }) {
  const { setOdyle, spendOdyle, addChargedOdyle, updateCharacter } = useStore();
  const [editing, setEditing] = useState(false);
  const [undo, setUndo] = useState<{ label: string; snap: OdyleSnapshot } | null>(null);
  const snap = char.odyle;
  const cur = snap ? currentOdyle(snap, rules, now) : null;

  const act = (label: string, fn: () => void) => {
    if (snap) setUndo({ label, snap });
    fn();
  };

  return (
    <Panel label={char.name}>
      <div className={`odyle-card ${cur ? `odyle-card--${cur.level}` : ""}`}>
        <div className="odyle-card__head">
          <span className="today-char__name">{char.name}</span>
          <Badge kind={char.role === "MAIN" ? "main" : "alt"} />
          <span className="today-char__meta">{char.className}</span>
          {cur?.level === "full" && <span className="odyle-flag odyle-flag--full">CHEIA</span>}
          {cur?.level === "warn" && <span className="odyle-flag odyle-flag--warn">QUASE CHEIA</span>}
        </div>

        {editing || !cur ? (
          editing ? (
            <OdyleEditor
              initial={cur ? { basic: cur.basic, charged: cur.charged } : null}
              rules={rules}
              onCancel={() => setEditing(false)}
              onSave={(v) => {
                act("correção", () => setOdyle(char.id, v));
                setEditing(false);
              }}
              onStop={
                cur
                  ? () => {
                      setOdyle(char.id, null);
                      setUndo(null);
                      setEditing(false);
                    }
                  : undefined
              }
            />
          ) : (
            <div className="odyle-card__empty">
              <span>Ainda sem valores de Odyle Energy.</span>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Informar valores
              </Button>
            </div>
          )
        ) : (
          <>
            <div className="odyle-card__row">
              <span className="odyle-card__label">Basic Energy</span>
              <EnergyBar value={cur.basic} max={cur.cap} kind="basic" level={cur.level} />
              <span className="odyle-card__info">
                {cur.level === "full" ? (
                  <span className="odyle-card__alert">Cheia: parou de recarregar. Gaste para não perder as próximas recargas (+{cur.rate} às {timeLabel(cur.nextTick, now)}).</span>
                ) : (
                  <>
                    +{cur.rate} às {timeLabel(cur.nextTick, now)} (em {formatCountdown(cur.nextTick.getTime() - now.getTime())})
                    {cur.fullAt && <> · enche {timeLabel(cur.fullAt, now)} (em {formatCountdown(cur.fullAt.getTime() - now.getTime())})</>}
                  </>
                )}
              </span>
            </div>
            <div className="odyle-card__row">
              <span className="odyle-card__label">Charged Energy</span>
              <EnergyBar value={cur.charged} max={CHARGED_CAP} kind="charged" />
              <span className="odyle-card__info">Dos itens; não recarrega. É usada depois que a Basic acaba.</span>
            </div>

            <div className="odyle-card__actions">
              <div className="odyle-card__group">
                <span className="odyle-card__group-label">Gastar</span>
                {SPEND_OPTIONS.map((n) => (
                  <Button key={n} variant="primary" disabled={cur.basic + cur.charged < n} onClick={() => act(`gastar ${n}`, () => spendOdyle(char.id, n))}>
                    −{n}
                  </Button>
                ))}
              </div>
              <div className="odyle-card__group">
                <span className="odyle-card__group-label">Charged</span>
                {CHARGED_ADD_OPTIONS.map((n) => (
                  <Button key={n} variant="secondary" disabled={cur.charged >= CHARGED_CAP} onClick={() => act(`charged +${n}`, () => addChargedOdyle(char.id, n))}>
                    +{n}
                  </Button>
                ))}
              </div>
              <span className="form__spacer" />
              {undo && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    updateCharacter(char.id, { odyle: undo.snap });
                    setUndo(null);
                  }}
                >
                  Desfazer ({undo.label})
                </Button>
              )}
              <Button variant="ghost" onClick={() => setEditing(true)}>
                Corrigir valores
              </Button>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

export function OdyleScreen({ clock, onGoToCharacters }: { clock: GameClock; onGoToCharacters: () => void }) {
  const { characters, data } = useStore();
  const { membership, odyle } = data.settings;
  const rules = rulesFor(odyle, membership);
  const now = clock.now;

  if (!characters.length) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <span style={{ fontSize: 16, color: "var(--text)" }}>Cadastre seus personagens para controlar a Odyle Energy.</span>
            <Button variant="primary" onClick={onGoToCharacters}>
              Ir para Personagens
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  const tracked = characters.filter((c) => c.odyle).map((c) => ({ char: c, cur: currentOdyle(c.odyle!, rules, now) }));
  // Mais perto de encher primeiro (cheias no topo)
  const byUrgency = [...tracked].sort((a, b) => (a.cur.fullAt?.getTime() ?? 0) - (b.cur.fullAt?.getTime() ?? 0));
  const alerts = tracked.filter((t) => t.cur.level !== "ok");
  const nextTick = tracked[0]?.cur.nextTick;

  return (
    <div className="page">
      <Panel label="Resumo">
        <SectionTitle aside={`${membership ? "Com" : "Sem"} Membership · limite ${rules.cap} · +${rules.rate} a cada 3h`}>Odyle Energy</SectionTitle>
        {tracked.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-soft)" }}>Informe a Odyle Energy atual de cada personagem nos cards abaixo. Depois disso o app soma as recargas sozinho (01h, 04h, 07h… de Brasília), mesmo com ele fechado.</p>
        ) : (
          <div className="odyle-summary">
            <ul className="odyle-summary__list">
              {byUrgency.map(({ char, cur }) => (
                <li key={char.id} className={`odyle-summary__item odyle-summary__item--${cur.level}`}>
                  <span className="odyle-summary__name">{char.name}</span>
                  <span className="odyle-summary__val">
                    {cur.basic}/{cur.cap}
                  </span>
                  <span className="odyle-summary__when">{cur.fullAt ? `enche ${timeLabel(cur.fullAt, now)}` : "cheia"}</span>
                </li>
              ))}
            </ul>
            <div className="odyle-summary__side">
              {nextTick && (
                <span>
                  Próxima recarga: <strong>{timeLabel(nextTick, now)}</strong> (em {formatCountdown(nextTick.getTime() - now.getTime())})
                </span>
              )}
              {alerts.length > 0 ? (
                <Alert kind="warning">
                  {alerts.map((a) => a.char.name).join(", ")} {alerts.length === 1 ? "está" : "estão"} com {rules.cap - 40}+ de Basic. Gaste antes de encher para não perder recarga.
                </Alert>
              ) : (
                <Alert kind="info">Ninguém perto do limite.</Alert>
              )}
            </div>
          </div>
        )}
      </Panel>

      <div className="odyle-grid">
        {characters.map((c) => (
          <OdyleCard key={c.id} char={c} rules={rules} now={now} />
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Membership e limites ficam em Configurações → Conta. A tarefa diária "Odyle Energy" continua em Hoje/Semana para marcar que você já gastou o que queria no dia.</p>
    </div>
  );
}
