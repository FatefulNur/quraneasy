const DB_NAME = "quraneasy";
const DB_VERSION = 1;
const PROGRESS_STORE = "progress";
const SETTINGS_STORE = "settings";

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE);
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    };

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

function tx(
  db: IDBDatabase,
  store: string,
  mode: IDBTransactionMode,
): IDBObjectStore {
  return db.transaction(store, mode).objectStore(store);
}

export async function dbGetAllProgress(): Promise<Record<string, boolean>> {
  if (typeof indexedDB === "undefined") return {};
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const result: Record<string, boolean> = {};
    const req = tx(db, PROGRESS_STORE, "readonly").openCursor();
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor) {
        result[cursor.key as string] = cursor.value as boolean;
        cursor.continue();
      } else {
        resolve(result);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function dbSet(
  store: string,
  key: string,
  value: unknown,
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readwrite").put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(store: string, key: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readwrite").delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClear(store: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, store, "readwrite").clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetSetting(key: string): Promise<string | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, SETTINGS_STORE, "readonly").get(key);
    req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function dbSetSetting(key: string, value: string): Promise<void> {
  return dbSet(SETTINGS_STORE, key, value);
}
