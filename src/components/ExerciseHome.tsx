import { useMemo, useState } from 'react';
import type { Exercise, LiftEntry, PersistedState } from '../lib/types';
import { bestEstimatedOneRm, bestWeight } from '../lib/analytics';
import { formatWeight } from '../lib/units';

type Props = {
  state: PersistedState;
  onOpenExercise: (id: string) => void;
  onAddExercise: (name: string) => void;
};

/** Home screen: curated exercise list + search + quick add (@see docs/STYLING.md — block exercise-list / exercise-row). */
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
    <div className="page-shell exercise-dashboard layout-stack layout-stack--gap-md">
      <header className="layout-stack layout-stack--gap-xs">
        <h1 className="type-heading type-heading--level-1">WoD Weight Tracker</h1>
        <p className="type-body type-body--muted">Olympic lifts & strength — logged offline on your phone.</p>
      </header>

      <label className="form-field">
        <span className="form-field__label">Search exercises</span>
        <input
          className="form-field__control"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Snatch, squat…"
          enterKeyHint="search"
          autoCapitalize="words"
        />
      </label>

      <form
        className="surface-card surface-card--pad-sm layout-stack layout-stack--gap-sm"
        onSubmit={(e) => {
          e.preventDefault();
          onAddExercise(draft);
          setDraft('');
        }}
      >
        <h2 className="type-heading type-heading--level-3">New exercise</h2>
        <div className="layout-row layout-row--gap-sm">
          <input
            className="form-field__control layout-grow"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Muscle Snatch"
            autoCapitalize="words"
          />
          <button type="submit" className="btn btn--primary" disabled={!draft.trim()}>
            Add
          </button>
        </div>
      </form>

      <section className="exercise-list layout-stack layout-stack--gap-sm">
        <h2 className="type-heading type-heading--level-3">Your lifts</h2>
        <ul className="exercise-list__list">
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
          <p className="type-body type-body--muted type-body--center type-body--padded-soft">
            No exercises match your search.
          </p>
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
      <button type="button" className="exercise-row" onClick={onOpen}>
        <div className="layout-stack layout-stack--gap-xxs layout-stack--align-start">
          <span className="type-body type-body--strong">{exercise.name}</span>
          <span className="type-body type-body--muted type-body--tiny">
            {exercise.olympic ? 'Olympic pattern' : 'Strength'}
            {entries.length ? ` · ${entries.length} logs` : ' · no logs yet'}
          </span>
        </div>
        <div className="layout-stack layout-stack--gap-xxs layout-stack--align-end">
          <span className="exercise-row__pill">
            {entries.length ? formatWeight(e1, unit) : '—'} est. 1RM
          </span>
          <span className="type-body type-body--muted type-body--tiny">
            {entries.length ? `${formatWeight(bw, unit)} peak load` : ''}
          </span>
        </div>
      </button>
    </li>
  );
}
