export type EventType = 
  | 'HARSH_BRAKE' 
  | 'HARSH_ACCELERATION' 
  | 'SHARP_TURN' 
  | 'PHONE_USAGE' 
  | 'EXCESSIVE_MOVEMENT' 
  | 'OVERSPEEDING'
  | 'AGGRESSIVE_STEERING';


export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DriveEvent {
  id: string;
  type: EventType;
  timestamp: number;
  severity: EventSeverity;
  confidence: number; // 0 to 100
  location?: {
    latitude: number;
    longitude: number;
  };
  speed?: number; // in km/h
  duration?: number; // in seconds (e.g., for phone usage)
}

