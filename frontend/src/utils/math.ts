import { YEAR_MS } from "../constants";
import { toNumber } from "./functions";

export function calcAverage(list: number[]) {
    return list.reduce(
    (partialSum, a) => 
        (partialSum as number) + (a as number), 0
    ) / list.length;
}

export function calcChange1Y(
    prData: Record<string, number | string | null | undefined>
) {
  const entries = Object.entries(prData)
    .map(([d, v]) => {
      const ms = Date.parse(d);
      return Number.isFinite(ms) ? { date: d, ms, value: v } : null;
    })
    .filter(Boolean) as { date: string; ms: number; value: unknown }[];

  if (entries.length < 2) {
    return { changeAbs: null, changePct: null, from: null, to: null, reason: 'not_enough_points' };
  }

  entries.sort((a, b) => a.ms - b.ms);
  const newest = entries[entries.length - 1];
  const threshold = newest.ms - YEAR_MS;

  const idx = entries.findIndex(e => e.ms >= threshold);
  const ref = idx >= 0 && idx < entries.length - 1 ? entries[idx] : null;

  if (!ref) {
    return { changeAbs: null, changePct: null, from: null, to: newest.date, reason: 'no_point_within_1y' };
  }

  const newVal = toNumber(newest.value);
  const oldVal = toNumber(ref.value);

  if (newVal == null || oldVal == null) {
    return { changeAbs: null, changePct: null, from: ref.date, to: newest.date, reason: 'non_numeric_values' };
  }

  const changeAbs = newVal - oldVal;
  const changePct = oldVal !== 0 ? (changeAbs / Math.abs(oldVal)) * 100 : null;

  return { changeAbs, changePct, from: ref.date, to: newest.date };
}