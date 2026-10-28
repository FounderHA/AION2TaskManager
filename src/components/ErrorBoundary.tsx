// Se alguma tela quebrar, mostra uma mensagem amigável em vez de tela em branco.
import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro na interface:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="app-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <section className="panel panel--pad" style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--cyan-light)" }}>✦ Algo deu errado nesta tela</h1>
          <p style={{ margin: 0, color: "var(--text-soft)", lineHeight: 1.6 }}>
            Seus dados estão seguros: eles ficam salvos no arquivo do app e não são apagados por este erro. Tente reabrir o app. Se o problema continuar, copie a mensagem abaixo e envie para correção.
          </p>
          <code style={{ display: "block", padding: "10px 12px", borderRadius: 3, background: "rgba(7,11,20,.55)", border: "1px solid var(--line)", color: "#f2d4d8", fontSize: 12, whiteSpace: "pre-wrap", userSelect: "all" }}>{String(this.state.error?.stack ?? this.state.error)}</code>
          <div>
            <button className="btn btn--primary" onClick={() => this.setState({ error: null })}>
              Tentar de novo
            </button>
          </div>
        </section>
      </div>
    );
  }
}
