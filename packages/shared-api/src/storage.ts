const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const SecureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    } else {
      try {
        const SecureStore = require('expo-secure-store');
        return await SecureStore.getItemAsync(key);
      } catch (e) { return null; }
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      try { localStorage.setItem(key, value); } catch (e) {}
    } else {
      try {
        const SecureStore = require('expo-secure-store');
        await SecureStore.setItemAsync(key, value);
      } catch (e) {}
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      try { localStorage.removeItem(key); } catch (e) {}
    } else {
      try {
        const SecureStore = require('expo-secure-store');
        await SecureStore.deleteItemAsync(key);
      } catch (e) {}
    }
  },
};
