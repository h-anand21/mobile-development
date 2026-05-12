import { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme';

export default function useAppTheme() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    setIsDark(systemScheme === 'dark');
  }, [systemScheme]);

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  return { theme, isDark, setIsDark };
}
