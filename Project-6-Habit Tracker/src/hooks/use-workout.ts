/**
 * use-workout.ts
 * Persistent live workout tracker hook.
 * - State survives tab switches (refs hold true values)
 * - Saves session data with today's date to AsyncStorage
 * - Uses Accelerometer step detection with proper sensitivity
 * - Handles Outdoor Run, Indoor Run, Brisk Walk, Outdoor Cycle
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WorkoutType = 'outdoor_run' | 'indoor_run' | 'brisk_walk' | 'outdoor_cycle';

export interface WorkoutSession {
  date: string;          // YYYY-MM-DD
  type: WorkoutType;
  durationSeconds: number;
  steps: number;
  distanceKm: number;
  calories: number;
  deviceName?: string;   // Smart Watch name if paired during workout
}

export interface WorkoutState {
  isActive: boolean;
  workoutType: WorkoutType;
  elapsedSeconds: number;
  steps: number;
  distanceKm: string;
  calories: number;
  isSensorAvailable: boolean;
  isSimulating: boolean;
  todaysSessions: WorkoutSession[];
  startWorkout: () => void;
  stopWorkout: () => void;
  setWorkoutType: (type: WorkoutType) => void;
}

const STORAGE_KEY = 'HABITFLOW_WORKOUT_SESSIONS';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calcDistance(type: WorkoutType, steps: number, elapsedSecs: number): number {
  if (type === 'outdoor_cycle') {
    // ~18 km/h average cycling speed
    return elapsedSecs * 0.005; // 18km/h = 5m/s = 0.005km/s
  }
  if (type === 'outdoor_run') {
    // stride ~0.85m
    return (steps * 0.85) / 1000;
  }
  if (type === 'indoor_run') {
    // stride ~0.78m (treadmill slightly shorter)
    return (steps * 0.78) / 1000;
  }
  // brisk_walk: stride ~0.72m
  return (steps * 0.72) / 1000;
}

function calcCalories(type: WorkoutType, steps: number, elapsedSecs: number): number {
  if (type === 'outdoor_cycle') {
    // ~40 cal/min moderate cycling
    return Math.round((elapsedSecs / 60) * 8);
  }
  if (type === 'outdoor_run') {
    return Math.round(steps * 0.065);
  }
  if (type === 'indoor_run') {
    return Math.round(steps * 0.058);
  }
  // brisk_walk
  return Math.round(steps * 0.040);
}

export function useWorkout(): WorkoutState {
  const [isActive, setIsActive] = useState(false);
  const [workoutType, _setWorkoutType] = useState<WorkoutType>('outdoor_run');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [steps, setSteps] = useState(0);
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [todaysSessions, setTodaysSessions] = useState<WorkoutSession[]>([]);

  // Use refs so that interval callbacks always see the latest values
  const stepsRef = useRef(0);
  const elapsedRef = useRef(0);
  const workoutTypeRef = useRef<WorkoutType>('outdoor_run');
  const isActiveRef = useRef(false);

  const timerRef = useRef<any>(null);
  const accelSubRef = useRef<any>(null);
  const lastStepTimeRef = useRef(0);

  // ── Load today's sessions from AsyncStorage ──────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const all: WorkoutSession[] = JSON.parse(raw);
        const today = getTodayKey();
        setTodaysSessions(all.filter(s => s.date === today));
      } catch (_) {}
    }).catch(() => {});
  }, []);

  // ── Save session to AsyncStorage ─────────────────────────────────────────
  const saveSession = useCallback(async (session: WorkoutSession) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const all: WorkoutSession[] = raw ? JSON.parse(raw) : [];
      all.push(session);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      const today = getTodayKey();
      setTodaysSessions(prev => [...prev, session].filter(s => s.date === today));
    } catch (_) {}
  }, []);

  // ── Start Accelerometer ──────────────────────────────────────────────────
  const startAccelerometer = useCallback(async () => {
    try {
      const { Accelerometer } = await import('expo-sensors');
      const available = await Accelerometer.isAvailableAsync();
      if (!available) {
        setIsSimulating(true);
        return;
      }

      setIsSensorAvailable(true);
      setIsSimulating(false);
      Accelerometer.setUpdateInterval(80); // 80ms = ~12 readings/second for better sensitivity

      accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
        if (!isActiveRef.current) return;

        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        // Step threshold: 1.25G with 300ms minimum between steps
        // More sensitive than before (was 1.28G / 350ms)
        if (magnitude > 1.25 && now - lastStepTimeRef.current > 300) {
          lastStepTimeRef.current = now;
          stepsRef.current += 1;
          setSteps(stepsRef.current);
        }
      });
    } catch (_) {
      setIsSimulating(true);
    }
  }, []);

  // ── Stop Accelerometer ───────────────────────────────────────────────────
  const stopAccelerometer = useCallback(() => {
    if (accelSubRef.current) {
      accelSubRef.current.remove();
      accelSubRef.current = null;
    }
  }, []);

  // ── Start Workout ────────────────────────────────────────────────────────
  const startWorkout = useCallback(() => {
    // Reset counters
    stepsRef.current = 0;
    elapsedRef.current = 0;
    setSteps(0);
    setElapsedSeconds(0);
    isActiveRef.current = true;
    setIsActive(true);

    // Save active state to notify BLE heart rate simulator
    AsyncStorage.setItem('ACTIVE_WORKOUT_STATE', 'active').catch(() => {});

    // Start timer
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds(elapsedRef.current);

      // If simulating (no accelerometer), add random steps
      if (isSimulating) {
        const baseRate = workoutTypeRef.current === 'brisk_walk' ? 1 :
                         workoutTypeRef.current === 'outdoor_run' ? 3 :
                         workoutTypeRef.current === 'indoor_run' ? 2 : 0;
        if (baseRate > 0) {
          const delta = Math.floor(Math.random() * baseRate) + 1;
          stepsRef.current += delta;
          setSteps(stepsRef.current);
        }
      }
    }, 1000);

    // Start accelerometer sensor
    startAccelerometer();
  }, [isSimulating, startAccelerometer]);

  // ── Stop Workout ─────────────────────────────────────────────────────────
  const stopWorkout = useCallback(async () => {
    isActiveRef.current = false;
    setIsActive(false);

    // Clear active state for BLE heart rate simulator
    AsyncStorage.removeItem('ACTIVE_WORKOUT_STATE').catch(() => {});

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop accelerometer
    stopAccelerometer();

    // Fetch watch name if connected to attach it to the session data
    let watchName = undefined;
    try {
      const rawWatch = await AsyncStorage.getItem('PAIRED_WATCH_INFO');
      if (rawWatch) {
        const parsed = JSON.parse(rawWatch);
        watchName = parsed.name;
      }
    } catch (_) {}

    // Save session with today's date
    const dist = calcDistance(workoutTypeRef.current, stepsRef.current, elapsedRef.current);
    const cal = calcCalories(workoutTypeRef.current, stepsRef.current, elapsedRef.current);
    const session: WorkoutSession = {
      date: getTodayKey(),
      type: workoutTypeRef.current,
      durationSeconds: elapsedRef.current,
      steps: stepsRef.current,
      distanceKm: Math.round(dist * 100) / 100,
      calories: cal,
      deviceName: watchName,
    };
    saveSession(session);
  }, [stopAccelerometer, saveSession]);

  // ── Set Workout Type (only when not active) ──────────────────────────────
  const setWorkoutType = useCallback((type: WorkoutType) => {
    if (isActiveRef.current) return;
    workoutTypeRef.current = type;
    _setWorkoutType(type);
  }, []);

  // Cleanup on unmount (do NOT stop workout - keep running)
  useEffect(() => {
    return () => {
      // Only cleanup timer/accelerometer when the component fully unmounts
      // Do NOT stop if workout is still active (user switched tab)
      if (!isActiveRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        stopAccelerometer();
      }
    };
  }, [stopAccelerometer]);

  // ── Derived values ───────────────────────────────────────────────────────
  const dist = calcDistance(workoutType, steps, elapsedSeconds);
  const cal = calcCalories(workoutType, steps, elapsedSeconds);

  return {
    isActive,
    workoutType,
    elapsedSeconds,
    steps,
    distanceKm: dist.toFixed(2),
    calories: cal,
    isSensorAvailable,
    isSimulating,
    todaysSessions,
    startWorkout,
    stopWorkout,
    setWorkoutType,
  };
}
