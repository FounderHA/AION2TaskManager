// Aba Simuladores: a "Forja de Raridades" do usuário (Forja, Festival Shugo, Roleta de Seleção
// e Sorteio do Grupo), igual à página original. Fica em public/forja/index.html e roda dentro
// de um iframe, então tem o próprio visual, os próprios dados (localStorage) e não mexe no resto do app.
// O iframe continua montado depois da primeira visita, para não perder uma simulação em andamento
// ao trocar de aba.
import { useLayoutEffect, useRef, useState } from "react";

export function SimulatorsScreen({ hidden }: { hidden: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  // O iframe ocupa a janela do topo dele até embaixo (a rolagem fica dentro da Forja)
  useLayoutEffect(() => {
    if (hidden) return;
    const fit = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(480, window.innerHeight - top - 12));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [hidden]);

  return (
    <div className="sim-screen" hidden={hidden}>
      <iframe
        ref={ref}
        className="sim-frame"
        style={height ? { height } : undefined}
        src={`${import.meta.env.BASE_URL}forja/index.html`}
        title="Simuladores: Forja de Raridades, Festival Shugo, Roleta de Seleção e Sorteio do Grupo"
      />
    </div>
  );
}
