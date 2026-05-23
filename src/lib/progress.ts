import {
  dbGetAllProgress,
  dbSet,
  dbDelete,
  dbClear,
} from "@/lib/db";

export type ProgressMap = Record<string, boolean>;

const PROGRESS_STORE = "progress";
const LS_LEGACY_KEY = "qe:progress";   // v1/v2 localStorage key — migrated then removed
const LS_SCHEMA_KEY = "qe:progress:schema";

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
    // Migrate any existing localStorage data → IDB then remove
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(LS_LEGACY_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          if (parsed && typeof parsed === "object") {
            // Write all entries to IDB
            await Promise.all(
              Object.entries(parsed)
                .filter(([, v]) => v === true)
                .map(([k]) => dbSet(PROGRESS_STORE, k, true)),
            );
          }
        } catch {
          // ignore malformed data
        }
        localStorage.removeItem(LS_LEGACY_KEY);
        localStorage.removeItem(LS_SCHEMA_KEY);
      }
    }

    // Load all IDB entries into cache
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
