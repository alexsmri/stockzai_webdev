import type { ITF_ListViewColumnConfig } from "../types/interfaces";
import type { TYP_SortDirection } from "../types/types";
import type { ReactNode } from "react";

const PERCENTILE_MULTIPLICATION = 1;

export function flattenObject(obj: Record<any, any>, prefix = '') {
  let result: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key !== "string") {
        return obj;
    }
    const fullKey = `${prefix}${key}`;
    if (typeof value === 'object' && value !== null) {
      const nested = flattenObject(value, fullKey);
      result = { ...result, ...nested };
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

interface ITF_CleanCompanyDataProps {
  prTableRole: string
  prKPIs: Record<any, any>
  prData: Record<any, any>
}
export function cleanCompanyData({prTableRole, prKPIs, prData}: ITF_CleanCompanyDataProps) {

let cleanedData: Record<any, any> = {};
  let KPILookup: Record<any, Record<any, any>> = {};
  for (const [, value] of Object.entries(prKPIs)) {
    if (
      typeof value === 'object' &&
      value.role === prTableRole &&
      Object.keys(prData.latest_entries).includes(value.KPI) &&
      prData.latest_entries[value.KPI] !== undefined &&
      prData.latest_entries[value.KPI] !== null
    ) {
      cleanedData[value.KPI] = prData.latest_entries[value.KPI];
      KPILookup[value.KPI] = value;
    }
  }
  const flattenedData = flattenObject(cleanedData);
  return flattenedData
}

export function formatPercentile(prPercentile: number) {
  let utRes = Math.min(prPercentile, 10)
  utRes = Math.max(utRes, 0.001)
  return utRes * PERCENTILE_MULTIPLICATION;
}

export function formatPercentileEstimate(prPercentile: number) {
  let utOut = (prPercentile + 1);
  if (prPercentile <= 2) {
    utOut = 1
  }
  
  return Math.min(Math.round(utOut) * 10, 95);
}

export function censorEmail(email: string, uncensoredLetters: number = 3) {
  let formatted = ""
  if (email.includes("@") && email.includes(".")) {
    formatted = email.slice(0, uncensoredLetters)
    const atIndex = email.indexOf("@")
    const nrStars = Math.max(atIndex - uncensoredLetters, 0)
    formatted = `${formatted}${"*".repeat(nrStars)}${email.slice(atIndex, email.length)}`
    return formatted
  }
  return email
}

export function getDefaultOrderDirection(column: ITF_ListViewColumnConfig): TYP_SortDirection {
  return column.defaultSorting === 'd' ? 'desc' : 'asc';
}

export function getOppositeOrderDirection(direction: TYP_SortDirection): TYP_SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}

export function toNumeric(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }
  return Number.NaN;
}

export function toComparableString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toLowerCase();
}

export function formatNumeric(value: unknown, fallback: string): ReactNode {
  const number = toNumeric(value);
  if (Number.isFinite(number)) {
    const rounded = Number(number.toFixed(2));
    if (Number.isInteger(rounded)) {
      return rounded;
    }
    return number.toFixed(1);
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return fallback;
}

export function formatText(value: unknown, fallback: string): ReactNode {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  if (value !== null && value !== undefined) {
    const stringified = String(value).trim();
    if (stringified) {
      return stringified;
    }
  }
  return fallback;
}