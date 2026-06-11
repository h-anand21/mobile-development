import { create } from 'zustand';
import { DriveEvent } from '../types/event';
import { LocationPoint } from '../types/route';
import { driveRepository } from '../database/repositories/driveRepository';

export interface DriveSession {
  id: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
  score: number;
  rating: string;
  events: DriveEvent[];
  distance: number; // in meters
  route: LocationPoint[];
  scoreHistory?: { elapsedSeconds: number; score: number }[];
}

interface DriveState {
  currentSession: DriveSession | null;
  startDrive: () => void;
  endDrive: () => void;
  addEvent: (event: DriveEvent) => void;
  addLocationPoint: (point: LocationPoint) => void;
  updateScore: (penalty: number) => void;
  updateDistance: (distance: number) => void;
}

let recoveryInterval: any = null;
let lastEventTime = 0;

export const useDriveStore = create<DriveState>((set) => ({
  currentSession: null,

  startDrive: () => {
    if (recoveryInterval) {
      clearInterval(recoveryInterval);
      recoveryInterval = null;
    }

    const newSession: DriveSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      score: 100,
      rating: 'EXCELLENT',
      events: [],
      distance: 0,
      route: [],
      scoreHistory: [{ elapsedSeconds: 0, score: 100 }],
    };

    lastEventTime = Date.now();

    // Start 30-second continuous clean driving check for score recovery
    recoveryInterval = setInterval(() => {
      const state = useDriveStore.getState();
      if (!state.currentSession) {
        if (recoveryInterval) {
          clearInterval(recoveryInterval);
          recoveryInterval = null;
        }
        return;
      }

      const now = Date.now();
      // If 30 seconds of clean driving has elapsed since last event or last recovery
      if (now - lastEventTime >= 30000) {
        const currentScore = state.currentSession.score;
        if (currentScore < 100) {
          const newScore = Math.min(100, currentScore + 1);

          let newRating = 'EXCELLENT';
          if (newScore < 50) newRating = 'POOR';
          else if (newScore < 70) newRating = 'FAIR';
          else if (newScore < 90) newRating = 'GOOD';

          const elapsedSeconds = Math.floor((now - state.currentSession.startTime) / 1000);

          useDriveStore.setState((s) => {
            if (!s.currentSession) return s;
            const history = s.currentSession.scoreHistory || [];
            const updatedHistory = [...history, { elapsedSeconds, score: newScore }];

            return {
              currentSession: {
                ...s.currentSession,
                score: newScore,
                rating: newRating,
                scoreHistory: updatedHistory,
              },
            };
          });
          console.log(`[SafeDrive] Score recovered to ${newScore} after 30s clean driving.`);
        }
        lastEventTime = now;
      }
    }, 1000);

    set({ currentSession: newSession });
  },

  endDrive: () => {
    if (recoveryInterval) {
      clearInterval(recoveryInterval);
      recoveryInterval = null;
    }

    set((state) => {
      if (!state.currentSession) return state;
      const endTime = Date.now();
      const duration = Math.floor((endTime - state.currentSession.startTime) / 1000);

      const history = state.currentSession.scoreHistory || [];
      const updatedHistory = [...history, { elapsedSeconds: duration, score: state.currentSession.score }];

      const completedSession = {
        ...state.currentSession,
        endTime,
        duration,
        scoreHistory: updatedHistory,
      };

      // Save to Storage History
      driveRepository.saveDrive(completedSession);

      return {
        currentSession: null,
      };
    });
  },

  addEvent: (event) => {
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          events: [...state.currentSession.events, event],
        },
      };
    });
  },

  addLocationPoint: (point) => {
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          route: [...state.currentSession.route, point],
        },
      };
    });
  },

  updateScore: (penalty) => {
    // Reset clean driving interval timer on event penalty
    lastEventTime = Date.now();

    set((state) => {
      if (!state.currentSession) return state;
      let newScore = state.currentSession.score + penalty;
      if (newScore < 0) newScore = 0;

      let newRating = 'EXCELLENT';
      if (newScore < 50) newRating = 'POOR';
      else if (newScore < 70) newRating = 'FAIR';
      else if (newScore < 90) newRating = 'GOOD';

      const elapsedSeconds = Math.floor((Date.now() - state.currentSession.startTime) / 1000);
      const history = state.currentSession.scoreHistory || [];
      const updatedHistory = [...history, { elapsedSeconds, score: newScore }];

      return {
        currentSession: {
          ...state.currentSession,
          score: newScore,
          rating: newRating,
          scoreHistory: updatedHistory,
        },
      };
    });
  },

  updateDistance: (distance) => {
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          distance: state.currentSession.distance + distance,
        },
      };
    });
  },
}));
