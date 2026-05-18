import { useMemo, useState } from 'react';
import type { Exercise, LiftEntry, PersistedState } from '../lib/types';
import { bestEstimatedOneRm, bestWeight } from '../lib/analytics';
import { formatWeight } from '../lib/units';

type Props = {
  state: PersistedState;
  onOpenExercise: (id: string) => void;
  onAddExercise: (name: string) => void;
};

export function ExerciseHome({ state, onOpenExercise, onAddExercise }: Props) {
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = state.exercises;
    if (needle) {
      list = list.filter((e) => e.name.toLowerCase().includes(needle));
    }
    return [...list].sort((a, b) => {
      if (a.olympic !== b.olympic) return a.olympic ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [state.exercises, q]);

  const unit = state.settings.displayUnit;

  return (
    <div className="page stack gap-md pad-safe">
      <header className="stack gap-xs">
        <h1 className="h1">WoD Weight Tracker</h1>
        <p className="muted">Olympic lifts & strength — logged offline on your phone.</p>
      </header>

      <label className="field">
        <span className="label">Search exercises</span>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Snatch, squat…"
          enterKeyHint="search"
          autoCapitalize="words"
        />
      </label>

      <form
        className="card pad stack gap-sm"
        onSubmit={(e) => {
          e.preventDefault();
          onAddExercise(draft);
          setDraft('');
        }}
      >
        <h2 className="h3">New exercise</h2>
        <div className="row gap-sm">
          <input
            className="input grow"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Muscle Snatch"
            autoCapitalize="words"
          />
          <button type="submit" className="btn primary" disabled={!draft.trim()}>
            Add
          </button>
        </div>
      </form>

      <section className="stack gap-sm">
        <h2 className="h3">Your lifts</h2>
        <ul className="list">
          {filtered.map((ex) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              unit={unit}
              entries={state.entries.filter((x) => x.exerciseId === ex.id)}
              onOpen={() => onOpenExercise(ex.id)}
            />
          ))}
        </ul>
        {filtered.length === 0 ? (
          <p className="muted center pad">No exercises match your search.</p>
        ) : null}
      </section>
    </div>
  );
}

function ExerciseRow({
  exercise,
  unit,
  entries,
  onOpen,
}: {
  exercise: Exercise;
  unit: 'kg' | 'lb';
  entries: LiftEntry[];
  onOpen: () => void;
}) {
  const e1 = bestEstimatedOneRm(entries, unit);
  const bw = bestWeight(entries, unit);

  return (
    <li>
      <button type="button" className="list-row" onClick={onOpen}>
        <div className="stack gap-xxs align-start">
          <span className="strong">{exercise.name}</span>
          <span className="muted tiny">
            {exercise.olympic ? 'Olympic pattern' : 'Strength'}
            {entries.length ? ` · ${entries.length} logs` : ' · no logs yet'}
          </span>
        </div>
        <div className="stack gap-xxs align-end">
          <span className="pill">{entries.length ? formatWeight(e1, unit) : '—'} est. 1RM</span>
          <span className="muted tiny">{entries.length ? `${formatWeight(bw, unit)} peak load` : ''}</span>
        </div>
      </button>
    </li>
  );
}
