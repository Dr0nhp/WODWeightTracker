import { useEffect, useState } from 'react';
import { resolveTheme } from './lib/theme';
import type { ThemePreference } from './lib/types';

/** Keeps <html data-theme>, color-scheme, and theme-color meta in sync with user preference + system mode. */
export function useResolvedAppearance(pref: ThemePreference): 'dark' | 'light' {
  const [resolved, setResolved] = useState<'dark' | 'light'>(() => resolveTheme(pref));

  useEffect(() => {
    setResolved(resolveTheme(pref));

    if (pref !== 'system') return undefined;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(resolveTheme('system'));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved === 'light' ? 'light' : 'dark';

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme instanceof HTMLMetaElement) {
      metaTheme.content = resolved === 'light' ? '#f8fafc' : '#0c1222';
    }

    document
      .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      ?.setAttribute('content', resolved === 'light' ? 'default' : 'black-translucent');

    return undefined;
  }, [resolved]);

  return resolved;
}
