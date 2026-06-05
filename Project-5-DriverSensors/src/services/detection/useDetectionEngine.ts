import { useEffect, useRef } from 'react';
import { useSensorStore } from '../../store/sensorStore';
import { useDriveStore } from '../../store/driveStore';
import { THRESHOLDS } from '../../constants/thresholds';
import { PENALTIES } from '../../constants/penalties';
import { lowPassFilter } from '../../utils/filters';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const useDetectionEngine = () => {
  const isTracking = useDriveStore((state) => state.currentSession !== null);
  
  const accelerometerData = useSensorStore((state) => state.accelerometerData);
  const gyroscopeData = useSensorStore((state) => state.gyroscopeData);
  
  const addEvent = useDriveStore((state) => state.addEvent);
  const updateScore = useDriveStore((state) => state.updateScore);

  // State refs for filtering
  const prevAccelY = useRef(0);
  const prevGyroZ = useRef(0);

  // Cooldown refs to prevent spamming events
  const lastBrakeTime = useRef(0);
  const lastAccelTime = useRef(0);
  const lastTurnTime = useRef(0);
  const COOLDOWN_MS = 3000; // 3 seconds cooldown per event type

  // 1. Detect Harsh Braking and Acceleration
  useEffect(() => {
    if (!isTracking || !accelerometerData) return;
    
    // Apply low pass filter to smooth out bumps
    const filteredY = lowPassFilter(accelerometerData.y, prevAccelY.current, 0.2);
    prevAccelY.current = filteredY;

    const now = Date.now();

    // Harsh Brake Detection (negative Y acceleration usually implies braking depending on device orientation)
    // Assuming device is mounted vertically facing the driver.
    if (filteredY < THRESHOLDS.HARSH_BRAKE_G) {
      if (now - lastBrakeTime.current > COOLDOWN_MS) {
        addEvent({
          id: uuidv4(),
          type: 'HARSH_BRAKE',
          timestamp: now,
          severity: filteredY < THRESHOLDS.HARSH_BRAKE_G * 1.5 ? 'HIGH' : 'MEDIUM',
          confidence: 90,
        });
        updateScore(PENALTIES.HARSH_BRAKE);
        lastBrakeTime.current = now;
      }
    }

    // Harsh Acceleration Detection
    if (filteredY > THRESHOLDS.HARSH_ACCELERATION_G) {
      if (now - lastAccelTime.current > COOLDOWN_MS) {
        addEvent({
          id: uuidv4(),
          type: 'HARSH_ACCELERATION',
          timestamp: now,
          severity: filteredY > THRESHOLDS.HARSH_ACCELERATION_G * 1.5 ? 'HIGH' : 'MEDIUM',
          confidence: 90,
        });
        updateScore(PENALTIES.HARSH_ACCELERATION);
        lastAccelTime.current = now;
      }
    }
  }, [accelerometerData, isTracking]);

  // 2. Detect Sharp Turns
  useEffect(() => {
    if (!isTracking || !gyroscopeData) return;

    const filteredZ = lowPassFilter(gyroscopeData.z, prevGyroZ.current, 0.2);
    prevGyroZ.current = filteredZ;

    const now = Date.now();

    if (Math.abs(filteredZ) > THRESHOLDS.SHARP_TURN_RAD) {
      if (now - lastTurnTime.current > COOLDOWN_MS) {
        addEvent({
          id: uuidv4(),
          type: 'SHARP_TURN',
          timestamp: now,
          severity: Math.abs(filteredZ) > THRESHOLDS.SHARP_TURN_RAD * 1.5 ? 'HIGH' : 'MEDIUM',
          confidence: 85,
        });
        updateScore(PENALTIES.SHARP_TURN);
        lastTurnTime.current = now;
      }
    }
  }, [gyroscopeData, isTracking]);

  // Note: Phone Usage and Excessive Movement can be added here using deviceMotionData
};
