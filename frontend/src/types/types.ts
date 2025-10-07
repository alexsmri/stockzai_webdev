import { type ComponentType, type SVGProps } from "react";

export type TYP_ListViewRow = Record<string, unknown>;
export type TYP_SortDirection = 'asc' | 'desc';
export type TYP_IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type TYP_APIResponse = Record<"msg" | "error", Record<any, any>>
export type TYP_APIResponseKPI = Record<any, Record<"role" | "KPI" | "scoring" | "id", any>>
export type TYP_KPIObject = {
  value: number | string;
  text?: string;
  color?: string;
};

export type TYP_SortState = {
  columnId: string | null;
  direction: TYP_SortDirection | null;
};