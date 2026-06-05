import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'safedrive-storage',
  encryptionKey: 'safedrive-secure-key-optional' // For production, use secure random key
});
