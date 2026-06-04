import { create } from 'zustand';
import { SensorState } from '../types/sensor';

export const useSensorStore = create<SensorState>((set) => ({
  isTracking: false,
  accelerometerData: null,
  gyroscopeData: null,
  magnetometerData: null,
  deviceMotionData: null,
  updateInterval: 500, // 500ms default update interval

  setTracking: (isTracking) => set({ isTracking }),
  setAccelerometerData: (data) => set({ accelerometerData: data }),
  setGyroscopeData: (data) => set({ gyroscopeData: data }),
  setMagnetometerData: (data) => set({ magnetometerData: data }),
  setDeviceMotionData: (data) => set({ deviceMotionData: data }),
  setUpdateInterval: (interval) => set({ updateInterval: interval }),
}));
