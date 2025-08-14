export type TYP_APIResponse = Record<"msg" | "error", Record<any, any>>
export type TYP_APIResponseKPI = Record<any, Record<"role" | "KPI" | "scoring" | "id", any>>
export type TYP_KPIObject = {
  value: number | string;
  text?: string;
  color?: string;
};