/**
 * HabitFlow — Dynamic Theme System
 * Neumorphic styles for both Dark and Light modes
 */

export interface Theme {
  isDark: boolean;

  // Backgrounds
  bg:      string;
  bgCard:  string;   // same as bg for neo
  bgPress: string;   // slightly different for pressed state

  // Neo shadow styles (use as ...T.neo in JSX style arrays)
  neo: {
    backgroundColor: string;
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
    borderTopWidth: number;
    borderLeftWidth: number;
    borderBottomWidth: number;
    borderRightWidth: number;
    borderTopColor: string;
    borderLeftColor: string;
    borderBottomColor: string;
    borderRightColor: string;
  };

  // Pressed (inset/debossed)
  neoPressed: {
    backgroundColor: string;
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
    borderTopWidth: number;
    borderLeftWidth: number;
    borderBottomWidth: number;
    borderRightWidth: number;
    borderTopColor: string;
    borderLeftColor: string;
    borderBottomColor: string;
    borderRightColor: string;
  };

  // Text
  textPrimary: string;
  textSub:     string;
  textMuted:   string;

  // Borders
  border:    string;
  borderMid: string;

  // Accents (same in both modes, slight brightness diff)
  teal:       string;
  tealDim:    string;
  tealBorder: string;
  yellow:     string;
  yellowDim:  string;
  purple:     string;
  purpleDim:  string;
  orange:     string;
  orangeDim:  string;
  green:      string;
  greenDim:   string;
  red:        string;

  // Tab bg
  tabBg: string;
}

export function getTheme(isDark: boolean): Theme {
  if (isDark) {
    const bg = '#111723';
    const bgCard = '#1B2333';
    return {
      isDark: true,
      bg,
      bgCard,
      bgPress: '#141B28',

      neo: {
        backgroundColor: bgCard,
        shadowColor:     '#060A12',
        shadowOffset:    { width: 6, height: 6 },
        shadowOpacity:   0.85,
        shadowRadius:    12,
        elevation:       8,
        borderTopWidth:    1,
        borderLeftWidth:   1,
        borderBottomWidth: 1,
        borderRightWidth:  1,
        borderTopColor:    'rgba(255,255,255,0.07)',
        borderLeftColor:   'rgba(255,255,255,0.07)',
        borderBottomColor: 'rgba(0,0,0,0.5)',
        borderRightColor:  'rgba(0,0,0,0.5)',
      },

      neoPressed: {
        backgroundColor: '#141B28',
        shadowColor:     '#060A12',
        shadowOffset:    { width: 2, height: 2 },
        shadowOpacity:   0.8,
        shadowRadius:    4,
        elevation:       2,
        borderTopWidth:    1,
        borderLeftWidth:   1,
        borderBottomWidth: 1,
        borderRightWidth:  1,
        borderTopColor:    'rgba(0,0,0,0.5)',
        borderLeftColor:   'rgba(0,0,0,0.5)',
        borderBottomColor: 'rgba(255,255,255,0.05)',
        borderRightColor:  'rgba(255,255,255,0.05)',
      },

      textPrimary: '#FFFFFF',
      textSub:     '#94A3B8',
      textMuted:   '#64748B',

      border:    'rgba(255,255,255,0.05)',
      borderMid: 'rgba(255,255,255,0.09)',

      teal:       '#2DD4BF',
      tealDim:    'rgba(45,212,191,0.14)',
      tealBorder: 'rgba(45,212,191,0.25)',
      yellow:     '#F59E0B',
      yellowDim:  'rgba(245,158,11,0.14)',
      purple:     '#A855F7',
      purpleDim:  'rgba(168,85,247,0.14)',
      orange:     '#F97316',
      orangeDim:  'rgba(249,115,22,0.14)',
      green:      '#2DD4BF',
      greenDim:   'rgba(45,212,191,0.14)',
      red:        '#EF4444',

      tabBg: 'rgba(27, 35, 51, 0.96)',
    };
  }

  // ─── LIGHT NEUMORPHISM ───
  const bg = '#D5DCE6';
  return {
    isDark: false,
    bg,
    bgCard:  bg,
    bgPress: '#C6CFDC',

    neo: {
      backgroundColor: bg,
      shadowColor:     '#ACBACD',
      shadowOffset:    { width: 5, height: 5 },
      shadowOpacity:   0.8,
      shadowRadius:    10,
      elevation:       6,
      borderTopWidth:    1,
      borderLeftWidth:   1,
      borderBottomWidth: 1,
      borderRightWidth:  1,
      borderTopColor:    'rgba(255,255,255,0.95)',
      borderLeftColor:   'rgba(255,255,255,0.95)',
      borderBottomColor: 'rgba(0,0,0,0.08)',
      borderRightColor:  'rgba(0,0,0,0.08)',
    },

    neoPressed: {
      backgroundColor: '#C6CFDC',
      shadowColor:     '#ACBACD',
      shadowOffset:    { width: 2, height: 2 },
      shadowOpacity:   0.6,
      shadowRadius:    4,
      elevation:       2,
      borderTopWidth:    1,
      borderLeftWidth:   1,
      borderBottomWidth: 1,
      borderRightWidth:  1,
      borderTopColor:    'rgba(0,0,0,0.06)',
      borderLeftColor:   'rgba(0,0,0,0.06)',
      borderBottomColor: 'rgba(255,255,255,0.9)',
      borderRightColor:  'rgba(255,255,255,0.9)',
    },

    textPrimary: '#1C2E44',
    textSub:     '#4A6A8A',
    textMuted:   '#7E98B3',

    border:    'rgba(0,0,0,0.06)',
    borderMid: 'rgba(0,0,0,0.1)',

    teal:       '#2EC4A8',
    tealDim:    'rgba(46,196,168,0.12)',
    tealBorder: 'rgba(46,196,168,0.3)',
    yellow:     '#D4A800',
    yellowDim:  'rgba(212,168,0,0.12)',
    purple:     '#9B4ECA',
    purpleDim:  'rgba(155,78,202,0.12)',
    orange:     '#D4632A',
    orangeDim:  'rgba(212,99,42,0.12)',
    green:      '#28A84A',
    greenDim:   'rgba(40,168,74,0.12)',
    red:        '#D44040',

    tabBg: 'rgba(213,220,230,0.96)',
  };
}
