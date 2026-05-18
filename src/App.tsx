import { useEffect, useState } from 'react';
import { ExerciseDetail } from './components/ExerciseDetail';
import { ExerciseHome } from './components/ExerciseHome';
import { SettingsPanel } from './components/SettingsPanel';
import { addExercise, loadState, saveState, updateSettings } from './lib/storage';
import type { PersistedState, ThemePreference } from './lib/types';
import { useResolvedAppearance } from './useResolvedAppearance';

type Route = { name: 'home' } | { name: 'exercise'; id: string };

export default function App() {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const appearance = useResolvedAppearance(state.settings.theme);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const commit = (next: PersistedState) => setState(next);

  return (
    <div className="app">
      <nav className="topbar row spread center gap-sm pad-x pad-safe-top">
        <button
          type="button"
          className="brand-btn"
          onClick={() => setRoute({ name: 'home' })}
          aria-label="Home"
        >
          WoD Tracker
        </button>
        <button type="button" className="btn ghost" onClick={() => setSettingsOpen(true)}>
          Settings
        </button>
      </nav>

      {route.name === 'home' ? (
        <ExerciseHome
          state={state}
          onOpenExercise={(id) => setRoute({ name: 'exercise', id })}
          onAddExercise={(name) => commit(addExercise(state, name))}
        />
      ) : (
        <ExerciseDetail
          state={state}
          exerciseId={route.id}
          appearance={appearance}
          onBack={() => setRoute({ name: 'home' })}
          commit={commit}
        />
      )}

      {settingsOpen ? (
        <SettingsPanel
          state={state}
          onClose={() => setSettingsOpen(false)}
          onChangeDisplayUnit={(u) => commit(updateSettings(state, { displayUnit: u }))}
          onChangeTheme={(t: ThemePreference) => commit(updateSettings(state, { theme: t }))}
          onImport={(next) => {
            setState(next);
            setSettingsOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
