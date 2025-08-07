export type APIResponse = Record<"msg" | "error", Record<any, any>>
export type APIResponseKPI = Record<any, Record<"role" | "KPI" | "scoring" | "id", any>>