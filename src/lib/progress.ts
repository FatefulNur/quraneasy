import {
  dbGetAllProgress,
  dbSet,
  dbDelete,
  dbClear,
} from "@/lib/db";

export type ProgressMap = Record<string, boolean>;

const PROGRESS_STORE = "progress";

let _cache: ProgressMap = {};
let _initialized = false;

export function progressKey(moduleId: string, submoduleId: string): string {
  return `${moduleId}:${submoduleId}`;
}

/** Load progress from IDB into memory. Call once on mount. Idempotent. */
export async function initProgress(): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  try {
    _cache = await dbGetAllProgress();
  } catch {
    _cache = {};
  }
}

/** Sync read from in-memory cache. Call after initProgress() has resolved. */
export function getProgress(): ProgressMap {
  return _cache;
}

export function setSubmoduleDone(
  moduleId: string,
  submoduleId: string,
  done: boolean,
): ProgressMap {
  const k = progressKey(moduleId, submoduleId);
  if (done) {
    _cache[k] = true;
    dbSet(PROGRESS_STORE, k, true).catch(() => {});
  } else {
    delete _cache[k];
    dbDelete(PROGRESS_STORE, k).catch(() => {});
  }
  return { ..._cache };
}

export async function clearProgress(): Promise<void> {
  _cache = {};
  await dbClear(PROGRESS_STORE);
}
