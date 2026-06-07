import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useDriveStore } from '../store/driveStore';
import { useSettingsStore } from '../store/settingsStore';
import { calculateDistance } from '../utils/calculations';
import { THRESHOLDS } from '../constants/thresholds';
import { PENALTIES } from '../constants/penalties';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const useLocation = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  
  const isTracking = useDriveStore((state) => state.currentSession !== null);
  const updateDistance = useDriveStore((state) => state.updateDistance);
  const addEvent = useDriveStore((state) => state.addEvent);
  const addLocationPoint = useDriveStore((state) => state.addLocationPoint);
  const updateScore = useDriveStore((state) => state.updateScore);

  const previousLocation = useRef<Location.LocationObjectCoords | null>(null);
  const lastOverspeedTime = useRef<number>(0);
  const OVERSPEED_COOLDOWN_MS = 10000; // 10 seconds cooldown

  // Load speeding tolerance dynamically from settings
  const speedingToleranceKmH = useSettingsStore((state) => state.speeding);
  const overspeedingThresholdMs = THRESHOLDS.OVERSPEEDING_MS + (speedingToleranceKmH / 3.6);

  useEffect(() => {
    let sub: Location.LocationSubscription;

    const startTrackingLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get initial position immediately to populate the start point
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (initialLocation) {
          const coords = initialLocation.coords;
          const speedMs = coords.speed !== null && coords.speed >= 0 ? coords.speed : 0;
          addLocationPoint({
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp: Date.now(),
            speed: speedMs,
          });
          previousLocation.current = coords;
        }
      } catch (err) {
        console.warn("Could not get initial position immediately: ", err);
      }

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1, // update every 1 meter
        },
        (location) => {
          const coords = location.coords;
          
          // Calculate speed (using provided speed or manually if not available)
          const speedMs = coords.speed !== null && coords.speed >= 0 ? coords.speed : 0;
          setCurrentSpeed(speedMs);

          // Overspeeding Detection
          const now = Date.now();
          if (speedMs > overspeedingThresholdMs) {
            if (now - lastOverspeedTime.current > OVERSPEED_COOLDOWN_MS) {
              addEvent({
                id: generateId(),
                type: 'OVERSPEEDING',
                timestamp: now,
                severity: speedMs > overspeedingThresholdMs * 1.2 ? 'HIGH' : 'MEDIUM',
                confidence: 95,
                location: {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                },
                speed: Math.round(speedMs * 3.6),
              });

              updateScore(PENALTIES.OVERSPEEDING);
              lastOverspeedTime.current = now;
            }
          }

          // Distance Tracking
          if (previousLocation.current) {
            const distanceDelta = calculateDistance(
              previousLocation.current.latitude,
              previousLocation.current.longitude,
              coords.latitude,
              coords.longitude
            );
            
            // Avoid erratic GPS jumps adding to distance unnecessarily
            if (distanceDelta > 0 && distanceDelta < 100) { 
              updateDistance(distanceDelta);
            }
          }

          // Save point for route replay
          addLocationPoint({
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp: now,
            speed: speedMs,
          });

          previousLocation.current = coords;
        }
      );
      setSubscription(sub);
    };

    if (isTracking) {
      startTrackingLocation();
    } else {
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
      previousLocation.current = null;
      setCurrentSpeed(0);
    }

    return () => {
      if (sub) {
        sub.remove();
      }
    };
  }, [isTracking]);

  return { currentSpeed, errorMsg };
};
