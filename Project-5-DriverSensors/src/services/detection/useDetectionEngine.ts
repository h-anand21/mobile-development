import { useEffect, useRef } from 'react';
import { useSensorStore } from '../../store/sensorStore';
import { useDriveStore } from '../../store/driveStore';
import { useSettingsStore } from '../../store/settingsStore';
import { PENALTIES } from '../../constants/penalties';
import { lowPassFilter } from '../../utils/filters';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const useDetectionEngine = () => {
  const isTracking = useDriveStore((state) => state.currentSession !== null);
  
  const accelerometerData = useSensorStore((state) => state.accelerometerData);
  const gyroscopeData = useSensorStore((state) => state.gyroscopeData);
  const deviceMotionData = useSensorStore((state) => state.deviceMotionData);
  
  const addEvent = useDriveStore((state) => state.addEvent);
  const updateScore = useDriveStore((state) => state.updateScore);

  // Settings for threshold logic
  const settings = useSettingsStore();
  const harshBrakeG = settings.harshBraking / 9.8; // Convert m/s^2 to G-force
  const harshAccelG = Math.abs(settings.harshBraking) / 9.8; // Proportional acceleration G-force
  const sharpTurnRad = (settings.sharpTurn * 2.0) / 35; // Proportional degrees to rad/s
  const phoneUsageRotation = 1.5 * (settings.phoneUsage / 5); // Proportional phone usage rotation

  // Speed calculation from route
  const currentSession = useDriveStore((state) => state.currentSession);
  const route = currentSession?.route || [];
  const currentSpeedMs = route.length > 0 ? route[route.length - 1].speed : 0;
  const currentSpeedKmH = Math.round(currentSpeedMs * 3.6);

  // State refs for filtering
  const prevAccelY = useRef(0);
  const prevAccelX = useRef(0);
  const prevGyroZ = useRef(0);
  const prevGyroX = useRef(0);
  const prevGyroY = useRef(0);

  // Cooldown refs to prevent spamming events
  const lastBrakeTime = useRef(0);
  const lastAccelTime = useRef(0);
  const lastTurnTime = useRef(0);
  const lastPhoneUsageTime = useRef(0);
  const lastSteeringTime = useRef(0);
  const COOLDOWN_MS = 4000; // 4 seconds cooldown per event type

  // 1. Detect Harsh Braking and Acceleration (Y-axis accelerometer changes)
  useEffect(() => {
    if (!isTracking || !accelerometerData) return;
    
    // Apply low pass filter to smooth out bumps
    const filteredY = lowPassFilter(accelerometerData.y, prevAccelY.current, 0.2);
    prevAccelY.current = filteredY;

    const now = Date.now();

    // Harsh Brake Detection (negative Y acceleration usually implies braking depending on device orientation)
    if (filteredY < harshBrakeG) {
      if (now - lastBrakeTime.current > COOLDOWN_MS) {
        addEvent({
          id: generateId(),
          type: 'HARSH_BRAKE',
          timestamp: now,
          severity: filteredY < harshBrakeG * 1.5 ? 'HIGH' : 'MEDIUM',
          confidence: 90,
          speed: currentSpeedKmH || Math.round(55 + Math.random() * 15), // fallback to mock speed if stationary
        });
        updateScore(PENALTIES.HARSH_BRAKE);
        lastBrakeTime.current = now;
      }
    }

    // Harsh Acceleration Detection
    if (filteredY > harshAccelG) {
      if (now - lastAccelTime.current > COOLDOWN_MS) {
        addEvent({
          id: generateId(),
          type: 'HARSH_ACCELERATION',
          timestamp: now,
          severity: filteredY > harshAccelG * 1.5 ? 'HIGH' : 'MEDIUM',
          confidence: 90,
          speed: currentSpeedKmH || Math.round(45 + Math.random() * 15),
        });
        updateScore(PENALTIES.HARSH_ACCELERATION);
        lastAccelTime.current = now;
      }
    }
  }, [accelerometerData, isTracking, harshBrakeG, harshAccelG]);

  // 2. Detect Sharp Turns (Z-axis gyroscope changes)
  useEffect(() => {
    if (!isTracking || !gyroscopeData) return;

    const filteredZ = lowPassFilter(gyroscopeData.z, prevGyroZ.current, 0.2);
    prevGyroZ.current = filteredZ;

    const now = Date.now();

    if (Math.abs(filteredZ) > sharpTurnRad) {
      if (now - lastTurnTime.current > COOLDOWN_MS) {
        addEvent({
          id: generateId(),
          type: 'SHARP_TURN',
          timestamp: now,
          severity: Math.abs(filteredZ) > sharpTurnRad * 1.5 ? 'HIGH' : 'MEDIUM',
          confidence: 85,
          speed: currentSpeedKmH || Math.round(35 + Math.random() * 10),
        });
        updateScore(PENALTIES.SHARP_TURN);
        lastTurnTime.current = now;
      }
    }
  }, [gyroscopeData, isTracking, sharpTurnRad]);

  // 3. Detect Phone Usage and Aggressive Steering
  useEffect(() => {
    if (!isTracking) return;
    const now = Date.now();

    // Phone Usage Detection via Gyroscope X/Y rotation (picking up phone) or DeviceMotion
    if (gyroscopeData) {
      const filteredX = lowPassFilter(gyroscopeData.x, prevGyroX.current, 0.2);
      const filteredY = lowPassFilter(gyroscopeData.y, prevGyroY.current, 0.2);
      prevGyroX.current = filteredX;
      prevGyroY.current = filteredY;

      const rotMagnitude = Math.sqrt(filteredX * filteredX + filteredY * filteredY);
      
      // If rotation rate on X/Y axes exceeds phoneUsageRotation, register phone pickup
      if (rotMagnitude > phoneUsageRotation) {
        if (now - lastPhoneUsageTime.current > COOLDOWN_MS * 1.5) {
          addEvent({
            id: generateId(),
            type: 'PHONE_USAGE',
            timestamp: now,
            severity: rotMagnitude > THRESHOLDS.PHONE_USAGE_ROTATION * 1.6 ? 'HIGH' : 'MEDIUM',
            confidence: 88,
            duration: Math.round(5 + Math.random() * 8), // mock phone usage duration in seconds
            speed: currentSpeedKmH || Math.round(50 + Math.random() * 10),
          });
          updateScore(PENALTIES.PHONE_USAGE);
          lastPhoneUsageTime.current = now;
        }
      }
    }

    // Aggressive Steering Detection via Accelerometer X-axis (lateral forces)
    if (accelerometerData) {
      const filteredX = lowPassFilter(accelerometerData.x, prevAccelX.current, 0.2);
      prevAccelX.current = filteredX;

      // Jerk/Aggressive weaving: lateral acceleration exceeding 0.35 Gs, but not a full sustained turn
      if (Math.abs(filteredX) > 0.35) {
        if (now - lastSteeringTime.current > COOLDOWN_MS) {
          addEvent({
            id: generateId(),
            type: 'AGGRESSIVE_STEERING',
            timestamp: now,
            severity: Math.abs(filteredX) > 0.55 ? 'HIGH' : 'MEDIUM',
            confidence: 80,
            speed: currentSpeedKmH || Math.round(45 + Math.random() * 15),
          });
          updateScore(PENALTIES.AGGRESSIVE_STEERING);
          lastSteeringTime.current = now;
        }
      }
    }
  }, [gyroscopeData, accelerometerData, deviceMotionData, isTracking]);
};
