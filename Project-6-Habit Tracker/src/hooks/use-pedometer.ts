import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export interface PedometerData {
  steps: number;
  calories: number;
  distanceKm: number;
  goalSteps: number;
  progressPercent: number;
  available: boolean;
  loading: boolean;
}

const GOAL_STEPS = 7000;
const KCAL_PER_STEP = 0.04;
const METERS_PER_STEP = 0.762;

// Simple date key to detect day rollover
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function usePedometer(): PedometerData {
  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const dayKeyRef = useRef(todayKey());

  useEffect(() => {
    let pedometerSubscription: any = null;
    let accelerometerSubscription: any = null;
    let Pedometer: any = null;
    let Accelerometer: any = null;

    const setup = async () => {
      try {
        const sensors = await import('expo-sensors');
        Pedometer = sensors.Pedometer;
        Accelerometer = sensors.Accelerometer;

        // 1. Request Pedometer permissions first so Android lists it & shows prompt
        let pedometerGranted = false;
        try {
          const perm = await Pedometer.requestPermissionsAsync();
          pedometerGranted = perm.granted;
        } catch (_) {}

        // 2. Check if Pedometer is available
        const isPedometerAvailable = await Pedometer.isAvailableAsync();

        if (isPedometerAvailable && pedometerGranted) {
          setAvailable(true);

          // Get steps from start of today
          const now = new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

          try {
            const result = await Pedometer.getStepCountAsync(startOfDay, now);
            if (result?.steps != null) {
              setSteps(result.steps);
            }
          } catch (_) {}

          // Subscribe to live pedometer updates
          pedometerSubscription = Pedometer.watchStepCount((result: { steps: number }) => {
            const currentKey = todayKey();
            if (currentKey !== dayKeyRef.current) {
              dayKeyRef.current = currentKey;
              setSteps(result.steps);
            } else {
              setSteps((prev) => prev + result.steps);
            }
          });

          setLoading(false);
          return;
        }

        // 3. Fallback: If Pedometer is not available or permission denied, try Accelerometer!
        const isAccAvailable = await Accelerometer.isAvailableAsync();
        if (isAccAvailable) {
          setAvailable(true);

          let lastStepTime = 0;
          
          // Set update interval (default is 100ms)
          Accelerometer.setUpdateInterval(100);

          accelerometerSubscription = Accelerometer.addListener((data: { x: number; y: number; z: number }) => {
            const { x, y, z } = data;
            // Calculate magnitude of acceleration vector (in Gs)
            const magnitude = Math.sqrt(x*x + y*y + z*z);
            const now = Date.now();

            // When magnitude goes above 1.28 Gs, it indicates a step (foot strike)
            // Minimum time between steps is 350ms to filter noise
            if (magnitude > 1.28 && (now - lastStepTime > 350)) {
              lastStepTime = now;
              setSteps((prev) => {
                const currentKey = todayKey();
                if (currentKey !== dayKeyRef.current) {
                  dayKeyRef.current = currentKey;
                  return 1;
                }
                return prev + 1;
              });
            }
          });

          setLoading(false);
          return;
        }

        // If no sensors are available (e.g. simulator)
        setAvailable(false);
        setLoading(false);
      } catch (err) {
        setAvailable(false);
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (pedometerSubscription) pedometerSubscription.remove();
      if (accelerometerSubscription) accelerometerSubscription.remove();
    };
  }, []);

  const calories = Math.round(steps * KCAL_PER_STEP);
  const distanceKm = Math.round((steps * METERS_PER_STEP) / 10) / 100;
  const progressPercent = Math.min(100, Math.round((steps / GOAL_STEPS) * 100));

  return {
    steps,
    calories,
    distanceKm,
    goalSteps: GOAL_STEPS,
    progressPercent,
    available,
    loading,
  };
}
