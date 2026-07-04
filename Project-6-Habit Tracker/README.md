# 🧘 HabitFlow — Premium Neumorphic Habit & Fitness Tracker

**HabitFlow** is a modern, state-of-the-art mobile application built with **React Native, Expo, and TypeScript**. Designed with premium **Neumorphic (Soft UI) design principles**, it features a stunning, clean look with smooth animations, custom live workouts, and active sensor integration.

---

## 🚀 Key Features

*   **🎨 Premium Neumorphic Design System:** A visual style featuring soft, organic drop-shadows and inner inset shadows that react to presses (`SpringPressable`) for both light and dark modes.
*   **🏃 Live Workout Panel:** Toggleable live tracking for workouts including **Outdoor Run**, **Indoor Run**, **Brisk Walk**, and **Outdoor Cycle** with real-time speed, step counts, calories burned, distance, and duration timer.
*   **📱 Hybrid Pedometer Sensor:** Real-time step counter utilizing `expo-sensors`. It automatically requests permissions at runtime and seamlessly falls back to **Accelerometer-based step detection** or **simulation mode** (on simulators/emulators) to guarantee it always runs.
*   **📊 Advanced Progress Analytics:** Clean calendar grids and circular percentage rings representing daily habits completion, success rates, and active streaks.
*   **🛡️ Streak Shields:** Built-in gamified mechanics enabling users to use "Streak Shields" to save their streaks on days they miss a habit.
*   **🏆 Achievements & Badges:** Gamified badges (e.g., *Habit Starter*, *Unstoppable*, *Consistent*) that unlock dynamically based on active streaks and completions.
*   **🧭 Reanimated Vector Tab Bar:** A custom, fully-animated tab bar using `@expo/vector-icons` and `react-native-reanimated` with spring-based transition effects.

---

## 🛠️ Technology Stack

*   **Framework:** React Native + Expo (SDK 55)
*   **Routing:** Expo Router (File-based navigation)
*   **State Management:** Local stores & React Context
*   **Animations:** `react-native-reanimated`
*   **Sensors:** `expo-sensors` (Pedometer & Accelerometer)
*   **Icons:** `@expo/vector-icons` (Ionicons)
*   **Graphics:** `react-native-svg`
*   **Database/Storage:** `@react-native-async-storage/async-storage`
*   **Language:** TypeScript (TSX)

---

## 📂 Project Directory Structure

```text
Project-6-Habit Tracker/
├── app.json                  # Expo configurations & system permissions
├── babel.config.js           # Babel configuration
├── package.json              # Dependencies & npm scripts
├── tsconfig.json             # TypeScript rules
└── src/
    ├── app/                  # Expo Router Screens
    │   ├── _layout.tsx       # Root layout, Theme Provider, and routing
    │   ├── index.tsx         # Home Dashboard (Habit list & Activity overview)
    │   ├── activity.tsx      # Daily rings, Stat cards & Live Workouts
    │   ├── analytics.tsx     # Calendar history tracker & completion success stats
    │   ├── achievements.tsx  # Gamified badges & Achievements screen
    │   ├── settings.tsx      # System settings, data reset & notification toggles
    │   ├── new.tsx           # Create New Habit screen (custom icon & category)
    │   ├── edit.tsx          # Edit Habit screen
    │   ├── notifications.tsx # Push Notifications setup & settings
    │   ├── habit/            # Sub-routes for habit details
    │   └── onboarding/       # Setup / onboarding screens
    ├── components/           # Reusable UI Components
    │   ├── TabBar.tsx        # Reanimated Neumorphic Vector Tab Bar
    │   ├── HabitCard.tsx     # Custom habit items with completion checkboxes
    │   ├── SpringPressable.tsx# Animated scale effect pressable container
    │   ├── PermissionBanner.tsx# Alert banners for notifications
    │   └── EmptyState.tsx    # Blank/No data fallback layout
    ├── constants/            # Styling variables & static configurations
    ├── context/              # Global Providers (ThemeContext)
    ├── hooks/                # Custom React hooks
    │   ├── use-habits.ts     # Habit CRUD operations and completion logs
    │   ├── use-pedometer.ts  # Device Pedometer and Accelerometer step tracker
    │   └── use-push-notifications.ts # Push notifications status hook
    └── lib/                  # Helper utilities & local storage setup
        └── habits/
            ├── storage.ts    # Async Storage CRUD methods
            ├── streak.ts     # Calculations for streaks & shields
            └── types.ts      # TypeScript interfaces & types
```

---

## 🖥️ Screen Details

1.  **Home Dashboard (`index.tsx`):**
    *   Dynamic greeting widget + theme switcher.
    *   Weekly calendar strip selector.
    *   **Activity Today** horizontal scroll cards showing live steps, calories, and distance.
    *   Today's habit checklist filtered by categories (Health, Work, Mind, Body, Other).
2.  **Activity & Workouts (`activity.tsx`):**
    *   **Daily Summary Tab:** 3 neumorphic rings (Steps, Calories, Distance) indicating target goals.
    *   **Workouts Tab:** A premium control console with exercise modes, a timer, live distance/kcal metrics, and a large circular **GO / STOP** button.
3.  **Analytics (`analytics.tsx`):**
    *   Completion heatmap calendar that displays habit performance per date.
    *   Progress percentage trackers showing overall monthly stats.
4.  **Achievements (`achievements.tsx`):**
    *   Card grid of badges with locked/unlocked visual statuses depending on active streaks.

---

## ⚙️ Installation & Setup

Follow these steps to clone and run HabitFlow locally:

### Prerequisites
Make sure you have Node.js and the Expo Go app (on your iOS/Android device) installed.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Project-6-Habit Tracker"
```

### 2. Install Dependencies
Install all compatibility-matched native libraries:
```bash
npm install
```

### 3. Run the Development Server
Start Metro Bundler:
```bash
npm run start
```
Or with cache cleared if needed:
```bash
npx expo start -c
```

### 4. Running on Devices
*   **Physical Device (Recommended):** Scan the QR code displayed in the terminal using your phone camera (iOS) or the Expo Go App (Android).
*   **Android Emulator:** Press `a` in the terminal to launch on a running Android emulator.
*   **iOS Simulator:** Press `i` in the terminal to launch on Xcode simulator.

---

## 📱 Developer Notes: Sensor & Permissions

### Permissions
The app automatically requests permission for step counting. If you are running the app on a physical device, make sure permissions are allowed:
*   **Android:** Apps -> Expo Go -> Permissions -> **Physical Activity** -> *Allowed*.
*   **iOS:** Settings -> Expo Go -> **Motion & Fitness** -> *Enabled*.

### Fallback Simulator Simulation
To ease testing when a physical pedometer sensor is missing (such as running on a Laptop Simulator or Emulator):
*   Tapping **GO** in the Workouts tab will automatically start a simulation timer. Steps, distance, and calories will count up dynamically in real time to display the animated metrics!
*   A **"⚠️ Sensor fallback"** status note will appear at the bottom of the card to indicate simulation mode is active.
