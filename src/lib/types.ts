export type WeightUnit = 'kg' | 'lb';

/** UI colour mode. `system` tracks `prefers-color-scheme`. */
export type ThemePreference = 'dark' | 'light' | 'system';

export interface Exercise {
  id: string;
  name: string;
  olympic: boolean;
}

export interface LiftEntry {
  id: string;
  exerciseId: string;
  /** ISO date yyyy-mm-dd */
  date: string;
  weight: number;
  /** Unit used when this entry was logged */
  unit: WeightUnit;
  reps: number;
  /** Completed sets at this weight × reps */
  sets: number;
  notes?: string;
}

export interface Settings {
  displayUnit: WeightUnit;
  theme: ThemePreference;
}

export interface PersistedState {
  version: 1;
  exercises: Exercise[];
  entries: LiftEntry[];
  settings: Settings;
}
