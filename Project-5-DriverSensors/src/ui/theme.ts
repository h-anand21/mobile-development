import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

export const THEME_COLORS = {
  dark: {
    background: '#050B14',
    card: '#0c1626',
    border: '#122540',
    text: '#ffffff',
    textMuted: '#94a3b8',
    textSlate: '#64748b',
    accent: '#00f5ff',
    success: '#84cc16',
    tabBarBg: 'rgba(12, 22, 38, 0.98)',
    tabBarBorder: 'rgba(0, 245, 255, 0.22)',
    inputBg: 'rgba(15, 23, 42, 0.8)',
    powerBg: '#050B14',
  },
  light: {
    background: '#f1f5f9', // Clean light grey slate
    card: '#ffffff', // Pure white card
    border: '#cbd5e1', // Slate 300
    text: '#0f172a', // Slate 900
    textMuted: '#475569', // Slate 600
    textSlate: '#64748b', // Slate 500
    accent: '#0891b2', // Cyan 600
    success: '#16a34a', // Green 600
    tabBarBg: 'rgba(255, 255, 255, 0.98)', // White opaque tab bar
    tabBarBorder: 'rgba(8, 145, 178, 0.22)', // Muted cyan border
    inputBg: 'rgba(226, 232, 240, 0.8)',
    powerBg: '#f1f5f9',
  }
};

export function useAppTheme() {
  const selectedTheme = useSettingsStore((state) => state.selectedTheme);
  const systemScheme = useColorScheme();

  const themeMode = selectedTheme === 'system'
    ? (systemScheme || 'dark')
    : selectedTheme;

  const colors = THEME_COLORS[themeMode as 'light' | 'dark'] || THEME_COLORS.dark;

  return {
    theme: themeMode as 'light' | 'dark',
    colors,
    isDark: themeMode === 'dark',
  };
}
