import type { Exercise, LiftEntry, PersistedState, Settings } from './types';
import { DEFAULT_EXERCISES, uid } from './units';

const STORAGE_KEY = 'wod-tracker-state-v1';

function seedExercises(): Exercise[] {
  return DEFAULT_EXERCISES.map((e) => ({ ...e, id: uid() }));
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        version: 1,
        exercises: seedExercises(),
        entries: [],
        settings: { displayUnit: 'kg' },
      };
    }
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1 || !Array.isArray(parsed.exercises)) {
      throw new Error('bad shape');
    }
    if (!Array.isArray(parsed.entries)) {
      throw new Error('bad shape');
    }
    return normalizePersisted(parsed);
  } catch {
    return {
      version: 1,
      exercises: seedExercises(),
      entries: [],
      settings: { displayUnit: 'kg' },
    };
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addExercise(state: PersistedState, name: string): PersistedState {
  const trimmed = name.trim();
  if (!trimmed) return state;
  const ex: Exercise = { id: uid(), name: trimmed, olympic: false };
  return { ...state, exercises: [...state.exercises, ex] };
}

export function deleteExercise(state: PersistedState, exerciseId: string): PersistedState {
  return {
    ...state,
    exercises: state.exercises.filter((e) => e.id !== exerciseId),
    entries: state.entries.filter((x) => x.exerciseId !== exerciseId),
  };
}

export function addLiftEntry(
  state: PersistedState,
  partial: Omit<LiftEntry, 'id'>
): PersistedState {
  const entry: LiftEntry = { ...partial, id: uid() };
  return { ...state, entries: [...state.entries, entry] };
}

export function removeLiftEntry(state: PersistedState, entryId: string): PersistedState {
  return { ...state, entries: state.entries.filter((e) => e.id !== entryId) };
}

export function updateSettings(state: PersistedState, settings: Partial<Settings>): PersistedState {
  return {
    ...state,
    settings: { ...state.settings, ...settings },
  };
}

export function exportPayload(state: PersistedState): string {
  return JSON.stringify(state, null, 2);
}

export function importPayload(json: string): PersistedState {
  const parsed = JSON.parse(json) as PersistedState;
  if (parsed.version !== 1) throw new Error('Unsupported backup version');
  if (!Array.isArray(parsed.exercises) || !Array.isArray(parsed.entries)) {
    throw new Error('Invalid backup');
  }
  return normalizePersisted(parsed);
}

function normalizePersisted(parsed: PersistedState): PersistedState {
  const settings = parsed.settings?.displayUnit
    ? parsed.settings
    : { displayUnit: 'kg' as const };

  return {
    ...parsed,
    settings,
    entries: parsed.entries.map((e) => ({
      ...e,
      unit: e.unit ?? 'kg',
    })),
  };
}
