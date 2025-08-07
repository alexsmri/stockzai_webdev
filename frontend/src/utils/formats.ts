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

export function cleanCompanyData() {

let cleanedData: Record<any, any> = {};
  let KPILookup: Record<any, Record<any, any>> = {};
  for (const [, value] of Object.entries(stKPIs)) {
    if (
      typeof value === 'object' &&
      value.role === prTableRole &&
      Object.keys(stData.latest_entries).includes(value.KPI) &&
      stData.latest_entries[value.KPI] !== undefined &&
      stData.latest_entries[value.KPI] !== null
    ) {
      cleanedData[value.KPI] = stData.latest_entries[value.KPI];
      KPILookup[value.KPI] = value;
    }
  }
  console.log('cleanedData');
  console.log(cleanedData);
  console.log(KPILookup);
  const flattenedData = flattenObject(cleanedData);
  console.log(flattenedData);
}