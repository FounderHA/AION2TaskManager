// Estado global do app: carrega dados.json ao abrir e salva sozinho a cada mudança.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { emptyData, ensureSingleMain, NAME_MAX, parseData, sortCharacters, type AppData, type Character } from "./model";
import { CUSTOM_PREFIX, resolveCatalog, TASK_DESC_MAX, TASK_NAME_MAX, type ResolvedTask } from "./settings";
import { loadRaw, saveRaw } from "./storage";
import type { TaskDef } from "./types";
import type { ResetConfig } from "../time/gameTime";

export type SaveStatus = "carregando" | "salvo" | "salvando" | "erro";
export type CharacterInput = Omit<Character, "id" | "createdAt" | "role"> & { makeMain?: boolean };

interface StoreValue {
  data: AppData;
  characters: Character[];
  main: Character | undefined;
  saveStatus: SaveStatus;
  addCharacter: (input: CharacterInput) => string;
  updateCharacter: (id: string, patch: Partial<Omit<Character, "id" | "createdAt" | "role">>) => void;
  setMain: (id: string) => void;
  deleteCharacter: (id: string) => void;
  /** Liga/desliga uma marcação (chave de data/checks.ts). */
  toggleCheck: (key: string) => void;
  /** Substitui todos os dados (importar backup). */
  replaceAll: (next: AppData) => void;
  /** Catálogo com os ajustes do usuário e as tarefas próprias. */
  catalog: ResolvedTask[];
  reset: ResetConfig;
  setTaskEnabled: (id: string, enabled: boolean) => void;
  /** Texto novo, ou null para voltar à descrição padrão. */
  setTaskDescription: (id: string, description: string | null) => void;
  addCustomTask: (task: Omit<TaskDef, "id" | "enabledByDefault">) => string;
  deleteCustomTask: (id: string) => void;
  setReset: (reset: ResetConfig) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const cleanName = (name: string) => name.trim().slice(0, NAME_MAX);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("carregando");
  const loaded = useRef(false);

  // Carrega ao abrir
  useEffect(() => {
    loadRaw()
      .then((raw) => setData(parseData(raw)))
      .catch((e) => console.error("Falha ao carregar dados:", e))
      .finally(() => {
        loaded.current = true;
        setSaveStatus("salvo");
      });
  }, []);

  // Salva 300 ms depois da última mudança
  useEffect(() => {
    if (!loaded.current) return;
    setSaveStatus("salvando");
    const t = setTimeout(() => {
      saveRaw(JSON.stringify(data, null, 2))
        .then(() => setSaveStatus("salvo"))
        .catch((e) => {
          console.error("Falha ao salvar:", e);
          setSaveStatus("erro");
        });
    }, 300);
    return () => clearTimeout(t);
  }, [data]);

  const addCharacter = useCallback((input: CharacterInput) => {
    const id = newId();
    setData((d) => {
      const isFirst = d.characters.length === 0;
      const char: Character = {
        id,
        name: cleanName(input.name),
        className: input.className,
        faction: input.faction,
        member: input.member,
        role: isFirst || input.makeMain ? "MAIN" : "ALT",
        createdAt: new Date().toISOString(),
      };
      const others = char.role === "MAIN" ? d.characters.map((c) => ({ ...c, role: "ALT" as const })) : d.characters;
      return { ...d, characters: [...others, char] };
    });
    return id;
  }, []);

  const updateCharacter = useCallback((id: string, patch: Partial<Omit<Character, "id" | "createdAt" | "role">>) => {
    setData((d) => ({
      ...d,
      characters: d.characters.map((c) => (c.id !== id ? c : { ...c, ...patch, name: patch.name !== undefined ? cleanName(patch.name) : c.name })),
    }));
  }, []);

  const setMain = useCallback((id: string) => {
    setData((d) => ({ ...d, characters: d.characters.map((c) => ({ ...c, role: c.id === id ? "MAIN" : "ALT" })) }));
  }, []);

  const deleteCharacter = useCallback((id: string) => {
    setData((d) => {
      const rest = d.characters.filter((c) => c.id !== id);
      // Remove as marcações do personagem excluído (as de servidor ficam)
      const checks = Object.fromEntries(Object.entries(d.checks).filter(([k]) => !k.startsWith(`${id}|`)));
      // Se o main foi excluído, ensureSingleMain promove o alt mais antigo
      return { ...d, characters: ensureSingleMain(rest), checks };
    });
  }, []);

  const toggleCheck = useCallback((key: string) => {
    setData((d) => {
      const checks = { ...d.checks };
      if (checks[key]) delete checks[key];
      else checks[key] = new Date().toISOString();
      return { ...d, checks };
    });
  }, []);

  const replaceAll = useCallback((next: AppData) => {
    setData({ ...next, characters: ensureSingleMain(next.characters) });
  }, []);

  const setTaskEnabled = useCallback((id: string, enabled: boolean) => {
    setData((d) => ({ ...d, settings: { ...d.settings, tasks: { ...d.settings.tasks, [id]: { ...d.settings.tasks[id], enabled } } } }));
  }, []);

  const setTaskDescription = useCallback((id: string, description: string | null) => {
    setData((d) => {
      const current = { ...d.settings.tasks[id] };
      if (description === null) delete current.description;
      else current.description = description.trim().slice(0, TASK_DESC_MAX);
      const tasks = { ...d.settings.tasks, [id]: current };
      if (!Object.keys(current).length) delete tasks[id];
      return { ...d, settings: { ...d.settings, tasks } };
    });
  }, []);

  const addCustomTask = useCallback((task: Omit<TaskDef, "id" | "enabledByDefault">) => {
    const id = `${CUSTOM_PREFIX}${newId()}`;
    const def: TaskDef = {
      ...task,
      id,
      name: task.name.trim().slice(0, TASK_NAME_MAX),
      description: task.description.trim().slice(0, TASK_DESC_MAX),
      days: task.cadence === "dias-fixos" ? task.days : undefined,
      enabledByDefault: true,
    };
    setData((d) => ({ ...d, settings: { ...d.settings, customTasks: [...d.settings.customTasks, def] } }));
    return id;
  }, []);

  const deleteCustomTask = useCallback((id: string) => {
    setData((d) => {
      const tasks = { ...d.settings.tasks };
      delete tasks[id];
      // Remove também as marcações dessa tarefa
      const checks = Object.fromEntries(Object.entries(d.checks).filter(([k]) => k.split("|")[1] !== id));
      return { ...d, checks, settings: { ...d.settings, tasks, customTasks: d.settings.customTasks.filter((t) => t.id !== id) } };
    });
  }, []);

  const setReset = useCallback((reset: ResetConfig) => {
    setData((d) => ({ ...d, settings: { ...d.settings, reset } }));
  }, []);

  const catalog = useMemo(() => resolveCatalog(data.settings), [data.settings]);

  const value = useMemo<StoreValue>(() => {
    const characters = sortCharacters(data.characters);
    return {
      data,
      characters,
      main: characters.find((c) => c.role === "MAIN"),
      saveStatus,
      addCharacter,
      updateCharacter,
      setMain,
      deleteCharacter,
      toggleCheck,
      replaceAll,
      catalog,
      reset: data.settings.reset,
      setTaskEnabled,
      setTaskDescription,
      addCustomTask,
      deleteCustomTask,
      setReset,
    };
  }, [data, saveStatus, addCharacter, updateCharacter, setMain, deleteCharacter, toggleCheck, replaceAll, catalog, setTaskEnabled, setTaskDescription, addCustomTask, deleteCustomTask, setReset]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}
