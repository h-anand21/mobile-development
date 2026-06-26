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
    const bg = '#0D1B2E';
    return {
      isDark: true,
      bg,
      bgCard:  bg,
      bgPress: '#0A1526',

      neo: {
        backgroundColor: bg,
        shadowColor:     '#060E1C',
        shadowOffset:    { width: 5, height: 5 },
        shadowOpacity:   1,
        shadowRadius:    10,
        elevation:       8,
        borderTopWidth:    1,
        borderLeftWidth:   1,
        borderBottomWidth: 1,
        borderRightWidth:  1,
        borderTopColor:    'rgba(255,255,255,0.07)',
        borderLeftColor:   'rgba(255,255,255,0.07)',
        borderBottomColor: 'rgba(0,0,0,0.45)',
        borderRightColor:  'rgba(0,0,0,0.45)',
      },

      neoPressed: {
        backgroundColor: '#0A1526',
        shadowColor:     '#060E1C',
        shadowOffset:    { width: 2, height: 2 },
        shadowOpacity:   0.8,
        shadowRadius:    4,
        elevation:       2,
        borderTopWidth:    1,
        borderLeftWidth:   1,
        borderBottomWidth: 1,
        borderRightWidth:  1,
        borderTopColor:    'rgba(0,0,0,0.45)',
        borderLeftColor:   'rgba(0,0,0,0.45)',
        borderBottomColor: 'rgba(255,255,255,0.05)',
        borderRightColor:  'rgba(255,255,255,0.05)',
      },

      textPrimary: '#E8F4FF',
      textSub:     '#7A9CC4',
      textMuted:   '#3D5A7A',

      border:    'rgba(255,255,255,0.05)',
      borderMid: 'rgba(255,255,255,0.09)',

      teal:       '#5EEAD4',
      tealDim:    'rgba(94,234,212,0.12)',
      tealBorder: 'rgba(94,234,212,0.22)',
      yellow:     '#EAD45E',
      yellowDim:  'rgba(234,212,94,0.12)',
      purple:     '#C45EEA',
      purpleDim:  'rgba(196,94,234,0.12)',
      orange:     '#EA875E',
      orangeDim:  'rgba(234,135,94,0.12)',
      green:      '#5EEA87',
      greenDim:   'rgba(94,234,135,0.12)',
      red:        '#EA5E5E',

      tabBg: 'rgba(9, 22, 44, 0.94)',
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
