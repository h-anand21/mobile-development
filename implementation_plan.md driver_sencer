# SafeDrive - Driver Distraction & Harsh Driving Detection System

This is the implementation plan for the SafeDrive mobile application, incorporating Core, Professional, AI Coach, and Route Replay features with an industry-level modular architecture.

## User Review Required
> [!IMPORTANT]
> Please review this plan. Once you approve it, I will proceed with Phase 1 to set up the project and the extensive folder structure as requested.

## Proposed Implementation Phases

### Phase 1: Project Setup (Folder Structure & Core Libraries)
- Initialize Expo app with TypeScript template (`npx create-expo-app SafeDrive --template blank-typescript`).
- Install essential dependencies: `expo-router`, `zustand`, `react-native-mmkv`, `dayjs`, `uuid`.
- Scaffold the modular folder structure (including UI folders, hooks, services, store, etc.).

### Phase 2: Sensor Integration
- Install `expo-sensors`.
- Implement `useAccelerometer`, `useGyroscope`, `useMagnetometer`, and `useDeviceMotion` hooks.
- Create the sensor store for state management.

### Phase 3: Detection Engine (Core Logic)
- Define constants and thresholds for event detection.
- Implement filter utilities for raw sensor data.
- Build detection services for:
  - Harsh Braking
  - Harsh Acceleration
  - Sharp Turns
  - Aggressive Steering
  - Phone Handling
  - Excessive Movement

### Phase 4: Score Engine
- Implement the scoring logic (starting at 100).
- Apply penalties based on event severity.
- Manage score state using `zustand` (`scoreStore`).

### Phase 5: GPS & Speed Tracking (Professional Feature)
- Install `expo-location`.
- Implement `useLocation` hook.
- Track speed, distance, and detect overspeeding.

### Phase 6: Storage & History Module
- Use `react-native-mmkv` to store completed drive sessions.
- Save drive data: score, distance, duration, events, date.
- Retrieve the last 100 drives for history.

### Phase 7: Dashboard & Analytics
- Install `victory-native` for charts.
- Aggregate daily, weekly, and monthly metrics (average score, distance, events).
- Implement basic dashboard UI components to visualize data.

### Phase 8: Route Replay (Premium Feature)
- Capture location points during the drive along with event timestamps.
- Build the Replay module with map visualization.
- Add markers for events (Harsh Brake, Sharp Turn, etc.) on the map.

### Phase 9: AI Coach (Premium Feature)
- Analyze completed drive events.
- Implement pattern detection (e.g., frequent phone usage, aggressive braking).
- Generate actionable feedback text (e.g., "Avoid holding your phone while driving.").

### Phase 10: Reports (Professional/Premium Feature)
- Generate Drive Reports, Weekly Reports, and Monthly Reports.
- (Optional) Prepare data for PDF export.

### Phase 11: UI Polish (Design System Implementation)
- Complete the UI components within `src/ui/`.
- Implement screens using the predefined layout and navigation.
- Apply theming, colors, and typography for a professional look.

### Phase 12: Optimization & Testing
- Optimize sensor polling rates for battery efficiency.
- Test background tracking limitations.
- Final bug fixes and performance tuning.

## Verification Plan

### Automated Tests
- Validate threshold logic and penalty deductions via unit tests.
- Verify state updates in Zustand stores.

### Manual Verification
- Run the app on a physical device using Expo Go to test real-world sensor data (accelerometer, gyroscope, GPS).
- Conduct a test drive to verify event detection accuracy and route tracking.
- Verify UI responsiveness and chart rendering.
