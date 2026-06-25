/**
 * HabitFlow Design System — Neumorphism Dark Theme
 * Same dark blue palette with 3D soft shadow effects
 */

// Core background — base of all neumorphic surfaces
export const NEO_BG = '#0D1B2E';

// Shadow colors for neumorphic depth
export const NEO_SHADOW_DARK  = '#070F1C'; // bottom-right dark shadow
export const NEO_SHADOW_LIGHT = 'rgba(255,255,255,0.05)'; // top-left highlight

// Pressed / inset state (inner shadow simulation)
export const NEO_PRESSED_BG = '#0A1526';

// Accent palette (same as before)
export const C = {
  bgDeep:    NEO_BG,
  bgPressed: NEO_PRESSED_BG,

  teal:       '#5EEAD4',
  tealDim:    'rgba(94, 234, 212, 0.12)',
  tealBorder: 'rgba(94, 234, 212, 0.22)',
  tealGlow:   'rgba(94, 234, 212, 0.08)',

  yellow:    '#EAD45E',
  yellowDim: 'rgba(234, 212, 94, 0.12)',

  purple:    '#C45EEA',
  purpleDim: 'rgba(196, 94, 234, 0.12)',

  orange:    '#EA875E',
  orangeDim: 'rgba(234, 135, 94, 0.12)',

  green:     '#5EEA87',
  greenDim:  'rgba(94, 234, 135, 0.12)',

  red:       '#EA5E5E',

  textPrimary: '#E8F4FF',
  textSub:     '#7A9CC4',
  textMuted:   '#3D5A7A',
  textGlow:    '#A8D8F0',

  border:      'rgba(255, 255, 255, 0.05)',
  borderMid:   'rgba(255, 255, 255, 0.09)',
  borderAccent:'rgba(94, 234, 212, 0.2)',
};

// Neumorphic shadow style helper — use spread operator in StyleSheet
export const neoCard = {
  backgroundColor: NEO_BG,
  // Dark shadow (bottom-right)
  shadowColor: NEO_SHADOW_DARK,
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 10,
  elevation: 8,
  // Light highlight (top-left) simulated via borderTopColor + borderLeftColor
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderBottomWidth: 1,
  borderRightWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.07)',
  borderLeftColor: 'rgba(255,255,255,0.07)',
  borderBottomColor: 'rgba(0,0,0,0.4)',
  borderRightColor: 'rgba(0,0,0,0.4)',
};

// Pressed / inset card (debossed)
export const neoCardPressed = {
  backgroundColor: NEO_PRESSED_BG,
  shadowColor: NEO_SHADOW_DARK,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.8,
  shadowRadius: 4,
  elevation: 2,
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderBottomWidth: 1,
  borderRightWidth: 1,
  borderTopColor: 'rgba(0,0,0,0.4)',
  borderLeftColor: 'rgba(0,0,0,0.4)',
  borderBottomColor: 'rgba(255,255,255,0.05)',
  borderRightColor: 'rgba(255,255,255,0.05)',
};

// Neumorphic button (circular)
export const neoBtn = {
  backgroundColor: NEO_BG,
  shadowColor: NEO_SHADOW_DARK,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 6,
  elevation: 6,
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderBottomWidth: 1,
  borderRightWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.07)',
  borderLeftColor: 'rgba(255,255,255,0.07)',
  borderBottomColor: 'rgba(0,0,0,0.5)',
  borderRightColor: 'rgba(0,0,0,0.5)',
};
