// Aba Guia: informações de referência. Primeira seção: prioridade de status por equipamento.
import { useState } from "react";
import { Panel, SectionTitle } from "../components/ui";
import { GEAR_SLOTS, GUIDE_SOURCE, SLOT_GROUPS, STONE_STATS, targetStats, type StatRow } from "../data/guide/statPriorities";

const MAX_ROLL = 8;

function PriorityList({ rows, highlight }: { rows: StatRow[]; highlight: string | null }) {
  return (
    <ol className="prio-list">
      {rows.map((row, i) => (
        <li key={row.stat} className={`prio-row ${row.target ? "prio-row--target" : "prio-row--optional"} ${highlight === row.stat ? "prio-row--hl" : ""}`}>
          <span className="prio-row__rank">
            <span>{i + 1}</span>
          </span>
          <span className="prio-row__stat">{row.stat}</span>
          <span className={`prio-tag ${row.target ? "prio-tag--target" : "prio-tag--optional"}`}>{row.target ? "Alvo" : "Opcional"}</span>
          <span className="prio-row__roll" title="Chance aproximada de sair">
            <span className="prio-row__roll-bar">
              <span style={{ width: `${Math.min(100, (row.roll / MAX_ROLL) * 100)}%` }} />
            </span>
            <span className="prio-row__roll-num">~{row.roll}%</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function GuideScreen() {
  const [slotId, setSlotId] = useState("weapon");
  const [stat, setStat] = useState<string | null>(null);
  const slot = GEAR_SLOTS.find((s) => s.id === slotId) ?? GEAR_SLOTS[0];
  const same = GEAR_SLOTS.filter((s) => s.id !== slot.id && s.stats.length && s.stats === slot.stats);
  const stats = targetStats();
  const hasStat = (id: string) => !!stat && !!GEAR_SLOTS.find((s) => s.id === id)?.stats.some((r) => r.target && r.stat === stat);

  return (
    <div className="page">
      <Panel label="Guia">
        <SectionTitle aside={<span className="guide-source">Fonte: {GUIDE_SOURCE.title} · transcrito em {GUIDE_SOURCE.date}</span>}>Guia · Prioridade de status</SectionTitle>
        <div className="guide-intro">
          <p>
            Ordem de prioridade dos status do <strong>Soul Binding</strong> em cada equipamento. A ideia é pegar o máximo de dano possível: busque todos os status marcados como <span className="prio-tag prio-tag--target">Alvo</span>. Os <span className="prio-tag prio-tag--optional">Opcional</span> são aceitáveis como provisórios.
          </p>
          <p>
            <strong>Critical Hit</strong> e <strong>Accuracy</strong> só são necessários até um certo limite (breakpoint), que depende do conteúdo PvE. A porcentagem ao lado de cada status é a chance aproximada de ele aparecer.
          </p>
        </div>
      </Panel>

      <div className="guide-grid">
        <Panel label="Equipamentos">
          <SectionTitle>Equipamentos</SectionTitle>
          <div className="slot-groups">
            {SLOT_GROUPS.map((g) => (
              <div key={g.id} className="slot-group">
                <span className="slot-group__label">{g.label}</span>
                <div className="slot-group__items">
                  {GEAR_SLOTS.filter((s) => s.group === g.id).map((s) => {
                    const empty = s.stats.length === 0;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`slot-btn ${s.id === slot.id ? "slot-btn--active" : ""} ${empty ? "slot-btn--empty" : ""} ${hasStat(s.id) ? "slot-btn--hl" : ""}`}
                        onClick={() => setSlotId(s.id)}
                        aria-pressed={s.id === slot.id}
                      >
                        <span className="slot-btn__name">{s.name}</span>
                        <span className="slot-btn__game">{empty ? "sem dados" : s.game}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="stat-finder">
            <span className="slot-group__label">Onde buscar cada status</span>
            <div className="stat-finder__chips">
              {stats.map((s) => (
                <button key={s.stat} type="button" className={`stat-chip ${stat === s.stat ? "stat-chip--on" : ""}`} onClick={() => setStat(stat === s.stat ? null : s.stat)} aria-pressed={stat === s.stat}>
                  {s.stat}
                  <span>{s.slots}</span>
                </button>
              ))}
            </div>
            <span className="stat-finder__hint">{stat ? `Equipamentos com ${stat} como alvo estão destacados.` : "Clique num status para ver em quais equipamentos ele é alvo."}</span>
          </div>
        </Panel>

        <Panel label={slot.name}>
          <div className="slot-detail__head">
            <span className="slot-detail__diamond" aria-hidden="true" />
            <div>
              <div className="slot-detail__title">{slot.name}</div>
              <div className="slot-detail__game">{slot.game} · Soul Binding</div>
            </div>
          </div>
          {slot.stats.length ? (
            <>
              <PriorityList rows={slot.stats} highlight={stat} />
              {same.length > 0 && <p className="slot-detail__note">Mesma prioridade de: {same.map((s) => s.name).join(", ")}.</p>}
              {(slot.id === "weapon" || slot.id === "guard") && (
                <div className="guide-callout">
                  <strong>Precision ou Multi-hit Chance?</strong> A Precision dá Critical Hit e Accuracy, importantes para cumprir os requisitos de certos chefes e no PvP. Depois de atingir esses requisitos, Multi-hit Chance passa a valer mais no PvE.
                </div>
              )}
            </>
          ) : (
            <p className="slot-detail__empty">A planilha ainda não tem prioridades para este equipamento.</p>
          )}
        </Panel>
      </div>

      <Panel label="Manastone e Soulstone">
        <SectionTitle aside="Valem para todos os itens">Manastone / Soulstone</SectionTitle>
        <div className="stone-grid">
          <PriorityList rows={STONE_STATS} highlight={stat} />
          <div className="guide-callout">
            Não dá para escolher um status de cada vez com Manastones e Soulstones. O objetivo é conseguir a <strong>melhor combinação possível</strong>, já que depende de sorte.
          </div>
        </div>
      </Panel>

      <p className="guide-footer">
        Dados da comunidade ({GUIDE_SOURCE.author}). Podem mudar com patches do jogo. Planilha original: <span className="guide-url">{GUIDE_SOURCE.url}</span>
      </p>
    </div>
  );
}
