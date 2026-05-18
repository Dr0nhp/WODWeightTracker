import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { loadState } from './lib/storage';
import { resolveTheme } from './lib/theme';
import App from './App.tsx';
import './index.css';

(() => {
  const resolvedTheme = resolveTheme(loadState().settings.theme);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme === 'light' ? 'light' : 'dark';
})();

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
