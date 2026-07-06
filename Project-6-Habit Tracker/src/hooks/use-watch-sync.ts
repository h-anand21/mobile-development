import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Safe dynamic import to prevent Expo Go from crashing on native BLE module
let BleManagerClass: any = null;
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const BLE = require('react-native-ble-plx');
    BleManagerClass = BLE.BleManager;
  } catch (e) {
    console.warn('[BLE] Failed to load react-native-ble-plx. Falling back to simulator.', e);
  }
}

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected';

export interface PairedWatch {
  name: string;
  battery: number;
  lastSync: string;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  rssi: number;
}

// Global store to synchronize state across components using the hook
interface WatchSyncState {
  status: ConnectionStatus;
  paired: PairedWatch | null;
  devices: DiscoveredDevice[];
  heartRate: number;
}

let globalState: WatchSyncState = {
  status: 'disconnected',
  paired: null,
  devices: [],
  heartRate: 72,
};

const listeners = new Set<() => void>();
const updateListeners = () => listeners.forEach(l => l());

// Simulating Bluetooth scanning nearby watch list
const MOCK_BLE_DEVICES: DiscoveredDevice[] = [
  { id: '1', name: 'Garmin Fenix 7', rssi: -58 },
  { id: '2', name: 'Apple Watch S9', rssi: -62 },
  { id: '3', name: 'Fitbit Charge 6', rssi: -70 },
  { id: '4', name: 'Galaxy Watch 6', rssi: -75 },
];

