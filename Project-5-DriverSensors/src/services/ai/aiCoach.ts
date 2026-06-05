import { DriveSession } from '../../store/driveStore';

export const generateAIFeedback = (session: DriveSession): string[] => {
  const feedback: string[] = [];
  const events = session.events || [];

  const harshBrakes = events.filter(e => e.type === 'HARSH_BRAKE').length;
  const harshAccels = events.filter(e => e.type === 'HARSH_ACCELERATION').length;
  const sharpTurns = events.filter(e => e.type === 'SHARP_TURN').length;
  const phoneUsages = events.filter(e => e.type === 'PHONE_USAGE').length;
  const overspeeding = events.filter(e => e.type === 'OVERSPEEDING').length;

  if (session.score === 100) {
    feedback.push("Excellent driving! You had a perfect safety score. Keep up the great work.");
    return feedback;
  }

  if (phoneUsages > 0) {
    feedback.push(`You used your phone ${phoneUsages} times while driving. Try keeping it mounted to improve focus and safety.`);
  }
  
  if (harshBrakes > 2) {
    feedback.push(`You braked suddenly ${harshBrakes} times. Try maintaining a larger following distance to avoid sudden stops.`);
  } else if (harshBrakes > 0) {
    feedback.push("Watch out for sudden stops. Smooth braking extends the life of your brakes.");
  }

  if (harshAccels > 2) {
    feedback.push(`You tend to accelerate aggressively. Maintain smoother acceleration to improve fuel efficiency and safety.`);
  }

  if (sharpTurns > 1) {
    feedback.push(`You took ${sharpTurns} sharp turns. Take turns more smoothly to prevent vehicle instability.`);
  }

  if (overspeeding > 0) {
    feedback.push("You exceeded the speed limit during your drive. Please adhere to speed limits for your safety.");
  }

  if (feedback.length === 0) {
    feedback.push("Good drive overall. Stay safe on the roads!");
  }

  return feedback;
};
