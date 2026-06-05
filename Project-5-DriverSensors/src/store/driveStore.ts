import { create } from 'zustand';
import { DriveEvent } from '../types/event';
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
}

interface DriveState {
  currentSession: DriveSession | null;
  startDrive: () => void;
  endDrive: () => void;
  addEvent: (event: DriveEvent) => void;
  updateScore: (penalty: number) => void;
  updateDistance: (distance: number) => void;
}

export const useDriveStore = create<DriveState>((set) => ({
  currentSession: null,

  startDrive: () => {
    const newSession: DriveSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      score: 100,
      rating: 'EXCELLENT',
      events: [],
      distance: 0,
    };
    set({ currentSession: newSession });
  },

  endDrive: () => {
    set((state) => {
      if (!state.currentSession) return state;
      const endTime = Date.now();
      const duration = Math.floor((endTime - state.currentSession.startTime) / 1000);
      
      const completedSession = {
        ...state.currentSession,
        endTime,
        duration,
      };

      // Save to MMKV Storage History
      driveRepository.saveDrive(completedSession);

      return {
        currentSession: completedSession,
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

  updateScore: (penalty) => {
    set((state) => {
      if (!state.currentSession) return state;
      let newScore = state.currentSession.score + penalty;
      if (newScore < 0) newScore = 0;
      
      let newRating = 'EXCELLENT';
      if (newScore < 50) newRating = 'POOR';
      else if (newScore < 70) newRating = 'FAIR';
      else if (newScore < 90) newRating = 'GOOD';

      return {
        currentSession: {
          ...state.currentSession,
          score: newScore,
          rating: newRating,
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
