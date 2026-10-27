import { Button, ProgressBar } from "../components/ui";
import type { UpdaterState } from "./useUpdater";

// Faixa que aparece abaixo do cabeçalho quando há versão nova
export function UpdateBanner({ state, dismissed, onInstall, onDismiss }: { state: UpdaterState; dismissed: boolean; onInstall: () => void; onDismiss: () => void }) {
  if (state.kind === "available" && dismissed) return null;
  if (state.kind !== "available" && state.kind !== "downloading" && state.kind !== "installing") return null;

  return (
    <div className="update-banner" role="status">
      <div className="update-banner__text">
        <strong>✦ Nova versão {state.version} disponível</strong>
        {state.kind === "available" && state.notes && <span className="update-banner__notes">{state.notes}</span>}
        {state.kind === "downloading" && <span className="update-banner__notes">Baixando atualização…</span>}
        {state.kind === "installing" && <span className="update-banner__notes">Instalando… o app vai reiniciar sozinho.</span>}
      </div>
      {state.kind === "available" && (
        <div className="update-banner__actions">
          <Button variant="ghost" onClick={onDismiss}>
            Depois
          </Button>
          <Button variant="primary" onClick={onInstall}>
            Atualizar agora
          </Button>
        </div>
      )}
      {state.kind === "downloading" && (
        <div style={{ width: 240 }}>
          <ProgressBar value={state.percent ?? 0} showLabel={state.percent !== null} />
        </div>
      )}
    </div>
  );
}

// Rodapé com a versão instalada e o botão de verificar
export function VersionFooter({ version, state, onCheck }: { version: string; state: UpdaterState; onCheck: () => void }) {
  const status =
    state.kind === "checking"
      ? "Verificando…"
      : state.kind === "uptodate"
        ? "Você está na versão mais recente."
        : state.kind === "error"
          ? state.message
          : "";
  return (
    <footer className="version-footer">
      <span>AION2 Task Manager {version ? `v${version}` : ""}</span>
      <button className="version-footer__link" onClick={onCheck} disabled={state.kind === "checking" || state.kind === "downloading" || state.kind === "installing"}>
        Verificar atualizações
      </button>
      {status && <span className={state.kind === "error" ? "version-footer__error" : ""}>{status}</span>}
    </footer>
  );
}
