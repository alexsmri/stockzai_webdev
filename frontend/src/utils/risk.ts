const RISK_LEVEL_META = [
  { label: 'None', color: '#16D07F' },
  { label: 'Low', color: '#53D86F' },
  { label: 'Moderate', color: '#B7DB58' },
  { label: 'Elevated', color: '#F2C94C' },
  { label: 'High', color: '#F2994A' },
  { label: 'Severe', color: '#EE0034' },
] as const;

export const RISK_FACTOR_KEYS = [
  'countriesAML',
  'countriesFSI',
  'marketCap',
  'volume',
  'price',
  'freeFloat',
  'altmanZScore',
] as const;

export type RiskLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type RiskFactorKey = (typeof RISK_FACTOR_KEYS)[number];

type HexColor = `#${string}`;

function normaliseRiskLevel(value: unknown): RiskLevel {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : Number.NaN;
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  const clamped = Math.min(Math.max(numeric, 0), 5);
  return Math.round(clamped) as RiskLevel;
}

function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const normalised = color.trim().replace(/^#/u, '');
  if (normalised.length !== 6 && normalised.length !== 3) {
    return null;
  }
  const expanded =
    normalised.length === 3
      ? normalised
          .split('')
          .map((char) => char + char)
          .join('')
      : normalised;
  const numeric = Number.parseInt(expanded, 16);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return {
    r: (numeric >> 16) & 0xff,
    g: (numeric >> 8) & 0xff,
    b: numeric & 0xff,
  };
}

export function withAlpha(color: HexColor, alpha: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return color;
  }
  const safeAlpha = Math.min(Math.max(alpha, 0), 1);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeAlpha})`;
}

export function getRiskLevelMeta(value: unknown): { level: RiskLevel; label: string; color: HexColor } {
  const level = normaliseRiskLevel(value);
  const { label, color } = RISK_LEVEL_META[level];
  return { level, label, color };
}

export function parseRiskScoresDict(
  source: unknown
): Partial<Record<RiskFactorKey, RiskLevel>> {
  if (!source) {
    return {};
  }
  if (typeof source === 'string') {
    try {
      const parsed = JSON.parse(source) as unknown;
      return parseRiskScoresDict(parsed);
    } catch {
      return {};
    }
  }
  if (typeof source !== 'object' || Array.isArray(source)) {
    return {};
  }
  const result: Partial<Record<RiskFactorKey, RiskLevel>> = {};
  for (const key of RISK_FACTOR_KEYS) {
    const value = (source as Record<string, unknown>)[key];
    if (value !== undefined && value !== null) {
      result[key] = normaliseRiskLevel(value);
    }
  }
  return result;
}

