// ============================================================
// DevNest — Color Tokens (Deep Black & Neon Lime Theme)
// ============================================================

export const Colors = {
  // --- Primary Background ---
  bg: {
    primary: '#000000',    // Pure black background
    secondary: '#161616',  // Cards, sheets
    tertiary: '#1E1E1E',   // Input fields, borders
    elevated: '#262626',   // Modals, overlays, active states
  },

  // --- Accent / Brand ---
  accent: {
    primary: '#CCFF00',    // Vibrant Neon Lime
    secondary: '#A3CC00',  // Darker lime
    glow: 'rgba(204, 255, 0, 0.15)', // Lime glow
    muted: 'rgba(204, 255, 0, 0.08)',
  },

  // --- Text ---
  text: {
    primary: '#FFFFFF',    // Main white text
    secondary: '#A1A1AA',  // Muted grey text (zinc-400)
    tertiary: '#52525B',   // Disabled, placeholder (zinc-600)
    accent: '#CCFF00',     // Neon lime text
  },

  // --- Border ---
  border: {
    primary: '#27272A',    // zinc-800
    secondary: '#3F3F46',  // zinc-700
    accent: '#CCFF00',
  },

  // --- Language Badge Colors (Vibrant/Neon variants) ---
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

  // --- Status ---
  status: {
    success: '#CCFF00',
    error: '#FF3333',
    warning: '#FFD700',
    info: '#3399FF',
  },

  // --- Utility ---
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export type ColorKey = keyof typeof Colors;
