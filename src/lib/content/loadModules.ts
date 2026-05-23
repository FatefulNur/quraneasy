import type { Module } from "./types";

const files = import.meta.glob<{ default: Module }>(
  "@/content/modules/*.json",
  { eager: true },
);

function isValid(m: unknown): m is Module {
  if (!m || typeof m !== "object") return false;
  const mod = m as Module;
  if (
    !mod.id ||
    typeof mod.order !== "number" ||
    typeof mod.recommendedOrder !== "number" ||
    !Array.isArray(mod.submodules) ||
    mod.submodules.length === 0
  ) {
    return false;
  }
  for (const sm of mod.submodules) {
    if (!sm.id || !sm.title || !sm.definition) return false;
  }
  return true;
}

export function loadModules(): Module[] {
  const mods: Module[] = [];
  for (const [path, mod] of Object.entries(files)) {
    const data = mod.default;
    if (!isValid(data)) {
      console.error(`[content] Invalid module file: ${path}`);
      continue;
    }
    mods.push(data);
  }
  return mods.sort((a, b) => a.recommendedOrder - b.recommendedOrder);
}

export function getModule(id: string): Module | undefined {
  return loadModules().find((m) => m.id === id);
}
