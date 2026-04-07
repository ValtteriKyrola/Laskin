import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useTheme() {
  const { isDark, setIsDark } = useStore();

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = () => setIsDark(!isDark);

  return { isDark, toggle };
}
