// Etapa 2: tela provisória só para confirmar que o instalador funciona.
// As telas reais (Painel Semanal, Hoje, Personagens...) entram nas próximas etapas.

const APP_VERSION = "0.1.0";

function App() {
  return (
    <div className="app-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <section className="panel" style={{ maxWidth: 560, width: "100%", padding: "40px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <svg width="56" height="56" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path d="M17 2 L19.5 14.5 L32 17 L19.5 19.5 L17 32 L14.5 19.5 L2 17 L14.5 14.5 Z" stroke="#dfe7f2" strokeWidth="1.2" />
          <path d="M6 9 Q11 4 17 6 M28 9 Q23 4 17 6" stroke="#8fdcef" strokeWidth="1" />
          <circle cx="17" cy="17" r="2" fill="#8fdcef" />
        </svg>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 300, letterSpacing: ".02em", color: "var(--text-strong)" }}>
          Registro do Daeva
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: "var(--cyan-light)", fontWeight: 600 }}>✦ Base do projeto funcionando</p>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-soft)", lineHeight: 1.6 }}>
          Se você está vendo esta tela, o instalador gerado pelo GitHub está funcionando.
          As telas de tarefas chegam nas próximas etapas.
        </p>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Versão {APP_VERSION}</span>
      </section>
    </div>
  );
}

export default App;