export function useWatchSync() {
  const [status, setStatus] = useState<ConnectionStatus>(globalState.status);
  const [pairedDevice, setPairedDevice] = useState<PairedWatch | null>(globalState.paired);
  const [bleDevices, setBleDevices] = useState<DiscoveredDevice[]>(globalState.devices);
  const [heartRate, setHeartRate] = useState<number>(globalState.heartRate);

  const managerRef = useRef<any>(null);
  const scanTimeoutRef = useRef<any>(null);
  const hrIntervalRef = useRef<any>(null);

  // Sync with global state
  useEffect(() => {
    const handler = () => {
      setStatus(globalState.status);
      setPairedDevice(globalState.paired);
      setBleDevices(globalState.devices);
      setHeartRate(globalState.heartRate);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // Initialize and load saved paired device
  useEffect(() => {
    async function loadPairedDevice() {
      try {
        const saved = await AsyncStorage.getItem('PAIRED_WATCH_INFO');
        if (saved) {
          const parsed = JSON.parse(saved);
          globalState.paired = parsed;
          globalState.status = 'connected';
          updateListeners();
        }
      } catch (e) {
        console.error('[BLE] Failed to load paired watch info:', e);
      }
    }
    
    if (!globalState.paired && globalState.status === 'disconnected') {
      loadPairedDevice();
    }
  }, []);

  // Heart rate fluctuation simulator when connected
  useEffect(() => {
    if (status === 'connected') {
      hrIntervalRef.current = setInterval(() => {
        // Fetch if workout is running from AsyncStorage to change BPM
        AsyncStorage.getItem('ACTIVE_WORKOUT_STATE').then(val => {
          const isWorkout = val !== null;
          globalState.heartRate = Math.floor(
            isWorkout
              ? 110 + Math.random() * 25 // 110-135 BPM during workout
              : 65 + Math.random() * 10  // 65-75 BPM resting
          );
          updateListeners();
        });
      }, 2000);
    } else {
      globalState.heartRate = 0;
      updateListeners();
    }

    return () => {
      if (hrIntervalRef.current) clearInterval(hrIntervalRef.current);
    };
  }, [status]);

  // Request BLE permissions
  const requestPermissions = async (): Promise<boolean> => {
    // In simulation mode or iOS simulator, return true
    if (isExpoGo) return true;

    if (Platform.OS === 'android') {
      // Basic check
      return true;
    }
    return true;
  };

  // Stop BLE Scan
  const stopScan = useCallback(() => {
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    
    if (globalState.status === 'scanning') {
      globalState.status = 'disconnected';
      updateListeners();
    }

    if (managerRef.current && !isExpoGo) {
      try {
        managerRef.current.stopDeviceScan();
      } catch (e) {}
    }
  }, []);

  // Start BLE Scan
  const startScan = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) {
      Alert.alert('Permission Denied', 'Bluetooth permissions are required to scan.');
      return;
    }

    globalState.status = 'scanning';
    globalState.devices = [];
    updateListeners();

    if (isExpoGo || !BleManagerClass) {
      // Simulation mode
      let foundIndex = 0;
      const interval = setInterval(() => {
        if (foundIndex < MOCK_BLE_DEVICES.length) {
          globalState.devices = [...globalState.devices, MOCK_BLE_DEVICES[foundIndex]];
          updateListeners();
          foundIndex++;
        } else {
          clearInterval(interval);
        }
      }, 1000);

      scanTimeoutRef.current = setTimeout(() => {
        clearInterval(interval);
        if (globalState.status === 'scanning') {
          globalState.status = 'disconnected';
          updateListeners();
        }
      }, 6000);
    } else {
      // Real BLE Scanning
      try {
        if (!managerRef.current) {
          managerRef.current = new BleManagerClass();
        }
        managerRef.current.startDeviceScan(null, null, (error: any, device: any) => {
          if (error) {
            console.error('[BLE] Scan error:', error);
            globalState.status = 'disconnected';
            updateListeners();
            return;
          }
          if (device && device.name) {
            const exists = globalState.devices.some(d => d.id === device.id);
            if (!exists) {
              const newDev: DiscoveredDevice = {
                id: device.id,
                name: device.name,
                rssi: device.rssi || -100,
              };
              globalState.devices = [...globalState.devices, newDev];
              updateListeners();
            }
          }
        });

        scanTimeoutRef.current = setTimeout(() => {
          stopScan();
        }, 10000);
      } catch (err) {
        console.error('[BLE] Scanner crash:', err);
        globalState.status = 'disconnected';
        updateListeners();
      }
    }
  }, [stopScan]);

  // Connect to discovered device
  const connectDevice = useCallback(async (id: string, name: string) => {
    stopScan();
    globalState.status = 'connecting';
    updateListeners();

    // Connection delay simulation
    setTimeout(async () => {
      const now = new Date();
      const lastSync = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const watchInfo: PairedWatch = {
        name,
        battery: Math.floor(70 + Math.random() * 25), // simulated battery percentage
        lastSync,
      };

      globalState.paired = watchInfo;
      globalState.status = 'connected';
      updateListeners();

      await AsyncStorage.setItem('PAIRED_WATCH_INFO', JSON.stringify(watchInfo));
    }, 1500);
  }, [stopScan]);

  // Connect to custom typed device name (Universal connection support)
  const connectCustomDevice = useCallback(async (name: string) => {
    const trimmed = name.trim() || 'Smart Watch';
    stopScan();
    globalState.status = 'connecting';
    updateListeners();

    setTimeout(async () => {
      const now = new Date();
      const lastSync = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const watchInfo: PairedWatch = {
        name: trimmed,
        battery: 100,
        lastSync,
      };

      globalState.paired = watchInfo;
      globalState.status = 'connected';
      updateListeners();

      await AsyncStorage.setItem('PAIRED_WATCH_INFO', JSON.stringify(watchInfo));
    }, 1500);
  }, [stopScan]);

  // Disconnect device
  const disconnectDevice = useCallback(async () => {
    globalState.paired = null;
    globalState.status = 'disconnected';
    globalState.heartRate = 0;
    updateListeners();

    await AsyncStorage.removeItem('PAIRED_WATCH_INFO');
  }, []);

  return {
    status,
    pairedDevice,
    bleDevices,
    heartRate,
    startScan,
    stopScan,
    connectDevice,
    connectCustomDevice,
    disconnectDevice,
  };
}
