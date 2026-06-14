import AsyncStorage from '@react-native-async-storage/async-storage';

let storageInstance: any;

try {
  // Try loading react-native-mmkv dynamically to avoid crash if native JSI bindings are missing (e.g. in Expo Go)
  const { MMKV } = require('react-native-mmkv');
  const mmkvInstance = new MMKV({
    id: 'safedrive-storage',
  });

  storageInstance = {
    isMMKV: true,
    isLoaded: () => true,
    onLoad: (callback: () => void) => {
      callback();
      return () => {};
    },
    set: (key: string, value: any) => {
      mmkvInstance.set(key, value);
      return true;
    },
    getString: (key: string) => {
      return mmkvInstance.getString(key);
    },
    getNumber: (key: string) => {
      return mmkvInstance.getNumber(key);
    },
    getBoolean: (key: string) => {
      return mmkvInstance.getBoolean(key);
    },
    delete: (key: string) => {
      mmkvInstance.delete(key);
      return true;
    },
    clearAll: () => {
      mmkvInstance.clearAll();
      return true;
    }
  };
} catch (error) {
  console.warn('[SafeDrive] MMKV native JSI module not found (likely running on Expo Go). Falling back to AsyncStorage-backed sync memory store.');
  
  const memStore: Record<string, string> = {};
  let isLoaded = false;
  const loadListeners = new Set<() => void>();
  
  // Prefetch keys from AsyncStorage on startup
  const initKeys = ['user_settings', 'safedrive_history_drives', 'has_completed_onboarding'];
  AsyncStorage.multiGet(initKeys)
    .then((result) => {
      result.forEach(([key, val]) => {
        if (val !== null) {
          memStore[key] = val;
        }
      });
      isLoaded = true;
      console.log('[SafeDrive] AsyncStorage cache initialized successfully.');
      loadListeners.forEach(listener => {
        try {
          listener();
        } catch (err) {
          console.error('[SafeDrive] Error in storage onLoad callback', err);
        }
      });
    })
    .catch((err) => {
      console.error('[SafeDrive] Failed to prefetch keys from AsyncStorage', err);
    });

  storageInstance = {
    isMMKV: false,
    isLoaded: () => isLoaded,
    onLoad: (callback: () => void) => {
      if (isLoaded) {
        callback();
        return () => {};
      }
      loadListeners.add(callback);
      return () => {
        loadListeners.delete(callback);
      };
    },
    set: (key: string, value: any) => {
      const stringValue = String(value);
      memStore[key] = stringValue;
      AsyncStorage.setItem(key, stringValue).catch(err => {
        console.error(`[SafeDrive] Failed to save key "${key}" to AsyncStorage`, err);
      });
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
      AsyncStorage.removeItem(key).catch(err => {
        console.error(`[SafeDrive] Failed to delete key "${key}" from AsyncStorage`, err);
      });
      return true;
    },
    clearAll: () => {
      Object.keys(memStore).forEach(key => delete memStore[key]);
      AsyncStorage.multiRemove(initKeys).catch(err => {
        console.error('[SafeDrive] Failed to clear keys from AsyncStorage', err);
      });
      return true;
    }
  };
}

export const storage = storageInstance;
