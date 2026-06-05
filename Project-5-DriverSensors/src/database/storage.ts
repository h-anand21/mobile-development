let storageInstance: any;

try {
  // Try loading react-native-mmkv dynamically to avoid crash if native JSI bindings are missing (e.g. in Expo Go)
  const { MMKV } = require('react-native-mmkv');
  storageInstance = new MMKV({
    id: 'safedrive-storage',
  });
} catch (error) {
  console.warn('[SafeDrive] MMKV native JSI module not found (likely running on Expo Go). Falling back to synchronous in-memory store.');
  
  // Safe synchronous in-memory fallback store
  const memStore: Record<string, string> = {};
  
  storageInstance = {
    set: (key: string, value: any) => {
      memStore[key] = String(value);
      return true;
    },
    getString: (key: string) => {
      return memStore[key] !== undefined ? memStore[key] : undefined;
    },
    getNumber: (key: string) => {
      return memStore[key] !== undefined ? Number(memStore[key]) : undefined;
    },
    getBoolean: (key: string) => {
      return memStore[key] !== undefined ? memStore[key] === 'true' : undefined;
    },
    delete: (key: string) => {
      delete memStore[key];
      return true;
    },
    clearAll: () => {
      Object.keys(memStore).forEach(key => delete memStore[key]);
      return true;
    }
  };
}

export const storage = storageInstance;
