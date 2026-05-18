import type { ThemePreference } from './types';

export function resolveTheme(pref: ThemePreference): 'dark' | 'light' {
  if (pref === 'light' || pref === 'dark') return pref;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
