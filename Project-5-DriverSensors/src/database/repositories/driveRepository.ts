import { storage } from '../storage';
import { DriveSession } from '../../store/driveStore';

const DRIVES_STORAGE_KEY = 'safedrive_history_drives';
const MAX_HISTORY_DRIVES = 100;

export const driveRepository = {
  /**
   * Save a newly completed drive session to history.
   */
  saveDrive: (session: DriveSession) => {
    try {
      const existingDrivesJson = storage.getString(DRIVES_STORAGE_KEY);
      let drives: DriveSession[] = existingDrivesJson ? JSON.parse(existingDrivesJson) : [];

      // Add new drive to the beginning
      drives.unshift(session);

      // Keep only the last N drives to prevent storage bloat
      if (drives.length > MAX_HISTORY_DRIVES) {
        drives = drives.slice(0, MAX_HISTORY_DRIVES);
      }

      storage.set(DRIVES_STORAGE_KEY, JSON.stringify(drives));
      return true;
    } catch (error) {
      console.error('Failed to save drive to history', error);
      return false;
    }
  },

  /**
   * Retrieve all saved drive sessions from history.
   */
  getAllDrives: (): DriveSession[] => {
    try {
      const drivesJson = storage.getString(DRIVES_STORAGE_KEY);
      return drivesJson ? JSON.parse(drivesJson) : [];
    } catch (error) {
      console.error('Failed to load drive history', error);
      return [];
    }
  },

  /**
   * Clear all drive history.
   */
  clearHistory: () => {
    storage.delete(DRIVES_STORAGE_KEY);
  }
};
