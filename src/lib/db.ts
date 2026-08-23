import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'devops-deck'
const DB_VERSION = 1
const STORE_PROGRESS = 'progress'
const STORE_SETTINGS = 'settings'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
          db.createObjectStore(STORE_PROGRESS)
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS)
        }
      }
    })
  }
  return dbPromise
}

export async function loadKnown(): Promise<Set<string>> {
  try {
    const db = await getDB()
    const ids = (await db.get(STORE_PROGRESS, 'known')) as string[] | undefined
    return new Set(ids ?? [])
  } catch {
    return new Set()
  }
}

export async function saveKnown(known: Set<string>): Promise<void> {
  try {
    const db = await getDB()
    await db.put(STORE_PROGRESS, [...known], 'known')
  } catch {
    /* прогресс не критичен для работы приложения */
  }
}

export type Settings = {
  apiKey: string
  model: string
}

export const DEFAULT_MODEL = 'claude-sonnet-4-5'

export async function loadSettings(): Promise<Settings> {
  try {
    const db = await getDB()
    const stored = (await db.get(STORE_SETTINGS, 'ai')) as Partial<Settings> | undefined
    return { apiKey: stored?.apiKey ?? '', model: stored?.model || DEFAULT_MODEL }
  } catch {
    return { apiKey: '', model: DEFAULT_MODEL }
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB()
  await db.put(STORE_SETTINGS, settings, 'ai')
}
