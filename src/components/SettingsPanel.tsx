import type { PersistedState, ThemePreference } from '../lib/types';
import { DataBackup } from './DataBackup';

type Props = {
  state: PersistedState;
  onClose: () => void;
  onChangeDisplayUnit: (u: 'kg' | 'lb') => void;
  onChangeTheme: (t: ThemePreference) => void;
  onImport: (next: PersistedState) => void;
};

function segmentOptionClass(isActive: boolean): string {
  return ['segment-control__option', isActive ? 'segment-control__option--active' : '']
    .filter(Boolean)
    .join(' ');
}

/** Modal sheet: appearance, units, backup (@see docs/STYLING.md — block settings-sheet). */
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
    <div className="settings-sheet" role="dialog" aria-labelledby="settings-title" onClick={onClose}>
      <div className="settings-sheet__panel layout-stack layout-stack--gap-md" onClick={(e) => e.stopPropagation()}>
        <header className="settings-sheet__header layout-row layout-row--spread layout-row--gap-sm">
          <h2 id="settings-title" className="settings-sheet__title type-heading type-heading--level-2">
            Settings
          </h2>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <section className="settings-sheet__section surface-card surface-card--pad-sm layout-stack layout-stack--gap-sm">
          <h3 className="settings-sheet__section-title type-heading type-heading--level-3">Appearance</h3>
          <p className="type-body type-body--muted type-body--small">
            Light mode, dark mode, or match your phone or computer.
          </p>
          <div className="segment-control segment-control--three">
            <button type="button" className={segmentOptionClass(t === 'dark')} onClick={() => onChangeTheme('dark')}>
              Dark
            </button>
            <button type="button" className={segmentOptionClass(t === 'light')} onClick={() => onChangeTheme('light')}>
              Light
            </button>
            <button type="button" className={segmentOptionClass(t === 'system')} onClick={() => onChangeTheme('system')}>
              System
            </button>
          </div>
        </section>

        <section className="settings-sheet__section surface-card surface-card--pad-sm layout-stack layout-stack--gap-sm">
          <h3 className="settings-sheet__section-title type-heading type-heading--level-3">Display unit</h3>
          <p className="type-body type-body--muted type-body--small">
            Charts and summaries convert logged weights into this unit. Each entry still remembers the unit you typed.
          </p>
          <div className="segment-control">
            <button type="button" className={segmentOptionClass(u === 'kg')} onClick={() => onChangeDisplayUnit('kg')}>
              Kilograms
            </button>
            <button type="button" className={segmentOptionClass(u === 'lb')} onClick={() => onChangeDisplayUnit('lb')}>
              Pounds
            </button>
          </div>
        </section>

        <DataBackup state={state} onImport={onImport} />

        <footer className="settings-sheet__footer type-body type-body--muted type-body--tiny">
          WoD Weight Tracker · offline-first PWA
        </footer>
      </div>
    </div>
  );
}
