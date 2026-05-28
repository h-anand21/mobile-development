// ============================================================
// DevNest — Color Tokens (Deep Black & Neon Lime Theme)
// ============================================================
import { useSettingsStore } from '@/store/settingsStore';

export const ColorsDark = {
  bg: {
    primary: '#000000',    // Pure black background
    secondary: '#161616',  // Cards, sheets
    tertiary: '#1E1E1E',   // Input fields, borders
    elevated: '#262626',   // Modals, overlays, active states
  },
  accent: {
    primary: '#CCFF00',    // Vibrant Neon Lime
    secondary: '#A3CC00',  // Darker lime
    glow: 'rgba(204, 255, 0, 0.15)', // Lime glow
    muted: 'rgba(204, 255, 0, 0.08)',
  },
  text: {
    primary: '#FFFFFF',    // Main white text
    secondary: '#A1A1AA',  // Muted grey text (zinc-400)
    tertiary: '#52525B',   // Disabled, placeholder (zinc-600)
    accent: '#CCFF00',     // Neon lime text
  },
  border: {
    primary: '#27272A',    // zinc-800
    secondary: '#3F3F46',  // zinc-700
    accent: '#CCFF00',
  },
  lang: {
    js: '#F7DF1E',
    ts: '#3178C6',
    python: '#3776AB',
    java: '#ED8B00',
    csharp: '#9B4F96',
    cpp: '#00599C',
    go: '#00ADD8',
    rust: '#CE422B',
    php: '#777BB4',
    ruby: '#CC342D',
    swift: '#FA7343',
    kotlin: '#7F52FF',
    dart: '#0175C2',
    sql: '#336791',
    html: '#E34C26',
    css: '#264DE4',
    shell: '#4EAA25',
    default: '#CCFF00',
  },
  status: {
    success: '#CCFF00',
    error: '#FF3333',
    warning: '#FFD700',
    info: '#3399FF',
  },
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export const ColorsLight = {
  bg: {
    primary: '#F4F4F5',    // soft light background
    secondary: '#FFFFFF',  // Cards, sheets
    tertiary: '#E4E4E7',   // Input fields, borders
    elevated: '#E4E4E7',   // Modals, overlays, active states
  },
  accent: {
    primary: '#6E9000',    // Neon-like contrast green for light mode
    secondary: '#557000',  // Darker green
    glow: 'rgba(110, 144, 0, 0.15)', // Lime glow
    muted: 'rgba(110, 144, 0, 0.08)',
  },
  text: {
    primary: '#18181B',    // Main dark text (zinc-900)
    secondary: '#52525B',  // Muted grey text (zinc-600)
    tertiary: '#A1A1AA',   // Disabled, placeholder (zinc-400)
    accent: '#6E9000',     // Green text
  },
  border: {
    primary: '#E4E4E7',    // zinc-200
    secondary: '#D4D4D8',  // zinc-300
    accent: '#6E9000',
  },
  lang: ColorsDark.lang,
  status: {
    success: '#6E9000',
    error: '#FF3333',
    warning: '#FFD700',
    info: '#3399FF',
  },
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(255, 255, 255, 0.7)',
} as const;

// Helper hook to dynamically react to theme changes
export function useThemeColors() {
  const theme = useSettingsStore(s => s.theme);
  return theme === 'light' ? ColorsLight : ColorsDark;
}

// Fallback static Colors pointing to dark by default (to avoid compilation breaks)
export const Colors = ColorsDark;
