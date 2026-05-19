import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PersistedState } from '../lib/types';
import {
  aggregateByDay,
  bestEstimatedOneRm,
  bestWeight,
  sortEntriesDesc,
} from '../lib/analytics';
import { addLiftEntry, deleteExercise, removeLiftEntry } from '../lib/storage';
import { convertWeight, estimateOneRm, formatWeight, parseFlexibleDecimal } from '../lib/units';

type Props = {
  state: PersistedState;
  exerciseId: string;
  appearance: 'dark' | 'light';
  onBack: () => void;
  commit: (next: PersistedState) => void;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExerciseDetail({ state, exerciseId, appearance, onBack, commit }: Props) {
  const exercise = state.exercises.find((e) => e.id === exerciseId);
  const unit = state.settings.displayUnit;

  const entries = useMemo(
    () => state.entries.filter((e) => e.exerciseId === exerciseId),
    [state.entries, exerciseId]
  );

  const sorted = useMemo(() => sortEntriesDesc(entries), [entries]);
  const series = useMemo(() => aggregateByDay(entries, unit), [entries, unit]);

  const chart = useMemo(() => {
    const isLight = appearance === 'light';
    return {
      grid: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(148,163,184,0.15)',
      tick: isLight ? '#64748b' : '#94a3b8',
      line1: isLight ? '#0284c7' : '#38bdf8',
      line2: isLight ? '#7c3aed' : '#a78bfa',
      tooltipBg: isLight ? '#ffffff' : '#111827',
      tooltipBorder: isLight ? 'rgba(15,23,42,0.18)' : 'rgba(148,163,184,0.35)',
      tooltipLabel: isLight ? '#0f172a' : '#e2e8f0',
    };
  }, [appearance]);

  const [date, setDate] = useState(todayISO);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('3');
  const [sets, setSets] = useState('3');
  const [notes, setNotes] = useState('');
  const [entryUnit, setEntryUnit] = useState(unit);

  useEffect(() => {
    setEntryUnit(unit);
  }, [exerciseId, unit]);

  if (!exercise) {
    return (
      <div className="page pad-safe stack gap-md">
        <button type="button" className="btn ghost self-start" onClick={onBack}>
          ← Back
        </button>
        <p className="muted">Exercise not found.</p>
      </div>
    );
  }

  const e1Best = bestEstimatedOneRm(entries, unit);
  const loadBest = bestWeight(entries, unit);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const w = parseFlexibleDecimal(weight);
    const r = parseFlexibleDecimal(reps);
    const s = parseFlexibleDecimal(sets);
    if (!(w > 0) || !(r >= 1) || !(s >= 1)) return;

    commit(
      addLiftEntry(state, {
        exerciseId,
        date,
        weight: w,
        unit: entryUnit,
        reps: Math.floor(r),
        sets: Math.floor(s),
        notes: notes.trim() || undefined,
      })
    );
    setNotes('');
    setWeight('');
  };

  const chartFormatter = (value: number) => formatWeight(value, unit, 1);

  return (
    <div className="page stack gap-md pad-safe">
      <header className="row spread gap-sm wrap">
        <button type="button" className="btn ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="btn danger ghost"
          onClick={() => {
            const ok = window.confirm(`Delete "${exercise.name}" and all its logs?`);
            if (!ok) return;
            commit(deleteExercise(state, exerciseId));
            onBack();
          }}
        >
          Delete exercise
        </button>
      </header>

      <div className="stack gap-xs">
        <h1 className="h1">{exercise.name}</h1>
        <p className="muted">
          Estimated 1RM blends Epley + Brzycki from your reps — useful for trends, not competition
          declarations.
        </p>
      </div>

      <div className="grid-2">
        <div className="card pad stack gap-xxs">
          <span className="muted tiny">Best est. 1RM</span>
          <span className="stat">
            {entries.length ? formatWeight(e1Best, unit) : '—'}
          </span>
        </div>
        <div className="card pad stack gap-xxs">
          <span className="muted tiny">Heaviest load (any reps)</span>
          <span className="stat">
            {entries.length ? formatWeight(loadBest, unit) : '—'}
          </span>
        </div>
      </div>

      <section className="card pad stack gap-sm">
        <h2 className="h3">Progress</h2>
        {series.length === 0 ? (
          <p className="muted small">Log sets to unlock a chart for this lift.</p>
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={chart.grid} strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: chart.tick, fontSize: 11 }}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fill: chart.tick, fontSize: 11 }}
                  width={44}
                  tickFormatter={(v) => `${Math.round(v)}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    chartFormatter(value),
                    name === 'maxEst1Rm' ? 'Est. 1RM (day best)' : 'Top weight (day)',
                  ]}
                  labelFormatter={(l) => String(l)}
                  contentStyle={{
                    background: chart.tooltipBg,
                    border: `1px solid ${chart.tooltipBorder}`,
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: chart.tooltipLabel }}
                  itemStyle={{ color: chart.tooltipLabel }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend wrapperStyle={{ color: chart.tick, fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="maxEst1Rm"
                  name="Est. 1RM (day best)"
                  stroke={chart.line1}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  name="Heaviest load (day)"
                  stroke={chart.line2}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <form className="card pad stack gap-md" onSubmit={submit}>
        <h2 className="h3">Log sets</h2>
        <label className="field">
          <span className="label">Date</span>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <div className="grid-2">
          <label className="field">
            <span className="label">Weight</span>
            <input
              className="input"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unit === 'kg' ? 'e.g. 80' : 'e.g. 185'}
              required
            />
          </label>
          <label className="field">
            <span className="label">Unit for this entry</span>
            <select className="input" value={entryUnit} onChange={(e) => setEntryUnit(e.target.value as 'kg' | 'lb')}>
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </label>
        </div>

        <div className="grid-2">
          <label className="field">
            <span className="label">Reps per set</span>
            <input
              className="input"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              min={1}
              required
            />
          </label>
          <label className="field">
            <span className="label">Sets</span>
            <input
              className="input"
              inputMode="numeric"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              min={1}
              required
            />
          </label>
        </div>

        <label className="field">
          <span className="label">Notes (optional)</span>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tempo, variation, how it felt…"
          />
        </label>

        <button type="submit" className="btn primary">
          Save entry
        </button>
      </form>

      <section className="stack gap-sm">
        <h2 className="h3">History</h2>
        {sorted.length === 0 ? (
          <p className="muted small">Nothing logged yet.</p>
        ) : (
          <ul className="list">
            {sorted.map((row) => (
              <li key={row.id} className="history-item">
                <div className="history-main">
                  <div className="strong">
                    {formatWeight(convertWeight(row.weight, row.unit, unit), unit)} × {row.reps} × {row.sets}
                  </div>
                  <div className="muted small">
                    {row.date} · est. 1RM {formatWeight(convertWeight(estimateOneRm(row.weight, row.reps), row.unit, unit), unit)}
                  </div>
                  {row.notes ? <div className="small notes">{row.notes}</div> : null}
                </div>
                <button
                  type="button"
                  className="btn icon ghost"
                  aria-label="Delete entry"
                  onClick={() => {
                    const ok = window.confirm('Delete this log entry?');
                    if (!ok) return;
                    commit(removeLiftEntry(state, row.id));
                  }}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
