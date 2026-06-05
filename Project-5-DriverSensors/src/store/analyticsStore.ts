import { create } from 'zustand';
import { driveRepository } from '../database/repositories/driveRepository';
import { DriveSession } from './driveStore';

interface AnalyticsState {
  totalDrives: number;
  averageScore: number;
  bestScore: number;
  totalDistance: number;
  totalEvents: number;
  recentDrives: DriveSession[];
  
  loadAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  totalDrives: 0,
  averageScore: 0,
  bestScore: 0,
  totalDistance: 0,
  totalEvents: 0,
  recentDrives: [],

  loadAnalytics: () => {
    const drives = driveRepository.getAllDrives();
    
    if (drives.length === 0) {
      set({
        totalDrives: 0,
        averageScore: 0,
        bestScore: 0,
        totalDistance: 0,
        totalEvents: 0,
        recentDrives: [],
      });
      return;
    }

    let totalScore = 0;
    let bestScore = 0;
    let totalDistance = 0;
    let totalEvents = 0;

    drives.forEach(drive => {
      totalScore += drive.score;
      if (drive.score > bestScore) bestScore = drive.score;
      totalDistance += (drive.distance || 0);
      totalEvents += (drive.events ? drive.events.length : 0);
    });

    const averageScore = Math.round(totalScore / drives.length);

    set({
      totalDrives: drives.length,
      averageScore,
      bestScore,
      totalDistance: Math.round(totalDistance),
      totalEvents,
      recentDrives: drives.slice(0, 5), // Keep latest 5 for quick dashboard view
    });
  }
}));
