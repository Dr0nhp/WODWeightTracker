import type { Exercise } from './types';

const KB_TO_LB = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * KB_TO_LB;
}

export function lbToKg(lb: number): number {
  return lb / KB_TO_LB;
}

export function convertWeight(weight: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number {
  if (from === to) return weight;
  return from === 'kg' ? kgToLb(weight) : lbToKg(weight);
}

/** Estimated 1RM from weight × reps using Epley (widely used in lifting apps). */
export function estimateOneRmEpley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Brzycki formula (meaningful roughly for 2–10 reps). */
export function estimateOneRmBrzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight;
  return weight * (36 / (37 - reps));
}

/** Blended estimate for UI display. */
export function estimateOneRm(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const e = estimateOneRmEpley(weight, reps);
  const b = estimateOneRmBrzycki(weight, reps);
  return (e + b) / 2;
}

export function formatWeight(w: number, unit: 'kg' | 'lb', decimals = 1): string {
  const rounded = Math.round(w * 10 ** decimals) / 10 ** decimals;
  return `${rounded} ${unit}`;
}

export function uid(): string {
  return crypto.randomUUID();
}

export const DEFAULT_EXERCISES: Omit<Exercise, 'id'>[] = [
  { name: 'Snatch', olympic: true },
  { name: 'Clean & Jerk', olympic: true },
  { name: 'Clean', olympic: true },
  { name: 'Jerk (split/push/power)', olympic: true },
  { name: 'Hang Snatch', olympic: true },
  { name: 'Hang Clean', olympic: true },
  { name: 'Power Snatch', olympic: true },
  { name: 'Power Clean', olympic: true },
  { name: 'Front Squat', olympic: true },
  { name: 'Back Squat', olympic: true },
  { name: 'Overhead Squat', olympic: true },
  { name: 'Push Press', olympic: false },
  { name: 'Strict Press', olympic: false },
  { name: 'Deadlift', olympic: false },
  { name: 'Romanian Deadlift', olympic: false },
  { name: 'Bench Press', olympic: false },
];
