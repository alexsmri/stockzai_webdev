import type { TYP_IconType, TYP_ListViewRow } from "./types";
import type { ReactNode } from "react";

export interface VAI_SearchData {
  query: string,
  results: Record<string, Record<string, any>>;
  redacted: string[];
}

export interface VAI_APIStore {
  get(): any;
}

export interface ITF_ListViewColumnConfig {
  id: string;
  title: string;
  key?: string;
  icon?: TYP_IconType;
  defaultSorting?: 'a' | 'd';
  isNumeric?: boolean;
  fallback?: string;
  valueGetter?: (row: TYP_ListViewRow, rowId: string) => unknown;
  render?: (value: unknown, rowId: string, row: TYP_ListViewRow) => ReactNode;
  cellClassName?: string;
  headerClassName?: string;
}
