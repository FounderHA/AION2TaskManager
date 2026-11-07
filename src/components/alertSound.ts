// Sons dos avisos da aba Horários.
// Cada evento terá o próprio som (o usuário vai mandar os arquivos): coloque o arquivo em
// public/sons/<id-do-evento>.mp3 (ou .wav/.ogg) e registre em CUSTOM_SOUNDS abaixo.
// Enquanto não houver arquivo, o app toca um sininho sintetizado diferente para cada evento.

/** Arquivos de som por evento (id → caminho dentro de public/). */
export const CUSTOM_SOUNDS: Record<string, string> = {
  // "watcher-kaira": "sons/watcher-kaira.mp3",
};

/** Melodias provisórias (notas em semitons a partir de Lá 440 Hz). */
const MELODIES: Record<string, number[]> = {
  "watcher-kaira": [0, 7, 12],
  "argo-spirit-king": [12, 7, 3, 0],
  executors: [0, 0, 7, 7],
  nahma: [-5, 0, 4, 7],
  "middle-reshanta-bosses": [0, 3, 7, 10],
  "artifact-siege": [0, 4, 7, 12, 7],
  "spacetime-rift": [12, 16, 19],
  "arena-tactics": [7, 5, 7, 12],
  "shugo-festival": [12, 14, 16, 19, 24],
  "dimensional-invasion": [0, 6, 12],
  "melted-danar": [4, 0],
  "silent-dartan": [7, 2],
  "soul-ruler-kashapa": [9, 4],
  "high-commander-lagta": [12, 7, 12],
  "immortal-gartua": [5, 0, 5],
};

let ctx: AudioContext | null = null;

function synth(id: string, volume: number) {
  ctx ??= new AudioContext();
  const ac = ctx;
  if (ac.state === "suspended") void ac.resume();
  const notes = MELODIES[id] ?? [0, 7];
  const master = ac.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume / 100)) * 0.35;
  master.connect(ac.destination);
  const t0 = ac.currentTime + 0.02;
  notes.forEach((n, i) => {
    const t = t0 + i * 0.16;
    const freq = 440 * Math.pow(2, n / 12);
    for (const [mult, amp] of [
      [1, 1],
      [2, 0.25],
    ] as const) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.6);
    }
  });
}

/** Toca o som do evento (arquivo do usuário, se houver; senão o sininho provisório). */
export function playAlertSound(id: string, volume: number) {
  const file = CUSTOM_SOUNDS[id];
  if (file) {
    const a = new Audio(`${import.meta.env.BASE_URL}${file}`);
    a.volume = Math.max(0, Math.min(1, volume / 100));
    a.play().catch(() => synth(id, volume));
    return;
  }
  try {
    synth(id, volume);
  } catch (e) {
    console.error("Som do aviso:", e);
  }
}
