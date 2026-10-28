// Aba Configurações: backup (exportar/importar), local dos dados e catálogo de tarefas.
import { useEffect, useState } from "react";
import { Alert, Button, Panel, SectionTitle } from "../components/ui";
import { backupFileName, makeBackup, readBackup, snapshotName, summarize, type BackupSummary } from "../data/backup";
import { pickBackupFile, saveBackupFile, snapshotCurrent } from "../data/backupIO";
import type { AppData } from "../data/model";
import { dataLocation } from "../data/storage";
import { useStore } from "../data/store";
import { dayLabel } from "../time/gameTime";
import { CatalogSection } from "./CatalogSection";

type Message = { kind: "info" | "warning" | "danger"; text: string } | null;
type Pending = { fileName: string; data: AppData; summary: BackupSummary } | null;

const fmtDay = (key: string | null) => {
  if (!key) return "—";
  const l = dayLabel(key);
  return `${l.day} ${l.month} ${key.slice(0, 4)}`;
};
const fmtDateTime = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "não informado");

function SummaryList({ s }: { s: BackupSummary }) {
  return (
    <dl className="stat-list" style={{ maxWidth: 460 }}>
      <dt>Personagens</dt>
      <dd>
        {s.characters}
        {s.mainName ? ` (main: ${s.mainName})` : ""}
      </dd>
      <dt>Marcações</dt>
      <dd>{s.checks}</dd>
      <dt>Período com marcações</dt>
      <dd>{s.firstDay ? `${fmtDay(s.firstDay)} → ${fmtDay(s.lastDay)}` : "—"}</dd>
      {s.exportedAt !== undefined && s.exportedAt !== null && (
        <>
          <dt>Exportado em</dt>
          <dd>{fmtDateTime(s.exportedAt)}</dd>
        </>
      )}
    </dl>
  );
}

export function SettingsScreen({ appVersion }: { appVersion: string }) {
  const { data, replaceAll } = useStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [location, setLocation] = useState("");

  useEffect(() => {
    dataLocation()
      .then(setLocation)
      .catch(() => setLocation("não disponível"));
  }, []);

  const current = summarize(data);

  const doExport = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const path = await saveBackupFile(makeBackup(data, appVersion), backupFileName());
      if (path) setMessage({ kind: "info", text: `Backup salvo em: ${path}` });
    } catch (e) {
      setMessage({ kind: "danger", text: `Não foi possível salvar o backup: ${String(e)}` });
    } finally {
      setBusy(false);
    }
  };

  const doPick = async () => {
    setBusy(true);
    setMessage(null);
    setPending(null);
    try {
      const file = await pickBackupFile();
      if (!file) return;
      const r = readBackup(file.text);
      if (!r.ok) setMessage({ kind: "danger", text: r.error });
      else setPending({ fileName: file.name, data: r.data, summary: r.summary });
    } catch (e) {
      setMessage({ kind: "danger", text: `Não foi possível ler o arquivo: ${String(e)}` });
    } finally {
      setBusy(false);
    }
  };

  const doImport = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      // Cópia de segurança dos dados atuais antes de substituir
      const where = await snapshotCurrent(snapshotName(), makeBackup(data, appVersion));
      replaceAll(pending.data);
      setPending(null);
      setMessage({ kind: "info", text: `Backup importado! Os dados anteriores foram guardados em: ${where}` });
    } catch (e) {
      setMessage({ kind: "danger", text: `Importação cancelada: não foi possível guardar a cópia de segurança dos dados atuais (${String(e)}).` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <Panel label="Backup">
        <SectionTitle>Backup</SectionTitle>
        <p style={{ margin: "0 0 18px", color: "var(--text-soft)", lineHeight: 1.6 }}>
          O backup é um arquivo <strong>.json</strong> com seus personagens e todo o histórico de marcações. Ele abre no Bloco de Notas. Para levar tudo para outro PC: exporte aqui, copie o arquivo (pendrive, Google Drive…), instale o app no outro PC e use <strong>Importar backup</strong>.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div className="field__label" style={{ marginBottom: 10 }}>
              Dados atuais
            </div>
            <SummaryList s={current} />
          </div>
          <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <Button variant="primary" onClick={doExport} disabled={busy}>
              Exportar backup
            </Button>
            <Button variant="secondary" onClick={doPick} disabled={busy}>
              Importar backup
            </Button>
          </div>
        </div>

        {message && (
          <div style={{ marginTop: 18 }}>
            <Alert kind={message.kind}>{message.text}</Alert>
          </div>
        )}

        {pending && (
          <div className="panel" style={{ marginTop: 22, padding: 20 }}>
            <SectionTitle aside={pending.fileName}>Conferir antes de importar</SectionTitle>
            <SummaryList s={pending.summary} />
            <div style={{ marginTop: 16 }}>
              <Alert kind="warning">
                Importar <strong>substitui todos os dados atuais</strong> ({current.characters} personagens e {current.checks} marcações) pelos dados deste arquivo. Antes disso, uma cópia de segurança dos dados atuais é guardada automaticamente.
              </Alert>
            </div>
            <div className="form__actions" style={{ marginTop: 16 }}>
              <Button variant="danger" onClick={doImport} disabled={busy}>
                Substituir pelos dados do backup
              </Button>
              <Button variant="ghost" onClick={() => setPending(null)} disabled={busy}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Panel>

      <Panel label="Local dos dados">
        <SectionTitle>Local dos dados</SectionTitle>
        <p style={{ margin: "0 0 8px", color: "var(--text-soft)" }}>Seus dados são salvos automaticamente neste arquivo (com uma cópia da versão anterior em dados.json.bak):</p>
        <code style={{ display: "block", padding: "10px 12px", borderRadius: 3, background: "rgba(7,11,20,.55)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 13, wordBreak: "break-all", userSelect: "all" }}>{location || "…"}</code>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)" }}>As cópias feitas antes de cada importação ficam na pasta "copias-de-seguranca", no mesmo lugar.</p>
      </Panel>

      <CatalogSection />
    </div>
  );
}
