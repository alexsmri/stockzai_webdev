const PERCENTILE_MULTIPLICATION = 10;

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
  utRes = Math.max(prPercentile, 0.001)
  return utRes * PERCENTILE_MULTIPLICATION;
}