export interface CompanyAPIResponse {
  company_intel: Record<string, any>;
  latest_entries: Record<string, any>;
}

export type KPIAPIResponse = Record<string, Record<"KPI" | "role" | "scoring" , any>>

export type SearchAPIResponse = Record<string, Record<"name" | "financial_score" | "valuation_score" | "sector" | "sectorRanking", string | null>>