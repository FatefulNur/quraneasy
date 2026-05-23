const KEY = "qe:progress";

export type ProgressMap = Record<string, boolean>;

function safeWindow(): Window | null {
  return typeof window !== "undefined" ? window : null;
}

export function progressKey(
  moduleId: string,
  slideId: string,
  submoduleId: string,
): string {
  return `${moduleId}:${slideId}:${submoduleId}`;
}

export function getProgress(): ProgressMap {
  const w = safeWindow();
  if (!w) return {};
  try {
    const raw = w.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProgress(p: ProgressMap): void {
  const w = safeWindow();
  if (!w) return;
  try {
    w.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore quota / serialization errors
  }
}

export function setSubmoduleDone(
  moduleId: string,
  slideId: string,
  submoduleId: string,
  done: boolean,
): ProgressMap {
  const p = getProgress();
  const k = progressKey(moduleId, slideId, submoduleId);
  if (done) p[k] = true;
  else delete p[k];
  saveProgress(p);
  return p;
}

export function clearProgress(): void {
  const w = safeWindow();
  if (!w) return;
  try {
    w.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
