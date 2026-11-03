// Test-only stand-in for the optional peer `dexie` (see vite.config.ts); only the constructor chain is exercised.
export default class Dexie {
  version(): { stores: () => void } {
    return { stores: () => undefined }
  }
}
