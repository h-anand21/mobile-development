# SafeDrive | Driver Telemetry & Safety Analytics Engine 🚗⚡

SafeDrive is a high-fidelity, cyberpunk-themed React Native (Expo) application designed to capture, process, and analyze real-time driver telemetry. By leveraging the device's on-board hardware sensors, SafeDrive detects risky driving events and offers a dynamic safety score, route replays, and AI coaching.

---

## 🚀 Key Features

*   **HUD Home Dashboard:** Cyberpunk-inspired dashboard displaying live trip telemetry, featuring absolute SVG HUD pointer lines that map cards directly to the car headlights and wheels.
*   **Live Sensor Analytics:** Real-time stream plotting of Accelerometer, Gyroscope, and Magnetometer waveforms with sub-second latency.
*   **Interactive Route Replay:** Vector-based SVG coordinate maps displaying completed driving routes. Built with touch-responsive dragging, panning, dynamic zoom alignment, and floating coordinates callouts.
*   **AI Driving Coach:** An intelligent coach that evaluates driving patterns, gives safety recommendations, and rewards safe drivers with copyable discount vouchers (fuel, coffee, insurance).
*   **Native Integrations:** Directly hooks into native OS APIs such as `Linking.openSettings()` for permissions, `Share` for exporting markdown reports, and `Clipboard` for coupon copying.
*   **Custom privacy & Thresholds:** Fine-tune the detection engine's thresholds (harsh braking force, cornering speed) and toggle telemetry sharing or database encryption.

---

## 📊 Telemetry & Scoring Engine

SafeDrive maintains a running **Safe Score (0–100)** starting at `100` for every trip. Dynamic sensor readings are processed via a **Low-Pass Filter (LPF)** to filter out road vibration and sudden bumps before event triggers are evaluated:

$$\text{FilteredValue} = \text{RawValue} \times \alpha + \text{PrevFilteredValue} \times (1 - \alpha) \quad \text{where } \alpha = 0.2$$

### Penalty Breakdown & Thresholds

When values exceed customizable threshold limits, events are logged and the safety score is updated according to the penalty schema below:

| Violation Event | Sensor / Axis | Default Trigger Threshold | Score Penalty | UI & Recommendation Advice |
| :--- | :--- | :--- | :---: | :--- |
| **Harsh Brake** | Accelerometer (Y-axis) | $< -0.30 \text{ Gs}$ ($2.94 \text{ m/s}^2$) | **-5** | Avoid tailgating; maintain a safe following distance. |
| **Harsh Acceleration**| Accelerometer (Y-axis) | $> 0.30 \text{ Gs}$ ($2.94 \text{ m/s}^2$) | **-5** | Accelerate smoothly to increase range/fuel efficiency. |
| **Sharp Turn** | Gyroscope (Z-axis) | $> 2.0 \text{ rad/s}$ | **-3** | Slow down before entering turns to prevent instability. |
| **Phone Usage** | Gyroscope (X/Y-axis) | $> 1.5 \text{ rad/s}$ rotation | **-10** | Mount the device; avoid picking up the phone. |
| **Aggressive Steering**| Accelerometer (X-axis) | $> 0.35 \text{ Gs}$ lateral change | **-6** | Avoid weaving or rapid lane switching. |
| **Overspeeding** | GPS Location | Speed limit + tolerance ($10\text{ km/h}$) | **-5** | Adhere to local speed regulations. |
| **Excessive Movement** | DeviceMotion | Shaking delta $> 3.5$ | **-7** | Keep the phone secured in a stable mount. |

*Note: All events have a **4-second cooldown** to prevent single occurrences from repeatedly penalizing the driver's score.*

---

## 📱 Screen-by-Screen Details

The application consists of the following 14 dedicated screens and modules, organized dynamically:

### 1. Tab Navigation Screens (Main Hub)
*   **Home HUD Dashboard (`app/(tabs)/index.tsx`):** trip dashboard with HUD styling. Visual SVG pointer lines anchor dashboard panels directly to schematic representation elements of the vehicle. Features trip telemetry summaries, active status gauges, and the main "Start Drive" button.
*   **Active Drive Dashboard (`app/(tabs)/drive.tsx`):** Trip tracking cockpit. Shows telemetry gauge dial, current speed, duration, distance, G-Force logs, and active status checks.
*   **History Logs (`app/(tabs)/history.tsx`):** Chronological log of all completed trips, including safety score ratings, route summaries, distances, durations, weather data, and safety event triggers.
*   **Profile Manager (`app/(tabs)/profile.tsx`):** User profile card, vehicle profile selections (e.g. sedan, SUV, electric), driving metrics, and dynamic privacy checkboxes.
*   **Metrics Dashboard (`app/(tabs)/dashboard.tsx`):** Aggregated metrics panel displaying historical metrics across Week, Month, and Year tabs, complete with Svg line charts, radar breakdown graphs, donut distribution charts, and weekly insights cards.

