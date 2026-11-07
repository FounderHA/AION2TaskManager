// Avisos da aba Horários: pop-up dentro do app + som + notificação do Windows.
// Fica montado no App (modo completo e compacto), então avisa em qualquer aba.
import { useEffect, useRef, useState } from "react";
import { useStore } from "../data/store";
import { categoryInfo, dueAlerts, localWhen, type DueAlert } from "../data/timers";
import { playAlertSound } from "./alertSound";

const FIRED_KEY = "aion2tm-avisos-disparados";
const TOAST_MS = 20_000;
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

function loadFired(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(FIRED_KEY) ?? "[]");
    if (Array.isArray(raw)) {
      // Só guarda avisos das últimas 24h
      const cut = Date.now() - 86_400_000;
      return new Set(raw.filter((k): k is string => typeof k === "string" && Number(k.split("|")[1]) > cut));
    }
  } catch {
    /* começa vazio */
  }
  return new Set();
}

function saveFired(s: Set<string>) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify([...s]));
  } catch {
    /* ok */
  }
}

async function systemNotify(title: string, body: string) {
  if (!isTauri()) return;
  try {
    const n = await import("@tauri-apps/plugin-notification");
    let ok = await n.isPermissionGranted();
    if (!ok) ok = (await n.requestPermission()) === "granted";
    if (ok) n.sendNotification({ title, body });
  } catch (e) {
    console.error("Notificação do Windows:", e);
  }
}

interface Toast extends DueAlert {
  shownAt: number;
}

function alertText(a: DueAlert, now: number) {
  const left = a.start - now;
  if (a.kind === "hora" || left <= 30_000) return `Começando agora · ${localWhen(a.start, now)}`;
  const min = Math.round(left / 60_000);
  return `Em ${min} min · ${localWhen(a.start, now)}`;
}

export function TimerAlerts({ compact }: { compact?: boolean }) {
  const { data } = useStore();
  const s = data.settings.timers;
  const fired = useRef<Set<string>>(loadFired());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      const due = dueAlerts(s, t, fired.current);
      if (due.length) {
        for (const a of due) fired.current.add(a.key);
        saveFired(fired.current);
        setToasts((cur) => [...due.map((a) => ({ ...a, shownAt: t })), ...cur].slice(0, 4));
        due.forEach((a, i) => window.setTimeout(() => playAlertSound(a.def.id, s.alerts.volume), i * 900));
        if (s.alerts.system) {
          const body = due.map((a) => `${a.def.name}: ${alertText(a, t)}`).join("\n");
          void systemNotify(due.length === 1 ? `Aion 2 · ${due[0].def.name}` : `Aion 2 · ${due.length} eventos`, body);
        }
      }
      setToasts((cur) => cur.filter((x) => t - x.shownAt < TOAST_MS));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [s]);

  if (!toasts.length) return null;
  return (
    <div className={`tm-toasts ${compact ? "tm-toasts--compact" : ""}`} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.key} className="tm-toast" style={{ ["--c" as string]: categoryInfo(t.def.category).color }}>
          <span className="tm-toast__bell" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 16 16">
              <path d="M8 2a4 4 0 0 0-4 4v3L2.5 11h11L12 9V6a4 4 0 0 0-4-4zM6.5 13a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="tm-toast__body">
            <span className="tm-toast__name">{t.def.name}</span>
            <span className="tm-toast__when">{alertText(t, now)}</span>
          </div>
          <button type="button" className="tm-toast__close" onClick={() => setToasts((cur) => cur.filter((x) => x.key !== t.key))} aria-label="Fechar aviso">
            ×
          </button>
          <span className="tm-toast__timer" style={{ animationDuration: `${TOAST_MS}ms` }} />
        </div>
      ))}
    </div>
  );
}
