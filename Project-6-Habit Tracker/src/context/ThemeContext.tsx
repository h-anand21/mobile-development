import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, Theme } from '../constants/colors';

const THEME_KEY = 'HABITFLOW_THEME_MODE';

interface ThemeContextValue {
  T:          Theme;
  isDark:     boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  T:          getTheme(true),
  isDark:     true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true); // dark default

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val !== null) {
        setIsDark(val === 'dark');
      }
    }).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    T: getTheme(isDark),
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
