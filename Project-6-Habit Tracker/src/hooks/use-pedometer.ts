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
    let subscription: any = null;
    let Pedometer: any = null;

    const setup = async () => {
      try {
        // Dynamically import to avoid crashing if expo-sensors not present
        const sensors = await import('expo-sensors');
        Pedometer = sensors.Pedometer;

        const isAvailable = await Pedometer.isAvailableAsync();
        setAvailable(isAvailable);

        if (!isAvailable) {
          setLoading(false);
          return;
        }

        // Get steps from start of today
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        try {
          const result = await Pedometer.getStepCountAsync(startOfDay, now);
          if (result?.steps != null) {
            setSteps(result.steps);
          }
        } catch (_) {
          // Some devices don't support historical query — fall back to live only
        }

        // Subscribe to live updates
        subscription = Pedometer.watchStepCount((result: { steps: number }) => {
          // Check for day rollover
          const currentKey = todayKey();
          if (currentKey !== dayKeyRef.current) {
            dayKeyRef.current = currentKey;
            setSteps(result.steps);
          } else {
            setSteps((prev) => {
              // watchStepCount gives delta steps — add to current
              return prev + result.steps;
            });
          }
        });

        setLoading(false);
      } catch (err) {
        // expo-sensors not available or permission denied
        setAvailable(false);
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (subscription) {
        subscription.remove();
      }
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
