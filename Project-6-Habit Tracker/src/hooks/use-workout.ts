/**
 * use-workout.ts
 * Persistent live workout tracker hook.
 * - State survives tab switches (refs hold true values)
 * - Saves session data with date & timestamp to AsyncStorage
 * - Provides full workout history list with delete capabilities
 */

import { useState, useRef, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type WorkoutType = "outdoor_run" | "indoor_run" | "brisk_walk" | "outdoor_cycle";

export interface WorkoutSession {
  id: string;
  date: string;              // YYYY-MM-DD
  timestamp: number;          // Date.now()
  formattedTime: string;      // e.g. "8:45 PM"
  type: WorkoutType;
  durationSeconds: number;
  steps: number;
  distanceKm: number;
  calories: number;
  deviceName?: string;       // Smart Watch name if paired during workout
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
  allSessions: WorkoutSession[];
  startWorkout: () => void;
  stopWorkout: () => void;
  setWorkoutType: (type: WorkoutType) => void;
  deleteSession: (id: string) => Promise<void>;
  clearAllSessions: () => Promise<void>;
}

const STORAGE_KEY = "HABITFLOW_WORKOUT_SESSIONS";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTimeString(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

function calcDistance(type: WorkoutType, steps: number, elapsedSecs: number): number {
  if (type === "outdoor_cycle") {
    return elapsedSecs * 0.005;
  }
  if (type === "outdoor_run") {
    return (steps * 0.85) / 1000;
  }
  if (type === "indoor_run") {
    return (steps * 0.78) / 1000;
  }
  return (steps * 0.72) / 1000;
}

function calcCalories(type: WorkoutType, steps: number, elapsedSecs: number): number {
  if (type === "outdoor_cycle") {
    return Math.round((elapsedSecs / 60) * 8);
  }
  if (type === "outdoor_run") {
    return Math.round(steps * 0.065);
  }
  if (type === "indoor_run") {
    return Math.round(steps * 0.058);
  }
  return Math.round(steps * 0.040);
}

export function useWorkout(): WorkoutState {
  const [isActive, setIsActive] = useState(false);
  const [workoutType, _setWorkoutType] = useState<WorkoutType>("outdoor_run");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [steps, setSteps] = useState(0);
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([]);

  const stepsRef = useRef(0);
  const elapsedRef = useRef(0);
  const workoutTypeRef = useRef<WorkoutType>("outdoor_run");
  const isActiveRef = useRef(false);

  const timerRef = useRef<any>(null);
  const accelSubRef = useRef<any>(null);
  const lastStepTimeRef = useRef(0);

  // ── Load all sessions from AsyncStorage ──────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setAllSessions([]);
        return;
      }
      const parsed: WorkoutSession[] = JSON.parse(raw);
      // Sort newest first by timestamp
      const sorted = parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAllSessions(sorted);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── Save session to AsyncStorage ─────────────────────────────────────────
  const saveSession = useCallback(async (session: WorkoutSession) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: WorkoutSession[] = raw ? JSON.parse(raw) : [];
      list.unshift(session); // prepend newest
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setAllSessions(list);
    } catch (_) {}
  }, []);

  // ── Delete single session ───────────────────────────────────────────────
  const deleteSession = useCallback(async (id: string) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: WorkoutSession[] = JSON.parse(raw);
      const filtered = list.filter(s => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setAllSessions(filtered);
    } catch (_) {}
  }, []);

  // ── Clear all sessions ──────────────────────────────────────────────────
  const clearAllSessions = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setAllSessions([]);
    } catch (_) {}
  }, []);

  // ── Start Accelerometer ──────────────────────────────────────────────────
  const startAccelerometer = useCallback(async () => {
    try {
      const { Accelerometer } = await import("expo-sensors");
      const available = await Accelerometer.isAvailableAsync();
      if (!available) {
        setIsSimulating(true);
        return;
      }

      setIsSensorAvailable(true);
      setIsSimulating(false);
      Accelerometer.setUpdateInterval(80);

      accelSubRef.current = Accelerometer.addListener(({ x, y, z }) => {
        if (!isActiveRef.current) return;

        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

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
    stepsRef.current = 0;
    elapsedRef.current = 0;
    setSteps(0);
    setElapsedSeconds(0);
    isActiveRef.current = true;
    setIsActive(true);

    AsyncStorage.setItem("ACTIVE_WORKOUT_STATE", "active").catch(() => {});

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds(elapsedRef.current);

      if (isSimulating) {
        const baseRate = workoutTypeRef.current === "brisk_walk" ? 1 :
                         workoutTypeRef.current === "outdoor_run" ? 3 :
                         workoutTypeRef.current === "indoor_run" ? 2 : 0;
        if (baseRate > 0) {
          const delta = Math.floor(Math.random() * baseRate) + 1;
          stepsRef.current += delta;
          setSteps(stepsRef.current);
        }
      }
    }, 1000);

    startAccelerometer();
  }, [isSimulating, startAccelerometer]);

  // ── Stop Workout ─────────────────────────────────────────────────────────
  const stopWorkout = useCallback(async () => {
    isActiveRef.current = false;
    setIsActive(false);

    AsyncStorage.removeItem("ACTIVE_WORKOUT_STATE").catch(() => {});

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopAccelerometer();

    let watchName = undefined;
    try {
      const rawWatch = await AsyncStorage.getItem("PAIRED_WATCH_INFO");
      if (rawWatch) {
        const parsed = JSON.parse(rawWatch);
        watchName = parsed.name;
      }
    } catch (_) {}

    const now = new Date();
    const dist = calcDistance(workoutTypeRef.current, stepsRef.current, elapsedRef.current);
    const cal = calcCalories(workoutTypeRef.current, stepsRef.current, elapsedRef.current);
    
    const session: WorkoutSession = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: getTodayKey(),
      timestamp: now.getTime(),
      formattedTime: formatTimeString(now),
      type: workoutTypeRef.current,
      durationSeconds: elapsedRef.current,
      steps: stepsRef.current,
      distanceKm: Math.round(dist * 100) / 100,
      calories: cal,
      deviceName: watchName,
    };
    await saveSession(session);
  }, [stopAccelerometer, saveSession]);

  // ── Set Workout Type ─────────────────────────────────────────────────────
  const setWorkoutType = useCallback((type: WorkoutType) => {
    if (isActiveRef.current) return;
    workoutTypeRef.current = type;
    _setWorkoutType(type);
  }, []);

  useEffect(() => {
    return () => {
      if (!isActiveRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        stopAccelerometer();
      }
    };
  }, [stopAccelerometer]);

  const today = getTodayKey();
  const todaysSessions = allSessions.filter(s => s.date === today);
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
    allSessions,
    startWorkout,
    stopWorkout,
    setWorkoutType,
    deleteSession,
    clearAllSessions,
  };
}