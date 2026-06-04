export interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface DeviceMotionData {
  acceleration: SensorData | null;
  accelerationIncludingGravity: SensorData | null;
  rotation: {
    alpha: number;
    beta: number;
    gamma: number;
  } | null;
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  } | null;
  orientation: number;
  timestamp: number;
}

export interface SensorState {
  isTracking: boolean;
  accelerometerData: SensorData | null;
  gyroscopeData: SensorData | null;
  magnetometerData: SensorData | null;
  deviceMotionData: DeviceMotionData | null;
  updateInterval: number; // in milliseconds
  setTracking: (isTracking: boolean) => void;
  setAccelerometerData: (data: SensorData) => void;
  setGyroscopeData: (data: SensorData) => void;
  setMagnetometerData: (data: SensorData) => void;
  setDeviceMotionData: (data: DeviceMotionData) => void;
  setUpdateInterval: (interval: number) => void;
}
