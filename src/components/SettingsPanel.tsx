import type { PersistedState, ThemePreference } from '../lib/types';
import { DataBackup } from './DataBackup';

type Props = {
  state: PersistedState;
  onClose: () => void;
  onChangeDisplayUnit: (u: 'kg' | 'lb') => void;
  onChangeTheme: (t: ThemePreference) => void;
  onImport: (next: PersistedState) => void;
};

export function SettingsPanel({
  state,
  onClose,
  onChangeDisplayUnit,
  onChangeTheme,
  onImport,
}: Props) {
  const u = state.settings.displayUnit;
  const t = state.settings.theme;

  return (
    <div className="sheet overlay" role="dialog" aria-labelledby="settings-title" onClick={onClose}>
      <div className="sheet-panel stack gap-md animate-up" onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head row spread center gap-sm">
          <h2 id="settings-title" className="h2">
            Settings
          </h2>
          <button type="button" className="btn icon ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <section className="card pad stack gap-sm">
          <h3 className="h3">Appearance</h3>
          <p className="muted small">Light mode, dark mode, or match your phone or computer.</p>
          <div className="segmented segmented-three">
            <button type="button" className={t === 'dark' ? 'active' : ''} onClick={() => onChangeTheme('dark')}>
              Dark
            </button>
            <button type="button" className={t === 'light' ? 'active' : ''} onClick={() => onChangeTheme('light')}>
              Light
            </button>
            <button type="button" className={t === 'system' ? 'active' : ''} onClick={() => onChangeTheme('system')}>
              System
            </button>
          </div>
        </section>

        <section className="card pad stack gap-sm">
          <h3 className="h3">Display unit</h3>
          <p className="muted small">
            Charts and summaries convert logged weights into this unit. Each entry still remembers
            the unit you typed.
          </p>
          <div className="segmented">
            <button type="button" className={u === 'kg' ? 'active' : ''} onClick={() => onChangeDisplayUnit('kg')}>
              Kilograms
            </button>
            <button type="button" className={u === 'lb' ? 'active' : ''} onClick={() => onChangeDisplayUnit('lb')}>
              Pounds
            </button>
          </div>
        </section>

        <DataBackup state={state} onImport={onImport} />

        <footer className="muted tiny center">WoD Weight Tracker · offline-first PWA</footer>
      </div>
    </div>
  );
}
