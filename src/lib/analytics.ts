import type { LiftEntry, WeightUnit } from './types';
import { convertWeight, estimateOneRm } from './units';

export interface DayPoint {
  date: string;
  maxEst1Rm: number;
  maxWeight: number;
}

/** Best estimated 1RM (display units) across all entries. */
export function bestEstimatedOneRm(entries: LiftEntry[], displayUnit: WeightUnit): number {
  let max = 0;
  for (const e of entries) {
    const e1 = estimateOneRm(e.weight, e.reps);
    const e1Disp = convertWeight(e1, e.unit, displayUnit);
    max = Math.max(max, e1Disp);
  }
  return max;
}

/** Heaviest weight moved at any rep count (display units). */
export function bestWeight(entries: LiftEntry[], displayUnit: WeightUnit): number {
  let max = 0;
  for (const e of entries) {
    const w = convertWeight(e.weight, e.unit, displayUnit);
    max = Math.max(max, w);
  }
  return max;
}

export function aggregateByDay(entries: LiftEntry[], displayUnit: WeightUnit): DayPoint[] {
  const map = new Map<string, { maxEst: number; maxW: number }>();
  for (const e of entries) {
    const e1 = estimateOneRm(e.weight, e.reps);
    const e1Disp = convertWeight(e1, e.unit, displayUnit);
    const wDisp = convertWeight(e.weight, e.unit, displayUnit);
    const cur = map.get(e.date) ?? { maxEst: 0, maxW: 0 };
    cur.maxEst = Math.max(cur.maxEst, e1Disp);
    cur.maxW = Math.max(cur.maxW, wDisp);
    map.set(e.date, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      maxEst1Rm: v.maxEst,
      maxWeight: v.maxW,
    }));
}

export function sortEntriesDesc(entries: LiftEntry[]): LiftEntry[] {
  return [...entries].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return b.id.localeCompare(a.id);
  });
}
