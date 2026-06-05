export const THRESHOLDS = {
  // Accelerometer thresholds in Gs (approx. 9.8 m/s^2 = 1G)
  HARSH_BRAKE_G: -0.4,       // G-force threshold for harsh braking (negative acceleration)
  HARSH_ACCELERATION_G: 0.4, // G-force threshold for harsh acceleration
  
  // Gyroscope thresholds in radians/second
  SHARP_TURN_RAD: 2.0,       // Threshold for sharp/aggressive turns
  
  // Device motion / Phone handling
  EXCESSIVE_MOVEMENT: 3.5,   // Acceleration delta for device shaking
  PHONE_USAGE_ROTATION: 1.5, // Rotation rate indicating picking up phone
  
  // Speed thresholds in m/s (approx 80 km/h = 22.2 m/s)
  OVERSPEEDING_MS: 22.2,
};
