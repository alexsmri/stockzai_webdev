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

export function getKPIDetails({prKPI, prKPIs}: {prKPI: string, prKPIs: Record<any, any>}) {
  for (const [, value] of Object.entries(prKPIs)) {
    if (value.KPI === prKPI) {
      return value
    }
  }
}

export function getKPIData({prKPI, prData}: {prKPI: string, prData: Record<any, any>}) {
  let latest_entry = prData.latest_entries[prKPI] || null
  let data = prData.company_intel[prKPI] || null
  return {latest_entry: latest_entry, data: data}
}