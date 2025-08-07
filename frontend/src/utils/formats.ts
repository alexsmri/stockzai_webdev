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
