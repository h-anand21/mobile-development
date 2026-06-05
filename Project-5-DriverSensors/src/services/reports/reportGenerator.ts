import { DriveSession } from '../../store/driveStore';
import dayjs from 'dayjs';

export interface DriveReport {
  title: string;
  generatedAt: string;
  driveId: string;
  date: string;
  duration: string;
  distance: string;
  score: number;
  rating: string;
  eventSummary: {
    harshBrakes: number;
    harshAccelerations: number;
    sharpTurns: number;
    phoneUsages: number;
    overspeeding: number;
  };
  totalEvents: number;
}

export const generateDriveReport = (session: DriveSession): DriveReport => {
  const events = session.events || [];
  
  const harshBrakes = events.filter(e => e.type === 'HARSH_BRAKE').length;
  const harshAccelerations = events.filter(e => e.type === 'HARSH_ACCELERATION').length;
  const sharpTurns = events.filter(e => e.type === 'SHARP_TURN').length;
  const phoneUsages = events.filter(e => e.type === 'PHONE_USAGE').length;
  const overspeeding = events.filter(e => e.type === 'OVERSPEEDING').length;

  const durationMinutes = Math.floor(session.duration / 60);
  const durationSeconds = session.duration % 60;
  
  const distanceKm = (session.distance / 1000).toFixed(2);

  return {
    title: 'SafeDrive Trip Report',
    generatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    driveId: session.id,
    date: dayjs(session.startTime).format('MMMM D, YYYY h:mm A'),
    duration: `${durationMinutes}m ${durationSeconds}s`,
    distance: `${distanceKm} km`,
    score: session.score,
    rating: session.rating,
    eventSummary: {
      harshBrakes,
      harshAccelerations,
      sharpTurns,
      phoneUsages,
      overspeeding
    },
    totalEvents: events.length
  };
};

export const formatReportAsText = (report: DriveReport): string => {
  return `
=================================
       SAFEDRIVE REPORT
=================================
Date: ${report.date}
Drive ID: ${report.driveId}
Generated At: ${report.generatedAt}

---------------------------------
TRIP DETAILS
---------------------------------
Duration: ${report.duration}
Distance: ${report.distance}
Safety Score: ${report.score} / 100
Rating: ${report.rating}

---------------------------------
EVENTS SUMMARY
---------------------------------
Harsh Brakes:         ${report.eventSummary.harshBrakes}
Harsh Accelerations:  ${report.eventSummary.harshAccelerations}
Sharp Turns:          ${report.eventSummary.sharpTurns}
Phone Usages:         ${report.eventSummary.phoneUsages}
Overspeeding:         ${report.eventSummary.overspeeding}

Total Events: ${report.totalEvents}
=================================
`;
};
