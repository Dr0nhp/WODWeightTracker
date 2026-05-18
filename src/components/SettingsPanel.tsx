import type { PersistedState } from '../lib/types';
import { DataBackup } from './DataBackup';

type Props = {
  state: PersistedState;
  onClose: () => void;
  onChangeDisplayUnit: (u: 'kg' | 'lb') => void;
  onImport: (next: PersistedState) => void;
};

export function SettingsPanel({ state, onClose, onChangeDisplayUnit, onImport }: Props) {
  const u = state.settings.displayUnit;

  return (
    <div className="sheet overlay" role="dialog" aria-labelledby="settings-title" onClick={onClose}>
      <div className="sheet-panel stack gap-md animate-up" onClick={(e) => e.stopPropagation()}>
        <header className="row spread center gap-sm">
          <h2 id="settings-title" className="h2">
            Settings
          </h2>
          <button type="button" className="btn icon ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <section className="card pad stack gap-sm">
          <h3 className="h3">Display unit</h3>
          <p className="muted small">
            Charts and summaries convert logged weights into this unit. Each entry still remembers
            the unit you typed.
          </p>
          <div className="segmented">
            <button
              type="button"
              className={u === 'kg' ? 'active' : ''}
              onClick={() => onChangeDisplayUnit('kg')}
            >
              Kilograms
            </button>
            <button
              type="button"
              className={u === 'lb' ? 'active' : ''}
              onClick={() => onChangeDisplayUnit('lb')}
            >
              Pounds
            </button>
          </div>
        </section>

        <DataBackup state={state} onImport={onImport} />

        <footer className="muted tiny center">
          WoD Weight Tracker · offline-first PWA
        </footer>
      </div>
    </div>
  );
}