### 2. Inner Action Screens & Diagnostics
*   **Settings Controller (`app/settings.tsx`):** Configurations cockpit where users toggle notifications, switch theme configurations (Light, Dark, System), select accent color, adjust metric/imperial units, clear drive history, and fine-tune event trigger thresholds (harsh braking, sharp turn, speeding, and phone usage).
*   **Achievements & Rewards (`app/achievements.tsx`):** Reward and recognition dashboard showing driving tiers, progress bars, locked/unlocked achievements, and redeemable copyable discount coupon vouchers.
*   **AI Coach (`app/ai-coach.tsx`):** Interactive diagnostic interface providing personalized recommendations, feedback cards, and overall driving ratings.
*   **Trip Details Replay (`app/drive-details.tsx`):** Post-drive telemetry logs, including safety score breakdowns, weather summaries, lateral/vertical G-force indicators, and interactive routes.
*   **Drive Summary (`app/drive-summary.tsx`):** Summary screen showing the results of a completed driving session immediately after saving, highlighting safety score dials, category progress bars, and basic trip stats.
*   **Live Sensor Analytics (`app/live-analytics.tsx`):** Real-time hardware diagnostics plotting raw accelerometer, gyroscope, magnetometer, and 3D device motion waveforms with sub-second latency.
*   **Live Alerts log (`app/live-events.tsx`):** Rolling real-time console showing safety alerts (e.g., sharp turns, phone pickups) as they are registered by the sensor engine.
*   **Exportable Reports (`app/reports.tsx`):** Markdown safety report exporter with copy capabilities and native sharing triggers.
*   **Route Replay playback (`app/route-replay.tsx`):** Coordinate map playback viewer with dynamic zoom, panning gestures, playback speeds, and floating coordinate overlay widgets.

---

## 🛠️ Architecture & Technical Stack

### 📂 Directory Map
```
Project-5-DriverSensors/
├── app/                      # Expo Router navigation sheets
│   ├── (tabs)/
│   │   ├── index.tsx         # HUD dashboard with visual SVG lines & car dashboard
│   │   ├── drive.tsx         # Active driving panel with live dial markers
│   │   └── profile.tsx       # Profile management and privacy forms
│   ├── live-analytics.tsx    # Telemetry waveform stream charts
│   ├── route-replay.tsx      # SVG vector maps with pan/zoom touch gestures
│   ├── reports.tsx           # Exportable markdown reports & share sheets
│   ├── achievements.tsx      # Reward vouchers & Clipboard operations
│   └── ai-coach.tsx          # Driving diagnostic panel & recommendations
├── src/
│   ├── services/
│   │   ├── detection/        # Core useDetectionEngine.ts hook (LPF + thresholds)
│   │   ├── ai/               # AI feedback parser and coaches
│   │   └── reports/          # Report text formatting utilities
│   ├── store/                # Zustand global stores
│   │   ├── driveStore.ts     # Active drive session logging
│   │   ├── sensorStore.ts    # Hardware sensor feeds & toggle controls
│   │   └── settingsStore.ts  # Threshold levels & persistent config
│   ├── database/             # MMKV database repository interfaces
│   └── hooks/                # Expo hardware sensor integration hooks
```

### ⚡ Technology Stack
*   **Framework:** React Native + Expo (SDK 51+)
*   **Routing:** Expo Router (file-based)
*   **State Management:** Zustand (reactive, light stores)
*   **Storage:** MMKV Storage (lightning-fast local binary persistence)
*   **Graphics & HUD:** React Native SVG (`Line`, `Path`, `Circle`, `Gradient` components)
*   **Theme:** Premium futuristic dark mode (`#050B14` background, `#00f5ff` Cyber Cyan, `#84cc16` Lime Green)

---

## 🏃 Getting Started

### Prerequisites
Make sure you have Node.js and the Expo Go app installed on your testing device, or Android Studio/Xcode configuration complete.

### Setup Instructions
1.  **Clone the Repository & Navigate**
    ```bash
    cd Project-5-DriverSensors
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Start the Expo Packager**
    ```bash
    npx expo start -c
    ```
4.  **Launch App**
    *   Scan the QR code in terminal using **Expo Go** (Android/iOS).
    *   Press `a` to load on Android Emulator.
    *   Press `i` to load on iOS Simulator.

---

## 📜 Coding Guidelines

*   **Aesthetics First:** Colors and borders must leverage cyber-themed variables: `#00f5ff` (glowing cyan), `#84cc16` (active lime), `#122540` (subtle border blue).
*   **No Placeholders:** Live computations should always fall back to structured mockup states when no active session is running.
*   **No External Packages:** Maintain clean React Native/Expo core dependencies to maximize stability.
